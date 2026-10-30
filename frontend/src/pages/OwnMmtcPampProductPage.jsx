import { useEffect, useMemo, useState } from 'react';
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom';
import { useCart } from '../state/CartContext';
import { useToast } from '../state/ToastContext';
import cartIcon from '../assets/homepageMain/image 567.png';
import { productService } from '../services/api';
import { mmtcView } from '../utils/mmtcCatalog';
import { atStockLimit, isInStock, productStock } from '../utils/stock';
import './PageShell.css';
import './OwnMmtcPampProductPage.css';

const formatInr = (n) =>
  Number(n).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

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
  const { addToCart, updateQuantity, removeFromCart, items } = useCart();
  const { showToast } = useToast();

  const [product, setProduct] = useState(null);
  const [similar, setSimilar] = useState([]);
  const [loading, setLoading] = useState(true);
  const [missing, setMissing] = useState(false);

  const [activeImg, setActiveImg] = useState(0);
  const [weight, setWeight] = useState(0);
  const [pincode, setPincode] = useState('');
  const [tab, setTab] = useState('description');

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setMissing(false);
      try {
        const { data } = await productService.getBySlug(productId);
        if (cancelled) return;
        if (!data || data.catalog !== 'mmtc-pamp') {
          setMissing(true);
          setProduct(null);
          return;
        }
        const view = mmtcView(data);
        setProduct(view);
        const listRes = await productService.getAll({ catalog: 'mmtc-pamp', limit: 100, page: 1 });
        if (cancelled) return;
        const list = Array.isArray(listRes.data) ? listRes.data : listRes.data?.products ?? [];
        setSimilar(
          list
            .filter((p) => p.catalog === 'mmtc-pamp' && p.slug !== view.slug && p.metal === view.metal)
            .slice(0, 3)
            .map(mmtcView)
        );
      } catch {
        if (!cancelled) {
          setMissing(true);
          setProduct(null);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [productId]);

  useEffect(() => {
    if (!product) return;
    setActiveImg(0);
    setWeight(product.weightGrams);
    setPincode('');
    setTab('description');
  }, [product]);

  const cartQty = useMemo(() => {
    if (!product?._id) return 0;
    const hit = items.find((item) => String(item.id) === String(product._id));
    return Number(hit?.quantity) || 0;
  }, [items, product]);

  if (loading) {
    return (
      <div className="gs-page mmtc-pd-page">
        <p className="mmtc-empty">Loading product…</p>
      </div>
    );
  }

  if (missing || !product) {
    return <Navigate to="/own-mmtc-pamp" replace />;
  }

  const gallery = product.gallery?.length ? product.gallery : [product.imageUrl];
  const mainImg = gallery[Math.min(activeImg, gallery.length - 1)];
  const weights = product.weightOptions?.length ? product.weightOptions : [product.weightGrams];

  const handleAdd = () => {
    const pid = String(product._id);
    if (!isInStock(product)) {
      showToast('This product is out of stock', 'error');
      return;
    }
    if (atStockLimit(product, cartQty)) {
      showToast('No more stock available for this product', 'error');
      return;
    }
    if (cartQty < 1) {
      addToCart({
        id: pid,
        productId: pid,
        name: product.displayName || product.name,
        price: product.price,
        imageUrl: product.imageUrl,
        metal: product.metal,
        type: product.type,
        catalog: 'mmtc',
        metalGrams: product.weightGrams,
        stock: productStock(product)
      });
    } else {
      updateQuantity(pid, cartQty + 1);
    }
    showToast(`${product.name} added to cart`, 'success');
  };

  const changeQty = (next) => {
    const pid = String(product._id);
    const stock = productStock(product);
    const qty = Math.max(0, Math.min(stock, Number(next) || 0));
    if (qty < 1) {
      if (cartQty > 0) removeFromCart(pid);
      return;
    }
    if (cartQty < 1) {
      addToCart({
        id: pid,
        productId: pid,
        name: product.displayName || product.name,
        price: product.price,
        imageUrl: product.imageUrl,
        metal: product.metal,
        type: product.type,
        catalog: 'mmtc',
        metalGrams: product.weightGrams,
        stock
      });
      if (qty > 1) queueMicrotask(() => updateQuantity(pid, qty));
      return;
    }
    updateQuantity(pid, qty);
  };

  const checkDelivery = (e) => {
    e.preventDefault();
    const pin = String(pincode).trim();
    if (!/^\d{6}$/.test(pin)) {
      showToast('Enter a valid 6-digit pincode', 'error');
      return;
    }
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

            <div className="mmtc-pd-buy-row">
              <div className="mmtc-pd-qty" aria-label="Quantity">
                <button type="button" aria-label="Decrease" disabled={cartQty < 1} onClick={() => changeQty(cartQty - 1)}>
                  −
                </button>
                <span>{cartQty}</span>
                <button
                  type="button"
                  aria-label="Increase"
                  disabled={!isInStock(product) || atStockLimit(product, cartQty)}
                  onClick={() => changeQty(cartQty + 1)}
                >
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
              <Link key={p.slug || p._id} to={`/own-mmtc-pamp/${p.slug || p.id}`} className="mmtc-pd-similar-card">
                <div className="mmtc-pd-similar-media">
                  <img src={p.imageUrl} alt={p.name} />
                </div>
                <h3>{p.displayName || p.name}</h3>
                <p className="mmtc-pd-similar-price">
                  <strong>₹{formatInr(p.price)}</strong>
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
