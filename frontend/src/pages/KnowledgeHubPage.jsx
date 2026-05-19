const KnowledgeHubPage = () => {
  return (
    <div className="page">
      <div className="page-hero">
        <h1 className="page-hero-title">Knowledge Hub</h1>
        <p className="page-hero-desc">
          Learn everything about gold, silver, SIPs, taxation, and smart allocation.
        </p>
      </div>

      <section className="panel page-feature">
        <h2>Featured Articles</h2>
        <ul className="bullet-list">
          <li>5 ways to use gold SIPs for your child&apos;s education.</li>
          <li>Physical vs Digital Gold vs Sovereign Gold Bonds.</li>
          <li>How much gold should be in your portfolio?</li>
        </ul>
      </section>
    </div>
  );
};

export default KnowledgeHubPage;
