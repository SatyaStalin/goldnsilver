const PurityCertificationPage = () => {
  return (
    <div className="page">
      <div className="page-hero">
        <h1 className="page-hero-title">Purity & Certification</h1>
        <p className="page-hero-desc">
          Guaranteed purity standards and certification for all our gold and silver products.
        </p>
      </div>

      <div className="grid-two">
        <section className="panel page-feature">
          <h2>Purity Standards</h2>
          <div className="list-cards">
            <article className="list-card">
              <div>
                <h3>24K Gold (99.9% Pure)</h3>
                <p>Digital gold and physical coins meet international purity standards of 99.9% or higher.</p>
                <p className="muted">BIS certified & internationally approved</p>
              </div>
            </article>
            <article className="list-card">
              <div>
                <h3>Silver (99.9% Pure)</h3>
                <p>All silver products are certified 99.9% pure with proper assay certification.</p>
                <p className="muted">International standards</p>
              </div>
            </article>
          </div>
        </section>

        <section className="panel page-feature">
          <h2>Certification & Compliance</h2>
          <ul className="bullet-list">
            <li>Hallmark certification for all physical products</li>
            <li>BIS (Bureau of Indian Standards) approved</li>
            <li>Third-party assay reports available</li>
            <li>Audit-ready transaction history</li>
            <li>KYC & AML compliant processes</li>
            <li>SEBI-registered advisors and distributors</li>
          </ul>

          <h3>Quality Assurance</h3>
          <p>
            Every product undergoes rigorous quality checks and comes with proper documentation 
            including purity certificates, assay reports, and authenticity guarantees.
          </p>
        </section>
      </div>
    </div>
  );
};

export default PurityCertificationPage;
