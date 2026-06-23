# SafeGold API Reference

Complete API catalog for the SafeGold integration in this project: portal endpoints, related payment/auth endpoints, and external SafeGold partner APIs called server-to-server.

See also: [SAFEGOLD_ARCHITECTURE.md](./SAFEGOLD_ARCHITECTURE.md) for database schema and architecture.

**Base URL (your backend):** `http://localhost:<PORT>/api`  
**SafeGold partner API base:** `SAFEGOLD_API_BASE_URL` (default `https://api.safegold.com`)

**Auth:** Portal endpoints marked **JWT** require:

```http
Authorization: Bearer <token>
```

Token comes from `POST /api/auth/login` or `POST /api/auth/register`.

**SafeGold API key** (`SAFEGOLD_API_KEY`) is used **server-to-server only** — never sent to the frontend.

---

## 1. Portal SafeGold APIs (`/api/safegold`)

Mounted in `backend/src/server.js` at `/api/safegold`.

### 1.1 `GET /api/safegold/buy-price`

| | |
|---|---|
| **Auth** | None (public) |
| **Purpose** | Live gold buy rate |

**Response (200):**

```json
{
  "currentPrice": 6420.50,
  "applicableTax": 3,
  "rateId": "12345",
  "rateValidity": "7 minutes",
  "expiresAt": "2026-06-17T10:07:00.000Z",
  "source": "safegold",
  "mock": false,
  "mockReason": null
}
```

**Notes:**

- Uses SafeGold `GET /v1/partners/buy-price` when `SAFEGOLD_API_KEY` is set and mock is off.
- When mock mode is on or API key is missing, returns a static demo rate (`SAFEGOLD_MOCK_PRICE`, default ₹6500/g).
- Rate cached for ~7 minutes.

---

### 1.2 `POST /api/safegold/buy/quote`

| | |
|---|---|
| **Auth** | None |
| **Purpose** | Calculate grams ↔ INR quote |

**Request body:**

```json
{
  "mode": "inr",
  "value": 1000,
  "rateId": "12345"
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `mode` | string | No | `"inr"` (default) or `"grams"` |
| `value` | number | Yes | Amount in INR or grams |
| `rateId` | string | No | If provided and stale, rate is refreshed |

**Response (200):**

```json
{
  "rateId": "12345",
  "currentPrice": 6420.50,
  "applicableTax": 3,
  "rateInclGst": 6613.12,
  "gstPerGram": 192.62,
  "goldAmount": 0.1512,
  "buyPrice": 1000,
  "gstAmount": 29.13,
  "goldValueExclGst": 970.87,
  "expiresAt": "2026-06-17T10:07:00.000Z",
  "source": "safegold"
}
```

**Limits:** `SAFEGOLD_MIN_INR` (default ₹10) – `SAFEGOLD_MAX_INR` (default ₹5,00,000)

**Errors:**

| Code | HTTP | When |
|------|------|------|
| `INVALID_AMOUNT` | 400 | Invalid or zero value |
| `QUOTE_ERROR` | 400 | Quote calculation failed |

---

### 1.3 `GET /api/safegold/customer`

| | |
|---|---|
| **Auth** | JWT |
| **Purpose** | Portal user ↔ SafeGold customer mapping status |

**Response (200):**

```json
{
  "linked": true,
  "customer": {
    "user": "...",
    "partnerUserId": "665a1b2c3d4e5f678901234",
    "safegoldCustomerId": "sg_user_xyz",
    "name": "John Doe",
    "phoneNo": "9876543210",
    "status": "active",
    "registeredAt": "...",
    "lastSyncedAt": "..."
  },
  "partnerUserId": "665a1b2c3d4e5f678901234",
  "mock": false
}
```

`status`: `pending` | `active` | `failed`

---

### 1.4 `POST /api/safegold/customer/register`

| | |
|---|---|
| **Auth** | JWT |
| **Purpose** | Create/link SafeGold customer for logged-in user |

**Request body:** None (uses profile `name` + `mobile`)

**Response (200):**

```json
{
  "success": true,
  "message": "SafeGold customer linked successfully",
  "customer": { "...mapping fields..." },
  "wallet": {
    "balanceGrams": 0,
    "safegoldUserId": "sg_user_xyz",
    "balanceSource": "safegold"
  }
}
```

**Errors:**

| Code | HTTP | When |
|------|------|------|
| `PROFILE_INCOMPLETE` | 400 | Missing name or invalid 10-digit mobile |

---

### 1.5 `GET /api/safegold/holdings`

| | |
|---|---|
| **Auth** | JWT |
| **Purpose** | Gold balance (synced from SafeGold, local fallback) |

**Response (200):**

```json
{
  "wallet": {
    "balanceGrams": 1.2500,
    "safegoldUserId": "sg_user_xyz",
    "balanceSource": "safegold",
    "lastSyncedAt": "..."
  },
  "customer": { "...mapping..." },
  "syncError": null,
  "mock": false
}
```

---

### 1.6 `GET /api/safegold/dashboard`

| | |
|---|---|
| **Auth** | JWT |
| **Purpose** | Combined dashboard: rate + wallet + recent transactions |

**Response (200):**

```json
{
  "customer": { "...mapping..." },
  "wallet": {
    "balanceGrams": 1.25,
    "safegoldUserId": "...",
    "balanceSource": "safegold",
    "lastSyncedAt": "..."
  },
  "rate": {
    "currentPrice": 6420.50,
    "applicableTax": 3,
    "rateId": "...",
    "expiresAt": "...",
    "source": "safegold",
    "mockReason": null
  },
  "transactions": [ "...local ledger (last 10)..." ],
  "safegoldTransactions": [ "...remote SafeGold history..." ],
  "transactionSource": "merged",
  "transactionSyncError": null,
  "limits": { "minInr": 10, "maxInr": 500000 },
  "mock": false
}
```

---

### 1.7 `GET /api/safegold/transactions`

| | |
|---|---|
| **Auth** | JWT |
| **Purpose** | Transaction history (local + SafeGold API) |

**Query params:**

| Param | Default | Max |
|-------|---------|-----|
| `limit` | 20 | 50 |

**Response (200):**

```json
{
  "transactions": [ "...local safegold_transactions..." ],
  "safegoldTransactions": [ "...remote..." ],
  "source": "merged",
  "syncError": null
}
```

---

### 1.8 `POST /api/safegold/buy/initiate`

| | |
|---|---|
| **Auth** | JWT |
| **Purpose** | Start buy flow — creates pending order + transaction for Cashfree payment |

**Request body:**

```json
{
  "mode": "inr",
  "value": 1000,
  "rateId": "12345"
}
```

**Response (200):**

```json
{
  "orderId": "665a...",
  "safegoldTransactionId": "665b...",
  "clientReferenceId": "SG_665a..._1718612345678_a1b2c3d4",
  "quote": { "...full quote object..." }
}
```

**Next step:** Call `POST /api/payment/create-order` with `orderId`, then complete Cashfree checkout, then `POST /api/payment/verify-payment`.

**Errors:**

| Code | HTTP | When |
|------|------|------|
| `INVALID_AMOUNT` | 400 | Invalid value |
| `PROFILE_INCOMPLETE` | 400 | Missing name or mobile |
| `RATE_EXPIRED` | 400 | `rateId` no longer valid |
| `PENDING_EXISTS` | 400 | Another pending buy in last 15 minutes |

---

## 2. Related Portal APIs (buy flow)

### 2.1 `PUT /api/auth/profile` (JWT)

Updates user profile. If `name` + valid 10-digit `mobile` are set, triggers async `ensureSafeGoldCustomer()` in the background.

**Relevant body fields:** `name`, `mobile`

---

### 2.2 `POST /api/payment/create-order`

| | |
|---|---|
| **Auth** | None (uses `orderId`) |
| **Purpose** | Create Cashfree/Razorpay payment session |

**Request body:**

```json
{
  "orderId": "665a...",
  "gatewayType": "cashfree",
  "returnPath": "/invest-gold",
  "customerName": "John Doe",
  "customerEmail": "john@example.com",
  "customerPhone": "9876543210"
}
```

**Response (200):**

```json
{
  "orderId": "cashfree_order_id",
  "keyId": null,
  "paymentSessionId": "session_...",
  "amount": 1000,
  "currency": "INR",
  "appId": "...",
  "isProduction": false
}
```

For SafeGold orders, default `returnPath` is `/invest-gold`.

---

### 2.3 `POST /api/payment/verify-payment`

| | |
|---|---|
| **Auth** | None |
| **Purpose** | Verify payment; for SafeGold orders, triggers gold transfer |

**Request body:**

```json
{
  "orderId": "665a...",
  "gatewayType": "cashfree",
  "paymentData": { "order_id": "cashfree_order_id" },
  "customerEmail": "john@example.com"
}
```

**Success response (200) for SafeGold:**

```json
{
  "success": true,
  "message": "Payment verified and gold purchased successfully",
  "order": { "...order with status paid..." },
  "safegold": {
    "transaction": {
      "buyTxId": "...",
      "transferTxId": "...",
      "status": "success"
    },
    "wallet": { "balanceGrams": 1.4012 },
    "customer": { "...mapping..." }
  }
}
```

**Partial failure (payment OK, gold transfer failed):**

| Code | HTTP |
|------|------|
| `GOLD_TRANSFER_FAILED` | 502 |

---

## 3. External SafeGold Partner APIs (server-to-server)

Called from `backend/src/services/safegoldApi.js`. All use:

```http
Authorization: Bearer <SAFEGOLD_API_KEY>
Content-Type: application/json
```

`partnerUserId` = MongoDB `User._id` as string.

| # | Method | Path | Used by | Purpose |
|---|--------|------|---------|---------|
| 1 | `GET` | `/v1/partners/buy-price` | `fetchBuyPrice()` | Live buy rate |
| 2 | `POST` | `/v1/partners/{partnerUserId}/register` | `registerCustomer()` | Register customer |
| 3 | `GET` | `/v1/partners/{partnerUserId}/gold-balance` | `fetchCustomerBalance()` | Holdings |
| 4 | `GET` | `/v1/partners/{partnerUserId}/transactions?limit=N` | `fetchCustomerTransactions()` | Tx history |
| 5 | `POST` | `/v1/partners/{partnerUserId}/gold-transfer` | `transferGold()` | Credit gold after payment |
| 6 | `GET` | `/v1/partners/{clientReferenceId}/gift-order-status-by-invoice-id` | `getOrderStatus()` | Order status lookup |

**Path overrides (env):**

```env
SAFEGOLD_REGISTER_PATH=/v1/partners/{partnerUserId}/register
SAFEGOLD_BALANCE_PATH=/v1/partners/{partnerUserId}/gold-balance
SAFEGOLD_TRANSACTIONS_PATH=/v1/partners/{partnerUserId}/transactions
```

### 3.1 Register customer

**POST** `/v1/partners/{partnerUserId}/register`

**Body:**

```json
{
  "name": "John Doe",
  "phone_no": "9876543210"
}
```

**Response (mapped):**

```json
{
  "customer_user_id": "sg_user_xyz",
  "gold_balance": 0,
  "status": "active"
}
```

---

### 3.2 Gold balance

**GET** `/v1/partners/{partnerUserId}/gold-balance`

**Response (mapped):**

```json
{
  "customer_user_id": "sg_user_xyz",
  "gold_balance": 1.25,
  "source": "safegold"
}
```

---

### 3.3 Transactions

**GET** `/v1/partners/{partnerUserId}/transactions?limit=20`

**Response (mapped per item):**

```json
{
  "safegoldTxId": "...",
  "type": "buy",
  "goldAmount": 0.15,
  "buyPrice": 1000,
  "status": "success",
  "createdAt": "...",
  "clientReferenceId": "SG_..."
}
```

---

### 3.4 Gold transfer (post-payment)

**POST** `/v1/partners/{partnerUserId}/gold-transfer`

**Body:**

```json
{
  "name": "John Doe",
  "phone_no": "9876543210",
  "rate_id": "12345",
  "gold_amount": 0.1512,
  "buy_price": 1000,
  "client_reference_id": "SG_665a..._1718612345678_a1b2c3d4"
}
```

**Response (mapped):**

```json
{
  "buy_tx_id": "...",
  "transfer_tx_id": "...",
  "sg_rate": 6613.12,
  "customer_user_id": "sg_user_xyz"
}
```

---

### 3.5 Gift order status

**GET** `/v1/partners/{clientReferenceId}/gift-order-status-by-invoice-id`

Used by `getOrderStatus()` — available in the service layer but not exposed as a portal route.

---

## 4. End-to-end buy flow

```
1. GET  /api/safegold/buy-price
2. POST /api/safegold/buy/quote
3. POST /api/safegold/buy/initiate          (JWT)
   → returns orderId, safegoldTransactionId, quote
4. POST /api/payment/create-order
   → returns paymentSessionId
5. User pays in Cashfree modal
6. POST /api/payment/verify-payment
   → backend calls SafeGold POST /gold-transfer
   → syncs holdings via GET /gold-balance
   → returns success + updated wallet
```

---

## 5. Environment variables

```env
# SafeGold partner (backend only)
SAFEGOLD_API_KEY=your_partner_token
SAFEGOLD_API_BASE_URL=https://api.safegold.com
SAFEGOLD_USE_MOCK=0          # 1 = mock all SafeGold calls

# Buy limits
SAFEGOLD_MIN_INR=10
SAFEGOLD_MAX_INR=500000
SAFEGOLD_MOCK_PRICE=6500   # demo rate when mock mode / no API key

# Optional path overrides
SAFEGOLD_REGISTER_PATH=/v1/partners/{partnerUserId}/register
SAFEGOLD_BALANCE_PATH=/v1/partners/{partnerUserId}/gold-balance
SAFEGOLD_TRANSACTIONS_PATH=/v1/partners/{partnerUserId}/transactions

# Payment (Cashfree)
CASHFREE_APP_ID=...
CASHFREE_SECRET_KEY=...
FRONTEND_URL=https://your-domain.com

# Portal auth
JWT_SECRET=...
```

**Mock behavior:** When `SAFEGOLD_USE_MOCK=1` or `SAFEGOLD_API_KEY` is empty, register/balance/transfer/tx calls return mock data. Buy price uses a static mock rate (`SAFEGOLD_MOCK_PRICE`, default ₹6500/g).

---

## 9. Authentication (no JWT / SHA on your portal)

| Layer | Auth |
|-------|------|
| `GET /api/safegold/buy-price` (your API) | **No auth** — public |
| Other `/api/safegold/*` routes | **JWT** (`Authorization: Bearer <login token>`) |
| SafeGold partner API (server → SafeGold) | **`SAFEGOLD_API_KEY` only** as `Authorization: Bearer <key>` |

This integration does **not** use SHA/HMAC request signing. If your SafeGold partner swagger requires extra headers or signatures, add them per SafeGold’s doc (contact your SafeGold account manager).

---

## 10. Troubleshooting `fetch failed` / `SAFEGOLD_NETWORK_ERROR`

If `/api/safegold/buy-price` returns:

```json
{
  "success": false,
  "message": "Cannot reach SafeGold API at https://api.safegold.com ...",
  "code": "SAFEGOLD_NETWORK_ERROR"
}
```

that means your **server cannot open a TCP connection** to SafeGold — not an invalid API key. Wrong keys usually return HTTP **401/403** with a SafeGold error body.

**Checklist:**

1. **`SAFEGOLD_USE_MOCK=0`** and restart backend after env changes.
2. **`SAFEGOLD_API_BASE_URL`** — must match the **production base URL** from your SafeGold partner agreement (default `https://api.safegold.com` may not be correct for all partners).
3. **IP whitelist** — SafeGold often whitelists your server’s **outbound public IP**. Ask SafeGold to whitelist your VPS IP (same as Cashfree IP whitelist).
4. **Outbound HTTPS** from the server:
   ```bash
   curl -v "https://YOUR_SAFEGOLD_BASE_URL/v1/partners/buy-price" \
     -H "Authorization: Bearer YOUR_API_KEY"
   ```
5. **DNS** — if `api.safegold.com` resolves to private `10.x` addresses, use the base URL SafeGold gave you instead.

**Invalid API key** (network OK) looks like:

```json
{
  "success": false,
  "message": "Unauthorized",
  "code": "SAFEGOLD_API_ERROR",
  "details": { }
}
```

---

## 6. Error codes summary

| Code | HTTP | Description |
|------|------|-------------|
| `INVALID_AMOUNT` | 400 | Bad buy amount |
| `QUOTE_ERROR` | 400 | Quote calculation error |
| `PROFILE_INCOMPLETE` | 400 | Name/mobile missing |
| `RATE_EXPIRED` | 400 | Stale rate on initiate |
| `PENDING_EXISTS` | 400 | Pending buy already exists |
| `VALIDATION_ERROR` | 400 | Mongoose validation |
| `SAFEGOLD_API_ERROR` | 502 | SafeGold API failure |
| `REGISTER_PENDING_TRANSFER` | — | Register deferred until first transfer |
| `GOLD_TRANSFER_FAILED` | 502 | Payment OK, gold transfer failed |

**Error response shape:**

```json
{
  "message": "Gold rate has expired. Please refresh and try again.",
  "code": "RATE_EXPIRED",
  "details": {}
}
```

---

## 7. Frontend service mapping

From `frontend/src/services/api.js`:

| Frontend method | Portal endpoint |
|-----------------|-----------------|
| `safegoldService.getBuyPrice()` | `GET /safegold/buy-price` |
| `safegoldService.getQuote(data)` | `POST /safegold/buy/quote` |
| `safegoldService.getCustomer()` | `GET /safegold/customer` |
| `safegoldService.registerCustomer()` | `POST /safegold/customer/register` |
| `safegoldService.getHoldings()` | `GET /safegold/holdings` |
| `safegoldService.getDashboard()` | `GET /safegold/dashboard` |
| `safegoldService.getTransactions(params)` | `GET /safegold/transactions` |
| `safegoldService.initiateBuy(data)` | `POST /safegold/buy/initiate` |
| `paymentService.createOrder(data)` | `POST /payment/create-order` |
| `paymentService.verifyPayment(data)` | `POST /payment/verify-payment` |

---

## 8. Quick reference table

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/safegold/buy-price` | No | Live gold rate |
| POST | `/api/safegold/buy/quote` | No | Quote calculator |
| GET | `/api/safegold/customer` | JWT | Customer mapping status |
| POST | `/api/safegold/customer/register` | JWT | Link SafeGold customer |
| GET | `/api/safegold/holdings` | JWT | Gold balance |
| GET | `/api/safegold/dashboard` | JWT | Rate + wallet + history |
| GET | `/api/safegold/transactions` | JWT | Transaction history |
| POST | `/api/safegold/buy/initiate` | JWT | Start buy → payment |
| POST | `/api/payment/create-order` | No | Cashfree session |
| POST | `/api/payment/verify-payment` | No | Verify + gold transfer |
| PUT | `/api/auth/profile` | JWT | Profile (triggers customer link) |
