const mongoose = require('mongoose');

const InvestmentProductSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    metal: { type: String, enum: ['gold', 'silver', 'gold+silver'], required: true },
    category: {
      type: String,
      enum: [
        'digital',
        'sip',
        'mutual_fund',
        'etf',
        'sovereign_bond',
        'coin',
        'bar',
        'gifting',
        'lease'
      ],
      required: true
    },
    provider: { type: String },
    minAmount: { type: Number, default: 0 },
    maxAmount: { type: Number },
    description: { type: String },
    tags: [{ type: String }],
    isActive: { type: Boolean, default: true }
  },
  { timestamps: true }
);

module.exports = mongoose.model('InvestmentProduct', InvestmentProductSchema);

