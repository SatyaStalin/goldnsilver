const snapshotStats = [
  { label: 'Gold Monthly Trend', value: '5-Mth High', note: 'First monthly gain in five months' },
  { label: 'Global ETF Flows', value: 'Positive H1 2026', note: 'YTD net inflows sustained' },
  { label: 'India Digital Gold', value: 'High Adoption', note: 'Above historical baselines' },
  { label: 'Silver Growth Catalyst', value: 'Industrial', note: 'Solar · EVs · Electronics' }
];

const physicalGold = [
  {
    title: 'Range-Bound Trading',
    text: 'Gold prices moved within a defined consolidation corridor throughout the week.'
  },
  {
    title: 'Friday Profit Booking',
    text: 'Strengthened US Dollar triggered mild profit-taking into the weekend close.'
  },
  {
    title: 'Monthly Milestone',
    text: 'Logged its first monthly gain in five months, confirming robust underlying structural demand.'
  }
];

const physicalSilver = [
  {
    title: 'Elevated Volatility',
    text: 'Experienced sharper price pullbacks compared to gold as investors trimmed risk assets.'
  },
  {
    title: 'Macro Pressures',
    text: 'Near-term weakness was magnified by tactical profit-taking in industrial commodities.'
  },
  {
    title: 'Industrial Floor',
    text: 'Long-term support remains anchored by demand in solar energy, EV production, and electronics.'
  }
];

const digitalPoints = [
  'Sustained retail accumulation via micro-investing and SIP routes on UPI-enabled digital platforms.',
  'July industry reports show digital gold transactions remaining well above historical baseline averages despite price fluctuations.',
  'Platforms like GoldnSilver.shop are capitalizing on this structural transition toward transparent, fractional, and instant bullion ownership.'
];

const etfPoints = [
  'Domestic Gold ETFs remain a premier vehicle for institutional and high-net-worth portfolio diversification.',
  'Steady inflows observed via systematic investment plans (SIPs), treating recent price dips as strategic accumulation windows.',
  'Silver ETFs continue to pull growth-oriented capital seeking dual exposure to precious metals and green energy expansion.'
];

const globalEtfTrends = [
  {
    title: 'H1 Positive Net Flows',
    text: 'Global Gold ETFs maintain positive net inflows on a year-to-date basis for 2026.'
  },
  {
    title: 'Asian Leadership',
    text: 'Asian regional funds continue leading global net inflows, offsetting minor European/US monthly redemptions.'
  },
  {
    title: 'Institutional Liquidity',
    text: 'Overseas Gold & Silver ETFs remain key liquidity avenues for global asset allocators.'
  }
];

const catalysts = [
  'US Federal Reserve rate-cut timing & policy expectations',
  'US Dollar Index (DXY) momentum & Treasury yield curves',
  'Global inflation reports and geopolitical risk hedging'
];

const goldPillars = [
  'Core portfolio diversification asset',
  'Effective hedge against currency inflation',
  'Safe-haven against geopolitical uncertainty'
];

const silverPillars = [
  'Accelerating industrial demand (Solar, EVs)',
  'High beta exposure to precious metals bull cycles',
  'Fractional valuation advantage'
];

const advantageProducts = [
  'Physical Bullion',
  '24K Digital Gold',
  'Digital Silver',
  'Domestic ETFs',
  'Overseas ETFs',
  'Live Transparent Pricing'
];

const sections = [
  { id: 'summary', label: 'Executive Summary' },
  { id: 'physical', label: 'Physical Analysis' },
  { id: 'digital', label: 'Digital & ETFs' },
  { id: 'overseas', label: 'Overseas Markets' },
  { id: 'outlook', label: 'Strategic Outlook' }
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
            <p className="kh-week-badge">WEEK ENDED FRIDAY, 31 JULY 2026</p>
            <p className="kh-data-badge">Market Outlook: Constructive</p>
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

      <section id="summary" className="kh-section">
        <div className="kh-card">
          <p className="kh-eyebrow">Executive Summary</p>
          <h2 className="kh-heading">Divergent metals, constructive medium-term case</h2>
          <p className="kh-prose">
            The precious metals market concluded the week ending 31 July 2026 with divergent
            performance across metals. Gold displayed notable resilience—securing its first
            monthly gain in five months despite late-week profit taking—while silver experienced
            heightened volatility driven by broader macroeconomic risk reduction. Key catalysts
            shaping sentiment include shifting US Fed interest-rate expectations, US Dollar Index
            (DXY) momentum, global inflation dynamics, and sustained industrial demand.
          </p>
          <div className="kh-snapshot">
            {snapshotStats.map((item) => (
              <div key={item.label} className="kh-snapshot-item">
                <span>{item.label}</span>
                <strong className="up">{item.value}</strong>
                <small>{item.note}</small>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="physical" className="kh-section">
        <div className="kh-card">
          <p className="kh-eyebrow">01 · Physical Analysis</p>
          <h2 className="kh-heading">Physical Gold &amp; Silver</h2>
          <div className="kh-format-grid">
            <article>
              <h3>Physical Gold</h3>
              <ul>
                {physicalGold.map((item) => (
                  <li key={item.title}>
                    <strong>{item.title}:</strong> {item.text}
                  </li>
                ))}
              </ul>
            </article>
            <article>
              <h3>Physical Silver</h3>
              <ul>
                {physicalSilver.map((item) => (
                  <li key={item.title}>
                    <strong>{item.title}:</strong> {item.text}
                  </li>
                ))}
              </ul>
            </article>
          </div>
        </div>
      </section>

      <section id="digital" className="kh-section">
        <div className="kh-card">
          <p className="kh-eyebrow">02 · India Market</p>
          <h2 className="kh-heading">Digital Precious Metals &amp; Domestic ETFs</h2>
          <div className="kh-etf-cards">
            <article>
              <h3>Digital Gold &amp; Silver</h3>
              <ul className="kh-list">
                {digitalPoints.map((point) => (
                  <li key={point}>{point}</li>
                ))}
              </ul>
            </article>
            <article>
              <h3>Indian Gold &amp; Silver ETFs</h3>
              <ul className="kh-list">
                {etfPoints.map((point) => (
                  <li key={point}>{point}</li>
                ))}
              </ul>
            </article>
          </div>
        </div>
      </section>

      <section id="overseas" className="kh-section">
        <div className="kh-card">
          <p className="kh-eyebrow">03 · Overseas Markets</p>
          <h2 className="kh-heading">Global ETF Trends &amp; Macro Drivers</h2>
          <div className="kh-driver-grid">
            {globalEtfTrends.map((item) => (
              <article key={item.title}>
                <h3>{item.title}</h3>
                <p>{item.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="outlook" className="kh-section">
        <div className="kh-card kh-perspective-card">
          <p className="kh-eyebrow">04 · Strategic Outlook</p>
          <h2 className="kh-heading">Perspective &amp; Investment Case</h2>

          <p className="kh-subhead">Key Market Catalysts</p>
          <ol className="kh-numbered-list kh-watchlist">
            {catalysts.map((item) => (
              <li key={item}>
                <strong>{item}</strong>
              </li>
            ))}
          </ol>

          <p className="kh-prose">
            Despite near-term tactical volatility, the medium-to-long-term investment case for
            precious metals remains highly constructive.
          </p>

          <div className="kh-format-grid">
            <article>
              <h3>Gold Pillars</h3>
              <ul>
                {goldPillars.map((point) => (
                  <li key={point}>{point}</li>
                ))}
              </ul>
            </article>
            <article>
              <h3>Silver Pillars</h3>
              <ul>
                {silverPillars.map((point) => (
                  <li key={point}>{point}</li>
                ))}
              </ul>
            </article>
          </div>

          <div className="kh-callout" style={{ marginTop: '1.25rem' }}>
            <h3>The GoldnSilver.shop Advantage</h3>
            <p>
              We provide a unified ecosystem designed to seamlessly connect investors with
              physical, digital, and exchange-traded precious metals products with institutional
              transparency and technological excellence.
            </p>
          </div>

          <div className="kh-advantage-chips" aria-label="Platform offerings">
            {advantageProducts.map((item) => (
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
