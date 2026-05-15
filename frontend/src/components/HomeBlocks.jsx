import { useMemo, useState, useEffect } from 'react';
import { useCart } from '../state/CartContext';
import { productService } from '../services/api';
import ShopProductCard from './ShopProductCard';
import img1 from '../assets/images/img354.jpg';
import silverCoin from '../assets/images/silverCoin.jpg';

const HomeBlocks = () => {
  const { items, addToCart, updateQuantity, removeFromCart } = useCart();
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const cartQtyById = useMemo(() => {
    const map = new Map();
    for (const item of items) map.set(String(item.id), Number(item.quantity) || 0);
    return map;
  }, [items]);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const featRes = await productService.getFeatured();
        if (cancelled) return;

        const unwrap = (data) => (Array.isArray(data) ? data : data?.products ?? []);

        const featList = unwrap(featRes.data);
        const featuredSlice = featList.slice(0, 4);
        setFeaturedProducts(featuredSlice);
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const cardProps = { cartQtyById, addToCart, updateQuantity, removeFromCart };

  return (
    <section className="home-blocks">
      <div className="home-products-block">
        <h2 className="home-section-title">Featured Products</h2>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '2rem' }}>Loading products...</div>
        ) : featuredProducts.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '2rem' }}>No products available</div>
        ) : (
          <div className="home-blocks-grid">
            {featuredProducts.map((p) => (
              <ShopProductCard
                key={String(p._id || p.id)}
                p={p}
                {...cardProps}
                showViewProductButton
              />
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
              <img src={img1} alt="Gold Bar" />
            </div>
            <h3>24K Gold Bars</h3>
            <p>Investment-grade purity</p>
          </div>
          <div className="home-3d-card">
            <div className="home-3d-img">
              <img src={img1} alt="Gold Coin" />
            </div>
            <h3>Certified Coins</h3>
            <p>BIS certified</p>
          </div>
          <div className="home-3d-card">
            <div className="home-3d-img">
              <img src={silverCoin} alt="Silver" />
            </div>
            <h3>Silver Collection</h3>
            <p>999 purity silver</p>
          </div>
          <div className="home-3d-card">
            <div className="home-3d-img">
              <img src={img1} alt="Gold Jewelry" />
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
            <p>Certified purity with international standards</p>
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
          <button className="btn-primary" type="button">
            Start Investing
          </button>
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
