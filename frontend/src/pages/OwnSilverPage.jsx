import { useCart } from '../state/CartContext';
import { useToast } from '../state/ToastContext';

const OwnSilverPage = () => {
  const { addToCart } = useCart();
  const { showToast } = useToast();

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

  const handleAddToCart = (item) => {
    addToCart(item);
    showToast(`${item.name} added to cart!`, 'success');
  };

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
              <article key={idx} className="list-card">
                <div>
                  <h3>{item.title}</h3>
                  <p>{item.desc}</p>
                  <p className="muted">From ₹{item.price.toLocaleString()}</p>
                </div>
                <button
                  className="btn-primary"
                  onClick={() =>
                    handleAddToCart({ id: `own-silver-${idx}`, name: item.title, price: item.price })
                  }
                >
                  Add to Cart
                </button>
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
            All silver products undergo rigorous quality checks and come with proper 
            certification, assay reports, and authenticity guarantees.
          </p>
        </section>
      </div>
    </div>
  );
};

export default OwnSilverPage;
