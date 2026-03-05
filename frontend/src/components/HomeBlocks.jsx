import { useState, useEffect } from 'react';
import { useCart } from '../state/CartContext';
import { productService } from '../services/api';

const HomeBlocks = () => {
  const { addToCart } = useCart();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await productService.getFeatured();
        setProducts(response.data.slice(0, 4)); // Get first 4 featured products
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  return (
    <section className="home-blocks">
      {/* Product Grid - Featured Products */}
      <div className="home-products-block">
        <h2 className="home-section-title">Featured Products</h2>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '2rem' }}>Loading products...</div>
        ) : products.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '2rem' }}>No products available</div>
        ) : (
          <div className="home-blocks-grid">
            {products.map((p) => (
              <article key={p._id || p.id} className="home-card">
                <div className="home-card-img-wrapper">
                  <img src={p.imageUrl || p.image} alt={p.name} />
                  {p.stock === 0 && (
                    <div className="stock-badge out-of-stock">Out of Stock</div>
                  )}
                  {p.stock > 0 && p.stock < 10 && (
                    <div className="stock-badge low-stock">Only {p.stock} left</div>
                  )}
                </div>
                <div className="home-card-body">
                  <h3>{p.name}</h3>
                  <p className="home-card-category">{p.category}</p>
                  <p className="home-card-price">
                    ₹{p.pricePerUnit?.toLocaleString() || p.price?.toLocaleString()}
                    {p.unit && ` per ${p.unit}`}
                  </p>
                  {p.stock > 0 ? (
                    <button 
                      className="btn-primary" 
                      onClick={() => addToCart({
                        id: p._id || p.id,
                        name: p.name,
                        price: p.pricePerUnit || p.price,
                        productId: p._id || p.id,
                        stock: p.stock,
                        imageUrl: p.imageUrl
                      })}
                    >
                      Add to Cart
                    </button>
                  ) : (
                    <button className="btn-primary" disabled style={{ opacity: 0.5, cursor: 'not-allowed' }}>
                      Out of Stock
                    </button>
                  )}
                </div>
              </article>
            ))}
          </div>
        )}
      </div>

      {/* 3D Images Block */}
      <div className="home-3d-block">
        <h2 className="home-section-title">Premium Gold Collection</h2>
        <div className="home-3d-grid">
          <div className="home-3d-card">
            <div className="home-3d-img">
              <img src="https://images.pexels.com/photos/315788/pexels-photo-315788.jpeg" alt="Gold Bar" />
            </div>
            <h3>24K Gold Bars</h3>
            <p>Investment-grade purity</p>
          </div>
          <div className="home-3d-card">
            <div className="home-3d-img">
              <img src="https://images.pexels.com/photos/706137/pexels-photo-706137.jpeg" alt="Gold Coin" />
            </div>
            <h3>Certified Coins</h3>
            <p>MMTC-PAMP certified</p>
          </div>
          <div className="home-3d-card">
            <div className="home-3d-img">
              <img src="https://images.pexels.com/photos/210607/pexels-photo-210607.jpeg" alt="Silver" />
            </div>
            <h3>Silver Collection</h3>
            <p>999 purity silver</p>
          </div>
          <div className="home-3d-card">
            <div className="home-3d-img">
              <img src="https://images.pexels.com/photos/5980647/pexels-photo-5980647.jpeg" alt="Gold Jewelry" />
            </div>
            <h3>Gold Jewelry</h3>
            <p>Premium crafted pieces</p>
          </div>
        </div>
      </div>

      {/* Features Block */}
      <div className="home-features-block">
        <h2 className="home-section-title">Why Invest With Us?</h2>
        <div className="home-features-grid">
          <div className="home-feature-item">
            <div className="home-feature-icon">🔒</div>
            <h3>Secure Storage</h3>
            <p>Fully insured vaults with 24/7 security monitoring</p>
          </div>
          <div className="home-feature-item">
            <div className="home-feature-icon">📈</div>
            <h3>Live Pricing</h3>
            <p>Real-time gold and silver prices updated instantly</p>
          </div>
          <div className="home-feature-item">
            <div className="home-feature-icon">💎</div>
            <h3>99.9% Purity</h3>
            <p>Certified purity with MMTC-PAMP standards</p>
          </div>
          <div className="home-feature-item">
            <div className="home-feature-icon">⚡</div>
            <h3>Instant Redemption</h3>
            <p>Redeem your digital gold as coins or bars anytime</p>
          </div>
          <div className="home-feature-item">
            <div className="home-feature-icon">💰</div>
            <h3>Low Investment</h3>
            <p>Start investing from just ₹10 onwards</p>
          </div>
          <div className="home-feature-item">
            <div className="home-feature-icon">🛡️</div>
            <h3>Trusted Platform</h3>
            <p>SEBI-registered and fully compliant</p>
          </div>
        </div>
      </div>

      {/* Image Beside Content Block */}
      <div className="home-image-content-block">
        <div className="home-image-content-img">
          <img src="https://images.pexels.com/photos/164527/pexels-photo-164527.jpeg" alt="Digital Gold" />
        </div>
        <div className="home-image-content-text">
          <h2>Why Choose Digital Gold?</h2>
          <ul>
            <li>✅ No storage hassles - Fully insured vaults</li>
            <li>✅ Buy from ₹10 onwards with real-time prices</li>
            <li>✅ Redeem as coins/bars or sell back anytime</li>
            <li>✅ 24/7 access to your gold holdings</li>
            <li>✅ Secure and transparent transactions</li>
          </ul>
          <button className="btn-primary">Start Investing</button>
        </div>
      </div>


      {/* Stats Block */}
      <div className="home-stats-block">
        <h2 className="home-section-title">Our Achievements</h2>
        <div className="home-stats-grid">
          <div className="home-stat-item">
            <div className="home-stat-number">50K+</div>
            <div className="home-stat-label">Happy Customers</div>
          </div>
          <div className="home-stat-item">
            <div className="home-stat-number">₹500Cr+</div>
            <div className="home-stat-label">Gold Transacted</div>
          </div>
          <div className="home-stat-item">
            <div className="home-stat-number">99.9%</div>
            <div className="home-stat-label">Purity Guaranteed</div>
          </div>
          <div className="home-stat-item">
            <div className="home-stat-number">24/7</div>
            <div className="home-stat-label">Customer Support</div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HomeBlocks;

