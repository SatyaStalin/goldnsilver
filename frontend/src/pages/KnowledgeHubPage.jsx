import './PageShell.css';
import './KnowledgeHubPage.css';

const glance = [
  { value: 'US$4,065', label: 'Intl. gold futures / oz · +4.6%' },
  { value: 'US$51.80', label: 'Intl. silver futures / oz · +5.5%' },
  { value: '₹1,42,224', label: 'MCX gold Dec futures / 10g' },
  { value: '₹1,84,095', label: 'MCX silver Dec futures / kg' }
];

const snapshotRows = [
  {
    asset: 'International gold futures',
    level: 'Near US$4,065 / oz',
    direction: '▲ 4.6%',
    driver: 'Recovery after four weeks of decline, with improved global sentiment.'
  },
  {
    asset: 'International silver futures',
    level: 'Near US$51.80 / oz',
    direction: '▲ 5.5%',
    driver: 'Outperformed gold, in line with silver’s greater price volatility.'
  },
  {
    asset: 'MCX gold December futures',
    level: '₹1,42,224 / 10g',
    direction: '▲ Recovered',
    driver: 'Indicative futures settlement. This is not a retail jewellery quotation.'
  },
  {
    asset: 'MCX silver December futures',
    level: '₹1,84,095 / kg',
    direction: '▲ Recovered',
    driver: 'Festive buying interest supported the domestic market after October’s correction.'
  }
];

const goldDrivers = [
  {
    title: 'A bounce, not yet a new trend',
    text: 'Gold futures rose about 4.6% and silver futures about 5.5%. One strong week follows four weeks of decline.'
  },
  {
    title: 'Silver led the move',
    text: 'Silver outperformed gold, which fits its usually wider swings. That same volatility can reverse just as quickly.'
  },
  {
    title: 'Buying interest returned',
    text: 'Improved global sentiment and renewed buying interest supported both metals in the first week of November 2026.'
  }
];

const digitalPoints = [
  {
    title: 'Values moved with bullion',
    text: 'Digital gold and silver generally improved as underlying bullion prices recovered.'
  },
  {
    title: 'SIPs spread the price',
    text: 'Systematic plans can spread purchases across different price levels. They do not remove investment risk.'
  },
  {
    title: 'Charges still apply',
    text: 'GST, provider spreads, and other applicable charges affect the return an investor actually receives.'
  }
];

const takeaways = [
  {
    title: 'US interest rates',
    text: 'Federal Reserve expectations and economic data continued to shape sentiment.'
  },
  {
    title: 'US dollar',
    text: 'Earlier dollar weakness supported bullion. Later strength restrained the gains.'
  },
  {
    title: 'Geopolitics and energy',
    text: 'Middle East developments and changing crude oil prices affected safe-haven demand and inflation expectations.'
  }
];

const outlook = [
  {
    title: 'Window',
    text: 'The next watch period is 9–14 November 2026.'
  },
  {
    title: 'What this week does not prove',
    text: 'The rebound is encouraging. One week of gains does not confirm a lasting trend reversal.'
  },
  {
    title: 'What to monitor',
    text: 'The dollar, US interest-rate expectations, geopolitical developments, domestic demand, and silver’s higher volatility.'
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
  { id: 'etfs', label: 'ETFs' },
  { id: 'macro', label: 'International Developments' },
  { id: 'domestic', label: 'Domestic Developments' },
  { id: 'outlook', label: '9–14 Nov Outlook' }
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
  <span className="kh-gain-pill">{value}</span>
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
          <h1>Gold &amp; Silver Bounce Back After Four Weeks of Decline</h1>
          <p className="gs-hero-copy">
            Is the recovery sustainable? After four consecutive weeks of decline, gold and silver
            staged an encouraging recovery in the first week of November 2026, supported by improved
            global sentiment and renewed buying interest. This note covers physical metals, digital
            metals, ETFs, and the market outlook.
          </p>
          <div className="gs-hero-meta">
            <p className="gs-hero-badge">WEEK ENDED 7 NOV 2026</p>
            <p className="gs-hero-badge kh-hero-badge--accent">GOLD +4.6% · SILVER +5.5%</p>
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
              <p className="kh-eyebrow">Futures levels, week ended 7 November 2026</p>
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
                Indicative futures figures for the week ended 7 November 2026. These are not retail jewellery quotations. Check exchange data before use.
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
              <p className="kh-eyebrow">1. International gold and silver</p>
              <h2 className="kh-heading">Futures recovered, and silver led</h2>
            </div>
          </div>
          <p className="kh-prose">
            Gold futures rose approximately 4.6% to near US$4,065 per troy ounce. Silver futures
            rose approximately 5.5% to near US$51.80 per troy ounce. Silver outperformed gold,
            consistent with its typically greater price volatility.
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
              <h2 className="kh-heading">Domestic bullion recovered with the global bounce</h2>
            </div>
          </div>
          <p className="kh-prose">
            Indian bullion prices recovered. Indicative MCX December futures settlements were
            ₹1,42,224 per 10 grams for gold and ₹1,84,095 per kilogram for silver. These are futures
            prices, not retail jewellery quotations.
          </p>
          <p className="kh-prose kh-prose--spaced">
            Festive buying interest supported the domestic market after October’s correction.
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
              <h2 className="kh-heading">Digital values improved with bullion</h2>
            </div>
          </div>
          <p className="kh-prose">
            Digital gold and silver values generally improved with underlying bullion prices. A
            systematic plan can spread purchases across different price levels, but it does not
            eliminate investment risk. GST, provider spreads, and applicable charges affect actual
            investor returns.
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
              GST, provider spreads, and applicable charges change the return. Digital bullion and
              ETFs both carry market risk, and indicative prices move with the bullion market.
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
              <p className="kh-eyebrow">4. Gold and silver ETFs</p>
              <h2 className="kh-heading">Domestic and international funds joined the recovery</h2>
            </div>
          </div>
          <p className="kh-prose">
            Indian gold and silver ETFs participated in the recovery, with gains varying by fund.
            International products such as GLD, IAU, and SLV reflected stronger precious-metal
            markets.
          </p>
          <div className="kh-trend-card kh-takeaway">
            <p className="kh-eyebrow">Why ETF returns can differ</p>
            <h3 className="kh-subhead">Fees, currency, tracking, and premiums</h3>
            <p className="kh-assessment">
              ETF returns can differ from bullion movements because of fees, currency changes,
              tracking differences, and market premiums or discounts.
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
              <p className="kh-eyebrow">5. International developments</p>
              <h2 className="kh-heading">Rates, the dollar, and geopolitics set the tone</h2>
            </div>
          </div>
          <p className="kh-prose">
            The recovery sat on a mixed global backdrop. Rate expectations, the dollar, and energy
            prices all remained in play through the week ended 7 November 2026.
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
              <p className="kh-eyebrow">6. Domestic developments</p>
              <h2 className="kh-heading">Festive demand met a cheaper market</h2>
            </div>
          </div>
          <p className="kh-prose">
            Festive demand, the rupee–dollar exchange rate, and international bullion prices remained
            the main domestic influences. Lower prices after the recent correction encouraged renewed
            interest from some jewellery buyers and long-term investors.
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
              <p className="kh-eyebrow">7. Outlook for 9–14 November 2026</p>
              <h2 className="kh-heading">Encouraging, and still unconfirmed</h2>
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
            <h3 className="kh-subhead">Caution still belongs with the recovery</h3>
            <p className="kh-assessment">
              The recovery is encouraging, but caution remains essential. A disciplined, long-term
              approach may be preferable to reacting to short-term price movements.
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
            referrals, and buyback, for long-term allocation rather than a single week’s price.
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
              For educational and informational purposes only. This is not investment advice. Quoted
              prices and returns are indicative market figures for the week ended 7 November 2026
              and should be checked against exchange data. ETF and bullion investments carry market
              risk.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default KnowledgeHubPage;
