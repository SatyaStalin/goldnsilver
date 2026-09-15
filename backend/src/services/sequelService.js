const Order = require('../models/Order');
const Product = require('../models/Product');
const { isPhysicalShipmentProduct, sanitizeShippingAddress } = require('../utils/physicalGold');
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
  return {
    required,
    status: s.docketNumber ? s.status : required ? s.status === 'not_required' ? 'pending' : s.status || 'pending' : 'not_required',
    docketNumber: s.docketNumber || null,
    brn: s.brn || null,
    estimatedDelivery: s.estimatedDelivery || null,
    fromStoreCode: s.fromStoreCode || null,
    lastError: s.lastError || null,
    bookedAt: s.bookedAt || null,
    tracking: Array.isArray(s.tracking) ? s.tracking : [],
    shipmentStatus: s.shipmentStatus || null,
    docketPrintUrl: s.docketPrintUrl || null
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
  if (!ship.pinCode || !ship.line1 || !ship.consigneeName) {
    throw new sequelApi.SequelApiError(
      'Shipping address is missing on this order',
      'ADDRESS_REQUIRED',
      400
    );
  }

  const totals = physicalGoldTotals(order);
  const invoiceNo = String(order._id);
  const payload = {
    location: cfg.location,
    shipmentType: cfg.shipmentType,
    serviceType: cfg.serviceType,
    pickUpDate: cfg.pickupDate,
    pickUpTime: cfg.pickupTime,
    fromStoreCode: cfg.fromStoreCode,
    toAddress: {
      consignee_name: ship.consigneeName,
      address_line1: ship.line1,
      address_line2: ship.line2 || '',
      pinCode: ship.pinCode,
      auth_receiver_name: ship.authReceiverName || ship.consigneeName,
      auth_receiver_phone: ship.authReceiverPhone
    },
    net_weight: String(Math.round(totals.netWeight)),
    gross_weight: String(Math.round(totals.netWeight + 50)),
    net_value: String(Math.round(totals.netValue)),
    codValue: '0',
    no_of_packages: '1',
    boxes: [
      {
        box_number: `GS-${invoiceNo.slice(-8)}`,
        lock_number: '',
        length: String(process.env.SEQUEL_BOX_LENGTH || '10'),
        breadth: String(process.env.SEQUEL_BOX_BREADTH || '10'),
        height: String(process.env.SEQUEL_BOX_HEIGHT || '4'),
        gross_weight: String(Math.round(totals.netWeight + 50))
      }
    ],
    invoice: [invoiceNo],
    remark: 'Physical gold — handle with care'
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

  const data = result.data || {};
  order.sequel.status = 'booked';
  order.sequel.docketNumber = data.docketNumber || data.docket_no || order.sequel.docketNumber;
  order.sequel.brn = data.brn || null;
  order.sequel.estimatedDelivery = data.estimated_delivery || data.estimatedDelivery || null;
  order.sequel.docketPrintUrl = data.docket_print || null;
  order.sequel.bookedAt = new Date();
  order.sequel.lastError = null;
  if (order.status === 'paid') order.status = 'shipped';
  await order.save();
  return order;
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
  const data = result.data || {};
  order.sequel.tracking = Array.isArray(data.tracking) ? data.tracking : [];
  order.sequel.shipmentStatus = data.shipment_status || null;
  const statusText = String(data.shipment_status || '').toLowerCase();
  if (statusText.includes('deliver')) {
    order.sequel.status = 'delivered';
    if (order.status === 'shipped') order.status = 'delivered';
  } else if (statusText.includes('cancel')) {
    order.sequel.status = 'cancelled';
  } else if (order.sequel.status === 'booked') {
    order.sequel.status = 'in_transit';
  }
  await order.save();
  return order;
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

async function tryAutoBook(order) {
  const cfg = sequelApi.getSequelConfig();
  if (!cfg.autoBook || !cfg.configured) return order;
  if (order.sequel?.docketNumber) return order;
  const needs = order.requiresSequelShipment || (await orderHasPhysicalGold(order));
  if (!needs) return order;
  try {
    return await bookShipmentForOrder(order);
  } catch (err) {
    console.error('[sequel] auto-book failed:', err.message);
    return order;
  }
}

module.exports = {
  orderHasPhysicalGold,
  physicalGoldTotals,
  publicSequel,
  saveShippingAndEnable,
  bookShipmentForOrder,
  refreshTracking,
  cancelShipment,
  tryAutoBook
};
