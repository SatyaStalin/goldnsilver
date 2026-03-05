import { useCart } from '../state/CartContext';
import { useToast } from '../state/ToastContext';

const items = [
  {
    title: 'Gold Coins',
    desc: '1g, 5g, 10g 24K coins with tamper-proof packaging.',
    price: 7500
  },
  { title: 'Gold Bars', desc: 'Investment-grade bars for HNIs & institutions.', price: 55000 },
  {
    title: 'Silver Coins',
    desc: '999 purity silver coins in various weights.',
    price: 950
  },
  {
    title: 'Sterling Silver (925)',
    desc: 'Premium silver jewellery and artifacts.',
    price: 2500
  },
  {
    title: 'Festive Gifts',
    desc: 'Curated festive gift boxes with gold & silver.',
    price: 4999
  },
  {
    title: 'Corporate Gifts',
    desc: 'Custom branded coins & hampers for corporates.',
    price: 9999
  }
];

const OwnPage = () => {
  const { addToCart } = useCart();
  const { showToast } = useToast();

  const handleAddToCart = (item) => {
    addToCart(item);
    showToast(`${item.name} added to cart!`, 'success');
  };

  return (
    <div className="page">
      <div className="page-hero">
        <h1 className="page-hero-title">Physical Gold Silver</h1>
        <p className="page-hero-desc">
          Certified coins, bars and gifting solutions with doorstep delivery and full traceability.
        </p>
      </div>

      <div className="grid-three">
        {items.map((item, idx) => (
          <article key={idx} className="card">
            <div className="card-badge">Physical</div>
            <h3>{item.title}</h3>
            <p>{item.desc}</p>
            <p className="card-price">From ₹{item.price.toLocaleString()}</p>
            <button
              className="btn-primary"
              onClick={() =>
                handleAddToCart({
                  id: `own-${idx}`,
                  name: item.title,
                  price: item.price
                })
              }
            >
              Add to Cart
            </button>
          </article>
        ))}
      </div>
    </div>
  );
};

export default OwnPage;

