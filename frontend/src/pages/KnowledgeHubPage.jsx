import './PageShell.css';
import './KnowledgeHubPage.css';

const weeklyTrends = [
  { label: 'Gold', direction: 'down' },
  { label: 'Silver', direction: 'down' },
  { label: 'Digital', direction: 'down' },
  { label: 'Indian ETFs', direction: 'down' },
  { label: 'Global ETFs', direction: 'down' }
];

const physicalRows = [
  {
    metal: 'Gold (999 Purity / 10g)',
    previous: '₹1,59,578 (28 Aug)',
    current: '₹1,54,884 (04 Sep)',
    change: '▼ ₹4,694 (-2.94%)',
    down: true
  },
  {
    metal: 'Silver (999 Purity / 1kg)',
    previous: '₹2,43,892 (28 Aug)',
    current: '₹2,35,456 (04 Sep)',
    change: '▼ ₹8,436 (-3.46%)',
    down: true
  }
];

const etfRows = [
  {
    market: 'Domestic ETFs (India)',
    instrument: 'Gold BeES',
    previous: '₹130.85',
    current: '₹127.17',
    change: '▼ -2.81%',
    down: true
  },
  {
    market: 'Domestic ETFs (India)',
    instrument: 'Silver BeES',
    previous: '₹230.41',
    current: '₹222.78',
    change: '▼ -3.31%',
    down: true
  },
  {
    market: 'Overseas ETFs (US – USD)',
    instrument: 'SPDR Gold (GLD)',
    previous: '$408.89',
    current: '$406.77',
    change: '▼ -0.52%',
    down: true
  },
  {
    market: 'Overseas ETFs (US – USD)',
    instrument: 'iShares Silver (SLV)',
    previous: '$60.02',
    current: '$59.82',
    change: '▼ -0.33%',
    down: true
  }
];

const keyDrivers = [
  {
    title: 'US Jobs & Fed Outlook',
    text: 'Stronger US employment data heightened expectations of a prolonged tight Fed monetary stance, driving Treasury yields and the Dollar Index higher.'
  },
  {
    title: 'Geopolitics vs. Inflation',
    text: 'US-Iran tensions and Middle East energy supply risks pushed crude oil higher—creating safe-haven demand while simultaneously renewing rate-hike concerns.'
  },
  {
    title: "Silver's Dual Dynamics",
    text: "Silver's industrial role in solar energy, electronics, and green technology drives long-term structural value, though it introduces near-term volatility."
  }
];

const outlookWatch = [
  'US Inflation metrics (CPI/PPI) and Federal Reserve policy cues',
  'Movement in US Treasury Yields, Dollar Index (DXY), and USD-INR exchange rates',
  'Crude oil price trends, Middle East geopolitics, and Central Bank bullion purchasing'
];

const continuum = [
  'Physical Bullion',
  'Digital Gold & Silver',
  'ETFs',
  'Buyback',
  'Live Rates'
];

const sections = [
  { id: 'trends', label: 'Weekly Trends' },
  { id: 'physical', label: 'Physical Markets' },
  { id: 'digital', label: 'Digital Metals' },
  { id: 'etfs', label: 'ETF Performance' },
  { id: 'drivers', label: 'Market Drivers' },
  { id: 'outlook', label: 'Outlook' }
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
          <p className="gs-hero-kicker">Powered by www.goldnsilver.shop</p>
          <h1>Weekly Gold &amp; Silver Market Review</h1>
          <p className="gs-hero-copy">
            Volatile week driven by US rates, yields, the dollar, and geopolitics
          </p>
          <div className="gs-hero-meta">
            <p className="gs-hero-badge">WEEK ENDED 5 SEPTEMBER 2026</p>
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
                <span className="kh-trend-chip-arrow" aria-label="Down trend">
                  ▼
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
              <p className="kh-eyebrow">Market Overview</p>
              <h2 className="kh-heading">Corrective pressure across markets</h2>
            </div>
          </div>
          <p className="kh-prose">
            Gold and silver witnessed another volatile week, with prices reacting sharply to
            changing expectations on US interest rates, bond yields, the US dollar, and ongoing
            geopolitical tensions. Both metals experienced corrective pressure across physical and
            ETF markets.
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
              <p className="kh-eyebrow">1. Physical Gold &amp; Silver (India)</p>
              <h2 className="kh-heading">Domestic bullion performance</h2>
            </div>
          </div>
          <div className="kh-table-wrap">
            <table className="kh-table kh-table--benchmark">
              <thead>
                <tr>
                  <th scope="col">Metal</th>
                  <th scope="col">28 Aug</th>
                  <th scope="col">04 Sep</th>
                  <th scope="col">Weekly Change</th>
                </tr>
              </thead>
              <tbody>
                {physicalRows.map((row) => (
                  <tr key={row.metal}>
                    <td className="kh-cell-asset">{row.metal}</td>
                    <td>{row.previous}</td>
                    <td>{row.current}</td>
                    <td>
                      <span className={`kh-gain-pill${row.down ? ' kh-gain-pill--down' : ''}`}>
                        {row.change}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <section id="digital" className="gs-section kh-section">
        <div className="gs-panel kh-card">
          <div className="kh-card-head">
            <span className="kh-card-icon" aria-hidden="true">
              <IconInsight />
            </span>
            <div>
              <p className="kh-eyebrow">2. Digital Gold &amp; Digital Silver</p>
              <h2 className="kh-heading">Tracked domestic bullion pullbacks</h2>
            </div>
          </div>
          <p className="kh-prose">
            Source: IBJA (Excl. GST &amp; Retail Charges). Digital precious metals tracked the
            underlying domestic bullion pullbacks. While actual buy/sell rates vary across
            platforms due to spreads and GST, digital formats continue to offer seamless fractional
            accumulation without physical storage hurdles.
          </p>
        </div>
      </section>

      <section id="etfs" className="gs-section kh-section">
        <div className="gs-panel kh-card">
          <div className="kh-card-head">
            <span className="kh-card-icon" aria-hidden="true">
              <IconChart />
            </span>
            <div>
              <p className="kh-eyebrow">3 &amp; 4. Domestic vs. Overseas ETFs</p>
              <h2 className="kh-heading">ETF performance comparison</h2>
            </div>
          </div>
          <div className="kh-table-wrap">
            <table className="kh-table kh-table--benchmark">
              <thead>
                <tr>
                  <th scope="col">Market</th>
                  <th scope="col">Instrument</th>
                  <th scope="col">Previous</th>
                  <th scope="col">Current</th>
                  <th scope="col">Weekly Change</th>
                </tr>
              </thead>
              <tbody>
                {etfRows.map((row) => (
                  <tr key={`${row.market}-${row.instrument}`}>
                    <td className="kh-cell-asset">{row.market}</td>
                    <td>{row.instrument}</td>
                    <td>{row.previous}</td>
                    <td>{row.current}</td>
                    <td>
                      <span className={`kh-gain-pill${row.down ? ' kh-gain-pill--down' : ''}`}>
                        {row.change}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="kh-card--highlight kh-takeaway">
            <p className="kh-subhead">Key Strategic Insight</p>
            <p className="kh-prose">
              The performance gap between Indian and US ETFs underscores the strong impact of
              USD-INR exchange rate movements, local duty structures, and domestic physical demand
              premiums.
            </p>
          </div>
        </div>
      </section>

      <section id="drivers" className="gs-section kh-section">
        <div className="gs-panel kh-card">
          <div className="kh-card-head">
            <span className="kh-card-icon" aria-hidden="true">
              <IconInsight />
            </span>
            <div>
              <p className="kh-eyebrow">5. Key Market Drivers This Week</p>
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
              <p className="kh-eyebrow">6. Outlook &amp; Key Drivers to Watch</p>
              <h2 className="kh-heading">Coming week focus</h2>
            </div>
          </div>
          <ul className="kh-scorecard-meta">
            {outlookWatch.map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ul>
          <p className="kh-prose kh-prose--spaced">
            Explore integrated precious metals solutions at{' '}
            <strong>www.goldnsilver.shop</strong>.
          </p>

          <div className="kh-continuum">
            <h3>GoldnSilver.shop · Knowledge Hub</h3>
            <div className="kh-continuum-flow" aria-label="Platform access paths">
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
        </div>
      </section>

      <section className="gs-section kh-section kh-disclaimer-wrap">
        <div className="kh-disclaimer">
          <strong>Investor Education &amp; Disclaimer</strong>
          <p>
            Data based on publicly available market information. Prices are indicative and for
            educational purposes only. Not investment advice. Generated for GoldnSilver.shop.
          </p>
        </div>
      </section>
    </div>
  );
};

export default KnowledgeHubPage;
