const express = require('express');
const axios = require('axios');
const { KiteConnect } = require('kiteconnect');
const router = express.Router();

// MCX Instrument tokens for Gold and Silver
// These are common instrument tokens - you may need to update based on your requirements
// To get correct tokens, use: kc.getInstruments('MCX') and search for gold/silver contracts
const INSTRUMENTS = {
  GOLD: 'MCX:GOLDM',      // Gold Mini (1kg) - Update with actual token
  SILVER: 'MCX:SILVERM'   // Silver Mini (5kg) - Update with actual token
};

// Helper function to get mock data
const getMockData = () => {
  const baseGold = 6500;
  const baseSilver = 95;
  const goldVariation = Math.floor(Math.random() * 100) - 50;
  const silverVariation = Math.floor(Math.random() * 5) - 2;
  
  return {
    goldPrice: baseGold + goldVariation,
    silverPrice: baseSilver + silverVariation,
    lastUpdated: new Date().toISOString(),
    changeGold: parseFloat((goldVariation / baseGold * 100).toFixed(2)),
    changeSilver: parseFloat((silverVariation / baseSilver * 100).toFixed(2))
  };
};

// Get Zerodha market data (Gold & Silver prices)
router.get('/market-data', async (req, res, next) => {
  try {
    const apiKey = process.env.ZERODHA_API_KEY;
    const accessToken = process.env.ZERODHA_ACCESS_TOKEN;
    
    // If API key is not configured, return mock data
    if (!apiKey) {
      console.warn('ZERODHA_API_KEY not configured. Returning mock data.');
      return res.json({
        success: true,
        data: getMockData(),
        message: 'Zerodha API key not configured. Using mock data.'
      });
    }

    // If access token is not configured, return mock data with instructions
    if (!accessToken) {
      console.warn('ZERODHA_ACCESS_TOKEN not configured. Returning mock data.');
      return res.json({
        success: true,
        data: getMockData(),
        message: 'Zerodha access token not configured. Please generate access token via OAuth flow. Using mock data.'
      });
    }

    try {
      // Initialize KiteConnect
      const kc = new KiteConnect({
        api_key: apiKey
      });

      // Set access token
      kc.setAccessToken(accessToken);

      // Fetch instruments list for MCX (if needed to get correct tokens)
      // const instruments = await kc.getInstruments('MCX');
      // console.log('MCX Instruments:', instruments.filter(i => i.name.includes('GOLD') || i.name.includes('SILVER')));

      // Method 1: Get quotes using instrument tokens
      // Note: You need to get the actual instrument tokens from MCX
      // Example tokens (update these with actual tokens from your Zerodha account):
      const goldToken = process.env.ZERODHA_GOLD_TOKEN || '738561'; // Example token
      const silverToken = process.env.ZERODHA_SILVER_TOKEN || '738569'; // Example token

      // Get quotes for gold and silver
      const quotes = await kc.getQuote(['MCX:' + goldToken, 'MCX:' + silverToken]);

      // Parse the quotes to extract prices
      const goldQuote = quotes[`MCX:${goldToken}`];
      const silverQuote = quotes[`MCX:${silverToken}`];

      if (goldQuote && silverQuote) {
        // Calculate price changes
        const goldPrice = goldQuote.last_price || goldQuote.ohlc.close || 0;
        const silverPrice = silverQuote.last_price || silverQuote.ohlc.close || 0;
        
        // Calculate percentage change (if previous close is available)
        const goldChange = goldQuote.ohlc?.close 
          ? parseFloat(((goldPrice - goldQuote.ohlc.close) / goldQuote.ohlc.close * 100).toFixed(2))
          : 0;
        const silverChange = silverQuote.ohlc?.close
          ? parseFloat(((silverPrice - silverQuote.ohlc.close) / silverQuote.ohlc.close * 100).toFixed(2))
          : 0;

        return res.json({
          success: true,
          data: {
            goldPrice: parseFloat(goldPrice.toFixed(2)),
            silverPrice: parseFloat(silverPrice.toFixed(2)),
            lastUpdated: new Date().toISOString(),
            changeGold: goldChange,
            changeSilver: silverChange,
            source: 'Zerodha API'
          },
          message: 'Market data fetched successfully from Zerodha'
        });
      } else {
        throw new Error('Invalid quote data received from Zerodha API');
      }

    } catch (apiError) {
      console.error('Zerodha API error:', apiError.message || apiError);
      
      // Return mock data if API fails
      return res.json({
        success: true,
        data: getMockData(),
        message: `Zerodha API error: ${apiError.message || 'Unknown error'}. Using fallback data.`
      });
    }
  } catch (err) {
    console.error('Unexpected error in market-data route:', err);
    // Return mock data on unexpected errors
    res.json({
      success: true,
      data: getMockData(),
      message: 'Unexpected error occurred. Using fallback data.'
    });
  }
});

module.exports = router;
