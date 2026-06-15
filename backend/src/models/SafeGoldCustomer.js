const mongoose = require('mongoose');

const safeGoldCustomerSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
      index: true
    },
    partnerUserId: {
      type: String,
      required: true,
      unique: true,
      index: true
    },
    safegoldCustomerId: {
      type: String,
      default: null,
      index: true,
      sparse: true
    },
    name: { type: String, default: '' },
    phoneNo: { type: String, default: '' },
    status: {
      type: String,
      enum: ['pending', 'active', 'failed'],
      default: 'pending',
      index: true
    },
    registeredAt: { type: Date, default: null },
    lastSyncedAt: { type: Date, default: null },
    lastError: { type: String, default: null }
  },
  { timestamps: true }
);

module.exports = mongoose.model('SafeGoldCustomer', safeGoldCustomerSchema);
