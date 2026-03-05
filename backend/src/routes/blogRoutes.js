const express = require('express');
const Blog = require('../models/Blog');

const router = express.Router();

router.get('/', async (req, res, next) => {
  try {
    const blogs = await Blog.find({ isPublished: true }).sort({ createdAt: -1 }).limit(20);
    res.json(blogs);
  } catch (err) {
    next(err);
  }
});

module.exports = router;

