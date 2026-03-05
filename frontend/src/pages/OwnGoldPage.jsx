import { useCart } from '../state/CartContext';
import { useToast } from '../state/ToastContext';

const OwnGoldPage = () => {
  const { addToCart } = useCart();
  const { showToast } = useToast();

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

  const handleAddToCart = (item) => {
    addToCart(item);
    showToast(`${item.name} added to cart!`, 'success');
  };

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
              <article key={idx} className="list-card">
                <div>
                  <h3>{item.title}</h3>
                  <p>{item.desc}</p>
                  <p className="muted">From ₹{item.price.toLocaleString()}</p>
                </div>
                <button
                  className="btn-primary"
                  onClick={() =>
                    handleAddToCart({ id: `own-gold-${idx}`, name: item.title, price: item.price })
                  }
                >
                  Add to Cart
                </button>
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
            All our physical gold products come with BIS hallmark certification, 
            third-party assay reports, and proper documentation for your records.
          </p>
        </section>
      </div>
    </div>
  );
};

export default OwnGoldPage;
