# Cashfree Payment Gateway Setup Guide

## ⚠️ Important: IP Whitelisting Required

Cashfree requires **IP whitelisting** for security. Your server's IP address must be added to Cashfree dashboard before API calls will work.

## Quick Setup Steps

### 1. Get Your Server IP Address

**For Local Development:**
```bash
# Check your public IP
curl ifconfig.me
# Or visit: https://whatismyipaddress.com/
```

**For Production/Cloud:**
- Check your server's public IP from hosting provider
- Or use: `curl ifconfig.me` on your server

### 2. Add IP to Cashfree Dashboard

1. Login to Cashfree Dashboard: https://www.cashfree.com/
2. Go to **Settings** → **IP Whitelist**
3. Click **Add IP Address**
4. Enter your server's public IP
5. Save

### 3. Configure Environment Variables

Add to `backend/.env`:
```env
CASHFREE_APP_ID=your_app_id_here
CASHFREE_SECRET_KEY=your_secret_key_here
CASHFREE_ENVIRONMENT=sandbox  # Use 'production' for live
```

### 4. Get Cashfree Credentials

1. Go to Cashfree Dashboard
2. Navigate to **Developer** → **API Keys**
3. Copy **App ID** and **Secret Key**
4. For testing: Use **Sandbox** credentials
5. For production: Use **Live** credentials

## Troubleshooting

### Error: "IP address not allowed"

**Solution:**
1. Verify your server IP is whitelisted in Cashfree dashboard
2. Check if you're using the correct IP (public IP, not localhost)
3. For local development, consider:
   - Using ngrok to create a tunnel: `ngrok http 5000`
   - Whitelisting the ngrok IP
   - Or use Razorpay for local testing (no IP whitelisting needed)

### Error: "Invalid credentials"

**Solution:**
1. Verify `CASHFREE_APP_ID` and `CASHFREE_SECRET_KEY` in `.env`
2. Make sure you're using sandbox credentials for testing
3. Check for extra spaces or quotes in .env file

### Testing Locally Without IP Whitelisting

**Option 1: Use Razorpay**
- Razorpay doesn't require IP whitelisting
- Switch payment gateway to Razorpay in cart

**Option 2: Use ngrok**
```bash
# Install ngrok
npm install -g ngrok

# Create tunnel
ngrok http 5000

# Use the ngrok URL IP in Cashfree whitelist
```

**Option 3: Test in Production**
- Deploy to a server with static IP
- Whitelist that IP in Cashfree

## Environment Configuration

### Sandbox (Testing)
```env
CASHFREE_APP_ID=sandbox_app_id
CASHFREE_SECRET_KEY=sandbox_secret_key
CASHFREE_ENVIRONMENT=sandbox
```

### Production (Live)
```env
CASHFREE_APP_ID=live_app_id
CASHFREE_SECRET_KEY=live_secret_key
CASHFREE_ENVIRONMENT=production
```

## Payment Flow

1. User selects Cashfree in cart
2. Order created → `/api/orders`
3. Payment session created → `/api/payment/create-order`
4. Cashfree checkout opens
5. User completes payment
6. Payment verified → `/api/payment/verify-payment`
7. Order confirmed, stock reduced

## Notes

- **Sandbox**: May have relaxed IP restrictions (check dashboard)
- **Production**: Strict IP whitelisting required
- **Local Dev**: Consider using Razorpay or ngrok
- **Both gateways**: Work seamlessly, user can choose in cart

## Support

If issues persist:
1. Check Cashfree dashboard for API status
2. Verify credentials are correct
3. Check server logs for detailed error messages
4. Contact Cashfree support if needed
