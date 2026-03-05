const express = require('express');
const BuybackRequest = require('../models/BuybackRequest');
const router = express.Router();

// Get all buyback requests
router.get('/', async (req, res, next) => {
  try {
    const buybacks = await BuybackRequest.find().sort({ createdAt: -1 });
    res.json(buybacks);
  } catch (err) {
    next(err);
  }
});

// Create buyback request
router.post('/', async (req, res, next) => {
  try {
    const buyback = new BuybackRequest(req.body);
    await buyback.save();
    res.status(201).json(buyback);
  } catch (err) {
    next(err);
  }
});

// Update buyback status
router.put('/:id', async (req, res, next) => {
  try {
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

// Delete buyback request
router.delete('/:id', async (req, res, next) => {
  try {
    const buyback = await BuybackRequest.findByIdAndDelete(req.params.id);
    if (!buyback) {
      return res.status(404).json({ message: 'Buyback request not found' });
    }
    res.json({ message: 'Buyback request deleted successfully' });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
