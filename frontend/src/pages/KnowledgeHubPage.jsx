import './PageShell.css';
import './KnowledgeHubPage.css';

const scorecardItems = [
  {
    emoji: '🥇',
    title: 'Physical Gold: High-Level Consolidation',
    body: 'Gold retained its previous momentum, holding firm around $4,380/oz after briefly touching $4,400. Profit-taking near $4,450–$4,500 capped immediate upside, but structural underlying support remains robust.',
    meta: [
      'Support: Rate pause expectations, safe-haven demand.',
      'MCX Gold: Moved from ₹1,49,490 to ~₹1,52,750 / 10g.',
      'Outlook: Positive / Consolidating.'
    ]
  },
  {
    emoji: '📱',
    title: 'Digital Bullion Ecosystem',
    body: 'Digital Gold and Silver mirrored physical market strength. Platforms like SafeGold, Augmont, and MMTC-PAMP continue to facilitate systematic, fractional accumulation.',
    meta: [
      'Ideal for small-ticket SIPs & physical conversion.',
      'Returns account for GST & provider spreads.'
    ]
  },
  {
    emoji: '🥈',
    title: 'Physical Silver: Weekly Winner (+2.5%)',
    body: 'Silver again outperformed Gold, rising to $64.88/oz (MCX ~₹2.34 Lakh/kg). It benefits from dual drivers: monetary safe-haven and booming industrial consumption.',
    meta: [
      'Demand Drivers: Solar PVs, EVs, Semiconductors, 5G.',
      'Volatility: High upside participation with sharper dips.',
      'Outlook: Bullish / Outperforming.'
    ]
  },
  {
    emoji: '📊',
    title: 'Institutional & Central Bank Flow',
    body: 'Official sectors continue building strategic reserves. Reuters reports central banks bought 289 tonnes in Q2 2026, with China adding 20 tonnes in July.',
    meta: [
      'GLD ETF: Closed up at $401.48 (+0.76%).',
      'SLV ETF: Tracked underlying metal strength.'
    ]
  }
];

const keyDrivers = [
  {
    title: 'US Fed Rate Outlook',
    text: 'July US inflation moderated to 3.4%. September Fed rate hike probability dropped from 55% to ~33%, reducing opportunity cost for non-yielding bullion.'
  },
  {
    title: 'Central Bank Diversification',
    text: 'Strategic shifting into physical gold as reserve insurance against currency risks and macro instability.'
  },
  {
    title: 'Middle East Risk & Energy Interaction',
    text: 'Strait of Hormuz tension drives safe-haven hedging, though elevated oil prices keep inflation/rate risks active.'
  },
  {
    title: 'Technical Levels to Watch',
    text: 'Gold resistance at $4,500; Silver testing psychological resistance at $65.00.'
  }
];

const benchmarkRows = [
  {
    asset: 'Intl. Spot Gold',
    previous: '~$4,336/oz',
    current: '~$4,380/oz',
    trend: '▲ ~1.0%',
    outlook: 'Consolidated near highs after strong rally'
  },
  {
    asset: 'Intl. Spot Silver',
    previous: '~$63.29/oz',
    current: '~$64.88/oz',
    trend: '▲ ~2.5%',
    outlook: 'Outperformed gold on industrial + monetary demand'
  },
  {
    asset: 'SPDR Gold Shares (GLD)',
    previous: '$398.47',
    current: '$401.48',
    trend: '▲ +0.76%',
    outlook: 'Steady ETF inflows backing physical metal'
  },
  {
    asset: 'Indian Gold (Physical/ MCX)',
    previous: '~₹1,49,490/10g',
    current: '~₹1,52,750/10g',
    trend: 'Positive',
    outlook: 'Supported by INR rates & global spot strength'
  },
  {
    asset: 'Indian Silver (Physical/ MCX)',
    previous: '~₹2,28,660/kg',
    current: '~₹2,34,480/kg',
    trend: 'Positive',
    outlook: 'Strong physical demand & industrial traction'
  },
  {
    asset: 'Digital Gold & Silver',
    previous: 'Market-linked',
    current: 'Market-linked',
    trend: 'Bullish',
    outlook: 'Seamless SIP & micro-accumulation tracking'
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
  { id: 'scorecard', label: 'Weekly Scorecard' },
  { id: 'drivers', label: 'Macro Drivers' },
  { id: 'benchmark', label: 'Benchmark Table' },
  { id: 'big-picture', label: 'Big Picture' }
];

const IconChart = () => (
  <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path d="M4 18V6M8 18V10M12 18V8M16 18V12M20 18V4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

const IconBolt = () => (
  <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path d="M13 2L4 14h7l-1 8 9-12h-7l1-8z" stroke="currentColor" strokeWidth="1.75" strokeLinejoin="round" />
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
          <p className="gs-hero-kicker">GoldnSilver.shop</p>
          <h1>Weekly Intelligence</h1>
          <p className="gs-hero-copy">ONE PLATFORM • MULTIPLE WAYS TO ACCESS BULLION</p>
          <div className="gs-hero-meta">
            <p className="gs-hero-badge">WEEK ENDED 15 AUGUST 2026</p>
            <p className="gs-hero-badge kh-hero-badge--accent">REF: 14 AUG 2026</p>
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

      <section id="scorecard" className="gs-section kh-section">
        <div className="gs-panel kh-card">
          <div className="kh-card-head">
            <span className="kh-card-icon" aria-hidden="true">
              <IconBolt />
            </span>
            <div>
              <p className="kh-eyebrow">Weekly Market Scorecard</p>
              <h2 className="kh-heading">Week Ended 15 August 2026 (Ref: 14 Aug)</h2>
            </div>
          </div>
          <div className="kh-scorecard-grid">
            {scorecardItems.map((item) => (
              <article key={item.title} className="kh-scorecard-item">
                <h3>
                  <span aria-hidden="true">{item.emoji}</span> {item.title}
                </h3>
                <p>{item.body}</p>
                <ul className="kh-scorecard-meta">
                  {item.meta.map((line) => (
                    <li key={line}>{line}</li>
                  ))}
                </ul>
              </article>
            ))}
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
              <p className="kh-eyebrow">Key Macro &amp; Geopolitical Drivers</p>
              <h2 className="kh-heading">What moved markets this week</h2>
            </div>
          </div>
          <div className="kh-driver-grid kh-driver-grid--four">
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

      <section id="benchmark" className="gs-section kh-section">
        <div className="gs-panel kh-card">
          <div className="kh-card-head">
            <span className="kh-card-icon" aria-hidden="true">
              <IconChart />
            </span>
            <div>
              <p className="kh-eyebrow">Asset Class Benchmark</p>
              <h2 className="kh-heading">Previous (07 Aug) vs Current (14 Aug)</h2>
            </div>
          </div>
          <div className="kh-table-wrap">
            <table className="kh-table kh-table--benchmark">
              <thead>
                <tr>
                  <th scope="col">Asset Class / Benchmark</th>
                  <th scope="col">Previous (07 Aug)</th>
                  <th scope="col">Current (14 Aug)</th>
                  <th scope="col">Weekly Trend</th>
                  <th scope="col">Key Driver / Outlook</th>
                </tr>
              </thead>
              <tbody>
                {benchmarkRows.map((row) => (
                  <tr key={row.asset}>
                    <td className="kh-cell-asset">{row.asset}</td>
                    <td>{row.previous}</td>
                    <td>{row.current}</td>
                    <td>
                      <span className="kh-gain-pill">{row.trend}</span>
                    </td>
                    <td>{row.outlook}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <section id="big-picture" className="gs-section kh-section">
        <div className="gs-panel kh-card kh-perspective-card">
          <div className="kh-card-head">
            <span className="kh-card-icon" aria-hidden="true">
              <IconBulb />
            </span>
            <div>
              <p className="kh-eyebrow">The Big Picture for Investors</p>
              <h2 className="kh-heading">Resilience at peak levels</h2>
            </div>
          </div>
          <p className="kh-prose">
            Precious metals demonstrated exceptional resilience by consolidating at peak levels rather
            than surrendering gains. Gold offers portfolio stability and wealth preservation, while
            Silver delivers dual exposure to monetary tailwinds and industrial growth. Balanced
            allocation across physical, digital, and ETF formats remains recommended.
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
          <strong>Disclaimer</strong>
          <p>
            Educational market update, not financial advice. This publication is compiled by
            GoldnSilver.shop for informational purposes only and does not constitute investment or
            legal advice. Precious metal investments carry risk. Investors should conduct independent
            evaluation and consult certified advisors before making decisions.
          </p>
        </div>
      </section>
    </div>
  );
};

export default KnowledgeHubPage;
