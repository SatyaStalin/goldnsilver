# Augmont Digital Gold — Phase 1 (Buy Only)

## Overview

Phase 1 adds **buy digital gold** with live rates, payment (Razorpay/Cashfree), MongoDB ledger, and a dashboard on `/digital-gold`.

Collections: `gold_rates`, `gold_wallets`, `gold_transactions`

## Backend env

```env
# JWT (required for buy flow)
JWT_SECRET=your_strong_secret

# Augmont merchant API (from Augmont partner / developer portal)
AUGMONT_API_BASE_URL=https://uat-api.augmontgold.com/api
AUGMONT_EMAIL=merchant@example.com
AUGMONT_PASSWORD=
AUGMONT_MERCHANT_ID=

# Use mock rates + mock buy when credentials missing
AUGMONT_USE_MOCK=1

# Buy limits (INR)
DIGITAL_GOLD_MIN_INR=10
DIGITAL_GOLD_MAX_INR=500000

# Existing payment keys (Razorpay / Cashfree)
RAZORPAY_KEY_ID=
RAZORPAY_KEY_SECRET=
CASHFREE_APP_ID=
CASHFREE_SECRET_KEY=
```

When `AUGMONT_USE_MOCK=1` or Augmont credentials are empty, rates fall back to **Admin → Gold rates** or default ₹6400/g.

## API endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/digital-gold/rates` | No | Latest buy rate |
| GET | `/api/digital-gold/dashboard` | JWT | Wallet + rate + recent tx |
| GET | `/api/digital-gold/wallet` | JWT | Holdings |
| GET | `/api/digital-gold/transactions` | JWT | History |
| POST | `/api/digital-gold/buy/quote` | JWT | `{ amountInr }` → grams quote |
| POST | `/api/digital-gold/buy/initiate` | JWT | Create payment session |
| POST | `/api/digital-gold/buy/verify` | JWT | Verify payment + credit wallet |

Auth: `Authorization: Bearer <token>` from `/api/auth/login` or `/api/auth/register`.

## Frontend

- **Digital Gold** nav → `/digital-gold` dashboard
- Login / Register wired to JWT
- **Buy gold** modal → quote → Cashfree modal or Razorpay → verify → holdings update

## Augmont API paths (service layer)

Configured in `backend/src/services/augmontService.js`. Adjust paths to match your Augmont Postman collection when you receive credentials:

- `POST /merchant/v1/auth/login`
- `GET /merchant/v1/rates`
- `POST /merchant/v1/users`
- `POST /merchant/v1/buy`

## Not in Phase 1

Sell, redeem, SIP, physical delivery.
