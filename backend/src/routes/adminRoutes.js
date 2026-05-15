const express = require('express');
const Product = require('../models/Product');
const Order = require('../models/Order');
const MetalRateSettings = require('../models/MetalRateSettings');
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

// Get dashboard stats
router.get('/dashboard', async (req, res, next) => {
  try {
    const totalOrders = await Order.countDocuments();
    const pendingOrders = await Order.countDocuments({ status: 'pending' });
    const completedOrders = await Order.countDocuments({ status: { $in: ['paid', 'delivered'] } });
    
    // Calculate total revenue from paid/delivered orders
    const revenueOrders = await Order.find({ 
      status: { $in: ['paid', 'delivered'] },
      paymentStatus: 'success'
    });
    const totalRevenue = revenueOrders.reduce((sum, order) => sum + (order.totalAmount || 0), 0);

    // Get monthly revenue for last 6 months
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    
    const monthlyData = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: sixMonthsAgo },
          status: { $in: ['paid', 'delivered'] },
          paymentStatus: 'success'
        }
      },
      {
        $group: {
          _id: { 
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          revenue: { $sum: '$totalAmount' }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const monthlyRevenue = [];
    const monthlyLabels = [];

    monthlyData.forEach(item => {
      monthlyRevenue.push(item.revenue);
      monthlyLabels.push(`${monthNames[item._id.month - 1]} ${item._id.year}`);
    });

    // Fill missing months with 0
    while (monthlyRevenue.length < 6) {
      monthlyRevenue.unshift(0);
      const date = new Date();
      date.setMonth(date.getMonth() - (6 - monthlyRevenue.length));
      monthlyLabels.unshift(`${monthNames[date.getMonth()]} ${date.getFullYear()}`);
    }

    // Get revenue distribution by product type
    const productDistribution = await Order.aggregate([
      {
        $match: {
          status: { $in: ['paid', 'delivered'] },
          paymentStatus: 'success'
        }
      },
      { $unwind: '$items' },
      {
        $lookup: {
          from: 'products',
          localField: 'items.product',
          foreignField: '_id',
          as: 'productInfo'
        }
      },
      { $unwind: '$productInfo' },
      {
        $group: {
          _id: '$productInfo.metal',
          revenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } }
        }
      }
    ]);

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
      fixedPriceProductCount
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

// Purchasers aggregated from orders — pagination + search (name / email / phone)
router.get('/users', async (req, res, next) => {
  try {
    const { page, limit, skip } = parseListQuery(req, 10, 100);
    const qRx = searchRegex(req.query.q ?? req.query.search);

    const pipeline = [
      {
        $match: {
          $or: [{ user: { $ne: null } }, { customerEmail: { $exists: true, $ne: null } }]
        }
      },
      {
        $addFields: {
          groupKey: {
            $cond: {
              if: { $ne: ['$user', null] },
              then: { $toString: '$user' },
              else: { $ifNull: ['$customerEmail', 'guest'] }
            }
          }
        }
      },
      { $sort: { createdAt: -1 } },
      {
        $group: {
          _id: '$groupKey',
          totalOrders: { $sum: 1 },
          totalSpent: { $sum: '$totalAmount' },
          lastPurchaseDate: { $max: '$createdAt' },
          name: { $first: '$customerName' },
          email: { $first: '$customerEmail' },
          phone: { $first: '$customerPhone' },
          userId: { $first: '$user' }
        }
      },
      {
        $lookup: {
          from: 'users',
          let: { uid: '$userId' },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [{ $ne: ['$$uid', null] }, { $eq: ['$_id', '$$uid'] }]
                }
              }
            },
            { $project: { name: 1, email: 1 } }
          ],
          as: 'userDoc'
        }
      },
      {
        $addFields: {
          name: {
            $ifNull: [{ $arrayElemAt: ['$userDoc.name', 0] }, '$name']
          },
          email: {
            $ifNull: [{ $arrayElemAt: ['$userDoc.email', 0] }, '$email']
          }
        }
      },
      { $project: { userDoc: 0, userId: 0 } }
    ];

    if (qRx) {
      const rawTrim = String(req.query.q ?? req.query.search ?? '').trim();
      const idSub = matchIdStringContainsExpr(rawTrim);
      const pattern = escapeRegex(rawTrim);
      pipeline.push({
        $match: {
          $or: [
            { name: qRx },
            { email: qRx },
            { phone: qRx },
            {
              $expr: {
                $regexMatch: {
                  input: { $toString: { $ifNull: ['$phone', ''] } },
                  regex: pattern,
                  options: 'i'
                }
              }
            },
            ...(idSub ? [idSub] : [])
          ]
        }
      });
    }

    pipeline.push({
      $facet: {
        meta: [{ $count: 'total' }],
        data: [{ $sort: { lastPurchaseDate: -1 } }, { $skip: skip }, { $limit: limit }]
      }
    });

    const agg = await Order.aggregate(pipeline);
    const facet = agg[0] || { meta: [], data: [] };
    const total = facet.meta[0]?.total ?? 0;
    const usersData = facet.data.map((row) => ({
      _id: row._id,
      name: row.name || null,
      email: row.email || null,
      phone: row.phone || null,
      totalOrders: row.totalOrders,
      totalSpent: row.totalSpent,
      lastPurchaseDate: row.lastPurchaseDate
    }));

    res.json({
      users: usersData,
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

module.exports = router;
