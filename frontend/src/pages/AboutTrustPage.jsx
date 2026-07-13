const services = [
  'Physical Gold and Silver',
  'Digital Gold and Silver',
  'Gold & Silver ETFs',
  'Precious Metal Investment Solutions',
  'Gold Loans',
  'Buyback Services',
  'Live Market Prices and Insights',
  'Integrated Digital Commerce'
];

const AboutTrustPage = () => {
  return (
    <div className="page about-nihar-page">
      <section className="about-nihar-hero" aria-label="About Nihar Info Global">
        <div className="about-nihar-hero-glow" aria-hidden="true" />
        <div className="about-nihar-hero-inner">
          <p className="about-nihar-brand">GoldnSilver.shop</p>
          <h1 className="about-nihar-hero-title">About Nihar Info Global Ltd.</h1>
          <p className="about-nihar-hero-lead">
            A BSE-listed company with three decades of technology-driven excellence —
            building India&apos;s trusted digital ecosystem for gold and silver.
          </p>
        </div>
      </section>

      <section className="about-nihar-section about-nihar-intro">
        <div className="about-nihar-section-inner">
          <p className="about-nihar-eyebrow">The Company</p>
          <h2 className="about-nihar-heading">Nihar Info Global Limited</h2>
          <div className="about-nihar-prose">
            <p>
              GoldnSilver.shop is an initiative of Nihar Info Global Limited, a publicly listed
              company on the BSE with over three decades of experience in technology-driven
              business solutions. Established with a vision of leveraging technology to create
              value, the company has expanded into digital commerce, B2B commerce, and precious
              metals.
            </p>
            <p>
              Driven by innovation, transparency, and customer trust, Nihar Info Global Limited
              is building a comprehensive digital ecosystem that makes buying, selling,
              investing, and managing gold and silver simple, secure, and accessible.
            </p>
          </div>
          <div className="about-nihar-pillars" aria-label="Core values">
            <span>Innovation</span>
            <span>Transparency</span>
            <span>Customer Trust</span>
          </div>
        </div>
      </section>

      <section className="about-nihar-section about-nihar-leadership">
        <div className="about-nihar-section-inner about-nihar-leadership-grid">
          <div className="about-nihar-leadership-copy">
            <p className="about-nihar-eyebrow">Leadership</p>
            <h2 className="about-nihar-heading">B.S.N. Suryanarayana</h2>
            <p className="about-nihar-role">FCA, ACS · Chief Promoter &amp; Founding Visionary</p>
            <div className="about-nihar-prose">
              <p>
                B.S.N. Suryanarayana, FCA, ACS, is the Chief Promoter and one of the founding
                visionaries of Nihar Info Global Limited. A distinguished Chartered Accountant,
                Company Secretary, entrepreneur, and corporate advisor with decades of
                professional experience, he has been instrumental in establishing businesses
                across finance, technology, capital markets, and digital commerce.
              </p>
              <p>
                His vision is to create a trusted and technology-enabled platform that brings
                together every major aspect of the gold and silver ecosystem under one roof
                while maintaining the highest standards of governance, compliance, and customer
                confidence.
              </p>
            </div>
          </div>
          <aside className="about-nihar-quote" aria-label="Leadership vision">
            <blockquote>
              A trusted, technology-enabled platform for every major aspect of the gold and
              silver ecosystem — under one roof.
            </blockquote>
          </aside>
        </div>
      </section>

      <section className="about-nihar-section about-nihar-platform">
        <div className="about-nihar-section-inner">
          <p className="about-nihar-eyebrow">The Platform</p>
          <h2 className="about-nihar-heading">About GoldnSilver.shop</h2>
          <div className="about-nihar-prose">
            <p>
              GoldnSilver.shop is an integrated digital platform designed to serve individuals,
              investors, jewellers, institutions, and businesses through a comprehensive range
              of precious metal solutions.
            </p>
            <p>
              The platform aims to provide a seamless experience across multiple services,
              including:
            </p>
          </div>
          <ul className="about-nihar-services">
            {services.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
          <p className="about-nihar-closing">
            Built on the principles of transparency, quality, security, and innovation,
            GoldnSilver.shop is committed to becoming one of India&apos;s most trusted
            destinations for precious metals by combining technology, professional expertise,
            and customer-centric service.
          </p>
        </div>
      </section>

      <section className="about-nihar-section about-nihar-vm">
        <div className="about-nihar-section-inner about-nihar-vm-grid">
          <article className="about-nihar-vm-block">
            <p className="about-nihar-eyebrow">Our Vision</p>
            <h2 className="about-nihar-heading">Trusted ecosystem for gold &amp; silver</h2>
            <p>
              To become India&apos;s most trusted integrated digital ecosystem for gold and
              silver by making precious metal ownership, investment, and commerce simple,
              transparent, secure, and accessible to everyone.
            </p>
          </article>
          <article className="about-nihar-vm-block">
            <p className="about-nihar-eyebrow">Our Mission</p>
            <h2 className="about-nihar-heading">Technology with lasting value</h2>
            <p>
              To leverage technology, professional expertise, and strategic partnerships to
              deliver world-class precious metal products and services while creating lasting
              value for customers, investors, and business partners.
            </p>
          </article>
        </div>
      </section>
    </div>
  );
};

export default AboutTrustPage;
