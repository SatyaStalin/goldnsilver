import { Link } from 'react-router-dom';
import { useProductDetailModal } from '../state/ProductDetailModalContext';
import { atStockLimit, isInStock, productStock } from '../utils/stock';

/**
 * Cart-enabled product card (same UX as Featured Products on home).
 * Optional metal line for catalogue pages (gold / silver / gold+silver).
 * Card click (outside links/buttons) opens product detail modal.
 */
export default function ShopProductCard({
  p,
  cartQtyById,
  addToCart,
  updateQuantity,
  removeFromCart,
  showMetalLabel = false,
  showViewProductButton = false
}) {
  const { openProductDetail } = useProductDetailModal();
  const pid = String(p._id || p.id);
  const qty = cartQtyById.get(pid) || 0;
  const stock = productStock(p);
  const inStock = isInStock(p);
  const cartFull = atStockLimit(p, qty);
  const metalLabel =
    p.metal === 'gold+silver'
      ? 'Gold + Silver'
      : p.metal === 'silver'
        ? 'Silver'
        : p.metal === 'gold'
          ? 'Gold'
          : p.metal || '';

  const handleCardClick = (e) => {
    if (e.target.closest('button, a')) return;
    openProductDetail(p);
  };

  return (
    <article
      className="home-card shop-product-card shop-product-card--interactive"
      onClick={handleCardClick}
    >
      <div className="home-card-img-wrapper">
        <img src={p.imageUrl || p.image} alt={p.name} />
        {stock === 0 && <div className="stock-badge out-of-stock">Out of Stock</div>}
        {stock > 0 && stock < 10 && (
          <div className="stock-badge low-stock">Only {stock} left</div>
        )}
      </div>
      <div className="home-card-body">
        {showMetalLabel && metalLabel && (
          <p className="shop-product-metal-pill">{metalLabel}</p>
        )}
        <h3>{p.name}</h3>
        <p className="home-card-category">{p.category}</p>
        <p className="home-card-price">
          ₹
          {Number(p.pricePerUnit ?? p.price ?? 0).toLocaleString('en-IN', {
            maximumFractionDigits: 2
          })}
        </p>
        {p.pricingMode === 'fixed' && (
          <p className="home-card-category" style={{ marginTop: '0.2rem', fontSize: '0.8rem' }}>
            Fixed catalogue price
          </p>
        )}
        <div className="home-card-actions">
          {inStock ? (
            qty > 0 ? (
              showViewProductButton ? (
                <>
                  <div className="shop-product-actions-row shop-product-actions-row--cart-active">
                    <button
                      type="button"
                      className="btn-secondary shop-product-card-action-btn"
                      onClick={() => openProductDetail(p)}
                    >
                      View product
                    </button>
                    <div className="home-qty-stepper shop-product-stepper-inline" aria-label="Quantity controls">
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
                          if (cartFull) return;
                          updateQuantity(pid, qty + 1);
                        }}
                        disabled={cartFull}
                        aria-label="Increase quantity"
                      >
                        +
                      </button>
                    </div>
                  </div>
                  <Link to="/cart" className="home-go-cart-btn shop-product-proceed-full" aria-label="Go to cart">
                    Proceed to buy ({qty})
                  </Link>
                </>
              ) : (
                <div className="home-card-incart">
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
                        if (cartFull) return;
                        updateQuantity(pid, qty + 1);
                      }}
                      disabled={cartFull}
                      aria-label="Increase quantity"
                    >
                      +
                    </button>
                  </div>
                  <Link to="/cart" className="home-go-cart-btn" aria-label="Go to cart">
                    Proceed to buy ({qty})
                  </Link>
                </div>
              )
            ) : showViewProductButton ? (
              <div className="shop-product-actions-row">
                <button
                  type="button"
                  className="btn-secondary shop-product-card-action-btn"
                  onClick={() => openProductDetail(p)}
                >
                  View product
                </button>
                <button
                  className="btn-primary shop-product-card-action-btn"
                  type="button"
                  onClick={() =>
                    addToCart({
                      id: pid,
                      name: p.name,
                      price: p.pricePerUnit || p.price,
                      productId: pid,
                      stock,
                      imageUrl: p.imageUrl
                    })
                  }
                >
                  Add to Cart
                </button>
              </div>
            ) : (
              <button
                className="btn-primary"
                type="button"
                onClick={() =>
                  addToCart({
                    id: pid,
                    name: p.name,
                    price: p.pricePerUnit || p.price,
                    productId: pid,
                    stock,
                    imageUrl: p.imageUrl
                  })
                }
              >
                Add to Cart
              </button>
            )
          ) : showViewProductButton ? (
            <div className="shop-product-actions-row">
              <button
                type="button"
                className="btn-secondary shop-product-card-action-btn"
                onClick={() => openProductDetail(p)}
              >
                View product
              </button>
              <button
                className="btn-primary shop-product-card-action-btn"
                type="button"
                disabled
                style={{ opacity: 0.5, cursor: 'not-allowed' }}
              >
                Out of Stock
              </button>
            </div>
          ) : (
            <button className="btn-primary" type="button" disabled style={{ opacity: 0.5, cursor: 'not-allowed' }}>
              Out of Stock
            </button>
          )}
        </div>
      </div>
    </article>
  );
}
