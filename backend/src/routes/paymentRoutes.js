const express = require('express');
const PaymentGateway = require('../services/paymentGateway');
const EmailService = require('../services/emailService');
const Order = require('../models/Order');
const Product = require('../models/Product');
const SafeGoldTransaction = require('../models/SafeGoldTransaction');
const { fulfillSafeGoldOrder } = require('../services/safegoldFulfillment');
const router = express.Router();

// Create payment order
router.post('/create-order', async (req, res, next) => {
  try {
    const { orderId, gatewayType, returnPath } = req.body;

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    const paymentGateway = new PaymentGateway(gatewayType);
    const { customerName, customerEmail, customerPhone } = req.body;

    const defaultReturnPath =
      order.orderType === 'safegold' ? '/invest-gold' : '/cart';
    
    try {
      const paymentOrder = await paymentGateway.createOrder({
        amount: order.totalAmount,
        currency: order.currency || 'INR',
        receipt: order._id.toString(),
        notes: {
          orderId: order._id.toString(),
          orderType: order.orderType || 'product'
        },
        customerId: order.user?.toString() || `customer_${Date.now()}`,
        customerName: customerName || order.customerName || 'Customer',
        customerEmail: customerEmail || order.customerEmail || '',
        customerPhone: customerPhone || order.customerPhone || '',
        returnPath: returnPath || defaultReturnPath
      });

      // ✅ Update order with payment gateway info
      order.paymentProvider = gatewayType;
      order.paymentOrderId = paymentOrder.orderId;
      console.log('paymentOrder=',paymentOrder);
      // ✅ IMPORTANT: store session id for Cashfree
      // if (gatewayType === 'cashfree') {
      //   paymentOrder.paymentSessionId = paymentOrder.payment_session_id || paymentOrder.order_token;
      // }
      await order.save();

      // Razorpay checkout requires keyId (public key) on the client; Cashfree uses paymentSessionId
      res.json({
        orderId: paymentOrder.orderId,
        keyId: paymentOrder.keyId,
        paymentSessionId: paymentOrder.paymentSessionId,
        amount: paymentOrder.amount,
        currency: paymentOrder.currency,
        appId: paymentOrder.appId,
        isProduction: paymentOrder.isProduction
      });
    } catch (err) {
      if (err.message.includes('IP whitelisting')) {
        return res.status(400).json({
          success: false,
          message: err.message,
          error: 'CASHFREE_IP_WHITELIST_REQUIRED',
          help: 'Please add your server IP to Cashfree dashboard → Settings → IP Whitelist'
        });
      }
      if (err.message.includes('Cashfree order creation failed')) {
        return res.status(400).json({ success: false, message: err.message });
      }
      if (err.message.includes('Cashfree is not configured')) {
        return res.status(400).json({ success: false, message: err.message });
      }
      if (err.message.includes('Razorpay order creation failed')) {
        return res.status(400).json({ success: false, message: err.message });
      }
      if (err.message.includes('Razorpay is not configured')) {
        return res.status(400).json({ success: false, message: err.message });
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
    const normalizedPaymentData = paymentData && typeof paymentData === 'object' ? paymentData : {};

    // Backwards-compatible Cashfree verification:
    // - Old frontend used to call verify without paymentData after redirect.
    // - Cashfree verification needs at least the Cashfree order_id.
    if (gatewayType === 'cashfree' && !normalizedPaymentData.order_id) {
      normalizedPaymentData.order_id = order.paymentOrderId;
    }

    const verification = await paymentGateway.verifyPayment({
      ...normalizedPaymentData,
      orderId: order.paymentOrderId
    });

    if (verification.success) {
      if (order.orderType !== 'safegold') {
        for (const item of order.items) {
          if (!item.product) continue;
          await Product.findByIdAndUpdate(item.product, { $inc: { stock: -item.quantity } });
        }
      }

      order.paymentStatus = 'success';
      order.status = 'paid';
      order.paymentId = verification.paymentId;
      await order.save();

      let safegold = null;
      if (order.orderType === 'safegold') {
        try {
          safegold = await fulfillSafeGoldOrder(order);
        } catch (sgErr) {
          if (order.safegoldTransactionId) {
            await SafeGoldTransaction.findByIdAndUpdate(order.safegoldTransactionId, {
              status: 'failed',
              failureReason: sgErr.message || 'Gold transfer failed after payment'
            });
          }
          return res.status(502).json({
            success: false,
            message:
              sgErr.message ||
              'Payment received but gold transfer failed. Please contact support with your order ID.',
            code: 'GOLD_TRANSFER_FAILED',
            order,
            paymentVerified: true
          });
        }
      }

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
        }
      }

      res.json({
        success: true,
        message:
          order.orderType === 'safegold'
            ? 'Payment verified and gold purchased successfully'
            : 'Payment verified and order confirmed',
        order,
        safegold
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
