import Home2Chrome from '../components/Home2Chrome';
import GsPageFooter from '../components/GsPageFooter';
import {
  partnerMmtc,
  partnerSafegold,
  partnerAugmont,
  partnerZerodha,
  partnerNse,
  partnerCashfree,
  partnerCms
} from '../assets/homepageMain';
import partnerUpi from '../assets/homepageMain/image 769.png';
import partnerVisa from '../assets/homepageMain/image 770.png';
import partnerRupay from '../assets/homepageMain/image 771.png';
import heroBanner from '../assets/partners/image 857.png';
import './PageShell.css';
import './PartnersPage.css';

const PARTNER_SECTIONS = [
  {
    title: 'Vaulting & Bullion Partners',
    icon: 'vault',
    logos: [
      { name: 'MMTC-PAMP', img: partnerMmtc },
      { name: 'SafeGold', img: partnerSafegold },
      { name: 'Augmont', img: partnerAugmont }
    ],
    partners: [
      {
        name: 'MMTC-PAMP',
        img: partnerMmtc,
        text: "India's most trusted bullion brand offering 24K 999.9 fine gold and silver products with global benchmarks in quality and purity."
      },
      {
        name: 'SafeGold',
        img: partnerSafegold,
        text: 'A leading digital gold platform enabling you to buy, sell, and store 24K gold securely with full transparency and 1:1 backing.'
      },
      {
        name: 'Augmont Gold For All',
        img: partnerAugmont,
        text: 'Empowering investors to build their gold wealth with flexible digital gold solutions, backed by industry-leading security.'
      }
    ]
  },
  {
    title: 'Market & Brokerage Partners',
    icon: 'market',
    logos: [
      { name: 'Zerodha', img: partnerZerodha },
      { name: 'NSE IX', img: partnerNse }
    ],
    partners: [
      {
        name: 'Zerodha',
        img: partnerZerodha,
        text: "India's largest retail stockbroker, offering seamless investment in domestic ETFs and financial products with cutting-edge technology."
      },
      {
        name: 'NSE IX (Gift City)',
        img: partnerNse,
        text: 'International Exchange at GIFT City enabling access to global ETFs and investment opportunities with world-class infrastructure.'
      }
    ]
  },
  {
    title: 'Payment Gateways & Logistics',
    icon: 'payment',
    logos: [
      { name: 'Cashfree', img: partnerCashfree },
      { name: 'CMS', img: partnerCms },
      { name: 'UPI', img: partnerUpi },
      { name: 'Visa', img: partnerVisa },
      { name: 'RuPay', img: partnerRupay }
    ],
    partners: [
      {
        name: 'Cashfree Payments',
        img: partnerCashfree,
        text: 'Secure and reliable payment gateway for a smooth and hassle-free transaction experience'
      },
      {
        name: 'CMS Logistics',
        img: partnerCms,
        text: 'Our trusted logistics partner ensuring safe, insured, and on-time delivery across India.'
      },
      {
        name: 'UPI / Visa / RuPay',
        icon: 'payments',
        text: 'Multiple secure payment options for your convenience and complete peace of mind.'
      }
    ]
  }
];

const TRUST_PILLARS = [
  {
    icon: 'shield',
    text: 'At GoldnSilver.shop, our partners are the backbone of trust, security, and customer satisfaction. Together, we bring you the best in gold and silver investments.'
  },
  {
    icon: 'verified',
    text: '100% Trusted Verified & Secure Partners'
  },
  {
    icon: 'insured',
    text: 'Safe & Insured Your Wealth, Our Priority'
  },
  {
    icon: 'transparency',
    text: 'Transparency First Honest. Clear. Reliable.'
  }
];

const SectionIcon = ({ type }) => {
  if (type === 'vault') {
    return (
      <svg viewBox="0 0 48 48" fill="none" aria-hidden="true">
        <rect x="8" y="18" width="32" height="24" rx="3" stroke="#C9A227" strokeWidth="2" />
        <circle cx="24" cy="30" r="4" stroke="#C9A227" strokeWidth="2" />
        <path d="M16 18V14a8 8 0 0116 0v4" stroke="#C9A227" strokeWidth="2" />
      </svg>
    );
  }
  if (type === 'market') {
    return (
      <svg viewBox="0 0 48 48" fill="none" aria-hidden="true">
        <path d="M8 34L18 22l8 8 14-16" stroke="#C9A227" strokeWidth="2" strokeLinejoin="round" />
        <path d="M32 14h8v8" stroke="#C9A227" strokeWidth="2" strokeLinejoin="round" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 48 48" fill="none" aria-hidden="true">
      <rect x="6" y="12" width="36" height="24" rx="4" stroke="#C9A227" strokeWidth="2" />
      <path d="M6 20h36" stroke="#C9A227" strokeWidth="2" />
      <rect x="10" y="28" width="10" height="4" rx="1" fill="#C9A227" />
    </svg>
  );
};

const PartnerEntryIcon = ({ partner }) => {
  if (partner.img) {
    return (
      <span className="op-partner-icon op-partner-icon--logo">
        <img src={partner.img} alt="" />
      </span>
    );
  }

  return (
    <span className="op-partner-icon op-partner-icon--svg" aria-hidden="true">
      <svg viewBox="0 0 24 24" fill="none">
        <rect x="2" y="5" width="20" height="14" rx="3" stroke="currentColor" strokeWidth="1.75" />
        <path d="M2 10h20" stroke="currentColor" strokeWidth="1.75" />
        <path d="M6 15h4" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
      </svg>
    </span>
  );
};

const TrustIcon = ({ type }) => {
  if (type === 'shield') {
    return (
      <svg viewBox="0 0 32 32" fill="none" aria-hidden="true">
        <path d="M16 3L6 8v8c0 7 4.5 13.5 10 15 5.5-1.5 10-8 10-15V8L16 3z" stroke="#744D22" strokeWidth="1.8" />
        <path d="M12 16l3 3 6-6" stroke="#744D22" strokeWidth="1.8" strokeLinejoin="round" />
      </svg>
    );
  }
  if (type === 'verified') {
    return (
      <svg viewBox="0 0 32 32" fill="none" aria-hidden="true">
        <circle cx="16" cy="16" r="12" stroke="#744D22" strokeWidth="1.8" />
        <path d="M11 16l3 3 7-7" stroke="#744D22" strokeWidth="1.8" strokeLinejoin="round" />
      </svg>
    );
  }
  if (type === 'insured') {
    return (
      <svg viewBox="0 0 32 32" fill="none" aria-hidden="true">
        <path d="M16 26s-8-4-8-10V8l8-4 8 4v8c0 6-8 10-8 10z" stroke="#744D22" strokeWidth="1.8" />
        <path d="M12 15h8v6h-8v-6z" stroke="#744D22" strokeWidth="1.8" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 32 32" fill="none" aria-hidden="true">
      <ellipse cx="16" cy="16" rx="12" ry="8" stroke="#744D22" strokeWidth="1.8" />
      <circle cx="16" cy="16" r="3" stroke="#744D22" strokeWidth="1.8" />
    </svg>
  );
};

const PartnersPage = () => {
  return (
    <div className="gs-page op-page">
      <Home2Chrome />

      <section
        className="gs-hero"
        aria-label="Our partners"
        style={{ backgroundImage: `url(${heroBanner})` }}
      >
        <div className="gs-hero-inner">
          <p className="gs-hero-kicker">STRONG PARTNERSHIPS. TRUSTED GROWTH.</p>
          <h1>Our Partners</h1>
          <p className="gs-hero-copy gs-hero-copy--bold">
            We collaborate with trusted leaders across bullion, finance, payments &amp; Logistics
            to deliver a secure and exceptional experience.
          </p>
          <svg className="op-hero-handshake" viewBox="0 0 40 28" fill="none" aria-hidden="true">
            <path d="M4 16l6-4 5 3 7-7 6 4 8-6" stroke="#C9A227" strokeWidth="2" strokeLinejoin="round" />
            <path d="M8 20l4 3M24 10l4 3" stroke="#C9A227" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </div>
      </section>

      <section className="gs-section">
        <div className="op-cards">
          {PARTNER_SECTIONS.map((section) => (
            <article key={section.title} className="op-card">
              <div className="op-card-head">
                <SectionIcon type={section.icon} />
                <h2>{section.title}</h2>
              </div>
              <div className="op-card-divider" aria-hidden="true">
                <span />
                <span className="op-card-diamond">◆</span>
                <span />
              </div>
              <div className="op-card-logos">
                {section.logos.map((logo) => (
                  <div key={logo.name} className="op-logo-wrap">
                    <img src={logo.img} alt={logo.name} />
                  </div>
                ))}
              </div>
              <div className="op-card-partners">
                {section.partners.map((partner) => (
                  <div key={partner.name} className="op-partner-entry">
                    <div className="op-partner-entry-head">
                      <PartnerEntryIcon partner={partner} />
                      <div>
                        <h3>{partner.name}</h3>
                        <p>{partner.text}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="gs-section">
        <div className="op-trust">
          {TRUST_PILLARS.map((item) => (
            <div key={item.text} className="op-trust-item">
              <TrustIcon type={item.icon} />
              <p>{item.text}</p>
            </div>
          ))}
        </div>
      </section>

      <GsPageFooter />
    </div>
  );
};

export default PartnersPage;
