import './PageShell.css';
import './KnowledgeHubPage.css';

const glanceItems = [
  {
    title: 'Gold',
    body: 'Early-week pullbacks were met with aggressive buying, lifting international gold to finish the week substantially higher above $4,680/oz.'
  },
  {
    title: 'Silver',
    body: 'The standout performer — after a sharp initial dip, silver staged a ferocious recovery to close near $68.95/oz (+7.3% on SLV).'
  },
  {
    title: 'India Market',
    body: 'Physical bullion, digital gold/silver, and domestic ETFs closely mirrored global moves, rebounding strongly into weekend trade.'
  },
  {
    title: 'Global ETFs',
    body: 'SPDR Gold Shares (GLD) gained ~5.7% overall for the week, while iShares Silver Trust (SLV) surged ~7.3%.'
  }
];

const goldFuturesRows = [
  { date: '17 Aug 2026', price: '4,473.70', change: '+0.82%', trajectory: 'Cautious Opening' },
  { date: '18 Aug 2026', price: '4,420.60', change: '-1.19%', trajectory: 'Brief Profit-Taking' },
  { date: '19 Aug 2026', price: '4,545.30', change: '+2.82%', trajectory: 'Strong Recovery Breakout' },
  { date: '20 Aug 2026', price: '4,571.40', change: '+0.57%', trajectory: 'Consolidation Gain' },
  { date: '21 Aug 2026', price: '4,680.60', change: '+2.39%', trajectory: 'Late-Week Rally' }
];

const silverEtfRows = [
  { date: '17 Aug 2026', nav: '223.5397', note: 'Baseline opening' },
  { date: '18 Aug 2026', nav: '221.5218', note: 'Initial pullback' },
  { date: '19 Aug 2026', nav: '216.9942', note: 'Weekly Low Point' },
  { date: '20 Aug 2026', nav: '225.6781', note: 'Rapid Rebound (+4.0%)' },
  { date: '21 Aug 2026', nav: '232.4846', note: 'Strong Extension (+3.0%)' }
];

const dipDrivers = [
  'Short-term trader profit-booking following prior multi-week gains',
  'Temporary firmness in U.S. Treasury yields',
  'Uncertainty preceding economic policy commentary'
];

const reboundDrivers = [
  {
    title: 'Interest Rate Expectations',
    text: 'Softening bond yields lowered opportunity costs for non-yielding bullion.'
  },
  {
    title: 'Central Bank Demand',
    text: 'Official sector purchases continued to provide a structural floor under global gold prices.'
  },
  {
    title: 'Safe-Haven & ETF Inflows',
    text: 'Escalating geopolitical frictions reignited flight-to-quality capital flows.'
  },
  {
    title: "Silver's Industrial Pull",
    text: 'Dual support from green technology demand combined with short-covering activity.'
  }
];

const dashboardRows = [
  {
    asset: 'Physical Gold (India)',
    trajectory: 'Rebounded off ₹1.55L to ₹1.60L / 10g',
    assessment: 'Strong'
  },
  {
    asset: 'Physical Silver (India)',
    trajectory: 'Bounced from ₹2.38L to ₹2.45L / kg',
    assessment: 'Volatile / Strong'
  },
  {
    asset: 'Digital Gold & Silver',
    trajectory: 'V-shaped recovery across platforms',
    assessment: 'Positive'
  },
  {
    asset: 'Indian Gold ETFs (Gold BeES)',
    trajectory: 'Broad-based rally to ~₹131.37 NAV',
    assessment: 'Strong'
  },
  {
    asset: 'Indian Silver ETFs',
    trajectory: 'Surged +7.1% off Wednesday low',
    assessment: 'Very Strong'
  },
  {
    asset: 'Overseas Gold (GLD)',
    trajectory: 'Closed at $424.32 (+5.7% weekly)',
    assessment: 'Strong'
  },
  {
    asset: 'Overseas Silver (SLV)',
    trajectory: 'Closed at $62.72 (+7.3% weekly)',
    assessment: 'Very Strong'
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
  { id: 'glance', label: 'Week at a Glance' },
  { id: 'physical', label: 'Physical Markets' },
  { id: 'digital', label: 'Digital Platforms' },
  { id: 'etfs', label: 'ETF Performance' },
  { id: 'drivers', label: 'Market Drivers' },
  { id: 'dashboard', label: 'Performance Dashboard' },
  { id: 'outlook', label: 'Outlook' }
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
          <p className="gs-hero-kicker">GoldnSilver.shop · Market Intelligence</p>
          <h1>Gold &amp; Silver Weekly Market Review</h1>
          <p className="gs-hero-copy">Sharp Correction, Stronger Comeback</p>
          <div className="gs-hero-meta">
            <p className="gs-hero-badge">WEEK ENDED 22 AUGUST 2026</p>
            <p className="gs-hero-badge kh-hero-badge--accent">PUBLISHED 23 AUG 2026</p>
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

      <section id="glance" className="gs-section kh-section">
        <div className="gs-panel kh-card">
          <div className="kh-card-head">
            <span className="kh-card-icon" aria-hidden="true">
              <IconBolt />
            </span>
            <div>
              <p className="kh-eyebrow">Week at a Glance</p>
              <h2 className="kh-heading">Week Ended 22 August 2026</h2>
            </div>
          </div>
          <div className="kh-scorecard-grid">
            {glanceItems.map((item) => (
              <article key={item.title} className="kh-scorecard-item">
                <h3>{item.title}</h3>
                <p>{item.body}</p>
              </article>
            ))}
          </div>
          <div className="kh-card--highlight kh-takeaway">
            <p className="kh-subhead">Key Takeaway</p>
            <p className="kh-prose">
              The week demonstrated why precious-metals investors should embrace short-term
              volatility and utilize systematic accumulation during dips rather than chasing
              sudden price breakouts.
            </p>
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
              <h2 className="kh-heading">Dip, then decisive rebound</h2>
            </div>
          </div>
          <p className="kh-prose">
            The week ended 22 August 2026 proved to be an eventful period across global and
            domestic precious-metals markets. Gold and silver initially encountered notable
            selling pressure as investors engaged in profit-taking and markets recalibrated
            expectations regarding US Federal Reserve monetary policy and Treasury yield
            movements. However, this weakness was short-lived.
          </p>
          <p className="kh-prose kh-prose--spaced">
            From mid-week onward, institutional and retail sentiment reversed decisively. Gold
            staged a robust rebound while silver moved aggressively higher, sparking a late-week
            surge across physical bullion, digital metal platforms, and Indian and global ETF
            products.
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
              <p className="kh-eyebrow">1. Physical Gold &amp; Silver</p>
              <h2 className="kh-heading">India &amp; International</h2>
            </div>
          </div>

          <h3 className="kh-subhead">Physical Gold</h3>
          <p className="kh-prose">
            MCX Gold commenced the week around ₹1,55,170 per 10 grams on 17 August. After
            international gold briefly pulled back on Tuesday, prices reversed forcefully. By
            Friday morning, domestic MCX Gold touched ₹1,60,180 per 10 grams, driven by global
            spot strength.
          </p>

          <p className="kh-subhead">International Gold Futures Trend ($/oz)</p>
          <div className="kh-table-wrap">
            <table className="kh-table">
              <thead>
                <tr>
                  <th scope="col">Date</th>
                  <th scope="col">Gold Futures ($/oz)</th>
                  <th scope="col">Daily Change (%)</th>
                  <th scope="col">Market Trajectory</th>
                </tr>
              </thead>
              <tbody>
                {goldFuturesRows.map((row) => (
                  <tr key={row.date}>
                    <td className="kh-cell-asset">{row.date}</td>
                    <td>{row.price}</td>
                    <td>
                      <span
                        className={`kh-gain-pill${
                          row.change.startsWith('-') ? ' kh-gain-pill--down' : ''
                        }`}
                      >
                        {row.change}
                      </span>
                    </td>
                    <td>{row.trajectory}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="kh-assessment">
            Weekly Assessment: <strong>Positive</strong> — Absorbed early selling and closed with
            powerful upward momentum.
          </p>

          <h3 className="kh-subhead">Physical Silver</h3>
          <p className="kh-prose">
            Silver demonstrated significantly higher beta. MCX Silver opened around ₹2,38,620 per
            kg on 17 August, corrected mid-week, and subsequently surged to ₹2,45,990 per kg by
            Friday. Spot silver ended the week near $68.95/oz.
          </p>
          <p className="kh-assessment">
            Weekly Assessment: <strong>Strong but Highly Volatile</strong> — Underscored silver&apos;s
            trait as a high-upside, high-volatility asset.
          </p>
        </div>
      </section>

      <section id="digital" className="gs-section kh-section">
        <div className="gs-panel kh-card">
          <div className="kh-card-head">
            <span className="kh-card-icon" aria-hidden="true">
              <IconBolt />
            </span>
            <div>
              <p className="kh-eyebrow">2. Digital Gold &amp; Silver Platforms</p>
              <h2 className="kh-heading">Pricing tracked physical swings</h2>
            </div>
          </div>
          <p className="kh-prose">
            Digital bullion pricing reflected the sharp underlying physical swings. Early-week
            discounts gave way to rapid upward re-pricing by Thursday and Friday.
          </p>
          <div className="kh-card--highlight kh-takeaway">
            <p className="kh-subhead">Investor Pricing Note</p>
            <p className="kh-prose">
              Actual customer pricing on digital platforms can vary based on provider buy/sell
              spreads, 3% GST, location, and vaulting charges. Investors should separate
              underlying spot rates from provider-quoted executable prices.
            </p>
          </div>
          <p className="kh-assessment">
            Weekly Assessment: <strong>Positive</strong> — Reaffirmed the utility of Systematic
            Investment Plans (SIPs) to average out mid-week volatility.
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
              <p className="kh-eyebrow">3. Exchange Traded Funds</p>
              <h2 className="kh-heading">Domestic &amp; overseas ETF performance</h2>
            </div>
          </div>

          <h3 className="kh-subhead">Domestic ETFs</h3>
          <p className="kh-prose">
            Indian Gold and Silver ETFs participated fully in the rebound. Nippon India ETF Gold
            BeES climbed to ~₹131.37 NAV on 21 August. Meanwhile, Nippon India Silver ETF
            showcased the dramatic &quot;fall first, surge later&quot; trajectory:
          </p>

          <p className="kh-subhead">Nippon India Silver ETF (NAV Movement)</p>
          <div className="kh-table-wrap">
            <table className="kh-table">
              <thead>
                <tr>
                  <th scope="col">Date</th>
                  <th scope="col">NAV (₹)</th>
                  <th scope="col">Daily Dynamic</th>
                </tr>
              </thead>
              <tbody>
                {silverEtfRows.map((row) => (
                  <tr key={row.date}>
                    <td className="kh-cell-asset">{row.date}</td>
                    <td>{row.nav}</td>
                    <td>{row.note}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="kh-assessment">
            Wednesday Low → Friday Close: <strong>~+7.1% surge</strong>, highlighting strong
            institutional buying off the lows.
          </p>

          <h3 className="kh-subhead">Overseas ETFs Tracking</h3>
          <p className="kh-prose">
            Global institutional flows turned heavily positive following Tuesday&apos;s dip:
          </p>
          <ul className="kh-scorecard-meta">
            <li>
              <strong>SPDR Gold Shares (GLD):</strong> Moved from a Tuesday low of $398.55 to
              finish at $424.32 on Friday — securing a +5.7% weekly gain relative to the prior
              week&apos;s close.
            </li>
            <li>
              <strong>iShares Silver Trust (SLV):</strong> Rebounded from a Tuesday low of $57.44
              to close at $62.72 on Friday — logging a +7.3% weekly gain.
            </li>
          </ul>
        </div>
      </section>

      <section id="drivers" className="gs-section kh-section">
        <div className="gs-panel kh-card">
          <div className="kh-card-head">
            <span className="kh-card-icon" aria-hidden="true">
              <IconInsight />
            </span>
            <div>
              <p className="kh-eyebrow">4. Core Market Drivers</p>
              <h2 className="kh-heading">Why the dip &amp; comeback?</h2>
            </div>
          </div>

          <h3 className="kh-subhead">Why Did Bullion Fall Initially?</h3>
          <p className="kh-prose">
            The early-week soft tone was driven by:
          </p>
          <ul className="kh-scorecard-meta">
            {dipDrivers.map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ul>

          <h3 className="kh-subhead">What Triggered the Powerful Rebound?</h3>
          <p className="kh-prose">
            From Wednesday onwards, broader market drivers shifted momentum decisively:
          </p>
          <div className="kh-driver-grid kh-driver-grid--four">
            {reboundDrivers.map((item, index) => (
              <article key={item.title} className="kh-driver-card">
                <span className="kh-driver-num">{index + 1}</span>
                <h3>{item.title}</h3>
                <p>{item.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="dashboard" className="gs-section kh-section">
        <div className="gs-panel kh-card">
          <div className="kh-card-head">
            <span className="kh-card-icon" aria-hidden="true">
              <IconChart />
            </span>
            <div>
              <p className="kh-eyebrow">5. Weekly Performance Dashboard</p>
              <h2 className="kh-heading">Asset segment scorecard</h2>
            </div>
          </div>
          <div className="kh-table-wrap">
            <table className="kh-table kh-table--benchmark">
              <thead>
                <tr>
                  <th scope="col">Asset Segment</th>
                  <th scope="col">Weekly Trajectory</th>
                  <th scope="col">Overall Assessment</th>
                </tr>
              </thead>
              <tbody>
                {dashboardRows.map((row) => (
                  <tr key={row.asset}>
                    <td className="kh-cell-asset">{row.asset}</td>
                    <td>{row.trajectory}</td>
                    <td>
                      <span className="kh-gain-pill">{row.assessment}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
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
              <p className="kh-eyebrow">6–7. Investor Insights &amp; Outlook</p>
              <h2 className="kh-heading">Gold vs Silver · Coming week</h2>
            </div>
          </div>

          <h3 className="kh-subhead">Gold vs. Silver: Key Investor Insights</h3>
          <div className="kh-driver-grid">
            <article className="kh-driver-card">
              <h3>Gold</h3>
              <p>
                Lower volatility, strong central-bank backing, and safe-haven stability. It
                serves as the foundational portfolio anchor.
              </p>
            </article>
            <article className="kh-driver-card">
              <h3>Silver</h3>
              <p>
                Higher beta, amplified percentage moves, and industrial growth tailwinds. It
                offers enhanced upside potential accompanied by wider price swings.
              </p>
            </article>
          </div>

          <h3 className="kh-subhead">Outlook for the Coming Week</h3>
          <p className="kh-prose">
            While the underlying secular trend remains constructive, investors should anticipate
            continued volatility. Key factors to monitor include US Federal Reserve policy
            commentary, Treasury yield movements, central bank demand updates, and ETF flow
            trends. Following such a rapid late-week surge, healthy consolidation or localized
            profit-booking should be expected.
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
            This weekly review is published solely for informational and educational purposes by
            GoldnSilver.shop. It should not be construed as financial or investment advice or a
            recommendation to buy or sell physical metals, ETFs, or digital bullion products.
            Bullion prices vary by region, provider, local taxes (3% GST), and vaulting fees.
          </p>
        </div>
      </section>
    </div>
  );
};

export default KnowledgeHubPage;
