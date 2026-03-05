import { useCart } from '../state/CartContext';
import { useToast } from '../state/ToastContext';

const InvestGoldSilverPage = () => {
  const { addToCart } = useCart();
  const { showToast } = useToast();

  const comboProducts = [
    {
      title: 'Gold + Silver Combo Funds',
      desc: 'Blend of gold & silver for balanced precious metal allocation.',
      price: 1500
    },
    {
      title: 'Precious Metals Portfolio',
      desc: 'Diversified portfolio with both gold and silver investments.',
      price: 3000
    },
    {
      title: 'Balanced Precious Metals SIP',
      desc: 'Systematic investment in both gold and silver.',
      price: 2500
    },
    {
      title: 'Gold-Silver ETF Combo',
      desc: 'Combined exposure to both metals through ETFs.',
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
        <h1 className="page-hero-title">Invest in Gold + Silver</h1>
        <p className="page-hero-desc">
          Balanced precious metals portfolio combining the stability of gold with the growth potential of silver.
        </p>
      </div>

      <div className="grid-two">
        <section className="panel page-feature">
          <h2>Combo Investment Options</h2>
          <div className="list-cards">
            {comboProducts.map((item, idx) => (
              <article key={idx} className="list-card">
                <div>
                  <h3>{item.title}</h3>
                  <p>{item.desc}</p>
                  <p className="muted">Starting from ₹{item.price.toLocaleString()}</p>
                </div>
                <button
                  className="btn-primary"
                  onClick={() =>
                    handleAddToCart({ id: `combo-${idx}`, name: item.title, price: item.price })
                  }
                >
                  Add to Cart
                </button>
              </article>
            ))}
          </div>
        </section>

        <section className="panel page-feature">
          <h2>Benefits of Gold + Silver Portfolio</h2>
          <ul className="bullet-list">
            <li>Diversification across two precious metals</li>
            <li>Gold provides stability and wealth preservation</li>
            <li>Silver offers growth potential and affordability</li>
            <li>Balanced risk-return profile</li>
            <li>Hedge against inflation and economic uncertainty</li>
            <li>Flexible allocation based on market conditions</li>
          </ul>

          <h3>Recommended Allocation</h3>
          <p>
            A balanced precious metals portfolio typically includes 60-70% gold and 30-40% silver, 
            though this can be adjusted based on individual risk tolerance and investment goals.
          </p>
        </section>
      </div>
    </div>
  );
};

export default InvestGoldSilverPage;
