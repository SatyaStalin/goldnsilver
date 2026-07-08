const RATE_VALIDITY_MS = 7 * 60 * 1000;
const {
  isEncryptedEnvelope,
  unwrapSafeGoldResponse,
  wrapEncryptedRequest,
  getAccessToken
} = require('./safegoldCrypto');

class SafeGoldApiError extends Error {
  constructor(message, code = 'SAFEGOLD_ERROR', statusCode = 502, details = null) {
    super(message);
    this.name = 'SafeGoldApiError';
    this.code = code;
    this.statusCode = statusCode;
    this.details = details;
  }
}

function useMock() {
  if (process.env.SAFEGOLD_USE_MOCK === '1') return true;
  if (process.env.SAFEGOLD_USE_MOCK === '0') return false;
  return !process.env.SAFEGOLD_API_KEY?.trim();
}

/** True when SafeGold partner buy-price API should be called. */
function useSafeGoldApi() {
  return Boolean(process.env.SAFEGOLD_API_KEY?.trim()) && process.env.SAFEGOLD_USE_MOCK !== '1';
}

const SAFEGOLD_STAGING = {
  baseUrl: 'https://partners-staging.safegold.com',
  pathPrefix: '/v1/partners'
};

const SAFEGOLD_REQUEST_TIMEOUT_MS =
  Number(process.env.SAFEGOLD_REQUEST_TIMEOUT_MS) || 5000;

/** Used only when SAFEGOLD_ENV=production */
const SAFEGOLD_PRODUCTION_DEFAULT = {
  baseUrl: 'https://api.safegold.com',
  pathPrefix: '/v1/partners'
};

/** Default staging; set SAFEGOLD_ENV=production for live. */
function getSafeGoldMode() {
  const env = (process.env.SAFEGOLD_ENV || '').trim().toLowerCase();
  if (env === 'production' || env === 'prod') return 'production';
  return 'staging';
}

function isSafeGoldStaging() {
  return getSafeGoldMode() === 'staging';
}

function isSafeGoldProduction() {
  return getSafeGoldMode() === 'production';
}

function normalizeBaseUrl(url) {
  let base = (url || '').trim().replace(/\/$/, '');
  base = base.replace(/\/v1\/(users|partners)\/?$/i, '');
  return base;
}

function isLegacyPartnersPath(path) {
  return /\/v1\/partners\b/i.test(path || '');
}

/** In staging mode, ignore PM2/.env overrides that still point at production /v1/partners paths. */
function resolvePathOverride(envValue, stagingDefault) {
  const override = envValue?.trim();
  if (isSafeGoldStaging()) {
    if (override && !isLegacyPartnersPath(override)) {
      return override.startsWith('/') ? override : `/${override}`;
    }
    return stagingDefault;
  }
  return override || stagingDefault;
}

function getApiBaseUrl() {
  if (isSafeGoldProduction()) {
    const fromEnv = process.env.SAFEGOLD_API_BASE_URL?.trim();
    return normalizeBaseUrl(fromEnv || SAFEGOLD_PRODUCTION_DEFAULT.baseUrl);
  }
  return SAFEGOLD_STAGING.baseUrl;
}

function getApiPathPrefix() {
  const fromEnv = process.env.SAFEGOLD_API_PATH_PREFIX?.trim();
  if (fromEnv) {
    return fromEnv.replace(/\/$/, '');
  }
  return isSafeGoldProduction()
    ? SAFEGOLD_PRODUCTION_DEFAULT.pathPrefix
    : SAFEGOLD_STAGING.pathPrefix;
}

function getSafeGoldConfig() {
  const baseUrl = getApiBaseUrl();
  const pathPrefix = getApiPathPrefix();
  const buyPricePath = resolvePathOverride(
    process.env.SAFEGOLD_BUY_PRICE_PATH,
    apiPath('buy-price')
  );
  const mode = getSafeGoldMode();
  return {
    mode,
    baseUrl,
    pathPrefix,
    buyPriceUrl: `${baseUrl}${buyPricePath}`,
    mock: useMock(),
    hasApiKey: Boolean(process.env.SAFEGOLD_API_KEY?.trim()),
    hasEncryptionKey: Boolean(process.env.SAFEGOLD_ENCRYPTION_KEY?.trim()),
    encryptionKeySource: process.env.SAFEGOLD_ENCRYPTION_KEY?.trim()
      ? 'SAFEGOLD_ENCRYPTION_KEY'
      : process.env.SAFEGOLD_API_KEY?.trim()
        ? 'api_key_fallback'
        : 'missing'
  };
}

function apiPath(...segments) {
  const suffix = segments
    .filter(Boolean)
    .map((s) => (s.startsWith('/') ? s : `/${s}`))
    .join('');
  return `${getApiPathPrefix()}${suffix}`;
}

/** Customer user APIs live under /v1/users (registration, balance). */
function usersApiPath(...segments) {
  const suffix = segments
    .filter(Boolean)
    .map((s) => (s.startsWith('/') ? s : `/${s}`))
    .join('');
  return `/v1/users${suffix}`;
}

function defaultPinCode(pinCode) {
  const fromArg = String(pinCode || '').replace(/\D/g, '').slice(0, 6);
  if (fromArg.length === 6) return fromArg;
  const fromEnv = String(process.env.SAFEGOLD_DEFAULT_PIN_CODE || '').replace(/\D/g, '').slice(0, 6);
  return fromEnv.length === 6 ? fromEnv : '400001';
}

function getAuthHeaders() {
  const apiKey = process.env.SAFEGOLD_API_KEY?.trim();
  if (!apiKey) return {};
  return {
    Authorization: `Bearer ${apiKey}`,
    'Content-Type': 'application/json'
  };
}

function buildPath(template, partnerUserId) {
  const path = (template || '').replace(/\{partnerUserId\}/g, encodeURIComponent(partnerUserId));
  return path.startsWith('/') ? path : `/${path}`;
}

async function parseResponse(response) {
  const text = await response.text();
  let data = {};
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = { raw: text };
    }
  }
  return data;
}

async function safeGoldRequest(method, path, body) {
  const baseUrl = getApiBaseUrl();
  const url = `${baseUrl}${path}`;
  const accessToken = getAccessToken();
  const options = {
    method,
    headers: getAuthHeaders(),
    signal: AbortSignal.timeout(SAFEGOLD_REQUEST_TIMEOUT_MS)
  };
  if (body != null) {
    if (accessToken && !useMock()) {
      options.body = JSON.stringify(wrapEncryptedRequest(body, accessToken));
    } else {
      options.body = JSON.stringify(body);
    }
  }

  let response;
  try {
    response = await fetch(url, options);
  } catch (networkErr) {
    const cause =
      networkErr.cause?.code ||
      networkErr.cause?.message ||
      networkErr.message ||
      'network error';
    console.error('[SafeGold] request failed:', method, url, cause);
    throw new SafeGoldApiError(
      `Cannot reach SafeGold API at ${url}. ${cause}. Verify SAFEGOLD_ENV / SAFEGOLD_API_BASE_URL, server outbound HTTPS/firewall, and SafeGold IP whitelist.`,
      'SAFEGOLD_NETWORK_ERROR',
      502,
      { method, path, baseUrl, url, cause: String(cause) }
    );
  }

  const data = unwrapSafeGoldResponse(await parseResponse(response), accessToken);

  if (!response.ok) {
    let message =
      data.message || data.error || data.error_message || `SafeGold API failed (${response.status})`;
    let code = data.code || 'SAFEGOLD_API_ERROR';

    if (response.status === 403) {
      const elbBlock = String(data.raw || '').includes('403 Forbidden');
      message = elbBlock
        ? `SafeGold blocked this server (HTTP 403). Ask SafeGold to whitelist your VPS outbound public IP for ${baseUrl} and confirm your partner API token.`
        : 'SafeGold rejected the request (HTTP 403). Check API key and IP whitelist with SafeGold.';
      code = 'SAFEGOLD_FORBIDDEN';
    } else if (response.status === 401) {
      message = 'SafeGold rejected the API key (HTTP 401). Use the staging partner token from SafeGold, not production.';
      code = 'SAFEGOLD_UNAUTHORIZED';
    }

    const responseHeaders = {};
    response.headers.forEach((value, key) => {
      responseHeaders[key] = value;
    });

    throw new SafeGoldApiError(message, code, response.status, {
      method,
      url,
      status: response.status,
      statusText: response.statusText || '',
      server: responseHeaders.server || undefined,
      responseHeaders,
      responseBody: data
    });
  }

  return data;
}

function round2(value) {
  return Math.round(Number(value) * 100) / 100;
}

function pickField(obj, ...keys) {
  if (!obj || typeof obj !== 'object') return undefined;
  for (const key of keys) {
    const value = obj[key];
    if (value != null && value !== '') return value;
  }
  return undefined;
}

/** Unwrap common SafeGold response envelopes (data/result/etc.). */
function unwrapBuyPricePayload(raw, depth = 0) {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw) || depth > 4) return raw;

  const hasPriceAtTop =
    pickField(raw, 'current_price', 'currentPrice', 'price', 'buy_price', 'buyPrice') != null ||
    pickField(raw, 'rate_id', 'rateId') != null;
  if (hasPriceAtTop) return raw;

  const nested =
    raw.data ??
    raw.result ??
    raw.response ??
    raw.payload ??
    raw.buy_price ??
    raw.buyPrice ??
    raw.price;

  if (nested && typeof nested === 'object' && !Array.isArray(nested)) {
    return unwrapBuyPricePayload(nested, depth + 1);
  }

  return raw;
}

/** Normalize SafeGold buy-price JSON (snake_case, camelCase, or wrapped). */
function normalizeBuyPricePayload(raw) {
  const body = unwrapBuyPricePayload(raw);
  const currentPrice = pickField(
    body,
    'current_price',
    'currentPrice',
    'price',
    'buy_price',
    'buyPrice',
    'gold_rate',
    'goldRate'
  );
  const applicableTax = pickField(body, 'applicable_tax', 'applicableTax', 'tax', 'gst');
  const rateId = pickField(body, 'rate_id', 'rateId', 'id', 'rateID');
  const rateValidity = pickField(body, 'rate_validity', 'rateValidity', 'validity');

  const price = Number(currentPrice);
  if (!Number.isFinite(price) || price <= 0) {
    return null;
  }

  const tax = Number(applicableTax);
  const id = rateId != null ? String(rateId) : '';

  return {
    current_price: round2(price),
    applicable_tax: Number.isFinite(tax) && tax >= 0 ? tax : 3,
    rate_id: id,
    rate_validity: rateValidity || '7 minutes'
  };
}

function parseBuyPriceResponse(raw) {
  const body = unwrapSafeGoldResponse(raw);
  const normalized = normalizeBuyPricePayload(body);
  if (!normalized || !normalized.rate_id) {
    const encrypted = isEncryptedEnvelope(raw);
    console.error(
      '[SafeGold] buy-price parse failed — unexpected response shape:',
      encrypted ? '(encrypted data field)' : JSON.stringify(raw).slice(0, 800)
    );
    throw new SafeGoldApiError(
      encrypted
        ? 'SafeGold returned an encrypted response (`data` field) instead of plain JSON from the integration guide. Set SAFEGOLD_ENCRYPTION_KEY from SafeGold partner docs, or ask SafeGold to enable plain JSON responses for your staging account.'
        : 'SafeGold returned HTTP 200 but buy-price fields were missing or unrecognised. Check the response shape against the partner API docs.',
      encrypted ? 'SAFEGOLD_ENCRYPTED_RESPONSE' : 'SAFEGOLD_PARSE_ERROR',
      502,
      { responseBody: raw, normalized, encrypted }
    );
  }
  return normalized;
}

let cachedBuyPrice = null;

function clearBuyPriceCache() {
  cachedBuyPrice = null;
}

function fetchBuyPriceMock(mockReason) {
  const now = Date.now();
  const defaultPrice = Number(process.env.SAFEGOLD_MOCK_PRICE) || 6500;
  return {
    current_price: round2(defaultPrice),
    applicable_tax: 3,
    rate_id: `mock_${now}`,
    rate_validity: '7 minutes',
    expiresAt: new Date(now + RATE_VALIDITY_MS).toISOString(),
    source: 'safegold-mock',
    mockReason: mockReason || 'SafeGold mock mode'
  };
}

function stagingFallbackToMock() {
  if (process.env.SAFEGOLD_FALLBACK_MOCK_ON_ERROR === '0') return false;
  if (process.env.SAFEGOLD_FALLBACK_MOCK_ON_ERROR === '1') return true;
  // Staging: keep buy-price usable while SafeGold IP whitelist / connectivity is pending.
  return isSafeGoldStaging();
}

async function fetchBuyPrice() {
  const now = Date.now();
  if (cachedBuyPrice && new Date(cachedBuyPrice.expiresAt).getTime() > now) {
    if (Number.isFinite(cachedBuyPrice.current_price) && cachedBuyPrice.current_price > 0) {
      return cachedBuyPrice;
    }
    cachedBuyPrice = null;
  }

  let priceData;

  if (useMock()) {
    const reason =
      process.env.SAFEGOLD_USE_MOCK === '1'
        ? 'SAFEGOLD_USE_MOCK=1'
        : 'SAFEGOLD_API_KEY not set — configure partner API key for live rates';
    priceData = fetchBuyPriceMock(reason);
  } else {
    const buyPricePath = resolvePathOverride(
      process.env.SAFEGOLD_BUY_PRICE_PATH,
      apiPath('buy-price')
    );
    try {
      const data = await safeGoldRequest('GET', buyPricePath);
      const normalized = parseBuyPriceResponse(data);
      priceData = {
        ...normalized,
        expiresAt: new Date(now + RATE_VALIDITY_MS).toISOString(),
        source: 'safegold'
      };
    } catch (err) {
      const fallbackCodes = [
        'SAFEGOLD_FORBIDDEN',
        'SAFEGOLD_NETWORK_ERROR',
        'SAFEGOLD_PARSE_ERROR',
        'SAFEGOLD_ENCRYPTED_RESPONSE'
      ];
      if (
        err instanceof SafeGoldApiError &&
        fallbackCodes.includes(err.code) &&
        stagingFallbackToMock()
      ) {
        console.warn(`[SafeGold] ${err.code} — using mock buy price until SafeGold access is ready`);
        priceData = fetchBuyPriceMock(err.message);
      } else {
        throw err;
      }
    }
  }

  cachedBuyPrice = priceData;
  return priceData;
}

async function registerSafeGoldUser({ name, phoneNo, email, pinCode }) {
  if (useMock()) {
    return {
      customer_user_id: `mock_sg_${phoneNo}`,
      gold_balance: 0,
      status: 'active'
    };
  }

  const registerPath =
    process.env.SAFEGOLD_USERS_REGISTER_PATH?.trim() || usersApiPath('');
  const path = registerPath.endsWith('/') ? registerPath : `${registerPath}/`;

  const payload = {
    name,
    mobile_no: phoneNo,
    pin_code: defaultPinCode(pinCode)
  };
  if (email) payload.email = email;

  const data = await safeGoldRequest('POST', path, payload);

  return {
    customer_user_id: String(data.id ?? data.user_id ?? data.customer_user_id ?? ''),
    gold_balance: Number(data.gold_balance ?? data.balance ?? 0),
    status: 'active',
    raw: data
  };
}

/** @deprecated name kept for callers — registers via POST /v1/users */
async function registerCustomer({ name, phoneNo, email, pinCode }) {
  try {
    return await registerSafeGoldUser({ name, phoneNo, email, pinCode });
  } catch (err) {
    if (err.statusCode === 404 || err.statusCode === 405) {
      err.code = 'REGISTER_PENDING_TRANSFER';
    }
    throw err;
  }
}

async function fetchCustomerBalance(safegoldUserId) {
  if (!safegoldUserId) {
    throw new SafeGoldApiError('SafeGold user ID is required', 'SAFEGOLD_USER_MISSING', 400);
  }

  if (useMock()) {
    return {
      customer_user_id: String(safegoldUserId),
      gold_balance: 0,
      sellable_balance: 0,
      source: 'mock'
    };
  }

  const template =
    process.env.SAFEGOLD_USERS_BALANCE_PATH?.trim() ||
    usersApiPath(`/${encodeURIComponent(safegoldUserId)}`);
  const balancePath = template.includes('{userId}')
    ? template.replace(/\{userId\}/g, encodeURIComponent(safegoldUserId))
    : template;

  const data = await safeGoldRequest('GET', balancePath);

  return {
    customer_user_id: String(data.id ?? data.user_id ?? data.customer_user_id ?? safegoldUserId),
    gold_balance: Number(
      data.gold_balance ?? data.balance ?? data.gold_amount ?? data.holdings ?? 0
    ),
    sellable_balance: Number(
      data.sellable_balance ?? data.gold_balance ?? data.balance ?? 0
    ),
    source: 'safegold',
    raw: data
  };
}

async function fetchCustomerTransactions(partnerUserId, { limit = 20 } = {}) {
  if (useMock()) {
    return [];
  }

  const txPath = resolvePathOverride(
    process.env.SAFEGOLD_TRANSACTIONS_PATH,
    apiPath('{partnerUserId}/transactions')
  );

  const query = limit ? `?limit=${Math.min(limit, 50)}` : '';
  const data = await safeGoldRequest('GET', `${buildPath(txPath, partnerUserId)}${query}`);

  const list = Array.isArray(data)
    ? data
    : data.transactions || data.data || data.items || [];

  return list.map((tx) => ({
    safegoldTxId: String(tx.buy_tx_id || tx.transfer_tx_id || tx.tx_id || tx.id || ''),
    type: tx.type || tx.transaction_type || 'buy',
    goldAmount: Number(tx.gold_amount ?? tx.gold_weight ?? tx.grams ?? 0),
    buyPrice: Number(tx.buy_price ?? tx.amount ?? tx.transaction_price ?? 0),
    status: tx.status ?? 'success',
    createdAt: tx.created_at || tx.date || null,
    clientReferenceId: tx.client_reference_id || null
  }));
}

async function transferGold({
  partnerUserId,
  name,
  phoneNo,
  rateId,
  goldAmount,
  buyPrice,
  clientReferenceId
}) {
  if (useMock()) {
    return {
      buy_tx_id: `mock_buy_${Date.now()}`,
      transfer_tx_id: `mock_transfer_${Date.now()}`,
      sg_rate: round2(buyPrice / goldAmount),
      customer_user_id: `mock_sg_${partnerUserId}`
    };
  }

  const data = await safeGoldRequest(
    'POST',
    apiPath(`${encodeURIComponent(partnerUserId)}/gold-transfer`),
    {
      name,
      phone_no: phoneNo,
      rate_id: String(rateId),
      gold_amount: goldAmount,
      buy_price: buyPrice,
      client_reference_id: clientReferenceId
    }
  );

  return {
    buy_tx_id: data.buy_tx_id,
    transfer_tx_id: data.transfer_tx_id,
    sg_rate: data.sg_rate,
    customer_user_id: data.customer_user_id
  };
}

async function getOrderStatus(clientReferenceId) {
  if (useMock()) {
    return { status: 1, created_at: new Date().toISOString() };
  }

  return safeGoldRequest(
    'GET',
    apiPath(
      `${encodeURIComponent(clientReferenceId)}/gift-order-status-by-invoice-id`
    )
  );
}

/**
 * Live connectivity check against SafeGold buy-price.
 * Never falls back to mock — surfaces the real result/error so the UI can show it clearly.
 */
async function testConnection() {
  const config = getSafeGoldConfig();
  const buyPricePath = resolvePathOverride(
    process.env.SAFEGOLD_BUY_PRICE_PATH,
    apiPath('buy-price')
  );

  if (config.mock) {
    return {
      ok: false,
      tested: false,
      config,
      message:
        process.env.SAFEGOLD_USE_MOCK === '1'
          ? 'Mock mode is ON (SAFEGOLD_USE_MOCK=1). Set it to 0 to test the live SafeGold connection.'
          : 'No SafeGold API key configured. Set SAFEGOLD_API_KEY to test the live connection.',
      code: 'SAFEGOLD_MOCK_MODE'
    };
  }

  const startedAt = Date.now();
  try {
    const data = await safeGoldRequest('GET', buyPricePath);

    if (isEncryptedEnvelope(data)) {
      return {
        ok: false,
        tested: true,
        config,
        latencyMs: Date.now() - startedAt,
        message:
          'SafeGold returned an encrypted `data` field instead of the plain JSON shown in the integration guide.',
        reason:
          'Your integration guide shows `{ current_price, rate_id, ... }` directly, but staging returns `{ "data": "<encrypted>" }`. Ask SafeGold for the decryption key/algorithm (set SAFEGOLD_ENCRYPTION_KEY) or request plain JSON responses for your partner account.',
        code: 'SAFEGOLD_ENCRYPTED_RESPONSE',
        statusCode: 200,
        request: {
          method: 'GET',
          url: config.buyPriceUrl,
          authorization: config.hasApiKey ? 'Bearer ***** (configured)' : 'missing',
          timeoutMs: SAFEGOLD_REQUEST_TIMEOUT_MS
        },
        response: {
          status: 200,
          body: data
        },
        details: { responseBody: data, encrypted: true }
      };
    }

    const normalized = normalizeBuyPricePayload(data);
    if (!normalized || !normalized.rate_id) {
      return {
        ok: false,
        tested: true,
        config,
        latencyMs: Date.now() - startedAt,
        message:
          'SafeGold returned HTTP 200 but buy-price fields were missing or unrecognised. The response shape may differ from the integration guide.',
        reason:
          'The API call succeeded at the network level, but current_price / rate_id could not be read from the JSON body. See the raw response below and share it with SafeGold if the field names differ.',
        code: 'SAFEGOLD_PARSE_ERROR',
        statusCode: 200,
        request: {
          method: 'GET',
          url: config.buyPriceUrl,
          authorization: config.hasApiKey ? 'Bearer ***** (configured)' : 'missing',
          timeoutMs: SAFEGOLD_REQUEST_TIMEOUT_MS
        },
        response: {
          status: 200,
          body: data
        },
        details: { responseBody: data }
      };
    }
    return {
      ok: true,
      tested: true,
      config,
      latencyMs: Date.now() - startedAt,
      message: 'SafeGold connection successful — live buy price received.',
      sample: normalized,
      response: {
        status: 200,
        body: data
      }
    };
  } catch (err) {
    if (err instanceof SafeGoldApiError) {
      return {
        ok: false,
        tested: true,
        config,
        latencyMs: Date.now() - startedAt,
        message: err.message,
        reason: describeSafeGoldFailure(err.code, err.details),
        code: err.code,
        statusCode: err.statusCode,
        request: {
          method: 'GET',
          url: err.details?.url || config.buyPriceUrl,
          authorization: config.hasApiKey ? 'Bearer ***** (configured)' : 'missing',
          timeoutMs: SAFEGOLD_REQUEST_TIMEOUT_MS
        },
        response: err.details?.status
          ? {
              status: err.details.status,
              statusText: err.details.statusText,
              server: err.details.server,
              headers: err.details.responseHeaders,
              body: err.details.responseBody
            }
          : undefined,
        details: err.details || undefined
      };
    }
    return {
      ok: false,
      tested: true,
      config,
      latencyMs: Date.now() - startedAt,
      message: err.message || 'Unexpected error testing SafeGold connection.',
      reason: 'An unexpected error occurred before a response was received.',
      code: 'SAFEGOLD_UNKNOWN_ERROR'
    };
  }
}

function describeSafeGoldFailure(code, details) {
  switch (code) {
    case 'SAFEGOLD_FORBIDDEN':
      return `SafeGold's load balancer (${details?.server || 'awselb'}) returned 403 Forbidden. This almost always means the server's outbound public IP is not whitelisted by SafeGold for this host, or the partner API token is invalid/for the wrong environment.`;
    case 'SAFEGOLD_UNAUTHORIZED':
      return 'SafeGold rejected the API key (401 Unauthorized). The token is missing, expired, or belongs to a different environment (e.g. production token used against staging).';
    case 'SAFEGOLD_NETWORK_ERROR':
      return `The server could not establish a connection to SafeGold (${details?.cause || 'network error'}). This is a connectivity issue: DNS, outbound HTTPS/firewall, timeout, or a wrong base URL — not an authentication problem.`;
    case 'SAFEGOLD_API_ERROR':
      return `SafeGold returned an error response (HTTP ${details?.status || '?'}). See the response body below for the exact reason from SafeGold.`;
    case 'SAFEGOLD_PARSE_ERROR':
      return 'SafeGold returned HTTP 200 but the buy-price JSON could not be parsed (missing current_price or rate_id). Share the raw response body with SafeGold support — the field names may differ from the integration guide.';
    case 'SAFEGOLD_ENCRYPTED_RESPONSE':
      return 'SafeGold returned `{ "data": "<encrypted base64>" }` instead of plain `{ current_price, rate_id, ... }` from the integration guide. You need the partner decryption key from SafeGold (SAFEGOLD_ENCRYPTION_KEY) or ask them to enable unencrypted responses for your account.';
    default:
      return 'See the message and technical details below for the exact reason.';
  }
}

module.exports = {
  SafeGoldApiError,
  useMock,
  useSafeGoldApi,
  getSafeGoldConfig,
  fetchBuyPrice,
  clearBuyPriceCache,
  registerCustomer,
  registerSafeGoldUser,
  fetchCustomerBalance,
  fetchCustomerTransactions,
  transferGold,
  getOrderStatus,
  testConnection
};
