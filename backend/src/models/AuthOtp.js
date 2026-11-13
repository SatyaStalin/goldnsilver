const mongoose = require('mongoose');

const authOtpSchema = new mongoose.Schema(
  {
    channel: { type: String, enum: ['email', 'mobile'], required: true },
    target: { type: String, required: true, index: true },
    intent: { type: String, enum: ['login', 'register'], required: true },
    codeHash: { type: String, required: true },
    attempts: { type: Number, default: 0 },
    expiresAt: { type: Date, required: true }
  },
  { timestamps: true }
);

authOtpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model('AuthOtp', authOtpSchema);
