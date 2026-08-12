import Home2Chrome from '../components/Home2Chrome';
import GsPageFooter from '../components/GsPageFooter';
import './PageShell.css';
import './KnowledgeHubPage.css';

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
      <Home2Chrome />

      <section className="gs-hero gs-hero--gradient kh-hero" aria-label="Market insights weekly review">
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
          <p className="gs-hero-kicker">GoldnSilver.shop · Market Insights</p>
          <h1>Gold &amp; Silver Weekly Review</h1>
          <p className="gs-hero-copy">Published by GoldnSilver.shop Research Desk</p>
          <div className="gs-hero-meta">
            <p className="gs-hero-badge">WEEK ENDED FRIDAY, 8 AUGUST 2026</p>
            <p className="gs-hero-badge kh-hero-badge--accent">
              Precious Metals Surge: Silver Takes The Lead
            </p>
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

      <section id="snapshot" className="gs-section kh-section">
        <div className="gs-panel kh-card">
          <div className="kh-card-head">
            <span className="kh-card-icon" aria-hidden="true">
              <IconChart />
            </span>
            <div>
              <p className="kh-eyebrow">Market Performance Snapshot</p>
              <h2 className="kh-heading">Week Ended 8 August 2026</h2>
            </div>
          </div>
          <div className="kh-table-wrap">
            <table className="kh-table">
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
                    <td className="kh-cell-asset">{row.asset}</td>
                    <td>
                      <span className="kh-gain-pill">{row.gain}</span>
                    </td>
                    <td>{row.drivers}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <section id="catalyst" className="gs-section kh-section">
        <div className="kh-card kh-card--highlight">
          <div className="kh-card-head">
            <span className="kh-card-icon kh-card-icon--accent" aria-hidden="true">
              <IconBolt />
            </span>
            <div>
              <p className="kh-eyebrow">Primary Catalyst</p>
              <h2 className="kh-heading">US Payrolls Shock</h2>
            </div>
          </div>
          <p className="kh-prose">
            US July Non-Farm Payrolls unexpectedly fell by 23,000 (vs +80,000 expected). This sharp
            contraction slashed rate-hike bets and triggered aggressive inflows into non-yielding
            safe-haven assets.
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
              <p className="kh-eyebrow">Market Dynamics &amp; Insights</p>
              <h2 className="kh-heading">360° View across Physical, Digital &amp; Paper Markets</h2>
            </div>
          </div>

          <p className="kh-subhead">Key Drivers</p>
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

      <section id="platform" className="gs-section kh-section">
        <div className="gs-panel kh-card kh-perspective-card">
          <div className="kh-card-head">
            <span className="kh-card-icon" aria-hidden="true">
              <IconBulb />
            </span>
            <div>
              <p className="kh-eyebrow">Platform View</p>
              <h2 className="kh-heading">How we read the week</h2>
            </div>
          </div>

          <div className="kh-platform-grid">
            {platformViews.map((item) => (
              <article key={item.title} className="kh-platform-item">
                <h3>{item.title}</h3>
                <p>{item.text}</p>
              </article>
            ))}
          </div>

          <div className="kh-continuum">
            <h3>The Unified Precious-Metals Continuum</h3>
            <div className="kh-continuum-flow" aria-label="Precious metals continuum">
              {continuum.map((item, index) => (
                <span key={item} className="kh-continuum-step">
                  {index > 0 && <span className="kh-continuum-arrow" aria-hidden="true">➔</span>}
                  <span className="kh-continuum-chip">{item}</span>
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="gs-section kh-section kh-disclaimer-wrap">
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

      <GsPageFooter />
    </div>
  );
};

export default KnowledgeHubPage;
