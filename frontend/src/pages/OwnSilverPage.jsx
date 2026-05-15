import { useEffect, useMemo, useState } from 'react';
import { useCart } from '../state/CartContext';
import { productService } from '../services/api';
import ShopProductCard from '../components/ShopProductCard';

function unwrapProducts(data) {
  return Array.isArray(data) ? data : data?.products ?? [];
}

function mergeSilverCatalog(productArrays) {
  const map = new Map();
  for (const arr of productArrays) {
    for (const p of arr) {
      const id = String(p._id || p.id);
      if (!map.has(id)) map.set(id, p);
    }
  }
  const order = { silver: 0, 'gold+silver': 1 };
  return [...map.values()].sort((a, b) => {
    const ma = order[a.metal] ?? 9;
    const mb = order[b.metal] ?? 9;
    if (ma !== mb) return ma - mb;
    return (a.name || '').localeCompare(b.name || '', 'en');
  });
}

const OwnSilverPage = () => {
  const silverProducts = [
    {
      title: 'Silver Coins',
      desc: '999 purity silver coins in various weights (1g to 100g).',
      price: 950
    },
    {
      title: 'Silver Bars',
      desc: 'Investment-grade silver bars with certification and packaging.',
      price: 5000
    },
    {
      title: 'Sterling Silver (925)',
      desc: 'Premium silver jewellery and artifacts with 92.5% silver content.',
      price: 2500
    },
    {
      title: 'Silver Coins - Premium',
      desc: 'Limited edition commemorative silver coins.',
      price: 2000
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
        const [silverRes, mixRes] = await Promise.all([
          productService.getAll({ metal: 'silver', limit: 200, page: 1 }),
          productService.getAll({ metal: 'gold+silver', limit: 200, page: 1 })
        ]);
        if (cancelled) return;
        const merged = mergeSilverCatalog([unwrapProducts(silverRes.data), unwrapProducts(mixRes.data)]);
        setShopProducts(merged);
      } catch (e) {
        console.error('OwnSilverPage catalogue fetch:', e);
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
        <h1 className="page-hero-title">Physical Silver</h1>
        <p className="page-hero-desc">
          Certified silver coins, bars, and premium products with full documentation.
        </p>
      </div>

      <div className="grid-two">
        <section className="panel page-feature">
          <h2>Silver Products</h2>
          <div className="list-cards">
            {silverProducts.map((item, idx) => (
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
          <h2>Why Physical Silver?</h2>
          <ul className="bullet-list">
            <li>999 purity certified silver coins and bars</li>
            <li>Affordable entry point for precious metals</li>
            <li>Authenticity certificates with every purchase</li>
            <li>Secure packaging and insured delivery</li>
            <li>Easy buyback and redemption options</li>
            <li>Perfect for gifting and collections</li>
          </ul>

          <h3>Quality Assurance</h3>
          <p>
            All silver products undergo rigorous quality checks and come with proper certification, assay reports,
            and authenticity guarantees.
          </p>
        </section>
      </div>

      <section className="page-shop-section page-shop-section--silver">
        <h2 className="page-shop-section-title">Silver and mixed-metal catalogue</h2>
        <p className="page-shop-section-sub">
          Live inventory: silver products and combined gold + silver items, with view product, add to cart, and
          quantity controls like the home catalogue.
        </p>
        {shopLoading ? (
          <div style={{ textAlign: 'center', padding: '2rem' }}>Loading catalogue…</div>
        ) : shopProducts.length === 0 ? (
          <p className="muted" style={{ textAlign: 'center', padding: '1rem' }}>
            No silver or gold + silver products are listed yet. Add products in admin to see them here.
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

export default OwnSilverPage;
