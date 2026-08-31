import './PageShell.css';
import './KnowledgeHubPage.css';

const weeklyTrends = [
  { label: 'Gold', direction: 'down' },
  { label: 'Silver', direction: 'down' },
  { label: 'Digital', direction: 'down' },
  { label: 'Indian ETFs', direction: 'down' },
  { label: 'Global ETFs', direction: 'down' }
];

const performanceRows = [
  {
    category: 'Spot Gold (Intl)',
    instrument: 'International Spot (US$/oz)',
    previous: '~$4,696',
    current: '~$4,454 – $4,456',
    change: '▼ -3.4%',
    down: true
  },
  {
    category: 'Domestic Gold (India)',
    instrument: 'IBJA 24K (₹/10g)',
    previous: '₹1,62,603 (Mon)',
    current: '₹1,59,578 (Fri)',
    change: '▼ -1.9%',
    down: true
  },
  {
    category: 'Domestic Gold (India)',
    instrument: 'MCX Oct Futures (₹/10g)',
    previous: '—',
    current: '₹1,56,400 (MCX)',
    change: '▼ Soft / Import Duty Pressure',
    down: true
  },
  {
    category: 'Spot Silver (Intl)',
    instrument: 'International Spot (US$/oz)',
    previous: '~$69.00 – $71.00',
    current: '~$66.00',
    change: '▼ -3.0% to -4.0%',
    down: true
  },
  {
    category: 'Spot Silver (Intl)',
    instrument: 'MCX Sep Futures (₹/kg)',
    previous: '—',
    current: '₹2,36,651 (MCX)',
    change: '—',
    down: false
  },
  {
    category: 'Digital Bullion',
    instrument: 'Digital Gold (₹/g)',
    previous: '₹16,735 – ₹16,800',
    current: '~₹16,145',
    change: '▼',
    down: true
  },
  {
    category: 'Digital Bullion',
    instrument: 'Digital Silver',
    previous: '—',
    current: '—',
    change: '▼',
    down: true
  },
  {
    category: 'Domestic ETFs (India)',
    instrument: 'Nippon India Gold BeES (₹)',
    previous: '₹131.34 (21 Aug)',
    current: '₹130.83 (28 Aug)',
    change: '▼',
    down: true
  },
  {
    category: 'Domestic ETFs (India)',
    instrument: 'Nippon India Silver ETF (₹)',
    previous: '—',
    current: '₹226.37',
    change: '▼',
    down: true
  },
  {
    category: 'Overseas ETFs (US)',
    instrument: 'SPDR Gold Shares (GLD) ($)',
    previous: '$423.36 (21 Aug)',
    current: '$408.89 (28 Aug)',
    change: '▼ -3.4% (GLD)',
    down: true
  },
  {
    category: 'Overseas ETFs (US)',
    instrument: 'iShares Silver Trust (SLV) ($)',
    previous: '$62.72 (21 Aug)',
    current: '$60.02 (28 Aug)',
    change: '▼ -4.3% (SLV)',
    down: true
  }
];

const correctionDrivers = [
  {
    title: 'Physical & Digital Bullion Realignment',
    points: [
      'Gold surrendered earlier gains following a late-week sell-off triggered by hawkish Fed signals.',
      'Digital gold & silver tracked physical bullion immediately, emphasizing that accumulation via SIP/systematic investing mitigates volatility far better than market timing.'
    ]
  },
  {
    title: 'Domestic vs Global ETF Dynamics',
    points: [
      'Indian ETFs faced double pressure from international price drops and speculation surrounding bullion import duty reductions in India.',
      'Global US-listed ETFs (GLD, SLV) experienced sharper drawdowns reflecting direct dollar and yield movements.'
    ]
  }
];

const macroDrivers = [
  {
    title: 'Hawkish Jackson Hole',
    text: 'Fed Chair Kevin Warsh signaled interest rates could stay elevated to curb inflation.'
  },
  {
    title: 'Yields & USD Surge',
    text: 'Rising short-term Treasury yields and US Dollar strength triggered broad profit-taking.'
  },
  {
    title: 'Silver Industrial Drag',
    text: "Silver's dual nature (precious + industrial) magnified its downside risk during tightening fears."
  },
  {
    title: 'Indian Import Duty Rumors',
    text: 'Domestic ETF holders priced in potential duty cuts, accelerating local selling.'
  }
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
  { id: 'comparison', label: 'Performance Table' },
  { id: 'takeaways', label: 'Key Takeaways' },
  { id: 'outlook', label: 'Macro Outlook' }
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
          <p className="gs-hero-kicker">GoldnSilver.shop · Market Intelligence</p>
          <h1>Gold &amp; Silver Weekly Market Review</h1>
          <p className="gs-hero-copy">Comprehensive Performance Analysis</p>
          <div className="gs-hero-meta">
            <p className="gs-hero-badge">WEEK ENDED 29 AUGUST 2026</p>
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

      <section id="comparison" className="gs-section kh-section">
        <div className="gs-panel kh-card">
          <div className="kh-card-head">
            <span className="kh-card-icon" aria-hidden="true">
              <IconChart />
            </span>
            <div>
              <p className="kh-eyebrow">Visual Comparison Table</p>
              <h2 className="kh-heading">Asset Class Performance</h2>
            </div>
          </div>
          <div className="kh-table-wrap">
            <table className="kh-table kh-table--benchmark">
              <thead>
                <tr>
                  <th scope="col">Asset Category</th>
                  <th scope="col">Specific Metric / Instrument</th>
                  <th scope="col">Previous / Week Start</th>
                  <th scope="col">Current Close</th>
                  <th scope="col">Weekly Change</th>
                </tr>
              </thead>
              <tbody>
                {performanceRows.map((row) => (
                  <tr key={`${row.category}-${row.instrument}`}>
                    <td className="kh-cell-asset">{row.category}</td>
                    <td>{row.instrument}</td>
                    <td>{row.previous}</td>
                    <td>{row.current}</td>
                    <td>
                      {row.change !== '—' ? (
                        <span
                          className={`kh-gain-pill${
                            row.down ? ' kh-gain-pill--down' : ''
                          }`}
                        >
                          {row.change}
                        </span>
                      ) : (
                        '—'
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <section id="takeaways" className="gs-section kh-section">
        <div className="gs-panel kh-card">
          <div className="kh-card-head">
            <span className="kh-card-icon" aria-hidden="true">
              <IconInsight />
            </span>
            <div>
              <p className="kh-eyebrow">Key Market Takeaways</p>
              <h2 className="kh-heading">Correction Drivers</h2>
            </div>
          </div>
          {correctionDrivers.map((block, index) => (
            <article key={block.title} className="kh-scorecard-item kh-correction-block">
              <h3>
                {index + 1}. {block.title}
              </h3>
              <ul className="kh-scorecard-meta">
                {block.points.map((point) => (
                  <li key={point}>{point}</li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </section>

      <section id="outlook" className="gs-section kh-section">
        <div className="gs-panel kh-card kh-perspective-card">
          <div className="kh-card-head">
            <span className="kh-card-icon" aria-hidden="true">
              <IconBulb />
            </span>
            <div>
              <p className="kh-eyebrow">GoldnSilver.shop Perspective</p>
              <h2 className="kh-heading">Macro Outlook</h2>
            </div>
          </div>

          <div className="kh-driver-grid kh-driver-grid--four">
            {macroDrivers.map((item, index) => (
              <article key={item.title} className="kh-driver-card">
                <span className="kh-driver-num">{index + 1}</span>
                <h3>{item.title}</h3>
                <p>{item.text}</p>
              </article>
            ))}
          </div>

          <p className="kh-prose kh-prose--spaced">
            While short-term price swings will persist amid Fed policy shifts and currency
            fluctuations, the structural investment case remains robust. Gold continues to serve
            as an indispensable portfolio diversifier and inflation hedge, while Silver maintains
            powerful long-term backing from solar energy, EV electrification, and high-tech
            manufacturing.
          </p>
          <p className="kh-prose kh-prose--spaced">
            Viewing precious metals as an essential multi-format asset class (Physical | Digital
            | ETFs) enables disciplined long-term wealth creation.
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
            Market data for educational purposes only. Not financial or investment advice. Generated
            for GoldnSilver.shop. This weekly review should not be construed as a recommendation
            to buy or sell physical metals, ETFs, or digital bullion products. Bullion prices vary
            by region, provider, local taxes (3% GST), and vaulting fees.
          </p>
        </div>
      </section>
    </div>
  );
};

export default KnowledgeHubPage;
