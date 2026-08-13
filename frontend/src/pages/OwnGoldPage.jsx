import { useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import Home2Chrome from '../components/Home2Chrome';
import GsPageFooter from '../components/GsPageFooter';
import { useCart } from '../state/CartContext';
import { useToast } from '../state/ToastContext';
import { useProductDetailModal } from '../state/ProductDetailModalContext';
import { productService } from '../services/api';
import { productSilver } from '../assets/homepageMain';
import { mmtcAssets } from '../assets/images';
import './PageShell.css';
import './OwnGoldPage.css';

const PAGE_SIZE = 6;

const TYPE_LABELS = {
  digital: 'Digital',
  physical_coin: 'Physical coin',
  physical_bar: 'Physical bar',
  gifting: 'Gifting',
  sip: 'SIP',
  fund: 'Fund',
  etf: 'ETF',
  sovereign_bond: 'Sovereign bond'
};

const FEATURES = [
  { title: '24K / 999.9+ purity', icon: 'purity' },
  { title: 'Tamper-proof Packaging', icon: 'pack' },
  { title: 'Insured Delivery', icon: 'ship' }
];

const WHY_POINTS = [
  { title: 'Trusted Purity', text: 'BIS-hallmarked gold & silver with certified fineness.' },
  { title: 'Fair & Transparent Pricing', text: 'Live rates with clear making and GST breakdown.' },
  { title: 'Safe & Secure Shopping', text: 'Encrypted payments and insured doorstep delivery.' },
  { title: 'Responsible Sourcing', text: 'Products from trusted, audited bullion partners.' },
  { title: 'Easy Buyback', text: 'Flexible repurchase options when you need liquidity.' },
  { title: 'Expert Support', text: 'Dedicated help for orders, KYC, and product queries.' }
];

function unwrapProducts(data) {
  return Array.isArray(data) ? data : data?.products ?? [];
}

function sortCatalog(list) {
  const order = { gold: 0, 'gold+silver': 1, silver: 2 };
  return [...list].sort((a, b) => {
    const ma = order[a.metal] ?? 9;
    const mb = order[b.metal] ?? 9;
    if (ma !== mb) return ma - mb;
    return (a.name || '').localeCompare(b.name || '', 'en');
  });
}

const formatInr = (n) =>
  Number(n || 0).toLocaleString('en-IN', { maximumFractionDigits: 2 });

const typeLabel = (type) => TYPE_LABELS[type] || type || 'Physical';

const metalLabel = (metal) => {
  if (metal === 'gold+silver') return 'Gold + Silver';
  if (metal === 'silver') return 'Silver';
  if (metal === 'gold') return 'Gold';
  return metal || '—';
};

const FeatureIcon = ({ type }) => {
  if (type === 'purity') {
    return (
      <svg viewBox="0 0 28 28" fill="none" aria-hidden="true">
        <rect x="8" y="6" width="12" height="16" rx="1.5" stroke="currentColor" strokeWidth="1.6" />
        <path d="M10 10h8M10 14h8M10 18h5" stroke="currentColor" strokeWidth="1.4" />
      </svg>
    );
  }
  if (type === 'pack') {
    return (
      <svg viewBox="0 0 28 28" fill="none" aria-hidden="true">
        <path
          d="M14 4l8 4v6c0 5-3.5 8.5-8 10-4.5-1.5-8-5-8-10V8l8-4z"
          stroke="currentColor"
          strokeWidth="1.6"
        />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 28 28" fill="none" aria-hidden="true">
      <path d="M4 16h12l5-5h3v8H4v-3z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
      <circle cx="9" cy="22" r="2" stroke="currentColor" strokeWidth="1.4" />
      <circle cx="19" cy="22" r="2" stroke="currentColor" strokeWidth="1.4" />
    </svg>
  );
};

const OwnGoldPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { items, addToCart, updateQuantity, removeFromCart } = useCart();
  const { showToast } = useToast();
  const { openProductDetail } = useProductDetailModal();

  const [shopProducts, setShopProducts] = useState([]);
  const [shopLoading, setShopLoading] = useState(true);
  const [metals, setMetals] = useState([]);
  const [types, setTypes] = useState([]);
  const [categories, setCategories] = useState([]);
  const [page, setPage] = useState(1);
  const [openFilters, setOpenFilters] = useState({
    metal: true,
    type: true,
    category: true
  });
  const [qtyMap, setQtyMap] = useState({});

  const cartQtyById = useMemo(() => {
    const map = new Map();
    for (const item of items) map.set(String(item.id), Number(item.quantity) || 0);
    return map;
  }, [items]);

  useEffect(() => {
    const metal = new URLSearchParams(location.search).get('metal');
    if (metal === 'gold' || metal === 'silver') {
      setMetals([metal]);
      setPage(1);
    }
  }, [location.search]);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setShopLoading(true);
      try {
        const { data } = await productService.getAll({ limit: 500, page: 1 });
        if (cancelled) return;
        const apiProducts = unwrapProducts(data);
        setShopProducts(sortCatalog(apiProducts));
      } catch (e) {
        console.error('OwnGoldPage catalogue fetch:', e);
        if (!cancelled) setShopProducts([]);
      } finally {
        if (!cancelled) setShopLoading(false);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const toggleMulti = (value, setter) => {
    setter((prev) => (prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value]));
    setPage(1);
  };

  const clearFilters = () => {
    setMetals([]);
    setTypes([]);
    setCategories([]);
    setPage(1);
  };

  const typeOptions = useMemo(() => {
    const set = new Set();
    shopProducts.forEach((p) => {
      if (p.type) set.add(p.type);
    });
    return [...set];
  }, [shopProducts]);

  const categoryOptions = useMemo(() => {
    const set = new Set();
    shopProducts.forEach((p) => {
      const c = String(p.category || '').trim();
      if (c) set.add(c);
    });
    return [...set].sort((a, b) => a.localeCompare(b, 'en'));
  }, [shopProducts]);

  const metalOptions = useMemo(() => {
    const set = new Set();
    shopProducts.forEach((p) => {
      if (p.metal === 'gold' || p.metal === 'silver' || p.metal === 'gold+silver') set.add(p.metal);
    });
    return ['gold', 'silver', 'gold+silver'].filter((m) => set.has(m));
  }, [shopProducts]);

  const filtered = useMemo(() => {
    return shopProducts.filter((p) => {
      if (metals.length) {
        const ok = metals.some((m) => {
          if (m === 'gold') return p.metal === 'gold' || p.metal === 'gold+silver';
          if (m === 'silver') return p.metal === 'silver' || p.metal === 'gold+silver';
          return p.metal === m;
        });
        if (!ok) return false;
      }
      if (types.length && !types.includes(p.type)) return false;
      if (categories.length && !categories.includes(p.category)) return false;
      return true;
    });
  }, [shopProducts, metals, types, categories]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageSafe = Math.min(page, totalPages);
  const pageItems = filtered.slice((pageSafe - 1) * PAGE_SIZE, pageSafe * PAGE_SIZE);

  const getQty = (id) => qtyMap[id] || 1;
  const setQty = (id, next) => {
    setQtyMap((prev) => ({ ...prev, [id]: Math.max(1, Math.min(99, next)) }));
  };

  const inStock = (p) => Number(p.stock) > 0;

  const toCartItem = (p) => {
    const pid = String(p._id || p.id);
    return {
      id: pid,
      productId: pid,
      name: p.name,
      price: Number(p.pricePerUnit ?? p.price ?? 0),
      imageUrl: p.imageUrl || p.image,
      metal: p.metal,
      stock: Number(p.stock) || 0
    };
  };

  const handleAdd = (p, buyNow = false) => {
    const pid = String(p._id || p.id);
    if (!inStock(p)) {
      showToast('This product is out of stock', 'error');
      return;
    }
    const stock = Number(p.stock);
    const addQty = getQty(pid);
    const current = cartQtyById.get(pid) || 0;
    const nextQty = Math.min(stock, current + addQty);

    if (nextQty <= current) {
      showToast('Cannot add more — stock limit reached', 'error');
      return;
    }

    if (current > 0) {
      updateQuantity(pid, nextQty);
    } else {
      addToCart(toCartItem(p));
      if (nextQty > 1) {
        queueMicrotask(() => updateQuantity(pid, nextQty));
      }
    }

    showToast(
      buyNow ? `${p.name} ready — complete checkout from cart` : `${p.name} added to cart`,
      'success'
    );
    if (buyNow) navigate('/cart');
  };

  const scrollToShop = (metalHint) => {
    if (metalHint === 'gold') setMetals(['gold']);
    if (metalHint === 'silver') setMetals(['silver']);
    setPage(1);
    document.getElementById('ogd-shop')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div className="gs-page ogd-page">
      <Home2Chrome />

      <header className="ogd-page-title gs-section">
        <img src={mmtcAssets.titleLeft} alt="" className="ogd-title-ornament" />
        <h1>Physical Gold &amp; Silver Products – GoldnSilver.shop</h1>
        <img src={mmtcAssets.titleRight} alt="" className="ogd-title-ornament" />
      </header>

      <section className="gs-section ogd-hero-wrap" aria-label="GoldnSilver physical products">
        <div className="ogd-hero">
          <div className="ogd-hero-copy">
            <div className="ogd-hero-brand">
              <span>
                GoldnSilver.shop
                <small>Gold &amp; silver branded products</small>
              </span>
            </div>
            <p className="ogd-hero-body">
              Access a wide range of 24K 999.9+ gold and 999.9+ silver products from GoldnSilver.shop —
              India&apos;s trusted precious metal platform.
            </p>
            <div className="ogd-hero-features">
              {FEATURES.map((item) => (
                <div key={item.title} className="ogd-hero-feature">
                  <span className="ogd-hero-feature-ico">
                    <FeatureIcon type={item.icon} />
                  </span>
                  <strong>{item.title}</strong>
                </div>
              ))}
            </div>
            <div className="ogd-hero-actions">
              <button type="button" className="ogd-cta ogd-cta--gold" onClick={() => scrollToShop('gold')}>
                Shop Gold
              </button>
              <button type="button" className="ogd-cta ogd-cta--navy" onClick={() => scrollToShop('silver')}>
                Shop Silver
              </button>
            </div>
          </div>
          <div className="ogd-hero-visual">
            <img src={productSilver} alt="GoldnSilver branded silver coins" />
          </div>
        </div>
      </section>

      <section className="gs-section ogd-shop" id="ogd-shop">
        <div className="ogd-shop-head">
          <span className="ogd-shop-diamond" aria-hidden="true" />
          <h2>Gold &amp; Silver Products – GoldnSilver.shop</h2>
          <span className="ogd-shop-diamond" aria-hidden="true" />
        </div>

        <div className="ogd-shop-layout">
          <aside className="ogd-filters" aria-label="Filter products">
            <div className="ogd-filters-head">
              <h3>Filter By</h3>
              <button type="button" className="ogd-clear" onClick={clearFilters}>
                Clear
              </button>
            </div>

            <div className="ogd-filter-block">
              <button
                type="button"
                className="ogd-filter-toggle"
                onClick={() => setOpenFilters((s) => ({ ...s, metal: !s.metal }))}
              >
                Metal Type <span>{openFilters.metal ? '▾' : '▸'}</span>
              </button>
              {openFilters.metal && (
                <div className="ogd-filter-options">
                  {(metalOptions.length ? metalOptions : ['gold', 'silver']).map((opt) => (
                    <label key={opt}>
                      <input
                        type="checkbox"
                        checked={metals.includes(opt)}
                        onChange={() => toggleMulti(opt, setMetals)}
                      />
                      {metalLabel(opt)}
                    </label>
                  ))}
                </div>
              )}
            </div>

            {typeOptions.length > 0 && (
              <div className="ogd-filter-block">
                <button
                  type="button"
                  className="ogd-filter-toggle"
                  onClick={() => setOpenFilters((s) => ({ ...s, type: !s.type }))}
                >
                  Product type <span>{openFilters.type ? '▾' : '▸'}</span>
                </button>
                {openFilters.type && (
                  <div className="ogd-filter-options">
                    {typeOptions.map((opt) => (
                      <label key={opt}>
                        <input
                          type="checkbox"
                          checked={types.includes(opt)}
                          onChange={() => toggleMulti(opt, setTypes)}
                        />
                        {typeLabel(opt)}
                      </label>
                    ))}
                  </div>
                )}
              </div>
            )}

            {categoryOptions.length > 0 && (
              <div className="ogd-filter-block">
                <button
                  type="button"
                  className="ogd-filter-toggle"
                  onClick={() => setOpenFilters((s) => ({ ...s, category: !s.category }))}
                >
                  Category <span>{openFilters.category ? '▾' : '▸'}</span>
                </button>
                {openFilters.category && (
                  <div className="ogd-filter-options">
                    {categoryOptions.map((opt) => (
                      <label key={opt}>
                        <input
                          type="checkbox"
                          checked={categories.includes(opt)}
                          onChange={() => toggleMulti(opt, setCategories)}
                        />
                        {opt}
                      </label>
                    ))}
                  </div>
                )}
              </div>
            )}
          </aside>

          <div className="ogd-products-wrap">
            {shopLoading ? (
              <p className="ogd-empty">Loading catalogue…</p>
            ) : pageItems.length === 0 ? (
              <p className="ogd-empty">
                {shopProducts.length === 0
                  ? 'No products are listed yet. Add products in admin to see them here.'
                  : 'No products match your filters.'}
              </p>
            ) : (
              <div className="ogd-product-grid">
                {pageItems.map((p) => {
                  const pid = String(p._id || p.id);
                  const qty = getQty(pid);
                  const inCart = cartQtyById.get(pid) || 0;
                  const grams = Number(p.metalGrams || p.weightGrams || 0);
                  return (
                    <article
                      key={pid}
                      className="ogd-card"
                      onClick={(e) => {
                        if (e.target.closest('button, a')) return;
                        openProductDetail(p);
                      }}
                    >
                      <div className="ogd-card-media">
                        {p.imageUrl || p.image ? (
                          <img src={p.imageUrl || p.image} alt={p.name} />
                        ) : (
                          <div className="ogd-card-noimg">No image</div>
                        )}
                      </div>
                      <p className="ogd-card-meta">
                        <span>{metalLabel(p.metal)}</span>
                        {p.type && <span>{typeLabel(p.type)}</span>}
                        {p.category && <span>{p.category}</span>}
                      </p>
                      <h3>{p.name}</h3>
                      {p.description?.trim() && (
                        <p className="ogd-card-desc">
                          {p.description.trim().length > 90
                            ? `${p.description.trim().slice(0, 90)}…`
                            : p.description.trim()}
                        </p>
                      )}
                      <p className="ogd-card-weight">
                        Net weight:{' '}
                        {grams > 0 ? `${grams} ${p.unit || 'gm'}` : '—'}
                      </p>
                      <p className="ogd-card-price">
                        ₹ {formatInr(p.pricePerUnit ?? p.price)}
                        {p.pricingMode === 'fixed' && (
                          <small> · Fixed price</small>
                        )}
                      </p>
                      <p className="ogd-card-stock">
                        {inStock(p) ? `${p.stock} in stock` : 'Out of stock'}
                      </p>

                      <div className="ogd-qty" aria-label="Quantity">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setQty(pid, qty - 1);
                          }}
                          aria-label="Decrease quantity"
                        >
                          −
                        </button>
                        <span>{qty}</span>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setQty(pid, qty + 1);
                          }}
                          aria-label="Increase quantity"
                        >
                          +
                        </button>
                      </div>

                      {inCart > 0 && (
                        <p className="ogd-incart">
                          In cart: {inCart}{' '}
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              if (inCart <= 1) removeFromCart(pid);
                              else updateQuantity(pid, inCart - 1);
                            }}
                          >
                            remove
                          </button>
                        </p>
                      )}

                      <div className="ogd-card-actions">
                        <button
                          type="button"
                          className="ogd-card-btn ogd-card-btn--add"
                          disabled={!inStock(p)}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleAdd(p, false);
                          }}
                        >
                          Add to cart
                        </button>
                        <button
                          type="button"
                          className="ogd-card-btn ogd-card-btn--buy"
                          disabled={!inStock(p)}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleAdd(p, true);
                          }}
                        >
                          Buy Now
                        </button>
                      </div>
                      {!inStock(p) && <p className="ogd-oos">Out of stock</p>}
                    </article>
                  );
                })}
              </div>
            )}

            {!shopLoading && filtered.length > 0 && (
              <nav className="ogd-pagination" aria-label="Product pages">
                <button
                  type="button"
                  disabled={pageSafe <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                >
                  ‹
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
                  <button
                    key={n}
                    type="button"
                    className={n === pageSafe ? 'is-active' : undefined}
                    onClick={() => setPage(n)}
                  >
                    {n}
                  </button>
                ))}
                <button
                  type="button"
                  disabled={pageSafe >= totalPages}
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                >
                  ›
                </button>
              </nav>
            )}
          </div>
        </div>
      </section>

      <section className="gs-section ogd-info-wrap">
        <div className="ogd-info">
          <h2>Our Story</h2>
          <p>
            GoldnSilver.shop brings certified physical gold and silver to your doorstep with transparent
            pricing, insured delivery, and products backed by trusted purity standards — including
            partnerships with leading refiners such as MMTC-PAMP.
          </p>

          <h3>Why Choose GoldnSilver.shop?</h3>
          <div className="ogd-why-grid">
            {WHY_POINTS.map((item) => (
              <article key={item.title} className="ogd-why-item">
                <span className="ogd-why-check" aria-hidden="true">
                  ✓
                </span>
                <div>
                  <strong>{item.title}</strong>
                  <p>{item.text}</p>
                </div>
              </article>
            ))}
          </div>

          <h3>Buy Gold &amp; Silver Online with Confidence</h3>
          <p>
            From coins and bars to festive sets, shop physical gold and silver online with live rates,
            secure checkout, and full order tracking — designed for first-time buyers and seasoned
            investors alike.
          </p>

          <p className="ogd-tagline">GoldnSilver.shop — Investing in Purity. Investing in Trust.</p>
        </div>
      </section>

      <div className="ogd-footer-cta gs-section">
        <Link to="/cart" className="ogd-cta ogd-cta--gold">
          View Cart
        </Link>
        <Link to="/own-gifting" className="ogd-cta ogd-cta--navy">
          Shop Gifts
        </Link>
      </div>

      <GsPageFooter />
    </div>
  );
};

export default OwnGoldPage;
