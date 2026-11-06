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
      enum: ['pending', 'processing', 'success', 'failed'],
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
    paymentProvider: { type: String, default: 'cashfree' },
    paymentOrderId: { type: String, default: null },
    paymentId: { type: String, default: null },
    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order',
      default: null
    },
    buyTxId: { type: String, default: null },
    sellTxId: { type: String, default: null },
    invoiceId: { type: String, default: null },
    settledStatus: { type: Number, default: null },
    transferTxId: { type: String, default: null },
    invoiceUrl: { type: String, default: null },
    invoiceFetchedAt: { type: Date, default: null },
    sgRate: { type: Number, default: null },
    safegoldUserId: { type: String, default: null },
    failureReason: { type: String, default: null },
    /** Bank payout for a SafeGold sell. The full account number is not stored. */
    payout: {
      status: {
        type: String,
        enum: ['not_started', 'awaiting_settlement', 'processing', 'success', 'failed', 'reversed'],
        default: 'not_started'
      },
      beneficiaryId: { type: String, default: '' },
      method: { type: String, enum: ['bank', 'upi'], default: 'bank' },
      accountHolderName: { type: String, default: '' },
      accountLast4: { type: String, default: '' },
      ifsc: { type: String, default: '' },
      vpa: { type: String, default: '' },
      amount: { type: Number, default: 0 },
      transferId: { type: String, default: '' },
      cfTransferId: { type: String, default: '' },
      utr: { type: String, default: '' },
      lastError: { type: String, default: '' },
      requestedAt: { type: Date, default: null },
      paidAt: { type: Date, default: null }
    }
  },
  { timestamps: true }
);

safeGoldTransactionSchema.index({ user: 1, createdAt: -1 });

module.exports = mongoose.model('SafeGoldTransaction', safeGoldTransactionSchema);
