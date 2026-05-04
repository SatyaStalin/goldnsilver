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
    /**
     * rate_based — price is derived from admin Gold/Silver (₹/g) × metalGrams when rates exist.
     * fixed — admin sets pricePerUnit directly; grams are descriptive only (bulk rate updates skip).
     */
    pricingMode: { type: String, enum: ['rate_based', 'fixed'], default: 'rate_based' },
    /** Grams of metal used to compute rate_based price from admin rates (fixed products use for display/metadata). */
    metalGrams: { type: Number, default: 1, min: 0 },
    unit: { type: String, default: 'gram' },
    stock: { type: Number, required: true, default: 0, min: 0 },
    imageUrl: { type: String },
    isFeatured: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Product', ProductSchema);

