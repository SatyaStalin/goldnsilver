const physicalRows = [
  ['Opening Price (July 6)', '₹1,45,583', '₹2,33,157'],
  ['Closing Price (July 10)', '₹1,44,850', '₹2,23,670'],
  ['Weekly High', '₹1,45,583', '₹2,33,157'],
  ['Weekly Low', '₹1,42,350', '₹2,21,550'],
  ['Net Change', '-₹733', '-₹9,487'],
  ['% Change', '-0.50%', '-4.07%']
];

const digitalRows = [
  ['Purchase Volume', '12.45 kg', '385.20 kg'],
  ['Sale Volume', '2.10 kg', '42.60 kg'],
  ['Number of Transactions', '8,450', '14,120'],
  ['New Investors', '1,840', '2,910']
];

const etfRows = [
  ['Net Inflows / Outflows', '+₹84 Crore', '-₹12 Crore'],
  ['Trading Volume', '3.4M Units', '5.8M Units'],
  ['AUM Movement', '+0.65%', '-2.10%'],
  ['Best Performing ETF', 'Nippon India Gold BEES', 'HDFC Silver ETF']
];

const marketStats = [
  ['International Spot Gold', '$4,128.92 / oz'],
  ['International Spot Silver', '$60.25 / oz'],
  ['Gold-Silver Ratio', '68.53'],
  ['MCX Gold Futures (August)', '₹1,44,816 / 10g'],
  ['MCX Silver Futures (September)', '₹2,26,490 / kg'],
  ['COMEX Gold Futures (August)', '$4,139.50 / oz'],
  ['COMEX Silver Futures (September)', '$60.75 / oz'],
  ['USD/INR Exchange Rate', '₹95.65']
];

const sections = [
  { id: 'glance', label: 'At a Glance' },
  { id: 'physical', label: 'Physical Prices' },
  { id: 'digital', label: 'Digital Gold & Silver' },
  { id: 'etf', label: 'ETFs' },
  { id: 'regulatory', label: 'Regulatory' },
  { id: 'international', label: 'International' },
  { id: 'insights', label: 'Market Insights' },
  { id: 'invest', label: 'Investment Corner' },
  { id: 'stats', label: 'Market Statistics' }
];

const KnowledgeHubPage = () => {
  return (
    <div className="page kh-page">
      <section className="kh-hero" aria-label="Weekly market review">
        <div className="kh-hero-glow" aria-hidden="true" />
        <div className="kh-hero-inner">
          <p className="kh-kicker">Knowledge Hub</p>
          <h1 className="kh-hero-title">Weekly Gold &amp; Silver Market Review</h1>
          <p className="kh-hero-sub">GoldnSilver.shop</p>
          <p className="kh-week-badge">WEEK ENDED: JULY 18, 2026</p>
        </div>
      </section>

      <nav className="kh-toc" aria-label="Review sections">
        {sections.map((s) => (
          <a key={s.id} href={`#${s.id}`} className="kh-toc-link">
            {s.label}
          </a>
        ))}
      </nav>

      <section id="glance" className="kh-section">
        <div className="kh-card">
          <p className="kh-eyebrow">Overview</p>
          <h2 className="kh-heading">Gold &amp; Silver at a Glance</h2>
          <div className="kh-prose kh-prose-stack">
            <p>
              Precious metals faced significant headwinds this week, with gold booking its sharpest
              weekly international decline in nearly six weeks.
            </p>
            <p>
              The market witnessed a striking paradox: escalating US-Iran tensions sent crude oil
              prices soaring, which fueled fears of stubborn inflation. Instead of driving safe-haven
              buying into bullion, these inflation fears heightened expectations that the US Federal
              Reserve will keep interest rates elevated — or potentially raise them. A surging US
              Dollar and climbing yields ultimately dragged down non-yielding precious metals.
            </p>
          </div>

          <div className="kh-table-wrap kh-glance-table-wrap">
            <table className="kh-table kh-glance-table">
              <thead>
                <tr>
                  <th>Metal</th>
                  <th>International Price (Friday Close)</th>
                  <th>Indian MCX Price (Friday Close)</th>
                  <th>Weekly Trend</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><strong>Gold</strong></td>
                  <td>
                    ~$4,011 / oz
                    <span className="kh-table-note">Briefly slipped below $4,000</span>
                  </td>
                  <td>~₹1.41 Lakh / 10g</td>
                  <td className="kh-trend-down">Down 3.0% – 3.4%</td>
                </tr>
                <tr>
                  <td><strong>Silver</strong></td>
                  <td>~$56 / oz</td>
                  <td>~₹2.16 Lakh / kg</td>
                  <td className="kh-trend-down">Sharp Correction</td>
                </tr>
              </tbody>
            </table>
          </div>

          <p className="kh-prose kh-ratio-note">
            <strong>The Ratio Shift:</strong> Silver continued to underperform gold this week. As
            geopolitical uncertainty loomed, institutional investors clearly favored gold&apos;s
            traditional safe-haven status over silver&apos;s industrial-heavy profile.
          </p>

          <h3 className="kh-subhead">Key Market Drivers</h3>
          <ol className="kh-numbered-list">
            <li>
              <strong>The Geopolitical Paradox &amp; The Fed</strong>
              <p>
                Typically, geopolitical escalation triggers a flight to gold. However, the dominant
                narrative this week was driven by energy. Brent crude surged roughly 16% following
                the US-Iran flare-up. The market interpreted this spike as a massive inflationary
                shock, prompting traders to price in a meaningful probability of a Federal Reserve
                rate hike in September.
              </p>
            </li>
            <li>
              <strong>Retail Demand Sparks a Rebound</strong>
              <p>
                While paper markets sold off, the physical market saw a massive resurgence. The price
                correction acted as a trigger for retail buyers in India. Jewelers reported a 25%
                surge in store visits and inquiries in July compared to June, establishing a strong
                physical floor for prices.
              </p>
            </li>
            <li>
              <strong>Institutional Inflows Persist</strong>
              <p>
                Despite short-term price volatility, long-term investor appetite remains incredibly
                robust. June data highlights aggressive positioning in precious metal ETFs:
              </p>
              <ul className="kh-inline-stats">
                <li><strong>Gold ETFs:</strong> Attracted ₹3,443 crore in net inflows.</li>
                <li><strong>Silver ETFs:</strong> Led the charge with ₹4,286 crore in net inflows.</li>
              </ul>
            </li>
          </ol>

          <h3 className="kh-subhead">Outlook for the Week Ahead</h3>
          <p className="kh-prose">
            The immediate trajectory for bullion hinges on a delicate tug-of-war between Middle East
            developments and macroeconomic data.
          </p>
          <ul className="kh-list">
            <li>
              <strong>Gold&apos;s Edge:</strong> Expect gold to maintain a stronger baseline safety
              premium if US-Iran tensions escalate further.
            </li>
            <li>
              <strong>Silver&apos;s Risk:</strong> Silver is likely to experience higher volatility,
              as macro tightening fears weigh heavily on its industrial demand component.
            </li>
          </ul>

          <div className="kh-platform-view">
            <h3 className="kh-subhead">The GoldnSilver.shop View</h3>
            <p>
              The recent price correction is a healthy reality check that has successfully brought
              physical buyers back to the table. However, with intense geopolitical risk and hawkish
              interest-rate expectations pulling the markets in opposite directions, wild swings are
              guaranteed.
            </p>
            <p>
              <strong>Our Advice:</strong> Avoid chasing intraday momentum. Keep a close eye on
              Brent crude, the US Dollar Index (DXY), and Middle East headlines before deploying
              fresh capital.
            </p>
          </div>
        </div>
      </section>

      <section id="physical" className="kh-section">
        <div className="kh-card">
          <p className="kh-eyebrow">Section 1</p>
          <h2 className="kh-heading">Physical Gold &amp; Silver Price Movement</h2>
          <div className="kh-table-wrap">
            <table className="kh-table">
              <thead>
                <tr>
                  <th>Particulars</th>
                  <th>Gold (per 10g)</th>
                  <th>Silver (per kg)</th>
                </tr>
              </thead>
              <tbody>
                {physicalRows.map(([a, b, c]) => (
                  <tr key={a}>
                    <td>{a}</td>
                    <td>{b}</td>
                    <td>{c}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <h3 className="kh-subhead">Key Highlights</h3>
          <ul className="kh-list">
            <li>
              <strong>Macro vs. Geopolitics:</strong> Gulf tensions cushioned the downside, but
              rising crude oil fueled structural inflation worries, reinforcing expectations of
              tighter monetary policy.
            </li>
            <li>
              <strong>Silver Volatility:</strong> Silver acted as a high-beta asset, undergoing a
              sharper 4.07% correction compared to Gold&apos;s resilient 0.50% drop.
            </li>
            <li>
              <strong>Domestic Demand:</strong> Solid physical buying emerged at lower price
              levels, stabilizing the domestic market.
            </li>
          </ul>
        </div>
      </section>

      <section id="digital" className="kh-section">
        <div className="kh-card">
          <p className="kh-eyebrow">Section 2</p>
          <h2 className="kh-heading">Digital Gold &amp; Digital Silver</h2>
          <div className="kh-table-wrap">
            <table className="kh-table">
              <thead>
                <tr>
                  <th>Particulars</th>
                  <th>Gold</th>
                  <th>Silver</th>
                </tr>
              </thead>
              <tbody>
                {digitalRows.map(([a, b, c]) => (
                  <tr key={a}>
                    <td>{a}</td>
                    <td>{b}</td>
                    <td>{c}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <h3 className="kh-subhead">Market Highlights</h3>
          <ul className="kh-list">
            <li>
              <strong>Retail Accumulation:</strong> Multi-month lows triggered strong buy-the-dip
              volumes in both metals.
            </li>
            <li>
              <strong>SIP Resilience:</strong> Systematic investment plan flows remained completely
              steady, unaffected by weekly price swings.
            </li>
            <li>
              <strong>Micro-Investing:</strong> Retail buyers heavily favored digital silver to
              capitalize on the larger percentage dip.
            </li>
          </ul>
        </div>
      </section>

      <section id="etf" className="kh-section">
        <div className="kh-card">
          <p className="kh-eyebrow">Section 3</p>
          <h2 className="kh-heading">Gold &amp; Silver ETF Review</h2>
          <div className="kh-table-wrap">
            <table className="kh-table">
              <thead>
                <tr>
                  <th>Particulars</th>
                  <th>Gold ETFs</th>
                  <th>Silver ETFs</th>
                </tr>
              </thead>
              <tbody>
                {etfRows.map(([a, b, c]) => (
                  <tr key={a}>
                    <td>{a}</td>
                    <td>{b}</td>
                    <td>{c}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <h3 className="kh-subhead">ETF Commentary</h3>
          <ul className="kh-list">
            <li>
              <strong>Institutional Accumulation:</strong> Funds steadily absorbed liquid Gold ETFs
              during the price dip ahead of the upcoming festival season.
            </li>
            <li>
              <strong>Tactical Churn:</strong> High-net-worth investors trimmed minor positions in
              Silver ETFs as short-term industrial momentum slowed.
            </li>
            <li>
              <strong>Physical Premiums:</strong> Stable domestic physical premiums ($1 to $2 per
              ounce) indicated robust underlying physical demand versus paper derivatives.
            </li>
          </ul>
        </div>
      </section>

      <section id="regulatory" className="kh-section">
        <div className="kh-card">
          <p className="kh-eyebrow">Section 4</p>
          <h2 className="kh-heading">Government &amp; Regulatory Updates</h2>
          <ul className="kh-list">
            <li>
              <strong>Tariff Value:</strong> The Ministry of Finance marginally revised base import
              tariff values downward mid-week to match global spot price trends.
            </li>
            <li>
              <strong>Compliance:</strong> The Bureau of Indian Standards (BIS) deployed updated
              automated hallmark tracking guidelines across major domestic refining centers.
            </li>
            <li>
              <strong>Monetary:</strong> The RBI maintained strict oversight on secondary market
              Sovereign Gold Bond (SGB) liquidity as yields tracked spot rates.
            </li>
          </ul>
        </div>
      </section>

      <section id="international" className="kh-section">
        <div className="kh-card">
          <p className="kh-eyebrow">Section 5</p>
          <h2 className="kh-heading">International Developments</h2>
          <ul className="kh-list">
            <li>
              <strong>Federal Reserve Hawkishness:</strong> Newly appointed Fed Chair Kevin Warsh
              signaled a less predictable, tighter monetary path. Strong US economic indicators
              have led markets to price in a potential rate hike as early as September.
            </li>
            <li>
              <strong>Crude Oil &amp; Inflation:</strong> Escalating geopolitical risks in the Gulf
              pushed crude oil higher, feeding directly into structural global inflation
              expectations.
            </li>
            <li>
              <strong>Currency Cushion:</strong> The Indian Rupee hovered near the 95–96 per USD
              range. High oil prices kept the local currency under pressure, mathematically
              limiting the domestic drop in gold and silver prices.
            </li>
          </ul>
        </div>
      </section>

      <section id="insights" className="kh-section">
        <div className="kh-card">
          <p className="kh-eyebrow">Section 6</p>
          <h2 className="kh-heading">GoldnSilver.shop Market Insights</h2>
          <div className="kh-insight-grid">
            <article>
              <h3>Why Prices Moved</h3>
              <p>
                A hawkish Fed outlook triggered initial profit-taking, but deep structural support
                emerged as bullion remains the premier hedge against oil-driven global inflation.
              </p>
            </article>
            <article>
              <h3>What to Watch Next</h3>
              <p>
                Key triggers include upcoming US inflation prints, Gulf geopolitical escalations,
                and USD/INR exchange rate movements.
              </p>
            </article>
            <article>
              <h3>Short-Term Outlook</h3>
              <p>
                Gold is projected to consolidate within a stable range of ₹1,43,500 to ₹1,46,000.
                Silver looks to build a solid base above ₹2,20,000.
              </p>
            </article>
            <article>
              <h3>Long-Term Perspective</h3>
              <p>
                The structural bull run remains intact. Central bank diversification, global
                deficits, and sticky inflation make short-term corrections attractive accumulation
                zones.
              </p>
            </article>
          </div>
        </div>
      </section>

      <section id="invest" className="kh-section">
        <div className="kh-card">
          <p className="kh-eyebrow">Section 7</p>
          <h2 className="kh-heading">Investment Corner</h2>
          <div className="kh-invest-grid">
            <article>
              <h3>Long-Term Investors</h3>
              <p>
                Continue accumulating physical bullion on price dips; long-term structural
                fundamentals remain strongly upward.
              </p>
            </article>
            <article>
              <h3>SIP Investors</h3>
              <p>
                Maintain scheduled allocations. Market corrections offer optimal averaging
                conditions to acquire more units per rupee.
              </p>
            </article>
            <article>
              <h3>ETF Investors</h3>
              <p>
                Maintain core gold allocations as a liquid buffer against equity market
                volatility.
              </p>
            </article>
            <article>
              <h3>Jewellery Buyers</h3>
              <p>
                Take advantage of the current stabilization around ₹1,44,800 per 10g to lock in
                festive and wedding season purchases.
              </p>
            </article>
            <article className="kh-invest-wide">
              <h3>Traders</h3>
              <p>
                For MCX Gold, maintain stop-losses below ₹1,43,800 with targets near ₹1,45,900.
                For Silver, trade the range boundaries of ₹2,21,500 to ₹2,27,500.
              </p>
            </article>
          </div>
        </div>
      </section>

      <section id="stats" className="kh-section">
        <div className="kh-card">
          <p className="kh-eyebrow">Section 8</p>
          <h2 className="kh-heading">Market Statistics</h2>
          <div className="kh-table-wrap">
            <table className="kh-table kh-table-stats">
              <thead>
                <tr>
                  <th>Indicator</th>
                  <th>Value</th>
                </tr>
              </thead>
              <tbody>
                {marketStats.map(([k, v]) => (
                  <tr key={k}>
                    <td>{k}</td>
                    <td>{v}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <section className="kh-section">
        <div className="kh-quote">
          <p className="kh-eyebrow">Quote of the Week</p>
          <blockquote>
            Knowledge is the best investment. Understanding the precious metals market helps
            investors make informed decisions.
          </blockquote>
        </div>
      </section>

      <section className="kh-section kh-disclaimer-wrap">
        <div className="kh-disclaimer">
          <strong>Disclaimer</strong>
          <p>
            This review is provided for informational and educational purposes only. It does not
            constitute financial or investment advice. Always consult with a certified financial
            advisor before making investment decisions.
          </p>
        </div>
      </section>
    </div>
  );
};

export default KnowledgeHubPage;
