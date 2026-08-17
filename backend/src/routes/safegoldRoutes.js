const express = require('express');
const crypto = require('crypto');
const { authMiddleware } = require('../middleware/auth');
const Order = require('../models/Order');
const SafeGoldTransaction = require('../models/SafeGoldTransaction');
const {
  fetchBuyPrice,
  fetchSellPrice,
  calculateQuote,
  calculateSellQuote,
  MIN_BUY_INR,
  MAX_BUY_INR,
  MIN_SELL_INR,
  useMock,
  SafeGoldApiError,
  getSafeGoldConfig,
  testConnection,
  executeSell,
  fetchInvoice
} = require('../services/safegoldService');
const {
  normalizeMobile,
  getOrCreateWallet,
  getCustomerMapping,
  ensureSafeGoldCustomer,
  syncHoldingsFromSafeGold,
  getMergedTransactionHistory,
  resetSafeGoldCustomerLink,
  getLocalGoldInvestment,
  markSafeGoldBuyFailed,
  resolveAbandonedPendingBuys,
  cancelPendingSafeGoldBuys
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
    const synced = await syncHoldingsFromSafeGold(req.user._id);
    res.json({
      success: true,
      linked: Boolean(mapping.safegoldCustomerId),
      message: mapping.safegoldCustomerId
        ? 'SafeGold vault linked successfully'
        : 'Could not link SafeGold vault. Check profile details or reset and try again.',
      customer: mapping,
      wallet: {
        balanceGrams: synced.wallet.balanceGrams,
        safegoldUserId: synced.wallet.safegoldUserId,
        balanceSource: synced.wallet.balanceSource,
        lastSyncedAt: synced.wallet.lastSyncedAt
      }
    });
  } catch (err) {
    handleSafeGoldError(err, res, next);
  }
});

// DELETE /api/safegold/customer/reset — clear local SafeGold link (portal user kept)
router.delete('/customer/reset', authMiddleware, async (req, res, next) => {
  try {
    await resetSafeGoldCustomerLink(req.user._id);
    res.json({
      success: true,
      message:
        'Local SafeGold link cleared. Use "Link SafeGold Vault" to register again with SafeGold.'
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/safegold/holdings — balance from SafeGold API (fallback local)
router.get('/holdings', authMiddleware, async (req, res, next) => {
  try {
    const synced = await syncHoldingsFromSafeGold(req.user._id);
    res.json({
      wallet: {
        balanceGrams: synced.wallet.balanceGrams,
        sellableBalanceGrams:
          synced.wallet.sellableBalanceGrams ?? synced.wallet.balanceGrams ?? 0,
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

// GET /api/safegold/dashboard — SafeGold-first portfolio (local DB caches investment + tx)
router.get('/dashboard', authMiddleware, async (req, res, next) => {
  try {
    const [price, sellPrice] = await Promise.all([
      fetchBuyPrice(),
      fetchSellPrice().catch(() => null)
    ]);
    const mapping = await getCustomerMapping(req.user._id);
    const linked = Boolean(mapping?.safegoldCustomerId && mapping.status === 'active');

    let synced = { wallet: await getOrCreateWallet(req.user._id), mapping, source: 'local' };
    if (linked) {
      synced = await syncHoldingsFromSafeGold(req.user._id);
    }

    const history = await getMergedTransactionHistory(req.user._id, 20);
    const totalInvestment = await getLocalGoldInvestment(req.user._id);

    const taxMultiplier = 1 + (Number(price.applicable_tax) || 3) / 100;
    const rateInclGst = Math.round(price.current_price * taxMultiplier * 100) / 100;
    const goldHoldingsGrams = synced.wallet.balanceGrams || 0;
    const goldCurrentValue = Math.round(goldHoldingsGrams * rateInclGst * 100) / 100;
    const profitLoss = Math.round((goldCurrentValue - totalInvestment) * 100) / 100;

    res.json({
      linked,
      customer: mapping,
      wallet: {
        balanceGrams: synced.wallet.balanceGrams,
        sellableBalanceGrams:
          synced.wallet.sellableBalanceGrams ?? synced.wallet.balanceGrams ?? 0,
        safegoldUserId: synced.wallet.safegoldUserId,
        balanceSource: synced.source || synced.wallet.balanceSource,
        lastSyncedAt: synced.wallet.lastSyncedAt
      },
      totalInvestment,
      goldHoldingsGrams,
      goldCurrentValue,
      profitLoss,
      rate: {
        currentPrice: price.current_price,
        applicableTax: price.applicable_tax,
        rateInclGst,
        rateId: price.rate_id,
        expiresAt: price.expiresAt,
        source: price.source,
        mock: price.source !== 'safegold',
        mockReason: price.mockReason || null
      },
      sellRate: sellPrice
        ? {
            currentPrice: sellPrice.current_price,
            applicableTax: sellPrice.applicable_tax || 0,
            rateId: sellPrice.rate_id,
            expiresAt: sellPrice.expiresAt,
            source: sellPrice.source,
            mock: sellPrice.source !== 'safegold',
            mockReason: sellPrice.mockReason || null
          }
        : null,
      transactions: history.local,
      safegoldTransactions: history.remote,
      transactionSource: linked ? history.source : 'local',
      syncError: synced.syncError || history.remoteError || mapping?.lastError || null,
      limits: { minInr: MIN_BUY_INR, maxInr: MAX_BUY_INR, minSellInr: MIN_SELL_INR },
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
    const mapping = await getCustomerMapping(req.user._id);
    const linked = Boolean(mapping?.safegoldCustomerId && mapping.status === 'active');
    res.json({
      linked,
      transactions: history.local,
      safegoldTransactions: history.remote,
      source: history.source,
      syncError: history.remoteError
    });
  } catch (err) {
    handleSafeGoldError(err, res, next);
  }
});

// GET /api/safegold/transactions/:id — own local ledger row (sale/buy summary)
router.get('/transactions/:id', authMiddleware, async (req, res, next) => {
  try {
    const tx = await SafeGoldTransaction.findOne({
      _id: req.params.id,
      user: req.user._id
    }).lean();
    if (!tx) {
      return res.status(404).json({ message: 'Transaction not found', code: 'NOT_FOUND' });
    }
    const wallet = await getOrCreateWallet(req.user._id);
    res.json({
      transaction: tx,
      wallet: walletPayload(wallet, wallet.balanceSource)
    });
  } catch (err) {
    handleSafeGoldError(err, res, next);
  }
});

// GET /api/safegold/transactions/:id/invoice — SafeGold invoice PDF URL (buy/sell)
router.get('/transactions/:id/invoice', authMiddleware, async (req, res, next) => {
  try {
    const tx = await SafeGoldTransaction.findOne({
      _id: req.params.id,
      user: req.user._id
    });
    if (!tx) {
      return res.status(404).json({ message: 'Transaction not found', code: 'NOT_FOUND' });
    }
    if (tx.status !== 'success') {
      return res.status(400).json({
        message: 'Invoice is available only after a successful transaction',
        code: 'INVOICE_NOT_READY'
      });
    }

    if (tx.invoiceUrl && !req.query.refresh) {
      return res.json({
        success: true,
        invoiceUrl: tx.invoiceUrl,
        cached: true,
        transactionId: tx._id,
        type: tx.type,
        fetchedAt: tx.invoiceFetchedAt
      });
    }

    const sgTxId = tx.type === 'sell' ? tx.sellTxId || tx.buyTxId : tx.buyTxId || tx.transferTxId;
    const invoice = await fetchInvoice({
      txId: sgTxId,
      txDate: tx.createdAt,
      type: tx.type || 'buy'
    });

    if (invoice.invoiceUrl) {
      tx.invoiceUrl = invoice.invoiceUrl;
      tx.invoiceFetchedAt = new Date();
      await tx.save();
    }

    res.json({
      success: Boolean(invoice.invoiceUrl),
      invoiceUrl: invoice.invoiceUrl,
      cached: false,
      mock: Boolean(invoice.mock),
      message: invoice.message || null,
      transactionId: tx._id,
      type: tx.type,
      txDate: invoice.txDate,
      safegoldTxId: sgTxId || null,
      source: invoice.source || null,
      fetchedAt: tx.invoiceFetchedAt
    });
  } catch (err) {
    handleSafeGoldError(err, res, next);
  }
});

// GET /api/safegold/invoice?orderId=…|transactionId=… — resolve then fetch SafeGold PDF URL
router.get('/invoice', authMiddleware, async (req, res, next) => {
  try {
    const { orderId, transactionId } = req.query;
    let tx = null;

    if (transactionId) {
      tx = await SafeGoldTransaction.findOne({
        _id: transactionId,
        user: req.user._id
      });
    } else if (orderId) {
      tx = await SafeGoldTransaction.findOne({
        orderId,
        user: req.user._id
      }).sort({ createdAt: -1 });
      if (!tx) {
        const order = await Order.findOne({ _id: orderId, user: req.user._id }).lean();
        if (order?.safegoldTransactionId) {
          tx = await SafeGoldTransaction.findOne({
            _id: order.safegoldTransactionId,
            user: req.user._id
          });
        }
      }
    } else {
      return res.status(400).json({
        message: 'Provide orderId or transactionId',
        code: 'MISSING_ID'
      });
    }

    if (!tx) {
      return res.status(404).json({ message: 'Transaction not found', code: 'NOT_FOUND' });
    }
    if (tx.status !== 'success') {
      return res.status(400).json({
        message: 'Invoice is available only after a successful transaction',
        code: 'INVOICE_NOT_READY'
      });
    }

    if (tx.invoiceUrl && !req.query.refresh) {
      return res.json({
        success: true,
        invoiceUrl: tx.invoiceUrl,
        cached: true,
        transactionId: tx._id,
        type: tx.type,
        fetchedAt: tx.invoiceFetchedAt
      });
    }

    const sgTxId = tx.type === 'sell' ? tx.sellTxId || tx.buyTxId : tx.buyTxId || tx.transferTxId;
    const invoice = await fetchInvoice({
      txId: sgTxId,
      txDate: tx.createdAt,
      type: tx.type || 'buy'
    });

    if (invoice.invoiceUrl) {
      tx.invoiceUrl = invoice.invoiceUrl;
      tx.invoiceFetchedAt = new Date();
      await tx.save();
    }

    res.json({
      success: Boolean(invoice.invoiceUrl),
      invoiceUrl: invoice.invoiceUrl,
      cached: false,
      mock: Boolean(invoice.mock),
      message: invoice.message || null,
      transactionId: tx._id,
      type: tx.type,
      txDate: invoice.txDate,
      safegoldTxId: sgTxId || null,
      source: invoice.source || null,
      fetchedAt: tx.invoiceFetchedAt
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

    // Clear failed/abandoned pending buys, then cancel any leftover pending
    // so a retry after failed/cancelled payment is never blocked.
    await resolveAbandonedPendingBuys(req.user._id);
    await cancelPendingSafeGoldBuys(req.user._id, 'Superseded by new buy attempt');

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

// POST /api/safegold/buy/cancel-pending — mark abandoned/cancelled pending buys as failed
router.post('/buy/cancel-pending', authMiddleware, async (req, res, next) => {
  try {
    const reason = String(req.body?.reason || 'Payment cancelled by user').slice(0, 200);
    const result = await cancelPendingSafeGoldBuys(req.user._id, reason);
    res.json({
      success: true,
      cancelled: result.cancelled,
      message:
        result.cancelled > 0
          ? 'Pending gold purchase cancelled. You can start a new buy.'
          : 'No pending gold purchase found.'
    });
  } catch (err) {
    next(err);
  }
});

function generateSellClientReferenceId(userId) {
  const suffix = crypto.randomBytes(4).toString('hex');
  return `SGS_${userId}_${Date.now()}_${suffix}`;
}

function walletPayload(wallet, source) {
  return {
    balanceGrams: wallet.balanceGrams,
    sellableBalanceGrams: wallet.sellableBalanceGrams ?? wallet.balanceGrams ?? 0,
    safegoldUserId: wallet.safegoldUserId,
    balanceSource: source || wallet.balanceSource,
    lastSyncedAt: wallet.lastSyncedAt
  };
}

// GET /api/safegold/sell-price — live sell rate (public)
router.get('/sell-price', async (req, res, next) => {
  try {
    const price = await fetchSellPrice();
    res.json({
      currentPrice: price.current_price,
      applicableTax: price.applicable_tax || 0,
      rateId: price.rate_id,
      rateValidity: price.rate_validity,
      expiresAt: price.expiresAt,
      source: price.source,
      mock: price.source !== 'safegold',
      mockReason: price.mockReason || null,
      limits: { minSellInr: MIN_SELL_INR }
    });
  } catch (err) {
    handleSafeGoldError(err, res, next);
  }
});

// POST /api/safegold/sell/quote — grams ↔ INR at sell rate (JWT so holdings can be checked)
router.post('/sell/quote', authMiddleware, async (req, res, next) => {
  try {
    const { mode = 'inr', value, rateId } = req.body;
    const numValue = Number(value);

    if (!numValue || numValue <= 0) {
      return res.status(400).json({ message: 'Enter a valid amount', code: 'INVALID_AMOUNT' });
    }
    if (mode === 'inr' && !Number.isInteger(numValue)) {
      return res.status(400).json({
        message: 'Enter a whole rupee amount (no decimals)',
        code: 'INVALID_AMOUNT'
      });
    }

    const synced = await syncHoldingsFromSafeGold(req.user._id);
    const sellableGrams =
      Number(synced.wallet.sellableBalanceGrams) > 0
        ? Number(synced.wallet.sellableBalanceGrams)
        : Number(synced.wallet.balanceGrams) || 0;

    let priceData = await fetchSellPrice();
    if (rateId && String(rateId) !== String(priceData.rate_id)) {
      priceData = await fetchSellPrice();
    }

    try {
      const quote = calculateSellQuote(priceData, mode, numValue, sellableGrams);
      res.json({
        ...quote,
        wallet: walletPayload(synced.wallet, synced.source)
      });
    } catch (quoteErr) {
      const code = quoteErr.code === 'INSUFFICIENT_BALANCE' ? 'INSUFFICIENT_BALANCE' : 'QUOTE_ERROR';
      return res.status(400).json({
        message: quoteErr.message,
        code,
        sellableGrams
      });
    }
  } catch (err) {
    handleSafeGoldError(err, res, next);
  }
});

// POST /api/safegold/sell/initiate — SafeGold sell verify → confirm → status
router.post('/sell/initiate', authMiddleware, async (req, res, next) => {
  try {
    const { mode = 'inr', value, rateId } = req.body;
    const numValue = Number(value);

    if (!numValue || numValue <= 0) {
      return res.status(400).json({ message: 'Enter a valid amount', code: 'INVALID_AMOUNT' });
    }
    if (mode === 'inr' && !Number.isInteger(numValue)) {
      return res.status(400).json({
        message: 'Enter a whole rupee amount (no decimals)',
        code: 'INVALID_AMOUNT'
      });
    }

    const mobile = normalizeMobile(req.user.mobile);
    if (!req.user.name?.trim()) {
      return res.status(400).json({
        message: 'Please update your name in profile before selling gold',
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

    const synced = await syncHoldingsFromSafeGold(req.user._id);
    const mapping = synced.mapping || (await getCustomerMapping(req.user._id));
    const safegoldUserId = mapping?.safegoldCustomerId || synced.wallet.safegoldUserId;

    if (!safegoldUserId && !useMock()) {
      return res.status(400).json({
        message: 'Link your SafeGold vault before selling gold.',
        code: 'SAFEGOLD_NOT_LINKED'
      });
    }

    const sellableGrams =
      Number(synced.wallet.sellableBalanceGrams) > 0
        ? Number(synced.wallet.sellableBalanceGrams)
        : Number(synced.wallet.balanceGrams) || 0;

    // rate_id from Live Sell Price must be used for verify; reject if distributor timer expired
    const priceData = await fetchSellPrice();
    if (rateId && String(rateId) !== String(priceData.rate_id)) {
      return res.status(400).json({
        message: 'Gold sell rate has expired. Please refresh and try again.',
        code: 'RATE_EXPIRED'
      });
    }
    if (priceData.expiresAt && new Date(priceData.expiresAt).getTime() <= Date.now()) {
      return res.status(400).json({
        message: 'Gold sell rate has expired. Please refresh and try again.',
        code: 'RATE_EXPIRED'
      });
    }

    let quote;
    try {
      quote = calculateSellQuote(priceData, mode, numValue, sellableGrams);
    } catch (quoteErr) {
      const code = quoteErr.code === 'INSUFFICIENT_BALANCE' ? 'INSUFFICIENT_BALANCE' : 'QUOTE_ERROR';
      return res.status(400).json({ message: quoteErr.message, code, sellableGrams });
    }

    const clientReferenceId = generateSellClientReferenceId(req.user._id);
    const transaction = await SafeGoldTransaction.create({
      user: req.user._id,
      type: 'sell',
      status: 'processing',
      clientReferenceId,
      rateId: quote.rateId,
      currentPrice: quote.currentPrice,
      applicableTax: 0,
      goldAmount: quote.goldAmount,
      buyPrice: quote.sellPrice,
      paymentProvider: 'mock',
      safegoldUserId: safegoldUserId || null
    });

    try {
      // Docs flow: sell-gold-verify → sell-gold-confirm → order-status
      const sellResult = await executeSell({
        safegoldUserId: safegoldUserId || `local_${req.user._id}`,
        rateId: quote.rateId,
        goldAmount: quote.goldAmount,
        sellPrice: quote.sellPrice
      });

      transaction.status = 'success';
      transaction.sellTxId = sellResult.sell_tx_id || null;
      transaction.buyTxId = sellResult.sell_tx_id || transaction.buyTxId;
      transaction.invoiceId = sellResult.invoice_id || null;
      transaction.settledStatus =
        sellResult.settled_status != null ? Number(sellResult.settled_status) : null;
      transaction.sgRate = sellResult.sg_rate || quote.currentPrice;
      transaction.safegoldUserId = sellResult.customer_user_id || safegoldUserId;
      await transaction.save();

      let walletAfter = synced.wallet;
      if (useMock() || synced.source === 'local') {
        const wallet = await getOrCreateWallet(req.user._id);
        const nextBalance = Math.max(
          0,
          Math.round((wallet.balanceGrams - quote.goldAmount) * 10000) / 10000
        );
        wallet.balanceGrams = nextBalance;
        wallet.sellableBalanceGrams = nextBalance;
        wallet.lastSyncedAt = new Date();
        await wallet.save();
        walletAfter = wallet;
      } else {
        const refreshed = await syncHoldingsFromSafeGold(req.user._id);
        walletAfter = refreshed.wallet;
      }

      res.json({
        success: true,
        message: 'Gold sold successfully',
        safegoldTransactionId: transaction._id,
        clientReferenceId,
        quote,
        transaction,
        sell: {
          txId: sellResult.sell_tx_id,
          invoiceId: sellResult.invoice_id,
          orderStatus: sellResult.order_status,
          settledStatus: sellResult.settled_status,
          bankReferenceNumber: sellResult.bank_reference_number
        },
        wallet: walletPayload(walletAfter, useMock() ? 'local' : synced.source)
      });
    } catch (sellErr) {
      transaction.status = 'failed';
      transaction.failureReason = sellErr.message || 'SafeGold sell failed';
      await transaction.save();
      throw sellErr;
    }
  } catch (err) {
    handleSafeGoldError(err, res, next);
  }
});

module.exports = router;
