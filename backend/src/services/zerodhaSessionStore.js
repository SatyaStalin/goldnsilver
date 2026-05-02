const fs = require('fs');
const path = require('path');
const { KiteConnect } = require('kiteconnect');

const defaultFile = path.join(__dirname, '../../data/zerodha-session.json');

const getSessionPath = () => process.env.ZERODHA_SESSION_FILE || defaultFile;

const readSession = () => {
  try {
    const p = getSessionPath();
    if (!fs.existsSync(p)) return null;
    return JSON.parse(fs.readFileSync(p, 'utf8'));
  } catch {
    return null;
  }
};

const writeSession = (obj) => {
  const p = getSessionPath();
  fs.mkdirSync(path.dirname(p), { recursive: true });
  const tmp = `${p}.${process.pid}.tmp`;
  fs.writeFileSync(
    tmp,
    JSON.stringify(
      {
        ...obj,
        saved_at: new Date().toISOString()
      },
      null,
      0
    ),
    'utf8'
  );
  fs.renameSync(tmp, p);
};

const getPersistedAccessToken = () => {
  const s = readSession();
  const t = s?.access_token;
  return typeof t === 'string' ? t.trim() : '';
};

const getRefreshToken = () => {
  const s = readSession();
  const t = s?.refresh_token;
  return typeof t === 'string' ? t.trim() : '';
};

/**
 * Persists access + refresh from Kite session/token or generateSession response.
 * @param {{ access_token?: string, refresh_token?: string }} data
 */
const mergeAndSaveSession = (data) => {
  const prev = readSession() || {};
  const access_token =
    (typeof data.access_token === 'string' && data.access_token.trim()) ||
    prev.access_token;
  const refresh_token =
    (typeof data.refresh_token === 'string' && data.refresh_token.trim()) ||
    prev.refresh_token;
  if (!access_token) return;
  writeSession({
    ...prev,
    access_token,
    refresh_token: refresh_token || undefined
  });
};

/**
 * Uses Kite refresh_token (when present) to obtain a new access_token and saves it.
 * @returns {Promise<string|null>} new access_token or null
 */
const renewPersistedSession = async (apiKey, apiSecret) => {
  const refresh_token = getRefreshToken();
  if (!refresh_token || !apiKey || !apiSecret) return null;
  const kc = new KiteConnect({ api_key: apiKey });
  try {
    const out = await kc.renewAccessToken(refresh_token, apiSecret);
    const access_token = out?.access_token ?? out?.data?.access_token;
    const next_refresh = out?.refresh_token ?? out?.data?.refresh_token;
    const prev = readSession() || {};
    writeSession({
      ...prev,
      access_token,
      refresh_token: next_refresh || prev.refresh_token || refresh_token
    });
    return access_token || null;
  } catch (e) {
    console.warn('[zerodha] renewAccessToken failed:', e?.message || e);
    return null;
  }
};

module.exports = {
  getSessionPath,
  readSession,
  writeSession,
  getPersistedAccessToken,
  getRefreshToken,
  mergeAndSaveSession,
  renewPersistedSession
};
