import './PageShell.css';
import './KnowledgeHubPage.css';

const glance = [
  { value: '-3.4%', label: 'Spot gold (global)' },
  { value: '-5.8%', label: 'Spot silver (global, SLV)' },
  { value: '-2.6%', label: 'Indian physical gold' },
  { value: '-5.0%', label: 'Indian physical silver' }
];

const ibjaRows = [
  {
    asset: 'Gold 999 (10g)',
    prior: '₹1,52,113 (25 Sep)',
    latest: '₹1,48,138',
    change: '-2.6%'
  },
  {
    asset: 'Silver 999 (1kg)',
    prior: '₹2,32,350 (25 Sep)',
    latest: '₹2,20,829',
    change: '-5.0%'
  }
];

const globalRows = [
  {
    instrument: 'Spot gold',
    prior: '~$4,285/oz',
    latest: '$4,140.06/oz',
    change: '-3.4%'
  },
  {
    instrument: 'Spot silver',
    prior: '~$64.07/oz',
    latest: '$60.36/oz',
    change: '-5.8%'
  },
  {
    instrument: 'SPDR Gold (GLD)',
    prior: '$393.41',
    latest: '$380.14',
    change: '-3.4%'
  },
  {
    instrument: 'iShares Silver (SLV)',
    prior: '$58.14',
    latest: '$54.74',
    change: '-5.8%'
  }
];

const etfRows = [
  { name: 'GOLDBEES', prior: '₹124.43', latest: '₹121.43', change: '-2.4%' },
  { name: 'SILVERBEES', prior: '₹218.80', latest: '₹208.71', change: '-4.6%' }
];

const drivers = [
  {
    title: 'Sharp Monday sell-off',
    text: 'Gold dropped about 4% internationally on Monday to a seven-week low, after rising crude oil prices raised inflation fears and interest-rate expectations.'
  },
  {
    title: 'Decadal-high US Treasury yields',
    text: 'US 10-year and 30-year Treasury yields reached levels unseen since 2002, raising the opportunity cost of holding non-yielding bullion.'
  },
  {
    title: 'Weak US payrolls and a temporary rally',
    text: 'Non-farm payrolls grew by just 29,000 in September, against 90,000 expected, and August was revised down to 133,000. Gold surged over 1% above $4,220/oz after the release, then faded as elevated bond yields reasserted themselves.'
  },
  {
    title: 'Shift in rate expectations',
    text: 'Traders cut the chance of an October Fed rate hike to 22%, down from about 70% earlier in the week.'
  }
];

const outlook = [
  { title: 'Fed commentary', text: 'Official remarks after the weak payroll print.' },
  { title: 'Yields and the dollar', text: 'Direction of US Treasury yields and the US Dollar Index.' },
  { title: 'Crude and inflation', text: 'Crude oil prices and inflation expectations.' },
  { title: 'Festive demand', text: 'How Indian physical buying responds through the festive season.' }
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
  { id: 'bullion', label: 'Physical Bullion' },
  { id: 'digital', label: 'Digital Gold' },
  { id: 'global', label: 'Global Markets' },
  { id: 'etfs', label: 'Indian ETFs' },
  { id: 'drivers', label: 'Macro Drivers' },
  { id: 'outlook', label: 'Next Week' }
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
          <p className="gs-hero-kicker">Market intelligence report</p>
          <h1>Gold &amp; Silver Weekly Review</h1>
          <p className="gs-hero-copy">
            Another volatile week, led by rising US Treasury yields, a stronger dollar, and shifting
            Federal Reserve expectations. A Friday rally of over 1% after weak US jobs data faded by
            the US close. Spot gold ended the week down about 3.4% at $4,140.06/oz.
          </p>
          <div className="gs-hero-meta">
            <p className="gs-hero-badge">WEEK ENDED 2 OCT 2026</p>
            <p className="gs-hero-badge kh-hero-badge--down">SPOT GOLD −3.4%</p>
          </div>
          <p className="kh-hero-published">BSN Suryanarayana · GoldnSilver.shop</p>
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
              <p className="kh-eyebrow">Executive summary</p>
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
        </div>
      </section>

      <section id="bullion" className="gs-section kh-section">
        <div className="gs-panel kh-card">
          <div className="kh-card-head">
            <span className="kh-card-icon" aria-hidden="true">
              <IconChart />
            </span>
            <div>
              <p className="kh-eyebrow">1. Physical bullion — India</p>
              <h2 className="kh-heading">IBJA benchmark rates</h2>
            </div>
          </div>
          <p className="kh-prose">
            Markets were closed on Friday, 2 October, for Gandhi Jayanti. Rates compare 1 October
            afternoon with 25 September. Monday-to-Thursday movement was flat: gold +0.1% and silver
            −1.0%. Most of the correction came in early Monday trading.
          </p>
          <div className="kh-table-wrap">
            <table className="kh-table">
              <caption className="kh-table-caption">IBJA benchmark</caption>
              <thead>
                <tr>
                  <th scope="col">Asset</th>
                  <th scope="col">25 Sep</th>
                  <th scope="col">1 Oct PM</th>
                  <th scope="col">Change</th>
                </tr>
              </thead>
              <tbody>
                {ibjaRows.map((row) => (
                  <tr key={row.asset}>
                    <td className="kh-cell-asset">{row.asset}</td>
                    <td>{row.prior}</td>
                    <td>{row.latest}</td>
                    <td>
                      <ChangePill value={row.change} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <section id="digital" className="gs-section kh-section">
        <div className="gs-panel kh-card">
          <div className="kh-card-head">
            <span className="kh-card-icon" aria-hidden="true">
              <IconInsight />
            </span>
            <div>
              <p className="kh-eyebrow">2. Digital gold and silver</p>
              <h2 className="kh-heading">Flat through the week, lower versus last Friday</h2>
            </div>
          </div>
          <div className="kh-price-grid kh-price-grid--two">
            <article className="kh-price-card">
              <p className="kh-price-metal">₹15,178/g</p>
              <p className="kh-price-spec">Monday reference</p>
            </article>
            <article className="kh-price-card">
              <p className="kh-price-metal">₹15,186/g</p>
              <p className="kh-price-spec">Friday reference · −2.6% vs ₹15,595/g last Friday</p>
            </article>
          </div>
          <p className="kh-prose kh-prose--spaced">
            Digital gold reference pricing was almost unchanged from Monday to Friday, and still
            down 2.6% against the previous Friday. Tracked across SafeGold, Augmont, and MMTC-PAMP,
            including live spreads and GST.
          </p>
        </div>
      </section>

      <section id="global" className="gs-section kh-section">
        <div className="gs-panel kh-card">
          <div className="kh-card-head">
            <span className="kh-card-icon" aria-hidden="true">
              <IconChart />
            </span>
            <div>
              <p className="kh-eyebrow">3. Global markets and overseas ETFs</p>
              <h2 className="kh-heading">Friday final close, 2 October</h2>
            </div>
          </div>
          <div className="kh-table-wrap">
            <table className="kh-table kh-table--benchmark">
              <caption className="kh-table-caption">Global closes</caption>
              <thead>
                <tr>
                  <th scope="col">Instrument</th>
                  <th scope="col">25 Sep close</th>
                  <th scope="col">2 Oct close</th>
                  <th scope="col">Weekly change</th>
                </tr>
              </thead>
              <tbody>
                {globalRows.map((row) => (
                  <tr key={row.instrument}>
                    <td className="kh-cell-asset">{row.instrument}</td>
                    <td>{row.prior}</td>
                    <td>{row.latest}</td>
                    <td>
                      <ChangePill value={row.change} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
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
              <p className="kh-eyebrow">4. Indian ETFs</p>
              <h2 className="kh-heading">GOLDBEES and SILVERBEES</h2>
            </div>
          </div>
          <div className="kh-table-wrap">
            <table className="kh-table kh-table--etf">
              <caption className="kh-table-caption">Indian ETF closes</caption>
              <thead>
                <tr>
                  <th scope="col">ETF</th>
                  <th scope="col">25 Sep</th>
                  <th scope="col">1 Oct</th>
                  <th scope="col">Change</th>
                </tr>
              </thead>
              <tbody>
                {etfRows.map((row) => (
                  <tr key={row.name}>
                    <td className="kh-cell-asset">{row.name}</td>
                    <td>{row.prior}</td>
                    <td>{row.latest}</td>
                    <td>
                      <ChangePill value={row.change} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
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
              <p className="kh-eyebrow">What moved prices</p>
              <h2 className="kh-heading">Macroeconomic drivers behind the correction</h2>
            </div>
          </div>
          <div className="kh-driver-grid">
            {drivers.map((item, index) => (
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
              <p className="kh-eyebrow">What to watch next week</p>
              <h2 className="kh-heading">Four things on the calendar</h2>
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
              <p className="kh-eyebrow">Key takeaway</p>
              <h2 className="kh-heading">Weak jobs data, yields still in charge</h2>
            </div>
          </div>
          <p className="kh-prose">
            The week turned on the gap between weaker US employment data and persistently high bond
            yields. Gold could not hold its post-payroll rally, which shows how firmly inflation and
            yield anxiety still sit over the market. Silver kept its higher beta and wider swings.
          </p>
          <div className="kh-continuum">
            <h3>One platform. The complete bullion ecosystem.</h3>
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
        </div>
      </section>
    </div>
  );
};

export default KnowledgeHubPage;
