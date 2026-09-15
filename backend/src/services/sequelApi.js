const SEQUEL_REQUEST_TIMEOUT_MS = Number(process.env.SEQUEL_REQUEST_TIMEOUT_MS) || 15000;

function getSequelConfig() {
  const baseUrl = String(process.env.SEQUEL_BASE_URL || 'https://test.sequel247.com')
    .trim()
    .replace(/\/$/, '');
  const token = String(process.env.SEQUEL_API_TOKEN || '').trim();
  const fromStoreCode = String(process.env.SEQUEL_FROM_STORE_CODE || 'HYDNIG').trim();
  const clientCode = String(process.env.SEQUEL_CLIENT_CODE || '31085').trim();
  const enabled = process.env.SEQUEL_ENABLED === '1' || Boolean(token);
  return {
    baseUrl,
    token,
    fromStoreCode,
    clientCode,
    originPincode: String(process.env.SEQUEL_ORIGIN_PINCODE || '').replace(/\D/g, ''),
    location: String(process.env.SEQUEL_LOCATION || 'domestic').trim(),
    shipmentType: String(process.env.SEQUEL_SHIPMENT_TYPE || 'D&J').trim(),
    serviceType: String(process.env.SEQUEL_SERVICE_TYPE || 'valuable').trim(),
    pickupDate: String(process.env.SEQUEL_PICKUP_DATE || 'Tomorrow').trim(),
    pickupTime: String(process.env.SEQUEL_PICKUP_TIME || '9:00-10:00').trim(),
    autoBook: process.env.SEQUEL_AUTO_BOOK === '1',
    enabled,
    configured: Boolean(token)
  };
}

class SequelApiError extends Error {
  constructor(message, code = 'SEQUEL_ERROR', statusCode = 502, details = null) {
    super(message);
    this.name = 'SequelApiError';
    this.code = code;
    this.statusCode = statusCode;
    this.details = details;
  }
}

function isSequelSuccess(body) {
  if (!body || typeof body !== 'object') return false;
  const status = body.status;
  return status === true || status === 'true' || status === 1 || status === '1';
}

function sequelMessage(body, fallback = 'Sequel request failed') {
  if (!body) return fallback;
  if (typeof body.message === 'string' && body.message.trim()) return body.message.trim();
  if (body.errorInfo && typeof body.errorInfo === 'object' && !Array.isArray(body.errorInfo)) {
    const first = Object.values(body.errorInfo).find(Boolean);
    if (first) return String(first);
  }
  return fallback;
}

async function sequelPost(path, payload) {
  const cfg = getSequelConfig();
  if (!cfg.token) {
    throw new SequelApiError(
      'Sequel API token is not configured. Set SEQUEL_API_TOKEN in backend/.env.',
      'SEQUEL_NOT_CONFIGURED',
      503
    );
  }

  const url = `${cfg.baseUrl}${path.startsWith('/') ? path : `/${path}`}`;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), SEQUEL_REQUEST_TIMEOUT_MS);

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ token: cfg.token, ...payload }),
      signal: controller.signal
    });
    const text = await res.text();
    let body = null;
    try {
      body = text ? JSON.parse(text) : null;
    } catch {
      body = { raw: text };
    }
    return { ok: res.ok, statusCode: res.status, body };
  } catch (err) {
    if (err.name === 'AbortError') {
      throw new SequelApiError('Sequel API timed out', 'SEQUEL_TIMEOUT', 504);
    }
    throw new SequelApiError(err.message || 'Sequel API unreachable', 'SEQUEL_NETWORK', 502);
  } finally {
    clearTimeout(timer);
  }
}

async function checkServiceability(pinCode) {
  const { body } = await sequelPost('/api/checkServiceability', { pin_code: String(pinCode) });
  return { success: isSequelSuccess(body), message: sequelMessage(body), data: body?.data || null, raw: body };
}

async function calculateEdd({ originPincode, destinationPincode, pickupDate }) {
  const cfg = getSequelConfig();
  const origin = originPincode || cfg.originPincode;
  if (!origin) {
    return { success: false, message: 'Origin pincode is not configured', data: null };
  }
  const { body } = await sequelPost('/api/shipment/calculateEDD', {
    origin_pincode: String(origin),
    destination_pincode: String(destinationPincode),
    pickup_date: pickupDate || new Date().toISOString().slice(2, 10).split('-').reverse().join('-')
  });
  return { success: isSequelSuccess(body), message: sequelMessage(body), data: body?.data || null, raw: body };
}

async function createEcommerceShipment(payload) {
  const { body, statusCode } = await sequelPost('/api/shipment/create', payload);
  return {
    success: isSequelSuccess(body),
    message: sequelMessage(body, 'Shipment booking failed'),
    data: body?.data || null,
    statusCode,
    raw: body
  };
}

async function trackDocket(docket) {
  const { body } = await sequelPost('/api/track', { docket: String(docket) });
  return { success: isSequelSuccess(body), message: sequelMessage(body), data: body?.data || null, raw: body };
}

async function cancelDocket(docket, cancelReason) {
  const { body } = await sequelPost('/api/cancel', {
    docket: String(docket),
    cancelReason: cancelReason || 'Cancelled by merchant'
  });
  return { success: isSequelSuccess(body), message: sequelMessage(body), raw: body };
}

async function createAddress(payload) {
  const { body } = await sequelPost('/api/create_address', payload);
  return { success: isSequelSuccess(body), message: sequelMessage(body), raw: body };
}

async function searchAddress(keyword) {
  const { body } = await sequelPost('/api/search_address', { keyword: String(keyword || '') });
  return {
    success: isSequelSuccess(body),
    message: sequelMessage(body),
    addresses: body?.addresses || body?.data || [],
    raw: body
  };
}

async function downloadPod({ dockets, fromDate, toDate, requestType = 'docket' }) {
  const { body } = await sequelPost('/api/podDownload', {
    requestType,
    dockets: Array.isArray(dockets) ? dockets : [dockets],
    fromDate,
    toDate
  });
  return { success: isSequelSuccess(body), message: sequelMessage(body), link: body?.link || null, raw: body };
}

module.exports = {
  getSequelConfig,
  SequelApiError,
  isSequelSuccess,
  sequelMessage,
  checkServiceability,
  calculateEdd,
  createEcommerceShipment,
  trackDocket,
  cancelDocket,
  createAddress,
  searchAddress,
  downloadPod
};
