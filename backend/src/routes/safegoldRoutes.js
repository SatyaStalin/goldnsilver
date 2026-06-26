const express = require('express');
const crypto = require('crypto');
const { authMiddleware } = require('../middleware/auth');
const Order = require('../models/Order');
const SafeGoldTransaction = require('../models/SafeGoldTransaction');
const {
  fetchBuyPrice,
  calculateQuote,
  MIN_BUY_INR,
  MAX_BUY_INR,
  useMock,
  SafeGoldApiError,
  getSafeGoldConfig,
  testConnection
} = require('../services/safegoldService');
const {
  normalizeMobile,
  getOrCreateWallet,
  getCustomerMapping,
  ensureSafeGoldCustomer,
  syncHoldingsFromSafeGold,
  getMergedTransactionHistory
} = require('../services/safegoldCustomerService');

const router = express.Router();

function generateClientReferenceId(userId) {
  const suffix = crypto.randomBytes(4).toString('hex');
  return `SG_${userId}_${Date.now()}_${suffix}`;
}

function handleSafeGoldError(err, res, next) {
  if (err instanceof SafeGoldApiError) {
    return res.status(err.statusCode || 502).json({
      success: false,
      message: err.message,
      code: err.code,
      details: err.details || undefined
    });
  }
  if (err.name === 'ValidationError') {
    return res.status(400).json({ message: err.message, code: 'VALIDATION_ERROR' });
  }
  next(err);
}

// GET /api/safegold/status — resolved SafeGold API target (no secrets)
router.get('/status', (req, res) => {
  res.json(getSafeGoldConfig());
});

// GET /api/safegold/test-connection — live connectivity check (no mock fallback)
router.get('/test-connection', async (req, res, next) => {
  try {
    const result = await testConnection();
    res.status(result.ok ? 200 : 502).json(result);
  } catch (err) {
    next(err);
  }
});

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
      mock: price.source !== 'safegold',
      mockReason: price.mockReason || null
    });
  } catch (err) {
    handleSafeGoldError(err, res, next);
  }
});

// POST /api/safegold/buy/quote — calculate grams/amount
router.post('/buy/quote', async (req, res, next) => {
  try {
    const { mode = 'inr', value, rateId } = req.body;
    const numValue = Number(value);

    if (!numValue || numValue <= 0) {
      return res.status(400).json({ message: 'Enter a valid amount', code: 'INVALID_AMOUNT' });
    }

    let priceData = await fetchBuyPrice();
    if (rateId && String(rateId) !== String(priceData.rate_id)) {
      priceData = await fetchBuyPrice();
    }

    const quote = calculateQuote(priceData, mode, numValue);
    res.json(quote);
  } catch (err) {
    if (err instanceof SafeGoldApiError) {
      return handleSafeGoldError(err, res, next);
    }
    res.status(400).json({ message: err.message, code: 'QUOTE_ERROR' });
  }
});

// GET /api/safegold/customer — portal user ↔ SafeGold customer mapping
router.get('/customer', authMiddleware, async (req, res, next) => {
  try {
    const mapping = await getCustomerMapping(req.user._id);
    res.json({
      linked: Boolean(mapping?.safegoldCustomerId),
      customer: mapping,
      partnerUserId: req.user._id.toString(),
      mock: useMock()
    });
  } catch (err) {
    next(err);
  }
});

// POST /api/safegold/customer/register — create/link SafeGold customer (portal JWT only)
router.post('/customer/register', authMiddleware, async (req, res, next) => {
  try {
    const mapping = await ensureSafeGoldCustomer(req.user);
    const wallet = await getOrCreateWallet(req.user._id);
    res.json({
      success: true,
      message:
        mapping.status === 'active'
          ? 'SafeGold customer linked successfully'
          : 'Profile saved. SafeGold customer will be created on your first gold purchase.',
      customer: mapping,
      wallet: {
        balanceGrams: wallet.balanceGrams,
        safegoldUserId: wallet.safegoldUserId,
        balanceSource: wallet.balanceSource
      }
    });
  } catch (err) {
    handleSafeGoldError(err, res, next);
  }
});

// GET /api/safegold/holdings — balance from SafeGold API (fallback local)
router.get('/holdings', authMiddleware, async (req, res, next) => {
  try {
    const synced = await syncHoldingsFromSafeGold(req.user._id);
    res.json({
      wallet: {
        balanceGrams: synced.wallet.balanceGrams,
        safegoldUserId: synced.wallet.safegoldUserId,
        balanceSource: synced.source,
        lastSyncedAt: synced.wallet.lastSyncedAt
      },
      customer: synced.mapping,
      syncError: synced.syncError || null,
      mock: useMock()
    });
  } catch (err) {
    handleSafeGoldError(err, res, next);
  }
});

// GET /api/safegold/dashboard — wallet + rate + holdings + recent tx
router.get('/dashboard', authMiddleware, async (req, res, next) => {
  try {
    const price = await fetchBuyPrice();
    const synced = await syncHoldingsFromSafeGold(req.user._id);
    const mapping = synced.mapping || (await getCustomerMapping(req.user._id));
    const history = await getMergedTransactionHistory(req.user._id, 10);

    res.json({
      customer: mapping,
      wallet: {
        balanceGrams: synced.wallet.balanceGrams,
        safegoldUserId: synced.wallet.safegoldUserId,
        balanceSource: synced.source,
        lastSyncedAt: synced.wallet.lastSyncedAt
      },
      rate: {
        currentPrice: price.current_price,
        applicableTax: price.applicable_tax,
        rateId: price.rate_id,
        expiresAt: price.expiresAt,
        source: price.source,
        mockReason: price.mockReason || null
      },
      transactions: history.local,
      safegoldTransactions: history.remote,
      transactionSource: history.source,
      transactionSyncError: history.remoteError,
      limits: { minInr: MIN_BUY_INR, maxInr: MAX_BUY_INR },
      mock: useMock()
    });
  } catch (err) {
    handleSafeGoldError(err, res, next);
  }
});

// GET /api/safegold/transactions — local ledger + SafeGold API history
router.get('/transactions', authMiddleware, async (req, res, next) => {
  try {
    const limit = Math.min(Number(req.query.limit) || 20, 50);
    const history = await getMergedTransactionHistory(req.user._id, limit);
    res.json({
      transactions: history.local,
      safegoldTransactions: history.remote,
      source: history.source,
      syncError: history.remoteError
    });
  } catch (err) {
    handleSafeGoldError(err, res, next);
  }
});

// POST /api/safegold/buy/initiate — pending order + SafeGold tx → Cashfree payment
router.post('/buy/initiate', authMiddleware, async (req, res, next) => {
  try {
    const { mode = 'inr', value, rateId } = req.body;
    const numValue = Number(value);

    if (!numValue || numValue <= 0) {
      return res.status(400).json({ message: 'Enter a valid amount', code: 'INVALID_AMOUNT' });
    }

    const mobile = normalizeMobile(req.user.mobile);
    if (!req.user.name?.trim()) {
      return res.status(400).json({
        message: 'Please update your name in profile before buying gold',
        code: 'PROFILE_INCOMPLETE'
      });
    }
    if (mobile.length !== 10) {
      return res.status(400).json({
        message: 'Please add a valid 10-digit mobile number in your profile',
        code: 'PROFILE_INCOMPLETE'
      });
    }

    await ensureSafeGoldCustomer(req.user);

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
        message: 'You have a pending gold purchase. Please complete payment or wait before starting a new one.',
        code: 'PENDING_EXISTS',
        transactionId: existingPending._id,
        orderId: existingPending.orderId
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
      paymentProvider: 'cashfree'
    });

    const order = await Order.create({
      user: req.user._id,
      orderType: 'safegold',
      safegoldTransactionId: transaction._id,
      items: [
        {
          name: `SafeGold Physical Gold — ${quote.goldAmount}g`,
          price: quote.buyPrice,
          quantity: 1,
          metal: 'gold',
          metalGrams: quote.goldAmount,
          purchaseRatePerGram: quote.currentPrice
        }
      ],
      totalAmount: quote.buyPrice,
      status: 'pending',
      paymentStatus: 'pending',
      customerName: req.user.name,
      customerEmail: req.user.email,
      customerPhone: mobile,
      liveGoldRateAtPurchase: quote.currentPrice
    });

    transaction.orderId = order._id;
    await transaction.save();

    res.json({
      orderId: order._id,
      safegoldTransactionId: transaction._id,
      clientReferenceId,
      quote
    });
  } catch (err) {
    handleSafeGoldError(err, res, next);
  }
});

module.exports = router;
