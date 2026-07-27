const priceActionRows = [
  [
    'COMEX Gold',
    'Spot / Futures',
    '$4,067.60 / oz',
    '+1.37%',
    'Safe-haven bid & dip buying'
  ],
  [
    'COMEX Silver',
    'Spot / Futures',
    '$58.656 / oz',
    '+4.67%',
    'Dual demand: industrial + monetary'
  ],
  [
    'Domestic Gold (24K)',
    'Physical India',
    '~₹1.44 Lakh / 10g',
    'Mild recovery',
    'Rupee tracking & global parity'
  ],
  [
    'Domestic Silver',
    'Physical India',
    '~₹2.35 Lakh / kg',
    'Strong momentum',
    'Industrial demand & international surge'
  ]
];

const keyDrivers = [
  {
    title: 'Geopolitical Risk',
    text: 'Ongoing developments in the Middle East sustained underlying safe-haven demand for physical gold and silver.'
  },
  {
    title: 'Crude Oil Volatility',
    text: "Brent crude's movement around and above $100/barrel stoked secondary inflation concerns. Although oil retreated later in the week, inflation expectations kept bullion supported."
  },
  {
    title: 'US Federal Reserve Expectations',
    text: 'Markets remained hyper-focused on the upcoming Fed rate decision, recalibrating expectations around bond yields and future interest rate trajectories.'
  },
  {
    title: 'Selective Dip Buying',
    text: 'Following the sharp correction from January highs, lower price levels triggered institutional and retail accumulation, helping metals absorb mid-week profit-taking.'
  }
];

const formatCompare = [
  {
    title: 'Physical Bullion',
    points: [
      'Direct physical ownership',
      'Ideal for jewellery, gifting, and tangible wealth holding',
      'Requires storage / insurance management'
    ]
  },
  {
    title: 'Digital Gold / Silver',
    points: [
      'Micro-accumulation & convenience',
      'Fractional buying starting from small amounts',
      'Option for eventual physical delivery (subject to terms)'
    ]
  },
  {
    title: 'ETFs (Securities Market)',
    points: [
      'Exchange-traded liquidity & efficiency',
      'No storage, insurance, or making charges',
      'Traded via standard demat accounts'
    ]
  }
];

const watchlist = [
  "US Federal Reserve Policy Meeting and Chairman's forward-looking rate commentary",
  'Crude Oil & Energy Index Trends for inflationary cues',
  'US Dollar Index (DXY) & Treasury Yield Movements',
  'USD/INR Exchange Rate Movements impacting domestic landed costs',
  'Sustained Asian Retail Demand post recent price stabilization'
];

const sections = [
  { id: 'overview', label: 'Overview' },
  { id: 'price-action', label: 'Price Action' },
  { id: 'drivers', label: 'Key Drivers' },
  { id: 'etf', label: 'ETF Performance' },
  { id: 'formats', label: 'Physical · Digital · ETFs' },
  { id: 'outlook', label: 'Outlook' },
  { id: 'perspective', label: 'Our View' }
];

const KnowledgeHubPage = () => {
  return (
    <div className="page kh-page">
      <section className="kh-hero" aria-label="Weekly market review">
        <div className="kh-hero-glow" aria-hidden="true" />
        <div className="kh-hero-inner">
          <p className="kh-kicker">GoldnSilver.shop</p>
          <h1 className="kh-hero-title">Weekly Gold &amp; Silver Market Review</h1>
          <p className="kh-hero-sub">Physical · Digital · ETFs</p>
          <div className="kh-week-meta">
            <p className="kh-week-badge">WEEK ENDED 25 JULY 2026</p>
            <p className="kh-data-badge">Market data through 24 July 2026</p>
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

      <section id="overview" className="kh-section">
        <div className="kh-card">
          <p className="kh-eyebrow">Weekly Snapshot</p>
          <h2 className="kh-heading">Recovery with elevated volatility</h2>
          <p className="kh-prose">
            Gold and silver staged a notable recovery this week, though volatility remained elevated.
            Investors continued to balance geopolitical risks, volatile crude oil prices, persistent
            inflation concerns, and expectations surrounding the upcoming US Federal Reserve policy
            meeting. Silver significantly outperformed gold on the global stage, while Indian ETFs
            closely mirrored the recovery across the underlying physical metals.
          </p>
          <div className="kh-snapshot">
            <div className="kh-snapshot-item">
              <span>COMEX Gold</span>
              <strong className="up">+1.37%</strong>
              <small>$4,067.60 / oz</small>
            </div>
            <div className="kh-snapshot-item">
              <span>COMEX Silver</span>
              <strong className="up">+4.67%</strong>
              <small>$58.656 / oz</small>
            </div>
            <div className="kh-snapshot-item">
              <span>Silver vs Gold</span>
              <strong className="up">+3.3%+</strong>
              <small>Global outperformance</small>
            </div>
          </div>
        </div>
      </section>

      <section id="price-action" className="kh-section">
        <div className="kh-card">
          <p className="kh-eyebrow">Section 1</p>
          <h2 className="kh-heading">Global &amp; Domestic Price Action</h2>
          <div className="kh-table-wrap">
            <table className="kh-table kh-price-action-table">
              <thead>
                <tr>
                  <th>Asset Class</th>
                  <th>Instrument / Benchmark</th>
                  <th>Closing / Range</th>
                  <th>Weekly Change</th>
                  <th>Primary Market Driver</th>
                </tr>
              </thead>
              <tbody>
                {priceActionRows.map(([asset, instrument, close, change, driver]) => (
                  <tr key={asset}>
                    <td><strong>{asset}</strong></td>
                    <td>{instrument}</td>
                    <td>{close}</td>
                    <td className={String(change).startsWith('+') ? 'kh-trend-up' : ''}>{change}</td>
                    <td>{driver}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="kh-footnote">
            *Note: Domestic physical rates vary across markets, cities, platforms, local taxation,
            and vendor spreads.
          </p>
          <div className="kh-callout">
            <h3>The Divergence Story</h3>
            <p>
              While gold continued its primary function as a monetary and safe-haven asset,
              silver&apos;s dual personality — part precious metal, part critical industrial input —
              allowed it to gain significantly stronger momentum during the week&apos;s rally,
              outperforming gold globally by over 3.3%.
            </p>
          </div>
        </div>
      </section>

      <section id="drivers" className="kh-section">
        <div className="kh-card">
          <p className="kh-eyebrow">Section 2</p>
          <h2 className="kh-heading">Key Drivers: What Moved Bullion This Week?</h2>
          <div className="kh-driver-grid">
            {keyDrivers.map((item) => (
              <article key={item.title}>
                <h3>{item.title}</h3>
                <p>{item.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="etf" className="kh-section">
        <div className="kh-card">
          <p className="kh-eyebrow">Section 3</p>
          <h2 className="kh-heading">ETF Performance: Paper &amp; Securitized Metals</h2>
          <p className="kh-prose">
            Indian Gold and Silver ETFs effectively tracked their underlying commodities,
            highlighting the liquidity and tracking precision of exchange-traded instruments:
          </p>
          <div className="kh-etf-cards">
            <article>
              <h3>Nippon India ETF Gold BeES (GOLDBEES)</h3>
              <p>
                Rebounded from ~₹116.84 (20 July), touching highs above ₹119.14 midweek, before
                stabilizing in the ₹117–₹118 range.
              </p>
            </article>
            <article>
              <h3>Nippon India Silver ETF (SILVERBEES)</h3>
              <p>
                Exhibited robust momentum, surging from ₹207.89 (20 July) to peak above ₹212, with
                its NAV settling around ₹211.44 (24 July).
              </p>
            </article>
          </div>
          <div className="kh-callout">
            <h3>Global Flow Insight</h3>
            <p>
              World Gold Council data reveals that despite June outflows, global Gold ETFs recorded
              net inflows of nearly US $8 billion in H1 2026, underlining sustained institutional
              holding through market dips.
            </p>
          </div>
        </div>
      </section>

      <section id="formats" className="kh-section">
        <div className="kh-card">
          <p className="kh-eyebrow">Section 4</p>
          <h2 className="kh-heading">Digital Gold vs. Physical Bullion vs. ETFs</h2>
          <p className="kh-prose">
            For modern Indian households, access routes to precious metals have diversified
            significantly. Understanding the structure of each route is essential for effective
            asset allocation:
          </p>
          <div className="kh-format-grid">
            {formatCompare.map((item) => (
              <article key={item.title}>
                <h3>{item.title}</h3>
                <ul>
                  {item.points.map((point) => (
                    <li key={point}>{point}</li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
          <p className="kh-prose kh-pricing-note">
            <strong>Note on Pricing:</strong> Digital precious metals should not be compared with
            ETFs purely on displayed prices. Digital purchases carry provider spreads and 3% GST,
            whereas ETFs trade on stock exchange pricing dynamics.
          </p>
        </div>
      </section>

      <section id="outlook" className="kh-section">
        <div className="kh-card">
          <p className="kh-eyebrow">Section 5</p>
          <h2 className="kh-heading">Outlook &amp; Key Metrics for the Coming Week</h2>
          <p className="kh-prose">
            Volatility is expected to persist in the upcoming sessions. Market participants should
            monitor:
          </p>
          <ol className="kh-numbered-list kh-watchlist">
            {watchlist.map((item) => (
              <li key={item}>
                <strong>{item}</strong>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section id="perspective" className="kh-section">
        <div className="kh-card kh-perspective-card">
          <p className="kh-eyebrow">GoldnSilver.shop Perspective</p>
          <h2 className="kh-heading">Which format fits your objective?</h2>
          <div className="kh-prose kh-prose-stack">
            <p>
              The fundamental question in precious metals has evolved. It is no longer just
              &quot;When should I buy gold or silver?&quot; The central question is:{' '}
              <strong>
                &quot;Which format — Physical, Digital, or ETF — best serves my specific liquidity,
                allocation, and holding objective?&quot;
              </strong>
            </p>
            <p>
              At GoldnSilver.shop, our objective is to bring all three routes onto a single unified
              platform — enabling investors to compare, evaluate, and access precious metals
              seamlessly.
            </p>
          </div>
          <div className="kh-author">
            <div>
              <strong>B.S.N. Suryanarayana</strong>
              <p>Chartered Accountant (FCA) | Company Secretary (ACS) | Entrepreneur</p>
            </div>
            <a href="https://www.goldnsilver.shop" target="_blank" rel="noreferrer">
              www.goldnsilver.shop
            </a>
          </div>
        </div>
      </section>

      <section className="kh-section kh-disclaimer-wrap">
        <div className="kh-disclaimer">
          <strong>Disclaimer</strong>
          <p>
            Market information provided is strictly for educational and informational purposes and
            does not constitute financial or investment advice. Prices, NAVs, and spreads may vary
            across markets, cities, taxation structures, and execution platforms.
          </p>
        </div>
      </section>
    </div>
  );
};

export default KnowledgeHubPage;
