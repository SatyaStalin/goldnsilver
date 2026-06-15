const mongoose = require('mongoose');

const safeGoldWalletSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
      index: true
    },
    balanceGrams: {
      type: Number,
      default: 0,
      min: 0
    },
    safegoldUserId: {
      type: String,
      default: null
    },
    balanceSource: {
      type: String,
      enum: ['local', 'safegold'],
      default: 'local'
    },
    lastSyncedAt: {
      type: Date,
      default: null
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('SafeGoldWallet', safeGoldWalletSchema);
