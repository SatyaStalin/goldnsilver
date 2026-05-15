import { useEffect, useMemo, useState } from 'react';
import { useCart } from '../state/CartContext';
import { productService } from '../services/api';
import ShopProductCard from '../components/ShopProductCard';

function unwrapProducts(data) {
  return Array.isArray(data) ? data : data?.products ?? [];
}

function mergeGoldCatalog(productArrays) {
  const map = new Map();
  for (const arr of productArrays) {
    for (const p of arr) {
      const id = String(p._id || p.id);
      if (!map.has(id)) map.set(id, p);
    }
  }
  const order = { gold: 0, 'gold+silver': 1 };
  return [...map.values()].sort((a, b) => {
    const ma = order[a.metal] ?? 9;
    const mb = order[b.metal] ?? 9;
    if (ma !== mb) return ma - mb;
    return (a.name || '').localeCompare(b.name || '', 'en');
  });
}

const OwnGoldPage = () => {
  const goldProducts = [
    {
      title: 'Gold Coins',
      desc: '1g, 5g, 10g 24K coins with tamper-proof packaging and certification.',
      price: 7500
    },
    {
      title: 'Gold Bars',
      desc: 'Investment-grade bars for HNIs & institutions. 99.9% purity guaranteed.',
      price: 55000
    },
    {
      title: 'Gold Coins - Premium Collection',
      desc: 'Limited edition commemorative gold coins with certificates.',
      price: 15000
    },
    {
      title: 'Gold Bars - Small Size',
      desc: 'Smaller bars (5g, 10g) perfect for regular investors.',
      price: 35000
    }
  ];

  const { items, addToCart, updateQuantity, removeFromCart } = useCart();
  const [shopProducts, setShopProducts] = useState([]);
  const [shopLoading, setShopLoading] = useState(true);

  const cartQtyById = useMemo(() => {
    const map = new Map();
    for (const item of items) map.set(String(item.id), Number(item.quantity) || 0);
    return map;
  }, [items]);

  const cardProps = { cartQtyById, addToCart, updateQuantity, removeFromCart };

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const [goldRes, mixRes] = await Promise.all([
          productService.getAll({ metal: 'gold', limit: 200, page: 1 }),
          productService.getAll({ metal: 'gold+silver', limit: 200, page: 1 })
        ]);
        if (cancelled) return;
        const merged = mergeGoldCatalog([unwrapProducts(goldRes.data), unwrapProducts(mixRes.data)]);
        setShopProducts(merged);
      } catch (e) {
        console.error('OwnGoldPage catalogue fetch:', e);
        if (!cancelled) setShopProducts([]);
      } finally {
        if (!cancelled) setShopLoading(false);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="page">
      <div className="page-hero">
        <h1 className="page-hero-title">Physical Gold</h1>
        <p className="page-hero-desc">
          Certified 24K gold coins and bars with full traceability and doorstep delivery.
        </p>
      </div>

      <div className="grid-two">
        <section className="panel page-feature">
          <h2>Gold Products</h2>
          <div className="list-cards">
            {goldProducts.map((item, idx) => (
              <article key={idx} className="list-card" style={{ justifyContent: 'flex-start' }}>
                <div>
                  <h3>{item.title}</h3>
                  <p>{item.desc}</p>
                  <p className="muted">From ₹{item.price.toLocaleString()}</p>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="panel page-feature">
          <h2>Why Physical Gold?</h2>
          <ul className="bullet-list">
            <li>99.9% purity certified with BIS hallmark</li>
            <li>Tamper-proof packaging with authenticity certificates</li>
            <li>Full traceability and audit-ready documentation</li>
            <li>Secure doorstep delivery with insurance</li>
            <li>Easy redemption and buyback options</li>
            <li>Perfect for gifting and special occasions</li>
          </ul>

          <h3>Certification & Purity</h3>
          <p>
            All our physical gold products come with BIS hallmark certification, third-party assay reports, and
            proper documentation for your records.
          </p>
        </section>
      </div>

      <section className="page-shop-section page-shop-section--gold">
        <h2 className="page-shop-section-title">Gold and mixed-metal catalogue</h2>
        <p className="page-shop-section-sub">
          Live inventory from your store: pure gold items and combined gold + silver products, with the same cart,
          view details, and checkout controls as on the home page.
        </p>
        {shopLoading ? (
          <div style={{ textAlign: 'center', padding: '2rem' }}>Loading catalogue…</div>
        ) : shopProducts.length === 0 ? (
          <p className="muted" style={{ textAlign: 'center', padding: '1rem' }}>
            No gold or gold + silver products are listed yet. Add products in admin to see them here.
          </p>
        ) : (
          <div className="home-blocks-grid">
            {shopProducts.map((p) => (
              <ShopProductCard
                key={String(p._id || p.id)}
                p={p}
                {...cardProps}
                showMetalLabel
                showViewProductButton
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default OwnGoldPage;
