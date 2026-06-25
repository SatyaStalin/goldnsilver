/** In-memory ETF quote cache — shared for all visitors (not per-browser). */
const ETF_CACHE_TTL_MS = Number(process.env.ZERODHA_ETF_CACHE_TTL_MS) || 60 * 1000;

let cachedPayload = null;
let cachedAt = 0;

function getCachedEtfs() {
  if (!cachedPayload) return null;
  if (Date.now() - cachedAt > ETF_CACHE_TTL_MS) {
    cachedPayload = null;
    cachedAt = 0;
    return null;
  }
  return cachedPayload;
}

function setCachedEtfs(payload) {
  cachedPayload = payload;
  cachedAt = Date.now();
}

function clearEtfCache() {
  cachedPayload = null;
  cachedAt = 0;
}

module.exports = { getCachedEtfs, setCachedEtfs, clearEtfCache, ETF_CACHE_TTL_MS };
