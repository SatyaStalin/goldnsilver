const express = require('express');
const axios = require('axios');
const crypto = require('crypto');
const fs = require('fs');
const { KiteConnect } = require('kiteconnect');
const router = express.Router();
const qs = require('querystring');
const {
  mergeAndSaveSession,
  getPersistedAccessToken,
  getRefreshToken,
  renewPersistedSession,
  getSessionPath
} = require('../services/zerodhaSessionStore');

const zerodhaVerboseLogs = () =>
  process.env.ZERODHA_VERBOSE_LOGS === '1' ||
  /^true$/i.test(process.env.ZERODHA_VERBOSE_LOGS || '');

/** Avoid flooding logs when /market-data is polled frequently */
const zerodhaLogOnce = {
  ignoredEnvPolicy: false,
  noUsableToken: false
};

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

/** Trim, strip CR/BOM and outer quotes — common .env / PM2 mistakes break Kite auth. */
const normalizeSecret = (v) => {
  if (typeof v !== 'string') return '';
  let s = v.trim().replace(/\r/g, '').replace(/^\uFEFF/, '');
  if (
    (s.startsWith('"') && s.endsWith('"')) ||
    (s.startsWith("'") && s.endsWith("'"))
  ) {
    s = s.slice(1, -1).trim().replace(/\r/g, '');
  }
  return s;
};

// Step 1: Get Zerodha login URL
router.get('/login-url', (req, res) => {
  try {
    const apiKey = normalizeSecret(process.env.ZERODHA_API_KEY || '');
    const redirectUrl = process.env.ZERODHA_REDIRECT_URL || `${process.env.BACKEND_URL || 'http://localhost:5000'}/api/zerodha/callback`;
    
    if (!apiKey) {
      return res.status(400).json({
        success: false,
        message: 'ZERODHA_API_KEY not configured in environment variables'
      });
    }

    const loginUrl = `https://kite.zerodha.com/connect/login?v=3&api_key=${apiKey}`;
    
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

// Step 2: Callback route — exchanges request_token on the server and persists session (live quotes without copying tokens into .env).
router.get('/callback', async (req, res) => {
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
  try {
    const { request_token, status } = req.query;

    if (!request_token) {
      return res.redirect(
        `${frontendUrl}/knowledge-hub?zerodha_status=error&message=${encodeURIComponent(status || 'cancelled')}`
      );
    }

    const apiKey = normalizeSecret(process.env.ZERODHA_API_KEY || '');
    const apiSecret = normalizeSecret(process.env.ZERODHA_API_SECRET || '');

    if (apiKey && apiSecret) {
      try {
        const kc = new KiteConnect({ api_key: apiKey });
        const session = await kc.generateSession(request_token, apiSecret);
        const access_token = session?.access_token ?? session?.data?.access_token;
        const refresh_token = session?.refresh_token ?? session?.data?.refresh_token;
        if (!access_token) {
          throw new Error('Kite session response missing access_token');
        }
        mergeAndSaveSession({ access_token, refresh_token });
        console.info('[zerodha] OAuth OK; session persisted at:', getSessionPath());
        return res.redirect(`${frontendUrl}/knowledge-hub?zerodha_connected=1&status=success`);
      } catch (e) {
        console.error('Zerodha callback session exchange failed:', e?.message || e);
        return res.redirect(
          `${frontendUrl}/knowledge-hub?zerodha_status=error&message=${encodeURIComponent('token_exchange_failed')}`
        );
      }
    }

    // Fallback: no API secret on server — pass token to frontend (legacy).
    return res.redirect(
      `${frontendUrl}/knowledge-hub?zerodha_token=${encodeURIComponent(request_token)}&status=success`
    );
  } catch (error) {
    console.error('Error in Zerodha callback:', error);
    res.redirect(`${frontendUrl}/knowledge-hub?zerodha_status=error&message=callback_error`);
  }
});

// Step 3: Generate Access Token from request_token (also persists server-side session file)
router.post('/generate-token', async (req, res) => {
  try {
    const request_token = normalizeSecret(req.body?.request_token ?? '');
    const apiKey = normalizeSecret(process.env.ZERODHA_API_KEY || '');
    const apiSecret = normalizeSecret(process.env.ZERODHA_API_SECRET || '');

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

    const checksum = generateChecksum(apiKey, request_token, apiSecret);
    // Call Zerodha API to generate access token
    const response = await axios.post(
      'https://api.kite.trade/session/token',
      qs.stringify({
        api_key: apiKey,
        request_token: request_token,
        checksum: checksum
      }),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'X-Kite-Version': '3'
        }
      }
    );

    if (response.data && response.data.data) {
      const data = response.data.data;
      const { access_token, refresh_token, user_id, user_name, user_shortname, user_type } = data;

      mergeAndSaveSession({ access_token, refresh_token });

      res.json({
        success: true,
        data: {
          access_token,
          user_id,
          user_name,
          user_shortname,
          user_type
        },
        message: 'Access token generated successfully',
        sessionPersisted: true,
        sessionPath: getSessionPath()
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

// Ops: verify server-side Zerodha session (no secrets returned)
router.get('/session-status', (_req, res) => {
  const sessionPath = getSessionPath();
  let sessionFileExists = false;
  try {
    sessionFileExists = fs.existsSync(sessionPath);
  } catch {
    sessionFileExists = false;
  }
  const hasAccess = Boolean(getPersistedAccessToken());
  const hasRefresh = Boolean(getRefreshToken());

  let hint = null;
  if (!hasAccess && !sessionFileExists) {
    hint =
      'No session file yet. Zerodha Kite redirect URL must be this backend\'s /api/zerodha/callback (HTTPS), with ZERODHA_API_SECRET set here. Then open Connect Zerodha once.';
  } else if (!hasAccess && sessionFileExists) {
    hint = 'Session file exists but unreadable or empty access_token.';
  }

  const apiBase =
    process.env.BACKEND_URL ||
    (process.env.PORT ? `http://127.0.0.1:${process.env.PORT}` : '');
  const nextSteps = [
    'Kite developer app: Redirect URL = https://YOUR-HOST/api/zerodha/callback (must match this API).',
    'PM2/env must include ZERODHA_API_KEY, ZERODHA_API_SECRET, FRONTEND_URL.',
    'After Zerodha login, either hit GET /api/zerodha/callback?request_token=… or POST /api/zerodha/generate-token with body {"request_token":"…"} — both persist backend/data/zerodha-session.json on success.',
    'Env-only mode (no session file): set ZERODHA_ALLOW_ENV_TOKEN=1 and keep a fresh ZERODHA_ACCESS_TOKEN.',
    'If logs show env=set but invalid token: remove stale ZERODHA_ACCESS_TOKEN from env or set ZERODHA_SKIP_ENV_TOKEN=1 until OAuth succeeds.',
    'Debug: set ZERODHA_VERIFY_SECRET then GET /api/zerodha/verify-session with header X-Zerodha-Verify-Secret — confirms getProfile for current api_key + token.',
    apiBase ? `This server BACKEND_URL hint: ${apiBase}` : 'Set BACKEND_URL for clearer docs in responses.'
  ];

  const apiKeyClean = normalizeSecret(process.env.ZERODHA_API_KEY || '');
  const envTok = normalizeSecret(process.env.ZERODHA_ACCESS_TOKEN || '');

  res.json({
    success: true,
    sessionPath,
    sessionFileExists,
    hasPersistedAccessToken: hasAccess,
    hasRefreshToken: hasRefresh,
    diagnostics: {
      apiKeySuffix: apiKeyClean ? apiKeyClean.slice(-4) : null,
      envAccessTokenCharLength: envTok.length,
      allowEnvToken:
        process.env.ZERODHA_ALLOW_ENV_TOKEN === '1' ||
        /^true$/i.test(process.env.ZERODHA_ALLOW_ENV_TOKEN || '')
    },
    ...(hint ? { hint } : {}),
    nextSteps
  });
});

const isTokenAuthError = (err) => {
  if (err?.error_type === 'TokenException') return true;
  const data = err?.response?.data;
  if (data?.error_type === 'TokenException') return true;
  const msg =
    (typeof err?.message === 'string' && err.message) ||
    (typeof data?.message === 'string' && data.message) ||
    '';
  return /TokenException|Incorrect `api_key` or `access_token`|Incorrect api_key or access_token/i.test(
    msg
  );
};

/** Kite access token from request: x-zerodha-token, Bearer, or Kite "token api_key:access_token". */
const readClientAccessToken = (req) => {
  const x = normalizeSecret(req.get('x-zerodha-token') || '');
  if (x) return x;

  const auth = normalizeSecret(req.get('authorization') || '');
  if (!auth) return '';

  if (/^bearer\s+/i.test(auth)) {
    return normalizeSecret(auth.replace(/^bearer\s+/i, ''));
  }
  if (/^token\s+/i.test(auth)) {
    const rest = auth.replace(/^token\s+/i, '').trim();
    const colon = rest.indexOf(':');
    if (colon !== -1) return normalizeSecret(rest.slice(colon + 1));
  }
  return '';
};

/**
 * Resolves tokens for Kite: header → persisted file → env.
 * Without a persisted session, env is IGNORED unless ZERODHA_ALLOW_ENV_TOKEN=1 (stale .env tokens caused endless TokenException).
 */
const resolveZerodhaTokens = (req) => {
  const clientToken = readClientAccessToken(req);
  const persistedToken = getPersistedAccessToken();
  const skipEnvToken =
    process.env.ZERODHA_SKIP_ENV_TOKEN === '1' ||
    /^true$/i.test(process.env.ZERODHA_SKIP_ENV_TOKEN || '');
  const allowEnvWithoutPersistedSession =
    process.env.ZERODHA_ALLOW_ENV_TOKEN === '1' ||
    /^true$/i.test(process.env.ZERODHA_ALLOW_ENV_TOKEN || '');
  const envTokenRaw = process.env.ZERODHA_ACCESS_TOKEN;
  let envToken = normalizeSecret(
    typeof envTokenRaw === 'string' ? envTokenRaw : String(envTokenRaw || '')
  );
  if (skipEnvToken) {
    envToken = '';
  } else if (
    !allowEnvWithoutPersistedSession &&
    !persistedToken &&
    !clientToken &&
    envToken
  ) {
    if (zerodhaVerboseLogs() || !zerodhaLogOnce.ignoredEnvPolicy) {
      if (!zerodhaLogOnce.ignoredEnvPolicy) zerodhaLogOnce.ignoredEnvPolicy = true;
      console.warn(
        '[zerodha] Ignoring ZERODHA_ACCESS_TOKEN until OAuth saves a session file, or set ZERODHA_ALLOW_ENV_TOKEN=1 for env-only deployments.'
      );
    }
    envToken = '';
  }
  const accessCandidates = [
    ...new Set([clientToken, persistedToken, envToken].filter(Boolean))
  ];
  return {
    clientToken,
    persistedToken,
    envToken,
    envHadValue:
      typeof envTokenRaw === 'string' && Boolean(envTokenRaw.trim()) && !skipEnvToken,
    envIgnoredStalePolicy:
      Boolean(
        typeof envTokenRaw === 'string' &&
          envTokenRaw.trim() &&
          !skipEnvToken &&
          !allowEnvWithoutPersistedSession &&
          !persistedToken &&
          !clientToken &&
          !envToken
      ),
    accessCandidates
  };
};

// Get market data (Gold & Silver prices from MCX)
router.get('/market-data', async (req, res, next) => {
  try {
    const apiKey = normalizeSecret(process.env.ZERODHA_API_KEY || '');
    const {
      clientToken,
      persistedToken,
      envToken,
      envHadValue,
      envIgnoredStalePolicy,
      accessCandidates
    } = resolveZerodhaTokens(req);
    
    // If API key is not configured, return mock data
    if (!apiKey) {
      console.warn('ZERODHA_API_KEY not configured. Returning mock data.');
      return res.json({
        success: true,
        data: getMockData(),
        message: 'Zerodha API key not configured. Using mock data.'
      });
    }

    if (accessCandidates.length === 0) {
      if (zerodhaVerboseLogs() || !zerodhaLogOnce.noUsableToken) {
        if (!zerodhaLogOnce.noUsableToken) zerodhaLogOnce.noUsableToken = true;
        console.warn(
          '[zerodha] No usable token. Complete OAuth once, or set ZERODHA_ALLOW_ENV_TOKEN=1 with a fresh ZERODHA_ACCESS_TOKEN.'
        );
      }
      return res.json({
        success: true,
        data: getMockData(),
        message: envIgnoredStalePolicy
          ? 'ZERODHA_ACCESS_TOKEN is ignored until server session exists (OAuth). Set ZERODHA_ALLOW_ENV_TOKEN=1 only if you maintain the env token yourself. Using mock data.'
          : 'Zerodha access token not configured. Use Connect Zerodha or POST /api/zerodha/generate-token. Using mock data.',
        requiresAuth: true
      });
    }

    try {
      // Instrument master accepts unauthenticated CSV-style fetch (no Authorization when access_token absent).
      // Avoid attaching an expired browser token here so routing stays deterministic.
      const kcInstruments = new KiteConnect({
        api_key: apiKey
      });
      const instruments = await kcInstruments.getInstruments('MCX');
      
      // Find Gold and Silver instruments
      const goldInstruments = instruments.filter(i => 
        i.name && (i.name.includes('GOLD') || i.name.includes('Gold')) && i.instrument_type === 'FUT'
      );
      const silverInstruments = instruments.filter(i => 
        i.name && (i.name.includes('SILVER') || i.name.includes('Silver')) && i.instrument_type === 'FUT'
      );
      console.log('goldInstruments=',goldInstruments.length)
      console.log('silverInstruments=',silverInstruments.length)
      // Get the most recent contract (usually the first one)
      const goldToken = goldInstruments[0]?.instrument_token;
      const silverToken = silverInstruments[0]?.instrument_token;
      console.log('goldToken=',goldToken)
      console.log('silverToken=',silverToken)
      const goldSymbol = goldInstruments[0]?.tradingsymbol;
      const silverSymbol = silverInstruments[0]?.tradingsymbol;
      console.log('goldSymbol=',goldSymbol)
      console.log('silverSymbol=',silverSymbol)
      if (!goldToken || !silverToken) {
        throw new Error('Gold or Silver instruments not found');
      }

      const clientVia =
        req.get('x-zerodha-token')?.trim()
          ? 'x-zerodha-token'
          : req.get('authorization')
            ? 'Authorization'
            : 'none';
      console.log(
        `[zerodha] market-data quote: ${accessCandidates.length} candidate(s) | client=${clientVia} | persisted=${persistedToken ? 'yes' : 'no'} | env=${envToken ? 'used' : envIgnoredStalePolicy ? 'ignored(set ZERODHA_ALLOW_ENV_TOKEN=1 or OAuth)' : envHadValue ? 'cleared(SKIP)' : 'empty'}`
      );

      let quotes = null;
      let lastQuoteError = null;
      /* eslint-disable no-await-in-loop */
      for (const candidate of accessCandidates) {
        const kcQuote = new KiteConnect({ api_key: apiKey });
        kcQuote.setAccessToken(candidate);
        try {
          await kcQuote.getProfile();
        } catch (pe) {
          if (isTokenAuthError(pe)) {
            lastQuoteError = pe;
            console.warn(
              `[zerodha] getProfile failed (bad api_key/access_token pair for this process). api_key suffix=…${apiKey.slice(-4)}`
            );
            continue;
          }
          throw pe;
        }
        try {
          quotes = await kcQuote.getQuote([
            `MCX:${goldSymbol}`,
            `MCX:${silverSymbol}`
          ]);
          lastQuoteError = null;
          break;
        } catch (e1) {
          if (!isTokenAuthError(e1)) {
            throw e1;
          }
          lastQuoteError = e1;
          try {
            quotes = await kcQuote.getQuote([
              `MCX:${goldToken}`,
              `MCX:${silverToken}`
            ]);
            lastQuoteError = null;
            break;
          } catch (e2) {
            lastQuoteError = e2;
            if (!isTokenAuthError(e2)) {
              throw e2;
            }
          }
        }
      }
      /* eslint-enable no-await-in-loop */

      if ((!quotes || lastQuoteError) && lastQuoteError && isTokenAuthError(lastQuoteError)) {
        const apiSecret = normalizeSecret(process.env.ZERODHA_API_SECRET || '');
        if (apiSecret) {
          const renewed = await renewPersistedSession(apiKey, apiSecret);
          if (renewed) {
            const kcQuote = new KiteConnect({ api_key: apiKey });
            kcQuote.setAccessToken(renewed);
            await kcQuote.getProfile();
            try {
              quotes = await kcQuote.getQuote([
                `MCX:${goldSymbol}`,
                `MCX:${silverSymbol}`
              ]);
              lastQuoteError = null;
            } catch (e1) {
              try {
                quotes = await kcQuote.getQuote([
                  `MCX:${goldToken}`,
                  `MCX:${silverToken}`
                ]);
                lastQuoteError = null;
              } catch (e2) {
                lastQuoteError = e2;
              }
            }
          }
        }
      }

      if (!quotes || lastQuoteError) {
        throw lastQuoteError || new Error('Zerodha quote authorization failed');
      }

      const goldQuote = quotes[`MCX:${goldSymbol}`] ?? quotes[`MCX:${goldToken}`];
      const silverQuote = quotes[`MCX:${silverSymbol}`] ?? quotes[`MCX:${silverToken}`];
      console.log('[zerodha] quote keys retrieved:', Boolean(goldQuote && silverQuote));
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
      }

      throw new Error('Invalid quote data received from Zerodha API');

    } catch (apiError) {
      console.error('Zerodha API error:', apiError.message || apiError);

      const errMsg =
        apiError.message ||
        apiError?.response?.data?.message ||
        (typeof apiError === 'object' ? JSON.stringify(apiError) : String(apiError));
      const tokenInvalid =
        /TokenException|Incorrect `api_key` or `access_token`|Incorrect api_key or access_token/i.test(errMsg);

      if (tokenInvalid && accessCandidates.length > 0) {
        console.warn(
          '[zerodha] Kite rejected the access token. Check api_key vs app, or token expired. GET /api/zerodha/session-status'
        );
      }

      // Return mock data if API fails
      return res.json({
        success: true,
        data: getMockData(),
        message: tokenInvalid
          ? 'Zerodha session expired or invalid. Complete Connect Zerodha login again or update ZERODHA_ACCESS_TOKEN in server env (access tokens expire daily). Using fallback data.'
          : `Zerodha API error: ${errMsg}. Using fallback data.`,
        requiresAuth: tokenInvalid ? true : undefined
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
    const apiKey = normalizeSecret(process.env.ZERODHA_API_KEY || '');
    const { accessCandidates } = resolveZerodhaTokens(req);
    const accessToken = accessCandidates[0];
    
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
    const apiKey = normalizeSecret(process.env.ZERODHA_API_KEY || '');
    const { accessCandidates } = resolveZerodhaTokens(req);
    const accessToken = accessCandidates[0];
    
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

/**
 * Renews access_token using saved refresh_token (cron-friendly).
 * Requires ZERODHA_RENEW_SECRET and header X-Zerodha-Renew-Secret (same value).
 */
router.post('/renew-session', async (req, res) => {
  try {
    const expected = process.env.ZERODHA_RENEW_SECRET;
    const sent = req.get('x-zerodha-renew-secret');
    if (!expected || sent !== expected) {
      return res.status(401).json({
        success: false,
        message:
          'Unauthorized. Set ZERODHA_RENEW_SECRET in env and send matching X-Zerodha-Renew-Secret header.'
      });
    }

    const apiKey = normalizeSecret(process.env.ZERODHA_API_KEY || '');
    const apiSecret = normalizeSecret(process.env.ZERODHA_API_SECRET || '');

    if (!apiKey || !apiSecret) {
      return res.status(500).json({
        success: false,
        message: 'ZERODHA_API_KEY or ZERODHA_API_SECRET not configured'
      });
    }

    const token = await renewPersistedSession(apiKey, apiSecret);
    if (!token) {
      return res.status(400).json({
        success: false,
        message:
          'Renew failed. Ensure zerodha-session.json has refresh_token (complete OAuth once); otherwise login again.'
      });
    }

    res.json({
      success: true,
      message: 'Access token renewed and saved on server'
    });
  } catch (err) {
    console.error('renew-session:', err);
    res.status(500).json({
      success: false,
      message: err.message || 'Renew failed'
    });
  }
});

/** Confirms api_key + access_token with Kite getProfile (no secrets in response). */
router.get('/verify-session', async (req, res) => {
  try {
    const secret = normalizeSecret(process.env.ZERODHA_VERIFY_SECRET || '');
    const sent = normalizeSecret(req.get('x-zerodha-verify-secret') || '');
    if (!secret || sent !== secret) {
      return res.status(401).json({
        success: false,
        message:
          'Set ZERODHA_VERIFY_SECRET and send header X-Zerodha-Verify-Secret with the same value.'
      });
    }

    const apiKey = normalizeSecret(process.env.ZERODHA_API_KEY || '');
    const token =
      readClientAccessToken(req) ||
      normalizeSecret(process.env.ZERODHA_ACCESS_TOKEN || '');
    if (!apiKey || !token) {
      return res.status(400).json({
        success: false,
        message:
          'Need ZERODHA_API_KEY + ZERODHA_ACCESS_TOKEN (or Bearer / x-zerodha-token on this request).'
      });
    }

    const kc = new KiteConnect({ api_key: apiKey });
    kc.setAccessToken(token);
    try {
      const profile = await kc.getProfile();
      return res.json({
        success: true,
        kiteLoginOk: true,
        userId: profile.user_id,
        userShortName: profile.user_shortname,
        apiKeySuffix: apiKey.slice(-4),
        accessTokenCharLength: token.length
      });
    } catch (e) {
      return res.status(400).json({
        success: false,
        kiteLoginOk: false,
        apiKeySuffix: apiKey.slice(-4),
        accessTokenCharLength: token.length,
        errorType: e?.error_type || e?.response?.data?.error_type,
        message:
          e?.message ||
          e?.response?.data?.message ||
          'Kite rejected credentials for this api_key'
      });
    }
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
