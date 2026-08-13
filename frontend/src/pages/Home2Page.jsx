import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../state/CartContext';
import { useProductDetailModal } from '../state/ProductDetailModalContext';
import { productService, zerodhaService } from '../services/api';
import { MMTC_PRODUCTS } from '../data/mmtcProducts';
import { atStockLimit, clampToStock, productStock } from '../utils/stock';
import {
  heroVisual,
  catPhysical,
  catDigital,
  catEtf,
  catLoan,
  catBuyback,
  productSilver,
  productTemple,
  partnerMmtc,
  partnerSafegold,
  partnerZerodha,
  partnerNse,
  partnerCashfree,
  knowInsights,
  knowSip,
  knowPhysical,
  knowDigital
} from '../assets/homepageMain';
import partnerUpi from '../assets/homepageMain/image 769.png';
import partnerVisa from '../assets/homepageMain/image 770.png';
import partnerRupay from '../assets/homepageMain/image 771.png';
import partnerAugmont from '../assets/homepageMain/image 764.png';
import partnerCms from '../assets/homepageMain/image 767.png';
import iconCorpMgr from '../assets/homepageMain/image 571.png';
import iconCorpMint from '../assets/homepageMain/image 572.png';
import iconLoan1 from '../assets/homepageMain/image 574.png';
import iconLoan2 from '../assets/homepageMain/image 575.png';
import iconLoan3 from '../assets/homepageMain/image 576.png';
import iconBb1 from '../assets/homepageMain/image 577.png';
import iconBb2 from '../assets/homepageMain/image 578.png';
import iconBb3 from '../assets/homepageMain/image 579.png';
import iconBb4 from '../assets/homepageMain/image 580.png';
import iconFeatPurity from '../assets/homepageMain/image 582.png';
import iconFeatVault from '../assets/homepageMain/image 583.png';
import iconFeatStorage from '../assets/homepageMain/image 584.png';
import iconFeatLive from '../assets/homepageMain/image 585.png';
import wishIcon from '../assets/homepageMain/image 565.png';
import cartIcon from '../assets/homepageMain/image 567.png';
import trustInsured from '../assets/homepageMain/trust552.png';
import trustPurity from '../assets/homepageMain/trust553.png';
import trustNse from '../assets/homepageMain/trust556.png';
import trustSecure from '../assets/homepageMain/trust557.png';
import './Home2Page.css';

const BULLION_TABS = [
  { id: 'inhouse', label: 'GoldnSilver In-House', source: 'dynamic', viewAll: '/own-gold' },
  { id: 'gifting', label: 'Corporate Gifting', source: 'dynamic', viewAll: '/own-gold' },
  { id: 'mmtc', label: 'MMTC-PAMP Certified', source: 'mmtc', viewAll: '/own-mmtc-pamp' },
  { id: 'divine', label: 'Divine Collection', source: 'dynamic', viewAll: '/own-gold' }
];

const MMTC_HOME_PRODUCTS = MMTC_PRODUCTS.map((p) => ({
  ...p,
  _id: p.id,
  pricePerUnit: p.price,
  stock: 1,
  mrp: p.mrp || Math.round(Number(p.price) * 1.15)
}));

const DIGITAL_TABS = ['Daily Auto-Invest', 'Monthly SIP', 'One-Time Purchase'];
const DIGITAL_MODES = [
  { mode: 'Daily Savings', min: '₹10 / day', best: 'Micro savings & Habit building', action: 'Start Now', to: '/sip-plans' },
  { mode: 'Monthly SIP', min: '₹100 / month', best: 'Long term goals (Education, Marriage)', action: 'Start Now', to: '/sip-plans' },
  { mode: 'One-Time Buy', min: '₹50 Lump Sum', best: 'Market dips / Festival Buys', action: 'Start Now', to: '/invest' }
];

const CATS = [
  { img: catPhysical, title: 'Physical Gold & Silver', sub: 'Coins, Bars & Idols', to: '/own' },
  { img: catDigital, title: 'Digital Gold & Silver', sub: 'Invest from ₹10', to: '/invest' },
  { img: catEtf, title: 'Gold & silver ETF’s', sub: 'Trade on NSE IX & Zerodha', to: '/zerodha-integration' },
  { img: catLoan, title: 'Gold Loans', sub: 'Collateralize & Get Instant Loans', to: '/digital-gold' },
  { img: catBuyback, title: 'Gold Buyback', sub: 'Best Prices Guaranteed', to: '/buy-back' }
];

const FALLBACK_ETFS = [
  { name: 'Nippon India Gold BeES', yr: '18.2%', expense: '0.79%', aum: '11,200' },
  { name: 'HDFC Silver ETF', yr: '23.4%', expense: '0.40%', aum: '3,456' },
  { name: 'ICICI Prudential Gold ETF', yr: '16.7%', expense: '0.46%', aum: '6,400' },
  { name: 'SPDR Gold shares', yr: '14.8%', expense: '0.40%', aum: '11,200' }
];

const FALLBACK_PRODUCTS = [
  {
    _id: 'h2-1',
    name: '(999.9+) Purest 50 g Vaishno Devi Silver Coin (50g)',
    pricePerUnit: 13800,
    mrp: 15500,
    imageUrl: productSilver,
    stock: 40
  },
  {
    _id: 'h2-2',
    name: '(999.9+) Purest 50 gm Ganesha Colored Silver Coin',
    pricePerUnit: 13570,
    mrp: 15610,
    imageUrl: productTemple,
    stock: 25
  },
  {
    _id: 'h2-3',
    name: '(999.9+) Purest 50 g Balaji Silver Bar',
    pricePerUnit: 13570,
    mrp: 15610,
    imageUrl: knowPhysical,
    stock: 18
  },
  {
    _id: 'h2-4',
    name: '24K Gold Coin – Gifting Collection',
    pricePerUnit: 8999,
    mrp: 9999,
    imageUrl: catPhysical,
    stock: 30
  },
  {
    _id: 'h2-5',
    name: '999 Silver Bar 100g',
    pricePerUnit: 11200,
    mrp: 12500,
    imageUrl: knowPhysical,
    stock: 22
  },
  {
    _id: 'h2-6',
    name: 'Divine Silver Coin Set',
    pricePerUnit: 14999,
    mrp: 16999,
    imageUrl: productSilver,
    stock: 12
  }
];

const KNOWLEDGE = [
  { title: 'Weekly Market Insights', desc: 'Stay Updated with Gold & Silver trades', img: knowInsights, to: '/knowledge-hub' },
  { title: 'SIP Calculator', desc: 'Plan your investments smartly', img: knowSip, to: '/sip-plans' },
  { title: 'Digital gold & silver Calculator', desc: 'Calculate your future wealth.', img: knowDigital, to: '/invest' },
  { title: 'Physical Gold & silver Calculator', desc: 'Estimate value and return.', img: knowPhysical, to: '/own' }
];

const PARTNER_GROUPS = [
  {
    title: 'Vaulting & Bullion Partners',
    items: [
      { name: 'MMTC-PAMP', img: partnerMmtc },
      { name: 'SafeGold', img: partnerSafegold },
      { name: 'Augmont', img: partnerAugmont }
    ]
  },
  {
    title: 'Market & Brokerage Partners',
    items: [
      { name: 'Zerodha', img: partnerZerodha },
      { name: 'NSE IX', img: partnerNse }
    ]
  },
  {
    title: 'Payment Gateways & Logistics',
    items: [
      { name: 'Cashfree', img: partnerCashfree },
      { name: 'CMS', img: partnerCms },
      { name: 'UPI', img: partnerUpi },
      { name: 'Visa', img: partnerVisa },
      { name: 'RuPay', img: partnerRupay }
    ]
  }
];

const PAGE_SIZE = 3;

const BullionCard = ({ p, cartQtyById, addToCart, updateQuantity, removeFromCart }) => {
  const navigate = useNavigate();
  const { openProductDetail } = useProductDetailModal();
  const pid = String(p._id || p.id);
  const cartQty = cartQtyById.get(pid) || 0;
  const stock = productStock(p);
  const soldOut = stock <= 0;
  const cartFull = atStockLimit(p, cartQty);
  const [localQty, setLocalQty] = useState(() => clampToStock(1, p));
  const price = Number(p.pricePerUnit ?? p.price ?? 0);
  const mrp = p.mrp || Math.round(price * 1.12);
  const isMmtc = pid.startsWith('mmtc-');

  useEffect(() => {
    setLocalQty((q) => clampToStock(q, stock));
  }, [stock]);

  const openDetail = () => {
    if (isMmtc) {
      navigate(`/own-mmtc-pamp/${pid}`);
      return;
    }
    openProductDetail(p);
  };

  const addOne = () => {
    if (soldOut || cartFull) return;
    addToCart({
      id: pid,
      name: p.name,
      price,
      productId: isMmtc ? undefined : pid,
      stock,
      imageUrl: p.imageUrl || p.image
    });
  };

  const buyNow = () => {
    if (soldOut) return;
    if (cartFull) {
      navigate('/cart');
      return;
    }
    const remaining = stock - cartQty;
    const add = Math.min(localQty, remaining);
    if (add < 1) return;
    if (cartQty > 0) {
      updateQuantity(pid, cartQty + add);
    } else {
      addToCart({
        id: pid,
        name: p.name,
        price,
        productId: isMmtc ? undefined : pid,
        stock,
        imageUrl: p.imageUrl || p.image
      });
      if (add > 1) queueMicrotask(() => updateQuantity(pid, add));
    }
  };

  return (
    <article className="hm2-bcard">
      <div className="hm2-bcard-media">
        <img
          src={p.imageUrl || p.image || productSilver}
          alt={p.name}
          onClick={openDetail}
        />
        <button type="button" className="hm2-bcard-wish" aria-label="Wishlist">
          <img src={wishIcon} alt="" />
        </button>
      </div>
      <h3 onClick={openDetail}>{p.name}</h3>
      <div className="hm2-bcard-price">
        <strong>₹{price.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</strong>
        <span className="mrp">
          M.R.P ₹{Number(mrp).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
        </span>
      </div>
      <div className="hm2-bcard-actions">
        {cartQty > 0 ? (
          <div className="hm2-bcard-stepper">
            <button
              type="button"
              disabled={soldOut}
              onClick={() => (cartQty <= 1 ? removeFromCart(pid) : updateQuantity(pid, cartQty - 1))}
            >
              −
            </button>
            <span>{cartQty}</span>
            <button
              type="button"
              disabled={soldOut || cartFull}
              onClick={() => updateQuantity(pid, cartQty + 1)}
            >
              +
            </button>
          </div>
        ) : (
          <div className="hm2-bcard-stepper">
            <button
              type="button"
              disabled={soldOut || localQty <= 1}
              onClick={() => setLocalQty((q) => clampToStock(q - 1, p))}
            >
              −
            </button>
            <span>{soldOut ? 0 : localQty}</span>
            <button
              type="button"
              disabled={soldOut || localQty >= stock}
              onClick={() => setLocalQty((q) => clampToStock(q + 1, p))}
            >
              +
            </button>
          </div>
        )}
        <button
          type="button"
          className="hm2-bcard-cart"
          onClick={addOne}
          disabled={soldOut || cartFull}
          aria-label="Add to cart"
        >
          <img src={cartIcon} alt="" />
        </button>
        <button
          type="button"
          className="hm2-bcard-buy"
          onClick={buyNow}
          disabled={soldOut || (cartQty > 0 && cartFull)}
        >
          {soldOut ? 'Out of stock' : cartQty > 0 ? `In cart (${cartQty})` : 'Buy Now'}
        </button>
      </div>
      {cartQty > 0 && (
        <Link to="/cart" className="hm2-bcard-proceed">
          Proceed to buy ({cartQty})
        </Link>
      )}
    </article>
  );
};

const Home2Page = () => {
  const { items, addToCart, updateQuantity, removeFromCart } = useCart();
  const [products, setProducts] = useState([]);
  const [prodLoading, setProdLoading] = useState(true);
  const [etfs, setEtfs] = useState({ goldETFs: [], silverETFs: [] });
  const [bullionTab, setBullionTab] = useState(0);
  const [digitalTab, setDigitalTab] = useState(0);
  const [etfTab, setEtfTab] = useState(0);
  const [slide, setSlide] = useState(0);

  const cartQtyById = useMemo(() => {
    const map = new Map();
    for (const item of items) map.set(String(item.id), Number(item.quantity) || 0);
    return map;
  }, [items]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await productService.getAll({ limit: 48, page: 1 });
        if (cancelled) return;
        const list = Array.isArray(res.data) ? res.data : res.data?.products ?? [];
        const goldSilver = list.filter(
          (p) => p.metal === 'gold' || p.metal === 'silver' || p.metal === 'gold+silver'
        );
        setProducts(goldSilver.length ? goldSilver : list);
      } catch (e) {
        console.error(e);
      } finally {
        if (!cancelled) setProdLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const token = localStorage.getItem('zerodha_access_token');
        const res = await zerodhaService.getETFs(token);
        if (cancelled) return;
        if (res.data?.success && res.data?.data) setEtfs(res.data.data);
      } catch (e) {
        console.error(e);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const activeTab = BULLION_TABS[bullionTab] || BULLION_TABS[0];

  const dynamicProducts = useMemo(() => {
    if (!prodLoading && products.length > 0) return products;
    return FALLBACK_PRODUCTS;
  }, [prodLoading, products]);

  const displayProducts = useMemo(() => {
    if (activeTab.source === 'mmtc') return MMTC_HOME_PRODUCTS;
    // In-House, Corporate Gifting, Divine — dynamic gold/silver for now
    return dynamicProducts;
  }, [activeTab, dynamicProducts]);

  const maxSlide = Math.max(0, Math.ceil(displayProducts.length / PAGE_SIZE) - 1);
  const visibleProducts = displayProducts.slice(slide * PAGE_SIZE, slide * PAGE_SIZE + PAGE_SIZE);

  useEffect(() => {
    setSlide(0);
  }, [bullionTab, displayProducts.length]);

  const etfRows = useMemo(() => {
    if (etfTab === 1) return FALLBACK_ETFS.filter((e) => e.name.includes('SPDR'));
    const live = [...(etfs.goldETFs || []), ...(etfs.silverETFs || [])].slice(0, 4);
    if (!live.length) return FALLBACK_ETFS;
    return live.map((etf) => ({
      name: etf.name || etf.tradingsymbol,
      yr: etf.changePercent != null ? `${Number(etf.changePercent).toFixed(2)}%` : '—',
      expense: '—',
      aum: etf.volume != null ? Number(etf.volume).toLocaleString('en-IN') : '—',
      live: true
    }));
  }, [etfs, etfTab]);

  return (
    <div className="hm2">

      <section className="hm2-hero">
        <div className="hm2-container hm2-hero-grid">
          <div className="hm2-hero-copy">
            <p className="hm2-eyebrow">India&apos;s 1st Integrated Precious Metals Ecosystem</p>
            <h1>
              One Platform. Every Way to Own
              <br />
              Gold &amp; Silver
            </h1>
            <p className="hm2-lead">
              Buy Physical Bullion, Invest digitally from ₹10, Trade ETFs, Get Loans &amp; More - All in One Place.
            </p>
            <div className="hm2-cta">
              <Link to="/invest-gold" className="hm2-btn-primary">
                Start Investing <span>🡲</span>
              </Link>
              <Link to="/own-gold" className="hm2-btn-secondary">
                Explore Products
              </Link>
            </div>
            <div className="hm2-trust">
              <div className="hm2-trust-item">
                <img src={trustInsured} alt="" />
                <div>
                  <strong>100% Insured</strong>
                  <span>Doorstep Delivery</span>
                </div>
              </div>
              <div className="hm2-trust-item">
                <img src={trustPurity} alt="" />
                <div>
                  <strong>999.9</strong>
                  <span>Certified Purity</span>
                </div>
              </div>
              <div className="hm2-trust-item">
                <img src={trustNse} alt="" />
                <div>
                  <strong>NSE IX</strong>
                  <span>Trusted Partner</span>
                </div>
              </div>
              <div className="hm2-trust-item">
                <img src={trustSecure} alt="" />
                <div>
                  <strong>Secure </strong>
                  <span>&amp; Transparent</span>
                </div>
              </div>
            </div>
          </div>
          <div className="hm2-hero-visual">
            <img src={heroVisual} alt="Gold & Silver bars with live trading app" />
          </div>
        </div>
      </section>

      <section className="hm2-cats">
        <div className="hm2-container">
          <div className="hm2-cats-row">
            {CATS.map((c) => (
              <Link key={c.title} to={c.to} className="hm2-cat">
                <img src={c.img} alt="" />
                <div>
                  <h3>{c.title}</h3>
                  <p>{c.sub}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="hm2-products">
        <div className="hm2-container hm2-products-grid">
          <div className="hm2-bullion">
            <div className="hm2-sec-head">
              <h2>PHYSICAL BULLION &amp; GIFTING</h2>
              <Link to={activeTab.viewAll}>View all →</Link>
            </div>
            <div className="hm2-tabs">
              {BULLION_TABS.map((t, i) => (
                <button
                  key={t.id}
                  type="button"
                  className={bullionTab === i ? 'on' : ''}
                  onClick={() => setBullionTab(i)}
                >
                  {t.label}
                </button>
              ))}
            </div>

            <div className="hm2-carousel">
              {maxSlide > 0 && (
                <button
                  type="button"
                  className="hm2-carousel-btn prev"
                  aria-label="Previous"
                  disabled={slide === 0}
                  onClick={() => setSlide((s) => Math.max(0, s - 1))}
                >
                  ‹
                </button>
              )}
              <div className="hm2-prod-grid">
                {prodLoading && activeTab.source === 'dynamic' ? (
                  <div className="hm2-loading">Loading products...</div>
                ) : visibleProducts.length === 0 ? (
                  <div className="hm2-loading">No products in this collection yet.</div>
                ) : (
                  visibleProducts.map((p) => (
                    <BullionCard
                      key={String(p._id || p.id)}
                      p={p}
                      cartQtyById={cartQtyById}
                      addToCart={addToCart}
                      updateQuantity={updateQuantity}
                      removeFromCart={removeFromCart}
                    />
                  ))
                )}
              </div>
              {maxSlide > 0 && (
                <button
                  type="button"
                  className="hm2-carousel-btn next"
                  aria-label="Next"
                  disabled={slide >= maxSlide}
                  onClick={() => setSlide((s) => Math.min(maxSlide, s + 1))}
                >
                  ›
                </button>
              )}
            </div>
            {maxSlide > 0 && (
              <div className="hm2-carousel-dots">
                {Array.from({ length: maxSlide + 1 }).map((_, i) => (
                  <button
                    key={i}
                    type="button"
                    className={slide === i ? 'on' : ''}
                    aria-label={`Slide ${i + 1}`}
                    onClick={() => setSlide(i)}
                  />
                ))}
              </div>
            )}

            <div className="hm2-corp-row hm2-corp-inline">
              <div className="hm2-corp-top">
                <p className="hm2-corp-eyebrow">B2B Solutions</p>
                <h3>Corporate &amp; Bulk Bullion Solutions</h3>
              </div>
              <div className="hm2-corp-feats">
                <span>
                  <span className="hm2-corp-icon">
                    <img src={iconCorpMgr} alt="" />
                  </span>
                  Dedicated Account Manager
                </span>
                <span>
                  <span className="hm2-corp-icon">
                    <img src={iconCorpMint} alt="" />
                  </span>
                  Custom Brand Minting &amp; Packaging
                </span>
                <span>
                  <span className="hm2-corp-icon hm2-corp-icon--svg" aria-hidden="true">
                    <svg viewBox="0 0 24 24" width="18" height="18" fill="none">
                      <ellipse cx="12" cy="7" rx="7" ry="2.6" stroke="#c98512" strokeWidth="1.6" />
                      <path
                        d="M5 7v3.2c0 1.4 3.1 2.6 7 2.6s7-1.2 7-2.6V7"
                        stroke="#c98512"
                        strokeWidth="1.6"
                      />
                      <path
                        d="M5 10.2V13.4c0 1.4 3.1 2.6 7 2.6s7-1.2 7-2.6V10.2"
                        stroke="#ec7a11"
                        strokeWidth="1.6"
                      />
                      <path
                        d="M5 13.4V16.6c0 1.4 3.1 2.6 7 2.6s7-1.2 7-2.6v-3.2"
                        stroke="#d4a017"
                        strokeWidth="1.6"
                      />
                    </svg>
                  </span>
                  Bulk Pricing Available
                </span>
              </div>
              <div className="hm2-corp-btns">
                <Link to="/own-gifting" className="hm2-btn-orange">
                  Request Corporate Catalog →
                </Link>
                <Link to="/contact-support" className="hm2-btn-orange-outline">
                  Contact B2B Team
                </Link>
              </div>
            </div>
          </div>

          <aside className="hm2-digital">
            <div className="hm2-digital-head">
              <h2>DIGITAL GOLD AND SILVER</h2>
              <p>Start from just ₹10</p>
            </div>
            <div className="hm2-tabs hm2-tabs-teal">
              {DIGITAL_TABS.map((t, i) => (
                <button
                  key={t}
                  type="button"
                  className={digitalTab === i ? 'on' : ''}
                  onClick={() => setDigitalTab(i)}
                >
                  {t}
                </button>
              ))}
            </div>
            <div className="hm2-dtable">
              <div className="hm2-dth">
                <span>Mode</span>
                <span>Min. Amount</span>
                <span>Best for</span>
                <span>Action</span>
              </div>
              {DIGITAL_MODES.map((m) => (
                <div key={m.mode} className="hm2-dtr">
                  <span>{m.mode}</span>
                  <span>{m.min}</span>
                  <span className="best">{m.best}</span>
                  <Link to={m.to}>{m.action}</Link>
                </div>
              ))}
            </div>
            <div className="hm2-dfeats">
              <div>
                <img src={iconFeatPurity} alt="" />
                <p>24k &amp; 999 Purity</p>
              </div>
              <div>
                <img src={iconFeatVault} alt="" />
                <p>100% Vault Backend</p>
              </div>
              <div>
                <img src={iconFeatStorage} alt="" />
                <p>Zero Storage Hassle</p>
              </div>
              <div>
                <img src={iconFeatLive} alt="" />
                <p>Live market Pricing</p>
              </div>
            </div>
          </aside>
        </div>
      </section>

      <section className="hm2-services">
        <div className="hm2-container hm2-services-grid">
          <div className="hm2-panel hm2-etf">
            <div className="hm2-sec-head">
              <div>
                <h2 className="hm2-etf-title">Gold &amp; Silver ETFs</h2>
                <p>Trade on NSE IX &amp; Zerodha</p>
              </div>
              <Link to="/zerodha-integration">View All →</Link>
            </div>
            <div className="hm2-tabs hm2-tabs-navy">
              {['Domestic ETFs', 'International ETFs (Via NSE IX)'].map((t, i) => (
                <button key={t} type="button" className={etfTab === i ? 'on' : ''} onClick={() => setEtfTab(i)}>
                  {t}
                </button>
              ))}
            </div>
            <div className="hm2-etable">
              <div className="hm2-eth">
                <span>Fund/ Ticker</span>
                <span>{etfRows[0]?.live ? 'Change %' : '1Y Return (%)'}</span>
                <span>{etfRows[0]?.live ? '—' : 'Expense Ratio'}</span>
                <span>{etfRows[0]?.live ? 'Volume' : 'AUM (₹Cr)'}</span>
                <span>Action</span>
              </div>
              {etfRows.map((e) => (
                <div key={e.name} className="hm2-etr">
                  <span className="name">{e.name}</span>
                  <span>{e.yr}</span>
                  <span>{e.expense}</span>
                  <span>{e.aum}</span>
                  <Link to="/zerodha-integration">Trade Now</Link>
                </div>
              ))}
            </div>
          </div>

          <div className="hm2-panel hm2-loan">
            <h2>Gold loans</h2>
            <p>Unlock your value from your gold in just 3 simple steps.</p>
            <div className="hm2-loan-body">
              <ul>
                <li>
                  <img src={iconLoan1} alt="" /> Up to 75% of gold value
                </li>
                <li>
                  <img src={iconLoan2} alt="" /> Lowest Interest rates
                </li>
                <li>
                  <img src={iconLoan3} alt="" /> Quick Approval &amp; Disbursal
                </li>
              </ul>
              <img src={catLoan} alt="Gold loans" className="hm2-loan-hero" />
            </div>
            <Link to="/digital-gold" className="hm2-btn-orange">
              Check Loan Eligibility →
            </Link>
          </div>

          <div className="hm2-panel hm2-buyback">
            <h2>Gold Buyback</h2>
            <p>Best prices. Instant payment.</p>
            <ol>
              <li>
                <img src={iconBb1} alt="" /> Request Pickup
              </li>
              <li>
                <img src={iconBb2} alt="" /> Purity Check
              </li>
              <li>
                <img src={iconBb3} alt="" /> Value Confirmation
              </li>
              <li>
                <img src={iconBb4} alt="" /> Payment to Bank
              </li>
            </ol>
            <Link to="/buy-back" className="hm2-btn-orange">
              Get Best Buyback price →
            </Link>
          </div>
        </div>
      </section>

      <section className="hm2-partners-wrap">
        <div className="hm2-container">
          <div className="hm2-partners-panel">
            <h2>Our Trusted Partners</h2>
            <div className="hm2-partners-groups">
              {PARTNER_GROUPS.map((group) => (
                <div key={group.title} className="hm2-partner-group">
                  <h3>{group.title}</h3>
                  <div className="hm2-partner-row">
                    {group.items.map((p) => (
                      <div key={p.name} className="hm2-partner">
                        <img src={p.img} alt={p.name} />
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="hm2-know">
        <div className="hm2-container">
          <div className="hm2-know-panel">
            <h2>KNOWLEDGE HUB - LEARN , INVEST, GROW.</h2>
            <div className="hm2-know-grid">
              {KNOWLEDGE.map((k) => (
                <Link key={k.title} to={k.to} className="hm2-know-card">
                  <div className="hm2-know-img">
                    <img src={k.img} alt={k.title} />
                  </div>
                  <div className="hm2-know-body">
                    <h4>{k.title}</h4>
                    <p>{k.desc}</p>
                    <span className="hm2-know-arrow">→</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home2Page;
