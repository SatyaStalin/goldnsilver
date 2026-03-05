const mongoose = require('mongoose');

const BlogSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    excerpt: { type: String },
    content: { type: String },
    category: { type: String },
    imageUrl: { type: String },
    isPublished: { type: Boolean, default: true }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Blog', BlogSchema);

