const mongoose = require('mongoose');

const CartItemSchema = new mongoose.Schema(
  {
    /** Client line id (product ObjectId string or static catalogue id). */
    id: { type: String, required: true },
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', default: null },
    name: { type: String, required: true },
    price: { type: Number, required: true, min: 0 },
    quantity: { type: Number, required: true, min: 1, default: 1 },
    stock: { type: Number, default: 0 },
    imageUrl: { type: String, default: '' },
    metal: { type: String, default: '' }
  },
  { _id: false }
);

const CartSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
      index: true
    },
    items: { type: [CartItemSchema], default: [] }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Cart', CartSchema);
