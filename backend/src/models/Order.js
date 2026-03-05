const mongoose = require('mongoose');

const OrderSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    items: [
      {
        product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
        name: String,
        price: Number,
        quantity: Number
      }
    ],
    status: {
      type: String,
      enum: ['pending', 'paid', 'failed', 'shipped', 'completed'],
      default: 'pending'
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'success', 'failed'],
      default: 'pending'
    },
    paymentProvider: { type: String, enum: ['razorpay', 'stripe', 'mock'], default: 'mock' },
    paymentOrderId: String,
    paymentId: String,
    totalAmount: { type: Number, required: true },
    currency: { type: String, default: 'INR' },
    customerName: String,
    customerEmail: String,
    customerPhone: String
  },
  { timestamps: true }
);

module.exports = mongoose.model('Order', OrderSchema);

