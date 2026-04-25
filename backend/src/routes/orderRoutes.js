const express = require('express');
const Order = require('../models/Order');
const Product = require('../models/Product');

const router = express.Router();

// Create order (for guest users)
router.post('/', async (req, res, next) => {
  try {
    const { items, totalAmount } = req.body;

    // Validate stock availability
    for (const item of items) {
      const product = await Product.findById(item.productId);
      if (!product) {
        return res.status(404).json({ message: `Product ${item.productId} not found` });
      }
      if (product.stock < item.quantity) {
        return res.status(400).json({ 
          message: `Insufficient stock for ${product.name}. Available: ${product.stock}` 
        });
      }
      if (product.stock === 0) {
        return res.status(400).json({ 
          message: `${product.name} is out of stock` 
        });
      }
    }

    // Create order
    const order = new Order({
      user: null, // Guest order
      items: items.map(item => ({
        product: item.productId,
        name: item.name,
        price: item.price,
        quantity: item.quantity
      })),
      totalAmount,
      status: 'pending',
      paymentStatus: 'pending',
      customerName: req.body.customerName || null,
      customerEmail: req.body.customerEmail || null,
      customerPhone: req.body.customerPhone || null
    });

    await order.save();
    res.status(201).json(order);
  } catch (err) {
    next(err);
  }
});

// Process payment (mock)
router.post('/:orderId/payment', async (req, res, next) => {
  try {
    const { orderId } = req.params;
    const { paymentMethod } = req.body;

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    if (order.paymentStatus === 'success') {
      return res.status(400).json({ message: 'Order already paid' });
    }

    // Mock payment processing
    const paymentSuccess = paymentMethod !== 'fail'; // Always success unless 'fail'

    if (paymentSuccess) {
      // Reduce stock for each item
      for (const item of order.items) {
        await Product.findByIdAndUpdate(
          item.product,
          { $inc: { stock: -item.quantity } }
        );
      }

      order.paymentStatus = 'success';
      order.status = 'paid';
      await order.save();

      res.json({ 
        success: true, 
        message: 'Payment successful',
        order 
      });
    } else {
      order.paymentStatus = 'failed';
      order.status = 'failed';
      await order.save();

      res.status(400).json({ 
        success: false, 
        message: 'Payment failed',
        order 
      });
    }
  } catch (err) {
    next(err);
  }
});

// Get order by ID
router.get('/:orderId', async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.orderId)
      .populate('items.product', 'name slug imageUrl');
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    res.json(order);
  } catch (err) {
    next(err);
  }
});
router.get('/payment/:paymentOrderId', async (req, res, next) => {
  try {
    const { paymentOrderId } = req.params;

    const order = await Order.findOne({ paymentOrderId }) // ✅ correct
      // .populate('items.product', 'name slug imageUrl');

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    res.json(order);
  } catch (err) {
    next(err);
  }
});


module.exports = router;
