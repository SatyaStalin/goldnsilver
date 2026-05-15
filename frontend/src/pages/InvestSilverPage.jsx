const InvestSilverPage = () => {
  const silverProducts = [
    {
      title: 'Digital Silver',
      desc: 'Start small with digital silver in grams. Affordable entry point.',
      price: 300
    },
    {
      title: 'Silver Mutual Funds',
      desc: 'Diversified silver-backed funds for long-term wealth creation.',
      price: 1000
    },
    {
      title: 'Silver ETFs',
      desc: 'Exchange-traded funds backed by physical silver holdings.',
      price: 5000
    },
    {
      title: 'Silver SIP',
      desc: 'Systematic investment plan for silver accumulation.',
      price: 2000
    }
  ];

  return (
    <div className="page">
      <div className="page-hero">
        <h1 className="page-hero-title">Invest in Silver</h1>
        <p className="page-hero-desc">
          Affordable precious metal investment options - digital silver, mutual funds, and ETFs.
        </p>
      </div>

      <div className="grid-two">
        <section className="panel page-feature">
          <h2>Silver Investment Options</h2>
          <div className="list-cards">
            {silverProducts.map((item, idx) => (
              <article key={idx} className="list-card" style={{ justifyContent: 'flex-start' }}>
                <div>
                  <h3>{item.title}</h3>
                  <p>{item.desc}</p>
                  <p className="muted">Starting from ₹{item.price.toLocaleString()}</p>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="panel page-feature">
          <h2>Why Invest in Silver?</h2>
          <ul className="bullet-list">
            <li>Lower entry barrier compared to gold</li>
            <li>Industrial demand provides price support</li>
            <li>Portfolio diversification at affordable prices</li>
            <li>Potential for higher volatility and returns</li>
            <li>Digital silver - no storage concerns</li>
            <li>Growing demand in technology and renewable energy</li>
          </ul>

          <h3>Silver Market Overview</h3>
          <p>
            Silver serves both as an investment asset and an industrial metal, providing dual demand drivers. It&apos;s
            more affordable than gold, making it accessible to a wider range of investors.
          </p>
        </section>
      </div>
    </div>
  );
};

export default InvestSilverPage;
