import { Link, NavLink, useLocation } from 'react-router-dom';
import { useState, useEffect, useRef, useCallback } from 'react';
import { useCart } from '../state/CartContext';
import { useAuth } from '../state/AuthContext';
import { orderService } from '../services/api';
import { useToast } from '../state/ToastContext';

const Header = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [showCart, setShowCart] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [processingPayment, setProcessingPayment] = useState(false);
  const userWrapRef = useRef(null);
  const cartBtnRef = useRef(null);
  const cartDrawerRef = useRef(null);
  const location = useLocation();
  const { items, totalItems, totalAmount, removeFromCart, clearCart, syncCartPrices } = useCart();
  const { showToast } = useToast();
  const { isAuthenticated, isGeneral, logout } = useAuth();

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

  const closeMenus = useCallback(() => {
    setShowUserMenu(false);
    setShowCart(false);
  }, []);

  useEffect(() => {
    closeMenus();
    setMobileOpen(false);
  }, [location.pathname, closeMenus]);

  useEffect(() => {
    if (!showUserMenu && !showCart) return;

    const handlePointerDown = (e) => {
      if (
        showUserMenu &&
        userWrapRef.current &&
        !userWrapRef.current.contains(e.target)
      ) {
        setShowUserMenu(false);
      }
      if (showCart) {
        const inCart =
          cartBtnRef.current?.contains(e.target) ||
          cartDrawerRef.current?.contains(e.target);
        if (!inCart) setShowCart(false);
      }
    };

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') closeMenus();
    };

    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [showUserMenu, showCart, closeMenus]);

  const openCart = () => {
    setShowUserMenu(false);
    setShowCart((s) => !s);
  };

  const openUserMenu = () => {
    setShowCart(false);
    setShowUserMenu((s) => !s);
  };

  const navLinkClass = ({ isActive }) =>
    isActive ? 'nav-link nav-link-active' : 'nav-link';

  const investSubmenu = [
    { label: 'Gold', route: '/invest-gold' },
    { label: 'Silver', route: '/invest-silver' },
    { label: 'Gold+Silver', route: '/invest-gold-silver' },
    { label: 'SafeGold', route: '/safegold' }
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
      <Link to="/" className="logo" onClick={closeMenus}>
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

        <nav className={`nav ${mobileOpen ? 'nav-open' : ''}`} onClick={closeMenus}>
          <NavLink to="/" className={navLinkClass} onClick={closeMenus}>
            HOME
          </NavLink>
          <NavLink to="/home2" className={navLinkClass} onClick={closeMenus}>
            HOME 2
          </NavLink>
          <div className="nav-item has-submenu">
            <NavLink to="/invest" className={navLinkClass} onClick={closeMenus}>
            DIGITAL GOLD & SILVER
            </NavLink>
            <div className="submenu">
              {investSubmenu.map((item) => (
                <Link key={item.label} to={item.route} className="submenu-item" onClick={closeMenus}>
                  {item.label}
                </Link>
              ))}
            </div>
          </div>

          <div className="nav-item has-submenu">
            <NavLink to="/own" className={navLinkClass} onClick={closeMenus}>
              PHYSICAL GOLD & SILVER
            </NavLink>
            <div className="submenu">
              {ownSubmenu.map((item) => (
                <Link key={item.label} to={item.route} className="submenu-item" onClick={closeMenus}>
                  {item.label}
                </Link>
              ))}
            </div>
          </div>

          <NavLink to="/sip-plans" className={navLinkClass} onClick={closeMenus}>
            SIP &amp; PLANS
          </NavLink>

          <NavLink to="/buy-back" className={({ isActive }) => `${navLinkClass({ isActive })} nav-link--hidden`} onClick={closeMenus}>
            GOLD BUY BACK
          </NavLink>
          <NavLink to="/zerodha-integration" className={navLinkClass} onClick={closeMenus}>
          GOLD & SILVER ETF's
          </NavLink>
          <NavLink to="/digital-gold" className={navLinkClass} onClick={closeMenus}>
            DIGITAL GOLD
          </NavLink>
          {/* <NavLink to="/e-lease" className={navLinkClass} onClick={closeMenus}>
            E-LEASE ON DIGITAL GOLD
          </NavLink> */}
          <NavLink to="/knowledge-hub" className={navLinkClass} onClick={closeMenus}>
            KNOWLEDGE HUB
          </NavLink>
          <NavLink to="/media" className={navLinkClass} onClick={closeMenus}>
            MEDIA
          </NavLink>

          <div className="nav-item has-submenu">
            <NavLink to="/about-trust" className={navLinkClass} onClick={closeMenus}>
              ABOUT US
            </NavLink>
            <div className="submenu">
              {aboutSubmenu.map((item) => (
                <Link key={item.label} to={item.route} className="submenu-item" onClick={closeMenus}>
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
          <NavLink to="/admin" className={navLinkClass} onClick={closeMenus}>
            ADMIN
          </NavLink>
        </nav>

        <div className="header-actions">
          <button type="button" className="cart-btn" ref={cartBtnRef} onClick={openCart}>
            <span className="cart-icon">🛒</span>
            <span className="cart-count">{totalItems}</span>
          </button>

          <div className="user-wrap" ref={userWrapRef}>
            <button
              type="button"
              className="user-btn"
              onClick={openUserMenu}
              aria-label="User menu"
              aria-expanded={showUserMenu}
            >
              <span className="user-icon">👤</span>
            </button>
            {showUserMenu && (
              <div className="user-menu">
                {isGeneral ? (
                  <>
                    <Link to="/dashboard" className="user-menu-item" onClick={() => setShowUserMenu(false)}>
                      My Dashboard
                    </Link>
                    <button
                      type="button"
                      className="user-menu-item user-menu-btn"
                      onClick={() => {
                        logout();
                        setShowUserMenu(false);
                      }}
                    >
                      Logout
                    </button>
                  </>
                ) : isAuthenticated ? (
                  <Link to="/admin" className="user-menu-item" onClick={() => setShowUserMenu(false)}>
                    Admin Panel
                  </Link>
                ) : (
                  <>
                    <Link to="/login" className="user-menu-item" onClick={() => setShowUserMenu(false)}>
                      Login
                    </Link>
                    <Link to="/register" className="user-menu-item" onClick={() => setShowUserMenu(false)}>
                      Register
                    </Link>
                  </>
                )}
                <div className="user-menu-sep" />
                <Link to="/contact-support" className="user-menu-item" onClick={closeMenus}>
                  Contact &amp; Support
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {showCart && (
        <div className="cart-drawer" ref={cartDrawerRef}>
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

