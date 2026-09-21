import './PageShell.css';
import './KnowledgeHubPage.css';

const weeklyTrends = [
  { label: 'MCX Gold', direction: 'up', aria: 'Weekly gain 2.0 percent' },
  { label: 'Spot Gold', direction: 'up', aria: 'One-week high, up 1.2 percent' },
  { label: 'Spot Silver', direction: 'up', aria: 'Friday surge 2.3 percent' },
  { label: 'Crude Oil', direction: 'down', aria: 'Lower crude eased inflation concerns' }
];

const snapshotCards = [
  {
    metal: 'MCX Gold (Oct 2026)',
    spec: 'Domestic futures · India',
    rows: [
      { label: 'Friday close', value: '₹1,54,263 / 10g' },
      { label: 'Monday close', value: '₹1,51,230' },
      { label: 'Friday high', value: '₹1,54,600' },
      { label: 'Friday move', value: '+0.84%' }
    ],
    change: '+2.0% weekly gain',
    down: false
  },
  {
    metal: 'Spot Gold',
    spec: 'International · 1-week high',
    rows: [
      { label: 'Friday close', value: '$4,390.11 / oz' },
      { label: 'Weekly move', value: '+1.2%' }
    ],
    change: '1-week high',
    down: false
  },
  {
    metal: 'Spot Silver',
    spec: 'International · higher volatility vs gold',
    rows: [
      { label: 'Friday close', value: '$66.70 / oz' },
      { label: 'Friday move', value: '+2.3%' }
    ],
    change: '+2.3% Friday surge',
    down: false
  }
];

const macroDrivers = [
  {
    title: 'Weekly Trajectory',
    text: 'Early weakness gave way to Fed-related volatility, a late-week recovery, and a strong Friday close.'
  },
  {
    title: 'US Federal Reserve',
    text: 'The Fed raised rates by 25 basis points to 3.75%–4.00% and signaled further tightening remains possible. Higher rates typically pressure non-yielding metals, but market dynamics shifted as the week progressed.'
  },
  {
    title: 'Oil & Yields',
    text: 'Lower crude oil prices eased inflation concerns. Coupled with favorable US Treasury yield moves, gold and silver decoupled from rate fears and closed the week higher.'
  }
];

const hallmarkRows = [
  {
    metal: 'Gold articles',
    previous: '₹45 / article',
    revised: '₹75 / article',
    change: '+66.7%',
    consignment: '₹200 per consignment'
  },
  {
    metal: 'Silver articles',
    previous: '₹35 / article',
    revised: '₹35 / article',
    change: 'Unchanged',
    consignment: '₹150 per consignment'
  }
];

const nextWeekWatch = [
  {
    title: 'Fed commentary',
    text: 'Hawkish tone versus market expectations after the 25 bp hike.'
  },
  {
    title: 'Yields & USD',
    text: 'US Dollar Index and 10-year Treasury yield shifts.'
  },
  {
    title: 'Crude & geopolitics',
    text: 'Oil price trends and Middle East risk premia.'
  },
  {
    title: 'Domestic trends',
    text: 'USD/INR levels and festive physical demand in India.'
  },
  {
    title: 'Investment flows',
    text: 'ETF inflows and industrial silver usage.'
  }
];

const platformWays = [
  'Physical Bullion',
  'Digital Gold & Silver',
  'Indian & Overseas ETFs',
  'Gold Loans',
  'Instant Buyback'
];

const sections = [
  { id: 'trends', label: 'Weekly Trends' },
  { id: 'snapshot', label: 'Price Snapshot' },
  { id: 'dynamics', label: 'Market Dynamics' },
  { id: 'hallmarking', label: 'BIS Hallmarking' },
  { id: 'experts', label: 'Analyst Views' },
  { id: 'outlook', label: 'Next Week' },
  { id: 'perspective', label: 'Perspective' }
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
            Robust Friday rally after the Fed hike, helped by softer crude oil and bond-yield moves
          </p>
          <div className="gs-hero-meta">
            <p className="gs-hero-badge">ENDED 18 SEP 2026</p>
            <p className="gs-hero-badge kh-hero-badge--accent">FINAL FRIDAY CLOSE</p>
          </div>
          <p className="kh-hero-published">Published Saturday, 19 September 2026</p>
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
              <h2 className="kh-heading">A strong Friday close</h2>
            </div>
          </div>
          <p className="kh-prose">
            Precious metals staged a robust end-of-week rally, overcoming initial pressure from the
            US Federal Reserve&apos;s rate hike. Supportive tailwinds from declining crude oil
            prices and bond-yield movements enabled both gold and silver to record strong Friday
            gains.
          </p>
        </div>
      </section>

      <section id="snapshot" className="gs-section kh-section">
        <div className="gs-panel kh-card">
          <div className="kh-card-head">
            <span className="kh-card-icon" aria-hidden="true">
              <IconChart />
            </span>
            <div>
              <p className="kh-eyebrow">Price Snapshot</p>
              <h2 className="kh-heading">Domestic gold, global gold &amp; silver</h2>
            </div>
          </div>
          <div className="kh-price-grid">
            {snapshotCards.map((item) => (
              <article key={item.metal} className="kh-price-card">
                <p className="kh-price-metal">{item.metal}</p>
                <p className="kh-price-spec">{item.spec}</p>
                {item.rows.map((row) => (
                  <div key={row.label} className="kh-price-row">
                    <span>{row.label}</span>
                    <strong>{row.value}</strong>
                  </div>
                ))}
                <p className={`kh-gain-pill kh-price-change${item.down ? ' kh-gain-pill--down' : ''}`}>
                  {item.down ? '↓' : '↑'} {item.change}
                </p>
              </article>
            ))}
          </div>
          <p className="kh-prose kh-prose--spaced">
            Silver&apos;s dual role as a safe-haven asset and an industrial commodity kept it more
            volatile than gold. Rates exclude GST and making charges.
          </p>
        </div>
      </section>

      <section id="dynamics" className="gs-section kh-section">
        <div className="gs-panel kh-card">
          <div className="kh-card-head">
            <span className="kh-card-icon" aria-hidden="true">
              <IconInsight />
            </span>
            <div>
              <p className="kh-eyebrow">1. Market Dynamics &amp; Macroeconomic Drivers</p>
              <h2 className="kh-heading">What moved prices</h2>
            </div>
          </div>
          <div className="kh-driver-grid">
            {macroDrivers.map((item, index) => (
              <article key={item.title} className="kh-driver-card">
                <span className="kh-driver-num">{index + 1}</span>
                <h3>{item.title}</h3>
                <p>{item.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="hallmarking" className="gs-section kh-section">
        <div className="gs-panel kh-card">
          <div className="kh-card-head">
            <span className="kh-card-icon" aria-hidden="true">
              <IconChart />
            </span>
            <div>
              <p className="kh-eyebrow">2. Key Domestic Development</p>
              <h2 className="kh-heading">BIS hallmarking fee revision</h2>
            </div>
          </div>
          <p className="kh-prose">
            The Bureau of Indian Standards formally notified the BIS (Hallmarking) Amendment
            Regulations, 2026 on 14 September 2026 (widely reported 16–18 September). Gold article
            hallmarking fees rose; silver article fees were left unchanged.
          </p>
          <div className="kh-table-wrap">
            <table className="kh-table kh-table--fees">
              <caption className="kh-table-caption">BIS hallmarking fees</caption>
              <thead>
                <tr>
                  <th scope="col">Metal type</th>
                  <th scope="col">Previous fee</th>
                  <th scope="col">Revised fee</th>
                  <th scope="col">Change</th>
                  <th scope="col">Min. consignment fee</th>
                </tr>
              </thead>
              <tbody>
                {hallmarkRows.map((row) => (
                  <tr key={row.metal}>
                    <td className="kh-cell-asset">{row.metal}</td>
                    <td>{row.previous}</td>
                    <td>{row.revised}</td>
                    <td>
                      <span
                        className={`kh-gain-pill${row.change === 'Unchanged' ? ' kh-gain-pill--neutral' : ''}`}
                      >
                        {row.change}
                      </span>
                    </td>
                    <td>{row.consignment}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="kh-card--highlight kh-takeaway">
            <p className="kh-subhead">Festive &amp; wedding season</p>
            <p className="kh-prose">
              The revision is highly relevant ahead of India&apos;s peak festive and wedding buying
              season, underscoring independent purity verification for jewellery and bullion
              articles.
            </p>
          </div>
        </div>
      </section>

      <section id="experts" className="gs-section kh-section">
        <div className="gs-panel kh-card">
          <div className="kh-card-head">
            <span className="kh-card-icon" aria-hidden="true">
              <IconInsight />
            </span>
            <div>
              <p className="kh-eyebrow">3. Expert &amp; Analyst Views</p>
              <h2 className="kh-heading">Oil as a catalyst, structure still supportive</h2>
            </div>
          </div>
          <div className="kh-scorecard-grid">
            <article className="kh-scorecard-item">
              <h3>Crude oil catalyst</h3>
              <p>
                OANDA Senior Market Analyst Kelvin Wong emphasized crude oil as a primary driver.
                Sustained weakness in oil prices reduces inflationary drag and offers medium-term
                structural support for gold.
              </p>
            </article>
            <article className="kh-scorecard-item">
              <h3>Structural support</h3>
              <p>
                International analysts continue to highlight central bank purchasing, geopolitical
                risks, and sustained retail interest, offset against elevated yields and dollar
                strength.
              </p>
            </article>
          </div>
        </div>
      </section>

      <section id="outlook" className="gs-section kh-section">
        <div className="gs-panel kh-card">
          <div className="kh-card-head">
            <span className="kh-card-icon" aria-hidden="true">
              <IconChart />
            </span>
            <div>
              <p className="kh-eyebrow">4. Key Indicators for Next Week</p>
              <h2 className="kh-heading">What to watch</h2>
            </div>
          </div>
          <div className="kh-driver-grid">
            {nextWeekWatch.map((item, index) => (
              <article key={item.title} className="kh-driver-card">
                <span className="kh-driver-num">{index + 1}</span>
                <h3>{item.title}</h3>
                <p>{item.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="perspective" className="gs-section kh-section">
        <div className="gs-panel kh-card kh-perspective-card">
          <div className="kh-card-head">
            <span className="kh-card-icon" aria-hidden="true">
              <IconBulb />
            </span>
            <div>
              <p className="kh-eyebrow">goldnsilver.shop Perspective</p>
              <h2 className="kh-heading">One platform. Every way to own gold &amp; silver.</h2>
            </div>
          </div>
          <p className="kh-prose">
            The modern precious metals ecosystem has expanded far beyond traditional physical
            bullion and jewellery. Investors now navigate digital accumulation, ETFs, loans,
            buybacks, and physical deliverability. At goldnsilver.shop, our objective is to unify
            this ecosystem under a single platform.
          </p>
          <div className="kh-continuum">
            <h3>Physical. Digital. ETFs. Loans. Buyback.</h3>
            <div className="kh-continuum-flow" aria-label="Ways to own gold and silver">
              {platformWays.map((item, index) => (
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
        </div>
      </section>

      <section className="gs-section kh-section kh-disclaimer-wrap">
        <div className="kh-disclaimer">
          <strong>Investor Education &amp; Disclaimer</strong>
          <p>
            Live market information is provided for educational and informational purposes only and
            should not be considered investment advice. Indicative data may vary by location, GST,
            premiums, and provider spreads.
          </p>
        </div>
      </section>
    </div>
  );
};

export default KnowledgeHubPage;
