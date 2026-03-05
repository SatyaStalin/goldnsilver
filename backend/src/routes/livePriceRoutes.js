const express = require('express');

const router = express.Router();

// Simple mock endpoint for live prices
router.get('/', (req, res) => {
  const now = new Date();
  res.json({
    timestamp: now.toISOString(),
    gold: {
      currency: 'INR',
      perGram: 6400,
      per10Gram: 64000
    },
    silver: {
      currency: 'INR',
      perGram: 80,
      perKg: 80000
    }
  });
});

module.exports = router;

