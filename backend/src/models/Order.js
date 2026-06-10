const mongoose = require('mongoose');

const OrderItemSchema = {
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  name: String,
  price: Number,
  quantity: Number,
  metal: { type: String, enum: ['gold', 'silver', 'gold+silver'] },
  metalGrams: { type: Number, default: 0 },
  purchaseRatePerGram: { type: Number }
};

const OrderSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    items: [OrderItemSchema],
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
    paymentProvider: { type: String, enum: ['razorpay', 'stripe', 'mock', 'cashfree'], default: 'mock' },
    paymentOrderId: String,
    paymentId: String,
    totalAmount: { type: Number, required: true },
    currency: { type: String, default: 'INR' },
    customerName: String,
    customerEmail: String,
    customerPhone: String,
    liveGoldRateAtPurchase: Number,
    liveSilverRateAtPurchase: Number
  },
  { timestamps: true }
);

module.exports = mongoose.model('Order', OrderSchema);
