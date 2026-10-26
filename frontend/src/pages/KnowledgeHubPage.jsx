import './PageShell.css';
import './KnowledgeHubPage.css';

const glance = [
  { value: '< $4,000', label: 'Intl. gold / oz' },
  { value: '$53.45', label: 'Intl. silver / oz' },
  { value: '₹1,46,100', label: 'Delhi 24K gold / 10g' },
  { value: '₹2,02,000', label: 'Delhi silver / kg' }
];

const snapshotRows = [
  {
    asset: 'Intl. gold (spot)',
    level: '< US$4,000 / oz',
    direction: '▼ ~4.0%',
    driver: '3rd straight weekly fall. Stronger dollar, yields, and profit taking.'
  },
  {
    asset: 'Intl. silver (spot)',
    level: 'US$53.45 / oz',
    direction: '▼ Under pressure',
    driver: 'High volatility. Investment and industrial selling together.'
  },
  {
    asset: 'Delhi physical gold (24K)',
    level: '₹1,46,100 / 10g',
    direction: '▼ Softer',
    driver: 'Followed global cues. Festive jewellery buying limited the fall.'
  },
  {
    asset: 'Delhi physical silver',
    level: '₹2,02,000 / kg',
    direction: '▼ ~₹30,000/kg',
    driver: 'Down about ₹30,000/kg since 30 September 2026.'
  },
  {
    asset: 'SPDR Gold Shares (GLD)',
    level: 'US$366.61',
    direction: '▼ 4.03%',
    driver: 'From US$382.01 on 16 October. Institutional selling.'
  },
  {
    asset: 'iShares Silver Trust (SLV)',
    level: 'US$48.72',
    direction: '▼ 5.42%',
    driver: 'From US$51.51 on 16 October. A sharper fall than gold.'
  }
];

const goldDrivers = [
  {
    title: 'Dollar and yields',
    text: 'A stronger US dollar index and higher yields kept pressure on bullion.'
  },
  {
    title: 'Crude oil',
    text: 'Surging international crude prices added to macro uncertainty.'
  },
  {
    title: 'Inflation and rates',
    text: 'Persistent inflation concerns and higher US interest-rate expectations stayed in the market.'
  },
  {
    title: 'Profit booking',
    text: 'Widespread profit booking and position liquidation extended the slide.'
  }
];

const digitalPoints = [
  {
    title: 'Micro-accumulation',
    text: 'Small fixed rupee amounts can still be added on a systematic plan.'
  },
  {
    title: 'Operational flexibility',
    text: 'Buying, selling, and vaulting stay available online.'
  },
  {
    title: 'Physical delivery',
    text: 'Balances can be converted into coins or bars, subject to the provider’s thresholds and minting or delivery fees.'
  }
];

const takeaways = [
  {
    title: 'Cyclical shocks',
    text: 'Gold and silver can fall in stretches even when the long-term case is intact.'
  },
  {
    title: 'Silver swings more',
    text: 'Its industrial and monetary roles together produce wider price moves than gold.'
  },
  {
    title: 'Three weeks is not a cycle',
    text: 'A three-week fall is not, by itself, a multi-year bear market. Position size and leverage still matter.'
  }
];

const outlook = [
  {
    title: 'Fed meeting',
    text: 'The US Federal Reserve meets on 27–28 October 2026. Rate guidance and the commentary around it are the main event.'
  },
  {
    title: 'Data and the dollar',
    text: 'US inflation indicators, Treasury yields, and the US Dollar Index.'
  },
  {
    title: 'Flows and physical buying',
    text: 'ETF flows, and whether festive and crop-season demand in India responds to the lower prices.'
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
  { id: 'gold', label: 'Physical Gold' },
  { id: 'silver', label: 'Physical Silver' },
  { id: 'digital', label: 'Digital Gold' },
  { id: 'etfs', label: 'ETFs' },
  { id: 'macro', label: 'Three-Week Slide' },
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
          <p className="gs-hero-kicker">Weekly market review</p>
          <h1>3 Weeks of Consecutive Fall — What Next?</h1>
          <p className="gs-hero-copy">
            Precious metals faced selling pressure for a third straight week, and recovery attempts
            did not hold. Silver was the more volatile metal across physical, digital, and ETF
            markets. This note covers physical bullion, digital metals, and domestic and overseas ETFs.
          </p>
          <div className="gs-hero-meta">
            <p className="gs-hero-badge">WEEK ENDING 24 OCT 2026</p>
            <p className="gs-hero-badge kh-hero-badge--down">GOLD −~4% · 3RD WEEK</p>
          </div>
          <p className="kh-hero-published">
            B.S.N. Suryanarayana, FCA, ACS · GoldnSilver.shop
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
              <p className="kh-eyebrow">Levels as of 23 October 2026</p>
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
              <caption className="kh-table-caption">Segment snapshot, week ending 24 October 2026</caption>
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
              <h2 className="kh-heading">A third consecutive weekly fall</h2>
            </div>
          </div>
          <p className="kh-prose">
            International gold broke below the US$4,000 an ounce mark on Friday and locked in its
            third weekly decline, about 4% for the week. Delhi 24K gold, including taxes, eased to
            ₹1,46,100 per 10 grams, tracking the global move.
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
              <p className="kh-eyebrow">2. Physical silver</p>
              <h2 className="kh-heading">The sharper correction</h2>
            </div>
          </div>
          <p className="kh-prose">
            Silver stayed more volatile than gold through the multi-week slide. Spot silver hovered
            around US$53.45 an ounce. Delhi physical silver settled near ₹2,02,000 per kg, about
            ₹30,000 per kg below the 30 September 2026 level.
          </p>
          <p className="kh-prose kh-prose--spaced">
            Silver is priced both as an investment metal and as an industrial input for electronics,
            solar, and manufacturing. When those two demands weaken together, the swings get wider
            in both directions.
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
              <h2 className="kh-heading">Spot weakness, same way to accumulate</h2>
            </div>
          </div>
          <p className="kh-prose">
            Digital prices from providers such as SafeGold, Augmont, and MMTC-PAMP followed the
            three-week drop in the underlying metal. The way those platforms are used did not change.
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
              Digital gold and silver are not SEBI-regulated instruments, unlike ETFs. Spread costs,
              storage and custody, and counterparty risk need a separate look.
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
              <h2 className="kh-heading">Selling on the screen, inflows still on the books</h2>
            </div>
          </div>
          <p className="kh-prose">
            Indian precious-metal ETFs came under selling pressure. On Friday, several Indian silver
            ETFs fell 3% to 5% intraday. Overseas, SPDR Gold Shares (GLD) closed at US$366.61, down
            4.03% from US$382.01 on 16 October. iShares Silver Trust (SLV) closed at US$48.72, down
            5.42% from US$51.51.
          </p>
          <div className="kh-trend-card kh-takeaway">
            <p className="kh-eyebrow">India flows and the 16 October rule</p>
            <h3 className="kh-subhead">ETF money is still coming in</h3>
            <p className="kh-assessment">
              World Gold Council data shows Indian gold ETFs took a net ₹4,450 crore in September
              2026, and an estimated ₹1,722 crore in the first half of October. Fresh subscriptions
              into certain Gold Fund of Funds were paused from 16 October 2026. Direct exchange
              trading of gold ETFs, and SIPs already running, continued.
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
              <p className="kh-eyebrow">What shaped the three-week fall</p>
              <h2 className="kh-heading">Rates can outweigh the safe-haven bid</h2>
            </div>
          </div>
          <p className="kh-prose">
            The slide lines up with shifting US Federal Reserve expectations, elevated crude oil, a
            resilient dollar, and geopolitical tension. Geopolitics usually supports haven demand.
            Higher real-rate expectations and tighter liquidity can override that bid for a while.
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

      <section id="outlook" className="gs-section kh-section">
        <div className="gs-panel kh-card">
          <div className="kh-card-head">
            <span className="kh-card-icon" aria-hidden="true">
              <IconChart />
            </span>
            <div>
              <p className="kh-eyebrow">Coming week</p>
              <h2 className="kh-heading">What to watch, and how to respond</h2>
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
          <p className="kh-prose kh-prose--spaced">
            This is not a week for aggressive bottom-fishing. Staggered buying, rupee-cost averaging,
            is the steadier way through a correction.
          </p>
        </div>
      </section>

      <section className="gs-section kh-section">
        <div className="gs-panel kh-card kh-perspective-card">
          <div className="kh-card-head">
            <span className="kh-card-icon" aria-hidden="true">
              <IconBulb />
            </span>
            <div>
              <p className="kh-eyebrow">Prepared by</p>
              <h2 className="kh-heading">B.S.N. Suryanarayana, FCA, ACS</h2>
            </div>
          </div>
          <p className="kh-prose">
            Senior Partner, BSN Suryanarayana &amp; Co. Chairman and Founder, Nihar Info Global
            Limited. GoldnSilver.shop is an initiative of Nihar Info Global Limited (BSE: 531083).
          </p>
          <div className="kh-continuum">
            <h3>Physical, digital, and exchange routes on one platform.</h3>
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
              Market observations, data, and commentary here are for education and information only.
              They are not financial, legal, or investment advice.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default KnowledgeHubPage;
