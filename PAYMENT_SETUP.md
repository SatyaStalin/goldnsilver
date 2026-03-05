# Payment Gateway Setup Instructions

## Razorpay Integration

### Step 1: Get Razorpay Credentials

1. Go to https://dashboard.razorpay.com/
2. Sign up or log in to your account
3. Navigate to **Settings** → **API Keys**
4. Generate **Test Keys** (for development) or **Live Keys** (for production)
5. Copy your **Key ID** and **Key Secret**

### Step 2: Add Credentials to Backend

1. Create a `.env` file in the `backend` directory (copy from `.env.example`)
2. Add your Razorpay credentials:

```env
RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxxx
RAZORPAY_KEY_SECRET=your_key_secret_here
```

### Step 3: Payment Gateway Files

The payment gateway is implemented with an abstraction layer for easy switching:

- **Backend**: `backend/src/services/paymentGateway.js`
  - Handles Razorpay, Stripe (future), and Mock payments
  - Easy to add new payment gateways

- **Frontend**: `frontend/src/services/api.js`
  - `paymentService.createOrder()` - Creates payment order
  - `paymentService.verifyPayment()` - Verifies payment

### Step 4: How It Works

1. User adds products to cart
2. User clicks "Pay" button
3. Frontend creates order via `/api/orders`
4. Frontend creates Razorpay order via `/api/payment/create-order`
5. Razorpay checkout modal opens
6. After payment, frontend verifies via `/api/payment/verify-payment`
7. Stock is reduced automatically on successful payment

### Step 5: Adding Another Payment Gateway

To add Stripe or another gateway:

1. Update `paymentGateway.js` with new gateway methods
2. Add credentials to `.env`
3. Update frontend to use new gateway type
4. No other code changes needed!

### Test Mode

- Use Razorpay test keys for development
- Test card: 4111 1111 1111 1111
- Any future expiry date and CVV

### Production

- Switch to Razorpay live keys
- Update `.env` with live credentials
- Test thoroughly before going live

## Cashfree Integration

### Step 1: Get Cashfree Credentials

1. Go to https://www.cashfree.com/
2. Sign up or log in to your account
3. Navigate to **Developer** → **API Keys**
4. Copy your **App ID** and **Secret Key**
5. For testing, use **Sandbox** credentials
6. For production, use **Live** credentials

### Step 2: Add Credentials to Backend

Add to `backend/.env`:
```env
CASHFREE_APP_ID=your_cashfree_app_id
CASHFREE_SECRET_KEY=your_cashfree_secret_key
CASHFREE_ENVIRONMENT=sandbox  # or 'production' for live
```

### Step 3: IP Whitelisting (IMPORTANT!)

**Cashfree requires IP whitelisting for security:**

1. Go to Cashfree Dashboard → **Settings** → **IP Whitelist**
2. Add your server's public IP address
3. For local development, you may need to:
   - Use a tunneling service (ngrok, localtunnel)
   - Or test with Cashfree's test IP whitelist feature
   - Or use webhook-based verification instead

**To find your server IP:**
- If hosting on cloud: Check your server's public IP
- If local: Use `curl ifconfig.me` or visit https://whatismyipaddress.com/
- For development: Cashfree sandbox may allow all IPs (check dashboard)

### Step 4: How It Works

1. User selects Cashfree in cart
2. Frontend creates order via `/api/orders`
3. Frontend creates Cashfree payment session via `/api/payment/create-order`
4. Cashfree checkout opens
5. After payment, Cashfree redirects back
6. Frontend verifies payment via `/api/payment/verify-payment`
7. Stock reduced and order confirmed

### Step 5: Troubleshooting

**Error: "IP address not allowed"**
- Solution: Add your server IP to Cashfree dashboard → Settings → IP Whitelist
- For local dev: Use ngrok or check if sandbox allows all IPs

**Error: "Invalid credentials"**
- Solution: Verify CASHFREE_APP_ID and CASHFREE_SECRET_KEY in .env
- Make sure you're using sandbox credentials for testing

**Payment not redirecting**
- Solution: Check CASHFREE_ENVIRONMENT setting
- Verify payment session ID is correct
- Check browser console for errors

### Step 6: Switching Between Gateways

Users can select payment gateway in cart page:
- **Razorpay**: No IP whitelisting needed
- **Cashfree**: Requires IP whitelisting

Both work seamlessly through the payment gateway abstraction layer!
