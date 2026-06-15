const MetalRateSettings = require('../models/MetalRateSettings');

/** MCX GOLD futures quote is per N grams (default 10g); SafeGold uses ₹/gram. */
const ZERODHA_GOLD_QUOTE_GRAMS = Number(process.env.ZERODHA_GOLD_QUOTE_GRAMS) || 10;

const getMockZerodhaRates = () => {
  const baseGold = 6500;
  const baseSilver = 95;
  const goldVariation = Math.floor(Math.random() * 100) - 50;
  const silverVariation = Math.floor(Math.random() * 5) - 2;
  return {
    goldPerGram: baseGold + goldVariation,
    silverPerGram: baseSilver + silverVariation,
    source: 'mock'
  };
};

async function getAdminMetalRates() {
  const settings = await MetalRateSettings.findOne({ key: 'global' }).lean();
  if (settings && (settings.goldPerGram > 0 || settings.silverPerGram > 0)) {
    return {
      goldPerGram: settings.goldPerGram || 0,
      silverPerGram: settings.silverPerGram || 0,
      source: 'admin'
    };
  }
  return null;
}

/**
 * Live gold ₹/gram from Zerodha MCX only — never uses admin MetalRateSettings.
 * Used by SafeGold buy-price when SafeGold API is unavailable.
 */
async function getZerodhaLiveGoldRate() {
  try {
    const { getPersistedAccessToken } = require('./zerodhaSessionStore');
    const token = getPersistedAccessToken();
    const apiKey = process.env.ZERODHA_API_KEY?.trim();
    if (!token || !apiKey) {
      const mock = getMockZerodhaRates();
      return {
        goldPerGram: mock.goldPerGram,
        source: 'zerodha-mock',
        mockReason: 'Zerodha not connected — complete OAuth on Zerodha Integration page'
      };
    }

    const axios = require('axios');
    const base = process.env.BACKEND_URL || `http://localhost:${process.env.PORT || 5000}`;
    const res = await axios.get(`${base}/api/zerodha/market-data`, {
      headers: { Authorization: `Bearer ${token}`, 'x-zerodha-token': token },
      timeout: 8000
    });

    const data = res.data?.data;
    if (data?.goldPrice == null) {
      throw new Error(res.data?.message || 'No gold price in Zerodha response');
    }

    const quotePrice = Number(data.goldPrice);
    const isLiveQuote = data.source === 'Zerodha API';
    const goldPerGram = isLiveQuote
      ? Math.round((quotePrice / ZERODHA_GOLD_QUOTE_GRAMS) * 100) / 100
      : Math.round(quotePrice * 100) / 100;

    return {
      goldPerGram,
      source: isLiveQuote ? 'zerodha' : 'zerodha-mock',
      quotePrice,
      quoteGrams: isLiveQuote ? ZERODHA_GOLD_QUOTE_GRAMS : 1,
      mockReason: isLiveQuote ? null : res.data?.message || 'Zerodha mock data'
    };
  } catch (err) {
    const mock = getMockZerodhaRates();
    return {
      goldPerGram: mock.goldPerGram,
      source: 'zerodha-mock',
      mockReason: err.message || 'Zerodha fetch failed'
    };
  }
}

/**
 * Live rates for dashboard: Zerodha session when available, else admin rates, else mock.
 */
async function getLiveMetalRates() {
  try {
    const { getPersistedAccessToken } = require('./zerodhaSessionStore');
    const token = getPersistedAccessToken();
    if (token && process.env.ZERODHA_API_KEY) {
      const axios = require('axios');
      const base = process.env.BACKEND_URL || `http://localhost:${process.env.PORT || 5000}`;
      const res = await axios.get(`${base}/api/zerodha/market-data`, {
        headers: { Authorization: `Bearer ${token}`, 'x-zerodha-token': token },
        timeout: 8000
      });
      const data = res.data?.data;
      if (data?.goldPrice != null && data?.silverPrice != null) {
        return {
          goldPerGram: Number(data.goldPrice),
          silverPerGram: Number(data.silverPrice),
          source: res.data?.mock ? 'zerodha-mock' : 'zerodha'
        };
      }
    }
  } catch {
    /* fall through */
  }

  const admin = await getAdminMetalRates();
  if (admin) return admin;

  const mock = getMockZerodhaRates();
  return {
    goldPerGram: mock.goldPerGram,
    silverPerGram: mock.silverPerGram,
    source: mock.source
  };
}

module.exports = { getLiveMetalRates, getAdminMetalRates, getZerodhaLiveGoldRate };
