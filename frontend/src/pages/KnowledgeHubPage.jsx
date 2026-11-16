import './PageShell.css';
import './KnowledgeHubPage.css';

const glance = [
  { value: 'US$3,880', label: 'Intl. gold, late Friday / oz · about −4.5%' },
  { value: 'US$49', label: 'Silver futures / oz · about −5.4%' },
  { value: '₹1,34,880', label: 'India 999 gold, Friday morning / 10g' },
  { value: '₹1,77,500', label: 'India 999 silver, Friday morning / kg' }
];

const snapshotRows = [
  {
    asset: 'International gold',
    level: 'Near US$3,880 / oz',
    direction: '▼ about 4.5%',
    down: true,
    driver: 'Renewed selling in late-Friday trading after last week’s recovery.'
  },
  {
    asset: 'Silver futures',
    level: 'Near US$49 / oz',
    direction: '▼ about 5.4%',
    down: true,
    driver: 'Futures lost ground as inflation and rate expectations weighed on sentiment.'
  },
  {
    asset: 'India 999 gold',
    level: '₹1,34,880 / 10g',
    direction: '▼ Softer',
    down: true,
    driver: 'Friday morning indicative rate, before taxes and charges. Not a weekly close or jewellery quote.'
  },
  {
    asset: 'India 999 silver',
    level: '₹1,77,500 / kg',
    direction: '▼ Softer',
    down: true,
    driver: 'Friday morning indicative rate, before taxes and charges. Not a weekly close.'
  }
];

const goldDrivers = [
  {
    title: 'Selling pressure returned',
    text: 'After four weeks of weakness and last week’s recovery, gold and silver faced renewed selling.'
  },
  {
    title: 'Gold gave back ground',
    text: 'Gold was down about 4.5% for the week in late-Friday trading, near US$3,880 an ounce.'
  },
  {
    title: 'Silver fell further',
    text: 'Silver futures lost approximately 5.4%, finishing near US$49 an ounce.'
  }
];

const digitalPoints = [
  {
    title: 'Small tickets, same price risk',
    text: 'Digital ownership is convenient for small amounts, and it remains exposed to bullion-price declines.'
  },
  {
    title: 'Compare the full terms',
    text: 'Look at provider buy and sell spreads, taxes, custody, storage, and redemption terms. Availability can differ for gold and silver.'
  },
  {
    title: 'Not the same as a gold ETF',
    text: 'Digital gold should be distinguished from SEBI-regulated gold ETFs.'
  }
];

const takeaways = [
  {
    title: 'October inflows, this week’s prices',
    text: 'Global gold ETFs attracted US$2.7 billion in October, led by Europe, even as gold prices fell. That is monthly data, not this review week.'
  },
  {
    title: 'Extra checks for Indian investors',
    text: 'USD/INR movements, fund costs, and applicable overseas-investment rules sit on top of the metal price.'
  },
  {
    title: 'Still rate-sensitive',
    text: 'Overseas bullion funds remain sensitive to metal prices and US interest rates.'
  }
];

const outlook = [
  {
    title: 'Inflation is not an automatic lift',
    text: 'Higher inflation does not automatically lift gold. Rising yields and a stronger dollar can initially outweigh its appeal.'
  },
  {
    title: 'Silver has a second driver',
    text: 'Silver also depends on industrial demand, not only on the same forces that move gold.'
  },
  {
    title: 'What to watch',
    text: 'US policy signals, bond yields, USD/INR, geopolitical developments, and ETF flows. Last week’s rebound has yet to establish a durable recovery.'
  }
];

const platformWays = [
  'Physical Bullion',
  'Digital Gold & Silver',
  'Indian ETFs',
  'Global ETFs',
  'Gold Loans',
  'Buyback'
];

const sections = [
  { id: 'glance', label: 'Week at a Glance' },
  { id: 'gold', label: 'International Markets' },
  { id: 'silver', label: 'India Physical' },
  { id: 'digital', label: 'Digital Metals' },
  { id: 'etfs', label: 'Domestic ETFs' },
  { id: 'macro', label: 'Overseas ETFs' },
  { id: 'domestic', label: 'Economy & Policy' },
  { id: 'outlook', label: 'Our View' }
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

const ChangePill = ({ value, down }) => (
  <span className={down ? 'kh-gain-pill kh-gain-pill--down' : 'kh-gain-pill'}>{value}</span>
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
          <p className="gs-hero-kicker">Weekly market review</p>
          <h1>Gold &amp; Silver: Decline Resumes After Last Week’s Recovery</h1>
          <p className="gs-hero-copy">
            After four weeks of weakness and last week’s recovery, gold and silver faced renewed
            selling pressure in the week ended 14 November 2026. Inflation, a firm US dollar, and
            expectations of higher interest rates weighed on sentiment.
          </p>
          <div className="gs-hero-meta">
            <p className="gs-hero-badge">WEEK ENDED 14 NOV 2026</p>
            <p className="gs-hero-badge kh-hero-badge--accent">GOLD −4.5% · SILVER −5.4%</p>
          </div>
          <p className="kh-hero-published">
            GoldnSilver.shop · Nihar Info Global Limited (BSE Listed: 531083)
          </p>
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
              <IconChart />
            </span>
            <div>
              <p className="kh-eyebrow">Week ended 14 November 2026</p>
              <h2 className="kh-heading">Week at a glance</h2>
            </div>
          </div>
          <div className="kh-price-grid kh-price-grid--two">
            {glance.map((item) => (
              <article key={item.label} className="kh-price-card">
                <p className="kh-price-metal">{item.value}</p>
                <p className="kh-price-spec">{item.label}</p>
              </article>
            ))}
          </div>
          <div className="kh-table-wrap">
            <table className="kh-table">
              <caption className="kh-table-caption">
                International prices are late-Friday observations. Indian rates are Friday morning indicative bullion prices, before taxes and charges, and are not weekly closing rates or jewellery quotations.
              </caption>
              <thead>
                <tr>
                  <th scope="col">Segment</th>
                  <th scope="col">Current level</th>
                  <th scope="col">Performance</th>
                  <th scope="col">Key drivers</th>
                </tr>
              </thead>
              <tbody>
                {snapshotRows.map((row) => (
                  <tr key={row.asset}>
                    <td className="kh-cell-asset">{row.asset}</td>
                    <td>{row.level}</td>
                    <td>
                      <ChangePill value={row.direction} down={row.down} />
                    </td>
                    <td>{row.driver}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <section id="gold" className="gs-section kh-section">
        <div className="gs-panel kh-card">
          <div className="kh-card-head">
            <span className="kh-card-icon" aria-hidden="true">
              <IconChart />
            </span>
            <div>
              <p className="kh-eyebrow">1. International prices</p>
              <h2 className="kh-heading">The week’s recovery was given back</h2>
            </div>
          </div>
          <p className="kh-prose">
            Gold was down about 4.5% for the week in late-Friday trading, near US$3,880 an ounce.
            Silver futures lost approximately 5.4%, finishing near US$49 an ounce. Inflation, a firm
            US dollar, and expectations of higher interest rates weighed on sentiment.
          </p>
          <div className="kh-driver-grid">
            {goldDrivers.map((item, index) => (
              <article key={item.title} className="kh-driver-card">
                <span className="kh-driver-num">{index + 1}</span>
                <h3>{item.title}</h3>
                <p>{item.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="silver" className="gs-section kh-section">
        <div className="gs-panel kh-card">
          <div className="kh-card-head">
            <span className="kh-card-icon" aria-hidden="true">
              <IconInsight />
            </span>
            <div>
              <p className="kh-eyebrow">2. Physical gold and silver — India</p>
              <h2 className="kh-heading">Domestic bullion prices softened</h2>
            </div>
          </div>
          <p className="kh-prose">
            Friday morning indicative rates were approximately ₹1,34,880 per 10 grams for 999 gold
            and ₹1,77,500 per kilogram for 999 silver, before applicable taxes and charges. These
            are not final weekly closing rates and they are not retail jewellery quotations.
          </p>
          <p className="kh-prose kh-prose--spaced">
            Compare purity, premiums, making charges, and buyback deductions alongside the metal price.
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
              <p className="kh-eyebrow">3. Digital gold and silver</p>
              <h2 className="kh-heading">Convenient to buy, still tied to the metal price</h2>
            </div>
          </div>
          <p className="kh-prose">
            Digital ownership offers convenient small-ticket accumulation, but it remains exposed
            to bullion-price declines. Digital gold and silver availability can differ. Compare
            provider-specific buy and sell spreads, taxes, custody, storage, and redemption terms.
          </p>
          <div className="kh-driver-grid">
            {digitalPoints.map((item, index) => (
              <article key={item.title} className="kh-driver-card">
                <span className="kh-driver-num">{index + 1}</span>
                <h3>{item.title}</h3>
                <p>{item.text}</p>
              </article>
            ))}
          </div>
          <div className="kh-disclaimer kh-takeaway">
            <strong>Investor note</strong>
            <p>
              Digital gold should also be distinguished from SEBI-regulated gold ETFs. Spreads,
              taxes, custody, and redemption terms change what an investor actually receives.
            </p>
          </div>
        </div>
      </section>

      <section id="etfs" className="gs-section kh-section">
        <div className="gs-panel kh-card">
          <div className="kh-card-head">
            <span className="kh-card-icon" aria-hidden="true">
              <IconChart />
            </span>
            <div>
              <p className="kh-eyebrow">4. Domestic gold and silver ETFs</p>
              <h2 className="kh-heading">Selling pressure, with October inflows still positive</h2>
            </div>
          </div>
          <p className="kh-prose">
            Indian precious-metal ETFs faced selling pressure this week. October net inflows
            remained positive: approximately ₹3,474 crore into gold ETFs and ₹3,092 crore into
            silver ETFs. Those are monthly figures, not flows for this review week. Continued
            investment interest does not guarantee an immediate recovery.
          </p>
          <div className="kh-trend-card kh-takeaway">
            <p className="kh-eyebrow">Why ETF returns can differ</p>
            <h3 className="kh-subhead">Liquidity, tracking, expenses, and price versus NAV</h3>
            <p className="kh-assessment">
              Compare liquidity, tracking difference, expenses, and the market price against the
              indicative NAV. A fund’s return can differ from the move in the metal itself.
            </p>
          </div>
        </div>
      </section>

      <section id="macro" className="gs-section kh-section">
        <div className="gs-panel kh-card">
          <div className="kh-card-head">
            <span className="kh-card-icon" aria-hidden="true">
              <IconInsight />
            </span>
            <div>
              <p className="kh-eyebrow">5. Overseas gold and silver ETFs</p>
              <h2 className="kh-heading">Still sensitive to metal prices and US rates</h2>
            </div>
          </div>
          <p className="kh-prose">
            Overseas bullion funds remain sensitive to metal prices and US interest rates. Global
            gold ETFs attracted US$2.7 billion in October, led by Europe, despite falling gold
            prices. Indian investors must also consider USD/INR movements, fund costs, and
            applicable overseas-investment rules.
          </p>
          <div className="kh-driver-grid">
            {takeaways.map((item, index) => (
              <article key={item.title} className="kh-driver-card">
                <span className="kh-driver-num">{index + 1}</span>
                <h3>{item.title}</h3>
                <p>{item.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="domestic" className="gs-section kh-section">
        <div className="gs-panel kh-card">
          <div className="kh-card-head">
            <span className="kh-card-icon" aria-hidden="true">
              <IconChart />
            </span>
            <div>
              <p className="kh-eyebrow">6. Economy and policy</p>
              <h2 className="kh-heading">Inflation rose, and housing data did not lift gold</h2>
            </div>
          </div>
          <p className="kh-prose">
            India’s October retail inflation rose to 6.09%, from 5.54% in September. US existing-home
            sales fell 5.5% to an annualised 3.75 million, below expectations. Kitco reported gold
            near US$3,864 an ounce following Thursday’s release. That quotation is a snapshot, not
            the weekly close. Gold’s continued weakness despite the disappointing housing data
            suggests inflation and interest-rate concerns outweighed potential support from slower
            growth.
          </p>
        </div>
      </section>

      <section id="outlook" className="gs-section kh-section">
        <div className="gs-panel kh-card">
          <div className="kh-card-head">
            <span className="kh-card-icon" aria-hidden="true">
              <IconChart />
            </span>
            <div>
              <p className="kh-eyebrow">7. The week ahead</p>
              <h2 className="kh-heading">The rebound has not become a recovery yet</h2>
            </div>
          </div>
          <div className="kh-driver-grid">
            {outlook.map((item, index) => (
              <article key={item.title} className="kh-driver-card">
                <span className="kh-driver-num">{index + 1}</span>
                <h3>{item.title}</h3>
                <p>{item.text}</p>
              </article>
            ))}
          </div>
          <div className="kh-trend-card kh-takeaway">
            <p className="kh-eyebrow">Our view</p>
            <h3 className="kh-subhead">Watch policy, yields, the rupee, and flows</h3>
            <p className="kh-assessment">
              Higher inflation does not automatically lift gold. Last week’s rebound has yet to
              establish a durable recovery. This is educational commentary, not personalised
              investment advice.
            </p>
          </div>
        </div>
      </section>

      <section className="gs-section kh-section">
        <div className="gs-panel kh-card kh-perspective-card">
          <div className="kh-card-head">
            <span className="kh-card-icon" aria-hidden="true">
              <IconBulb />
            </span>
            <div>
              <p className="kh-eyebrow">Published by</p>
              <h2 className="kh-heading">Nihar Info Global Limited</h2>
            </div>
          </div>
          <p className="kh-prose">
            GoldnSilver.shop is an initiative of Nihar Info Global Limited (BSE Listed: 531083).
            The platform spans physical bullion, digital gold and silver, ETF distribution, gold-loan
            referrals, and buyback. Follow GoldnSilver for weekly reviews in English, Telugu, and Hindi.
          </p>
          <div className="kh-continuum">
            <h3>One platform. Every way to own gold and silver.</h3>
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
            <p className="kh-continuum-site">GoldnSilver.shop · Nihar Info Global Limited</p>
          </div>
          <div className="kh-disclaimer kh-takeaway">
            <strong>Disclaimer</strong>
            <p>
              Educational commentary, not personalised investment advice. Figures are for the week
              ended 14 November 2026 and should be checked against the source. Physical quotations,
              spot observations, and futures prices refer to different benchmarks and timestamps.
              October ETF flows are monthly data, not flows for this review week. Market observations
              run through Friday, 13 November 2026. Sources include Reuters (13 Nov) on international
              gold and rate expectations, The Wall Street Journal (13 Nov) on the silver futures
              move, Economic Times (13 Nov) on indicative Indian bullion rates, NDTV Profit / AMFI
              (11 Nov) on October domestic ETF flows, the World Gold Council (5 Nov) on October
              global gold ETF flows, MoSPI (12 Nov) on October CPI, SEBI (8 Nov 2025) on the
              digital-gold caution, and Kitco / Ernest Hoffman (12 Nov) on US existing-home sales
              and the contemporaneous gold quotation.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default KnowledgeHubPage;
