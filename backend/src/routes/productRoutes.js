const express = require('express');
const Product = require('../models/Product');

const router = express.Router();

function escapeRegex(str) {
  return String(str).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// List active products with optional pagination, filters, and search (q)
router.get('/', async (req, res, next) => {
  try {
    const { metal, featured, q, search } = req.query;
    const filter = { isActive: true };
    if (metal) filter.metal = metal;
    if (featured === 'true') filter.isFeatured = true;

    const qStr = String(q || search || '').trim();
    if (qStr) {
      const rx = new RegExp(escapeRegex(qStr), 'i');
      filter.$or = [{ name: rx }, { slug: rx }, { category: rx }];
    }

    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    let limit = parseInt(req.query.limit, 10);
    if (!Number.isFinite(limit) || limit < 1) limit = 100;
    if (limit > 500) limit = 500;
    const skip = (page - 1) * limit;

    const total = await Product.countDocuments(filter);
    const products = await Product.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

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

