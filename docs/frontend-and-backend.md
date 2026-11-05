# Frontend and backend structure

GoldnSilver.shop is a MERN application: a React frontend and an Express API that share one MongoDB database. This file describes how the two apps are laid out, how a request moves, and which folders own which behaviour.

Related documents:

- [Database structure](./database.md)
- [Third-party integrations](./third-party-integrations.md)
- [DigiLocker KYC](./digilocker.md)

## Repository layout

```
GoldProjectMERN/
  frontend/          Vite + React shop, dashboard, and admin UI
  backend/           Express API, Mongoose models, partner clients
  docs/              These documents
```

Typical local ports:

| App | Command | Default URL |
| --- | --- | --- |
| Frontend | `npm run dev` in `frontend/` | `http://localhost:5173` |
| Backend | `npm run dev` in `backend/` | `http://localhost:5000` |

The frontend calls the API through `VITE_API_URL` (default `http://localhost:5000/api`). The backend reads `backend/.env`. Do not commit that file or paste its values into docs or chat.

Production copies of this repo have been deployed under `/var/www/goldnsilver`, with the API process restarted after backend changes and `npm run build` run inside `frontend/` after UI changes.

## How a request is authenticated

Almost every `/api` route requires a JWT access token. The access token lasts **1 hour**. The refresh token lasts **7 days**.

Token types:

| Type | Who receives it | Stored in the browser as |
| --- | --- | --- |
| `user` | Customer login or registration | `localStorage` key `gs_auth` |
| `admin` | Super-admin login at `/admin` | admin token helpers (`gs_admin_auth`) |
| Gate | Pre-login site gate | `sessionStorage` key `gs_gate_token` |

The axios client in `frontend/src/services/api.js` attaches the user or admin token as `Authorization: Bearer …`. When neither is present it sends the gate token and the header `X-Gate-Session: 1`. That header tells `optionalAuth` not to treat the gate super-admin as the shopper, so a guest checkout is not filed under the super-admin account.

Public paths that do not need an access token:

- `POST /api/auth/login`
- `POST /api/auth/register`
- `POST /api/auth/admin-login`
- `POST /api/auth/refresh`
- `POST /api/payment/webhook`
- `GET /api/zerodha/callback`
- `GET /api/health`

Static uploads are mounted at `/api/uploads` before the token middleware.

When the access token expires, `SessionGate` shows “Your secure session has expired”. Refresh session calls `POST /api/auth/refresh`. Existing tokens keep their original expiry until the user refreshes or signs in again.

`requireAdmin` accepts only an `admin` token whose user role is admin. Older `app` tokens are rejected.

## Frontend

Stack: React 18, React Router 6, Axios, Vite 5. Styling is mostly global CSS (`src/styles.css`) plus page CSS files.

### Boot order

`frontend/src/main.jsx` wraps the app in this order:

1. `BrowserRouter`
2. `AuthProvider` — customer session
3. `CartProvider` — cart quantity and price sync
4. `ProductDetailModalProvider` — shared product popup
5. `App` — routes, toasts, session gate, Zerodha OAuth return

`Layout` renders `Home2Chrome` (header, menus, cart drawer) around every page. `Header.jsx` is not the live header.

### Folders

| Path | Role |
| --- | --- |
| `src/pages/` | One screen per route |
| `src/components/` | Chrome, cart drawer pieces, product modal, session gate, password field |
| `src/state/` | `AuthContext`, `CartContext`, `ToastContext`, `ProductDetailModalContext` |
| `src/services/api.js` | All HTTP clients (`authService`, `productService`, `orderService`, `paymentService`, `safegoldService`, `userService`, `adminService`, `sequelService`, `kycService`) |
| `src/utils/` | Checkout validation, stock limits, physical-gold helpers, MMTC catalog helpers |
| `src/assets/` | Page images that are imported by components. Product photos for MMTC live in `public/mmtc/` |

### Routes

| Path | Screen |
| --- | --- |
| `/` | Home. Own products and MMTC products are loaded separately |
| `/invest`, `/invest-gold`, `/invest-gold-sell` | Digital gold buy and sell (SafeGold) |
| `/invest-gold/order-summary`, `/invest-gold-sell/order-summary` | Digital purchase and sale confirmations |
| `/own-gold` | Own physical gold and silver. `/own-silver` redirects here |
| `/own-gifting` | Gift products (`type: gifting`) with the same cart, stock, and buy-now behaviour as own gold |
| `/own-mmtc-pamp` and `/own-mmtc-pamp/:productId` | MMTC-PAMP catalogue |
| `/cart` | Checkout. Cashfree only |
| `/kyc` | KYC, required only when the order value is ₹2,00,000 or more |
| `/dashboard` | Customer dashboard: portfolio, orders, history, profile |
| `/login`, `/register` | Customer auth |
| `/admin` | Super-admin login and the admin console |
| `/knowledge-hub` | Weekly market review |
| `/zerodha-integration` | Zerodha Kite connect screen |

Coming-soon redirects cover careers, articles, and FAQs.

### Shop behaviour that is easy to miss

- Public product lists default to the **own** catalogue. MMTC pages ask for `catalog=mmtc-pamp`. Cart price sync asks for `catalog=all`.
- A line’s catalogue label in the cart, orders, invoices, and dashboard is `own` or `mmtc`, not `mmtc-pamp`.
- Add to cart stops at stock. Buy now stays available when the cart already holds the full stock, and then opens `/cart`.
- Quantity steppers on own gold, gifting, and the product modal share that stock limit.
- Failed or unpaid orders are hidden on the customer orders and history tabs. Paid physical rows show date, product, type (`own` or `mmtc`), quantity, amount, Sequel-based status, docket, and track.
- Digital gold rows are labelled `Digital Gold (SafeGold)`. Weight is its own column. The same name pattern is reserved for Augmont and MMTC-PAMP digital partners later.
- Logout from any page returns home and clears the cart. The header listens for `gs-before-logout` before `gs_auth` is cleared.

### Admin console

`AdminPage.jsx` is a single page with tabs (dashboard, products, orders, users, KYC, buyback, Sequel tools). Product tabs that are visible are **Fixed-price** and **MMTC-PAMP**. The rate-linked tab button and its dashboard “Open list” action are commented out, not deleted.

Changing a product name rewrites the slug when the name still contains letters or digits. The admin can still type a slug; the next name edit replaces it.

Orders table:

- Order id is shortened, with icons to reveal and copy the full id.
- Type is `own`, `mmtc`, `safegold`, `ETF`, and the other investment types when present.
- **Product status** is the fulfilment dropdown (pending, paid, shipped, delivered, cancelled, failed).
- **Order status** is payment only: `success` or `failed`.

## Backend

Stack: Node.js, Express 4, Mongoose 8, JWT, bcrypt. Entry file: `backend/src/server.js`.

Startup order:

1. Load `backend/.env`.
2. Connect MongoDB (`MONGODB_URI`, database name `goldnsilver` when the URI does not override it).
3. Refresh the gate super-admin from `APP_GATE_EMAIL` and `APP_GATE_PASSWORD`.
4. Seed MMTC-PAMP products that are not already stored (matched by slug).
5. Start the Sequel tracking sync (every 10 minutes, first run about 20 seconds after boot).
6. Listen on `PORT` (default 5000).

### Folders

| Path | Role |
| --- | --- |
| `src/routes/` | HTTP routers mounted under `/api` |
| `src/models/` | Mongoose schemas |
| `src/services/` | Partner APIs and domain logic that routes should not inline |
| `src/middleware/` | Auth, uploads, KYC upload, error handler |
| `src/utils/physicalGold.js` | Which product types need a Sequel shipment |
| `src/scripts/` | One-off seeds and “book dockets that were missed” |
| `src/config/db.js` | Mongo connection |

### API mounts

| Prefix | Router | Main job |
| --- | --- | --- |
| `/api/auth` | `authRoutes.js` | Register, login, admin login, refresh, existence checks |
| `/api/user` | `userRoutes.js` | Customer dashboard, orders, profile, last shipping address |
| `/api/products` | `productRoutes.js` | Public catalogue, including catalog filters |
| `/api/orders` | `orderRoutes.js` | Create checkout orders, KYC gate at ₹2,00,000 |
| `/api/cart` | `cartRoutes.js` | Signed-in cart persistence |
| `/api/payment` | `paymentRoutes.js` | Cashfree order, verify, webhook |
| `/api/safegold` | `safegoldRoutes.js` | Quotes, buy, sell, balance, invoices, transaction history |
| `/api/sequel` | `sequelRoutes.js` | Pincode check, booking, single-docket track |
| `/api/kyc` | `kycRoutes.js` | Manual and DigiLocker KYC |
| `/api/admin` | `adminRoutes.js` | Products, orders, users, rates, KYC review |
| `/api/zerodha` | `zerodhaRoutes.js` | Kite login URL, OAuth callback, quotes, session |
| `/api/live-price` | `livePriceRoutes.js` | Rates exposed to the shop |
| `/api/buyback` | `buybackRoutes.js` | Buyback requests |
| `/api/sip` | `sipRoutes.js` | SIP plan catalogue |
| `/api/blogs`, `/api/media` | content routes | Knowledge and media records |
| `/api/products/import` | `productImportRoutes.js` | CSV product import |

### Main business flows

**Physical or gift checkout**

1. The cart validates customer details and, for physical lines, a shipping address.
2. `POST /api/orders` prices each line from the database (`pricePerUnit × quantity`), not from the browser total.
3. KYC is required only when that computed value is at least ₹2,00,000.
4. Cashfree is created with return URL `/cart?order_id={order_id}&order_status={order_status}`.
5. On payment success, stock is reduced once (`Order.stockDeducted`) and Sequel booking runs for physical lines.
6. Every 10 minutes, open dockets are refreshed with Sequel `POST /api/trackMultiple`. The customer orders table reads the saved Sequel status.

**Digital gold (SafeGold)**

1. The customer must be linked. `partnerUserId` is the Mongo `User._id`.
2. Buy is quote, then Cashfree, then SafeGold buy-verify and buy-confirm. Local fulfillment does not depend on a gold-transfer call.
3. The order is stored with `orderType: 'safegold'` and the line name `Digital Gold (SafeGold)`. Grams stay on `metalGrams`, not inside the name.
4. Sell uses sell-verify and sell-confirm. There is no KYC check on the SafeGold buy path.

**Live metal rates**

Zerodha Kite supplies MCX gold (and silver when the session has it). Those quotes feed rate-linked own products. MMTC products and other fixed-price products are skipped by the bulk rate update. Admin `MetalRateSettings` is not used as a fake live gold price.

## Environment names

Set these in `backend/.env` or `frontend/.env`. Values stay in those files only.

Backend: `PORT`, `MONGODB_URI`, `JWT_SECRET`, `FRONTEND_URL`, `BACKEND_URL`, `APP_GATE_EMAIL`, `APP_GATE_PASSWORD`, `ADMIN_USERNAME`, `ADMIN_PASSWORD`, `ADMIN_EMAIL`, plus the partner variables listed in the third-party document.

Frontend: `VITE_API_URL`, `VITE_APP_GATE_EMAIL`, `VITE_APP_GATE_PASSWORD`. The gate password on the frontend must match the backend env. The backend env is the source of truth for the super-admin account.

After a frontend env change, restart Vite. After a backend env or auth change, restart the API process.
