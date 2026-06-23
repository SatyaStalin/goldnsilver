const RATE_VALIDITY_MS = 7 * 60 * 1000;

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

function getApiBaseUrl() {
  return (
    process.env.SAFEGOLD_API_BASE_URL || 'https://partners-staging.safegold.com'
  ).replace(/\/$/, '');
}

/** Staging uses /v1/users; production partner API uses /v1/partners. */
function getApiPathPrefix() {
  return (process.env.SAFEGOLD_API_PATH_PREFIX || '/v1/users').replace(/\/$/, '');
}

function apiPath(...segments) {
  const suffix = segments
    .filter(Boolean)
    .map((s) => (s.startsWith('/') ? s : `/${s}`))
    .join('');
  return `${getApiPathPrefix()}${suffix}`;
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
  const options = {
    method,
    headers: getAuthHeaders()
  };
  if (body != null) {
    options.body = JSON.stringify(body);
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
      `Cannot reach SafeGold API at ${baseUrl}. ${cause}. Verify SAFEGOLD_API_BASE_URL, server outbound HTTPS/firewall, and SafeGold IP whitelist.`,
      'SAFEGOLD_NETWORK_ERROR',
      502,
      { method, path, baseUrl, cause: String(cause) }
    );
  }

  const data = await parseResponse(response);

  if (!response.ok) {
    const message =
      data.message || data.error || data.error_message || `SafeGold API failed (${response.status})`;
    throw new SafeGoldApiError(message, data.code || 'SAFEGOLD_API_ERROR', response.status, data);
  }

  return data;
}

function round2(value) {
  return Math.round(Number(value) * 100) / 100;
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

async function fetchBuyPrice() {
  const now = Date.now();
  if (cachedBuyPrice && new Date(cachedBuyPrice.expiresAt).getTime() > now) {
    return cachedBuyPrice;
  }

  let priceData;

  if (useMock()) {
    const reason =
      process.env.SAFEGOLD_USE_MOCK === '1'
        ? 'SAFEGOLD_USE_MOCK=1'
        : 'SAFEGOLD_API_KEY not set — configure partner API key for live rates';
    priceData = fetchBuyPriceMock(reason);
  } else {
    const buyPricePath = process.env.SAFEGOLD_BUY_PRICE_PATH || apiPath('buy-price');
    const data = await safeGoldRequest('GET', buyPricePath);
    priceData = {
      current_price: round2(data.current_price),
      applicable_tax: Number(data.applicable_tax) || 3,
      rate_id: String(data.rate_id),
      rate_validity: data.rate_validity || '7 minutes',
      expiresAt: new Date(now + RATE_VALIDITY_MS).toISOString(),
      source: 'safegold'
    };
  }

  cachedBuyPrice = priceData;
  return priceData;
}

async function registerCustomer({ partnerUserId, name, phoneNo }) {
  if (useMock()) {
    return {
      customer_user_id: `mock_sg_${partnerUserId}`,
      gold_balance: 0,
      status: 'active'
    };
  }

  const registerPath =
    process.env.SAFEGOLD_REGISTER_PATH ||
    apiPath('{partnerUserId}/register');

  try {
    const data = await safeGoldRequest(
      'POST',
      buildPath(registerPath, partnerUserId),
      { name, phone_no: phoneNo }
    );
    return {
      customer_user_id: String(data.customer_user_id || data.user_id || data.id || ''),
      gold_balance: Number(data.gold_balance ?? data.balance ?? 0),
      status: 'active'
    };
  } catch (err) {
    if (err.statusCode === 404 || err.statusCode === 405) {
      const balance = await fetchCustomerBalance(partnerUserId).catch(() => null);
      if (balance?.customer_user_id) {
        return {
          customer_user_id: balance.customer_user_id,
          gold_balance: balance.gold_balance,
          status: 'active'
        };
      }
      err.code = 'REGISTER_PENDING_TRANSFER';
      throw err;
    }
    throw err;
  }
}

async function fetchCustomerBalance(partnerUserId) {
  if (useMock()) {
    return {
      customer_user_id: `mock_sg_${partnerUserId}`,
      gold_balance: 0,
      source: 'mock'
    };
  }

  const balancePath =
    process.env.SAFEGOLD_BALANCE_PATH ||
    apiPath('{partnerUserId}/gold-balance');

  const data = await safeGoldRequest('GET', buildPath(balancePath, partnerUserId));

  return {
    customer_user_id: String(
      data.customer_user_id || data.user_id || data.safegold_user_id || ''
    ),
    gold_balance: Number(
      data.gold_balance ?? data.balance ?? data.gold_amount ?? data.holdings ?? 0
    ),
    source: 'safegold'
  };
}

async function fetchCustomerTransactions(partnerUserId, { limit = 20 } = {}) {
  if (useMock()) {
    return [];
  }

  const txPath =
    process.env.SAFEGOLD_TRANSACTIONS_PATH ||
    apiPath('{partnerUserId}/transactions');

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

module.exports = {
  SafeGoldApiError,
  useMock,
  useSafeGoldApi,
  fetchBuyPrice,
  clearBuyPriceCache,
  registerCustomer,
  fetchCustomerBalance,
  fetchCustomerTransactions,
  transferGold,
  getOrderStatus
};
