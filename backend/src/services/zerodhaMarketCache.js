const fs = require('fs');
const path = require('path');

const cacheFile = path.join(__dirname, '../../data/zerodha-market-cache.json');
const INSTRUMENT_TTL_MS = 30 * 60 * 1000;
const FRESH_QUOTE_MS = 20 * 1000;

let state = null;
let instruments = null;
let instrumentsAt = 0;
let inflight = null;

function readState() {
  if (state) return state;
  try {
    if (fs.existsSync(cacheFile)) {
      state = JSON.parse(fs.readFileSync(cacheFile, 'utf8'));
    }
  } catch {
    state = null;
  }
  if (!state || typeof state !== 'object') {
    state = { quote: null, lastIssue: null };
  }
  return state;
}

function writeState(next) {
  state = next;
  try {
    fs.mkdirSync(path.dirname(cacheFile), { recursive: true });
    const tmp = `${cacheFile}.${process.pid}.tmp`;
    fs.writeFileSync(tmp, JSON.stringify(next));
    fs.renameSync(tmp, cacheFile);
  } catch (err) {
    console.error('[zerodha] market cache write failed:', err.message);
  }
}

function getLastQuote() {
  const quote = readState().quote;
  if (!quote || quote.source !== 'Zerodha API') return null;
  if (quote.goldPrice == null || quote.silverPrice == null) return null;
  return quote;
}

function getLastIssue() {
  return readState().lastIssue || null;
}

function saveLastQuote(data) {
  const prev = readState();
  writeState({
    ...prev,
    quote: {
      ...data,
      source: 'Zerodha API',
      lastUpdated: data.lastUpdated || new Date().toISOString()
    }
  });
}

function clearLastIssue() {
  const prev = readState();
  if (!prev.lastIssue) return;
  writeState({ ...prev, lastIssue: null });
}

function saveLastIssue(message) {
  const text = String(message || 'Zerodha API error').slice(0, 500);
  const prev = readState();
  const issue = { message: text, at: new Date().toISOString() };
  writeState({ ...prev, lastIssue: issue });
  return issue;
}

function isFreshQuote(maxAgeMs = FRESH_QUOTE_MS) {
  const quote = getLastQuote();
  if (!quote?.lastUpdated) return null;
  const age = Date.now() - new Date(quote.lastUpdated).getTime();
  if (!Number.isFinite(age) || age < 0 || age > maxAgeMs) return null;
  return quote;
}

function getCachedInstruments() {
  if (!instruments) return null;
  if (Date.now() - instrumentsAt > INSTRUMENT_TTL_MS) return null;
  return instruments;
}

function setCachedInstruments(list) {
  instruments = list;
  instrumentsAt = Date.now();
}

function runMarketFetch(task) {
  if (inflight) return inflight;
  inflight = Promise.resolve()
    .then(task)
    .finally(() => {
      inflight = null;
    });
  return inflight;
}

module.exports = {
  getLastQuote,
  getLastIssue,
  saveLastQuote,
  saveLastIssue,
  clearLastIssue,
  isFreshQuote,
  getCachedInstruments,
  setCachedInstruments,
  runMarketFetch,
  FRESH_QUOTE_MS
};
