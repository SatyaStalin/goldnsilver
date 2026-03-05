import { useCart } from '../state/CartContext';
import { useToast } from '../state/ToastContext';

const sections = [
  {
    title: 'Gold - Digital Gold',
    desc: 'Buy 24K digital gold, stored in insured vaults, redeemable anytime.',
    price: 500
  },
  {
    title: 'Gold - SIP',
    desc: 'Automated monthly gold accumulation to reach long-term goals.',
    price: 2000
  },
  {
    title: 'Gold Mutual Funds & ETFs',
    desc: 'Diversified gold-backed funds for long-term wealth creation.',
    price: 1000
  },
  {
    title: 'Sovereign Gold Bonds',
    desc: 'Government-backed bonds with interest + gold price appreciation.',
    price: 5000
  },
  {
    title: 'Silver - Digital Silver',
    desc: 'Start small with digital silver in grams.',
    price: 300
  },
  {
    title: 'Gold + Silver - Combo Funds',
    desc: 'Blend of gold & silver for balanced precious metal allocation.',
    price: 1500
  }
];

const InvestPage = () => {
  const { addToCart } = useCart();
  const { showToast } = useToast();

  const handleAddToCart = (item) => {
    addToCart(item);
    showToast(`${item.name} added to cart!`, 'success');
  };

  const handleCalculate = (e) => {
    e.preventDefault();
    showToast('Calculation completed!', 'info');
  };

  return (
    <div className="page">
      <div className="page-hero">
        <h1 className="page-hero-title">Invest Gold Silver</h1>
        <p className="page-hero-desc">
          Live prices, SIP calculators, and allocation ideas to build a resilient precious metal portfolio.
        </p>
      </div>

      <div className="grid-two">
        <section className="panel page-feature">
          <h2>Investment Products</h2>
          <div className="list-cards">
            {sections.map((s, idx) => (
              <article key={idx} className="list-card">
                <div>
                  <h3>{s.title}</h3>
                  <p>{s.desc}</p>
                  <p className="muted">Starting from ₹{s.price.toLocaleString()}</p>
                </div>
                <button
                  className="btn-primary"
                  onClick={() =>
                    handleAddToCart({ id: `inv-${idx}`, name: s.title, price: s.price })
                  }
                >
                  Add to Cart
                </button>
              </article>
            ))}
          </div>
        </section>

        <section className="panel page-feature">
          <h2>Investment Calculator</h2>
          <form className="calculator" onSubmit={handleCalculate}>
            <label>
              Monthly Investment (₹)
              <input type="number" defaultValue={3000} required />
            </label>
            <label>
              Tenure (years)
              <input type="number" defaultValue={10} required />
            </label>
            <label>
              Expected Return (% p.a.)
              <input type="number" defaultValue={10} required />
            </label>
            <button className="btn-primary" type="submit">Calculate</button>
            <div className="calculator-result">
              <p>Total Invested: ₹3,60,000</p>
              <p>Estimated Value: ₹6,22,000</p>
            </div>
          </form>

          <h3>Features</h3>
          <ul className="bullet-list">
            <li>Live price integration (API-ready placeholder)</li>
            <li>Goal-based allocation ideas (Retirement, Kids, Emergency)</li>
            <li>SIP setup &amp; auto-debit (front-end flows)</li>
          </ul>
        </section>
      </div>
    </div>
  );
};

export default InvestPage;

