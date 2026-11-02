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
  await order.save();
  return order;
}

function sequelStatusFromShipment(shipment) {
  const events = Array.isArray(shipment?.tracking) ? shipment.tracking : [];
  const codes = events.map((event) => String(event?.code || '').toUpperCase());
  const descriptions = events.map((event) => String(event?.description || '').toLowerCase()).join(' ');
  const ship = String(shipment?.shipment_status || '').toUpperCase();
  const blob = `${ship} ${codes.join(' ')} ${descriptions}`;
  if (/SDELVD|DELIVER/i.test(blob)) return 'delivered';
  if (/CANCEL/i.test(blob)) return 'cancelled';
  if (/SPU|SCHECKIN|INTRANSIT|DISPATCH|OUTSCAN|OFD|SHUB/i.test(blob) || /picked up|checked in|in transit/.test(descriptions)) {
    return 'in_transit';
  }
  if (/SCREATED/i.test(blob) || descriptions.includes('created')) return 'booked';
  if (ship) return 'in_transit';
  return null;
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
  if (shipment?.br_number) order.sequel.brn = shipment.br_number;
  const next = sequelStatusFromShipment(shipment);
  if (next) order.sequel.status = next;
  if (next === 'delivered' && !['cancelled', 'failed'].includes(order.status)) {
    order.status = 'delivered';
  } else if ((next === 'in_transit' || next === 'booked') && order.status === 'paid') {
    order.status = 'shipped';
  }
  order.sequel.lastError = null;
}

async function refreshTracking(order) {
  const docket = order.sequel?.docketNumber;
  if (!docket) {
    throw new sequelApi.SequelApiError('No Sequel docket on this order', 'NO_DOCKET', 400);
  }
  const result = await sequelApi.trackDocket(docket);
  if (!result.success) {
    throw new sequelApi.SequelApiError(result.message, 'TRACK_FAILED', 502, result.raw);
  }
  applyShipmentToOrder(order, result.data || {});
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
    const orders = await Order.find({
      'sequel.docketNumber': { $exists: true, $nin: [null, ''] },
      'sequel.status': { $nin: ['delivered', 'cancelled', 'not_required'] }
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
        continue;
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
        if (!error) continue;
        const message = String(error.docket || error.docketNo || error.message || 'No tracking information');
        for (const order of group) {
          order.sequel = order.sequel || {};
          order.sequel.lastError = message;
          await order.save();
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
  refreshTracking,
  syncOpenSequelShipments,
  startSequelTrackingSync,
  cancelShipment,
  tryAutoBook,
  ensureSequelBooked
};
