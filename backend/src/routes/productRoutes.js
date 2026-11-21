const express = require('express');
const Product = require('../models/Product');

const router = express.Router();

function escapeRegex(str) {
  return String(str).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

const SEARCH_FIELDS = [
  'name',
  'displayName',
  'slug',
  'category',
  'description',
  'sku',
  'metal',
  'type',
  'purity',
  'shape',
  'tags'
];

/** Each word must match a name, metal, type, or other catalogue field. */
function searchTermClause(term) {
  const rx = new RegExp(escapeRegex(term), 'i');
  const ors = SEARCH_FIELDS.map((field) => ({ [field]: rx }));
  const key = term.toLowerCase().replace(/[^a-z0-9+]/g, '');
  if (key === 'coin' || key === 'coins') ors.push({ type: 'physical_coin' });
  if (key === 'bar' || key === 'bars') ors.push({ type: 'physical_bar' });
  if (key === 'gift' || key === 'gifts' || key === 'gifting') ors.push({ type: 'gifting' });
  if (key === 'etf' || key === 'etfs') ors.push({ type: 'etf' });
  if (key === '24k' || key === '24kt' || key === '999' || key === '24karat') {
    ors.push({ metal: { $in: ['gold', 'gold+silver'] } });
    ors.push({ purity: /24|999/i });
  }
  return { $or: ors };
}

// List active products with optional pagination, filters, and search (q)
router.get('/', async (req, res, next) => {
  try {
    const { metal, featured, q, search, catalog } = req.query;
    const filter = { isActive: true };
    const catalogKey = String(catalog || '').trim().toLowerCase();
    if (catalogKey === 'mmtc-pamp' || catalogKey === 'mmtc') {
      filter.catalog = 'mmtc-pamp';
    } else if (catalogKey !== 'all') {
      filter.catalog = { $ne: 'mmtc-pamp' };
    }
    if (metal) filter.metal = metal;
    if (featured === 'true') filter.isFeatured = true;

    const qStr = String(q || search || '').trim();
    const words = qStr.split(/\s+/).filter(Boolean).slice(0, 8);
    if (words.length) {
      filter.$and = words.map(searchTermClause);
    }

    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    let limit = parseInt(req.query.limit, 10);
    if (!Number.isFinite(limit) || limit < 1) limit = 100;
    if (limit > 500) limit = 500;
    const skip = (page - 1) * limit;

    const total = await Product.countDocuments(filter);
    const sort =
      filter.catalog === 'mmtc-pamp' ? { sortOrder: 1, name: 1 } : { createdAt: -1 };
    const products = await Product.find(filter).sort(sort).skip(skip).limit(limit);

    res.json({
      products,
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

// Get single product by slug
router.get('/:slug', async (req, res, next) => {
  try {
    const product = await Product.findOne({ slug: req.params.slug, isActive: true });
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.json(product);
  } catch (err) {
    next(err);
  }
});

module.exports = router;

