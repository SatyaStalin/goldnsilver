import './PageShell.css';
import './KnowledgeHubPage.css';

const glance = [
  { value: '$3,910.53', label: 'Intl. gold / oz · −2.7%' },
  { value: '$49.34', label: 'Intl. silver / oz · −5.8%' },
  { value: '₹1,43,668', label: 'Domestic 24K gold / 10g' },
  { value: '₹1,89,217', label: 'Domestic silver / kg' }
];

const snapshotRows = [
  {
    asset: 'International gold',
    level: '$3,910.53 / oz',
    direction: '▼ 2.7%',
    driver: 'Bearish. $4,000/oz support breached.'
  },
  {
    asset: 'International silver',
    level: '$49.34 / oz',
    direction: '▼ 5.8%',
    driver: 'Strongly bearish. $50.00/oz support breached.'
  },
  {
    asset: 'Gold 24K (999)',
    level: '₹1,43,668 / 10g',
    direction: '▼ Lower',
    driver: 'Softer prices ahead of Dhanteras (6 Nov) and Diwali (8 Nov).'
  },
  {
    asset: 'Gold 22K (jewellery)',
    level: '₹1,31,600 / 10g',
    direction: '▼ Lower',
    driver: 'Retail coin and jewellery interest may pick up. Institutions stay cautious.'
  },
  {
    asset: 'Silver 999 (physical)',
    level: '₹1,89,217 / kg',
    direction: '▼ Led the fall',
    driver: 'Physical premiums remain sensitive to the global benchmark.'
  },
  {
    asset: 'MCX gold futures',
    level: '₹1,41,263 / 10g',
    direction: '▼ Discount',
    driver: 'Mild discount to spot, reflecting physical market weakness.'
  },
  {
    asset: 'MCX silver futures',
    level: '₹1,84,245 / kg',
    direction: '▼ Volatile',
    driver: 'Tracking the sharp move in international silver.'
  }
];

const goldDrivers = [
  {
    title: 'Crude oil',
    text: 'Surging crude prices added cost-push inflation pressure and kept precious metals on the back foot.'
  },
  {
    title: 'US core inflation',
    text: 'Persistent US core inflation metrics reinforced a higher-for-longer rate path.'
  },
  {
    title: 'Dollar and yields',
    text: 'A stronger US dollar and elevated Treasury yields raised the opportunity cost of holding bullion.'
  },
  {
    title: 'Central bank guidance',
    text: 'Policy signals stayed hawkish, and silver saw elevated volatility with sharp long liquidations.'
  }
];

const digitalPoints = [
  {
    title: 'Lower acquisition cost',
    text: 'Spot price reductions reduce the entry cost for retail buyers accumulating gold and silver.'
  },
  {
    title: 'SIPs and rupee-cost averaging',
    text: 'Systematic plans remain the practical hedge against trying to time a volatile week.'
  },
  {
    title: 'Check the terms',
    text: 'Platform spreads, taxes, and redemption terms should be reviewed before adding or redeeming.'
  }
];

const takeaways = [
  {
    title: 'US policy and the dollar',
    text: 'Sticky inflation has supported hawkish Fed expectations, lifting yields and the dollar at the expense of non-yielding bullion.'
  },
  {
    title: 'Crude oil and geopolitics',
    text: 'Energy supply concerns in West Asia revive cost-push inflation fears and complicate any timeline for easier policy.'
  },
  {
    title: 'Levels that matter',
    text: 'Gold needs a close back above $4,000/oz to steady sentiment. Silver faces resistance at $50.00/oz, with wide swings still likely. Festive demand in India may put a local floor under physical metal.'
  }
];

const outlook = [
  {
    title: 'Window',
    text: 'The near-term watch period is 2–6 November 2026, into Dhanteras on 6 November and Diwali on 8 November.'
  },
  {
    title: 'What would stabilise gold',
    text: 'A reclaim and close above $4,000 an ounce. Until that happens, the tone stays bearish after the broken support.'
  },
  {
    title: 'How to respond',
    text: 'Prefer disciplined allocation and systematic accumulation over short-term bottom fishing.'
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
  { id: 'gold', label: 'Market Overview' },
  { id: 'silver', label: 'India Physical' },
  { id: 'digital', label: 'Digital Bullion' },
  { id: 'etfs', label: 'ETFs' },
  { id: 'macro', label: 'Macro Drivers' },
  { id: 'outlook', label: '2–6 Nov Outlook' }
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
          <h1>4th Week of Continuous Fall</h1>
          <p className="gs-hero-copy">
            Gold and silver stayed under substantial selling pressure in the week ending 30 October
            2026, extending the October correction. Silver led the decline, with sharp long
            liquidations. This note covers international spot, Indian physical and futures markets,
            digital bullion, and ETFs.
          </p>
          <div className="gs-hero-meta">
            <p className="gs-hero-badge">WEEK ENDING 30 OCT 2026</p>
            <p className="gs-hero-badge kh-hero-badge--down">GOLD −2.7% · SILVER −5.8%</p>
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
              <p className="kh-eyebrow">Spot and domestic levels, 30 October 2026</p>
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
                Indicative levels for 30 October 2026. International spots via Reuters, subject to final settlement.
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
              <p className="kh-eyebrow">1. Market overview</p>
              <h2 className="kh-heading">A fourth consecutive week of selling</h2>
            </div>
          </div>
          <p className="kh-prose">
            International gold closed the week at $3,910.53 an ounce, down 2.7%, after support at
            $4,000 gave way. Silver fell further, to $49.34 an ounce, down 5.8%, and broke $50.
            In India, 24K gold was ₹1,43,668 per 10 grams and silver ₹1,89,217 per kg.
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
              <p className="kh-eyebrow">2. Indian physical and futures</p>
              <h2 className="kh-heading">A lower tape into the festive week</h2>
            </div>
          </div>
          <p className="kh-prose">
            Domestic bullion eased across physical spot and futures. 24K gold (999) was indicated at
            ₹1,43,668 per 10 grams and 22K jewellery gold at ₹1,31,600 per 10 grams. Lower prices
            ahead of Dhanteras (6 November) and Diwali (8 November) may draw retail buying of coins
            and jewellery, while volatility keeps institutional buyers cautious.
          </p>
          <p className="kh-prose kh-prose--spaced">
            Physical silver (999) was ₹1,89,217 per kg, with premiums still sensitive to the global
            benchmark. MCX gold futures traded at ₹1,41,263 per 10 grams, a mild discount to spot.
            MCX silver futures were ₹1,84,245 per kg, reflecting the sharp international move.
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
              <p className="kh-eyebrow">3. Digital bullion</p>
              <h2 className="kh-heading">Cheaper entry, same need for a plan</h2>
            </div>
          </div>
          <p className="kh-prose">
            Lower spot prices reduce what retail buyers pay to accumulate digital gold and silver.
            Systematic investment plans and rupee-cost averaging remain the practical way to avoid
            timing a single week. Spreads, taxes, and redemption terms still need a look before
            buying or selling.
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
              Compare platform spreads, taxes, and redemption terms. Digital bullion and ETFs both
              carry market risk, and indicative prices move with the spot market.
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
              <h2 className="kh-heading">Every listed Indian gold and silver ETF finished lower</h2>
            </div>
          </div>
          <p className="kh-prose">
            On 29 October, all 26 gold ETFs and all 19 silver ETFs traded lower. Silver ETFs fell
            1.64% to 1.97% in the session. Drawdowns from the January 2026 highs reach as much as
            53%. Gold ETFs fell 0.08% to 0.65%, with peak-to-date drawdowns up to 26%.
          </p>
          <div className="kh-trend-card kh-takeaway">
            <p className="kh-eyebrow">Overseas funds</p>
            <h3 className="kh-subhead">GLD, IAU, SLV, and SIVR moved with the same tape</h3>
            <p className="kh-assessment">
              Overseas gold and silver funds were hit alongside the Indian listings. For Indian
              investors, the rupee–dollar rate remains a second return driver on top of the metal
              price.
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
              <p className="kh-eyebrow">5. Macro drivers, 2–6 November 2026</p>
              <h2 className="kh-heading">Higher for longer is still the constraint</h2>
            </div>
          </div>
          <p className="kh-prose">
            The week’s pressure came from surging crude, sticky US core inflation, a strong dollar,
            elevated Treasury yields, and central-bank guidance that keeps rates higher for longer.
            Those forces continue into the first week of November.
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
              <p className="kh-eyebrow">6. Near-term outlook</p>
              <h2 className="kh-heading">Festive demand is a floor, not a reversal call</h2>
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
            October 2026 was a difficult month for precious metals. Hawkish policy pushed prices
            lower, and the longer-term case is still intact. The practical response into Dhanteras
            and Diwali is disciplined allocation and systematic accumulation, not a rush to call the
            bottom.
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
              <p className="kh-eyebrow">Published by</p>
              <h2 className="kh-heading">Nihar Info Global Limited</h2>
            </div>
          </div>
          <p className="kh-prose">
            GoldnSilver.shop is an initiative of Nihar Info Global Limited (BSE Listed: 531083).
            The platform spans physical bullion, digital gold and silver, ETF distribution, gold-loan
            referrals, and buyback, for long-term allocation rather than a single week’s price.
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
              This review is for education and information only. It is not financial or investment
              advice. Indicative prices can change. ETF and bullion investments carry market risk.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default KnowledgeHubPage;
