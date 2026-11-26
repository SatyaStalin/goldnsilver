const fs = require('fs');
const path = require('path');
const Order = require('../models/Order');
const Product = require('../models/Product');
const {
  isPhysicalShipmentProduct,
  sanitizeShippingAddress,
  toSequelToAddress
} = require('../utils/physicalGold');
const sequelApi = require('./sequelApi');

async function orderHasPhysicalGold(order) {
  if (!order?.items?.length) return false;
  for (const item of order.items) {
    let product = item.product;
    if (product && typeof product === 'object' && product.metal != null) {
      if (isPhysicalShipmentProduct(product) || isPhysicalShipmentProduct({ metal: item.metal, type: item.type || product.type })) {
        return true;
      }
      continue;
    }
    const id = product?._id || product || item.productId;
    if (!id) continue;
    const doc = await Product.findById(id).select('metal type').lean();
    if (isPhysicalShipmentProduct(doc) || isPhysicalShipmentProduct({ metal: item.metal || doc?.metal, type: item.type || doc?.type })) {
      return true;
    }
  }
  return false;
}

function physicalGoldTotals(order) {
  let netValue = 0;
  let netWeight = 0;
  let qty = 0;
  for (const item of order.items || []) {
    const type = item.type || item.product?.type;
    const metal = item.metal || item.product?.metal;
    if (!isPhysicalShipmentProduct({ metal, type })) continue;
    qty += Number(item.quantity) || 0;
    netValue += (Number(item.price) || 0) * (Number(item.quantity) || 0);
    netWeight += Number(item.metalGrams) || 0;
  }
  return { netValue, netWeight: Math.max(netWeight, 1), qty: Math.max(qty, 1) };
}

function publicSequel(order) {
  const required = Boolean(order.requiresSequelShipment) || Boolean(orderHasPhysicalGoldSync(order));
  const s = order.sequel || {};
  const docketNumber = s.docketNumber || null;
  return {
    required,
    status: docketNumber ? s.status : required ? s.status === 'not_required' ? 'pending' : s.status || 'pending' : 'not_required',
    docketNumber,
    brn: s.brn || null,
    estimatedDelivery: s.estimatedDelivery || null,
    fromStoreCode: s.fromStoreCode || null,
    lastError: s.lastError || null,
    bookedAt: s.bookedAt || null,
    tracking: Array.isArray(s.tracking) ? s.tracking : [],
    shipmentStatus: s.shipmentStatus || null,
    docketPrintUrl: s.docketPrintUrl || null,
    dispatchSaved: Boolean(s.docketPrintFile),
    trackingUrl: sequelApi.trackingUrlFor(docketNumber, s.trackingUrl)
  };
}

function orderHasPhysicalGoldSync(order) {
  return (order?.items || []).some((item) =>
    isPhysicalShipmentProduct({
      metal: item.metal || item.product?.metal,
      type: item.type || item.product?.type
    })
  );
}

async function saveShippingAndEnable(order, shippingAddress) {
  const parsed = sanitizeShippingAddress(shippingAddress || {});
  if (!parsed.valid) {
    const err = new sequelApi.SequelApiError(
      Object.values(parsed.errors)[0] || 'Invalid shipping address',
      'ADDRESS_REQUIRED',
      400
    );
    err.errors = parsed.errors;
    throw err;
  }
  order.shippingAddress = parsed.address;
  order.requiresSequelShipment = true;
  order.sequel = order.sequel || {};
  if (!order.sequel.docketNumber) {
    order.sequel.status = 'pending';
    order.sequel.fromStoreCode =
      order.sequel.fromStoreCode || sequelApi.getSequelConfig().fromStoreCode;
    order.sequel.lastError = null;
  }
  await order.save();
  return order;
}

async function bookShipmentForOrder(order, { force = false } = {}) {
  const cfg = sequelApi.getSequelConfig();
  if (!cfg.configured) {
    throw new sequelApi.SequelApiError(
      'Sequel API token is not configured',
      'SEQUEL_NOT_CONFIGURED',
      503
    );
  }

  const needsShip = order.requiresSequelShipment || (await orderHasPhysicalGold(order));
  if (!needsShip) {
    throw new sequelApi.SequelApiError(
      'This order has no physical bullion items for Sequel shipping',
      'SEQUEL_NOT_REQUIRED',
      400
    );
  }
  if (order.paymentStatus !== 'success' && order.status !== 'paid') {
    throw new sequelApi.SequelApiError('Pay the order before booking Sequel', 'ORDER_NOT_PAID', 400);
  }
  if (order.sequel?.docketNumber && !force) {
    throw new sequelApi.SequelApiError(
      `Shipment already booked (docket ${order.sequel.docketNumber})`,
      'ALREADY_BOOKED',
      409
    );
  }

  const ship = order.shippingAddress || {};
  const toAddress = toSequelToAddress(ship);
  if (!toAddress.pinCode || !toAddress.address_line1 || !toAddress.consignee_name) {
    throw new sequelApi.SequelApiError(
      'Shipping address is missing on this order',
      'ADDRESS_REQUIRED',
      400
    );
  }

  const totals = physicalGoldTotals(order);
  const payload = {
    location: cfg.location,
    shipmentType: cfg.shipmentType,
    serviceType: cfg.serviceType,
    fromStoreCode: cfg.fromStoreCode,
    toAddress,
    net_weight: String(Math.max(1, Math.round(totals.netWeight))),
    gross_weight: String(Math.max(25, Math.round(totals.netWeight + 24))),
    net_value: String(Math.round(totals.netValue)),
    codValue: '',
    no_of_packages: '1'
  };

  const result = await sequelApi.createEcommerceShipment(payload);
  order.requiresSequelShipment = true;
  order.sequel = order.sequel || {};
  order.sequel.fromStoreCode = cfg.fromStoreCode;

  if (!result.success) {
    const inactive = Boolean(result.accountInactive);
    const message = inactive ? sequelApi.inactiveClientMessage() : result.message;
    order.sequel.status = 'failed';
    order.sequel.lastError = message;
    await order.save();
    throw new sequelApi.SequelApiError(
      message,
      inactive ? 'SEQUEL_ACCOUNT_INACTIVE' : 'SEQUEL_BOOK_FAILED',
      inactive ? 503 : 502,
      result.raw
    );
  }

  const parsed = sequelApi.parseShipmentCreateData(result.data || {});
  if (!parsed.docketNumber) {
    order.sequel.status = 'failed';
    order.sequel.lastError = 'Sequel booking succeeded but no docket number was returned';
    await order.save();
    throw new sequelApi.SequelApiError(order.sequel.lastError, 'SEQUEL_BOOK_FAILED', 502, result.raw);
  }

  order.sequel.status = 'booked';
  order.sequel.docketNumber = parsed.docketNumber;
  order.sequel.brn = parsed.brn;
  order.sequel.estimatedDelivery = parsed.estimatedDelivery;
  order.sequel.docketPrintUrl = parsed.docketPrintUrl;
  order.sequel.trackingUrl = parsed.trackingUrl;
  order.sequel.bookedAt = new Date();
  order.sequel.lastError = null;
  if (order.status === 'paid') order.status = 'shipped';
  try {
    await ensureDispatchPdf(order);
  } catch (err) {
    console.error('[sequel] dispatch pdf was not saved:', err.message);
  }
  await order.save();
  return order;
}

const dispatchDir = path.join(__dirname, '../../uploads/sequel-dockets');

function signedUrlExpiryMs(url) {
  try {
    const parsed = new URL(String(url));
    const stamp = parsed.searchParams.get('X-Amz-Date') || '';
    const seconds = Number(parsed.searchParams.get('X-Amz-Expires') || 0);
    if (!/^\d{8}T\d{6}Z$/.test(stamp) || !seconds) return 0;
    const iso = `${stamp.slice(0, 4)}-${stamp.slice(4, 6)}-${stamp.slice(6, 8)}T${stamp.slice(9, 11)}:${stamp.slice(11, 13)}:${stamp.slice(13, 15)}Z`;
    const start = Date.parse(iso);
    if (!Number.isFinite(start)) return 0;
    return start + seconds * 1000;
  } catch {
    return 0;
  }
}

function dispatchPdfPath(orderId) {
  const id = String(orderId || '');
  if (!/^[a-f0-9]{24}$/i.test(id)) {
    throw new sequelApi.SequelApiError('Order not found', 'ORDER_NOT_FOUND', 404);
  }
  return path.join(dispatchDir, `${id}.pdf`);
}

function isPdf(buf) {
  return Buffer.isBuffer(buf) && buf.length > 5 && buf.subarray(0, 5).toString() === '%PDF-';
}

async function readFreshDispatchPdf(url) {
  const raw = String(url || '').trim();
  if (!/^https:\/\//i.test(raw)) {
    throw new sequelApi.SequelApiError(
      'Sequel did not return a dispatch document for this shipment.',
      'NO_DISPATCH',
      404
    );
  }
  const expiry = signedUrlExpiryMs(raw);
  if (expiry && expiry < Date.now() + 15000) {
    throw new sequelApi.SequelApiError(
      'This Sequel dispatch link expired. Sequel keeps that PDF address for about 40 minutes, and this shipment was booked earlier. New bookings keep a copy here. For this docket, print it again from the Sequel portal.',
      'DISPATCH_LINK_EXPIRED',
      410
    );
  }
  let response;
  try {
    response = await fetch(raw);
  } catch {
    throw new sequelApi.SequelApiError(
      'The Sequel dispatch PDF could not be downloaded. Try again in a moment.',
      'DISPATCH_DOWNLOAD_FAILED',
      502
    );
  }
  const buf = Buffer.from(await response.arrayBuffer());
  if (!response.ok || !isPdf(buf) || buf.length > 8 * 1024 * 1024) {
    throw new sequelApi.SequelApiError(
      'Sequel did not return a dispatch PDF. The saved link has expired. New bookings keep a copy here. For this docket, print it again from the Sequel portal.',
      'DISPATCH_LINK_EXPIRED',
      410
    );
  }
  return buf;
}

async function ensureDispatchPdf(order) {
  const filePath = dispatchPdfPath(order?._id);
  if (fs.existsSync(filePath)) {
    const existing = fs.readFileSync(filePath);
    if (isPdf(existing)) return filePath;
  }
  const buf = await readFreshDispatchPdf(order?.sequel?.docketPrintUrl);
  fs.mkdirSync(dispatchDir, { recursive: true });
  fs.writeFileSync(filePath, buf);
  order.sequel = order.sequel || {};
  order.sequel.docketPrintFile = path.basename(filePath);
  return filePath;
}

function trackingEvents(shipment) {
  const raw = shipment?.tracking || shipment?.events || shipment?.history || [];
  const list = Array.isArray(raw) ? raw : [];
  return list
    .map((event) => ({
      code: String(event?.code || event?.status_code || event?.statusCode || '').toUpperCase(),
      description: String(event?.description || event?.status || event?.remark || event?.remarks || ''),
      at: event?.date_time || event?.datetime || event?.date || event?.time || null
    }))
    .sort((a, b) => new Date(a.at || 0) - new Date(b.at || 0));
}

/** Latest Sequel scan wins. An earlier pickup cancel must not hide a later delivery. */
function sequelSignalKind(code, description) {
  const c = String(code || '').toUpperCase();
  const d = String(description || '').toLowerCase();
  if (
    c === 'SDELVD' ||
    c === 'SDELIVERED' ||
    /successfully delivered|shipment delivered|delivered to consignee/.test(d)
  ) {
    return 'delivered';
  }
  if (c === 'SCANCELLED' || c === 'SCANCEL' || /shipment cancelled|pick-?up cancelled/.test(d)) {
    return 'cancelled';
  }
  if (c === 'SCREATED' || c === 'SASSIGNED' || c === 'SASSIGNEDPICKUP') return 'booked';
  if (c || d) return 'in_transit';
  return null;
}

function sequelStatusFromShipment(shipment) {
  const events = trackingEvents(shipment);
  const latest = events.length ? events[events.length - 1] : null;
  const fromLatest = latest ? sequelSignalKind(latest.code, latest.description) : null;
  if (fromLatest) return fromLatest;
  const ship = String(
    shipment?.shipment_status || shipment?.current_status || shipment?.status || ''
  );
  return sequelSignalKind(ship, ship);
}

function applyShipmentToOrder(order, shipment) {
  order.sequel = order.sequel || {};
  if (Array.isArray(shipment?.tracking)) order.sequel.tracking = shipment.tracking;
  const latest = Array.isArray(shipment?.tracking) && shipment.tracking.length
    ? [...shipment.tracking].sort((a, b) => new Date(a?.date_time || 0) - new Date(b?.date_time || 0)).slice(-1)[0]
    : null;
  order.sequel.shipmentStatus =
    shipment?.shipment_status || latest?.code || latest?.description || order.sequel.shipmentStatus || null;
  if (shipment?.estimated_delivery) order.sequel.estimatedDelivery = shipment.estimated_delivery;
  const trackedBrn = shipment?.br_number || shipment?.brn || shipment?.booking_reference_number;
  if (trackedBrn) order.sequel.brn = String(trackedBrn);
  const next = sequelStatusFromShipment(shipment);
  if (next === 'delivered') {
    order.sequel.status = 'delivered';
    if (order.status !== 'failed') order.status = 'delivered';
  } else if (next && order.status !== 'delivered' && order.sequel.status !== 'delivered') {
    order.sequel.status = next;
    if ((next === 'in_transit' || next === 'booked') && (order.status === 'paid' || order.status === 'pending')) {
      order.status = 'shipped';
    }
  }
  order.sequel.lastError = null;
}

async function publicTrackSaysDelivered(docket) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 8000);
  try {
    const res = await fetch(`https://sequel247.com/track/${encodeURIComponent(docket)}`, {
      redirect: 'follow',
      signal: controller.signal,
      headers: { accept: 'text/html' }
    });
    if (!res.ok) return false;
    const text = await res.text();
    const plain = text.replace(/<script[\s\S]*?<\/script>/gi, ' ').replace(/<[^>]+>/g, ' ');
    return /shipment successfully delivered/i.test(plain);
  } catch {
    return false;
  } finally {
    clearTimeout(timer);
  }
}

function shipmentFromStoredTracking(order, delivered) {
  const tracking = Array.isArray(order?.sequel?.tracking) ? [...order.sequel.tracking] : [];
  if (delivered && !tracking.some((event) => String(event?.code || '').toUpperCase() === 'SDELVD')) {
    tracking.push({
      code: 'SDELVD',
      description: 'Shipment successfully delivered',
      date_time: new Date().toISOString()
    });
  }
  return {
    shipment_status: delivered ? 'SDELVD' : order?.sequel?.shipmentStatus || '',
    tracking
  };
}

async function applyBestKnownShipment(order, apiShipment) {
  if (apiShipment && (apiShipment.shipment_status || apiShipment.tracking || apiShipment.current_status)) {
    applyShipmentToOrder(order, apiShipment);
    return order;
  }
  const docket = order?.sequel?.docketNumber;
  const delivered = docket ? await publicTrackSaysDelivered(docket) : false;
  applyShipmentToOrder(order, shipmentFromStoredTracking(order, delivered));
  return order;
}

async function refreshTracking(order) {
  const docket = order.sequel?.docketNumber;
  if (!docket) {
    throw new sequelApi.SequelApiError('No Sequel docket on this order', 'NO_DOCKET', 400);
  }
  const result = await sequelApi.trackDocket(docket);
  if (!result.success && !result.data) {
    await applyBestKnownShipment(order, null);
    await order.save();
    if (order.sequel?.status === 'delivered' || order.status === 'delivered') return order;
    throw new sequelApi.SequelApiError(result.message, 'TRACK_FAILED', 502, result.raw);
  }
  await applyBestKnownShipment(order, result.data || {});
  await order.save();
  return order;
}

const TRACK_SYNC_MS = 10 * 60 * 1000;
const TRACK_BATCH = 20;
let trackSyncTimer = null;
let trackSyncRunning = false;

async function syncOpenSequelShipments() {
  if (trackSyncRunning) return { skipped: true };
  const cfg = sequelApi.getSequelConfig();
  if (!cfg.configured) return { skipped: true, reason: 'not_configured' };

  trackSyncRunning = true;
  try {
    // Closed orders stay out of the job: delivered, completed, cancelled, or failed.
    // Every other order that already has a Sequel docket is checked every run,
    // including ones whose last Sequel scan was a pickup cancel.
    const orders = await Order.find({
      'sequel.docketNumber': { $exists: true, $nin: [null, ''] },
      status: { $nin: ['delivered', 'completed', 'cancelled', 'failed'] }
    });
    const byDocket = new Map();
    for (const order of orders) {
      const docket = String(order.sequel?.docketNumber || '').trim();
      if (!docket) continue;
      if (!byDocket.has(docket)) byDocket.set(docket, []);
      byDocket.get(docket).push(order);
    }
    const dockets = [...byDocket.keys()];
    let updated = 0;
    for (let i = 0; i < dockets.length; i += TRACK_BATCH) {
      const chunk = dockets.slice(i, i + TRACK_BATCH);
      const result = await sequelApi.trackMultiple(chunk);
      if (!result.success && !Object.keys(result.successShipments || {}).length) {
        console.error('[sequel] trackMultiple failed:', result.message);
      }
      for (const docket of chunk) {
        const group = byDocket.get(docket) || [];
        const shipment = result.successShipments?.[docket];
        if (shipment) {
          for (const order of group) {
            applyShipmentToOrder(order, shipment);
            await order.save();
            updated += 1;
          }
          continue;
        }
        const error = result.errorShipments?.[docket];
        for (const order of group) {
          await applyBestKnownShipment(order, null);
          if (order.status !== 'delivered' && order.sequel?.status !== 'delivered' && error) {
            order.sequel = order.sequel || {};
            order.sequel.lastError = String(
              error.docket || error.docketNo || error.message || 'No tracking information'
            );
          }
          await order.save();
          updated += 1;
        }
      }
    }
    if (dockets.length) {
      console.log(`[sequel] tracking sync checked ${dockets.length} dockets, updated ${updated}`);
    }
    return { checked: dockets.length, updated };
  } finally {
    trackSyncRunning = false;
  }
}

function startSequelTrackingSync() {
  if (trackSyncTimer) return;
  const run = () => {
    syncOpenSequelShipments().catch((err) => {
      console.error('[sequel] tracking sync error:', err.message);
    });
  };
  setTimeout(run, 20000);
  trackSyncTimer = setInterval(run, TRACK_SYNC_MS);
  if (typeof trackSyncTimer.unref === 'function') trackSyncTimer.unref();
  console.log('[sequel] tracking sync scheduled every 10 minutes');
}

async function cancelShipment(order, reason) {
  const docket = order.sequel?.docketNumber;
  if (!docket) {
    throw new sequelApi.SequelApiError('No Sequel docket on this order', 'NO_DOCKET', 400);
  }
  const result = await sequelApi.cancelDocket(docket, reason);
  if (!result.success) {
    throw new sequelApi.SequelApiError(result.message, 'CANCEL_FAILED', 502, result.raw);
  }
  order.sequel.status = 'cancelled';
  order.sequel.lastError = null;
  await order.save();
  return order;
}

async function tryAutoBook(order, { force = false } = {}) {
  const cfg = sequelApi.getSequelConfig();
  // Book whenever Sequel is configured, unless explicitly disabled (SEQUEL_AUTO_BOOK=0)
  // and caller did not force (dashboard/order-summary recovery always forces).
  if (!force && cfg.autoBook === false) {
    console.log('[sequel] auto-book skipped (SEQUEL_AUTO_BOOK=0)');
    return order;
  }
  if (!cfg.configured) {
    console.warn('[sequel] auto-book skipped (SEQUEL_API_TOKEN missing)');
    return order;
  }
  if (order.sequel?.docketNumber) return order;
  const needs = order.requiresSequelShipment || (await orderHasPhysicalGold(order));
  if (!needs) return order;
  try {
    console.log('[sequel] auto-book starting for order', String(order._id));
    const booked = await bookShipmentForOrder(order);
    console.log(
      '[sequel] auto-book ok',
      String(order._id),
      booked.sequel?.docketNumber,
      booked.sequel?.trackingUrl
    );
    return booked;
  } catch (err) {
    console.error('[sequel] auto-book failed:', err.message);
    try {
      const latest = await Order.findById(order._id);
      if (latest && !latest.sequel?.docketNumber) {
        latest.sequel = latest.sequel || {};
        latest.sequel.status = latest.sequel.status === 'booked' ? latest.sequel.status : 'failed';
        latest.sequel.lastError = err.message || 'Sequel auto-book failed';
        latest.sequel.fromStoreCode =
          latest.sequel.fromStoreCode || cfg.fromStoreCode;
        await latest.save();
        return latest;
      }
    } catch (saveErr) {
      console.error('[sequel] failed to save auto-book error:', saveErr.message);
    }
    return order;
  }
}

/**
 * Recover missing Sequel dockets for already-paid physical orders.
 * Used by dashboard / order summary so Track links appear even if payment verify missed booking.
 */
async function ensureSequelBooked(orderLike) {
  const id = orderLike?._id || orderLike?.id;
  if (!id) return orderLike;
  if (orderLike?.sequel?.docketNumber) return orderLike;

  const order = await Order.findById(id);
  if (!order) return orderLike;

  const paid =
    order.paymentStatus === 'success' ||
    order.status === 'paid' ||
    order.status === 'shipped' ||
    order.status === 'delivered';
  if (!paid) return order;

  if (order.sequel?.docketNumber) return order;

  const needs = order.requiresSequelShipment || (await orderHasPhysicalGold(order));
  if (!needs) return order;

  return tryAutoBook(order, { force: true });
}

module.exports = {
  orderHasPhysicalGold,
  physicalGoldTotals,
  publicSequel,
  saveShippingAndEnable,
  bookShipmentForOrder,
  ensureDispatchPdf,
  refreshTracking,
  syncOpenSequelShipments,
  startSequelTrackingSync,
  cancelShipment,
  tryAutoBook,
  ensureSequelBooked
};
