import { useEffect, useMemo, useState } from 'react';
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom';
import { useCart } from '../state/CartContext';
import { useToast } from '../state/ToastContext';
import cartIcon from '../assets/homepageMain/image 567.png';
import { getMmtcProductById, getSimilarMmtcProducts } from '../data/mmtcProducts';
import './PageShell.css';
import './OwnMmtcPampProductPage.css';

const formatInr = (n) =>
  Number(n).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const deliveryByLabel = () => {
  const d = new Date();
  d.setDate(d.getDate() + 4);
  return d.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' });
};

const PinIcon = () => (
  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" aria-hidden="true">
    <path
      d="M12 21s7-6.2 7-11.2A7 7 0 1 0 5 9.8C5 14.8 12 21 12 21z"
      stroke="currentColor"
      strokeWidth="1.6"
    />
    <circle cx="12" cy="9.5" r="2.2" stroke="currentColor" strokeWidth="1.6" />
  </svg>
);

const OwnMmtcPampProductPage = () => {
  const { productId } = useParams();
  const navigate = useNavigate();
  const { addToCart, items } = useCart();
  const { showToast } = useToast();

  const product = useMemo(() => getMmtcProductById(productId), [productId]);
  const similar = useMemo(() => getSimilarMmtcProducts(product, 3), [product]);

  const [activeImg, setActiveImg] = useState(0);
  const [weight, setWeight] = useState(0);
  const [pincode, setPincode] = useState('');
  const [deliveryLabel, setDeliveryLabel] = useState(deliveryByLabel());
  const [tab, setTab] = useState('description');

  useEffect(() => {
    if (!product) return;
    setActiveImg(0);
    setWeight(product.weightGrams);
    setPincode('');
    setDeliveryLabel(deliveryByLabel());
    setTab('description');
  }, [product]);

  if (!product) {
    return <Navigate to="/own-mmtc-pamp" replace />;
  }

  const gallery = product.gallery?.length ? product.gallery : [product.imageUrl];
  const mainImg = gallery[Math.min(activeImg, gallery.length - 1)];
  const weights = product.weightOptions?.length ? product.weightOptions : [product.weightGrams];

  const handleAdd = () => {
    const already = items.find((item) => item.id === product.id);
    if (already) {
      showToast('Only 1 quantity is allowed for this product', 'error');
      return;
    }
    addToCart({
      id: product.id,
      name: product.displayName || product.name,
      price: product.price,
      imageUrl: product.imageUrl,
      metal: product.metal,
      stock: 1
    });
    showToast(`${product.name} added to cart`, 'success');
  };

  const checkDelivery = (e) => {
    e.preventDefault();
    const pin = String(pincode).trim();
    if (!/^\d{6}$/.test(pin)) {
      showToast('Enter a valid 6-digit pincode', 'error');
      return;
    }
    setDeliveryLabel(deliveryByLabel());
    showToast(`Delivery available for ${pin}`, 'success');
  };

  const specs = [
    { label: 'SKU', value: product.sku },
    { label: 'Dimension', value: product.dimension },
    { label: 'Net Weight (g)', value: product.weightGrams },
    { label: 'Purity', value: product.purity },
    { label: 'Shape', value: product.shape },
    { label: 'Metal', value: product.metal === 'gold' ? 'Gold' : 'Silver' },
    { label: 'Denomination(g)', value: product.denomination },
    { label: 'Country Of Origin', value: product.countryOfOrigin },
    { label: 'Importer', value: product.importer }
  ];

  return (
    <div className="gs-page mmtc-pd-page">
      <section className="gs-section mmtc-pd" aria-label="Product details">
        <div className="mmtc-pd-top">
          <div className="mmtc-pd-gallery">
            <div className="mmtc-pd-main-img">
              <img src={mainImg} alt={product.displayName || product.name} />
            </div>
            <div className="mmtc-pd-thumbs" role="list">
              <button
                type="button"
                className="mmtc-pd-thumb-nav"
                aria-label="Previous image"
                onClick={() => setActiveImg((i) => (i - 1 + gallery.length) % gallery.length)}
              >
                ‹
              </button>
              {gallery.map((src, idx) => (
                <button
                  key={`${product.id}-thumb-${idx}`}
                  type="button"
                  className={`mmtc-pd-thumb${idx === activeImg ? ' is-active' : ''}`}
                  onClick={() => setActiveImg(idx)}
                  aria-label={`View image ${idx + 1}`}
                >
                  <img src={src} alt="" />
                </button>
              ))}
              <button
                type="button"
                className="mmtc-pd-thumb-nav"
                aria-label="Next image"
                onClick={() => setActiveImg((i) => (i + 1) % gallery.length)}
              >
                ›
              </button>
            </div>
          </div>

          <div className="mmtc-pd-info">
            <h1>{product.displayName || product.name}</h1>
            <p className="mmtc-pd-price">₹{formatInr(product.price)}</p>
            <p className="mmtc-pd-tax">Inclusive of all taxes</p>
            <p className="mmtc-pd-mrp">
              M.R.P. <s>₹{formatInr(product.mrp || product.price * 1.15)}</s>
            </p>

            <div className="mmtc-pd-buy-row">
              <div className="mmtc-pd-qty" aria-label="Quantity">
                <button type="button" aria-label="Decrease" disabled>
                  −
                </button>
                <span>1</span>
                <button type="button" aria-label="Increase" disabled>
                  +
                </button>
              </div>
              <button type="button" className="mmtc-pd-add" onClick={handleAdd}>
                <img src={cartIcon} alt="" />
                Add to cart
              </button>
            </div>

            <div className="mmtc-pd-weight">
              <p>Select weight (g)</p>
              <div className="mmtc-pd-weight-opts">
                {weights.map((w) => (
                  <button
                    key={w}
                    type="button"
                    className={Number(weight) === Number(w) ? 'is-active' : undefined}
                    onClick={() => setWeight(w)}
                  >
                    {w}g
                  </button>
                ))}
              </div>
            </div>

            <div className="mmtc-pd-delivery">
              <p className="mmtc-pd-delivery-title">Check Delivery status</p>
              <form className="mmtc-pd-delivery-form" onSubmit={checkDelivery}>
                <span className="mmtc-pd-pin-ico">
                  <PinIcon />
                </span>
                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  placeholder="Enter pincode"
                  value={pincode}
                  onChange={(e) => setPincode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  aria-label="Pincode"
                />
                <button type="submit">Check</button>
              </form>
              <p className="mmtc-pd-delivery-by">Delivery By {deliveryLabel}</p>
            </div>
          </div>
        </div>

        <div className="mmtc-pd-specs" role="table" aria-label="Product specifications">
          {specs.map((row) => (
            <div key={row.label} className="mmtc-pd-spec" role="row">
              <span role="rowheader">{row.label}</span>
              <strong role="cell">{row.value}</strong>
            </div>
          ))}
        </div>

        <div className="mmtc-pd-tabs">
          <div className="mmtc-pd-tablist" role="tablist">
            <button
              type="button"
              role="tab"
              aria-selected={tab === 'description'}
              className={tab === 'description' ? 'is-active' : undefined}
              onClick={() => setTab('description')}
            >
              Product Description
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={tab === 'seller'}
              className={tab === 'seller' ? 'is-active' : undefined}
              onClick={() => setTab('seller')}
            >
              Seller Details
            </button>
          </div>
          <div className="mmtc-pd-tabpanel" role="tabpanel">
            {tab === 'description' ? (
              <p>{product.description}</p>
            ) : (
              <p>
                Sold by GoldnSilver.shop in partnership with MMTC-PAMP. Support:{' '}
                support@goldnsilver.shop · Hyderabad, India. Products ship in tamper-evident packaging
                with insured delivery.
              </p>
            )}
          </div>
        </div>

        <div className="mmtc-pd-similar">
          <div className="mmtc-pd-similar-head">
            <h2>Similar Products</h2>
            <button type="button" className="mmtc-pd-view-all" onClick={() => navigate('/own-mmtc-pamp')}>
              View All
            </button>
          </div>
          <div className="mmtc-pd-similar-grid">
            {similar.map((p) => (
              <Link key={p.id} to={`/own-mmtc-pamp/${p.id}`} className="mmtc-pd-similar-card">
                <div className="mmtc-pd-similar-media">
                  <img src={p.imageUrl} alt={p.name} />
                </div>
                <h3>{p.displayName || p.name}</h3>
                <p className="mmtc-pd-similar-price">
                  <strong>₹{formatInr(p.price)}</strong>
                  <s>M.R.P ₹{formatInr(p.mrp || p.price * 1.15)}</s>
                </p>
              </Link>
            ))}
          </div>
        </div>
      </section>

    </div>
  );
};

export default OwnMmtcPampProductPage;
