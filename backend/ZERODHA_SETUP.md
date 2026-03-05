# Zerodha API Setup Guide

This guide explains how to configure Zerodha API for dynamic market data fetching.

## Prerequisites

1. A Zerodha trading account
2. Access to Zerodha Developer Console

## Step 1: Create a Kite Connect App

1. Go to [Zerodha Developer Console](https://developers.kite.trade/)
2. Log in with your Zerodha credentials
3. Create a new Kite Connect app
4. Note down your **API Key** and **API Secret**

## Step 2: Generate Access Token

The access token is obtained through OAuth flow. You have two options:

### Option A: Manual OAuth Flow (For Testing)

1. Use the Kite Connect login URL:
   ```
   https://kite.trade/connect/login?api_key=YOUR_API_KEY&v=3
   ```
2. Authorize the app
3. You'll be redirected to your redirect URL with a `request_token`
4. Exchange the `request_token` for an `access_token` using:
   ```javascript
   const kc = new KiteConnect({ api_key: 'YOUR_API_KEY' });
   const session = await kc.generateSession('request_token', 'YOUR_API_SECRET');
   const accessToken = session.access_token;
   ```

### Option B: Use Zerodha's OAuth Helper (Recommended for Production)

Implement a proper OAuth flow in your application where users can authorize and generate tokens.

## Step 3: Get Instrument Tokens

1. Use the Kite Connect API to fetch MCX instruments:
   ```javascript
   const instruments = await kc.getInstruments('MCX');
   ```
2. Search for Gold and Silver contracts (e.g., GOLDM, SILVERM)
3. Note down the instrument tokens for the contracts you want to track

## Step 4: Configure Environment Variables

Add the following to your `.env` file:

```env
# Zerodha API Configuration
ZERODHA_API_KEY=your_api_key_here
ZERODHA_ACCESS_TOKEN=your_access_token_here

# Optional: Specific instrument tokens (if you know them)
ZERODHA_GOLD_TOKEN=738561
ZERODHA_SILVER_TOKEN=738569
```

## Step 5: Test the Integration

1. Start your backend server
2. Make a GET request to `/api/zerodha/market-data`
3. You should receive live gold and silver prices from MCX

## Important Notes

- **Access Token Expiry**: Access tokens may expire. You'll need to implement token refresh logic.
- **Rate Limits**: Be aware of Zerodha's API rate limits
- **Market Hours**: MCX data is only available during market hours
- **Fallback Data**: The API will return mock data if:
  - API key is not configured
  - Access token is not configured
  - API call fails
  - Market is closed

## Troubleshooting

### Error: "Invalid API Key"
- Verify your API key in the `.env` file
- Ensure there are no extra spaces or quotes

### Error: "Invalid Access Token"
- Generate a new access token
- Access tokens may expire - implement refresh logic

### Error: "Invalid Instrument Token"
- Fetch the latest instrument list using `getInstruments('MCX')`
- Update `ZERODHA_GOLD_TOKEN` and `ZERODHA_SILVER_TOKEN` in `.env`

### No Data Returned
- Check if MCX market is open
- Verify instrument tokens are correct
- Check API rate limits

## Example Response

```json
{
  "success": true,
  "data": {
    "goldPrice": 6500.50,
    "silverPrice": 95.25,
    "lastUpdated": "2024-01-15T10:30:00.000Z",
    "changeGold": 0.75,
    "changeSilver": -0.20,
    "source": "Zerodha API"
  },
  "message": "Market data fetched successfully from Zerodha"
}
```

## References

- [Kite Connect Documentation](https://kite.trade/docs/connect/v3/)
- [Kite Connect JavaScript Client](https://kite.trade/docs/kiteconnectjs/v3/)
