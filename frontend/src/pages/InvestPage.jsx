import { Link } from 'react-router-dom';

const InvestPage = () => {
  const investOptions = [
    {
      title: 'Invest in Gold',
      desc: 'Track live rates and start with as low as ₹10. Ideal for long-term wealth building.',
      highlights: ['99.9% purity', 'Instant buy/sell', 'Secure vault storage'],
      route: '/invest-gold'
    },
    {
      title: 'Sell Gold',
      desc: 'Sell vault-stored 24K gold at the live SafeGold sell rate. No GST on sale.',
      highlights: ['Live sell quote', 'No lock-in', 'SafeGold vault debit'],
      route: '/invest-gold-sell'
    },
    {
      title: 'Invest in Silver',
      desc: 'Affordable entry and strong industrial demand. Great for portfolio diversification.',
      highlights: ['999 purity', 'Low ticket size', 'Transparent pricing'],
      route: '/invest-silver'
    },
    {
      title: 'Gold + Silver Basket',
      desc: 'A balanced combo for stability (gold) + growth potential (silver) in one place.',
      highlights: ['Diversified basket', 'Auto re-balance (demo)', 'One-click allocation'],
      route: '/invest-gold-silver'
    }
  ];

  const whyInvest = [
    { title: 'Live Pricing', desc: 'Rates update frequently so you always know the price you pay.' },
    { title: 'No Storage Hassle', desc: 'Digital holdings stored in insured partner vaults.' },
    { title: 'Easy Redemption', desc: 'Sell anytime or redeem as coins/bars (where available).' },
    { title: 'Start Small', desc: 'Begin from ₹10 and build a habit of investing.' }
  ];

  return (
    <div className="page">
      <div className="page-hero">
        <h1 className="page-hero-title">Invest</h1>
        <p className="page-hero-desc">
          Choose what you want to invest in. These are demo sections with dummy content and direct links to the
          sub-pages.
        </p>
      </div>

      <div className="grid-three">
        {investOptions.map((opt) => (
          <div key={opt.route} className="card">
            <div className="card-badge">Recommended</div>
            <h3 style={{ marginTop: 0, marginBottom: '0.5rem', color: 'var(--gold-dark)' }}>{opt.title}</h3>
            <div className="muted" style={{ marginBottom: '0.8rem' }}>
              {opt.desc}
            </div>
            <ul className="bullet-list" style={{ marginBottom: '1rem' }}>
              {opt.highlights.map((h) => (
                <li key={h}>{h}</li>
              ))}
            </ul>
            <Link className="btn-primary" to={opt.route} style={{ display: 'inline-block' }}>
              Explore
            </Link>
          </div>
        ))}
      </div>

      <div className="panel" style={{ marginTop: '1.5rem' }}>
        <h2 style={{ marginTop: 0, marginBottom: '1rem', color: 'var(--gold-dark)' }}>Why invest here?</h2>
        <div className="grid-two">
          {whyInvest.map((x) => (
            <div key={x.title} className="card" style={{ boxShadow: 'none' }}>
              <h3 style={{ marginTop: 0, marginBottom: '0.4rem', color: 'var(--gold-dark)' }}>{x.title}</h3>
              <div className="muted">{x.desc}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default InvestPage;