# SafeGold Partner Integration Architecture

## Overview

Portal users authenticate **only via your JWT** (`/api/auth/login`, `/api/auth/register`).  
SafeGold `SAFEGOLD_API_KEY` is used **server-to-server only** — never for portal login.

Each portal user is mapped to a SafeGold customer via `partner_user_id` (= MongoDB `User._id` string).

---

## Database Schema

### `users` (existing)
| Field | Purpose |
|-------|---------|
| `_id` | Portal user ID → SafeGold `partner_user_id` |
| `name`, `email`, `mobile` | Profile for SafeGold registration |
| `passwordHash` | Portal login only |

### `safegold_customers` (new)
| Field | Type | Purpose |
|-------|------|---------|
| `user` | ObjectId → User | Portal user (unique) |
| `partnerUserId` | String | Same as `user._id` string (unique) |
| `safegoldCustomerId` | String | SafeGold `customer_user_id` |
| `name`, `phoneNo` | String | Snapshot at registration |
| `status` | `pending` \| `active` \| `failed` | Link state |
| `registeredAt`, `lastSyncedAt` | Date | Sync timestamps |
| `lastError` | String | Last API error |

### `safegold_wallets` (cache)
| Field | Purpose |
|-------|---------|
| `user` | Portal user |
| `balanceGrams` | Holdings (synced from SafeGold or local fallback) |
| `safegoldUserId` | SafeGold customer ID |
| `balanceSource` | `local` \| `safegold` |
| `lastSyncedAt` | Last balance sync |

### `safegold_transactions` (local ledger)
| Field | Purpose |
|-------|---------|
| `clientReferenceId` | Unique partner order ref |
| `rateId`, `goldAmount`, `buyPrice` | Quote snapshot |
| `buyTxId`, `transferTxId` | SafeGold API references |
| `paymentOrderId`, `paymentId` | Cashfree references |
| `orderId` | Link to `orders` collection (admin visibility) |
| `status` | `pending` \| `success` \| `failed` |

### `orders` (admin + payments)
| Field | Purpose |
|-------|---------|
| `orderType` | `product` \| `safegold` |
| `safegoldTransactionId` | Link to SafeGold tx |
| `paymentStatus`, `paymentProvider` | Cashfree flow |

---

## Backend Architecture

```
frontend (InvestGoldPage)
    ↓ JWT
safegoldRoutes.js          authRoutes.js (profile → link customer)
    ↓
safegoldCustomerService    safegoldFulfillment
    ↓                          ↓
safegoldApi.js  ←──────── transferGold (after Cashfree verify)
    ↓
SafeGold Partner REST API
```

| Service | Responsibility |
|---------|----------------|
| `safegoldApi.js` | HTTP client, `SafeGoldApiError`, all SafeGold API calls |
| `safegoldService.js` | Quote math, re-exports API functions |
| `safegoldCustomerService.js` | User ↔ customer mapping, holdings sync |
| `safegoldFulfillment.js` | Post-payment gold transfer + wallet update |
| `paymentRoutes.js` | Cashfree verify → calls `fulfillSafeGoldOrder` |

---

## API Flow

### 1. Register / Login (portal only)
```
POST /api/auth/register  →  User created  →  JWT returned
POST /api/auth/login     →  JWT returned  (no SafeGold involved)
```

### 2. Link SafeGold customer
```
PUT /api/auth/profile (name + mobile)
    → ensureSafeGoldCustomer() async

POST /api/safegold/customer/register
    → POST SafeGold /register (or pending until first buy)
    → Save safegoldCustomerId in safegold_customers
```

### 3. View holdings
```
GET /api/safegold/holdings
    → GET SafeGold /gold-balance?partnerUserId={userId}
    → Update safegold_wallets
```

### 4. Buy gold
```
POST /api/safegold/buy/quote
POST /api/safegold/buy/initiate
    → Create safegold_transactions (pending)
    → Create orders (orderType: safegold, pending)
POST /api/payment/create-order  (Cashfree)
    → User pays in Cashfree modal
POST /api/payment/verify-payment
    → Verify Cashfree
    → POST SafeGold /gold-transfer
    → Save buyTxId, transferTxId, customer_user_id
    → Sync holdings from SafeGold
```

### 5. Transaction history
```
GET /api/safegold/transactions
    → Local safegold_transactions (payment + SG refs)
    → + SafeGold /transactions API (when customer active)
```

---

## Environment Variables

```env
# Portal auth (your app only)
JWT_SECRET=...

# SafeGold partner (backend only)
SAFEGOLD_API_KEY=your_partner_token
SAFEGOLD_API_BASE_URL=https://api.safegold.com
SAFEGOLD_USE_MOCK=0

# Optional path overrides (match your SafeGold swagger)
SAFEGOLD_REGISTER_PATH=/v1/partners/{partnerUserId}/register
SAFEGOLD_BALANCE_PATH=/v1/partners/{partnerUserId}/gold-balance
SAFEGOLD_TRANSACTIONS_PATH=/v1/partners/{partnerUserId}/transactions

# Payment
CASHFREE_APP_ID=...
CASHFREE_SECRET_KEY=...
FRONTEND_URL=https://your-domain.com
```

---

## Portal API Endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/safegold/buy-price` | No | Live gold rate |
| POST | `/api/safegold/buy/quote` | No | Quote calculator |
| GET | `/api/safegold/customer` | JWT | Mapping status |
| POST | `/api/safegold/customer/register` | JWT | Link SafeGold customer |
| GET | `/api/safegold/holdings` | JWT | Balance from SafeGold |
| GET | `/api/safegold/dashboard` | JWT | Rate + holdings + history |
| GET | `/api/safegold/transactions` | JWT | Local + SafeGold history |
| POST | `/api/safegold/buy/initiate` | JWT | Start buy → Cashfree |

---

## Error Handling

All SafeGold API errors throw `SafeGoldApiError` with:
- `message` — user-facing text
- `code` — e.g. `PROFILE_INCOMPLETE`, `RATE_EXPIRED`, `SAFEGOLD_API_ERROR`
- `details` — raw SafeGold response (debug)

Routes return structured JSON:
```json
{ "message": "...", "code": "RATE_EXPIRED" }
```

---

## Requirement Checklist

| Requirement | Status |
|-------------|--------|
| Portal-only login | ✅ JWT auth, no SafeGold login |
| Map portal user → SafeGold customer | ✅ `safegold_customers` table |
| Store user_id ↔ safegold_customer_id | ✅ `partnerUserId` + `safegoldCustomerId` |
| Buy via SafeGold APIs | ✅ `gold-transfer` after Cashfree payment |
| Holdings from SafeGold | ✅ `GET /holdings` syncs balance API |
| Transaction history from SafeGold | ✅ Merged local + SafeGold API |
| Save transaction refs locally | ✅ `buyTxId`, `transferTxId`, `clientReferenceId` |
| No SafeGold creds for portal login | ✅ API key backend-only |
| Error handling | ✅ `SafeGoldApiError` + route handlers |
| Admin orders visibility | ✅ `orders` with `orderType: safegold` |
