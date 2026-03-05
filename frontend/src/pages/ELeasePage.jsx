const ELeasePage = () => {
  return (
    <div className="page">
      <div className="page-hero">
        <h1 className="page-hero-title">E-Lease Gold</h1>
        <p className="page-hero-desc">
          Earn a yield on your idle digital gold by leasing it to trusted partners.
        </p>
      </div>

      <section className="panel page-feature">
        <h2>How E-Lease Works</h2>
        <ol className="numbered-list">
          <li>Commit a part of your digital gold balance.</li>
          <li>We allocate it to verified borrowers (jewellers, institutions).</li>
          <li>You earn a fixed lease rate for the tenure.</li>
          <li>Gold is returned + lease income added to your wallet.</li>
        </ol>
      </section>
    </div>
  );
};

export default ELeasePage;

