import './PageShell.css';
import './KnowledgeHubPage.css';

const weeklyTrends = [
  { label: 'Physical Gold', direction: 'up', aria: 'Broadly stable, slightly up' },
  { label: 'Physical Silver', direction: 'down', aria: 'Corrected lower' },
  { label: 'Digital Metals', direction: 'down', aria: 'Tracked physical benchmarks' },
  { label: 'Domestic ETFs', direction: 'down', aria: 'Down trend' },
  { label: 'Overseas Markets', direction: 'down', aria: 'Down trend' }
];

const physicalMetals = [
  {
    metal: '24K Gold',
    spec: 'Physical bullion · India',
    rows: [
      { label: 'Open · 7 Sep (Mumbai)', value: '₹1,52,640 / 10g' },
      { label: 'Close · 11 Sep (IBJA)', value: '₹1,53,020 / 10g' }
    ],
    change: '+0.25% (Broadly Stable)',
    down: false
  },
  {
    metal: 'MCX Silver',
    spec: 'Physical bullion · India',
    rows: [
      { label: 'Open · 7 Sep', value: '₹2,36,840 / kg' },
      { label: 'Weekly trend', value: 'Corrected Lower' }
    ],
    change: 'Corrected Lower',
    down: true
  }
];

const digitalDrivers = [
  'Micro-purchases',
  'Automated SIPs',
  'Instant online buy/sell liquidity',
  'Vault-backed physical redemption'
];

const etfMoves = [
  {
    title: 'Monday Pressure (7 Sep)',
    text: 'Gold ETFs fell ~1.5%. Silver ETFs declined ~1.5%.'
  },
  {
    title: 'Friday Softening (11 Sep)',
    text: 'Gold ETFs slipped >1%. Silver ETFs fell ~3%.'
  }
];

const overseasMarkets = [
  {
    metal: 'Spot Gold',
    close: 'US$ 4,363 / oz',
    change: '-1.5%'
  },
  {
    metal: 'Spot Silver',
    close: 'US$ 64.54 / oz',
    change: '-2.6%'
  }
];

const keyDrivers = [
  {
    title: 'US Macro Data',
    text: 'Strong economic activity and persistent inflation reinforced hawkish Fed rate expectations.'
  },
  {
    title: 'Yields & USD',
    text: 'A firm US Dollar and rising Treasury yields reduced demand for non-yielding metals.'
  },
  {
    title: 'Profit-Taking',
    text: 'Systematic profit booking occurred after recent multi-week highs.'
  }
];

const continuum = [
  'Physical Bullion',
  'Digital Precious Metals',
  'Domestic ETFs',
  'Overseas Derivatives'
];

const sections = [
  { id: 'trends', label: 'Weekly Trends' },
  { id: 'physical', label: 'Physical Bullion' },
  { id: 'digital', label: 'Digital Metals' },
  { id: 'etfs', label: 'Domestic ETFs' },
  { id: 'overseas', label: 'Overseas Markets' },
  { id: 'drivers', label: 'Market Drivers' },
  { id: 'outlook', label: 'Perspective' }
];

const IconChart = () => (
  <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path d="M4 18V6M8 18V10M12 18V8M16 18V12M20 18V4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

const IconInsight = () => (
  <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="1.75" />
    <path d="M16 16l5 5" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
  </svg>
);

const IconBulb = () => (
  <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path
      d="M9 18h6M10 22h4M12 3a6 6 0 0 1 3.5 10.9V16H8.5v-2.1A6 6 0 0 1 12 3z"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinejoin="round"
    />
  </svg>
);

const KnowledgeHubPage = () => {
  return (
    <div className="gs-page kh-page">
      <section className="gs-hero gs-hero--gradient kh-hero" aria-label="Weekly intelligence">
        <div className="kh-hero-sparkle" aria-hidden="true" />
        <svg className="kh-hero-ico kh-hero-ico-left" viewBox="0 0 64 64" fill="none" aria-hidden="true">
          <path d="M10 44L22 28l10 8 14-18 8 10" stroke="#C9A227" strokeWidth="2.5" strokeLinejoin="round" />
          <path d="M46 18h8v8" stroke="#C9A227" strokeWidth="2.5" strokeLinejoin="round" />
        </svg>
        <svg className="kh-hero-ico kh-hero-ico-right" viewBox="0 0 64 64" fill="none" aria-hidden="true">
          <circle cx="32" cy="32" r="22" stroke="#C9A227" strokeWidth="2.5" />
          <path d="M32 18v14l10 6" stroke="#C9A227" strokeWidth="2.5" strokeLinecap="round" />
        </svg>
        <div className="gs-hero-inner kh-hero-inner">
          <p className="gs-hero-kicker">www.goldnsilver.shop</p>
          <h1>Gold &amp; Silver Weekly Market Review</h1>
          <p className="gs-hero-copy">
            Opened under pressure, mid-week swings, and a lower close on strong US data
          </p>
          <div className="gs-hero-meta">
            <p className="gs-hero-badge">7 SEP – 11 SEP 2026</p>
          </div>
        </div>
      </section>

      <nav className="gs-section kh-toc-wrap" aria-label="Review sections">
        <div className="gs-panel kh-toc-panel">
          <p className="kh-toc-label">Jump to section</p>
          <div className="kh-toc">
            {sections.map((s) => (
              <a key={s.id} href={`#${s.id}`} className="kh-toc-link">
                {s.label}
              </a>
            ))}
          </div>
        </div>
      </nav>

      <section id="trends" className="gs-section kh-section">
        <div className="gs-panel kh-card kh-trend-card">
          <p className="kh-trend-eyebrow">Weekly Trend Summary</p>
          <div className="kh-trend-strip" role="list" aria-label="Weekly asset trends">
            {weeklyTrends.map((item) => (
              <div key={item.label} className="kh-trend-chip" role="listitem">
                <span className="kh-trend-chip-label">{item.label}</span>
                <span
                  className={`kh-trend-chip-arrow${item.direction === 'up' ? ' kh-trend-chip-arrow--up' : ''}`}
                  aria-label={item.aria}
                >
                  {item.direction === 'up' ? '▲' : '▼'}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="gs-section kh-section">
        <div className="gs-panel kh-card">
          <div className="kh-card-head">
            <span className="kh-card-icon" aria-hidden="true">
              <IconInsight />
            </span>
            <div>
              <p className="kh-eyebrow">Executive Summary</p>
              <h2 className="kh-heading">A volatile week, lower close</h2>
            </div>
          </div>
          <p className="kh-prose">
            A volatile trading week across global and domestic markets saw gold and silver open
            under pressure, experience mid-week fluctuations, and close lower due to strong US
            economic data, persistent inflation readings, and elevated US bond yields.
          </p>
        </div>
      </section>

      <section id="physical" className="gs-section kh-section">
        <div className="gs-panel kh-card">
          <div className="kh-card-head">
            <span className="kh-card-icon" aria-hidden="true">
              <IconChart />
            </span>
            <div>
              <p className="kh-eyebrow">1. Physical Bullion — India</p>
              <h2 className="kh-heading">Domestic bullion performance</h2>
            </div>
          </div>
          <div className="kh-price-grid">
            {physicalMetals.map((item) => (
              <article key={item.metal} className="kh-price-card">
                <p className="kh-price-metal">{item.metal}</p>
                <p className="kh-price-spec">{item.spec}</p>
                {item.rows.map((row) => (
                  <div key={row.label} className="kh-price-row">
                    <span>{row.label}</span>
                    <strong>{row.value}</strong>
                  </div>
                ))}
                <p
                  className={`kh-gain-pill kh-price-change${item.down ? ' kh-gain-pill--down' : ''}`}
                >
                  {item.down ? '↓' : '↑'} {item.change}
                </p>
              </article>
            ))}
          </div>
          <p className="kh-prose kh-prose--spaced">
            Note: Rates exclude GST &amp; making charges. Indian physical gold demonstrated strong
            resilience against global headwinds.
          </p>
        </div>
      </section>

      <section id="digital" className="gs-section kh-section">
        <div className="gs-panel kh-card">
          <div className="kh-card-head">
            <span className="kh-card-icon" aria-hidden="true">
              <IconInsight />
            </span>
            <div>
              <p className="kh-eyebrow">2. Digital Metals</p>
              <h2 className="kh-heading">Tracked physical benchmarks</h2>
            </div>
          </div>
          <p className="kh-prose">
            Digital gold and silver tracked underlying physical benchmark movements closely.
          </p>
          <p className="kh-subhead">Key retail adoption drivers</p>
          <ul className="kh-scorecard-meta">
            {digitalDrivers.map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ul>
        </div>
      </section>

      <section id="etfs" className="gs-section kh-section">
        <div className="gs-panel kh-card">
          <div className="kh-card-head">
            <span className="kh-card-icon" aria-hidden="true">
              <IconChart />
            </span>
            <div>
              <p className="kh-eyebrow">3. Domestic ETFs &amp; Structural Reform</p>
              <h2 className="kh-heading">India ETF performance</h2>
            </div>
          </div>
          <div className="kh-etf-grid">
            {etfMoves.map((item) => (
              <article key={item.title} className="kh-price-card">
                <p className="kh-price-metal">{item.title}</p>
                <p className="kh-prose">{item.text}</p>
              </article>
            ))}
          </div>
          <div className="kh-card--highlight kh-takeaway">
            <p className="kh-subhead">Structural market reform</p>
            <p className="kh-prose">
              Effective 7 September 2026, Gold &amp; Silver ETFs were officially brought into
              India&apos;s 9:00–9:15 AM pre-open session, enabling better price discovery and
              smooth absorption of overnight global movements.
            </p>
          </div>
        </div>
      </section>

      <section id="overseas" className="gs-section kh-section">
        <div className="gs-panel kh-card">
          <div className="kh-card-head">
            <span className="kh-card-icon" aria-hidden="true">
              <IconChart />
            </span>
            <div>
              <p className="kh-eyebrow">4. Overseas Markets</p>
              <h2 className="kh-heading">Spot gold and silver</h2>
            </div>
          </div>
          <div className="kh-price-grid">
            {overseasMarkets.map((item) => (
              <article key={item.metal} className="kh-price-card">
                <p className="kh-price-metal">{item.metal}</p>
                <p className="kh-price-spec">Friday close</p>
                <div className="kh-price-row">
                  <span>Spot close</span>
                  <strong>{item.close}</strong>
                </div>
                <p className="kh-gain-pill kh-gain-pill--down kh-price-change">
                  ↓ {item.change} weekly
                </p>
              </article>
            ))}
          </div>
          <p className="kh-prose kh-prose--spaced">
            Silver demonstrated higher downside beta due to its sensitivity to industrial demand
            and speculative positions.
          </p>
        </div>
      </section>

      <section id="drivers" className="gs-section kh-section">
        <div className="gs-panel kh-card">
          <div className="kh-card-head">
            <span className="kh-card-icon" aria-hidden="true">
              <IconInsight />
            </span>
            <div>
              <p className="kh-eyebrow">5. Key Market Drivers</p>
              <h2 className="kh-heading">What moved prices</h2>
            </div>
          </div>
          <div className="kh-driver-grid">
            {keyDrivers.map((item, index) => (
              <article key={item.title} className="kh-driver-card">
                <span className="kh-driver-num">{index + 1}</span>
                <h3>{item.title}</h3>
                <p>{item.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="outlook" className="gs-section kh-section">
        <div className="gs-panel kh-card kh-perspective-card">
          <div className="kh-card-head">
            <span className="kh-card-icon" aria-hidden="true">
              <IconBulb />
            </span>
            <div>
              <p className="kh-eyebrow">6. www.goldnsilver.shop Perspective</p>
              <h2 className="kh-heading">Four vectors of participation</h2>
            </div>
          </div>
          <p className="kh-prose">
            While short-term prices react to macro yields and rate expectations, investor
            participation across the four key vectors continues to scale.
          </p>
          <div className="kh-continuum">
            <h3>Gold &amp; Silver — Physical. Digital. Domestic. Global.</h3>
            <div className="kh-continuum-flow" aria-label="Four key vectors">
              {continuum.map((item, index) => (
                <span key={item} className="kh-continuum-step">
                  {index > 0 && (
                    <span className="kh-continuum-arrow" aria-hidden="true">
                      ➔
                    </span>
                  )}
                  <span className="kh-continuum-chip">{item}</span>
                </span>
              ))}
            </div>
            <p className="kh-continuum-site">www.goldnsilver.shop</p>
          </div>
          <p className="kh-prose kh-prose--spaced">
            Our Knowledge Hub delivers structural insights and transparency across India&apos;s
            precious metals ecosystem.
          </p>
        </div>
      </section>

      <section className="gs-section kh-section kh-disclaimer-wrap">
        <div className="kh-disclaimer">
          <strong>Investor Education &amp; Disclaimer</strong>
          <p>
            Indicative market data; subject to location, GST, premiums, and provider spreads.
            Published purely for informational and educational purposes; does not constitute
            financial or investment advice.
          </p>
        </div>
      </section>
    </div>
  );
};

export default KnowledgeHubPage;
