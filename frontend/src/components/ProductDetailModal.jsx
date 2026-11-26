import { createPortal } from 'react-dom';
import { useEffect, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../state/CartContext';
import { atStockLimit, isInStock, productStock } from '../utils/stock';
import useRequirePurchaseLogin from '../utils/requirePurchaseLogin';
import { formatProductWeight } from '../utils/productWeight';
import { isMmtcCatalog } from '../utils/mmtcCatalog';
import { ownProductPath } from '../utils/ownProductPath';

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

function metalLabel(metal) {
  if (metal === 'gold+silver') return 'Gold + Silver';
  if (metal === 'silver') return 'Silver';
  if (metal === 'gold') return 'Gold';
  return metal || '—';
}

export default function ProductDetailModal({ product, onClose, page = false }) {
  const { items, addToCart, updateQuantity, removeFromCart } = useCart();
  const canPurchase = useRequirePurchaseLogin();
  const navigate = useNavigate();
  const closeBtnRef = useRef(null);
  const pid = product ? String(product._id || product.id) : '';

  const qty = useMemo(() => {
    if (!pid) return 0;
    const item = items.find((i) => String(i.id) === pid);
    return item ? Number(item.quantity) || 0 : 0;
  }, [items, pid]);

  useEffect(() => {
    if (!product || page || !onClose) return undefined;
    const onKey = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [product, onClose, page]);

  useEffect(() => {
    if (product) {
      closeBtnRef.current?.focus();
    }
  }, [product]);

  if (!product) return null;

  const mainImg = product.imageUrl || product.image;
  const price = Number(product.pricePerUnit ?? product.price ?? 0);
  const stock = productStock(product);
  const inStock = isInStock(product);
  const cartFull = atStockLimit(product, qty);
  const typeLabel = TYPE_LABELS[product.type] || product.type || '—';
  const titleId = 'product-detail-modal-title';

  const handleAddToCart = () => {
    if (!inStock || cartFull) return;
    if (!canPurchase()) return;
    addToCart({
      id: pid,
      name: product.name,
      price: product.pricePerUnit || product.price,
      productId: pid,
      stock,
      imageUrl: product.imageUrl,
      metal: product.metal,
      type: product.type,
      catalog: product.catalog === 'mmtc-pamp' || product.catalog === 'mmtc' ? 'mmtc' : 'own',
      metalGrams: product.metalGrams
    });
  };

  const handleBuyNow = () => {
    if (!inStock) return;
    if (!canPurchase()) return;
    if (qty < 1 && !cartFull) handleAddToCart();
    if (!page && onClose) onClose();
    navigate('/cart');
  };

  const handleViewDetails = () => {
    const path =
      isMmtcCatalog(product) || product.catalog === 'mmtc'
        ? `/own-mmtc-pamp/${product.slug || product._id || product.id}`
        : ownProductPath(product);
    if (!page && onClose) onClose();
    navigate(path);
  };

  if (page) {
    const priceLabel = price.toLocaleString('en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
    const specs = [
      { label: 'Metal', value: metalLabel(product.metal) },
      { label: 'Type', value: typeLabel },
      Number(product.metalGrams) > 0
        ? {
            label: 'Weight',
            value: `${formatProductWeight(product)}${
              product.pricingMode === 'rate_based' ? ' (used for live rate pricing)' : ''
            }`
          }
        : null,
      product.pricingMode
        ? {
            label: 'Pricing',
            value: product.pricingMode === 'fixed' ? 'Fixed catalogue price' : 'Live rate based'
          }
        : null,
      product.slug ? { label: 'SKU / slug', value: product.slug } : null,
      { label: 'Stock', value: inStock ? `${stock} available` : 'Out of stock' }
    ].filter(Boolean);

    return (
      <>
        <div className="mmtc-pd-top">
          <div className="mmtc-pd-gallery">
            <div className="mmtc-pd-main-img">
              {mainImg ? (
                <img src={mainImg} alt={product.name} />
              ) : (
                <div className="own-pd-noimg">No image</div>
              )}
            </div>
          </div>

          <div className="mmtc-pd-info">
            <h1 id={titleId}>{product.displayName || product.name}</h1>
            <p className="mmtc-pd-price">₹{priceLabel}</p>
            {product.pricingMode === 'fixed' && <p className="mmtc-pd-tax">Fixed catalogue price</p>}

            <div className="mmtc-pd-buy-row">
              {inStock && qty > 0 && (
                <div className="mmtc-pd-qty" aria-label="Quantity">
                  <button
                    type="button"
                    aria-label="Decrease quantity"
                    onClick={() => {
                      if (qty <= 1) removeFromCart(pid);
                      else updateQuantity(pid, qty - 1);
                    }}
                  >
                    −
                  </button>
                  <span>{qty}</span>
                  <button
                    type="button"
                    aria-label="Increase quantity"
                    disabled={cartFull}
                    onClick={() => {
                      if (cartFull) return;
                      if (!canPurchase()) return;
                      updateQuantity(pid, qty + 1);
                    }}
                  >
                    +
                  </button>
                </div>
              )}
              {inStock && qty < 1 && (
                <button type="button" className="mmtc-pd-add own-pd-add-secondary" onClick={handleAddToCart}>
                  Add to Cart
                </button>
              )}
              {inStock ? (
                <button type="button" className="mmtc-pd-add" onClick={handleBuyNow}>
                  Buy Now
                </button>
              ) : (
                <button type="button" className="mmtc-pd-add" disabled>
                  Out of Stock
                </button>
              )}
            </div>

            {Number(product.metalGrams) > 0 && (
              <div className="mmtc-pd-weight">
                <p>Weight</p>
                <div className="mmtc-pd-weight-opts">
                  <span className="own-pd-weight-chip">{formatProductWeight(product)}</span>
                </div>
              </div>
            )}
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
          <h2 className="own-pd-desc-title">Product Description</h2>
          <div className="mmtc-pd-tabpanel">
            <p>{product.description?.trim() || 'Full description will appear here when added in admin.'}</p>
          </div>
        </div>
      </>
    );
  }

  const dialog = (
      <div
        className="product-detail-modal-dialog"
        role={page ? 'article' : 'dialog'}
        aria-modal={page ? undefined : 'true'}
        aria-labelledby={titleId}
        onClick={(e) => e.stopPropagation()}
      >
        <header className="product-detail-modal-header">
          <h2 id={titleId} className="product-detail-modal-title">
            {product.displayName || product.name}
          </h2>
          {!page && onClose && (
          <button
            ref={closeBtnRef}
            type="button"
            className="product-detail-modal-close"
            onClick={onClose}
            aria-label="Close product details"
          >
            ×
          </button>
          )}
        </header>

        <div className="product-detail-modal-body">
          <div className="product-detail-modal-col product-detail-modal-col--main">
            <div className="product-detail-modal-hero-img">
              {mainImg ? (
                <img src={mainImg} alt={product.name} />
              ) : (
                <div className="product-detail-modal-no-img">No image</div>
              )}
            </div>

            <div className="product-detail-modal-meta">
              <span className="product-detail-modal-pill product-detail-modal-pill--metal">
                {metalLabel(product.metal)}
              </span>
              {/* {product.category && (
                <span className="product-detail-modal-pill">{product.category}</span>
              )} */}
              <span className="product-detail-modal-pill">{typeLabel}</span>
            </div>

            <p className="product-detail-modal-price">
              ₹
              {price.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
              {product.pricingMode === 'fixed' && (
                <span className="product-detail-modal-price-note"> · Fixed catalogue price</span>
              )}
            </p>

            <dl className="product-detail-modal-specs">
              {product.metalGrams != null && Number(product.metalGrams) > 0 && (
                <>
                  <dt>Metal weight</dt>
                  <dd>
                    {formatProductWeight(product)}
                    {product.pricingMode === 'rate_based' && (
                      <span className="muted"> (used for live rate pricing)</span>
                    )}
                  </dd>
                </>
              )}
              {product.pricingMode && (
                <>
                  <dt>Pricing</dt>
                  <dd>{product.pricingMode === 'fixed' ? 'Fixed catalogue price' : 'Live rate based'}</dd>
                </>
              )}
              {product.slug && (
                <>
                  <dt>SKU / slug</dt>
                  <dd>{product.slug}</dd>
                </>
              )}
              <dt>Stock</dt>
              <dd>{inStock ? `${stock} available` : 'Out of stock'}</dd>
            </dl>

            <div className="product-detail-modal-desc">
              <h3 className="product-detail-modal-desc-title">About this product</h3>
              <p>{product.description?.trim() || 'Full description will appear here when added in admin.'}</p>
            </div>
          </div>
        </div>

        <footer className="product-detail-modal-footer">
          <div className="product-detail-modal-actions">
            <button
              type="button"
              className="product-detail-modal-action product-detail-modal-action--add"
              onClick={handleAddToCart}
              disabled={!inStock || cartFull}
            >
              Add to Cart
            </button>
            <button
              type="button"
              className="product-detail-modal-action product-detail-modal-action--buy"
              onClick={handleBuyNow}
              disabled={!inStock}
            >
              Buy Now
            </button>
            <button
              type="button"
              className="product-detail-modal-action product-detail-modal-action--view"
              onClick={handleViewDetails}
            >
              View Details
            </button>
          </div>
        </footer>
      </div>
  );

  if (page) return dialog;

  return createPortal(
    <div className="product-detail-modal-backdrop" onClick={onClose} role="presentation">
      {dialog}
    </div>,
    document.body
  );
}
