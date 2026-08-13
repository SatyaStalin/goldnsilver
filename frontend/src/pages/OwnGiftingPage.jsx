import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import Home2Chrome from '../components/Home2Chrome';
import GsPageFooter from '../components/GsPageFooter';
import { useCart } from '../state/CartContext';
import { useToast } from '../state/ToastContext';
import { giftHero, giftProductImgs } from '../assets/images';
import './PageShell.css';
import './OwnGiftingPage.css';

const PAGE_SIZE = 6;

const STATIC_PRODUCTS = [
  {
    id: 'gift-dp1001',
    name: 'DP1001 Peepal Leaf Idol - Laxmi ji',
    imageUrl: giftProductImgs.gift471,
    weightGrams: 20,
    metal: 'silver',
    price: 684.95,
    series: ['Silver', 'Ganesha'],
    category: ['Devotional', 'Gifting'],
    shape: ['Pendants']
  },
  {
    id: 'gift-dp1002',
    name: 'DP1002 Silver Balaji Frame Idol',
    imageUrl: giftProductImgs.gift473,
    weightGrams: 50,
    metal: 'silver',
    price: 1680.0,
    series: ['Balaji', 'Silver'],
    category: ['Devotional', 'Gifting'],
    shape: ['Rectangular Ingot']
  },
  {
    id: 'gift-dp1003',
    name: 'DP1003 24K Gold Coin – Gift Pack',
    imageUrl: giftProductImgs.gift475,
    weightGrams: 10,
    metal: 'gold',
    price: 98450.0,
    series: ['Gold'],
    category: ['Bullion', 'Gifting', 'Classic'],
    shape: ['Coin']
  },
  {
    id: 'gift-dp1004',
    name: 'DP1004 Silver Laxmi Coin Gift Box',
    imageUrl: giftProductImgs.gift476,
    weightGrams: 20,
    metal: 'silver',
    price: 1499.0,
    series: ['Silver'],
    category: ['Devotional', 'Gifting'],
    shape: ['Coin']
  },
  {
    id: 'gift-dp1005',
    name: 'DP1005 Silver Coin – Classic Collection',
    imageUrl: giftProductImgs.silverCoin,
    weightGrams: 10,
    metal: 'silver',
    price: 920.0,
    series: ['Silver'],
    category: ['Classic', 'Gifting'],
    shape: ['Coin']
  },
  {
    id: 'gift-dp1006',
    name: 'DP1006 Gold Coin – Festive Gift',
    imageUrl: giftProductImgs.img354,
    weightGrams: 5,
    metal: 'gold',
    price: 49250.0,
    series: ['Gold'],
    category: ['Bullion', 'Gifting'],
    shape: ['Coin']
  },
  {
    id: 'gift-dp1007',
    name: 'DP1007 Ganesha Silver Idol Gift',
    imageUrl: giftProductImgs.gift471,
    weightGrams: 25,
    metal: 'silver',
    price: 2100.0,
    series: ['Ganesha', 'Silver'],
    category: ['Devotional', 'Gifting'],
    shape: ['Cast Bar']
  },
  {
    id: 'gift-dp1008',
    name: 'DP1008 Premium Silver Gift Set',
    imageUrl: giftProductImgs.gift473,
    weightGrams: 30,
    metal: 'silver',
    price: 2750.0,
    series: ['Silver'],
    category: ['Gifting', 'Classic'],
    shape: ['Pendants']
  }
];

const SERIES_OPTIONS = ['Ganesha', 'Balaji', 'Gold', 'Silver'];
const CATEGORY_OPTIONS = ['Bullion', 'Devotional', 'Classic', 'Gifting'];
const SHAPE_OPTIONS = ['Cast Bar', 'Coin', 'Rectangular Ingot', 'Pendants'];

const TRUST_POINTS = [
  { title: 'BIS Hallmarked', text: '100% authentic', icon: 'bis' },
  { title: 'Premium Packaging', text: 'prefer for gifting', icon: 'pack' },
  { title: 'Insured Delivery', text: 'Safe & Secure', icon: 'ship' },
  { title: 'Buyback Guarantee', text: 'Trusted returns', icon: 'buyback' }
];

const WHY_POINTS = [
  {
    title: 'Premium Gift Collection',
    text: 'Curated gold & silver gifts for every celebration.',
    icon: 'gift'
  },
  {
    title: 'Certified Purity',
    text: 'BIS-hallmarked products with authentic certificates.',
    icon: 'cert'
  },
  {
    title: 'Transparent Pricing',
    text: 'Clear rates with no hidden charges.',
    icon: 'price'
  },
  {
    title: 'Safe & Secure Shopping',
    text: 'Encrypted checkout and insured shipping.',
    icon: 'secure'
  },
  {
    title: 'Elegant Gift Packaging',
    text: 'Premium boxes ready for every occasion.',
    icon: 'box'
  },
  {
    title: 'Trusted Quality',
    text: 'Backed by trusted bullion partners.',
    icon: 'trust'
  }
];

const LeafIcon = () => (
  <svg className="og-leaf" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path
      d="M12 21c0-8 7-11 7-18-6 1-10 5-11 10C6 8 3 6 2 4c1 7 5 12 10 17z"
      fill="#C9A227"
      opacity="0.9"
    />
  </svg>
);

const TrustIcon = ({ type }) => {
  if (type === 'bis') {
    return (
      <svg viewBox="0 0 40 40" fill="none" aria-hidden="true">
        <circle cx="20" cy="20" r="15" stroke="#744D22" strokeWidth="1.8" />
        <path d="M13 20l5 5 9-10" stroke="#744D22" strokeWidth="1.8" strokeLinejoin="round" />
      </svg>
    );
  }
  if (type === 'pack') {
    return (
      <svg viewBox="0 0 40 40" fill="none" aria-hidden="true">
        <rect x="9" y="12" width="22" height="16" rx="2" stroke="#744D22" strokeWidth="1.8" />
        <path d="M9 18h22M20 12v16" stroke="#744D22" strokeWidth="1.8" />
      </svg>
    );
  }
  if (type === 'ship') {
    return (
      <svg viewBox="0 0 40 40" fill="none" aria-hidden="true">
        <path d="M8 24h16l6-6h4v10H8v-4z" stroke="#744D22" strokeWidth="1.8" strokeLinejoin="round" />
        <circle cx="14" cy="30" r="2.5" stroke="#744D22" strokeWidth="1.6" />
        <circle cx="28" cy="30" r="2.5" stroke="#744D22" strokeWidth="1.6" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 40 40" fill="none" aria-hidden="true">
      <path
        d="M20 8l3 7h7l-5.5 4.5 2 7L20 22l-6.5 4.5 2-7L10 15h7l3-7z"
        stroke="#744D22"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
    </svg>
  );
};

const WhyIcon = ({ type }) => {
  const common = { stroke: '#744D22', strokeWidth: 1.7, fill: 'none' };
  if (type === 'gift') {
    return (
      <svg viewBox="0 0 36 36" aria-hidden="true">
        <rect x="7" y="14" width="22" height="14" rx="2" {...common} />
        <path d="M7 20h22M18 14v14M14 10c0-2 4-3 4-1s4-1 4 1" {...common} />
      </svg>
    );
  }
  if (type === 'cert') {
    return (
      <svg viewBox="0 0 36 36" aria-hidden="true">
        <circle cx="18" cy="16" r="8" {...common} />
        <path d="M14 16l3 3 5-5M15 24l3 4 3-4" {...common} />
      </svg>
    );
  }
  if (type === 'price') {
    return (
      <svg viewBox="0 0 36 36" aria-hidden="true">
        <circle cx="18" cy="18" r="10" {...common} />
        <path d="M18 11v14M14 14h6a3 3 0 010 6h-4a3 3 0 000 6h7" {...common} />
      </svg>
    );
  }
  if (type === 'secure') {
    return (
      <svg viewBox="0 0 36 36" aria-hidden="true">
        <path d="M18 6L8 11v7c0 7 4.5 11 10 12 5.5-1 10-5 10-12v-7L18 6z" {...common} />
      </svg>
    );
  }
  if (type === 'box') {
    return (
      <svg viewBox="0 0 36 36" aria-hidden="true">
        <path d="M6 14l12-6 12 6-12 6-12-6zM6 14v10l12 6 12-6V14" {...common} />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 36 36" aria-hidden="true">
      <path d="M18 28s-9-5-9-12V8l9-4 9 4v8c0 7-9 12-9 12z" {...common} />
      <path d="M14 16l3 3 6-6" {...common} />
    </svg>
  );
};

const formatInr = (n) =>
  Number(n).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const formatWeight = (n) =>
  Number(n).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const OwnGiftingPage = () => {
  const { addToCart } = useCart();
  const { showToast } = useToast();
  const [metal, setMetal] = useState('all');
  const [series, setSeries] = useState([]);
  const [categories, setCategories] = useState([]);
  const [shapes, setShapes] = useState([]);
  const [page, setPage] = useState(1);
  const [openFilters, setOpenFilters] = useState({
    metal: true,
    series: true,
    category: true,
    shape: true
  });
  const [selected, setSelected] = useState(null);

  const toggleMulti = (value, list, setter) => {
    setter((prev) => (prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value]));
    setPage(1);
  };

  const filtered = useMemo(() => {
    return STATIC_PRODUCTS.filter((p) => {
      if (metal !== 'all' && p.metal !== metal) return false;
      if (series.length && !series.some((s) => p.series.includes(s))) return false;
      if (categories.length && !categories.some((c) => p.category.includes(c))) return false;
      if (shapes.length && !shapes.some((s) => p.shape.includes(s))) return false;
      return true;
    });
  }, [metal, series, categories, shapes]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageSafe = Math.min(page, totalPages);
  const pageItems = filtered.slice((pageSafe - 1) * PAGE_SIZE, pageSafe * PAGE_SIZE);

  const handleBuy = (product) => {
    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      imageUrl: product.imageUrl,
      metal: product.metal,
      stock: 99
    });
    showToast(`${product.name} added to cart`, 'success');
  };

  return (
    <div className="gs-page og-page">
      <Home2Chrome />

      <header className="og-page-title gs-section">
        <LeafIcon />
        <h1>Gold &amp; Silver Gift Collections</h1>
        <LeafIcon />
      </header>

      <section className="gs-section og-hero-wrap" aria-label="Gift collections hero">
        <div className="og-hero">
          <div className="og-hero-copy">
            <h2>Gift Collections</h2>
            <p className="og-hero-sub">Celebrate every occasion with timeless gifts in</p>
            <p className="og-hero-metal">Gold &amp; Silver</p>
            <div className="og-trust-row">
              {TRUST_POINTS.map((item) => (
                <div key={item.title} className="og-trust-item">
                  <span className="og-trust-ico">
                    <TrustIcon type={item.icon} />
                  </span>
                  <span>
                    <strong>{item.title}</strong>
                    <small>{item.text}</small>
                  </span>
                </div>
              ))}
            </div>
            <div className="og-hero-actions">
              <Link to="/own-gold" className="og-btn og-btn--gold">
                Shop Gold
              </Link>
              <Link to="/own-silver" className="og-btn og-btn--navy">
                Shop Silver
              </Link>
            </div>
          </div>
          <div className="og-hero-media">
            <img src={giftHero} alt="Gold and silver gift collections" />
          </div>
        </div>
      </section>

      <section className="gs-section og-shop">
        <div className="og-shop-head">
          <h2>Gold &amp; Silver Gift Products</h2>
          <p>Thoughtful Gifts for your loved ones on every special occasion.</p>
        </div>

        <div className="og-shop-layout">
          <aside className="og-filters" aria-label="Filter products">
            <h3>Filter By</h3>

            <div className="og-filter-block">
              <button
                type="button"
                className="og-filter-toggle"
                onClick={() => setOpenFilters((s) => ({ ...s, metal: !s.metal }))}
              >
                Metal Type <span>{openFilters.metal ? '▾' : '▸'}</span>
              </button>
              {openFilters.metal && (
                <div className="og-filter-options">
                  <label>
                    <input
                      type="radio"
                      name="metal"
                      checked={metal === 'all'}
                      onChange={() => {
                        setMetal('all');
                        setPage(1);
                      }}
                    />
                    All
                  </label>
                  <label>
                    <input
                      type="radio"
                      name="metal"
                      checked={metal === 'gold'}
                      onChange={() => {
                        setMetal('gold');
                        setPage(1);
                      }}
                    />
                    Gold
                  </label>
                  <label>
                    <input
                      type="radio"
                      name="metal"
                      checked={metal === 'silver'}
                      onChange={() => {
                        setMetal('silver');
                        setPage(1);
                      }}
                    />
                    Silver
                  </label>
                </div>
              )}
            </div>

            <div className="og-filter-block">
              <button
                type="button"
                className="og-filter-toggle"
                onClick={() => setOpenFilters((s) => ({ ...s, series: !s.series }))}
              >
                Product series type <span>{openFilters.series ? '▾' : '▸'}</span>
              </button>
              {openFilters.series && (
                <div className="og-filter-options">
                  {SERIES_OPTIONS.map((opt) => (
                    <label key={opt}>
                      <input
                        type="checkbox"
                        checked={series.includes(opt)}
                        onChange={() => toggleMulti(opt, series, setSeries)}
                      />
                      {opt}
                    </label>
                  ))}
                </div>
              )}
            </div>

            <div className="og-filter-block">
              <button
                type="button"
                className="og-filter-toggle"
                onClick={() => setOpenFilters((s) => ({ ...s, category: !s.category }))}
              >
                Category <span>{openFilters.category ? '▾' : '▸'}</span>
              </button>
              {openFilters.category && (
                <div className="og-filter-options">
                  {CATEGORY_OPTIONS.map((opt) => (
                    <label key={opt}>
                      <input
                        type="checkbox"
                        checked={categories.includes(opt)}
                        onChange={() => toggleMulti(opt, categories, setCategories)}
                      />
                      {opt}
                    </label>
                  ))}
                </div>
              )}
            </div>

            <div className="og-filter-block">
              <button
                type="button"
                className="og-filter-toggle"
                onClick={() => setOpenFilters((s) => ({ ...s, shape: !s.shape }))}
              >
                Shape <span>{openFilters.shape ? '▾' : '▸'}</span>
              </button>
              {openFilters.shape && (
                <div className="og-filter-options">
                  {SHAPE_OPTIONS.map((opt) => (
                    <label key={opt}>
                      <input
                        type="checkbox"
                        checked={shapes.includes(opt)}
                        onChange={() => toggleMulti(opt, shapes, setShapes)}
                      />
                      {opt}
                    </label>
                  ))}
                </div>
              )}
            </div>
          </aside>

          <div className="og-products-wrap">
            {pageItems.length === 0 ? (
              <p className="og-empty">No products match your filters.</p>
            ) : (
              <div className="og-product-grid">
                {pageItems.map((product) => (
                  <article key={product.id} className="og-card">
                    <h3>{product.name}</h3>
                    <div className="og-card-media">
                      <img src={product.imageUrl} alt={product.name} />
                    </div>
                    <div className="og-card-meta">
                      <span>{formatWeight(product.weightGrams)} gm</span>
                      <span className={`og-metal-badge og-metal-badge--${product.metal}`}>
                        {product.metal === 'gold' ? 'Gold' : 'Silver'}
                      </span>
                    </div>
                    <p className="og-card-price">₹ {formatInr(product.price)}</p>
                    <div className="og-card-actions">
                      <button type="button" className="og-card-btn" onClick={() => handleBuy(product)}>
                        Buy Now
                      </button>
                      <button
                        type="button"
                        className="og-card-btn og-card-btn--view"
                        onClick={() => setSelected(product)}
                      >
                        View Details <span aria-hidden="true">👁</span>
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            )}

            <nav className="og-pagination" aria-label="Product pages">
              <button
                type="button"
                disabled={pageSafe <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                aria-label="Previous page"
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
                aria-label="Next page"
              >
                &gt;
              </button>
            </nav>
          </div>
        </div>
      </section>

      <section className="gs-section og-info">
        <h2>Our Story</h2>
        <p>
          At GoldnSilver.shop, we believe every gift should carry meaning, purity, and lasting value.
          Our gift collections bring together certified gold and silver products — curated for
          festivals, weddings, corporate occasions, and personal milestones — in partnership with
          trusted bullion brands including MMTC-PAMP.
        </p>
      </section>

      <section className="gs-section og-why">
        <h2>Why Choose GoldnSilver.shop Gift Collections?</h2>
        <div className="og-why-grid">
          {WHY_POINTS.map((item) => (
            <article key={item.title} className="og-why-card">
              <span className="og-why-ico">
                <WhyIcon type={item.icon} />
              </span>
              <h3>{item.title}</h3>
              <p>{item.text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="gs-section og-info">
        <h2>Celebrate Every Occasion with Precious Gifts</h2>
        <p>
          From Diwali and weddings to birthdays and corporate milestones, gift purity that lasts.
          Choose gold for grandeur, silver for grace — beautifully packaged and delivered with care.
        </p>
      </section>

      <p className="og-tagline">
        GoldnSilver.shop — Gift Purity. Gift Prosperity. Gift Memories.
      </p>

      {selected && (
        <div className="og-modal" onClick={() => setSelected(null)} role="presentation">
          <div
            className="og-modal-panel"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-label={selected.name}
          >
            <button
              type="button"
              className="og-modal-close"
              onClick={() => setSelected(null)}
              aria-label="Close"
            >
              ×
            </button>
            <img src={selected.imageUrl} alt={selected.name} />
            <h3>{selected.name}</h3>
            <p>
              {formatWeight(selected.weightGrams)} gm ·{' '}
              {selected.metal === 'gold' ? 'Gold' : 'Silver'} · ₹ {formatInr(selected.price)}
            </p>
            <button type="button" className="og-btn og-btn--gold" onClick={() => handleBuy(selected)}>
              Buy Now
            </button>
          </div>
        </div>
      )}

      <GsPageFooter />
    </div>
  );
};

export default OwnGiftingPage;
