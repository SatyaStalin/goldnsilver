import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { legalAssets } from '../assets/images';
import './PageShell.css';
import './LegalPage.css';

const PHONE = '+91 - 9014449479';
const PHONE_TEL = '+919014449479';
const WHATSAPP_URL = 'https://wa.me/919014449479';
const EMAIL = 'support@goldnsilver.shop';

const HERO_PILLARS = [
  { title: 'Transparent', text: 'No hidden terms', icon: 'eye' },
  { title: 'Secure', text: 'Your data is safe', icon: 'lock' },
  { title: 'Fair', text: 'Customer first', icon: 'heart' },
  { title: 'Compliant', text: 'Regulatory aligned', icon: 'badge' }
];

const SAFEGOLD_TERMS_URL = 'https://app.safegold.com/terms-of-use';

const POLICIES = [
  {
    id: 'terms',
    num: '01',
    title: 'Terms & Conditions',
    icon: legalAssets.terms,
    tone: 'gold',
    intro: 'These terms govern your access to and use of GoldnSilver.shop and all our services.',
    points: [
      'By using our platform, you agree to these terms and all applicable laws.',
      'You must be at least 18 years old to use our services.',
      'All investments in Digital Gold & Silver and ETFs are subject to market risks.',
      'We reserve the right to modify or discontinue any service without prior notice.',
      'You are responsible for maintaining the confidentiality of your account.',
      'All disputes are subject to the jurisdiction of courts in India.',
      <>
        Digital gold services powered by SafeGold are also subject to{' '}
        <a href={SAFEGOLD_TERMS_URL} target="_blank" rel="noopener noreferrer">
          SafeGold&apos;s Terms of Use
        </a>
        .
      </>
    ],
    full: [
      'GoldnSilver.shop is owned and operated by Nihar Info Global Limited. These terms apply to every visit, account, order, and investment product on the platform.',
      'You agree to complete KYC where required, provide accurate details, and not use the platform for unlawful activity. We may suspend access if we reasonably believe these terms have been breached.',
      'Prices of gold, silver, and related products fluctuate. Quotes shown at checkout are valid only for the stated window. Once payment is confirmed, physical and digital orders follow the product-specific fulfilment rules.',
      <>
        For digital gold bought or sold through SafeGold, you also agree to{' '}
        <a href={SAFEGOLD_TERMS_URL} target="_blank" rel="noopener noreferrer">
          SafeGold&apos;s Terms of Use
        </a>{' '}
        (
        <a href={SAFEGOLD_TERMS_URL} target="_blank" rel="noopener noreferrer">
          {SAFEGOLD_TERMS_URL}
        </a>
        ), which apply in addition to these platform terms.
      </>
    ]
  },
  {
    id: 'privacy',
    num: '02',
    title: 'Privacy Policy',
    icon: legalAssets.privacy,
    tone: 'indigo',
    intro:
      'Your privacy is important to us. This policy explains how we collect, use, disclose and protect your information.',
    points: [
      'We collect only necessary information to provide and improve our services.',
      'Your data is used to process transactions, provide support and enhance user experience.',
      'We do not sell or share your personal data with third parties for marketing.',
      'We use industry-standard security measures to protect your information.',
      'You can request access, correction or deletion of your personal data at any time.'
    ],
    full: [
      'We may collect name, contact details, KYC documents, order history, and device information needed for security and fulfilment.',
      'Payment card data is processed by our payment partners and is not stored on our servers. Vault and brokerage partners receive only what is required to complete a service you requested.',
      'To exercise your data rights, email support@goldnsilver.shop. We respond within a reasonable period as required by applicable law.'
    ]
  },
  {
    id: 'refund',
    num: '03',
    title: 'Refund Policy',
    icon: legalAssets.refund,
    tone: 'green',
    intro: 'We offer a simple and hassle-free refund process in applicable cases.',
    points: [
      'Refunds are applicable only in specific cases such as failed transactions.',
      'Physical products: Refunds are accepted within 7 days of delivery if damaged or incorrect.',
      'Digital Gold, Silver & ETF purchases are non-refundable once the transaction is completed.',
      'Refund requests are processed within 5–7 business days to the original payment method.',
      'For any refund-related queries, contact our support team within 24 hours.'
    ],
    full: [
      'If a payment is captured but the order cannot be fulfilled, we initiate a refund to the original payment method. Bank timelines may add extra days after we process the refund.',
      'Physical product returns must include original packaging and certificates. Items that are used, damaged by the customer, or missing documentation may not qualify.',
      'Approved refunds are issued only to the original payer. We cannot credit a different account for compliance reasons.'
    ]
  },
  {
    id: 'shipping',
    num: '04',
    title: 'Shipping Policy',
    icon: legalAssets.shipping,
    tone: 'purple',
    intro: 'We ensure safe, secure and timely delivery of all physical gold and silver products.',
    points: [
      'All physical products are shipped through trusted and insured logistics partners.',
      'Orders are usually processed within 1–2 business days.',
      'Delivery timelines vary by location and are generally 2–5 business days.',
      'Products are securely packed, tamper-proof and fully insured.',
      'You will receive a tracking ID once your order is shipped.'
    ],
    full: [
      'Delivery is available to serviceable pincodes in India. Remote locations may take longer than the standard 2–5 business days.',
      'Someone 18 years or older may need to be present to receive high-value consignments. Please keep a valid ID ready if the courier requests verification.',
      'If a package appears tampered with, refuse delivery and contact support immediately with photos and the tracking ID.'
    ]
  },
  {
    id: 'disclaimer',
    num: '05',
    title: 'Disclaimer',
    icon: legalAssets.disclaimer,
    tone: 'orange',
    intro: 'Important information about our services and market-related risks.',
    points: [
      'Investments in gold, silver and ETFs are subject to market risks and price volatility.',
      'Past performance is not indicative of future returns.',
      'We are not a SEBI-registered investment advisor. Please consult your financial advisor.',
      'Information on this platform is for educational purposes only.',
      'We do not guarantee accuracy, completeness or timeliness of the information provided.'
    ],
    full: [
      'Live rates, ETF data, and market commentary may be delayed or sourced from third parties. Always verify critical figures before placing an order.',
      'Nihar Info Global Limited / GoldnSilver.shop does not guarantee profits. You are solely responsible for your investment decisions.',
      'Statutory filings, GSTIN, and CIN details are published in the site footer. For grievances, use Contact & Support or email support@goldnsilver.shop.'
    ]
  }
];

function PillarIcon({ type }) {
  if (type === 'eye') {
    return (
      <svg viewBox="0 0 48 48" fill="none" aria-hidden="true">
        <path
          d="M24 10c-9.5 0-17 10-17 14s7.5 14 17 14 17-10 17-14-7.5-14-17-14Z"
          stroke="currentColor"
          strokeWidth="2.4"
        />
        <circle cx="24" cy="24" r="5.5" fill="currentColor" />
      </svg>
    );
  }
  if (type === 'lock') {
    return (
      <svg viewBox="0 0 48 48" fill="none" aria-hidden="true">
        <rect x="12" y="22" width="24" height="18" rx="3" stroke="currentColor" strokeWidth="2.4" />
        <path d="M17 22v-5a7 7 0 0 1 14 0v5" stroke="currentColor" strokeWidth="2.4" />
        <circle cx="24" cy="31" r="2.2" fill="currentColor" />
      </svg>
    );
  }
  if (type === 'heart') {
    return (
      <svg viewBox="0 0 48 48" fill="none" aria-hidden="true">
        <path
          d="M24 38s-12.5-7.4-12.5-16.2A7 7 0 0 1 24 15.5a7 7 0 0 1 12.5 6.3C36.5 30.6 24 38 24 38Z"
          stroke="currentColor"
          strokeWidth="2.4"
          strokeLinejoin="round"
        />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 48 48" fill="none" aria-hidden="true">
      <path
        d="M24 7 38 14v10.5c0 8.4-5.8 14.8-14 17.4C15.8 39.3 10 32.9 10 24.5V14L24 7Z"
        stroke="currentColor"
        strokeWidth="2.4"
      />
      <path d="M17.5 24.5 22 29l8.5-9.5" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" />
    </svg>
  );
}

const LegalPage = () => {
  const location = useLocation();
  const [openId, setOpenId] = useState(null);

  useEffect(() => {
    const hash = location.hash.replace('#', '');
    if (hash && POLICIES.some((p) => p.id === hash)) {
      setOpenId(hash);
      document.getElementById(hash)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [location.hash]);

  return (
    <div className="gs-page lg-page">
      <section className="lg-hero" aria-label="Legal policies">
        <img src={legalAssets.banner} alt="" className="lg-hero-img" aria-hidden="true" />
        <div className="lg-hero-shade" aria-hidden="true" />
        <div className="lg-hero-content">
          <p className="lg-hero-kicker">
            <span className="lg-hero-shield" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none">
                <path
                  d="M12 3.5 19.5 7v5.2c0 4.2-2.9 7.4-7.5 8.8C7.4 19.6 4.5 16.4 4.5 12.2V7L12 3.5Z"
                  fill="currentColor"
                />
              </svg>
            </span>
            Legal
          </p>
          <h1>
            Our policies. Your <span className="lg-hero-accent">Protection</span>.
          </h1>
          <p className="lg-hero-lead">
            We believe in transparency and fairness. Read our policies to understand your rights and
            our responsibilities.
          </p>
          <div className="lg-pillars">
            {HERO_PILLARS.map((item) => (
              <div key={item.title} className="lg-pillar">
                <span className="lg-pillar-ico">
                  <PillarIcon type={item.icon} />
                </span>
                <strong>{item.title}</strong>
                <span>{item.text}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="lg-shell">
        <div className="lg-timeline">
          {POLICIES.map((policy, index) => {
            const expanded = openId === policy.id;
            return (
              <article key={policy.id} id={policy.id} className={`lg-row lg-row--${policy.tone}`}>
                <div className="lg-rail" aria-hidden="true">
                  <span className="lg-rail-badge">{policy.num}</span>
                  {index < POLICIES.length - 1 && <span className="lg-rail-line" />}
                </div>

                <div className="lg-row-media">
                  <img src={policy.icon} alt="" />
                </div>

                <div className="lg-panel">
                  <h2>{policy.title}</h2>
                  <p className="lg-panel-intro">{policy.intro}</p>
                  <ul>
                    {policy.points.map((pt, i) => (
                      <li key={`${policy.id}-pt-${i}`}>{pt}</li>
                    ))}
                  </ul>
                  {expanded && (
                    <div className="lg-panel-full">
                      {policy.full.map((p, i) => (
                        <p key={`${policy.id}-full-${i}`}>{p}</p>
                      ))}
                    </div>
                  )}
                  <button
                    type="button"
                    className="lg-read-btn"
                    onClick={() => setOpenId(expanded ? null : policy.id)}
                  >
                    {expanded ? 'Hide Policy ←' : 'Read Full Policy →'}
                  </button>
                </div>
              </article>
            );
          })}
        </div>

        <section className="lg-help" aria-label="Need help">
          <p className="lg-help-eyebrow">WE ARE HERE TO HELP</p>
          <h2>Need Help?</h2>
          <p className="lg-help-lead">
            Our support team is always ready to assist you with any questions or concerns.
          </p>
          <div className="lg-help-grid">
            <article className="lg-help-card">
              <div className="lg-help-ico lg-help-ico--mail" aria-hidden="true">
                ✉
              </div>
              <div>
                <h3>Email Support</h3>
                <p>We usually respond within 24 business hours.</p>
                <a href={`mailto:${EMAIL}`}>{EMAIL}</a>
              </div>
            </article>
            <article className="lg-help-card">
              <div className="lg-help-ico lg-help-ico--call" aria-hidden="true">
                ☎
              </div>
              <div>
                <h3>Call Us</h3>
                <p>Mon - Sat: 9:00 AM to 6:00 PM</p>
                <a className="lg-help-phone" href={`tel:${PHONE_TEL}`}>
                  {PHONE}
                </a>
              </div>
            </article>
            <article className="lg-help-card">
              <div className="lg-help-ico lg-help-ico--wa" aria-hidden="true">
                💬
              </div>
              <div>
                <h3>WhatsApp Support</h3>
                <p>Chat with us instantly on WhatsApp.</p>
                <a className="lg-wa-btn" href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer">
                  Chat on WhatsApp
                </a>
              </div>
            </article>
          </div>
          <p className="lg-help-more">
            More questions? Visit our <Link to="/contact-support">Contact &amp; Support</Link> page.
          </p>
        </section>
      </div>

    </div>
  );
};

export default LegalPage;
