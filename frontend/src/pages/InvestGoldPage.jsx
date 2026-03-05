import { useCart } from '../state/CartContext';
import { useToast } from '../state/ToastContext';

const InvestGoldPage = () => {
  const { addToCart } = useCart();
  const { showToast } = useToast();

  const goldProducts = [
    {
      title: 'Digital Gold',
      desc: 'Buy 24K digital gold, stored in insured vaults, redeemable anytime.',
      price: 500
    },
    {
      title: 'Gold SIP',
      desc: 'Automated monthly gold accumulation to reach long-term goals.',
      price: 2000
    },
    {
      title: 'Gold Mutual Funds',
      desc: 'Diversified gold-backed funds for long-term wealth creation.',
      price: 1000
    },
    {
      title: 'Gold ETFs',
      desc: 'Exchange-traded funds backed by physical gold holdings.',
      price: 5000
    },
    {
      title: 'Sovereign Gold Bonds',
      desc: 'Government-backed bonds with interest + gold price appreciation.',
      price: 5000
    }
  ];

  const handleAddToCart = (item) => {
    addToCart(item);
    showToast(`${item.name} added to cart!`, 'success');
  };

  return (
    <div className="page">
      <div className="page-hero">
        <h1 className="page-hero-title">Invest in Gold</h1>
        <p className="page-hero-desc">
          Multiple ways to invest in gold - digital, physical, mutual funds, ETFs, and sovereign bonds.
        </p>
      </div>

      <div className="grid-two">
        <section className="panel page-feature">
          <h2>Gold Investment Options</h2>
          <div className="list-cards">
            {goldProducts.map((item, idx) => (
              <article key={idx} className="list-card">
                <div>
                  <h3>{item.title}</h3>
                  <p>{item.desc}</p>
                  <p className="muted">Starting from ₹{item.price.toLocaleString()}</p>
                </div>
                <button
                  className="btn-primary"
                  onClick={() =>
                    handleAddToCart({ id: `gold-${idx}`, name: item.title, price: item.price })
                  }
                >
                  Add to Cart
                </button>
              </article>
            ))}
          </div>
        </section>

        <section className="panel page-feature">
          <h2>Why Invest in Gold?</h2>
          <ul className="bullet-list">
            <li>Hedge against inflation and currency devaluation</li>
            <li>Portfolio diversification and wealth preservation</li>
            <li>Long-term capital appreciation potential</li>
            <li>Liquidity - easy to buy and sell</li>
            <li>No storage hassles with digital gold</li>
            <li>Tax benefits with Sovereign Gold Bonds</li>
          </ul>

          <h3>Gold Price Trends</h3>
          <p>
            Gold has historically maintained its value and shown steady appreciation over long periods. 
            It's considered a safe haven asset during economic uncertainties.
          </p>
        </section>
      </div>
    </div>
  );
};

export default InvestGoldPage;
