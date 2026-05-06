import { useEffect, useState } from 'react';
import { useCart } from '../state/CartContext';
import { useToast } from '../state/ToastContext';
import { orderService, paymentService } from '../services/api';
import { useNavigate, useLocation } from 'react-router-dom';

const CartPage = () => {
  const {
    items,
    totalItems,
    totalAmount,
    removeFromCart,
    clearCart,
    updateQuantity,
    syncCartPrices
  } = useCart();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [processingPayment, setProcessingPayment] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(null);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [emailForReceipt, setEmailForReceipt] = useState('');
  const [paymentGateway, setPaymentGateway] = useState('cashfree');
  const [customerInfo, setCustomerInfo] = useState({
    name: '',
    email: '',
    phone: ''
  });
  const location = useLocation();

  useEffect(() => {
    if (location.pathname !== '/cart') return;
    if (items.length === 0) return;
    syncCartPrices();
  }, [location.pathname, items.length, syncCartPrices]);

  useEffect(() => {
    const refreshIfOnCart = () => {
      if (window.location.pathname !== '/cart') return;
      syncCartPrices();
    };
    window.addEventListener('focus', refreshIfOnCart);
    const onVisibility = () => {
      if (document.visibilityState === 'visible') refreshIfOnCart();
    };
    document.addEventListener('visibilitychange', onVisibility);
    return () => {
      window.removeEventListener('focus', refreshIfOnCart);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, [syncCartPrices]);

  useEffect(() => {
    const handlePaymentReturn = async () => {
      const params = new URLSearchParams(window.location.search);
      const cashfreeOrderId = params.get("order_id");
  
      if (!cashfreeOrderId) return;
  
      try {
        const fullOrderResponse = await orderService.getByPaymentOrderId(cashfreeOrderId);
        console.log('fullOrderResponse=',fullOrderResponse)
        const verifyResponse = await paymentService.verifyPayment({
          orderId: fullOrderResponse.data._id,
          gatewayType: 'cashfree'
        });
  
        if (verifyResponse.data.success) {
          const order = verifyResponse.data.order;
  
          setOrderSuccess(order);
          clearCart();
          showToast('🎉 Payment Successful! Order Confirmed!', 'success-animated');
  
          // ✅ clean URL
          window.history.replaceState({}, document.title, window.location.pathname);
        } else {
          showToast('Payment verification failed', 'error');
        }
      } catch (err) {
        console.error(err);
        showToast('Payment verification error', 'error');
      }
    };
  
    handlePaymentReturn();
  }, []);
  
  
  
  const handleQuantityChange = (id, newQuantity) => {
    const item = items.find(i => i.id === id);
    if (item && item.stock && newQuantity > item.stock) {
      showToast(`Only ${item.stock} available in stock`, 'error');
      return;
    }
    if (newQuantity < 1) {
      removeFromCart(id);
    } else {
      updateQuantity(id, newQuantity);
    }
  };

  const handleRazorpayPayment = async () => {
    if (!customerInfo.name || !customerInfo.email || !customerInfo.phone) {
      showToast('Please fill all customer details', 'error');
      return;
    }

    setProcessingPayment(true);
    try {
      // Create order
      const orderData = {
        items: items.map(item => ({
          productId: item.productId || item.id,
          name: item.name,
          price: item.price,
          quantity: item.quantity
        })),
        totalAmount,
        customerName: customerInfo.name,
        customerEmail: customerInfo.email,
        customerPhone: customerInfo.phone
      };

      const orderResponse = await orderService.create(orderData);
      const order = orderResponse.data;

      // Create payment order based on selected gateway
      const paymentOrderResponse = await paymentService.createOrder({
        orderId: order._id,
        gatewayType: paymentGateway,
        customerName: customerInfo.name,
        customerEmail: customerInfo.email,
        customerPhone: customerInfo.phone
      });

      const paymentOrder = paymentOrderResponse.data;
      if (paymentGateway === 'razorpay') {
        if (!paymentOrder.keyId) {
          showToast(
            'Razorpay public key missing from server. Restart the backend after setting RAZORPAY_KEY_ID in .env.',
            'error'
          );
          setProcessingPayment(false);
          return;
        }
        // Initialize Razorpay (key must be the Key Id from dashboard, returned by /api/payment/create-order)
        const options = {
          key: paymentOrder.keyId,
          amount: paymentOrder.amount,
          currency: paymentOrder.currency,
          name: 'Gold & Silver Platform',
          description: `Order #${order._id}`,
          order_id: paymentOrder.orderId,
          handler: async function (response) {
            try {
              // Verify payment
              const verifyResponse = await paymentService.verifyPayment({
                orderId: order._id,
                paymentData: {
                  razorpay_payment_id: response.razorpay_payment_id,
                  razorpay_order_id: response.razorpay_order_id,
                  razorpay_signature: response.razorpay_signature
                },
                gatewayType: 'razorpay',
                customerEmail: customerInfo.email
              });

              if (verifyResponse.data.success) {
                const orderDetails = verifyResponse.data.order;
                // Fetch full order details with populated items
                try {
                  const fullOrderResponse = await orderService.getById(order._id);
                  setOrderSuccess(fullOrderResponse.data);
                } catch (err) {
                  // If fetch fails, use the order from verification
                  setOrderSuccess(orderDetails);
                }
                clearCart();
                setProcessingPayment(false);
                // Show animated success toast
                showToast('🎉 Payment Successful! Order Confirmed! 🎉', 'success-animated');
              } else {
                showToast('Payment verification failed', 'error');
                setProcessingPayment(false);
              }
            } catch (error) {
              showToast('Payment verification error', 'error');
            }
          },
          prefill: {
            name: customerInfo.name,
            email: customerInfo.email,
            contact: customerInfo.phone
          },
          theme: {
            color: '#d4af37'
          },
          modal: {
            ondismiss: function() {
              setProcessingPayment(false);
            }
          }
        };

        const razorpay = new window.Razorpay(options);
        razorpay.open();
        razorpay.on('payment.failed', function (response) {
          const desc =
            response?.error?.description ||
            response?.error?.reason ||
            response?.error?.field ||
            response?.error?.code ||
            'Payment failed. Please try again.';
          console.error('Razorpay payment.failed:', response?.error || response);
          showToast(desc, 'error');
          setProcessingPayment(false);
        });
      } else if (paymentGateway === 'cashfree') { console.log('paymentOrder=',JSON.stringify(paymentOrder)); alert(2)
        // Initialize Cashfree
        const cashfree = new window.Cashfree({
          mode: paymentOrder.isProduction ? 'production' : 'sandbox'
        });

        const checkoutOptions = {
          paymentSessionId: paymentOrder.paymentSessionId,
          redirectTarget: '_self'
        };
        alert(1)
        cashfree.checkout(checkoutOptions).then(async function(result) {
          if (result.error) {
            console.log('=',result.error)
            showToast('Payment failed. Please try again.', 'error');
            setProcessingPayment(false);
          } else {
            // Payment successful, verify on server
            try {
              const verifyResponse = await paymentService.verifyPayment({
                orderId: order._id,
                paymentData: {
                  order_id: paymentOrder.orderId,
                  payment_id: result.paymentId
                },
                gatewayType: 'cashfree',
                customerEmail: customerInfo.email
              });

              if (verifyResponse.data.success) {
                const orderDetails = verifyResponse.data.order;
                // Fetch full order details with populated items
                try {
                  const fullOrderResponse = await orderService.getById(order._id);
                  setOrderSuccess(fullOrderResponse.data);
                } catch (err) {
                  setOrderSuccess(orderDetails);
                }
                clearCart();
                setProcessingPayment(false);
                showToast('🎉 Payment Successful! Order Confirmed! 🎉', 'success-animated');
              } else {
                showToast('Payment verification failed', 'error');
                setProcessingPayment(false);
              }
            } catch (error) {
              showToast('Payment verification error', 'error');
              setProcessingPayment(false);
            }
          }
        });
      }

    } catch (error) {
      console.error('Payment error:', error);
      let message = error.response?.data?.message || 'Payment initialization failed';
      
      // Handle Cashfree IP whitelisting error
      if (error.response?.data?.error === 'CASHFREE_IP_WHITELIST_REQUIRED') {
        message = 'Cashfree requires IP whitelisting. Please contact support or use Razorpay.';
      }
      
      showToast(message, 'error');
      setProcessingPayment(false);
    }
  };

  const handleSendEmailReceipt = async () => {
    if (!emailForReceipt) {
      showToast('Please enter email address', 'error');
      return;
    }
    try {
      // TODO: Integrate email service (Nodemailer, SendGrid, etc.)
      // await emailService.sendOrderReceipt(orderSuccess._id, emailForReceipt);
      showToast('Order receipt will be sent to your email!', 'success');
      setShowEmailModal(false);
      setEmailForReceipt('');
    } catch (error) {
      showToast('Error sending email', 'error');
    }
  };

  const handleCloseOrderSuccess = () => {
    setOrderSuccess(null);
    setShowEmailModal(false);
    navigate('/');
  };

  // Show order success as full page
  if (orderSuccess) {
    return (
      <div className="page">
        <div className="order-success-full-page">
          <div className="order-success-content">
            <div className="success-animation">
              <div className="success-icon">🎉</div>
              <div className="success-flowers">
                <span className="flower">🌸</span>
                <span className="flower">🌺</span>
                <span className="flower">🌻</span>
                <span className="flower">🌷</span>
                <span className="flower">🌹</span>
              </div>
            </div>
            <h2>🎊 Order Placed Successfully! 🎊</h2>
            <p style={{ fontSize: '1.1rem', color: '#7a6d4a', marginBottom: '2rem', textAlign: 'center' }}>
              Thank you for your purchase! Your order has been confirmed and will be processed shortly.
            </p>
            <div className="order-success-details">
              <div className="order-detail-item">
                <strong>Order ID:</strong> {orderSuccess._id?.slice(-12) || orderSuccess.id}
              </div>
              <div className="order-detail-item">
                <strong>Order Date:</strong> {new Date(orderSuccess.createdAt || orderSuccess.date || Date.now()).toLocaleString()}
              </div>
              <div className="order-detail-item">
                <strong>Total Amount:</strong> ₹{orderSuccess.totalAmount?.toLocaleString() || '0'}
              </div>
              <div className="order-detail-item">
                <strong>Payment Status:</strong>
                <span style={{ color: '#10b981', marginLeft: '0.5rem', fontWeight: '600' }}>✓ {orderSuccess.paymentStatus === 'success' ? 'Paid' : orderSuccess.paymentStatus || 'Paid'}</span>
              </div>
              <div className="order-detail-item">
                <strong>Order Status:</strong>
                <span style={{ color: '#3b82f6', marginLeft: '0.5rem', fontWeight: '600', textTransform: 'capitalize' }}>
                  {orderSuccess.status || 'Paid'}
                </span>
              </div>
              {orderSuccess.customerName && (
                <div className="order-detail-item">
                  <strong>Customer:</strong> {orderSuccess.customerName}
                </div>
              )}
              {orderSuccess.customerEmail && (
                <div className="order-detail-item">
                  <strong>Email:</strong> {orderSuccess.customerEmail}
                </div>
              )}
              {orderSuccess.customerPhone && (
                <div className="order-detail-item">
                  <strong>Phone:</strong> {orderSuccess.customerPhone}
                </div>
              )}
              <div className="order-detail-item">
                <strong>Items ({orderSuccess.items?.length || 0}):</strong>
                <ul style={{ marginTop: '0.75rem', paddingLeft: '1.5rem', listStyle: 'none' }}>
                  {orderSuccess.items?.map((item, idx) => (
                    <li key={idx} style={{ marginBottom: '0.5rem', padding: '0.5rem', background: 'rgba(255,255,255,0.3)', borderRadius: '6px' }}>
                      <strong>{item.name || item.product?.name || 'Product'}</strong> -
                      Qty: {item.quantity} × ₹{item.price?.toLocaleString() || item.product?.pricePerUnit?.toLocaleString() || '0'} =
                      ₹{((item.quantity || 0) * (item.price || item.product?.pricePerUnit || 0)).toLocaleString()}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            <div className="order-success-actions">
              <button
                className="btn-secondary"
                onClick={() => {
                  setShowEmailModal(true);
                }}
              >
                📧 Send Receipt to Email
              </button>
              <button
                className="btn-primary"
                onClick={handleCloseOrderSuccess}
              >
                Continue Shopping
              </button>
            </div>
          </div>
        </div>

        {/* Email Modal */}
        {showEmailModal && (
          <div className="email-modal-overlay">
            <div className="email-modal-content">
              <h3>Send Order Receipt</h3>
              <p>Enter your email address to receive a copy of your order details.</p>
              <input
                type="email"
                placeholder="your.email@example.com"
                value={emailForReceipt}
                onChange={(e) => setEmailForReceipt(e.target.value)}
                className="email-input"
              />
              <div className="email-modal-actions">
                <button className="btn-secondary" onClick={() => setShowEmailModal(false)}>Cancel</button>
                <button className="btn-primary" onClick={handleSendEmailReceipt}>Send Email</button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Show empty cart message
  if (items.length === 0) {
    return (
      <div className="page">
        <div className="page-hero">
          <h1 className="page-hero-title">Your Cart</h1>
          <p className="page-hero-desc">Your cart is empty. Start shopping!</p>
        </div>
        <div style={{ textAlign: 'center', padding: '3rem' }}>
          <button className="btn-primary" onClick={() => navigate('/')}>
            Continue Shopping
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      <div className="page-hero">
        <h1 className="page-hero-title">Shopping Cart</h1>
        <p className="page-hero-desc">Review your items and proceed to checkout</p>
      </div>

      <div className="cart-page-content">
        <div className="cart-items-section">
          <h2>Cart Items ({totalItems})</h2>
          <div className="cart-items-list">
            {items.map((item) => (
              <div key={item.id} className="cart-item-card">
                <div className="cart-item-image">
                  <img src={item.imageUrl || 'https://images.pexels.com/photos/315788/pexels-photo-315788.jpeg'} alt={item.name} />
                </div>
                <div className="cart-item-details">
                  <h3>{item.name}</h3>
                  <p className="cart-item-price">₹{item.price?.toLocaleString()} per unit</p>
                  <div className="cart-item-quantity">
                    <button
                      onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                      className="quantity-btn"
                    >
                      −
                    </button>
                    <span>{item.quantity}</span>
                    <button
                      onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                      className="quantity-btn"
                      disabled={item.stock && item.quantity >= item.stock}
                    >
                      +
                    </button>
                  </div>
                </div>
                <div className="cart-item-total">
                  <div className="item-total-amount">
                    ₹{(item.price * item.quantity).toLocaleString()}
                  </div>
                  <button
                    className="remove-item-btn"
                    onClick={() => removeFromCart(item.id)}
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
            </div>
            <button className="btn-secondary" onClick={clearCart} style={{ marginTop: '1rem' }}>
              Clear Cart
            </button>
          </div>

          <div className="cart-summary-section">
            <div className="cart-summary-card">
            <h2>Order Summary</h2>
            <div className="summary-row">
              <span>Subtotal ({totalItems} items)</span>
              <span>₹{totalAmount.toLocaleString()}</span>
            </div>
            <div className="summary-row">
              <span>Shipping</span>
              <span>Free</span>
            </div>
            <div className="summary-divider"></div>
            <div className="summary-row total">
              <span>Total</span>
              <span>₹{totalAmount.toLocaleString()}</span>
            </div>

            <div className="customer-info-form">
              <h3>Customer Details</h3>
              <label>
                Full Name *
                <input
                  type="text"
                  value={customerInfo.name}
                  onChange={(e) => setCustomerInfo({ ...customerInfo, name: e.target.value })}
                  required
                />
              </label>
              <label>
                Email *
                <input
                  type="email"
                  value={customerInfo.email}
                  onChange={(e) => setCustomerInfo({ ...customerInfo, email: e.target.value })}
                  required
                />
              </label>
              <label>
                Phone *
                <input
                  type="tel"
                  value={customerInfo.phone}
                  onChange={(e) => setCustomerInfo({ ...customerInfo, phone: e.target.value })}
                  required
                />
              </label>
              <label>
                Payment Gateway
                <select
                  value={paymentGateway}
                  onChange={(e) => setPaymentGateway(e.target.value)}
                  style={{ width: '100%', padding: '0.6rem', borderRadius: '8px', border: '1px solid rgba(212, 175, 55, 0.3)' }}
                >
                   <option value="cashfree">Cashfree</option>
                  <option value="razorpay">Razorpay</option>
                 
                </select>
              </label>
            </div>

            <button
              className="btn-primary checkout-btn"
              onClick={handleRazorpayPayment}
              disabled={processingPayment}
            >
              {processingPayment ? 'Processing...' : `Pay ₹${totalAmount.toLocaleString()}`}
            </button>
            </div>
          </div>
          </div>
        {/* </>
      ) */}
    </div>
  );
};

export default CartPage;
