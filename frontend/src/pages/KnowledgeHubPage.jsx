import './PageShell.css';
import './KnowledgeHubPage.css';

const glance = [
  { value: '$3,524.35', label: 'Gold, Friday 20 Nov close / oz · −9.1%' },
  { value: '$40.97', label: 'Silver, Friday 20 Nov close / oz · −15.9%' },
  { value: '₹1,23,584', label: 'IBJA 999 gold, 20 Nov morning / 10g · −9.1%' },
  { value: '₹1,50,650', label: 'IBJA 999 silver, 20 Nov morning / kg · −15.1%' }
];

const priceRows = [
  {
    metal: 'Gold',
    yearEnd: '$4,322.61',
    record: '$5,594.82',
    prev: '$3,878.05',
    close: '$3,524.35',
    week: '9.1%',
    ytd: '18.5%',
    fromRecord: '37.0%'
  },
  {
    metal: 'Silver',
    yearEnd: '$71.64',
    record: '$121.64',
    prev: '$48.73',
    close: '$40.97',
    week: '15.9%',
    ytd: '42.8%',
    fromRecord: '66.3%'
  }
];

const historyRows = [
  { period: '1974–76', fall: '43%' },
  { period: '1980–82', fall: '52%' },
  { period: '1983–85', fall: '42%' },
  { period: '1987–99', fall: '48%' },
  { period: '2011–15', fall: '42%' }
];

const indiaRows = [
  {
    metal: 'Gold, per 10 grams',
    prev: '₹1,35,884',
    close: '₹1,23,584',
    change: '−9.1%'
  },
  {
    metal: 'Silver, per kilogram',
    prev: '₹1,77,500',
    close: '₹1,50,650',
    change: '−15.1%'
  }
];

const etfRows = [
  {
    name: 'India · Nippon India ETF Gold BeES (GOLDBEES)',
    prev: '₹111.90',
    close: '₹102.20',
    change: '−8.7%'
  },
  {
    name: 'India · Nippon India Silver ETF (SILVERBEES)',
    prev: '₹168.80',
    close: '₹146.80',
    change: '−13.0%'
  },
  {
    name: 'US · SPDR Gold Shares (GLD)',
    prev: '$355.45',
    close: '$322.87',
    change: '−9.2%'
  },
  {
    name: 'US · iShares Silver Trust (SLV)',
    prev: '$44.13',
    close: '$36.97',
    change: '−16.2%'
  }
];

const levelCards = [
  {
    title: 'Gold near $3,500',
    text: 'Reuters reported stronger physical buying in India and China as prices fell. Kitco also reported that investors were selling liquid assets to raise cash during the equity sell-off. A weekly close above $3,500, followed by a pullback that holds above the recent low, would strengthen the case that gold is stabilising.'
  },
  {
    title: 'Silver near $41',
    text: 'Silver lost nearly 16% this week and roughly two-thirds from its January high. From around $41, it would take a gain of almost 197% to return to that record. A sharp rebound can therefore leave silver well below its peak. For signs of a bottom, watch whether it can hold near $41 on a retest and then establish a higher low.'
  }
];

const digitalPoints = [
  {
    title: 'Spread the purchase',
    text: 'Digital products allow small purchases, making it possible to spread buying across several dates.'
  },
  {
    title: 'Check the full quote',
    text: 'Before buying, compare the provider’s buy and sell quotes, check who holds the metal, and understand the delivery charges and minimum redemption quantity. A wide spread can absorb much of an initial price recovery.'
  },
  {
    title: 'The product risk remains',
    text: 'SEBI has cautioned that platform-based digital gold sits outside its securities-market framework and carries counterparty and operational risks. For digital silver, review the provider’s custody, redemption, and regulatory terms. A lower metal price leaves those product risks in place.'
  }
];

const viewCards = [
  {
    title: 'Gold',
    text: 'A small first purchase can make sense for a long-term buyer who intends to build a position over time and can absorb another fall. Keep enough of the planned amount available to add if gold holds near $3,500 and forms a higher low.'
  },
  {
    title: 'Silver',
    text: 'Use a smaller first purchase or wait for a more convincing retest around $41. The depth of the decline makes silver worth watching, and this week’s volatility makes the size of each purchase especially important.'
  }
];

const sections = [
  { id: 'glance', label: 'How far prices fell' },
  { id: 'history', label: 'What history shows' },
  { id: 'india', label: 'India physical' },
  { id: 'digital', label: 'Digital metals' },
  { id: 'etfs', label: 'ETFs' },
  { id: 'outlook', label: 'Our view' }
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

const ChangePill = ({ value }) => <span className="kh-gain-pill kh-gain-pill--down">{value}</span>;

const KnowledgeHubPage = () => {
  return (
    <div className="gs-page kh-page">
      <section className="gs-hero gs-hero--gradient kh-hero" aria-label="Weekly market review">
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
          <p className="gs-hero-kicker">Weekly Gold &amp; Silver Market Review</p>
          <h1>Gold falls 9.1%, silver slides 15.9%. Is it time to start buying?</h1>
          <p className="gs-hero-copy">
            Market prices through Friday, 20 November. Gold closed the week near $3,524 per ounce,
            and silver ended near $41. The sell-off has taken gold 37.0% below its January record
            and silver 66.3% below its January record. Both metals are testing important price
            levels, but a durable bottom remains unconfirmed.
          </p>
          <div className="gs-hero-meta">
            <p className="gs-hero-badge">WEEK ENDED 21 NOV 2026</p>
            <p className="gs-hero-badge kh-hero-badge--down">GOLD −9.1% · SILVER −15.9%</p>
          </div>
          <p className="kh-hero-published">GoldnSilver.shop</p>
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
              <p className="kh-eyebrow">1. How much have gold and silver fallen?</p>
              <h2 className="kh-heading">US dollars per troy ounce</h2>
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
                Friday prices are Ausecure’s 5 p.m. New York dealer midpoints. January records are
                intraday spot highs reported by Reuters. Weekly and year-to-date changes are
                calculated from the displayed quotes.
              </caption>
              <thead>
                <tr>
                  <th scope="col">Metal</th>
                  <th scope="col">31 Dec 2025 reference</th>
                  <th scope="col">29 Jan 2026 intraday record</th>
                  <th scope="col">Friday, 13 Nov close</th>
                  <th scope="col">Friday, 20 Nov close</th>
                  <th scope="col">Fall this week</th>
                  <th scope="col">Fall in 2026 to date</th>
                  <th scope="col">Fall from the January record</th>
                </tr>
              </thead>
              <tbody>
                {priceRows.map((row) => (
                  <tr key={row.metal}>
                    <td className="kh-cell-asset">{row.metal}</td>
                    <td>{row.yearEnd}</td>
                    <td>{row.record}</td>
                    <td>{row.prev}</td>
                    <td>{row.close}</td>
                    <td>
                      <ChangePill value={row.week} />
                    </td>
                    <td>
                      <ChangePill value={row.ytd} />
                    </td>
                    <td>
                      <ChangePill value={row.fromRecord} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="kh-prose kh-prose--spaced">
            The headline “Gold falls 30% from $5,600 to $3,900” was broadly accurate around the
            previous week’s close. This week’s decline took the fall from that record to 37%. The
            year-to-date loss is smaller because gold began 2026 near $4,323 and climbed sharply
            before reaching its January record.
          </p>
          <p className="kh-prose">Sources · Ausecure · Reuters, January records · Kitco</p>
        </div>
      </section>

      <section id="history" className="gs-section kh-section">
        <div className="gs-panel kh-card">
          <div className="kh-card-head">
            <span className="kh-card-icon" aria-hidden="true">
              <IconInsight />
            </span>
            <div>
              <p className="kh-eyebrow">2. What history tells us about the bottom</p>
              <h2 className="kh-heading">Past gold declines, and this year’s 37%</h2>
            </div>
          </div>
          <p className="kh-prose">
            The World Gold Council’s five major historical gold declines used monthly US-dollar gold
            prices. This year’s 37% figure measures the fall from an intraday record to a Friday
            quote, so the comparison is approximate. The historical record gives a sense of how deep
            gold bear markets can get. It gives little guidance on the price or timing of this bottom.
          </p>
          <div className="kh-table-wrap">
            <table className="kh-table">
              <caption className="kh-table-caption">
                World Gold Council major historical gold declines, monthly US-dollar prices.
              </caption>
              <thead>
                <tr>
                  <th scope="col">Episode</th>
                  <th scope="col">Decline</th>
                </tr>
              </thead>
              <tbody>
                {historyRows.map((row) => (
                  <tr key={row.period}>
                    <td className="kh-cell-asset">{row.period}</td>
                    <td>
                      <ChangePill value={row.fall} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="kh-driver-grid">
            {levelCards.map((item, index) => (
              <article key={item.title} className="kh-driver-card">
                <span className="kh-driver-num">{index + 1}</span>
                <h3>{item.title}</h3>
                <p>{item.text}</p>
              </article>
            ))}
          </div>
          <p className="kh-prose kh-prose--spaced">
            Sources · World Gold Council · Reuters, physical demand · Kitco · Ausecure · Reuters,
            January records
          </p>
        </div>
      </section>

      <section id="india" className="gs-section kh-section">
        <div className="gs-panel kh-card">
          <div className="kh-card-head">
            <span className="kh-card-icon" aria-hidden="true">
              <IconChart />
            </span>
            <div>
              <p className="kh-eyebrow">3. Physical gold and silver in India</p>
              <h2 className="kh-heading">IBJA 999-purity morning benchmark</h2>
            </div>
          </div>
          <p className="kh-prose">
            The comparison uses the morning benchmark on both Fridays because the 20 November IBJA
            release available for this review showed morning rates only. IBJA rates exclude GST and
            making charges.
          </p>
          <div className="kh-table-wrap">
            <table className="kh-table">
              <caption className="kh-table-caption">
                IBJA 999 gold per 10 grams and 999 silver per kilogram. Morning rates on 13 and 20
                November.
              </caption>
              <thead>
                <tr>
                  <th scope="col">Benchmark</th>
                  <th scope="col">13 Nov morning</th>
                  <th scope="col">20 Nov morning</th>
                  <th scope="col">Weekly change</th>
                </tr>
              </thead>
              <tbody>
                {indiaRows.map((row) => (
                  <tr key={row.metal}>
                    <td className="kh-cell-asset">{row.metal}</td>
                    <td>{row.prev}</td>
                    <td>{row.close}</td>
                    <td>
                      <ChangePill value={row.change} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="kh-prose kh-prose--spaced">
            When buying gold or silver coins or bars, ask for the full purchase price and the
            same-day buyback quote. The difference shows how far the price needs to rise before you
            break even. Compare products of the same purity. The benchmark above is for 999 fine
            silver, while sterling silver gifts contain 92.5% silver.
          </p>
          <p className="kh-prose">Sources · IBJA, 13 Nov · IBJA, 20 Nov</p>
        </div>
      </section>

      <section id="digital" className="gs-section kh-section">
        <div className="gs-panel kh-card">
          <div className="kh-card-head">
            <span className="kh-card-icon" aria-hidden="true">
              <IconInsight />
            </span>
            <div>
              <p className="kh-eyebrow">4. Digital gold and digital silver</p>
              <h2 className="kh-heading">A lower price does not remove the product risk</h2>
            </div>
          </div>
          <div className="kh-driver-grid">
            {digitalPoints.map((item, index) => (
              <article key={item.title} className="kh-driver-card">
                <span className="kh-driver-num">{index + 1}</span>
                <h3>{item.title}</h3>
                <p>{item.text}</p>
              </article>
            ))}
          </div>
          <p className="kh-prose kh-prose--spaced">Sources · SEBI</p>
        </div>
      </section>

      <section id="etfs" className="gs-section kh-section">
        <div className="gs-panel kh-card">
          <div className="kh-card-head">
            <span className="kh-card-icon" aria-hidden="true">
              <IconChart />
            </span>
            <div>
              <p className="kh-eyebrow">5. Domestic and overseas gold and silver ETFs</p>
              <h2 className="kh-heading">Exchange prices in each product’s trading currency</h2>
            </div>
          </div>
          <div className="kh-table-wrap">
            <table className="kh-table kh-table--etf">
              <caption className="kh-table-caption">
                These are exchange-price changes in each product’s trading currency, from the 13
                November close to the 20 November close.
              </caption>
              <thead>
                <tr>
                  <th scope="col">Listed product</th>
                  <th scope="col">13 Nov close</th>
                  <th scope="col">20 Nov close</th>
                  <th scope="col">Weekly change</th>
                </tr>
              </thead>
              <tbody>
                {etfRows.map((row) => (
                  <tr key={row.name}>
                    <td className="kh-cell-asset">{row.name}</td>
                    <td>{row.prev}</td>
                    <td>{row.close}</td>
                    <td>
                      <ChangePill value={row.change} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="kh-prose kh-prose--spaced">
            For Indian ETFs, compare the expense ratio, tracking difference, bid–ask spread, and
            market price relative to NAV. For overseas exposure, calculate the return in rupees
            after currency conversion and costs. Indian residents should also confirm product
            eligibility, the applicable remittance route, and tax treatment before investing.
          </p>
          <p className="kh-prose">Sources · GOLDBEES · SILVERBEES · GLD · SLV · RBI</p>
        </div>
      </section>

      <section id="outlook" className="gs-section kh-section">
        <div className="gs-panel kh-card">
          <div className="kh-card-head">
            <span className="kh-card-icon" aria-hidden="true">
              <IconBulb />
            </span>
            <div>
              <p className="kh-eyebrow">GoldnSilver.shop view for the coming week</p>
              <h2 className="kh-heading">A small first purchase, not a confirmed bottom</h2>
            </div>
          </div>
          <p className="kh-prose">
            Our view is that long-term investors who are below their intended allocation can consider
            a small first purchase in gold. Silver calls for smaller purchases or more patience.
          </p>
          <div className="kh-driver-grid">
            {viewCards.map((item, index) => (
              <article key={item.title} className="kh-driver-card">
                <span className="kh-driver-num">{index + 1}</span>
                <h3>{item.title}</h3>
                <p>{item.text}</p>
              </article>
            ))}
          </div>
          <p className="kh-prose kh-prose--spaced">Sources · Kitco</p>
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
              <h2 className="kh-heading">GoldnSilver.shop</h2>
            </div>
          </div>
          <p className="kh-prose">
            Weekly Gold &amp; Silver Market Review for the week ended 21 November 2026. Market
            observations run through Friday, 20 November 2026.
          </p>
          <div className="kh-disclaimer kh-takeaway">
            <strong>Disclaimer</strong>
            <p>
              Educational commentary, not personalised investment advice. Figures are the quotes
              supplied for this review and should be checked against the source. Friday international
              prices are Ausecure’s 5 p.m. New York dealer midpoints. January records are intraday
              spot highs reported by Reuters. The World Gold Council declines used monthly US-dollar
              prices, so the comparison with this year’s 37% intraday-to-Friday fall is approximate.
              IBJA rates are morning benchmarks and exclude GST and making charges. ETF changes are
              exchange prices in each product’s trading currency. Sources include Ausecure, Reuters,
              Kitco, the World Gold Council, IBJA (13 Nov and 20 Nov), SEBI, GOLDBEES, SILVERBEES,
              GLD, SLV, and RBI.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default KnowledgeHubPage;
