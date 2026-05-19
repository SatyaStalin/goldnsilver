import { Link, NavLink } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useCart } from '../state/CartContext';
import { orderService } from '../services/api';
import { useToast } from '../state/ToastContext';

const Header = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [showCart, setShowCart] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [processingPayment, setProcessingPayment] = useState(false);
  const { items, totalItems, totalAmount, removeFromCart, clearCart, syncCartPrices } = useCart();
  const { showToast } = useToast();

  const handleCheckout = async () => {
    if (items.length === 0) return;
    
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
        totalAmount
      };

      const orderResponse = await orderService.create(orderData);
      const order = orderResponse.data;

      // Process payment (mock)
      const paymentResponse = await orderService.processPayment(order._id, {
        paymentMethod: 'mock'
      });

      if (paymentResponse.data.success) {
        showToast('Payment successful! Order placed.', 'success');
        clearCart();
        setShowCart(false);
      } else {
        showToast('Payment failed. Please try again.', 'error');
      }
    } catch (error) {
      console.error('Checkout error:', error);
      const message = error.response?.data?.message || 'Checkout failed. Please try again.';
      showToast(message, 'error');
    } finally {
      setProcessingPayment(false);
    }
  };

  useEffect(() => {
    if (showCart && items.length > 0) syncCartPrices();
  }, [showCart, items.length, syncCartPrices]);

  const navLinkClass = ({ isActive }) =>
    isActive ? 'nav-link nav-link-active' : 'nav-link';

  const investSubmenu = [
    { label: 'Gold', route: '/invest-gold' },
    { label: 'Silver', route: '/invest-silver' },
    { label: 'Gold+Silver', route: '/invest-gold-silver' }
  ];

  const ownSubmenu = [
    { label: 'Gold', route: '/own-gold' },
    { label: 'Silver', route: '/own-silver' },
    { label: 'Gifting', route: '/own-gifting' }
  ];

  const aboutSubmenu = [
    { label: 'About', route: '/about-trust' },
    { label: 'Partners', route: '/partners' },
    { label: 'Purity & Certification', route: '/purity-certification' },
    { label: 'Complaints & Disclaimers', route: '/complaints-disclaimers' },
    { label: 'Contact & Support', route: '/contact-support' }
  ];

  return (
    <header className="header">
      <div className="header-inner">
      <Link to="/" className="logo">
        <img
          src="/brand-logo.png"
          alt="Gold N Silver Logo"
          className="logo-image"
        />
      </Link>

        <button
          className="mobile-menu-btn"
          onClick={() => setMobileOpen((o) => !o)}
          aria-label="Toggle navigation"
        >
          <span />
          <span />
          <span />
        </button>

        <nav className={`nav ${mobileOpen ? 'nav-open' : ''}`}>
          <div className="nav-item has-submenu">
            <NavLink to="/invest" className={navLinkClass}>
              INVEST
            </NavLink>
            <div className="submenu">
              {investSubmenu.map((item) => (
                <Link key={item.label} to={item.route} className="submenu-item">
                  {item.label}
                </Link>
              ))}
            </div>
          </div>

          <div className="nav-item has-submenu">
            <NavLink to="/own" className={navLinkClass}>
              OWN (PHYSICAL)
            </NavLink>
            <div className="submenu">
              {ownSubmenu.map((item) => (
                <Link key={item.label} to={item.route} className="submenu-item">
                  {item.label}
                </Link>
              ))}
            </div>
          </div>

          <NavLink to="/sip-plans" className={navLinkClass}>
            SIP &amp; PLANS
          </NavLink>

          <NavLink to="/buy-back" className={({ isActive }) => `${navLinkClass({ isActive })} nav-link--hidden`}>
            GOLD BUY BACK
          </NavLink>
          <NavLink to="/zerodha-integration" className={navLinkClass}>
            ZERODHA
          </NavLink>
          <NavLink to="/digital-gold" className={navLinkClass}>
            DIGITAL GOLD
          </NavLink>
          <NavLink to="/e-lease" className={navLinkClass}>
            E-LEASE ON DIGITAL GOLD
          </NavLink>
          <NavLink to="/knowledge-hub" className={navLinkClass}>
            KNOWLEDGE HUB
          </NavLink>
          <NavLink to="/media" className={navLinkClass}>
            MEDIA
          </NavLink>

          <div className="nav-item has-submenu">
            <NavLink to="/about-trust" className={navLinkClass}>
              ABOUT US
            </NavLink>
            <div className="submenu">
              {aboutSubmenu.map((item) => (
                <Link key={item.label} to={item.route} className="submenu-item">
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
          <NavLink to="/admin" className={navLinkClass}>
            ADMIN
          </NavLink>
        </nav>

        <div className="header-actions">
          <button className="cart-btn" onClick={() => setShowCart((s) => !s)}>
            <span className="cart-icon">🛒</span>
            <span className="cart-count">{totalItems}</span>
          </button>

          <div className="user-wrap">
            <button
              className="user-btn"
              onClick={() => setShowUserMenu((s) => !s)}
              aria-label="User menu"
            >
              <span className="user-icon">👤</span>
            </button>
            {showUserMenu && (
              <div className="user-menu">
                <Link to="/login" className="user-menu-item">
                  Login
                </Link>
                <Link to="/register" className="user-menu-item">
                  Register
                </Link>
                <div className="user-menu-sep" />
                <Link to="/about-trust" className="user-menu-item">
                  Contact &amp; Support
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {showCart && (
        <div className="cart-drawer">
          <div className="cart-header">
            <h3>Your Cart</h3>
            <button onClick={() => setShowCart(false)}>✕</button>
          </div>
          {items.length === 0 ? (
            <p className="cart-empty">No items yet. Explore gold &amp; silver.</p>
          ) : (
            <>
              <ul className="cart-items">
                {items.map((item) => (
                  <li key={item.id} className="cart-item">
                    <div>
                      <div className="cart-item-title">{item.name}</div>
                      <div className="cart-item-meta">
                        {item.quantity} x ₹{item.price?.toLocaleString() ?? '—'}
                      </div>
                    </div>
                    <button
                      className="cart-remove"
                      onClick={() => removeFromCart(item.id)}
                    >
                      Remove
                    </button>
                  </li>
                ))}
              </ul>
              <div className="cart-footer">
                <div className="cart-total">
                  Total: <strong>₹{totalAmount.toLocaleString()}</strong>
                </div>
                <div className="cart-actions">
                  <button className="btn-secondary" onClick={clearCart}>
                    Clear
                  </button>
                  <Link 
                    to="/cart"
                    className="btn-primary"
                    style={{ textDecoration: 'none', display: 'block', textAlign: 'center' }}
                    onClick={() => setShowCart(false)}
                  >
                    View Cart &amp; Checkout
                  </Link>
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </header>
  );
};

export default Header;

