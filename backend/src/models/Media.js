const mongoose = require('mongoose');

const MediaSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    type: { type: String, enum: ['press', 'news', 'gallery'], default: 'press' },
    description: { type: String },
    imageUrl: { type: String },
    link: { type: String },
    isPublished: { type: Boolean, default: true }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Media', MediaSchema);

