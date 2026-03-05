const express = require('express');
const PaymentGateway = require('../services/paymentGateway');
const EmailService = require('../services/emailService');
const Order = require('../models/Order');
const Product = require('../models/Product');
const router = express.Router();

// Create payment order
router.post('/create-order', async (req, res, next) => {
  try {
    const { orderId, gatewayType = 'razorpay' } = req.body;

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    const paymentGateway = new PaymentGateway(gatewayType);
    const { customerName, customerEmail, customerPhone } = req.body;
    
    try {
      const paymentOrder = await paymentGateway.createOrder({
        amount: order.totalAmount,
        currency: order.currency || 'INR',
        receipt: order._id.toString(),
        notes: {
          orderId: order._id.toString()
        },
        customerId: order.user?.toString() || `customer_${Date.now()}`,
        customerName: customerName || order.customerName || 'Customer',
        customerEmail: customerEmail || order.customerEmail || '',
        customerPhone: customerPhone || order.customerPhone || ''
      });

      // Update order with payment gateway info
      order.paymentProvider = gatewayType;
      order.paymentOrderId = paymentOrder.orderId;
      await order.save();

      res.json(paymentOrder);
    } catch (err) {
      // Provide helpful error message for Cashfree IP whitelisting
      if (err.message.includes('IP whitelisting')) {
        return res.status(400).json({
          message: err.message,
          error: 'CASHFREE_IP_WHITELIST_REQUIRED',
          help: 'Please add your server IP to Cashfree dashboard → Settings → IP Whitelist'
        });
      }
      next(err);
    }
  } catch (err) {
    next(err);
  }
});

// Verify payment
router.post('/verify-payment', async (req, res, next) => {
  try {
    const { orderId, paymentData, gatewayType = 'razorpay', customerEmail } = req.body;

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    const paymentGateway = new PaymentGateway(gatewayType);
    const verification = await paymentGateway.verifyPayment({
      ...paymentData,
      orderId: order.paymentOrderId
    });

    if (verification.success) {
      // Reduce stock for each item
      for (const item of order.items) {
        await Product.findByIdAndUpdate(
          item.product,
          { $inc: { stock: -item.quantity } }
        );
      }

      order.paymentStatus = 'success';
      order.status = 'paid';
      order.paymentId = verification.paymentId;
      await order.save();

      // Send email receipt if email provided
      if (customerEmail) {
        const emailService = new EmailService();
        try {
          await emailService.sendOrderReceipt(order._id, customerEmail, {
            orderId: order._id,
            totalAmount: order.totalAmount,
            items: order.items
          });
        } catch (emailError) {
          console.error('Email sending error:', emailError);
          // Don't fail the payment if email fails
        }
      }

      res.json({
        success: true,
        message: 'Payment verified and order confirmed',
        order
      });
    } else {
      order.paymentStatus = 'failed';
      order.status = 'failed';
      await order.save();

      res.status(400).json({
        success: false,
        message: verification.message || 'Payment verification failed',
        order
      });
    }
  } catch (err) {
    next(err);
  }
});

module.exports = router;
