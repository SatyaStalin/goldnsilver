const AboutTrustPage = () => {
  return (
    <div className="page">
      <div className="page-hero">
        <h1 className="page-hero-title">About Trust</h1>
        <p className="page-hero-desc">
          Transparency, compliance, and purity are at the core of everything we do.
        </p>
      </div>

      <div className="grid-two">
        <section className="panel page-feature">
          <h2>About Company</h2>
          <p>
            GoldTrust partners with SEBI-registered advisors, certified suppliers, and leading
            depositories to deliver a modern gold &amp; silver experience.
          </p>
          <h3>Partners</h3>
          <ul className="bullet-list">
            <li>Certified suppliers for physical sourcing.</li>
            <li>Registered mutual fund &amp; ETF distributors.</li>
            <li>NBFCs &amp; banks for financing and payouts.</li>
          </ul>
        </section>

        <section className="panel page-feature">
          <h2>Trust &amp; Compliance</h2>
          <ul className="bullet-list">
            <li>Purity Certification (99.9% and above).</li>
            <li>Audit-ready transaction history.</li>
            <li>KYC &amp; AML compliant flows.</li>
            <li>Dedicated Contact &amp; Support team.</li>
          </ul>
        </section>
      </div>
    </div>
  );
};

export default AboutTrustPage;

