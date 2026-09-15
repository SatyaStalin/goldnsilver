const mongoose = require('mongoose');

const OrderItemSchema = {
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: false },
  name: String,
  price: Number,
  quantity: Number,
  metal: { type: String, enum: ['gold', 'silver', 'gold+silver'] },
  type: { type: String },
  metalGrams: { type: Number, default: 0 },
  purchaseRatePerGram: { type: Number }
};

const ShippingAddressSchema = {
  consigneeName: { type: String, default: '' },
  line1: { type: String, default: '' },
  line2: { type: String, default: '' },
  city: { type: String, default: '' },
  state: { type: String, default: '' },
  pinCode: { type: String, default: '' },
  authReceiverName: { type: String, default: '' },
  authReceiverPhone: { type: String, default: '' },
  authReceiverEmail: { type: String, default: '' }
};

const SequelSchema = {
  status: {
    type: String,
    enum: ['not_required', 'pending', 'booked', 'in_transit', 'delivered', 'cancelled', 'failed'],
    default: 'not_required'
  },
  fromStoreCode: { type: String, default: '' },
  docketNumber: { type: String, default: null },
  brn: { type: String, default: null },
  estimatedDelivery: { type: String, default: null },
  shipmentStatus: { type: String, default: null },
  docketPrintUrl: { type: String, default: null },
  lastError: { type: String, default: null },
  bookedAt: { type: Date, default: null },
  tracking: { type: Array, default: [] }
};

const OrderSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    orderType: {
      type: String,
      enum: ['product', 'safegold'],
      default: 'product'
    },
    safegoldTransactionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'SafeGoldTransaction',
      default: null
    },
    items: [OrderItemSchema],
    status: {
      type: String,
      enum: ['pending', 'paid', 'failed', 'shipped', 'delivered', 'completed', 'cancelled'],
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
    liveSilverRateAtPurchase: Number,
    shippingAddress: ShippingAddressSchema,
    requiresSequelShipment: { type: Boolean, default: false },
    sequel: SequelSchema
  },
  { timestamps: true }
);

module.exports = mongoose.model('Order', OrderSchema);
