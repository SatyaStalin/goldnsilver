const express = require('express');
const Media = require('../models/Media');

const router = express.Router();

router.get('/', async (req, res, next) => {
  try {
    const media = await Media.find({ isPublished: true }).sort({ createdAt: -1 }).limit(20);
    res.json(media);
  } catch (err) {
    next(err);
  }
});

module.exports = router;

