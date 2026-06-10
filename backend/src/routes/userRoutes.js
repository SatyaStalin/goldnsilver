const express = require('express');
const Order = require('../models/Order');
const { authMiddleware } = require('../middleware/auth');
const { getLiveMetalRates } = require('../services/metalRatesService');
const { formatUserResponse } = require('../services/userOrderService');

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

router.get('/orders', async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { metal } = req.query;

    const orders = await Order.find({ user: userId })
      .populate('items.product', 'name metal metalGrams type imageUrl')
      .sort({ createdAt: -1 })
      .lean();

    const history = [];

    for (const order of orders) {
      for (const item of order.items || []) {
        const product = item.product;
        const itemMetal = item.metal || product?.metal;
        if (metal && itemMetal !== metal) continue;

        const grams =
          item.metalGrams ||
          (product?.metalGrams || 1) * (item.quantity || 1);
        const amountInvested = (item.price || 0) * (item.quantity || 1);

        history.push({
          orderId: order._id,
          orderDate: order.createdAt,
          productName: item.name || product?.name,
          metal: itemMetal,
          amountInvested,
          quantity: item.quantity,
          metalGrams: grams,
          purchaseRatePerGram: item.purchaseRatePerGram,
          liveGoldRateAtPurchase: order.liveGoldRateAtPurchase,
          liveSilverRateAtPurchase: order.liveSilverRateAtPurchase,
          orderStatus: order.status,
          paymentStatus: order.paymentStatus
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
