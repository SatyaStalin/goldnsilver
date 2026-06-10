const MetalRateSettings = require('../models/MetalRateSettings');

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

module.exports = { getLiveMetalRates, getAdminMetalRates };
