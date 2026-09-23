const express = require('express');
const Order = require('../models/Order');
const { authMiddleware } = require('../middleware/auth');
const { getLiveMetalRates } = require('../services/metalRatesService');
const { formatUserResponse } = require('../services/userOrderService');
const sequelService = require('../services/sequelService');

const router = express.Router();

router.use(authMiddleware);

function isPaidOrder(order) {
  return order.paymentStatus === 'success' || order.status === 'paid' || order.status === 'completed';
}

router.get('/dashboard', async (req, res, next) => {
  try {
    const userId = req.user._id;
    const orders = await Order.find({ user: userId })
      .populate('items.product', 'name metal metalGrams type')
      .sort({ createdAt: -1 })
      .lean();

    const paidOrders = orders.filter(isPaidOrder);
    const liveRates = await getLiveMetalRates();

    let totalInvestment = 0;
    let goldGrams = 0;
    let silverGrams = 0;
    let goldInvested = 0;
    let silverInvested = 0;

    for (const order of paidOrders) {
      totalInvestment += order.totalAmount || 0;
      for (const item of order.items || []) {
        const product = item.product;
        const metal = item.metal || product?.metal || 'gold';
        const grams =
          item.metalGrams ||
          (product?.metalGrams || 1) * (item.quantity || 1);
        const lineAmount = (item.price || 0) * (item.quantity || 1);

        if (metal === 'silver') {
          silverGrams += grams;
          silverInvested += lineAmount;
        } else if (metal === 'gold') {
          goldGrams += grams;
          goldInvested += lineAmount;
        } else if (metal === 'gold+silver') {
          goldGrams += grams / 2;
          silverGrams += grams / 2;
          goldInvested += lineAmount / 2;
          silverInvested += lineAmount / 2;
        }
      }
    }

    const goldCurrentValue = goldGrams * liveRates.goldPerGram;
    const silverCurrentValue = silverGrams * liveRates.silverPerGram;
    const currentHoldingsValue = goldCurrentValue + silverCurrentValue;
    const profitLoss = currentHoldingsValue - totalInvestment;

    res.json({
      totalInvestment,
      goldHoldingsGrams: Math.round(goldGrams * 1000) / 1000,
      silverHoldingsGrams: Math.round(silverGrams * 1000) / 1000,
      goldCurrentValue: Math.round(goldCurrentValue * 100) / 100,
      silverCurrentValue: Math.round(silverCurrentValue * 100) / 100,
      currentHoldingsValue: Math.round(currentHoldingsValue * 100) / 100,
      profitLoss: Math.round(profitLoss * 100) / 100,
      liveRates: {
        goldPerGram: liveRates.goldPerGram,
        silverPerGram: liveRates.silverPerGram,
        source: liveRates.source
      },
      orderCount: paidOrders.length
    });
  } catch (err) {
    next(err);
  }
});

router.get('/last-shipping-address', async (req, res, next) => {
  try {
    const order = await Order.findOne({
      user: req.user._id,
      'shippingAddress.line1': { $exists: true, $nin: [null, ''] }
    })
      .sort({ createdAt: -1 })
      .select('shippingAddress')
      .lean();
    res.json({ shippingAddress: order?.shippingAddress || null });
  } catch (err) {
    next(err);
  }
});

router.get('/orders', async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { metal } = req.query;

    let orders = await Order.find({ user: userId })
      .populate('items.product', 'name metal metalGrams type imageUrl')
      .sort({ createdAt: -1 });

    // Book any paid physical orders still missing a Sequel docket (so Track shows immediately)
    const ensured = [];
    for (const order of orders) {
      const needsBook =
        (order.paymentStatus === 'success' || order.status === 'paid' || order.status === 'shipped') &&
        order.requiresSequelShipment &&
        !order.sequel?.docketNumber;
      if (needsBook) {
        try {
          const updated = await sequelService.ensureSequelBooked(order);
          ensured.push(updated || order);
        } catch (e) {
          console.error('[sequel] dashboard ensure failed', String(order._id), e.message);
          ensured.push(order);
        }
      } else {
        ensured.push(order);
      }
    }
    orders = ensured;

    const history = [];

    for (const order of orders) {
      const orderObj = order.toObject ? order.toObject() : order;
      for (const item of orderObj.items || []) {
        const product = item.product;
        const itemMetal = item.metal || product?.metal;
        if (metal && itemMetal !== metal) continue;

        const grams =
          item.metalGrams ||
          (product?.metalGrams || 1) * (item.quantity || 1);
        const amountInvested = (item.price || 0) * (item.quantity || 1);

        history.push({
          orderId: orderObj._id,
          orderDate: orderObj.createdAt,
          productName: item.name || product?.name,
          metal: itemMetal,
          amountInvested,
          quantity: item.quantity,
          metalGrams: grams,
          purchaseRatePerGram: item.purchaseRatePerGram,
          liveGoldRateAtPurchase: orderObj.liveGoldRateAtPurchase,
          liveSilverRateAtPurchase: orderObj.liveSilverRateAtPurchase,
          orderStatus: orderObj.status,
          paymentStatus: orderObj.paymentStatus,
          productType: item.type || product?.type,
          shippingAddress: orderObj.shippingAddress?.line1 ? orderObj.shippingAddress : null,
          sequel: sequelService.publicSequel(orderObj).required
            ? sequelService.publicSequel(orderObj)
            : null
        });
      }
    }

    res.json({ history });
  } catch (err) {
    next(err);
  }
});

router.get('/profile', async (req, res) => {
  res.json({ user: formatUserResponse(req.user) });
});

module.exports = router;
