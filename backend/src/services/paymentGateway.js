// Payment Gateway Abstraction Layer
// This allows easy switching between different payment gateways

class PaymentGateway {
  constructor(gatewayType) {
    this.gatewayType = gatewayType;
  }

  async createOrder(orderData) {
    switch (this.gatewayType) {
      case 'razorpay':
        return await this.createRazorpayOrder(orderData);
      case 'cashfree':
        return await this.createCashfreeOrder(orderData);
      case 'stripe':
        return await this.createStripeOrder(orderData);
      case 'mock':
        return await this.createMockOrder(orderData);
      default:
        throw new Error(`Unsupported payment gateway: ${this.gatewayType}`);
    }
  }

  async verifyPayment(paymentData) {
    switch (this.gatewayType) {
      case 'razorpay':
        return await this.verifyRazorpayPayment(paymentData);
      case 'cashfree':
        return await this.verifyCashfreePayment(paymentData);
      case 'stripe':
        return await this.verifyStripePayment(paymentData);
      case 'mock':
        return await this.verifyMockPayment(paymentData);
      default:
        throw new Error(`Unsupported payment gateway: ${this.gatewayType}`);
    }
  }

  // Razorpay Implementation
  async createRazorpayOrder(orderData) {
    const Razorpay = require('razorpay');
    const razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET
    });

    const options = {
      amount: orderData.amount * 100, // Convert to paise
      currency: orderData.currency || 'INR',
      receipt: orderData.receipt,
      notes: orderData.notes || {}
    };

    try {
      const razorpayOrder = await razorpay.orders.create(options);
      return {
        orderId: razorpayOrder.id,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
        keyId: process.env.RAZORPAY_KEY_ID
      };
    } catch (error) {
      throw new Error(`Razorpay order creation failed: ${error.message}`);
    }
  }

  async verifyRazorpayPayment(paymentData) {
    const crypto = require('crypto');
    const razorpaySignature = paymentData.razorpay_signature;
    const razorpayOrderId = paymentData.razorpay_order_id;
    const razorpayPaymentId = paymentData.razorpay_payment_id;

    const generatedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpayOrderId}|${razorpayPaymentId}`)
      .digest('hex');

    if (generatedSignature === razorpaySignature) {
      return {
        success: true,
        paymentId: razorpayPaymentId,
        orderId: razorpayOrderId
      };
    } else {
      return {
        success: false,
        message: 'Payment verification failed'
      };
    }
  }

  // Cashfree Implementation
  async createCashfreeOrder(orderData) {
    const axios = require('axios');
    const crypto = require('crypto');

    const appId = process.env.CASHFREE_APP_ID;
    const secretKey = process.env.CASHFREE_SECRET_KEY;
    const isProduction = process.env.NODE_ENV === 'production';
    const baseUrl = isProduction 
      ? 'https://api.cashfree.com/pg' 
      : 'https://sandbox.cashfree.com/pg';

    const orderId = `order_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const timestamp = new Date().toISOString();

    const requestBody = {
      order_id: orderId,
      order_amount: orderData.amount,
      order_currency: orderData.currency || 'INR',
      order_note: orderData.notes?.orderId || '',
      customer_details: {
        customer_id: orderData.customerId || 'customer_' + Date.now(),
        customer_name: orderData.customerName || 'Customer',
        customer_email: orderData.customerEmail || '',
        customer_phone: orderData.customerPhone || ''
      }
    };

    try {
      const isProduction = process.env.CASHFREE_ENV === 'PROD';
      const response = await axios.post(`${baseUrl}/orders`, requestBody, {
        headers: {
          'x-client-id': appId,
          'x-client-secret': secretKey,
          'x-api-version': '2022-01-01',
          'Content-Type': 'application/json'
        }
      });

      return {
        orderId: response.data.order_id,
        paymentSessionId: response.data.payment_session_id,
        amount: response.data.order_amount,
        currency: response.data.order_currency,
        appId: appId,
        isProduction: useProduction
      };
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message;
      if (errorMessage.includes('IP address not allowed')) {
        throw new Error(`Cashfree IP whitelisting required. Please add your server IP to Cashfree dashboard → Settings → IP Whitelist. Current error: ${errorMessage}. See CASHFREE_SETUP.md for details.`);
      }
      throw new Error(`Cashfree order creation failed: ${errorMessage}`);
    }
  }

  async verifyCashfreePayment(paymentData) {
    const axios = require('axios');

    const appId = process.env.CASHFREE_APP_ID;
    const secretKey = process.env.CASHFREE_SECRET_KEY;
    const isProduction = process.env.NODE_ENV === 'production';
    const baseUrl = isProduction 
      ? 'https://api.cashfree.com/pg' 
      : 'https://sandbox.cashfree.com/pg';

    const orderId = paymentData.order_id;
    const paymentId = paymentData.payment_id;

    try {
      const response = await axios.get(`${baseUrl}/orders/${orderId}/payments/${paymentId}`, {
        headers: {
          'x-client-id': appId,
          'x-client-secret': secretKey,
          'x-api-version': '2022-01-01'
        }
      });

      const paymentStatus = response.data.payment_status;
      
      if (paymentStatus === 'SUCCESS') {
        return {
          success: true,
          paymentId: paymentId,
          orderId: orderId,
          amount: response.data.payment_amount
        };
      } else {
        return {
          success: false,
          message: `Payment status: ${paymentStatus}`
        };
      }
    } catch (error) {
      return {
        success: false,
        message: `Cashfree verification failed: ${error.response?.data?.message || error.message}`
      };
    }
  }

  // Stripe Implementation (for future use)
  async createStripeOrder(orderData) {
    // TODO: Implement Stripe integration
    throw new Error('Stripe integration not yet implemented');
  }

  async verifyStripePayment(paymentData) {
    // TODO: Implement Stripe verification
    throw new Error('Stripe verification not yet implemented');
  }

  // Mock Implementation (for testing)
  async createMockOrder(orderData) {
    return {
      orderId: `mock_${Date.now()}`,
      amount: orderData.amount,
      currency: orderData.currency || 'INR'
    };
  }

  async verifyMockPayment(paymentData) {
    // Mock always succeeds unless paymentMethod is 'fail'
    if (paymentData.paymentMethod === 'fail') {
      return { success: false, message: 'Mock payment failed' };
    }
    return {
      success: true,
      paymentId: `mock_payment_${Date.now()}`,
      orderId: paymentData.orderId
    };
  }
}

module.exports = PaymentGateway;
