const performanceRows = [
  {
    asset: 'Physical Gold (IN)',
    gain: '+4.7%',
    drivers: 'IBJA Gold 999: ₹14,286 → ₹14,962/g'
  },
  {
    asset: 'Physical Silver (IN)',
    gain: '+5.9%',
    drivers: 'IBJA Silver 999: ₹2,18,400 → ₹2,31,381/kg'
  },
  {
    asset: 'Spot Gold (Global)',
    gain: '> 7.0%',
    drivers: 'Closed at $4,340/oz (Best week since Jan)'
  },
  {
    asset: 'Spot Silver (Global)',
    gain: '+9.0% to 10.0%',
    drivers: 'Breakout to $63.29/oz (Outperformed Gold)'
  },
  {
    asset: 'Digital & ETFs',
    gain: 'Strongly Positive',
    drivers: 'Silver ETFs saw highest momentum gains'
  }
];

const keyDrivers = [
  {
    title: 'Fed Pivot Expectations',
    text: 'Weak labor data significantly boosted rate-cut expectations for late 2026.'
  },
  {
    title: 'Safe-Haven Demand',
    text: 'Ongoing geopolitical friction & steady central bank buying provided a solid price floor.'
  },
  {
    title: 'High Beta Silver',
    text: "Industrial demand + speculative velocity accelerated silver's outperformance over gold."
  }
];

const platformViews = [
  {
    title: 'Silver (Tactical Play)',
    text: 'Higher yield potential accompanied by higher short-term volatility.'
  },
  {
    title: 'Gold (Structural Hold)',
    text: 'Remains the ultimate portfolio stabilizer and inflation hedge.'
  },
  {
    title: 'Digital Integration',
    text: 'SIPs and digital buying act as perfect micro-entry points for retail investors.'
  }
];

const continuum = [
  'Physical Bullion',
  'Digital Gold/Silver',
  'Domestic ETFs',
  'Global ETFs'
];

const sections = [
  { id: 'snapshot', label: 'Performance Snapshot' },
  { id: 'catalyst', label: 'Primary Catalyst' },
  { id: 'dynamics', label: 'Market Dynamics' },
  { id: 'platform', label: 'Platform View' }
];

const KnowledgeHubPage = () => {
  return (
    <div className="page kh-page">
      <section className="kh-hero" aria-label="Market insights weekly review">
        <div className="kh-hero-glow" aria-hidden="true" />
        <div className="kh-hero-inner">
          <p className="kh-kicker">GoldnSilver.shop · Market Insights</p>
          <h1 className="kh-hero-title">Gold &amp; Silver Weekly Review</h1>
          <p className="kh-hero-sub">Published by GoldnSilver.shop Research Desk</p>
          <div className="kh-week-meta">
            <p className="kh-week-badge">WEEK ENDED FRIDAY, 8 AUGUST 2026</p>
            <p className="kh-data-badge">Precious Metals Surge: Silver Takes The Lead</p>
          </div>
        </div>
      </section>

      <nav className="kh-toc" aria-label="Review sections">
        {sections.map((s) => (
          <a key={s.id} href={`#${s.id}`} className="kh-toc-link">
            {s.label}
          </a>
        ))}
      </nav>

      <section id="snapshot" className="kh-section">
        <div className="kh-card">
          <p className="kh-eyebrow">Market Performance Snapshot</p>
          <h2 className="kh-heading">Week Ended 8 August 2026</h2>
          <div className="kh-table-wrap kh-glance-table-wrap">
            <table className="kh-table kh-glance-table">
              <thead>
                <tr>
                  <th scope="col">Asset Segment</th>
                  <th scope="col">Weekly Gain</th>
                  <th scope="col">Key Drivers &amp; Reference Rates</th>
                </tr>
              </thead>
              <tbody>
                {performanceRows.map((row) => (
                  <tr key={row.asset}>
                    <td>{row.asset}</td>
                    <td className="kh-trend-up">{row.gain}</td>
                    <td>{row.drivers}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <section id="catalyst" className="kh-section">
        <div className="kh-card">
          <p className="kh-eyebrow">Primary Catalyst</p>
          <h2 className="kh-heading">US Payrolls Shock</h2>
          <p className="kh-prose">
            US July Non-Farm Payrolls unexpectedly fell by 23,000 (vs +80,000 expected). This sharp
            contraction slashed rate-hike bets and triggered aggressive inflows into non-yielding
            safe-haven assets.
          </p>
        </div>
      </section>

      <section id="dynamics" className="kh-section">
        <div className="kh-card">
          <p className="kh-eyebrow">Market Dynamics &amp; Insights</p>
          <h2 className="kh-heading">360° View across Physical, Digital &amp; Paper Markets</h2>

          <p className="kh-subhead">Key Drivers</p>
          <div className="kh-format-grid">
            {keyDrivers.map((item) => (
              <article key={item.title}>
                <h3>{item.title}</h3>
                <p>{item.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="platform" className="kh-section">
        <div className="kh-card kh-perspective-card">
          <p className="kh-eyebrow">Platform View</p>
          <h2 className="kh-heading">How we read the week</h2>

          <div className="kh-platform-view">
            {platformViews.map((item) => (
              <p key={item.title}>
                <strong>{item.title}:</strong> {item.text}
              </p>
            ))}
          </div>

          <div className="kh-callout" style={{ marginTop: '1.25rem' }}>
            <h3>The Unified Precious-Metals Continuum</h3>
            <p>
              Physical Bullion ➔ Digital Gold/Silver ➔ Domestic ETFs ➔ Global ETFs
            </p>
          </div>

          <div className="kh-advantage-chips" aria-label="Precious metals continuum">
            {continuum.map((item) => (
              <span key={item}>{item}</span>
            ))}
          </div>
        </div>
      </section>

      <section className="kh-section kh-disclaimer-wrap">
        <div className="kh-disclaimer">
          <strong>Disclaimer</strong>
          <p>
            This publication is compiled by GoldnSilver.shop for educational and informational
            purposes only and does not constitute financial, investment, or legal advice. Precious
            metal investments carry risk. Investors should conduct independent evaluation and
            consult certified financial advisors before executing investment decisions.
          </p>
        </div>
      </section>
    </div>
  );
};

export default KnowledgeHubPage;
