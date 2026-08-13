import { useEffect, useRef, useState, useCallback } from 'react';
import { useCart } from '../state/CartContext';
import { useToast } from '../state/ToastContext';
import { useAuth } from '../state/AuthContext';
import { orderService, paymentService, authService } from '../services/api';
import { useNavigate, useLocation } from 'react-router-dom';
import { validateCartItems, validateCheckoutCustomer } from '../utils/checkoutValidation';
import { atStockLimit, productStock } from '../utils/stock';

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
  const { user: authUser, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [processingPayment, setProcessingPayment] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(null);
  const [paymentFailure, setPaymentFailure] = useState(null);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [emailForReceipt, setEmailForReceipt] = useState('');
  const [paymentGateway, setPaymentGateway] = useState('cashfree');
  const [customerInfo, setCustomerInfo] = useState({
    name: '',
    email: '',
    phone: ''
  });
  const [fieldErrors, setFieldErrors] = useState({});
  const [accountPassword, setAccountPassword] = useState('');
  const [userExists, setUserExists] = useState(null);
  const [checkingUser, setCheckingUser] = useState(false);
  const cashfreeReturnHandled = useRef(false);
  const location = useLocation();

  useEffect(() => {
    if (authUser && isAuthenticated) {
      setCustomerInfo({
        name: authUser.name || '',
        email: authUser.email || '',
        phone: authUser.mobile || ''
      });
      setUserExists(true);
    }
  }, [authUser, isAuthenticated]);

  const checkUserExists = useCallback(async (email, phone) => {
    const em = String(email || '').trim();
    const ph = String(phone || '').replace(/\D/g, '').slice(-10);
    if (!em && ph.length < 10) {
      setUserExists(null);
      return;
    }
    setCheckingUser(true);
    try {
      const res = await authService.checkExists({ email: em, mobile: ph });
      setUserExists(res.data.exists);
    } catch {
      setUserExists(null);
    } finally {
      setCheckingUser(false);
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated) return;
    const t = setTimeout(() => {
      checkUserExists(customerInfo.email, customerInfo.phone);
    }, 500);
    return () => clearTimeout(t);
  }, [customerInfo.email, customerInfo.phone, isAuthenticated, checkUserExists]);

  const updateCustomerField = (field, value) => {
    setCustomerInfo((prev) => ({ ...prev, [field]: value }));
    setFieldErrors((prev) => {
      if (!prev[field]) return prev;
      const next = { ...prev };
      delete next[field];
      return next;
    });
  };

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
      const cashfreeOrderId = params.get('order_id');
      const orderStatusParam = params.get('order_status');

      if (!cashfreeOrderId || cashfreeReturnHandled.current) return;
      cashfreeReturnHandled.current = true;

      setProcessingPayment(true);
      setPaymentFailure(null);

      try {
        const fullOrderResponse = await orderService.getByPaymentOrderId(cashfreeOrderId);
        const mongoOrderId = fullOrderResponse.data._id;

        const verifyResponse = await paymentService.verifyPayment({
          orderId: mongoOrderId,
          gatewayType: 'cashfree',
          paymentData: { order_id: cashfreeOrderId }
        });

        window.history.replaceState({}, document.title, window.location.pathname);

        if (verifyResponse.data.success) {
          try {
            const fullOrder = await orderService.getById(mongoOrderId);
            setOrderSuccess(fullOrder.data);
          } catch {
            setOrderSuccess(verifyResponse.data.order || fullOrderResponse.data);
          }
          clearCart();
          showToast('🎉 Payment Successful! Order Confirmed!', 'success-animated');
        } else {
          setPaymentFailure({
            orderRef: String(mongoOrderId).slice(-12),
            status: orderStatusParam || verifyResponse.data.order?.paymentStatus || 'failed'
          });
          showToast(
            'Your payment could not be completed. Please try again. If any amount was deducted, it will be refunded within 3–5 business days.',
            'error'
          );
        }
      } catch (err) {
        console.error('Cashfree return handling:', err);
        window.history.replaceState({}, document.title, window.location.pathname);
        setPaymentFailure({ orderRef: null, status: 'unknown' });
        showToast(
          'We could not confirm your payment. Please try again or contact support if money was deducted.',
          'error'
        );
      } finally {
        setProcessingPayment(false);
      }
    };

    handlePaymentReturn();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- run once on mount when returning from Cashfree
  }, []);
  
  
  
  const handleQuantityChange = (id, newQuantity) => {
    const item = items.find((i) => i.id === id);
    const stock = productStock(item);
    if (item && newQuantity > stock) {
      showToast(`Only ${stock} available in stock`, 'error');
      return;
    }
    if (newQuantity < 1) {
      removeFromCart(id);
    } else {
      updateQuantity(id, newQuantity);
    }
  };

  const handleRazorpayPayment = async () => {
    const cartCheck = validateCartItems(items);
    if (!cartCheck.valid) {
      showToast(cartCheck.message, 'error');
      return;
    }

    const customerCheck = validateCheckoutCustomer(customerInfo);
    if (!customerCheck.valid) {
      setFieldErrors(customerCheck.errors);
      const firstMsg =
        customerCheck.errors.name ||
        customerCheck.errors.email ||
        customerCheck.errors.phone ||
        'Please fix the highlighted fields.';
      showToast(firstMsg, 'error');
      return;
    }

    setFieldErrors({});
    const { name, email, phone } = customerCheck.normalized;

    if (!isAuthenticated && userExists === false) {
      if (!accountPassword || accountPassword.length < 6) {
        showToast('Set an account password (min 6 characters) to create your dashboard account', 'error');
        setFieldErrors((prev) => ({
          ...prev,
          password: 'Required for new accounts'
        }));
        return;
      }
    }

    setProcessingPayment(true);
    try {
      const orderData = {
        items: items.map(item => ({
          productId: item.productId || item.id,
          name: item.name,
          price: item.price,
          quantity: item.quantity
        })),
        totalAmount,
        customerName: name,
        customerEmail: email,
        customerPhone: phone,
        ...(!isAuthenticated && userExists === false ? { password: accountPassword } : {})
      };

      const orderResponse = await orderService.create(orderData);
      const order = orderResponse.data;

      const paymentOrderResponse = await paymentService.createOrder({
        orderId: order._id,
        gatewayType: paymentGateway,
        customerName: name,
        customerEmail: email,
        customerPhone: phone
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
                customerEmail: email
              });

              if (verifyResponse.data.success) {
                const orderDetails = verifyResponse.data.order;
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
          },
          prefill: {
            name,
            email,
            contact: phone
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
      } else if (paymentGateway === 'cashfree') {
        if (!paymentOrder.paymentSessionId) {
          showToast('Cashfree session missing. Please try again.', 'error');
          setProcessingPayment(false);
          return;
        }

        const cashfree = new window.Cashfree({
          mode: paymentOrder.isProduction ? 'production' : 'sandbox'
        });

        cashfree
          .checkout({
            paymentSessionId: paymentOrder.paymentSessionId,
            redirectTarget: '_modal'
          })
          .then(async (result) => {
            if (result?.error) {
              setPaymentFailure({ orderRef: String(order._id).slice(-12), status: 'failed' });
              showToast(
                'Your payment could not be completed. Please try again. If any amount was deducted, it will be refunded within 3–5 business days.',
                'error'
              );
              setProcessingPayment(false);
              return;
            }

            if (result?.redirect) {
              return;
            }

            try {
              const verifyResponse = await paymentService.verifyPayment({
                orderId: order._id,
                paymentData: {
                  order_id: paymentOrder.orderId,
                  payment_id: result?.paymentId
                },
                gatewayType: 'cashfree',
                customerEmail: email
              });

              if (verifyResponse.data.success) {
                try {
                  const fullOrderResponse = await orderService.getById(order._id);
                  setOrderSuccess(fullOrderResponse.data);
                } catch {
                  setOrderSuccess(verifyResponse.data.order);
                }
                clearCart();
                setProcessingPayment(false);
                showToast('🎉 Payment Successful! Order Confirmed! 🎉', 'success-animated');
              } else {
                setPaymentFailure({ orderRef: String(order._id).slice(-12), status: 'failed' });
                showToast(
                  'Your payment could not be completed. Please try again. If any amount was deducted, it will be refunded within 3–5 business days.',
                  'error'
                );
                setProcessingPayment(false);
              }
            } catch {
              showToast('Payment verification error. Please try again.', 'error');
              setProcessingPayment(false);
            }
          })
          .catch(() => {
            showToast('Could not open Cashfree checkout. Please try again.', 'error');
            setProcessingPayment(false);
          });
      }

    } catch (error) {
      console.error('Payment error:', error);
      if (error.response?.data?.code === 'PASSWORD_REQUIRED') {
        setUserExists(false);
        setFieldErrors((prev) => ({ ...prev, password: 'Required for new accounts' }));
      }
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

      {processingPayment && (
        <p className="payment-return-status" role="status">
          Confirming your payment…
        </p>
      )}

      {paymentFailure && (
        <div className="payment-failure-banner" role="alert">
          <div className="payment-failure-banner-icon" aria-hidden="true">
            !
          </div>
          <div className="payment-failure-banner-body">
            <h2>Your payment could not be completed</h2>
            <p>
              Please try again below. If any amount was deducted, it will be refunded within 3–5 business
              days.
            </p>
            {paymentFailure.orderRef && (
              <p className="payment-failure-ref">Reference: …{paymentFailure.orderRef}</p>
            )}
          </div>
          <button
            type="button"
            className="btn-secondary payment-failure-dismiss"
            onClick={() => setPaymentFailure(null)}
          >
            Dismiss
          </button>
        </div>
      )}

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
                      disabled={atStockLimit(item, item.quantity)}
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
              <label className={fieldErrors.name ? 'has-error' : ''}>
                Full Name *
                <input
                  type="text"
                  value={customerInfo.name}
                  onChange={(e) => updateCustomerField('name', e.target.value)}
                  autoComplete="name"
                  aria-invalid={Boolean(fieldErrors.name)}
                  placeholder="As on ID / bank account"
                />
                {fieldErrors.name && <span className="field-error">{fieldErrors.name}</span>}
              </label>
              <label className={fieldErrors.email ? 'has-error' : ''}>
                Email *
                <input
                  type="email"
                  value={customerInfo.email}
                  onChange={(e) => updateCustomerField('email', e.target.value)}
                  autoComplete="email"
                  aria-invalid={Boolean(fieldErrors.email)}
                  placeholder="you@example.com"
                />
                {fieldErrors.email && <span className="field-error">{fieldErrors.email}</span>}
              </label>
              <label className={fieldErrors.phone ? 'has-error' : ''}>
                Phone *
                <input
                  type="tel"
                  value={customerInfo.phone}
                  onChange={(e) => updateCustomerField('phone', e.target.value)}
                  autoComplete="tel"
                  aria-invalid={Boolean(fieldErrors.phone)}
                  placeholder="10-digit mobile (e.g. 9876543210)"
                  inputMode="numeric"
                />
                {fieldErrors.phone && <span className="field-error">{fieldErrors.phone}</span>}
              </label>
              {!isAuthenticated && userExists === false && (
                <label className={fieldErrors.password ? 'has-error' : ''}>
                  Account Password *
                  <input
                    type="password"
                    value={accountPassword}
                    onChange={(e) => {
                      setAccountPassword(e.target.value);
                      setFieldErrors((prev) => {
                        if (!prev.password) return prev;
                        const next = { ...prev };
                        delete next.password;
                        return next;
                      });
                    }}
                    placeholder="Min. 6 characters — for your dashboard login"
                    minLength={6}
                    aria-invalid={Boolean(fieldErrors.password)}
                  />
                  <span className="field-hint">
                    No account found for this email/mobile. We will create one and link this order.
                  </span>
                  {fieldErrors.password && <span className="field-error">{fieldErrors.password}</span>}
                </label>
              )}
              {!isAuthenticated && userExists === true && (
                <p className="field-hint">Existing account detected — order will be linked to your profile.</p>
              )}
              {!isAuthenticated && checkingUser && (
                <p className="field-hint">Checking account…</p>
              )}
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
