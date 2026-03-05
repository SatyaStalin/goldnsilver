const express = require('express');
const Product = require('../models/Product');

const router = express.Router();

// List products (only active products)
router.get('/', async (req, res, next) => {
  try {
    const { metal, featured } = req.query;
    const filter = { isActive: true };
    if (metal) filter.metal = metal;
    if (featured === 'true') filter.isFeatured = true;
    
    const products = await Product.find(filter).sort({ createdAt: -1 }).limit(100);
    res.json(products);
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

