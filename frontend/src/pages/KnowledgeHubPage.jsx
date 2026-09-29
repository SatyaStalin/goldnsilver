import './PageShell.css';
import './KnowledgeHubPage.css';

const weeklyTrends = [
  { label: 'Spot Gold', direction: 'down', aria: 'Weekly decline about 2.4 percent' },
  { label: 'US Gold Futures', direction: 'down', aria: 'Futures settled lower near 4,325 dollars' },
  { label: 'Spot Silver', direction: 'down', aria: 'Silver underperformed gold and settled near 64.30 dollars' },
  { label: 'MCX Gold', direction: 'down', aria: 'Domestic gold closed lower around 1,50,900 rupees per 10 grams' }
];

const globalPoints = [
  {
    title: 'Weekly trend',
    text: 'Spot gold concluded the week down ~2.4% (Reuters / market data).'
  },
  {
    title: 'Weekly closing price',
    text: 'Spot gold closed at ~$4,285/oz. US gold futures settled near ~$4,325/oz.'
  },
  {
    title: 'Silver action',
    text: 'Silver underperformed gold across the five-day period, settling near ~$64.30/oz.'
  },
  {
    title: 'Key takeaway',
    text: 'The midweek correction met dip-buying interest at key support levels near $4,270.'
  }
];

const indiaCards = [
  {
    metal: 'MCX Gold',
    spec: 'Saturday rates · per 10 grams',
    rows: [
      { label: 'MCX close', value: '₹1,50,900' },
      { label: 'Retail 24K', value: '₹1,52,850–₹1,52,950' }
    ],
    change: 'Down with the global week',
    down: true
  },
  {
    metal: 'MCX Silver',
    spec: 'Saturday rates · per kilogram',
    rows: [
      { label: 'MCX close', value: '₹2,33,500' },
      { label: 'Retail fine 999', value: '₹2,45,000–₹2,50,000' }
    ],
    change: 'Underperformed gold',
    down: true
  }
];

const correctionReasons = [
  {
    title: 'Stronger US dollar',
    text: 'DXY climbed near the 101 mark, pressuring bullion.'
  },
  {
    title: 'Higher yields',
    text: 'US 10-year Treasury yields rose near 5.11%, raising the opportunity cost of holding metal.'
  },
  {
    title: 'Hawkish Fed',
    text: 'Policy expectations remain tighter-for-longer.'
  },
  {
    title: 'Festive buying',
    text: 'Price dips sparked renewed physical accumulation ahead of the peak festive season.'
  },
  {
    title: 'Profit booking',
    text: 'Investors locked in profits following recent record-high levels.'
  },
  {
    title: 'Silver volatility',
    text: 'Silver’s dual precious and industrial character amplified the downside.'
  }
];

const digitalStats = [
  { value: '₹2,500 Cr', label: 'Average monthly inflows' },
  { value: '+110%', label: 'August year-on-year growth' }
];

const etfStats = [
  { value: '₹1.91 Lakh Cr', label: 'Gold ETF AUM' },
  { value: '₹85,488 Cr', label: 'Silver ETF AUM' }
];

const sebiPoints = [
  {
    title: 'Net-worth requirement',
    text: 'Raised from ₹50 crore to ₹75 crore for vault managers, to bolster institutional safety.'
  },
  {
    title: 'Custody and risk norms',
    text: 'Enhanced rules on physical segregation, vault security, reconciliation, and cyber resilience.'
  }
];

const outlook = [
  { title: 'US policy', text: 'Federal Reserve monetary policy and Treasury yields.' },
  { title: 'Festive demand', text: 'Indian festive-season physical demand.' },
  { title: 'ETF flows', text: 'Gold and silver ETF flow trajectories.' },
  { title: 'EGRs', text: 'Expansion of Electronic Gold Receipts.' }
];

const platformWays = ['Physical Bullion', 'Digital Gold', 'ETFs & EGRs', 'Gold & Silver'];

const sections = [
  { id: 'global', label: 'Global Markets' },
  { id: 'bullion', label: 'Physical Bullion' },
  { id: 'correction', label: 'The Correction' },
  { id: 'digital', label: 'Digital Gold' },
  { id: 'etfs', label: 'ETFs & EGRs' },
  { id: 'sebi', label: 'SEBI Framework' },
  { id: 'outlook', label: 'Outlook' }
];

const hashtags = [
  '#Gold',
  '#Silver',
  '#GoldETF',
  '#SilverETF',
  '#DigitalGold',
  '#SEBI',
  '#Bullion',
  '#PreciousMetals',
  '#GoldnSilver',
  '#IndianMarkets'
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
          <p className="gs-hero-kicker">GoldnSilver.shop · Weekly market intelligence</p>
          <h1>Gold &amp; Silver Weekly Review</h1>
          <p className="gs-hero-copy">
            A volatile, corrective week. Macro headwinds triggered a midweek sell-off, and Friday
            closed with a modest stabilization rebound. Bullion still finished the week down over 2.4%.
          </p>
          <div className="gs-hero-meta">
            <p className="gs-hero-badge">WEEK ENDED 25 SEP 2026</p>
            <p className="gs-hero-badge kh-hero-badge--down">DOWN OVER 2.4%</p>
          </div>
          <p className="kh-hero-published">Updated as on Saturday morning, 26 September 2026</p>
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

      <section id="global" className="gs-section kh-section">
        <div className="gs-panel kh-card kh-trend-card">
          <p className="kh-trend-eyebrow">Weekly trend summary</p>
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
              <p className="kh-eyebrow">Global markets</p>
              <h2 className="kh-heading">As on Saturday morning</h2>
            </div>
          </div>
          <div className="kh-scorecard-grid">
            {globalPoints.map((item) => (
              <article key={item.title} className="kh-scorecard-item">
                <h3>{item.title}</h3>
                <p>{item.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="bullion" className="gs-section kh-section">
        <div className="gs-panel kh-card">
          <div className="kh-card-head">
            <span className="kh-card-icon" aria-hidden="true">
              <IconChart />
            </span>
            <div>
              <p className="kh-eyebrow">Physical bullion — India</p>
              <h2 className="kh-heading">Saturday rates</h2>
            </div>
          </div>
          <div className="kh-price-grid kh-price-grid--two">
            {indiaCards.map((item) => (
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
        </div>
      </section>

      <section id="correction" className="gs-section kh-section">
        <div className="gs-panel kh-card">
          <div className="kh-card-head">
            <span className="kh-card-icon" aria-hidden="true">
              <IconInsight />
            </span>
            <div>
              <p className="kh-eyebrow">Market drivers</p>
              <h2 className="kh-heading">Why did gold and silver correct?</h2>
            </div>
          </div>
          <div className="kh-driver-grid">
            {correctionReasons.map((item, index) => (
              <article key={item.title} className="kh-driver-card">
                <span className="kh-driver-num">{index + 1}</span>
                <h3>{item.title}</h3>
                <p>{item.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="digital" className="gs-section kh-section">
        <div className="gs-panel kh-card">
          <div className="kh-card-head">
            <span className="kh-card-icon" aria-hidden="true">
              <IconChart />
            </span>
            <div>
              <p className="kh-eyebrow">Digital gold — India</p>
              <h2 className="kh-heading">Retail adoption stays strong</h2>
            </div>
          </div>
          <p className="kh-source-pill">Source: WGC / NPCI data (June–August 2026)</p>
          <div className="kh-price-grid kh-price-grid--two">
            {digitalStats.map((item) => (
              <article key={item.label} className="kh-price-card">
                <p className="kh-price-metal">{item.value}</p>
                <p className="kh-price-spec">{item.label}</p>
              </article>
            ))}
          </div>
          <p className="kh-prose kh-prose--spaced">
            Monthly volume averaged about 1.6 tonnes. Fractional access continues to drive strong
            retail adoption.
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
              <p className="kh-eyebrow">Indian ETFs · August data</p>
              <h2 className="kh-heading">Financial adoption scaling rapidly</h2>
            </div>
          </div>
          <div className="kh-price-grid kh-price-grid--two">
            {etfStats.map((item) => (
              <article key={item.label} className="kh-price-card">
                <p className="kh-price-metal">{item.value}</p>
                <p className="kh-price-spec">{item.label}</p>
              </article>
            ))}
          </div>
          <div className="kh-card--highlight kh-takeaway">
            <p className="kh-prose">
              Combined ETF assets under management crossed ₹2.76 lakh crore, with ₹3,868 crore of
              net inflows in August alone.
            </p>
          </div>
        </div>
      </section>

      <section id="sebi" className="gs-section kh-section">
        <div className="gs-panel kh-card">
          <div className="kh-card-head">
            <span className="kh-card-icon" aria-hidden="true">
              <IconInsight />
            </span>
            <div>
              <p className="kh-eyebrow">Regulatory watch</p>
              <h2 className="kh-heading">SEBI vault manager framework</h2>
            </div>
          </div>
          <p className="kh-prose">
            SEBI board update, 24 September: key amendments were approved to strengthen the custody
            infrastructure backing gold and silver ETFs and Electronic Gold Receipts (EGRs).
          </p>
          <div className="kh-scorecard-grid kh-prose--spaced">
            {sebiPoints.map((item) => (
              <article key={item.title} className="kh-scorecard-item">
                <h3>{item.title}</h3>
                <p>{item.text}</p>
              </article>
            ))}
          </div>
          <div className="kh-card--highlight kh-takeaway">
            <p className="kh-subhead">Investor note</p>
            <p className="kh-prose">
              SEBI has previously clarified that digital gold and e-gold bought via online platforms
              is not a SEBI-regulated security, unlike gold ETFs, EGRs, or derivatives.
            </p>
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
              <p className="kh-eyebrow">What to watch</p>
              <h2 className="kh-heading">Outlook and key drivers</h2>
            </div>
          </div>
          <div className="kh-driver-grid kh-driver-grid--four">
            {outlook.map((item, index) => (
              <article key={item.title} className="kh-driver-card">
                <span className="kh-driver-num">{index + 1}</span>
                <h3>{item.title}</h3>
                <p>{item.text}</p>
              </article>
            ))}
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
              <p className="kh-eyebrow">GoldnSilver.shop</p>
              <h2 className="kh-heading">One platform. Every way to own gold and silver.</h2>
            </div>
          </div>
          <p className="kh-prose">
            At GoldnSilver.shop, the objective is to bring this evolving ecosystem together for
            investors.
          </p>
          <div className="kh-continuum">
            <h3>Physical. Digital. ETFs. EGRs.</h3>
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
        <div className="kh-hashtags" aria-label="Topics">
          {hashtags.map((tag) => (
            <span key={tag}>{tag}</span>
          ))}
        </div>
        <div className="kh-disclaimer">
          <strong>Disclaimer</strong>
          <p>
            This weekly review is for educational and information purposes only and should not be
            construed as investment advice. Precious metals and financial products carry market risk.
          </p>
        </div>
      </section>
    </div>
  );
};

export default KnowledgeHubPage;
