const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    metal: { type: String, enum: ['gold', 'silver', 'gold+silver'], required: true },
    type: {
      type: String,
      enum: [
        'digital',
        'physical_coin',
        'physical_bar',
        'gifting',
        'sip',
        'fund',
        'etf',
        'sovereign_bond'
      ],
      required: true
    },
    category: { type: String },
    description: { type: String },
    pricePerUnit: { type: Number, required: true },
    unit: { type: String, default: 'gram' },
    stock: { type: Number, required: true, default: 0, min: 0 },
    imageUrl: { type: String },
    isFeatured: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Product', ProductSchema);

