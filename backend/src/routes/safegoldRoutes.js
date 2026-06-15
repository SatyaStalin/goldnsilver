const express = require('express');
const crypto = require('crypto');
const { authMiddleware } = require('../middleware/auth');
const SafeGoldWallet = require('../models/SafeGoldWallet');
const SafeGoldTransaction = require('../models/SafeGoldTransaction');
const {
  fetchBuyPrice,
  calculateQuote,
  transferGold,
  MIN_BUY_INR,
  MAX_BUY_INR,
  useMock
} = require('../services/safegoldService');

const router = express.Router();

const normalizeMobile = (mobile) => String(mobile || '').replace(/\D/g, '').slice(-10);

function generateClientReferenceId(userId) {
  const suffix = crypto.randomBytes(4).toString('hex');
  return `SG_${userId}_${Date.now()}_${suffix}`;
}

async function getOrCreateWallet(userId) {
  let wallet = await SafeGoldWallet.findOne({ user: userId });
  if (!wallet) {
    wallet = await SafeGoldWallet.create({ user: userId, balanceGrams: 0 });
  }
  return wallet;
}

// GET /api/safegold/buy-price — live rate (public)
router.get('/buy-price', async (req, res, next) => {
  try {
    const price = await fetchBuyPrice();
    res.json({
      currentPrice: price.current_price,
      applicableTax: price.applicable_tax,
      rateId: price.rate_id,
      rateValidity: price.rate_validity,
      expiresAt: price.expiresAt,
      source: price.source,
      mock: useMock()
    });
  } catch (err) {
    next(err);
  }
});

// POST /api/safegold/buy/quote — calculate grams/amount
router.post('/buy/quote', async (req, res, next) => {
  try {
    const { mode = 'inr', value, rateId } = req.body;
    const numValue = Number(value);

    if (!numValue || numValue <= 0) {
      return res.status(400).json({ message: 'Enter a valid amount' });
    }

    let priceData = await fetchBuyPrice();
    if (rateId && String(rateId) !== String(priceData.rate_id)) {
      priceData = await fetchBuyPrice();
    }

    const quote = calculateQuote(priceData, mode, numValue);
    res.json(quote);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// GET /api/safegold/dashboard — wallet + rate + recent tx
router.get('/dashboard', authMiddleware, async (req, res, next) => {
  try {
    const wallet = await getOrCreateWallet(req.user._id);
    const price = await fetchBuyPrice();
    const transactions = await SafeGoldTransaction.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .limit(10)
      .lean();

    res.json({
      wallet: {
        balanceGrams: wallet.balanceGrams,
        safegoldUserId: wallet.safegoldUserId
      },
      rate: {
        currentPrice: price.current_price,
        applicableTax: price.applicable_tax,
        rateId: price.rate_id,
        expiresAt: price.expiresAt,
        source: price.source
      },
      transactions,
      limits: { minInr: MIN_BUY_INR, maxInr: MAX_BUY_INR },
      mock: useMock()
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/safegold/transactions
router.get('/transactions', authMiddleware, async (req, res, next) => {
  try {
    const limit = Math.min(Number(req.query.limit) || 20, 50);
    const transactions = await SafeGoldTransaction.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();
    res.json({ transactions });
  } catch (err) {
    next(err);
  }
});

// POST /api/safegold/buy/initiate — quote lock + SafeGold gold-transfer
router.post('/buy/initiate', authMiddleware, async (req, res, next) => {
  try {
    const { mode = 'inr', value, rateId } = req.body;
    const numValue = Number(value);

    if (!numValue || numValue <= 0) {
      return res.status(400).json({ message: 'Enter a valid amount' });
    }

    const mobile = normalizeMobile(req.user.mobile);
    if (!req.user.name?.trim()) {
      return res.status(400).json({ message: 'Please update your name in profile before buying gold' });
    }
    if (mobile.length !== 10) {
      return res.status(400).json({ message: 'Please add a valid 10-digit mobile number in your profile' });
    }

    const priceData = await fetchBuyPrice();
    if (rateId && String(rateId) !== String(priceData.rate_id)) {
      return res.status(400).json({
        message: 'Gold rate has expired. Please refresh and try again.',
        code: 'RATE_EXPIRED'
      });
    }

    const quote = calculateQuote(priceData, mode, numValue);
    const clientReferenceId = generateClientReferenceId(req.user._id);

    const existingPending = await SafeGoldTransaction.findOne({
      user: req.user._id,
      status: 'pending',
      createdAt: { $gte: new Date(Date.now() - 15 * 60 * 1000) }
    });
    if (existingPending) {
      return res.status(400).json({
        message: 'You have a pending gold purchase. Please wait before starting a new one.',
        code: 'PENDING_EXISTS',
        transactionId: existingPending._id
      });
    }

    const transaction = await SafeGoldTransaction.create({
      user: req.user._id,
      type: 'buy',
      status: 'pending',
      clientReferenceId,
      rateId: quote.rateId,
      currentPrice: quote.currentPrice,
      applicableTax: quote.applicableTax,
      goldAmount: quote.goldAmount,
      buyPrice: quote.buyPrice,
      paymentProvider: 'safegold'
    });

    const partnerUserId = req.user._id.toString();

    try {
      const transferResult = await transferGold({
        partnerUserId,
        name: req.user.name,
        phoneNo: mobile,
        rateId: quote.rateId,
        goldAmount: quote.goldAmount,
        buyPrice: quote.buyPrice,
        clientReferenceId
      });

      transaction.status = 'success';
      transaction.buyTxId = transferResult.buy_tx_id;
      transaction.transferTxId = transferResult.transfer_tx_id;
      transaction.sgRate = transferResult.sg_rate;
      transaction.safegoldUserId = transferResult.customer_user_id;
      await transaction.save();

      const wallet = await getOrCreateWallet(req.user._id);
      wallet.balanceGrams = round4(wallet.balanceGrams + quote.goldAmount);
      if (transferResult.customer_user_id) {
        wallet.safegoldUserId = transferResult.customer_user_id;
      }
      await wallet.save();

      res.json({
        success: true,
        message: 'Gold purchased successfully',
        transactionId: transaction._id,
        clientReferenceId,
        quote,
        transaction,
        wallet: { balanceGrams: wallet.balanceGrams }
      });
    } catch (transferErr) {
      transaction.status = 'failed';
      transaction.failureReason = transferErr.message || 'Gold transfer failed';
      await transaction.save();

      const statusCode = transferErr.statusCode === 403 ? 403 : 502;
      return res.status(statusCode).json({
        success: false,
        message: transferErr.message || 'Gold transfer failed. Please try again.',
        code: 'GOLD_TRANSFER_FAILED',
        transaction
      });
    }
  } catch (err) {
    next(err);
  }
});

function round4(value) {
  return Math.round(Number(value) * 10000) / 10000;
}

module.exports = router;
