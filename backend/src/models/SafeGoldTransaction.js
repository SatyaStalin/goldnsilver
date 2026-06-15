const mongoose = require('mongoose');

const safeGoldTransactionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    type: {
      type: String,
      enum: ['buy', 'sell'],
      default: 'buy'
    },
    status: {
      type: String,
      enum: ['pending', 'success', 'failed'],
      default: 'pending',
      index: true
    },
    clientReferenceId: {
      type: String,
      required: true,
      unique: true
    },
    rateId: { type: String, required: true },
    currentPrice: { type: Number, required: true },
    applicableTax: { type: Number, default: 3 },
    goldAmount: { type: Number, required: true },
    buyPrice: { type: Number, required: true },
    paymentProvider: { type: String, default: 'razorpay' },
    paymentOrderId: { type: String, default: null },
    paymentId: { type: String, default: null },
    buyTxId: { type: String, default: null },
    transferTxId: { type: String, default: null },
    sgRate: { type: Number, default: null },
    safegoldUserId: { type: String, default: null },
    failureReason: { type: String, default: null }
  },
  { timestamps: true }
);

safeGoldTransactionSchema.index({ user: 1, createdAt: -1 });

module.exports = mongoose.model('SafeGoldTransaction', safeGoldTransactionSchema);
