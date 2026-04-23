const express = require('express');
const axios = require('axios');
const crypto = require('crypto');
const { KiteConnect } = require('kiteconnect');
const router = express.Router();

// MCX Instrument tokens for Gold and Silver
const INSTRUMENTS = {
  GOLD: 'MCX:GOLDM',
  SILVER: 'MCX:SILVERM'
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

// Generate checksum for access token request
const generateChecksum = (apiKey, requestToken, apiSecret) => {
  const data = apiKey + requestToken + apiSecret;
  return crypto.createHash('sha256').update(data).digest('hex');
};

// Step 1: Get Zerodha login URL
router.get('/login-url', (req, res) => {
  try {
    const apiKey = process.env.ZERODHA_API_KEY;
    const redirectUrl = process.env.ZERODHA_REDIRECT_URL || `${process.env.BACKEND_URL || 'http://localhost:5000'}/api/zerodha/callback`;
    
    if (!apiKey) {
      return res.status(400).json({
        success: false,
        message: 'ZERODHA_API_KEY not configured in environment variables'
      });
    }

    // Zerodha login URL with redirect URL
    const loginUrl = `https://kite.zerodha.com/connect/login?api_key=${apiKey}&v=3`;
    
    res.json({
      success: true,
      loginUrl,
      redirectUrl,
      message: 'Zerodha login URL generated successfully'
    });
  } catch (error) {
    console.error('Error generating login URL:', error);
    res.status(500).json({
      success: false,
      message: 'Error generating login URL',
      error: error.message
    });
  }
});

// Step 2: Callback route - receives request_token from Zerodha
router.get('/callback', async (req, res) => {
  try {
    const { request_token, action, status } = req.query;
    
    if (action === 'login' && status === 'success' && request_token) {
      // Redirect to frontend with request token
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
      res.redirect(`${frontendUrl}/knowledge-hub?zerodha_token=${request_token}&status=success`);
    } else {
      // Error or cancellation
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
      res.redirect(`${frontendUrl}/knowledge-hub?zerodha_status=error&message=${status || 'cancelled'}`);
    }
  } catch (error) {
    console.error('Error in Zerodha callback:', error);
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    res.redirect(`${frontendUrl}/knowledge-hub?zerodha_status=error&message=callback_error`);
  }
});

// Step 3: Generate Access Token from request_token
router.post('/generate-token', async (req, res) => {
  try {
    const { request_token } = req.body;
    const apiKey = process.env.ZERODHA_API_KEY;
    const apiSecret = process.env.ZERODHA_API_SECRET;
    console.log('apiKey=',apiKey)
    console.log('apiSecret=',apiSecret)
    if (!apiKey || !apiSecret) {
      return res.status(400).json({
        success: false,
        message: 'ZERODHA_API_KEY or ZERODHA_API_SECRET not configured'
      });
    }

    if (!request_token) {
      return res.status(400).json({
        success: false,
        message: 'request_token is required'
      });
    }

    // Generate checksum
    const checksum = generateChecksum(apiKey, request_token, apiSecret);

    // Call Zerodha API to generate access token
    const response = await axios.post('https://api.kite.trade/session/token', null, {
      params: {
        api_key: apiKey,
        request_token: request_token,
        checksum: checksum
      },
      headers: {
        'X-Kite-Version': '3'
      }
    });

    if (response.data && response.data.data) {
      const { access_token, user_id, user_name, user_shortname, user_type } = response.data.data;
      
      // Store access token (in production, store securely in database)
      // For now, we'll return it to the client to store in session/localStorage
      
      res.json({
        success: true,
        data: {
          access_token,
          user_id,
          user_name,
          user_shortname,
          user_type
        },
        message: 'Access token generated successfully'
      });
    } else {
      throw new Error('Invalid response from Zerodha API');
    }
  } catch (error) {
    console.error('Error generating access token:', error.response?.data || error.message);
    res.status(500).json({
      success: false,
      message: 'Error generating access token',
      error: error.response?.data?.message || error.message
    });
  }
});

// Get market data (Gold & Silver prices from MCX)
router.get('/market-data', async (req, res, next) => {
  try {
    const apiKey = process.env.ZERODHA_API_KEY;
    const accessToken = req.headers['x-zerodha-token'] || process.env.ZERODHA_ACCESS_TOKEN;
    
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
        message: 'Zerodha access token not configured. Please generate access token via OAuth flow. Using mock data.',
        requiresAuth: true
      });
    }

    try {
      // Initialize KiteConnect
      const kc = new KiteConnect({
        api_key: apiKey
      });

      // Set access token
      kc.setAccessToken(accessToken);

      // Get instruments list for MCX to find Gold and Silver
      const instruments = await kc.getInstruments('MCX');
      
      // Find Gold and Silver instruments
      const goldInstruments = instruments.filter(i => 
        i.name && (i.name.includes('GOLD') || i.name.includes('Gold')) && i.instrument_type === 'FUT'
      );
      const silverInstruments = instruments.filter(i => 
        i.name && (i.name.includes('SILVER') || i.name.includes('Silver')) && i.instrument_type === 'FUT'
      );

      // Get the most recent contract (usually the first one)
      const goldToken = goldInstruments[0]?.instrument_token;
      const silverToken = silverInstruments[0]?.instrument_token;

      if (!goldToken || !silverToken) {
        throw new Error('Gold or Silver instruments not found');
      }

      // Get quotes for gold and silver
      const quotes = await kc.getQuote([`MCX:${goldToken}`, `MCX:${silverToken}`]);

      // Parse the quotes to extract prices
      const goldQuote = quotes[`MCX:${goldToken}`];
      const silverQuote = quotes[`MCX:${silverToken}`];

      if (goldQuote && silverQuote) {
        // Calculate price changes
        const goldPrice = goldQuote.last_price || goldQuote.ohlc?.close || 0;
        const silverPrice = silverQuote.last_price || silverQuote.ohlc?.close || 0;
        
        // Calculate percentage change
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

// Get Gold & Silver ETFs
router.get('/etfs', async (req, res) => {
  try {
    const apiKey = process.env.ZERODHA_API_KEY;
    const accessToken = req.headers['x-zerodha-token'] || process.env.ZERODHA_ACCESS_TOKEN;
    
    if (!apiKey) {
      return res.status(400).json({
        success: false,
        message: 'ZERODHA_API_KEY not configured'
      });
    }

    if (!accessToken) {
      return res.status(401).json({
        success: false,
        message: 'Access token required. Please complete Zerodha OAuth login.',
        requiresAuth: true
      });
    }

    try {
      const kc = new KiteConnect({
        api_key: apiKey
      });

      kc.setAccessToken(accessToken);

      // Get all instruments from NSE and BSE
      const nseInstruments = await kc.getInstruments('NSE');
      const bseInstruments = await kc.getInstruments('BSE');

      // Filter for Gold and Silver ETFs
      const goldETFs = [...nseInstruments, ...bseInstruments].filter(i => {
        const name = (i.name || '').toUpperCase();
        const tradingsymbol = (i.tradingsymbol || '').toUpperCase();
        return (name.includes('GOLD') || tradingsymbol.includes('GOLD')) && 
               (i.instrument_type === 'EQ' || i.instrument_type === 'ETF');
      });

      const silverETFs = [...nseInstruments, ...bseInstruments].filter(i => {
        const name = (i.name || '').toUpperCase();
        const tradingsymbol = (i.tradingsymbol || '').toUpperCase();
        return (name.includes('SILVER') || tradingsymbol.includes('SILVER')) && 
               (i.instrument_type === 'EQ' || i.instrument_type === 'ETF');
      });

      // Get quotes for all ETFs
      const allETFInstruments = [...goldETFs, ...silverETFs].map(etf => 
        `${etf.exchange}:${etf.instrument_token}`
      );

      let quotes = {};
      if (allETFInstruments.length > 0) {
        quotes = await kc.getQuote(allETFInstruments);
      }

      // Format ETF data with quotes
      const formatETF = (etf) => {
        const quoteKey = `${etf.exchange}:${etf.instrument_token}`;
        const quote = quotes[quoteKey];
        
        return {
          instrumentToken: etf.instrument_token,
          tradingsymbol: etf.tradingsymbol,
          name: etf.name,
          exchange: etf.exchange,
          lastPrice: quote?.last_price || 0,
          change: quote?.net_change || 0,
          changePercent: quote?.net_change ? 
            parseFloat(((quote.net_change / (quote.last_price - quote.net_change)) * 100).toFixed(2)) : 0,
          volume: quote?.volume || 0,
          ohlc: quote?.ohlc || {}
        };
      };

      res.json({
        success: true,
        data: {
          goldETFs: goldETFs.map(formatETF),
          silverETFs: silverETFs.map(formatETF),
          totalGoldETFs: goldETFs.length,
          totalSilverETFs: silverETFs.length
        },
        message: 'ETFs fetched successfully'
      });

    } catch (apiError) {
      console.error('Zerodha API error fetching ETFs:', apiError.message || apiError);
      res.status(500).json({
        success: false,
        message: 'Error fetching ETFs from Zerodha',
        error: apiError.message || 'Unknown error'
      });
    }
  } catch (err) {
    console.error('Unexpected error in ETFs route:', err);
    res.status(500).json({
      success: false,
      message: 'Unexpected error occurred',
      error: err.message
    });
  }
});

// Get user profile
router.get('/profile', async (req, res) => {
  try {
    const apiKey = process.env.ZERODHA_API_KEY;
    const accessToken = req.headers['x-zerodha-token'] || process.env.ZERODHA_ACCESS_TOKEN;
    
    if (!apiKey || !accessToken) {
      return res.status(401).json({
        success: false,
        message: 'Access token required'
      });
    }

    const kc = new KiteConnect({
      api_key: apiKey
    });

    kc.setAccessToken(accessToken);

    const profile = await kc.getProfile();

    res.json({
      success: true,
      data: profile,
      message: 'Profile fetched successfully'
    });
  } catch (error) {
    console.error('Error fetching profile:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching profile',
      error: error.message
    });
  }
});

module.exports = router;
