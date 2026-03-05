const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, index: true },
    passwordHash: { type: String, required: true },
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

