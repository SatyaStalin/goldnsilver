const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, index: true },
    mobile: { type: String, sparse: true, index: true },
    passwordHash: { type: String, required: true },
    userType: {
      type: String,
      enum: ['admin', 'general'],
      default: 'general'
    },
    role: { type: String, enum: ['user', 'admin'], default: 'user' },
    kycStatus: {
      type: String,
      enum: ['pending', 'approved', 'rejected', 'not_submitted'],
      default: 'not_submitted'
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('User', UserSchema);
