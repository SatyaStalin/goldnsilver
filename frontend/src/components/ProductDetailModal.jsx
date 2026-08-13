import { createPortal } from 'react-dom';
import { useEffect, useRef, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../state/CartContext';

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

export default function ProductDetailModal({ product, onClose }) {
  const { items, addToCart, updateQuantity, removeFromCart } = useCart();
  const closeBtnRef = useRef(null);
  const pid = product ? String(product._id || product.id) : '';

  const qty = useMemo(() => {
    if (!pid) return 0;
    const item = items.find((i) => String(i.id) === pid);
    return item ? Number(item.quantity) || 0 : 0;
  }, [items, pid]);

  useEffect(() => {
    if (!product) return undefined;
    const onKey = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [product, onClose]);

  useEffect(() => {
    if (product) {
      closeBtnRef.current?.focus();
    }
  }, [product]);

  if (!product) return null;

  const mainImg = product.imageUrl || product.image;
  const price = Number(product.pricePerUnit ?? product.price ?? 0);
  const typeLabel = TYPE_LABELS[product.type] || product.type || '—';
  const titleId = 'product-detail-modal-title';

  const handleAddToCart = () => {
    addToCart({
      id: pid,
      name: product.name,
      price: product.pricePerUnit || product.price,
      productId: pid,
      stock: product.stock,
      imageUrl: product.imageUrl
    });
  };

  return createPortal(
    <div
      className="product-detail-modal-backdrop"
      onClick={onClose}
      role="presentation"
    >
      <div
        className="product-detail-modal-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        onClick={(e) => e.stopPropagation()}
      >
        <header className="product-detail-modal-header">
          <h2 id={titleId} className="product-detail-modal-title">
            {product.name}
          </h2>
          <button
            ref={closeBtnRef}
            type="button"
            className="product-detail-modal-close"
            onClick={onClose}
            aria-label="Close product details"
          >
            ×
          </button>
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
              {product.category && (
                <span className="product-detail-modal-pill">{product.category}</span>
              )}
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
                    {product.metalGrams} {product.unit || 'gram'}
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
              <dd>{product.stock > 0 ? `${product.stock} available` : 'Out of stock'}</dd>
            </dl>

            <div className="product-detail-modal-desc">
              <h3 className="product-detail-modal-desc-title">About this product</h3>
              <p>{product.description?.trim() || 'Full description will appear here when added in admin.'}</p>
            </div>
          </div>
        </div>

        <footer className="product-detail-modal-footer">
          {product.stock > 0 ? (
            qty > 0 ? (
              <div className="product-detail-modal-cart-block">
                <div className="product-detail-modal-cart-row">
                  <div className="home-qty-stepper" aria-label="Quantity controls">
                    <button
                      type="button"
                      className="home-qty-btn"
                      onClick={() => {
                        if (qty <= 1) removeFromCart(pid);
                        else updateQuantity(pid, qty - 1);
                      }}
                      aria-label="Decrease quantity"
                    >
                      −
                    </button>
                    <span className="home-qty-value" aria-label="Quantity">
                      {qty}
                    </span>
                    <button
                      type="button"
                      className="home-qty-btn"
                      onClick={() => {
                        if (product.stock && qty >= product.stock) return;
                        updateQuantity(pid, qty + 1);
                      }}
                      disabled={product.stock && qty >= product.stock}
                      aria-label="Increase quantity"
                    >
                      +
                    </button>
                  </div>
                </div>
                <Link
                  to="/cart"
                  className="home-go-cart-btn product-detail-modal-proceed"
                  aria-label="Go to cart"
                  onClick={onClose}
                >
                  Proceed to buy ({qty})
                </Link>
              </div>
            ) : (
              <button type="button" className="btn-primary product-detail-modal-add-full" onClick={handleAddToCart}>
                Add to Cart
              </button>
            )
          ) : (
            <button
              type="button"
              className="btn-primary product-detail-modal-add-full"
              disabled
              style={{ opacity: 0.5, cursor: 'not-allowed' }}
            >
              Out of Stock
            </button>
          )}
        </footer>
      </div>
    </div>,
    document.body
  );
}
