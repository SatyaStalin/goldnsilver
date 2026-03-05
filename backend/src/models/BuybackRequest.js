const mongoose = require('mongoose');

const BuybackRequestSchema = new mongoose.Schema(
  {
    customerName: { type: String, required: true },
    metal: { type: String, enum: ['gold', 'silver'], required: true },
    weightInGrams: { type: Number, required: true },
    estimatedValue: { type: Number, required: true },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected', 'paid'],
      default: 'pending'
    },
    payoutMethod: {
      type: String,
      enum: ['wallet', 'bank_transfer'],
      default: 'wallet'
    },
    notes: { type: String }
  },
  { timestamps: true }
);

module.exports = mongoose.model('BuybackRequest', BuybackRequestSchema);

