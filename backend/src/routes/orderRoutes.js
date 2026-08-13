const express = require('express');
const Order = require('../models/Order');
const Product = require('../models/Product');
const { optionalAuth } = require('../middleware/auth');
const {
  resolveOrCreateUser,
  enrichOrderItems
} = require('../services/userOrderService');

const router = express.Router();

router.post('/', optionalAuth, async (req, res, next) => {
  try {
    const { items, totalAmount, customerName, customerEmail, customerPhone, password } = req.body;

    for (const item of items) {
      const product = await Product.findById(item.productId);
      if (!product) {
        return res.status(404).json({ message: `Product ${item.productId} not found` });
      }
      if (product.stock < item.quantity) {
        return res.status(400).json({
          message: `Insufficient stock for ${product.name}. Available: ${product.stock}`
        });
      }
      if (product.stock === 0) {
        return res.status(400).json({ message: `${product.name} is out of stock` });
      }
    }

    let userId = req.user?._id || null;
    let userCreated = false;

    if (!userId && (customerEmail || customerPhone)) {
      try {
        const { user, created } = await resolveOrCreateUser({
          name: customerName,
          email: customerEmail,
          mobile: customerPhone,
          password
        });
        userId = user._id;
        userCreated = created;
      } catch (err) {
        if (err.code === 'PASSWORD_REQUIRED') {
          return res.status(400).json({
            message: err.message,
            code: 'PASSWORD_REQUIRED',
            requiresPassword: true
          });
        }
        return res.status(err.statusCode || 400).json({ message: err.message });
      }
    }

    const { items: enrichedItems, liveRatesAtPurchase } = await enrichOrderItems(items);

    const order = new Order({
      user: userId,
      items: enrichedItems,
      totalAmount,
      status: 'pending',
      paymentStatus: 'pending',
      customerName: customerName || null,
      customerEmail: customerEmail || null,
      customerPhone: customerPhone || null,
      liveGoldRateAtPurchase: liveRatesAtPurchase.goldPerGram,
      liveSilverRateAtPurchase: liveRatesAtPurchase.silverPerGram
    });

    await order.save();

    const response = order.toObject();
    if (userCreated) {
      response.accountCreated = true;
      response.message =
        'Account created. Use your email and password to access your dashboard after payment.';
    }

    res.status(201).json(response);
  } catch (err) {
    next(err);
  }
});

router.post('/:orderId/payment', async (req, res, next) => {
  try {
    const { orderId } = req.params;
    const { paymentMethod } = req.body;

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    if (order.paymentStatus === 'success') {
      return res.status(400).json({ message: 'Order already paid' });
    }

    const paymentSuccess = paymentMethod !== 'fail';

    if (paymentSuccess) {
      if (order.orderType !== 'safegold') {
        for (const item of order.items) {
          if (!item.product) continue;
          await Product.findByIdAndUpdate(item.product, { $inc: { stock: -item.quantity } });
        }
      }

      order.paymentStatus = 'success';
      order.status = 'paid';
      await order.save();

      res.json({
        success: true,
        message: 'Payment successful',
        order
      });
    } else {
      order.paymentStatus = 'failed';
      order.status = 'failed';
      await order.save();

      res.status(400).json({
        success: false,
        message: 'Payment failed',
        order
      });
    }
  } catch (err) {
    next(err);
  }
});

router.get('/payment/:paymentOrderId', async (req, res, next) => {
  try {
    const { paymentOrderId } = req.params;
    const order = await Order.findOne({ paymentOrderId });
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    res.json(order);
  } catch (err) {
    next(err);
  }
});

router.get('/:orderId', async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.orderId)
      .populate('items.product', 'name slug imageUrl metal metalGrams')
      .populate('safegoldTransactionId');
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    res.json(order);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
