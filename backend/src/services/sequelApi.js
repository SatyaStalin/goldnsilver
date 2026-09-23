const SEQUEL_REQUEST_TIMEOUT_MS = Number(process.env.SEQUEL_REQUEST_TIMEOUT_MS) || 15000;
const SEQUEL_INACTIVE_CACHE_MS = Number(process.env.SEQUEL_INACTIVE_CACHE_MS) || 10 * 60 * 1000;

let inactiveCache = { until: 0, message: '' };

function sequelModeFromBaseUrl(baseUrl) {
  return /test\.sequel247\.com/i.test(baseUrl) ? 'uat' : 'production';
}

/** Sequel expects zero-padded slots like 09:00-10:00 (9:00-10:00 is rejected). */
function normalizePickupTime(value) {
  const raw = String(value || '09:00-10:00').trim();
  const m = raw.match(/^(\d{1,2}):(\d{2})\s*-\s*(\d{1,2}):(\d{2})$/);
  if (!m) return '09:00-10:00';
  const a = `${String(Number(m[1])).padStart(2, '0')}:${m[2]}`;
  const b = `${String(Number(m[3])).padStart(2, '0')}:${m[4]}`;
  return `${a}-${b}`;
}

function getSequelConfig() {
  const baseUrl = String(process.env.SEQUEL_BASE_URL || 'https://test.sequel247.com')
    .trim()
    .replace(/\/$/, '');
  const token = String(process.env.SEQUEL_API_TOKEN || '').trim();
  const fromStoreCode = String(process.env.SEQUEL_FROM_STORE_CODE || 'HYDNIG').trim();
  const clientCode = String(process.env.SEQUEL_CLIENT_CODE || '31085').trim();
  const enabled = process.env.SEQUEL_ENABLED === '1' || Boolean(token);
  const mode = sequelModeFromBaseUrl(baseUrl);
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
    pickupTime: normalizePickupTime(
      process.env.SEQUEL_PICKUP_TIME || '09:00-10:00'
    ),
    // Default ON when Sequel is configured; set SEQUEL_AUTO_BOOK=0 to require manual admin booking
    autoBook: process.env.SEQUEL_AUTO_BOOK !== '0',
    enabled,
    configured: Boolean(token),
    mode
  };
}

function publicSequelConfig() {
  const cfg = getSequelConfig();
  return {
    enabled: cfg.enabled,
    configured: cfg.configured,
    mode: cfg.mode,
    fromStoreCode: cfg.fromStoreCode,
    clientCode: cfg.clientCode,
    originPincodeSet: Boolean(cfg.originPincode),
    autoBook: cfg.autoBook
  };
}

function inactiveClientMessage() {
  const cfg = getSequelConfig();
  if (cfg.mode === 'uat') {
    return `Sequel UAT (test server) is connected with warehouse ${cfg.fromStoreCode}. Sequel has not activated this test company yet. Checkout can continue; shipment booking will work after they activate client access. Stay on the test API until UAT succeeds, then switch the base URL and token to production.`;
  }
  return `Sequel company is not active. Warehouse ${cfg.fromStoreCode} is configured. Contact Sequel to activate client access.`;
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

function isSequelAccountInactive(body) {
  const msg = sequelMessage(body, '');
  return /company status not active/i.test(msg);
}

function noteAccountInactive(message) {
  inactiveCache = {
    until: Date.now() + SEQUEL_INACTIVE_CACHE_MS,
    message: message || inactiveClientMessage()
  };
}

function cachedAccountInactive() {
  if (Date.now() < inactiveCache.until) {
    return inactiveCache;
  }
  return null;
}

function sequelResult(body, fallbackMessage) {
  const inactive = isSequelAccountInactive(body);
  if (inactive) noteAccountInactive(sequelMessage(body, fallbackMessage));
  return {
    success: isSequelSuccess(body),
    message: inactive ? inactiveClientMessage() : sequelMessage(body, fallbackMessage),
    data: body?.data || null,
    raw: body,
    sequelCode: body?.code ?? null,
    accountInactive: inactive,
    code: inactive ? 'SEQUEL_ACCOUNT_INACTIVE' : undefined
  };
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
  const cached = cachedAccountInactive();
  if (cached) {
    return {
      success: false,
      message: inactiveClientMessage(),
      data: null,
      raw: null,
      sequelCode: 103,
      accountInactive: true,
      code: 'SEQUEL_ACCOUNT_INACTIVE'
    };
  }
  const { body } = await sequelPost('/api/checkServiceability', { pin_code: String(pinCode) });
  return sequelResult(body, 'Pincode check failed');
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

function trackingUrlFor(docket, provided) {
  if (provided) return String(provided);
  if (!docket) return null;
  return `${getSequelConfig().baseUrl}/track/${encodeURIComponent(docket)}`;
}

function parseShipmentCreateData(data) {
  if (!data || typeof data !== 'object') {
    return {
      docketNumber: null,
      brn: null,
      estimatedDelivery: null,
      docketPrintUrl: null,
      trackingUrl: null,
      receiverStoreCode: null
    };
  }
  const docketNumber =
    data.docket_number || data.docketNumber || data.docket_no || null;
  const trackingUrl = trackingUrlFor(
    docketNumber,
    data.tracking_link || data.trackingLink || data.tracking_url
  );
  return {
    docketNumber: docketNumber ? String(docketNumber) : null,
    brn: data.brn || null,
    estimatedDelivery:
      data.estiimated_delivery ||
      data.estimated_delivery ||
      data.estimatedDelivery ||
      null,
    docketPrintUrl: data.docket_print || data.docketPrint || null,
    trackingUrl,
    receiverStoreCode: data.receiver_store_code || data.receiverStoreCode || null
  };
}

async function createEcommerceShipment(payload) {
  const cfg = getSequelConfig();
  const to = payload.toAddress || {};
  // Exact keys Sequel's working ecommerce create sample uses — extra fields
  // (invoice, pickUpDate, remark) made their portal store store-code + "undefined".
  const bodyPayload = {
    location: payload.location || cfg.location,
    shipmentType: payload.shipmentType || cfg.shipmentType,
    serviceType: payload.serviceType || cfg.serviceType,
    fromStoreCode: payload.fromStoreCode || cfg.fromStoreCode,
    toAddress: {
      consignee_name: String(to.consignee_name || ''),
      address_line1: String(to.address_line1 || ''),
      address_line2: String(to.address_line2 || ''),
      pinCode: String(to.pinCode || ''),
      auth_receiver_name: String(to.auth_receiver_name || ''),
      auth_receiver_phone: String(to.auth_receiver_phone || '')
    },
    net_weight: String(payload.net_weight ?? ''),
    gross_weight: String(payload.gross_weight ?? ''),
    net_value: String(payload.net_value ?? ''),
    codValue:
      payload.codValue === undefined || payload.codValue === null ? '' : String(payload.codValue),
    no_of_packages: String(payload.no_of_packages ?? '1')
  };
  console.log('[sequel] shipment/create toAddress', JSON.stringify(bodyPayload.toAddress));
  const { body, statusCode } = await sequelPost('/api/shipment/create', bodyPayload);
  return { ...sequelResult(body, 'Shipment booking failed'), statusCode };
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
  return sequelResult(body, 'Create address failed');
}

async function searchAddress(keyword) {
  const { body } = await sequelPost('/api/search_address', { keyword: String(keyword || '') });
  return {
    ...sequelResult(body, 'Address search failed'),
    addresses: body?.addresses || body?.data || []
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
  publicSequelConfig,
  inactiveClientMessage,
  SequelApiError,
  isSequelSuccess,
  sequelMessage,
  isSequelAccountInactive,
  sequelResult,
  parseShipmentCreateData,
  trackingUrlFor,
  checkServiceability,
  calculateEdd,
  createEcommerceShipment,
  trackDocket,
  cancelDocket,
  createAddress,
  searchAddress,
  downloadPod
};
