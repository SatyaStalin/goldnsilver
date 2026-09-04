const express = require('express');
const Product = require('../models/Product');
const Order = require('../models/Order');
const MetalRateSettings = require('../models/MetalRateSettings');
const User = require('../models/User');
const SafeGoldCustomer = require('../models/SafeGoldCustomer');
const SafeGoldWallet = require('../models/SafeGoldWallet');
const SafeGoldTransaction = require('../models/SafeGoldTransaction');
const {
  ensureSafeGoldCustomer,
  resetSafeGoldCustomerLink,
  syncHoldingsFromSafeGold
} = require('../services/safegoldCustomerService');
const upload = require('../middleware/upload');
const router = express.Router();

function parseListQuery(req, defaultLimit = 10, maxLimit = 100) {
  const page = Math.max(1, parseInt(req.query.page, 10) || 1);
  let limit = parseInt(req.query.limit, 10);
  if (!Number.isFinite(limit) || limit < 1) limit = defaultLimit;
  if (limit > maxLimit) limit = maxLimit;
  const skip = (page - 1) * limit;
  return { page, limit, skip };
}

function escapeRegex(str) {
  return String(str).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function searchRegex(q) {
  const trimmed = String(q || '').trim();
  if (!trimmed) return null;
  return new RegExp(escapeRegex(trimmed), 'i');
}

/** Substring match on document _id as string (partial ObjectId / “last 12 chars” from admin UI). */
function matchIdStringContainsExpr(rawTrim) {
  const pattern = escapeRegex(String(rawTrim || '').trim());
  if (!pattern) return null;
  return {
    $expr: {
      $regexMatch: {
        input: { $toString: '$_id' },
        regex: pattern,
        options: 'i'
      }
    }
  };
}

async function getOrCreateMetalRates() {
  let doc = await MetalRateSettings.findOne({ key: 'global' });
  if (!doc) {
    doc = await MetalRateSettings.create({ key: 'global', goldPerGram: 0, silverPerGram: 0 });
  }
  return doc;
}

function computePriceFromRates(productLike, rates) {
  const g =
    productLike.metalGrams != null && Number(productLike.metalGrams) > 0
      ? Number(productLike.metalGrams)
      : 1;
  const gold = Number(rates.goldPerGram) || 0;
  const silver = Number(rates.silverPerGram) || 0;
  const metal = productLike.metal || 'gold';
  let base = 0;
  if (metal === 'gold') base = gold * g;
  else if (metal === 'silver') base = silver * g;
  else if (metal === 'gold+silver') base = ((gold + silver) / 2) * g;
  else base = gold * g;
  return Math.round(base * 100) / 100;
}

/** Prefer explicit pricingMode; legacy syncPriceFromRates=false → fixed when mode omitted */
function normalizePricingMode(body) {
  if (!body || typeof body !== 'object') return 'rate_based';
  const raw = body.pricingMode ?? body.pricing_mode;
  if (raw != null && raw !== '') {
    const s = String(raw).trim().toLowerCase();
    if (
      s === 'fixed' ||
      s === 'fixed_price' ||
      s === 'fixed-price' ||
      s === 'direct' ||
      s === 'manual'
    ) {
      return 'fixed';
    }
    if (
      s === 'rate_based' ||
      s === 'rate-based' ||
      s === 'rate_linked' ||
      s === 'rate-linked' ||
      s === 'ratelinked' ||
      s === 'spot'
    ) {
      return 'rate_based';
    }
  }
  if (body.syncPriceFromRates === false) return 'fixed';
  return 'rate_based';
}

function sanitizeProductFields(body) {
  const pricingMode = normalizePricingMode(body);
  return {
    name: body.name,
    slug: body.slug,
    metal: body.metal,
    type: body.type,
    category: body.category ?? '',
    description: body.description ?? '',
    pricePerUnit: Number(body.pricePerUnit) || 0,
    metalGrams:
      body.metalGrams != null && body.metalGrams !== ''
        ? Number(body.metalGrams)
        : pricingMode === 'fixed'
          ? 0
          : 1,
    unit: body.unit || 'gram',
    stock: Number(body.stock) || 0,
    imageUrl: body.imageUrl || '',
    isFeatured: Boolean(body.isFeatured),
    isActive: body.isActive == null ? true : Boolean(body.isActive),
    pricingMode
  };
}

function isRateBasedProduct(productLike) {
  return normalizePricingMode(productLike || {}) !== 'fixed';
}

function normalizePricingModeQuery(pricingModeQuery) {
  if (pricingModeQuery == null || pricingModeQuery === '') return '';
  const v = Array.isArray(pricingModeQuery) ? pricingModeQuery[0] : pricingModeQuery;
  return String(v).trim().toLowerCase();
}

/**
 * Admin list tabs must be mutually exclusive. Never return {} — that would list all products on every tab.
 * Rate-linked tab = anything not explicitly stored as pricingMode 'fixed' (legacy/missing field included).
 */
function pricingTabFilter(pricingModeQuery) {
  const raw = normalizePricingModeQuery(pricingModeQuery);
  if (raw === 'fixed') {
    return { pricingMode: 'fixed' };
  }
  return { pricingMode: { $ne: 'fixed' } };
}

// Get all products (admin - includes inactive) with pagination (optional pricingMode=fixed | rate_based)
router.get('/products', async (req, res, next) => {
  try {
    const { page, limit, skip } = parseListQuery(req, 10, 100);

    const filter = { ...pricingTabFilter(req.query.pricingMode) };
    const qRx = searchRegex(req.query.q ?? req.query.search);
    if (qRx) {
      filter.$or = [{ name: qRx }, { slug: qRx }, { category: qRx }, { description: qRx }];
    }
    const metalQ = req.query.metal;
    if (metalQ && String(metalQ).trim()) {
      filter.metal = String(metalQ).trim();
    }
    const typeQ = req.query.type;
    if (typeQ && String(typeQ).trim()) {
      filter.type = String(typeQ).trim();
    }
    if (req.query.isActive === 'true') filter.isActive = true;
    else if (req.query.isActive === 'false') filter.isActive = false;

    const total = await Product.countDocuments(filter);
    const products = await Product.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const rateLinkedTotal = await Product.countDocuments({ pricingMode: { $ne: 'fixed' } });
    const fixedTotal = await Product.countDocuments({ pricingMode: 'fixed' });

    res.json({
      products,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit) || 1,
        totalItems: total,
        itemsPerPage: limit,
        tabCounts: { rateLinked: rateLinkedTotal, fixed: fixedTotal }
      }
    });
  } catch (err) {
    next(err);
  }
});

// Upload product image
router.post('/products/upload-image', upload.single('image'), async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No image file provided' });
    }
    const imageUrl = `/uploads/products/${req.file.filename}`;
    res.json({ imageUrl, filename: req.file.filename });
  } catch (err) {
    next(err);
  }
});

// Admin gold/silver per-gram rates (INR)
router.get('/gold-rates', async (req, res, next) => {
  try {
    const doc = await getOrCreateMetalRates();
    res.json({
      goldPerGram: doc.goldPerGram,
      silverPerGram: doc.silverPerGram,
      updatedAt: doc.updatedAt
    });
  } catch (err) {
    next(err);
  }
});

router.put('/gold-rates', async (req, res, next) => {
  try {
    const gold = parseFloat(req.body.goldPerGram);
    const silver = parseFloat(req.body.silverPerGram);
    if (Number.isNaN(gold) || Number.isNaN(silver) || gold < 0 || silver < 0) {
      return res
        .status(400)
        .json({ message: 'goldPerGram and silverPerGram must be non-negative numbers' });
    }
    const doc = await MetalRateSettings.findOneAndUpdate(
      { key: 'global' },
      { goldPerGram: gold, silverPerGram: silver },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );
    let bulkUpdated = 0;
    if (req.body.applyAll === true) {
      const products = await Product.find();
      for (const p of products) {
        if (!isRateBasedProduct(p)) continue;
        p.pricePerUnit = computePriceFromRates(p, doc);
        await p.save();
        bulkUpdated += 1;
      }
    }
    res.json({
      goldPerGram: doc.goldPerGram,
      silverPerGram: doc.silverPerGram,
      bulkUpdated
    });
  } catch (err) {
    next(err);
  }
});

// Create product
router.post('/products', async (req, res, next) => {
  try {
    const body = sanitizeProductFields(req.body);
    const rates = await getOrCreateMetalRates();
    const useRates =
      body.pricingMode === 'rate_based' &&
      (rates.goldPerGram > 0 || rates.silverPerGram > 0);
    if (useRates) {
      const temp = new Product(body);
      body.pricePerUnit = computePriceFromRates(temp, rates);
    }
    const product = new Product(body);
    await product.save();
    res.status(201).json(product);
  } catch (err) {
    next(err);
  }
});

// Update product
router.put('/products/:id', async (req, res, next) => {
  try {
    const existing = await Product.findById(req.params.id);
    if (!existing) {
      return res.status(404).json({ message: 'Product not found' });
    }
    // Single merge: inbound body overrides DB; normalizePricingMode runs on the combined object so
    // pricingMode/syncPriceFromRates from the client always wins (avoid hasOwnProperty / partial merges).
    const combined = {
      ...existing.toObject({ flattenMaps: false }),
      ...req.body
    };
    const update = sanitizeProductFields(combined);
    const rates = await getOrCreateMetalRates();
    const useRates =
      update.pricingMode === 'rate_based' &&
      (rates.goldPerGram > 0 || rates.silverPerGram > 0);
    if (useRates) {
      const temp = new Product({
        metal: update.metal,
        metalGrams: update.metalGrams,
        pricingMode: update.pricingMode
      });
      update.pricePerUnit = computePriceFromRates(temp, rates);
    }
    const product = await Product.findByIdAndUpdate(req.params.id, update, {
      new: true,
      runValidators: true
    });
    res.json(product);
  } catch (err) {
    next(err);
  }
});

// Delete product
router.delete('/products/:id', async (req, res, next) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.json({ message: 'Product deleted successfully' });
  } catch (err) {
    next(err);
  }
});

// Get dashboard stats — SafeGold success buys are the source of truth for totals
router.get('/dashboard', async (req, res, next) => {
  try {
    const [sgTotals] = await SafeGoldTransaction.aggregate([
      {
        $group: {
          _id: null,
          pendingOrders: {
            $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] }
          },
          completedOrders: {
            $sum: { $cond: [{ $eq: ['$status', 'success'] }, 1, 0] }
          },
          totalRevenue: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $eq: ['$status', 'success'] },
                    { $ne: ['$type', 'sell'] }
                  ]
                },
                { $ifNull: ['$buyPrice', 0] },
                0
              ]
            }
          }
        }
      }
    ]);

    const pendingOrders = sgTotals?.pendingOrders || 0;
    const completedOrders = sgTotals?.completedOrders || 0;
    const totalOrders = completedOrders;
    const totalRevenue = Math.round((sgTotals?.totalRevenue || 0) * 100) / 100;

    // Monthly revenue for last 6 months (SafeGold success only)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const monthlyData = await SafeGoldTransaction.aggregate([
      {
        $match: {
          status: 'success',
          type: { $ne: 'sell' },
          createdAt: { $gte: sixMonthsAgo }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          revenue: { $sum: { $ifNull: ['$buyPrice', 0] } }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const monthlyRevenue = [];
    const monthlyLabels = [];

    monthlyData.forEach((item) => {
      monthlyRevenue.push(Math.round((item.revenue || 0) * 100) / 100);
      monthlyLabels.push(`${monthNames[item._id.month - 1]} ${item._id.year}`);
    });

    while (monthlyRevenue.length < 6) {
      monthlyRevenue.unshift(0);
      const date = new Date();
      date.setMonth(date.getMonth() - (6 - monthlyRevenue.length));
      monthlyLabels.unshift(`${monthNames[date.getMonth()]} ${date.getFullYear()}`);
    }

    const productDistribution = totalRevenue > 0
      ? [{ _id: 'gold', revenue: totalRevenue }]
      : [];

    const rateLinkedProductCount = await Product.countDocuments({ pricingMode: { $ne: 'fixed' } });
    const fixedPriceProductCount = await Product.countDocuments({
      pricingMode: 'fixed'
    });

    res.json({
      totalRevenue,
      totalOrders,
      pendingOrders,
      completedOrders,
      monthlyRevenue: monthlyRevenue.slice(-6),
      monthlyLabels: monthlyLabels.slice(-6),
      productDistribution,
      rateLinkedProductCount,
      fixedPriceProductCount,
      source: 'safegold'
    });
  } catch (err) {
    next(err);
  }
});

// Get orders with pagination, status filter, and search (customer fields + linked user)
router.get('/orders', async (req, res, next) => {
  try {
    const { page, limit, skip } = parseListQuery(req, 10, 100);
    const match = {};
    if (req.query.status) {
      match.status = String(req.query.status).trim();
    }
    if (req.query.paymentStatus) {
      match.paymentStatus = String(req.query.paymentStatus).trim();
    }

    const rawTrim = String(req.query.q ?? req.query.search ?? '').trim();
    const qRx = searchRegex(rawTrim);
    if (qRx) {
      const idSub = matchIdStringContainsExpr(rawTrim);
      const or = [
        { customerName: qRx },
        { customerEmail: qRx },
        { customerPhone: qRx },
        { paymentOrderId: qRx },
        { paymentId: qRx },
        { 'items.name': qRx },
        ...(idSub ? [idSub] : [])
      ];
      const User = require('../models/User');
      const matchedUsers = await User.find({
        $or: [{ name: qRx }, { email: qRx }]
      })
        .select('_id')
        .lean();
      if (matchedUsers.length) {
        or.push({ user: { $in: matchedUsers.map((u) => u._id) } });
      }
      match.$or = or;
    }

    const col = Order.collection;
    const [total, rawOrders] = await Promise.all([
      col.countDocuments(match),
      col.find(match).sort({ createdAt: -1 }).skip(skip).limit(limit).toArray()
    ]);
    const orders = await Order.populate(rawOrders, [
      { path: 'user', select: 'name email' },
      { path: 'items.product', select: 'name slug imageUrl metal type' }
    ]);

    res.json({
      orders,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit) || 1,
        totalItems: total,
        itemsPerPage: limit
      }
    });
  } catch (err) {
    next(err);
  }
});

// Update order status
router.put('/orders/:id/status', async (req, res, next) => {
  try {
    const { status } = req.body;
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    ).populate('user', 'name email');
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    res.json(order);
  } catch (err) {
    next(err);
  }
});

// Users list (portal users) with SafeGold status + SafeGold success totals
router.get('/users', async (req, res, next) => {
  try {
    const { page, limit, skip } = parseListQuery(req, 10, 100);
    const qRaw = String(req.query.q ?? req.query.search ?? '').trim();
    const qRx = searchRegex(qRaw);

    const filter = { userType: { $ne: 'admin' } };
    if (qRx) {
      const idSub = matchIdStringContainsExpr(qRaw);
      filter.$or = [
        { name: qRx },
        { email: qRx },
        { mobile: qRx },
        ...(idSub ? [idSub] : [])
      ];
    }

    const [total, userDocs] = await Promise.all([
      User.countDocuments(filter),
      User.find(filter)
        .select('name email mobile createdAt userType')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean()
    ]);

    const userIds = userDocs.map((u) => u._id);

    const [mappings, wallets, sgTotals] = await Promise.all([
      userIds.length ? SafeGoldCustomer.find({ user: { $in: userIds } }).lean() : [],
      userIds.length ? SafeGoldWallet.find({ user: { $in: userIds } }).lean() : [],
      userIds.length
        ? SafeGoldTransaction.aggregate([
            { $match: { status: 'success', user: { $in: userIds } } },
            {
              $group: {
                _id: '$user',
                totalOrders: { $sum: 1 },
                totalSpent: { $sum: { $ifNull: ['$buyPrice', 0] } },
                lastPurchaseDate: { $max: '$createdAt' }
              }
            }
          ])
        : []
    ]);

    const mappingByUser = new Map(mappings.map((m) => [String(m.user), m]));
    const walletByUser = new Map(wallets.map((w) => [String(w.user), w]));
    const sgTotalsByUser = new Map(sgTotals.map((t) => [String(t._id), t]));

    res.json({
      users: userDocs.map((u) => {
        const m = mappingByUser.get(String(u._id)) || null;
        const w = walletByUser.get(String(u._id)) || null;
        const t = sgTotalsByUser.get(String(u._id)) || null;
        return {
          _id: String(u._id),
          userId: u._id,
          name: u.name || null,
          email: u.email || null,
          phone: u.mobile || null,
          totalOrders: t?.totalOrders || 0,
          totalSpent: Math.round((t?.totalSpent || 0) * 100) / 100,
          lastPurchaseDate: t?.lastPurchaseDate || null,
          safegold: {
            linked: Boolean(m?.safegoldCustomerId && m?.status === 'active'),
            status: m?.status || 'not_linked',
            safegoldCustomerId: m?.safegoldCustomerId || null,
            lastError: m?.lastError || null,
            walletBalanceGrams: w?.balanceGrams ?? null,
            walletLastSyncedAt: w?.lastSyncedAt ?? null
          }
        };
      }),
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit) || 1,
        totalItems: total,
        itemsPerPage: limit
      },
      source: 'portal_users_with_safegold'
    });
  } catch (err) {
    next(err);
  }
});

// Admin: (Re)register a portal user with SafeGold
router.post('/users/:userId/safegold/register', async (req, res, next) => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const mapping = await ensureSafeGoldCustomer(user);
    const synced = await syncHoldingsFromSafeGold(user._id);

    res.json({
      success: true,
      message: mapping?.safegoldCustomerId
        ? 'SafeGold vault linked successfully'
        : 'SafeGold vault could not be linked',
      customer: mapping,
      wallet: synced.wallet
    });
  } catch (err) {
    next(err);
  }
});

// Admin: clear local SafeGold link (so user can re-register fresh)
router.delete('/users/:userId/safegold/reset', async (req, res, next) => {
  try {
    const user = await User.findById(req.params.userId).select('_id');
    if (!user) return res.status(404).json({ message: 'User not found' });
    await resetSafeGoldCustomerLink(user._id);
    res.json({ success: true, message: 'Local SafeGold link cleared for user' });
  } catch (err) {
    next(err);
  }
});

// Buyback requests — pagination, status, metal, search
router.get('/buybacks', async (req, res, next) => {
  try {
    const BuybackRequest = require('../models/BuybackRequest');
    const { page, limit, skip } = parseListQuery(req, 10, 100);
    const filter = {};
    if (req.query.status) filter.status = String(req.query.status).trim();
    if (req.query.metal) filter.metal = String(req.query.metal).trim();
    const qRaw = String(req.query.q ?? req.query.search ?? '').trim();
    const qRx = searchRegex(qRaw);
    if (qRx) {
      const idSub = matchIdStringContainsExpr(qRaw);
      const parts = [{ customerName: qRx }, { notes: qRx }, ...(idSub ? [idSub] : [])];
      filter.$or = parts;
    }

    const col = BuybackRequest.collection;
    const [total, buybacks] = await Promise.all([
      col.countDocuments(filter),
      col.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).toArray()
    ]);

    res.json({
      buybacks,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit) || 1,
        totalItems: total,
        itemsPerPage: limit
      }
    });
  } catch (err) {
    next(err);
  }
});

// Update buyback status
router.put('/buybacks/:id', async (req, res, next) => {
  try {
    const BuybackRequest = require('../models/BuybackRequest');
    const buyback = await BuybackRequest.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!buyback) {
      return res.status(404).json({ message: 'Buyback request not found' });
    }
    res.json(buyback);
  } catch (err) {
    next(err);
  }
});

/**
 * KYC admin review
 * Correct approve path: update BOTH User.kycStatus AND KycDocument.status
 * (User alone is not enough — documents live on KycDocument)
 */
const KycDocument = require('../models/KycDocument');
const path = require('path');
const {
  resolveKycFilePath,
  toClientKyc,
  syncUserKycFields,
  maskPan
} = require('../services/kycService');

router.get('/kyc', async (req, res, next) => {
  try {
    const status = String(req.query.status || '').trim();
    const filter = {};
    if (['pending', 'approved', 'rejected'].includes(status)) {
      filter.status = status;
    }

    const { page, limit, skip } = parseListQuery(req, 20, 50);

    const [total, docs] = await Promise.all([
      KycDocument.countDocuments(filter),
      KycDocument.find(filter)
        .populate('user', 'name email mobile kycStatus')
        .sort({ updatedAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean()
    ]);

    res.json({
      items: docs.map((d) => ({
        id: d._id,
        user: d.user,
        method: d.method,
        fullName: d.fullName,
        panMasked: d.panNumber ? maskPan(d.panNumber) : null,
        aadhaarLast4: d.aadhaarLast4 || null,
        status: d.status,
        rejectionReason: d.rejectionReason,
        submittedAt: d.createdAt,
        reviewedAt: d.reviewedAt,
        documents: {
          panFront: Boolean(d.documents?.panFront?.fileKey),
          aadhaarFront: Boolean(d.documents?.aadhaarFront?.fileKey),
          aadhaarBack: Boolean(d.documents?.aadhaarBack?.fileKey)
        }
      })),
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit) || 1,
        totalItems: total,
        itemsPerPage: limit
      }
    });
  } catch (err) {
    next(err);
  }
});

router.get('/kyc/:kycId/documents/:type', async (req, res, next) => {
  try {
    const type = String(req.params.type || '');
    const allowed = { panFront: true, aadhaarFront: true, aadhaarBack: true };
    if (!allowed[type]) {
      return res.status(400).json({ message: 'Invalid document type' });
    }

    const doc = await KycDocument.findById(req.params.kycId);
    if (!doc) {
      return res.status(404).json({ message: 'KYC record not found' });
    }

    const meta = doc.documents?.[type];
    if (!meta?.fileKey) {
      return res.status(404).json({ message: 'Document not uploaded' });
    }

    const fullPath = resolveKycFilePath(meta.fileKey);
    if (!fullPath) {
      return res.status(404).json({ message: 'Document file missing on server' });
    }

    res.setHeader('Content-Type', meta.mimeType || 'application/octet-stream');
    res.setHeader(
      'Content-Disposition',
      `inline; filename="${path.basename(meta.originalName || meta.fileKey)}"`
    );
    res.sendFile(fullPath);
  } catch (err) {
    next(err);
  }
});

router.put('/kyc/:kycId/review', async (req, res, next) => {
  try {
    const { status, rejectionReason } = req.body;
    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ message: 'status must be approved or rejected' });
    }
    if (status === 'rejected' && !String(rejectionReason || '').trim()) {
      return res.status(400).json({ message: 'Rejection reason is required' });
    }

    const doc = await KycDocument.findById(req.params.kycId);
    if (!doc) {
      return res.status(404).json({ message: 'KYC record not found' });
    }

    const now = new Date();
    doc.status = status;
    doc.reviewedAt = now;
    doc.rejectionReason = status === 'rejected' ? String(rejectionReason).trim() : null;
    await doc.save();

    // Keep User + KycDocument in sync (checkout gate reads User.kycStatus)
    const user = await syncUserKycFields(doc.user, {
      kycStatus: status,
      kycMethod: doc.method,
      kycVerifiedAt: status === 'approved' ? now : null,
      kycRejectedReason: status === 'rejected' ? doc.rejectionReason : null
    });

    res.json({
      message: status === 'approved' ? 'KYC approved — user verified' : 'KYC rejected — reason saved',
      kyc: toClientKyc(doc, user)
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
