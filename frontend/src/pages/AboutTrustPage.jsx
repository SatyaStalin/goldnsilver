import { mmtcAssets, aboutAssets } from '../assets/images';
import './PageShell.css';
import './AboutTrustPage.css';

const PILLARS = ['Innovation', 'Transparency', 'Customer Trust'];

const SERVICES_LEFT = [
  'Physical Gold and Silver',
  'Gold and Silver ETF’s',
  'Gold Loans',
  'Live market prices and insights'
];

const SERVICES_RIGHT = [
  'Digital Gold and Silver',
  'Precious Metal Investments',
  'Buyback Services',
  'Integrated Digital Commerce'
];

const DiamondIcon = () => (
  <span className="au-diamond" aria-hidden="true">
    ◆
  </span>
);

const AboutTrustPage = () => {
  return (
    <div className="gs-page au-page">
      <header className="au-page-title gs-section">
        <img src={mmtcAssets.titleLeft} alt="" className="au-title-ornament" />
        <h1>About Us</h1>
        <img src={mmtcAssets.titleRight} alt="" className="au-title-ornament" />
      </header>

      <section className="gs-section au-hero" aria-label="About Nihar Info Global">
        <div className="au-hero-card">
          <img
            src={aboutAssets.logoGold}
            alt="GoldnSilver.shop"
            className="au-hero-logo"
          />
          <h2>About Nihar Info Global Ltd.</h2>
          <p>
            A BSE-listed company with three decades of technology-driven excellence — building
            India&apos;s trusted digital ecosystem for gold and silver.
          </p>
        </div>
      </section>

      <section className="gs-section au-panel" aria-label="The Company">
        <p className="au-eyebrow">THE COMPANY</p>
        <h2 className="au-heading">Nihar Info Global Limited</h2>
        <p className="au-prose">
          GoldnSilver.shop is an initiative of Nihar Info Global Limited, a publicly listed company
          on the BSE with over three decades of experience in technology-driven business solutions.
          Established with a vision of leveraging technology to create value, the company has
          expanded into digital commerce, B2B commerce, and precious metals. Driven by innovation,
          transparency, and customer trust, Nihar Info Global Limited is building a comprehensive
          digital ecosystem that makes buying, selling, investing, and managing gold and silver
          simple, secure, and accessible.
        </p>
        <div className="au-divider" aria-hidden="true" />
        <div className="au-pillars" aria-label="Core values">
          {PILLARS.map((item) => (
            <span key={item}>{item}</span>
          ))}
        </div>
      </section>

      <section className="gs-section au-panel au-leadership" aria-label="Leadership">
        <div className="au-leadership-grid">
          <div className="au-leadership-copy">
            <p className="au-eyebrow">Leadership</p>
            <h2 className="au-heading au-heading--left">B.S.N Suryanarayana</h2>
            <p className="au-role">FCA, ACS · Chief Promoter and founding visionary</p>
            <p className="au-prose">
              B.S.N. Suryanarayana, FCA, ACS, is the Chief Promoter and one of the founding
              visionaries of Nihar Info Global Limited. A distinguished Chartered Accountant,
              Company Secretary, entrepreneur, and corporate advisor with decades of professional
              experience, he has been instrumental in establishing businesses across finance,
              technology, capital markets, and digital commerce. His vision is to create a trusted
              and technology-enabled platform that brings together every major aspect of the gold
              and silver ecosystem under one roof while maintaining the highest standards of
              governance, compliance, and customer confidence.
            </p>
          </div>
          <div className="au-leadership-logo-wrap">
            <img
              src={aboutAssets.logoGold}
              alt="GoldnSilver.shop"
              className="au-leadership-logo"
            />
          </div>
        </div>
      </section>

      <section className="gs-section au-panel au-platform" aria-label="The Platform">
        <p className="au-eyebrow">THE PLATFORM</p>
        <h2 className="au-heading au-heading--left">About GoldnSilver.shop</h2>
        <p className="au-prose">
          GoldnSilver.shop is an integrated digital platform designed to serve individuals,
          investors, jewellers, institutions, and businesses through a comprehensive range of
          precious metal solutions. The platform aims to provide a seamless experience across
          multiple services, including:
        </p>
        <div className="au-services">
          <ul>
            {SERVICES_LEFT.map((item) => (
              <li key={item}>
                <DiamondIcon />
                <span>{item}</span>
              </li>
            ))}
          </ul>
          <ul>
            {SERVICES_RIGHT.map((item) => (
              <li key={item}>
                <DiamondIcon />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="au-divider" aria-hidden="true" />
        <p className="au-prose au-closing">
          Built on the principles of transparency, quality, security, and innovation,
          GoldnSilver.shop is committed to becoming one of India&apos;s most trusted destinations
          for precious metals by combining technology, professional expertise, and customer-centric
          service.
        </p>
      </section>

      <section className="gs-section au-vm" aria-label="Vision and Mission">
        <article className="au-vm-card">
          <p className="au-eyebrow">Our Vision</p>
          <h3>About GoldnSilver.shop</h3>
          <p>
            To become India&apos;s most trusted integrated digital ecosystem for gold and silver by
            making precious metal ownership, investment, and commerce simple, transparent, secure,
            and accessible to everyone.
          </p>
        </article>
        <article className="au-vm-card">
          <p className="au-eyebrow">Our Mission</p>
          <h3>Technology with Lasting Value</h3>
          <p>
            To leverage technology, professional expertise, and strategic partnerships to deliver
            world-class precious metal products and services while creating lasting value for
            customers, investors, and business partners.
          </p>
        </article>
      </section>
    </div>
  );
};

export default AboutTrustPage;
