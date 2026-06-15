const { getAdminMetalRates } = require('./metalRatesService');

const RATE_VALIDITY_MS = 7 * 60 * 1000;
const MIN_BUY_INR = Number(process.env.SAFEGOLD_MIN_INR) || 10;
const MAX_BUY_INR = Number(process.env.SAFEGOLD_MAX_INR) || 500000;

let cachedBuyPrice = null;

function useMock() {
  if (process.env.SAFEGOLD_USE_MOCK === '1') return true;
  if (process.env.SAFEGOLD_USE_MOCK === '0') return false;
  return !process.env.SAFEGOLD_API_KEY?.trim();
}

function round2(value) {
  return Math.round(Number(value) * 100) / 100;
}

function roundDown(value, decimals) {
  const factor = 10 ** decimals;
  return Math.floor(Number(value) * factor) / factor;
}

function getApiBaseUrl() {
  return (process.env.SAFEGOLD_API_BASE_URL || 'https://api.safegold.com').replace(/\/$/, '');
}

function getAuthHeaders() {
  const apiKey = process.env.SAFEGOLD_API_KEY?.trim();
  if (!apiKey) return {};
  return {
    Authorization: `Bearer ${apiKey}`,
    'Content-Type': 'application/json'
  };
}

async function fetchBuyPrice() {
  const now = Date.now();
  if (cachedBuyPrice && new Date(cachedBuyPrice.expiresAt).getTime() > now) {
    return cachedBuyPrice;
  }

  let priceData;

  if (useMock()) {
    const admin = await getAdminMetalRates();
    const currentPrice = round2(admin?.goldPerGram || 6500);
    const rateId = `mock_${now}`;
    priceData = {
      current_price: currentPrice,
      applicable_tax: 3,
      rate_id: rateId,
      rate_validity: '7 minutes',
      expiresAt: new Date(now + RATE_VALIDITY_MS).toISOString(),
      source: 'mock'
    };
  } else {
    const response = await fetch(`${getApiBaseUrl()}/v1/partners/buy-price`, {
      headers: getAuthHeaders()
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`SafeGold buy-price failed (${response.status}): ${text}`);
    }

    const data = await response.json();
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

function calculateQuote(priceData, mode, value) {
  const currentPrice = round2(priceData.current_price);
  const applicableTax = Number(priceData.applicable_tax) || 3;
  const taxMultiplier = 1 + applicableTax / 100;
  const rateInclGst = round2(currentPrice * taxMultiplier);
  const gstPerGram = round2(currentPrice * (applicableTax / 100));

  let goldAmount;
  let buyPrice;

  if (mode === 'grams') {
    goldAmount = roundDown(value, 4);
    if (goldAmount <= 0) {
      throw new Error('Enter a valid gold amount in grams');
    }
    buyPrice = round2(goldAmount * rateInclGst);
    if (buyPrice < MIN_BUY_INR) {
      throw new Error(`Minimum buy amount is ₹${MIN_BUY_INR}`);
    }
    if (buyPrice > MAX_BUY_INR) {
      throw new Error(`Maximum buy amount is ₹${MAX_BUY_INR.toLocaleString('en-IN')}`);
    }
  } else {
    buyPrice = round2(value);
    if (buyPrice < MIN_BUY_INR) {
      throw new Error(`Minimum buy amount is ₹${MIN_BUY_INR}`);
    }
    if (buyPrice > MAX_BUY_INR) {
      throw new Error(`Maximum buy amount is ₹${MAX_BUY_INR.toLocaleString('en-IN')}`);
    }
    goldAmount = roundDown(buyPrice / rateInclGst, 4);
    if (goldAmount <= 0) {
      throw new Error('Amount is too low for the current gold rate');
    }
  }

  const goldValueExclGst = round2(goldAmount * currentPrice);
  const gstAmount = round2(buyPrice - goldValueExclGst);

  return {
    rateId: String(priceData.rate_id),
    currentPrice,
    applicableTax,
    rateInclGst,
    gstPerGram,
    goldAmount,
    buyPrice,
    gstAmount,
    goldValueExclGst,
    expiresAt: priceData.expiresAt,
    source: priceData.source
  };
}

async function transferGold({ partnerUserId, name, phoneNo, rateId, goldAmount, buyPrice, clientReferenceId }) {
  if (useMock()) {
    return {
      buy_tx_id: `mock_buy_${Date.now()}`,
      transfer_tx_id: `mock_transfer_${Date.now()}`,
      sg_rate: round2(buyPrice / goldAmount),
      customer_user_id: `mock_sg_${partnerUserId}`
    };
  }

  const response = await fetch(
    `${getApiBaseUrl()}/v1/partners/${encodeURIComponent(partnerUserId)}/gold-transfer`,
    {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({
        name,
        phone_no: phoneNo,
        rate_id: String(rateId),
        gold_amount: goldAmount,
        buy_price: buyPrice,
        client_reference_id: clientReferenceId
      })
    }
  );

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const message = data.message || data.error || JSON.stringify(data);
    const err = new Error(message || `SafeGold transfer failed (${response.status})`);
    err.statusCode = response.status;
    err.safegoldError = data;
    throw err;
  }

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

  const response = await fetch(
    `${getApiBaseUrl()}/v1/partners/${encodeURIComponent(clientReferenceId)}/gift-order-status-by-invoice-id`,
    { headers: getAuthHeaders() }
  );

  if (!response.ok) {
    throw new Error(`SafeGold order status failed (${response.status})`);
  }

  return response.json();
}

module.exports = {
  MIN_BUY_INR,
  MAX_BUY_INR,
  useMock,
  fetchBuyPrice,
  calculateQuote,
  transferGold,
  getOrderStatus
};
