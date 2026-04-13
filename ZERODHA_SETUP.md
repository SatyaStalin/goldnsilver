# Zerodha API Integration Setup Guide

## Overview
This guide explains how to integrate Zerodha API with GoldNSilver.shop portal for trading Gold & Silver ETFs and accessing live market data.

## Prerequisites
1. Zerodha Kite Connect API credentials
2. API Key and API Secret from Zerodha
3. Registered redirect URL with Zerodha

## Step 1: Get Zerodha API Credentials

1. Log in to [Zerodha Kite Connect](https://kite.trade/)
2. Go to **My Apps** section
3. Create a new app or use existing app
4. Note down:
   - **API Key** (e.g., `zc9wx49hfuz83uqj`)
   - **API Secret** (keep this secure)
   - **Redirect URL** (must be whitelisted)

## Step 2: Configure Environment Variables

Add the following to your `.env` file in the backend:

```env
# Zerodha API Configuration
ZERODHA_API_KEY=your_api_key_here
ZERODHA_API_SECRET=your_api_secret_here
ZERODHA_REDIRECT_URL=https://goldnsilver.shop/api/zerodha/callback
FRONTEND_URL=https://goldnsilver.shop
BACKEND_URL=https://goldnsilver.shop

# Optional: For direct access token (if you have one)
ZERODHA_ACCESS_TOKEN=your_access_token_here
```

**Important Notes:**
- The `ZERODHA_REDIRECT_URL` must be **exactly** the same as configured in your Zerodha Kite Connect app settings
- For local development, use: `http://localhost:5000/api/zerodha/callback`
- For production, use: `https://goldnsilver.shop/api/zerodha/callback`
- Never commit `.env` file to version control

## Step 3: OAuth Flow Implementation

### Flow Overview:
1. User clicks "Connect Zerodha" button
2. User is redirected to Zerodha login page
3. After login, Zerodha redirects back with `request_token`
4. Backend generates `access_token` using `request_token`
5. Access token is stored and used for API calls

### API Endpoints:

#### 1. Get Login URL
```
GET /api/zerodha/login-url
```
Returns the Zerodha login URL.

#### 2. OAuth Callback
```
GET /api/zerodha/callback?request_token=xxxxx&action=login&status=success
```
Receives the request token from Zerodha and redirects to frontend.

#### 3. Generate Access Token
```
POST /api/zerodha/generate-token
Body: { "request_token": "xxxxx" }
```
Generates access token from request token.

#### 4. Get Market Data
```
GET /api/zerodha/market-data
Headers: { "x-zerodha-token": "access_token" }
```
Fetches live Gold & Silver prices from MCX.

#### 5. Get ETFs
```
GET /api/zerodha/etfs
Headers: { "x-zerodha-token": "access_token" }
```
Fetches all Gold & Silver ETFs from NSE and BSE.

## Step 4: Frontend Integration

The frontend automatically handles:
- OAuth redirect flow
- Storing access token in localStorage
- Displaying market data and ETFs
- User profile information

## Step 5: Testing

1. Start the backend server
2. Navigate to Knowledge Hub page
3. Click "Connect Zerodha" button
4. Complete Zerodha login
5. Verify market data and ETFs are displayed

## Features Implemented

### ✅ OAuth Flow
- Login URL generation
- Request token handling
- Access token generation
- Secure token storage

### ✅ Market Data
- Live Gold prices from MCX
- Live Silver prices from MCX
- Price change indicators
- Auto-refresh every 30 seconds

### ✅ ETFs Integration
- Gold ETFs from NSE/BSE
- Silver ETFs from NSE/BSE
- Real-time prices and volumes
- Price change percentages

### ✅ User Interface
- Connect/Disconnect buttons
- User profile display
- ETF cards with live data
- Responsive design

## Security Notes

1. **Never expose API Secret** in frontend code
2. **Store access tokens securely** (consider database storage for production)
3. **Use HTTPS** for all API calls in production
4. **Implement token refresh** mechanism (access tokens expire)
5. **Validate redirect URLs** to prevent phishing

## Troubleshooting

### Issue: "API key not configured"
- **Solution**: Add `ZERODHA_API_KEY` to `.env` file

### Issue: "Access token required"
- **Solution**: Complete OAuth login flow by clicking "Connect Zerodha"

### Issue: "Invalid request token"
- **Solution**: Request tokens are single-use. Generate a new one by logging in again.

### Issue: "No ETFs found"
- **Solution**: ETFs are only available during market hours (9:15 AM - 3:30 PM IST)

## Production Deployment

1. Update `ZERODHA_REDIRECT_URL` to production URL
2. Update `FRONTEND_URL` to production URL
3. Ensure HTTPS is enabled
4. Store access tokens in database (not localStorage)
5. Implement token refresh mechanism
6. Add rate limiting for API calls

## Support

For Zerodha API documentation, visit: https://kite.trade/docs/connect/v3/
