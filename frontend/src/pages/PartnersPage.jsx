const PartnersPage = () => {
  return (
    <div className="page">
      <div className="page-hero">
        <h1 className="page-hero-title">Our Partners</h1>
        <p className="page-hero-desc">
          Trusted partnerships that power our gold and silver investment platform.
        </p>
      </div>

      <div className="grid-two">
        <section className="panel page-feature">
          <h2>Physical Gold & Silver Partners</h2>
          <div className="list-cards">
            <article className="list-card">
              <div>
                <h3>MMTC-PAMP</h3>
                <p>Premium physical gold and silver sourcing with international purity standards (99.9% and above).</p>
                <p className="muted">Certified bullion and coins</p>
              </div>
            </article>
            <article className="list-card">
              <div>
                <h3>Authorized Dealers</h3>
                <p>Network of verified dealers for physical delivery and redemption services.</p>
                <p className="muted">Nationwide coverage</p>
              </div>
            </article>
          </div>
        </section>

        <section className="panel page-feature">
          <h2>Financial Partners</h2>
          <ul className="bullet-list">
            <li>SEBI-registered mutual fund distributors</li>
            <li>Authorized ETF distributors</li>
            <li>NBFCs for financing and payouts</li>
            <li>Banking partners for secure transactions</li>
            <li>Payment gateway providers (Razorpay, Cashfree)</li>
          </ul>

          <h3>Depository Partners</h3>
          <ul className="bullet-list">
            <li>Central Depository Services (CDSL)</li>
            <li>National Securities Depository (NSDL)</li>
          </ul>
        </section>
      </div>
    </div>
  );
};

export default PartnersPage;
