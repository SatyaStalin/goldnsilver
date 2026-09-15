const express = require('express');
const { authMiddleware, optionalAuth } = require('../middleware/auth');
const { normalizePinCode } = require('../utils/physicalGold');
const sequelApi = require('../services/sequelApi');
const sequelService = require('../services/sequelService');
const Order = require('../models/Order');

const router = express.Router();

router.get('/status', optionalAuth, (req, res) => {
  res.json(sequelApi.publicSequelConfig());
});

router.post('/serviceability', authMiddleware, async (req, res, next) => {
  try {
    const pinCode = normalizePinCode(req.body.pinCode || req.body.pincode);
    if (!pinCode) {
      return res.status(400).json({ message: 'Enter a valid 6-digit pincode', code: 'INVALID_PIN' });
    }
    const cfg = sequelApi.getSequelConfig();
    if (!cfg.configured) {
      return res.json({
        success: true,
        configured: false,
        serviceable: true,
        message: 'Sequel is not configured; pincode check skipped',
        data: { pinCode }
      });
    }
    const result = await sequelApi.checkServiceability(pinCode);
    if (result.accountInactive) {
      const cfg = sequelApi.getSequelConfig();
      return res.json({
        success: false,
        configured: true,
        accountActive: false,
        serviceable: null,
        code: 'SEQUEL_ACCOUNT_INACTIVE',
        mode: cfg.mode,
        fromStoreCode: cfg.fromStoreCode,
        message: sequelApi.inactiveClientMessage(),
        sequelMessage: result.raw?.message || result.message,
        data: result.data,
        pinCode
      });
    }
    const delivery =
      result.data?.Delivery_Availability == null ||
      String(result.data.Delivery_Availability).toLowerCase() !== 'no';
    res.json({
      success: result.success,
      configured: true,
      accountActive: true,
      serviceable: Boolean(result.success && delivery),
      message: result.message,
      data: result.data,
      pinCode
    });
  } catch (err) {
    if (err.code === 'SEQUEL_NOT_CONFIGURED') {
      return res.json({
        success: true,
        configured: false,
        serviceable: true,
        message: err.message
      });
    }
    next(err);
  }
});

router.post('/edd', authMiddleware, async (req, res, next) => {
  try {
    const pinCode = normalizePinCode(req.body.pinCode || req.body.pincode);
    if (!pinCode) {
      return res.status(400).json({ message: 'Enter a valid 6-digit pincode', code: 'INVALID_PIN' });
    }
    const result = await sequelApi.calculateEdd({ destinationPincode: pinCode });
    res.json({
      success: result.success,
      message: result.message,
      estimatedDelivery: result.data?.estimated_delivery || null,
      data: result.data
    });
  } catch (err) {
    if (err.code === 'SEQUEL_NOT_CONFIGURED') {
      return res.json({ success: false, configured: false, message: err.message });
    }
    next(err);
  }
});

router.get('/orders/:orderId', authMiddleware, async (req, res, next) => {
  try {
    const order = await Order.findOne({
      _id: req.params.orderId,
      user: req.user._id
    });
    if (!order) return res.status(404).json({ message: 'Order not found' });
    res.json({
      orderId: order._id,
      shippingAddress: order.shippingAddress || null,
      sequel: sequelService.publicSequel(order)
    });
  } catch (err) {
    next(err);
  }
});

router.post('/orders/:orderId/track', authMiddleware, async (req, res, next) => {
  try {
    const order = await Order.findOne({
      _id: req.params.orderId,
      user: req.user._id
    });
    if (!order) return res.status(404).json({ message: 'Order not found' });
    await sequelService.refreshTracking(order);
    res.json({ sequel: sequelService.publicSequel(order) });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
