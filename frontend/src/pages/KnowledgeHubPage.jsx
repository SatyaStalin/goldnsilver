import './PageShell.css';
import './KnowledgeHubPage.css';

const glance = [
  { value: '−0.7%', label: 'Spot gold, weekly' },
  { value: '>6.0%', label: 'Spot silver, weekly' },
  { value: '~$4,165', label: 'Gold / troy oz' },
  { value: '~$57–$58', label: 'Silver / troy oz' }
];

const snapshotRows = [
  {
    asset: 'Spot gold',
    level: '~$4,165 / troy oz',
    direction: 'Modest (~0.7%)',
    driver: 'Resilient. Recovered intraday from lower support.'
  },
  {
    asset: 'Spot silver',
    level: '~$57–$58 / troy oz',
    direction: 'Sharp (>6.0%)',
    driver: 'High volatility. Monetary and industrial pressure together.'
  }
];

const goldDrivers = [
  {
    title: 'Higher-than-expected US inflation',
    text: 'Elevated inflation readings revived the fear that monetary policy will stay tight.'
  },
  {
    title: 'Federal Reserve stance',
    text: 'Markets leaned toward a longer stretch of high rates, or further hikes.'
  },
  {
    title: 'US dollar strength',
    text: 'A firmer dollar weighed on assets priced in dollars, including bullion.'
  },
  {
    title: 'Profit booking',
    text: 'Traders took money off the table after the previous week’s recovery.'
  }
];

const silverFactors = [
  {
    title: 'Investment demand',
    text: 'Silver moved with Federal Reserve policy and the wider appetite for macro risk.'
  },
  {
    title: 'Industrial demand',
    text: 'Use in solar, electronics, electrical manufacturing, and green infrastructure kept the swings larger than gold.'
  }
];

const digitalPoints = [
  {
    title: 'Low entry barrier',
    text: 'Retail buyers can start with small amounts and add through a plan.'
  },
  {
    title: 'Flexibility',
    text: 'Fractional gold and silver can be built daily, weekly, or monthly.'
  },
  {
    title: 'Physical redemption',
    text: 'Balances can be converted into certified coins or bars, subject to the provider’s terms.'
  },
  {
    title: 'Dips and averaging',
    text: 'A setback like this week lets a long-term systematic plan buy at a lower average cost.'
  }
];

const correctionDrivers = [
  {
    title: 'Hotter inflation data',
    text: 'The prints reinforced the case for a tighter Federal Reserve stance.'
  },
  {
    title: 'Bond yields',
    text: 'Higher yields raised the opportunity cost of holding metal that pays no interest.'
  },
  {
    title: 'US dollar strength',
    text: 'A stronger dollar met resistance across commodities.'
  },
  {
    title: 'Institutional rebalancing',
    text: 'Short-term positions were adjusted after the recent volatility.'
  }
];

const outlook = [
  { title: 'Spot levels', text: 'International gold and silver prices, and nearby technical support.' },
  { title: 'Dollar and yields', text: 'The US Dollar Index and the path of US Treasury yields.' },
  { title: 'Fed commentary', text: 'Official remarks and how markets read the next policy step.' },
  { title: 'Rupee and ETFs', text: 'INR movement, and whether Indian ETFs trade rich or cheap to NAV.' }
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
  { id: 'gold', label: 'Physical Gold' },
  { id: 'silver', label: 'Physical Silver' },
  { id: 'digital', label: 'Digital Gold' },
  { id: 'etfs', label: 'ETFs' },
  { id: 'drivers', label: 'What Drove the Dip' },
  { id: 'outlook', label: 'Week Ahead' }
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

const ChangePill = ({ value }) => (
  <span className="kh-gain-pill kh-gain-pill--down">{value}</span>
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
          <p className="gs-hero-kicker">Weekly gold and silver market review</p>
          <h1>Under Renewed Selling Pressure</h1>
          <p className="gs-hero-copy">
            Last week’s recovery lost ground. Selling returned across gold and silver as markets
            weighed US inflation, the interest-rate path, a firmer dollar, and investor sentiment.
            Silver swung more sharply. Gold held up better and steadied near support by Friday.
          </p>
          <div className="gs-hero-meta">
            <p className="gs-hero-badge">12–16 OCTOBER 2026</p>
            <p className="gs-hero-badge kh-hero-badge--down">SPOT GOLD −0.7%</p>
          </div>
          <p className="kh-hero-published">GoldnSilver.shop · Weekly Market Review</p>
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
              <p className="kh-eyebrow">Weekly market performance</p>
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
              <caption className="kh-table-caption">Indicative levels, week of 12–16 October 2026</caption>
              <thead>
                <tr>
                  <th scope="col">Metal</th>
                  <th scope="col">Indicative level</th>
                  <th scope="col">Weekly direction</th>
                  <th scope="col">Character</th>
                </tr>
              </thead>
              <tbody>
                {snapshotRows.map((row) => (
                  <tr key={row.asset}>
                    <td className="kh-cell-asset">{row.asset}</td>
                    <td>{row.level}</td>
                    <td>
                      <ChangePill value={row.direction} />
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
              <p className="kh-eyebrow">1. Physical gold</p>
              <h2 className="kh-heading">Recovery loses momentum</h2>
            </div>
          </div>
          <p className="kh-prose">
            International gold stayed under pressure, with wide intraday swings, then steadied near
            support in US Friday afternoon trade. The metal was more resilient than silver, but the
            prior week’s better tone did not hold.
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
          <p className="kh-prose kh-prose--spaced">
            Gold remains a long-term store of value. High interest rates can still make non-yielding
            bullion less attractive for a while.
          </p>
        </div>
      </section>

      <section id="silver" className="gs-section kh-section">
        <div className="gs-panel kh-card">
          <div className="kh-card-head">
            <span className="kh-card-icon" aria-hidden="true">
              <IconInsight />
            </span>
            <div>
              <p className="kh-eyebrow">2. Physical silver</p>
              <h2 className="kh-heading">A sharper correction</h2>
            </div>
          </div>
          <p className="kh-prose">
            Silver fell harder than gold. It is both a monetary metal and an industrial one, so
            policy news and factory demand hit it at the same time. On Friday, spot silver recovered
            toward $57–$58 per troy ounce after heavy selling earlier in the week. At the lows, the
            weekly drop was more than 6%.
          </p>
          <div className="kh-driver-grid">
            {silverFactors.map((item, index) => (
              <article key={item.title} className="kh-driver-card">
                <span className="kh-driver-num">{index + 1}</span>
                <h3>{item.title}</h3>
                <p>{item.text}</p>
              </article>
            ))}
          </div>
          <p className="kh-prose kh-prose--spaced">
            That industrial link is why silver’s swings are wider. Position size matters more here
            than it does in gold.
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
              <h2 className="kh-heading">A retail way to stay in the market</h2>
            </div>
          </div>
          <p className="kh-prose">
            Digital metal remains a practical route for Indian retail buyers who want bullion without
            storing bars at home. Providers in this market include SafeGold, Augmont, and MMTC-PAMP.
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
            <strong>Note for investors</strong>
            <p>
              Digital gold and silver include GST, a buy–sell spread, storage arrangements, and
              counterparty risk. They are not the same as SEBI-regulated exchange-traded funds.
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
              <p className="kh-eyebrow">4. Domestic and overseas ETFs</p>
              <h2 className="kh-heading">Exchange access stays open</h2>
            </div>
          </div>
          <p className="kh-prose">
            Indian gold and silver ETFs remain the exchange route to the metals. Prices follow
            domestic spot rates, overseas moves, the rupee, and how closely each fund tracks its
            benchmark.
          </p>
          <div className="kh-trend-card kh-takeaway">
            <p className="kh-eyebrow">Regulatory note · 16 October 2026</p>
            <h3 className="kh-subhead">Some fund-of-funds paused new money</h3>
            <p className="kh-assessment">
              Several Indian mutual fund houses temporarily stopped fresh lump-sum and SIP
              subscriptions into certain Gold and Gold-Silver Fund-of-Funds schemes. Buying and
              selling the underlying gold and silver ETFs on the NSE and BSE was not stopped.
              Secondary-market trading of those ETFs continued.
            </p>
          </div>
          <p className="kh-prose kh-prose--spaced">
            Overseas-listed ETFs add a global holding, and also currency risk. A fall in the dollar
            price does not always show up as the same rupee return, because the exchange rate and
            LRS rules sit between the investor and the fund.
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
              <p className="kh-eyebrow">5. Why prices fell</p>
              <h2 className="kh-heading">What caused the correction</h2>
            </div>
          </div>
          <div className="kh-driver-grid">
            {correctionDrivers.map((item, index) => (
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
        <div className="gs-panel kh-card">
          <div className="kh-card-head">
            <span className="kh-card-icon" aria-hidden="true">
              <IconChart />
            </span>
            <div>
              <p className="kh-eyebrow">Week ahead</p>
              <h2 className="kh-heading">Four things to track</h2>
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
              <p className="kh-eyebrow">Our perspective</p>
              <h2 className="kh-heading">Look past one noisy week</h2>
            </div>
          </div>
          <p className="kh-prose">
            Short-term volatility is part of precious metals, including assets people treat as
            shelters. Gold still anchors a diversified holding. Silver remains tied to industrial
            growth as well as to money markets. The useful habit is steady accumulation over a long
            horizon, not a reaction to one week’s selling.
          </p>
          <div className="kh-continuum">
            <h3>Connecting traditional metals with modern ways to own them.</h3>
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
            <p className="kh-continuum-site">GoldnSilver.shop</p>
          </div>
          <div className="kh-disclaimer kh-takeaway">
            <strong>Disclaimer</strong>
            <p>
              Market review for the week ended 16 October 2026. Prices are indicative observations,
              not necessarily final weekly settlement prices. This note is for education only. It is
              not financial, legal, or investment advice.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default KnowledgeHubPage;
