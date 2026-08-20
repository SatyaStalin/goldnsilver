const express = require('express');
const { authMiddleware } = require('../middleware/auth');
const {
  getCartForUser,
  saveCartForUser,
  clearCartForUser,
  toClientItems
} = require('../services/cartService');

const router = express.Router();

// GET /api/cart — logged-in user's cart
router.get('/', authMiddleware, async (req, res, next) => {
  try {
    const cart = await getCartForUser(req.user._id);
    res.json({ items: toClientItems(cart) });
  } catch (err) {
    next(err);
  }
});

// PUT /api/cart — replace full cart (used after add/update/remove on client)
router.put('/', authMiddleware, async (req, res, next) => {
  try {
    const cart = await saveCartForUser(req.user._id, req.body?.items);
    res.json({ items: toClientItems(cart) });
  } catch (err) {
    next(err);
  }
});

// DELETE /api/cart — empty cart (also called after successful payment)
router.delete('/', authMiddleware, async (req, res, next) => {
  try {
    await clearCartForUser(req.user._id);
    res.json({ items: [] });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
