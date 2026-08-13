import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Home2Chrome from '../components/Home2Chrome';
import GsPageFooter from '../components/GsPageFooter';
import { useCart } from '../state/CartContext';
import { useToast } from '../state/ToastContext';
import { mmtcAssets } from '../assets/images';
import { MMTC_PRODUCTS } from '../data/mmtcProducts';
import './PageShell.css';
import './OwnMmtcPampPage.css';

const PAGE_SIZE = 6;

const WEIGHT_OPTIONS = [5, 10, 20, 50, 100];
const CATEGORY_OPTIONS = ['Bars', 'Coins', 'Collectibles', 'Devotional', 'Investment', 'Gifting'];

const FEATURES = [
  { title: '24K 999.9+ purity', icon: 'purity' },
  { title: 'LBMA Accredited', icon: 'lbma' },
  { title: 'Tamper-proof Packaging', icon: 'pack' },
  { title: 'Insured Delivery', icon: 'ship' }
];

const formatInr = (n) =>
  Number(n).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const deliveryByLabel = () => {
  const d = new Date();
  d.setDate(d.getDate() + 4);
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
};

const FeatureIcon = ({ type }) => {
  if (type === 'purity') {
    return (
      <svg viewBox="0 0 28 28" fill="none" aria-hidden="true">
        <rect x="8" y="6" width="12" height="16" rx="1.5" stroke="#F8B70B" strokeWidth="1.6" />
        <path d="M10 10h8M10 14h8M10 18h5" stroke="#F8B70B" strokeWidth="1.4" />
      </svg>
    );
  }
  if (type === 'lbma') {
    return (
      <svg viewBox="0 0 28 28" fill="none" aria-hidden="true">
        <circle cx="14" cy="14" r="9" stroke="#F8B70B" strokeWidth="1.6" />
        <path d="M10 14l2.5 2.5L18 11" stroke="#F8B70B" strokeWidth="1.6" strokeLinejoin="round" />
      </svg>
    );
  }
  if (type === 'pack') {
    return (
      <svg viewBox="0 0 28 28" fill="none" aria-hidden="true">
        <path
          d="M14 4l8 4v6c0 5-3.5 8.5-8 10-4.5-1.5-8-5-8-10V8l8-4z"
          stroke="#F8B70B"
          strokeWidth="1.6"
        />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 28 28" fill="none" aria-hidden="true">
      <path d="M4 16h12l5-5h3v8H4v-3z" stroke="#F8B70B" strokeWidth="1.5" strokeLinejoin="round" />
      <circle cx="9" cy="22" r="2" stroke="#F8B70B" strokeWidth="1.4" />
      <circle cx="19" cy="22" r="2" stroke="#F8B70B" strokeWidth="1.4" />
    </svg>
  );
};

const OwnMmtcPampPage = () => {
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { showToast } = useToast();
  const [metal, setMetal] = useState('all');
  const [weights, setWeights] = useState([]);
  const [categories, setCategories] = useState([]);
  const [page, setPage] = useState(1);
  const [openFilters, setOpenFilters] = useState({
    type: true,
    weight: true,
    category: true
  });
  const [qtyMap, setQtyMap] = useState({});
  const deliveryLabel = useMemo(() => deliveryByLabel(), []);

  const getQty = (id) => qtyMap[id] || 1;

  const setQty = (id, next) => {
    setQtyMap((prev) => ({ ...prev, [id]: Math.max(1, Math.min(99, next)) }));
  };

  const toggleMulti = (value, setter) => {
    setter((prev) => (prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value]));
    setPage(1);
  };

  const filtered = useMemo(() => {
    return MMTC_PRODUCTS.filter((p) => {
      if (metal !== 'all' && p.metal !== metal) return false;
      if (weights.length && !weights.includes(p.weightGrams)) return false;
      if (categories.length && !categories.some((c) => p.category.includes(c))) return false;
      return true;
    });
  }, [metal, weights, categories]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageSafe = Math.min(page, totalPages);
  const pageItems = filtered.slice((pageSafe - 1) * PAGE_SIZE, pageSafe * PAGE_SIZE);

  const handleAdd = (product, buyNow = false) => {
    const qty = getQty(product.id);
    for (let i = 0; i < qty; i += 1) {
      addToCart({
        id: product.id,
        name: product.name,
        price: product.price,
        imageUrl: product.imageUrl,
        metal: product.metal,
        stock: 99
      });
    }
    showToast(
      buyNow ? `${product.name} ready — complete checkout from cart` : `${product.name} added to cart`,
      'success'
    );
    if (buyNow) navigate('/cart');
  };

  const openDetail = (product) => {
    navigate(`/own-mmtc-pamp/${product.id}`);
  };

  return (
    <div className="gs-page mmtc-page">
      <Home2Chrome />

      <header className="mmtc-page-title gs-section">
        <img src={mmtcAssets.titleLeft} alt="" className="mmtc-title-ornament" />
        <h1>Physical Gold &amp; Silver MMTC-PAMP Products</h1>
        <img src={mmtcAssets.titleRight} alt="" className="mmtc-title-ornament" />
      </header>

      <section className="gs-section mmtc-hero-wrap" aria-label="MMTC-PAMP products hero">
        <div className="mmtc-hero" style={{ backgroundImage: `url(${mmtcAssets.bannerBg})` }}>
          <img
            src={mmtcAssets.logoBanner}
            alt="MMTC-PAMP — Swiss Excellence. Made in India."
            className="mmtc-hero-logo"
          />
          <div className="mmtc-hero-main">
            <div className="mmtc-hero-copy">
              <h2>
                MMTC-PAMP
                <span>Gold &amp; Silver Products</span>
              </h2>
              <p>
                Access a wide range of 24K 999.9+ pure gold &amp; 999+ pure silver products from
                MMTC-PAMP, India&apos;s most trusted precious metal partner.
              </p>
              <div className="mmtc-hero-features">
                {FEATURES.map((item) => (
                  <div key={item.title} className="mmtc-hero-feature">
                    <span className="mmtc-hero-feature-ico">
                      <FeatureIcon type={item.icon} />
                    </span>
                    <strong>{item.title}</strong>
                  </div>
                ))}
              </div>
              <div className="mmtc-hero-actions">
                <Link to="/own-gold" className="mmtc-cta mmtc-cta--gold">
                  Shop Gold
                </Link>
                <Link to="/own-gold?metal=silver" className="mmtc-cta mmtc-cta--navy">
                  Shop Silver
                </Link>
              </div>
            </div>
          </div>
          <div className="mmtc-hero-visual">
            <img src={mmtcAssets.hero} alt="MMTC-PAMP gold and silver bars and coins" />
          </div>
        </div>
      </section>

      <section className="gs-section mmtc-shop">
        <div className="mmtc-shop-head">
          <span className="mmtc-shop-diamond" aria-hidden="true" />
          <h2>MMTC-PAMP Gold &amp; Silver Products</h2>
          <span className="mmtc-shop-diamond" aria-hidden="true" />
        </div>

        <div className="mmtc-shop-layout">
          <aside className="mmtc-filters" aria-label="Filter products">
            <h3>Filter By</h3>

            <div className="mmtc-filter-block">
              <button
                type="button"
                className="mmtc-filter-toggle"
                onClick={() => setOpenFilters((s) => ({ ...s, type: !s.type }))}
              >
                Product Type <span>{openFilters.type ? '▾' : '▸'}</span>
              </button>
              {openFilters.type && (
                <div className="mmtc-filter-options">
                  {[
                    ['all', 'All'],
                    ['gold', 'Gold'],
                    ['silver', 'Silver']
                  ].map(([value, label]) => (
                    <label key={value}>
                      <input
                        type="radio"
                        name="mmtc-type"
                        checked={metal === value}
                        onChange={() => {
                          setMetal(value);
                          setPage(1);
                        }}
                      />
                      {label}
                    </label>
                  ))}
                </div>
              )}
            </div>

            <div className="mmtc-filter-block">
              <button
                type="button"
                className="mmtc-filter-toggle"
                onClick={() => setOpenFilters((s) => ({ ...s, weight: !s.weight }))}
              >
                Product Weight <span>{openFilters.weight ? '▾' : '▸'}</span>
              </button>
              {openFilters.weight && (
                <div className="mmtc-filter-options">
                  {WEIGHT_OPTIONS.map((w) => (
                    <label key={w}>
                      <input
                        type="checkbox"
                        checked={weights.includes(w)}
                        onChange={() => toggleMulti(w, setWeights)}
                      />
                      {w} g
                    </label>
                  ))}
                </div>
              )}
            </div>

            <div className="mmtc-filter-block">
              <button
                type="button"
                className="mmtc-filter-toggle"
                onClick={() => setOpenFilters((s) => ({ ...s, category: !s.category }))}
              >
                Category <span>{openFilters.category ? '▾' : '▸'}</span>
              </button>
              {openFilters.category && (
                <div className="mmtc-filter-options">
                  {CATEGORY_OPTIONS.map((opt) => (
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
          </aside>

          <div className="mmtc-products-panel">
            {pageItems.length === 0 ? (
              <p className="mmtc-empty">No products match your filters.</p>
            ) : (
              <div className="mmtc-product-grid">
                {pageItems.map((product) => (
                  <article
                    key={product.id}
                    className="mmtc-card"
                    onClick={(e) => {
                      if (e.target.closest('button, a')) return;
                      openDetail(product);
                    }}
                  >
                    <div className="mmtc-card-media">
                      <img src={product.imageUrl} alt={product.name} />
                    </div>
                    <div className="mmtc-card-body">
                      <h3>{product.name}</h3>
                      <p className="mmtc-card-price">₹ {formatInr(product.price)}</p>
                      <p className="mmtc-card-delivery">Delivery by {deliveryLabel}</p>
                      <div className="mmtc-qty">
                        <button
                          type="button"
                          aria-label="Decrease quantity"
                          onClick={() => setQty(product.id, getQty(product.id) - 1)}
                        >
                          −
                        </button>
                        <span>{getQty(product.id)}</span>
                        <button
                          type="button"
                          aria-label="Increase quantity"
                          onClick={() => setQty(product.id, getQty(product.id) + 1)}
                        >
                          +
                        </button>
                      </div>
                      <div className="mmtc-card-actions">
                        <button type="button" onClick={() => handleAdd(product, false)}>
                          Add to Cart
                        </button>
                        <button type="button" onClick={() => handleAdd(product, true)}>
                          Buy Now
                        </button>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}

            <nav className="mmtc-pagination" aria-label="Product pages">
              <button
                type="button"
                disabled={pageSafe <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                &lt;
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
                <button
                  key={n}
                  type="button"
                  className={n === pageSafe ? 'active' : ''}
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
                &gt;
              </button>
            </nav>
          </div>
        </div>
      </section>

      <GsPageFooter />
    </div>
  );
};

export default OwnMmtcPampPage;
