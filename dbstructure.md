# Database structure (GoldProjectMERN)

This project uses **MongoDB** with **Mongoose**. Each **model** maps to a **collection** (Mongoose’s default names are lowercased and pluralized, e.g. `Product` → **`products`**).

---

## Top-level picture

```
GoldProjectMERN (MongoDB database — name from your connection string)
│
├── products                    … Catalogue items (shop, featured, pricing modes)
├── users                       … Registered customers (login, role, KYC)
├── orders                      … Purchases (line items, payment, guest or logged-in)
├── metalratesettings           … Global gold/silver ₹ per gram (admin rates)
├── buybackrequests             … Customers selling metal back to you
├── blogs                       … Knowledge / article content
├── media                       … Press, news, gallery entries
├── sipplans                    … SIP plan definitions (tenure, frequency, metal)
└── investmentproducts          … Investment options (digital, SIP, ETFs, etc.)
```

*(Collection name for `MetalRateSettings` is typically **`metalratesettings`** in MongoDB.)*

---

## Detailed tree (collections → fields)

### `products` — Store catalogue

What it’s for: **Things customers can buy** (digital gold, coins, SIP-related SKUs, etc.), with **rate-linked** or **fixed** pricing.

```
products
├── _id                 ObjectId     Unique document id (MongoDB)
├── name                String       Product display name *(required)*
├── slug                String       URL-safe unique id *(required, unique)*
├── metal               String       gold | silver | gold+silver *(required)*
├── type                String       digital | physical_coin | physical_bar | gifting | sip | fund | etf | sovereign_bond *(required)*
├── category            String       Optional grouping (e.g. “Coins”)
├── description         String       Longer text for detail pages
├── pricePerUnit        Number       Price in INR for one `unit` *(required)*  
├── pricingMode         String       rate_based (follows admin rates × grams) | fixed (manual price) *(default: rate_based)*
├── metalGrams          Number       Grams used for rate-based math; metadata for fixed *(default 1, min 0)*
├── unit                String       Usually `gram` *(default gram)*
├── stock               Number       How many units available *(default 0, min 0)*
├── imageUrl            String       Picture URL/path
├── isFeatured          Boolean      Show on homepage / highlights *(default false)*
├── isActive            Boolean      Hide from storefront if false *(default true)*
├── createdAt           Date         Auto *(if timestamps enabled)*
└── updatedAt           Date         Auto *(if timestamps enabled)*
```

---

### `users` — Customer accounts

What it’s for: **People who register**; links to orders when `user` is set on an order.

```
users
├── _id                 ObjectId     Unique user id
├── name                String       Full name *(required)*
├── email               String       Login id, unique, indexed *(required)*
├── passwordHash        String       Hashed password — never store plain text *(required)*
├── role                String       user | admin *(default user)*
├── kycStatus           String       pending | approved | rejected | not_submitted *(default not_submitted)*
├── createdAt           Date
└── updatedAt           Date
```

---

### `orders` — Sales & checkout

What it’s for: **Each checkout**; can be **guest** (only `customerName` / `customerEmail` / `customerPhone`) or **logged-in** (`user` ref).

```
orders
├── _id                 ObjectId
├── user                ObjectId?    → ref `users` (null for guest orders)
├── items[]             Array        Line items
│   ├── product         ObjectId     → ref `products` *(required in subdoc)*
│   ├── name            String       Snapshot of product name at order time
│   ├── price           Number       Unit price at order time
│   └── quantity        Number       How many
├── status              String       pending | paid | failed | shipped | completed *(default pending)*
├── paymentStatus       String       pending | success | failed *(default pending)*
├── paymentProvider     String       razorpay | stripe | mock | cashfree *(default mock)*
├── paymentOrderId      String       Gateway order id
├── paymentId           String       Gateway payment id
├── totalAmount         Number       Order total *(required)*
├── currency            String       e.g. INR *(default INR)*
├── customerName        String       Guest or display name
├── customerEmail       String
├── customerPhone       String
├── createdAt           Date
└── updatedAt           Date
```

---

### `metalratesettings` — Admin spot rates

What it’s for: **One global row** (usually `key: "global"`) used to recalculate **rate-linked** product prices.

```
metalratesettings
├── _id                 ObjectId
├── key                 String       Identifier — unique, often `global` *(default global)*
├── goldPerGram         Number       Gold price per gram in INR *(default 0)*
├── silverPerGram       Number       Silver price per gram in INR *(default 0)*
├── createdAt           Date
└── updatedAt           Date
```

---

### `buybackrequests` — Sell-back / buyback

What it’s for: **Customers asking you to buy their metal**; staff update `status` and `payoutMethod`.

```
buybackrequests
├── _id                 ObjectId
├── customerName        String       *(required)*
├── metal               String       gold | silver *(required)*
├── weightInGrams       Number       *(required)*
├── estimatedValue      Number       INR estimate *(required)*
├── status              String       pending | approved | rejected | paid *(default pending)*
├── payoutMethod        String       wallet | bank_transfer *(default wallet)*
├── notes               String       Internal / customer notes
├── createdAt           Date
└── updatedAt           Date
```

---

### `blogs` — Articles

What it’s for: **Blog / knowledge hub** posts.

```
blogs
├── _id                 ObjectId
├── title               String       *(required)*
├── slug                String       *(required, unique)*
├── excerpt             String       Short preview
├── content             String       Full body (often HTML or markdown)
├── category            String
├── imageUrl            String
├── isPublished         Boolean      *(default true)*
├── createdAt           Date
└── updatedAt           Date
```

---

### `media` — Press & gallery

What it’s for: **Media room** items (press clippings, news, images).

```
media
├── _id                 ObjectId
├── title               String       *(required)*
├── type                String       press | news | gallery *(default press)*
├── description         String
├── imageUrl            String
├── link                String       External URL optional
├── isPublished         Boolean      *(default true)*
├── createdAt           Date
└── updatedAt           Date
```

---

### `sipplans` — SIP templates

What it’s for: **Defined savings plans** (metal, min installment, tenure), not individual user subscriptions.

```
sipplans
├── _id                 ObjectId
├── name                String       *(required)*
├── metal               String       gold | silver | gold+silver *(required)*
├── type                String       digital_gold_sip | mutual_fund_sip | gold_accumulation | goal_based *(required)*
├── goal                String       e.g. “Marriage”, “Education”
├── minInstallment      Number       Minimum per installment *(required)*
├── frequency           String       monthly | weekly *(default monthly)*
├── tenureMonths        Number       Optional plan length
├── description         String
├── isActive            Boolean      *(default true)*
├── createdAt           Date
└── updatedAt           Date
```

---

### `investmentproducts` — Investment catalogue

What it’s for: **Investment menu** (categories like digital, SIP, ETF) separate from physical `products` where the app uses this model.

```
investmentproducts
├── _id                 ObjectId
├── name                String       *(required)*
├── metal               String       gold | silver | gold+silver *(required)*
├── category            String       digital | sip | mutual_fund | etf | sovereign_bond | coin | bar | gifting | lease *(required)*
├── provider            String       e.g. fund house name
├── minAmount           Number       *(default 0)*
├── maxAmount           Number       Optional cap
├── description         String
├── tags[]              Array of String   Keywords
├── isActive            Boolean      *(default true)*
├── createdAt           Date
└── updatedAt           Date
```

---

## How collections relate (simple diagram)

```
users ──────────────┐
                    │ (optional link)
                    ▼
                 orders ──► products  (each line item points at one product)


metalratesettings ──► (used in app logic to update rate_based products)


buybackrequests, blogs, media, sipplans, investmentproducts
    └── Mostly standalone lists; no required refs to users/products unless your routes add them later.
```

---

## Files in this repo that define schemas

All live under **`backend/src/models/`**:

| Model file               | Mongoose model        | Typical collection   |
|-------------------------|-----------------------|-----------------------|
| `Product.js`            | Product               | products              |
| `User.js`               | User                  | users                 |
| `Order.js`              | Order                 | orders                |
| `MetalRateSettings.js` | MetalRateSettings     | metalratesettings     |
| `BuybackRequest.js`    | BuybackRequest        | buybackrequests       |
| `Blog.js`              | Blog                  | blogs                 |
| `Media.js`             | Media                 | media                 |
| `SipPlan.js`           | SipPlan               | sipplans              |
| `InvestmentProduct.js` | InvestmentProduct     | investmentproducts    |

---

*Generated from Mongoose schemas in `backend/src/models`. If you add models or fields, update this file to match.*
