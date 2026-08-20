import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useCart } from '../state/CartContext';
import { useAuth } from '../state/AuthContext';
import { logo } from '../assets/homepageMain';
import wishIcon from '../assets/homepageMain/image 593.png';
import TopStrip from './TopStrip';

const investSubmenu = [
  { label: 'Gold Buy', route: '/invest-gold' },
  { label: 'Gold Sale', route: '/invest-gold-sell' },
  { label: 'Silver', route: '/invest-silver' },
  { label: 'Gold+Silver', route: '/invest-gold-silver' },
  { label: 'SafeGold', route: '/safegold' }
];

const ownSubmenu = [
  { label: 'MMTC-PAMP', route: '/own-mmtc-pamp' },
  { label: 'GoldnSilver.shop products', route: '/own-gold' },
  { label: 'Gifts', route: '/own-gifting' }
];

const aboutSubmenu = [
  { label: 'About', route: '/about-trust' },
  { label: 'Partners', route: '/partners' },
  { label: 'Purity & Certification', route: '/purity-certification' },
  { label: 'Legal', route: '/legal' },
  { label: 'Complaints & Disclaimers', route: '/legal' },
  { label: 'Contact & Support', route: '/contact-support' }
];

const Home2Chrome = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { items, totalItems, totalAmount, removeFromCart, clearCart, syncCartPrices } = useCart();
  const { isAuthenticated, isGeneral, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [showCart, setShowCart] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showRegisterMenu, setShowRegisterMenu] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const userWrapRef = useRef(null);
  const cartBtnRef = useRef(null);
  const cartDrawerRef = useRef(null);
  const registerRef = useRef(null);
  const searchRef = useRef(null);
  const searchInputRef = useRef(null);
  const chromeRef = useRef(null);
  const [chromeHeight, setChromeHeight] = useState(108);

  const closeMenus = useCallback(() => {
    setShowUserMenu(false);
    setShowCart(false);
    setShowRegisterMenu(false);
  }, []);

  useEffect(() => {
    closeMenus();
    setMobileOpen(false);
    setSearchOpen(false);
  }, [location.pathname, closeMenus]);

  useEffect(() => {
    const el = chromeRef.current;
    if (!el || typeof ResizeObserver === 'undefined') return undefined;
    const apply = () => setChromeHeight(el.offsetHeight);
    apply();
    const ro = new ResizeObserver(apply);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    if (showCart && items.length > 0) syncCartPrices();
  }, [showCart, items.length, syncCartPrices]);

  useEffect(() => {
    if (searchOpen) {
      const t = setTimeout(() => searchInputRef.current?.focus(), 50);
      return () => clearTimeout(t);
    }
  }, [searchOpen]);

  useEffect(() => {
    if (!showUserMenu && !showCart && !showRegisterMenu && !searchOpen) return;
    const onDown = (e) => {
      if (showUserMenu && userWrapRef.current && !userWrapRef.current.contains(e.target)) {
        setShowUserMenu(false);
      }
      if (showRegisterMenu && registerRef.current && !registerRef.current.contains(e.target)) {
        setShowRegisterMenu(false);
      }
      if (searchOpen && searchRef.current && !searchRef.current.contains(e.target)) {
        setSearchOpen(false);
      }
      if (showCart) {
        const inCart =
          cartBtnRef.current?.contains(e.target) || cartDrawerRef.current?.contains(e.target);
        if (!inCart) setShowCart(false);
      }
    };
    const onKey = (e) => {
      if (e.key === 'Escape') {
        closeMenus();
        setSearchOpen(false);
      }
    };
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [showUserMenu, showCart, showRegisterMenu, searchOpen, closeMenus]);

  const submitSearch = (e) => {
    e.preventDefault();
    const q = searchQuery.trim();
    if (!q) return;
    setSearchOpen(false);
    navigate(`/own?q=${encodeURIComponent(q)}`);
  };

  const isHome = location.pathname === '/';
  const isKnowledgeHub =
    location.pathname === '/knowledge-hub' || location.pathname === '/latest-news';
  const isMedia = location.pathname === '/media';
  const isAbout =
    location.pathname === '/about-trust' ||
    location.pathname === '/partners' ||
    location.pathname === '/purity-certification' ||
    location.pathname === '/complaints-disclaimers' ||
    location.pathname === '/legal' ||
    location.pathname === '/contact-support';

  return (
    <>
    <div className="hm2-chrome" ref={chromeRef}>
      <TopStrip />

      <header className="hm2-site-header">
        <div className={`hm2-container hm2-site-header-row${searchOpen ? ' search-open' : ''}`}>
          <Link to="/" className="hm2-brand" onClick={closeMenus}>
            <img src={logo} alt="GoldnSilver.shop" />
          </Link>

          <button
            type="button"
            className="hm2-burger"
            aria-label="Menu"
            aria-expanded={mobileOpen}
            onClick={() => setMobileOpen((v) => !v)}
          >
            <span />
            <span />
            <span />
          </button>

          <nav className={`hm2-site-nav ${mobileOpen ? 'open' : ''}`}>
            <Link to="/" className={isHome ? 'active' : ''} onClick={closeMenus}>
              Home
            </Link>

            <div className="hm2-dd">
              <span className="hm2-dd-trigger" role="button" tabIndex={0}>
                Physical Gold and Silver
              </span>
              <div className="hm2-dd-menu">
                {ownSubmenu.map((i) => (
                  <Link key={i.route} to={i.route} onClick={closeMenus}>
                    {i.label}
                  </Link>
                ))}
              </div>
            </div>

            <div className="hm2-dd">
              <span className="hm2-dd-trigger" role="button" tabIndex={0}>
                Digital Gold and Silver
              </span>
              <div className="hm2-dd-menu">
                {investSubmenu.map((i) => (
                  <Link key={i.route} to={i.route} onClick={closeMenus}>
                    {i.label}
                  </Link>
                ))}
              </div>
            </div>

            <Link to="/zerodha-integration" onClick={closeMenus}>
              Gold and Silver ETF’s
            </Link>
            <Link to="/digital-gold" onClick={closeMenus}>
              Gold Loans
            </Link>
            <Link to="/buy-back" onClick={closeMenus}>
              Gold Buyback
            </Link>
            <Link to="/knowledge-hub" className={isKnowledgeHub ? 'active' : ''} onClick={closeMenus}>
              Knowledge Hub
            </Link>
            <Link to="/media" className={isMedia ? 'active' : ''} onClick={closeMenus}>
              Media
            </Link>

            <div className="hm2-dd">
              <Link to="/about-trust" className={isAbout ? 'active' : ''} onClick={closeMenus}>
                About Us
              </Link>
              <div className="hm2-dd-menu">
                {aboutSubmenu.map((i) => (
                  <Link key={i.route} to={i.route} onClick={closeMenus}>
                    {i.label}
                  </Link>
                ))}
              </div>
            </div>

            <Link to="/admin" onClick={closeMenus}>
              Admin
            </Link>
          </nav>

          <div className="hm2-site-actions">
            <div className={`hm2-search-wrap ${searchOpen ? 'open' : ''}`} ref={searchRef}>
              {searchOpen ? (
                <form className="hm2-search-expand" onSubmit={submitSearch}>
                  <input
                    ref={searchInputRef}
                    type="search"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="search 24K coins , silver bars, ETFs....."
                    aria-label="Search"
                  />
                  <button type="submit" className="hm2-search-icon-btn" aria-label="Submit search">
                    🔍︎
                  </button>
                </form>
              ) : (
                <button
                  type="button"
                  className="hm2-search-icon-btn"
                  aria-label="Open search"
                  onClick={() => {
                    closeMenus();
                    setSearchOpen(true);
                  }}
                >
                  🔍︎
                </button>
              )}
            </div>

            <button type="button" className="hm2-wish-btn" aria-label="Wishlist">
              <img src={wishIcon} alt="" />
            </button>

            <button
              type="button"
              className="hm2-cart-trigger"
              ref={cartBtnRef}
              onClick={() => {
                setShowUserMenu(false);
                setShowRegisterMenu(false);
                setSearchOpen(false);
                setShowCart((s) => !s);
              }}
              aria-label="Cart"
            >
              🛒
              <span>{totalItems}</span>
            </button>

            <div className="hm2-auth-btns">
              <div className="hm2-user-wrap" ref={userWrapRef}>
                {isGeneral || isAuthenticated ? (
                  <>
                    <button
                      type="button"
                      className="hm2-btn-login"
                      onClick={() => {
                        setShowCart(false);
                        setShowRegisterMenu(false);
                        setSearchOpen(false);
                        setShowUserMenu((s) => !s);
                      }}
                    >
                      Account
                    </button>
                    {showUserMenu && (
                      <div className="hm2-user-menu">
                        {isGeneral ? (
                          <>
                            <Link to="/dashboard" onClick={() => setShowUserMenu(false)}>
                              My Dashboard
                            </Link>
                            <button
                              type="button"
                              onClick={() => {
                                logout();
                                setShowUserMenu(false);
                              }}
                            >
                              Logout
                            </button>
                          </>
                        ) : (
                          <Link to="/admin" onClick={() => setShowUserMenu(false)}>
                            Admin Panel
                          </Link>
                        )}
                        <Link to="/contact-support" onClick={closeMenus}>
                          Contact &amp; Support
                        </Link>
                      </div>
                    )}
                  </>
                ) : (
                  <Link
                    to="/login"
                    className="hm2-btn-login"
                    onClick={() => {
                      closeMenus();
                      setSearchOpen(false);
                    }}
                  >
                    Login
                  </Link>
                )}
              </div>

              {!(isGeneral || isAuthenticated) && (
                <div className="hm2-register-wrap" ref={registerRef}>
                  <button
                    type="button"
                    className="hm2-btn-register"
                    onClick={() => {
                      setShowCart(false);
                      setShowUserMenu(false);
                      setSearchOpen(false);
                      setShowRegisterMenu((s) => !s);
                    }}
                  >
                    Register
                  </button>
                  {showRegisterMenu && (
                    <div className="hm2-register-menu">
                      <Link to="/register" onClick={closeMenus}>
                        As a Customer
                      </Link>
                      <Link to="/register" onClick={closeMenus}>
                        As a Business Partner
                      </Link>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {showCart && (
          <div className="hm2-cart-drawer" ref={cartDrawerRef}>
            <div className="hm2-cart-head">
              <h3>Your Cart</h3>
              <button type="button" onClick={() => setShowCart(false)}>
                ✕
              </button>
            </div>
            {items.length === 0 ? (
              <p className="hm2-cart-empty">No items yet. Explore gold &amp; silver.</p>
            ) : (
              <>
                <ul className="hm2-cart-items">
                  {items.map((item) => (
                    <li key={item.id}>
                      <div>
                        <strong>{item.name}</strong>
                        <span>
                          {item.quantity} x ₹{item.price?.toLocaleString() ?? '—'}
                        </span>
                      </div>
                      <button type="button" onClick={() => removeFromCart(item.id)}>
                        Remove
                      </button>
                    </li>
                  ))}
                </ul>
                <div className="hm2-cart-foot">
                  <div>
                    Total: <strong>₹{totalAmount.toLocaleString()}</strong>
                  </div>
                  <div className="hm2-cart-actions">
                    <button type="button" onClick={clearCart}>
                      Clear
                    </button>
                    <Link to="/cart" onClick={() => setShowCart(false)}>
                      View Cart &amp; Checkout
                    </Link>
                  </div>
                </div>
              </>
            )}
          </div>
        )}
      </header>
    </div>
    <div className="hm2-chrome-spacer" style={{ height: chromeHeight }} aria-hidden="true" />
    </>
  );
};

export default Home2Chrome;
