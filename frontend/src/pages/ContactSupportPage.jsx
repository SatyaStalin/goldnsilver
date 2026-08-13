import { useState } from 'react';
import { Link } from 'react-router-dom';
import Home2Chrome from '../components/Home2Chrome';
import GsPageFooter from '../components/GsPageFooter';
import { useToast } from '../state/ToastContext';
import { contactSupportBannerFull } from '../assets/images';
import './PageShell.css';
import './ContactSupportPage.css';

const PHONE = '+91 9014449479';
const PHONE_TEL = '+919014449479';
const WHATSAPP_URL = 'https://wa.me/919014449479';
const EMAIL = 'support@goldnsilver.shop';

const VALUE_PROPS = [
  {
    title: 'Quick Response',
    text: 'We reply within 24 hours',
    icon: 'bolt'
  },
  {
    title: 'Secure & Trusted',
    text: 'Your data and Transactions are safe with us',
    icon: 'shield'
  },
  {
    title: 'Expert Support',
    text: 'Get help from our product experts',
    icon: 'expert'
  },
  {
    title: 'Customer First',
    text: 'Your satisfaction is our priority',
    icon: 'heart'
  }
];

const FAQ_LEFT = [
  {
    q: 'How can I track my order?',
    a: 'After placing an order, track status from your dashboard under Orders. You will also receive email and SMS updates at each fulfilment stage.'
  },
  {
    q: 'Are the products 100% genuine?',
    a: 'Yes. Physical products are sourced from trusted partners such as MMTC-PAMP and come with purity certification where applicable.'
  },
  {
    q: 'What payment methods do you accept?',
    a: 'We accept UPI, net banking, debit/credit cards, and other secure payment options shown at checkout.'
  }
];

const FAQ_RIGHT = [
  {
    q: 'How is my digital gold stored?',
    a: 'Digital gold is stored with our regulated vault partners. Your holdings are reflected in your account in real time and can be sold or delivered as per product rules.'
  },
  {
    q: 'Can I cancel or modify my order?',
    a: ' Once an order is placed, it cannot be canceled.replace the above answer with existing one.'
  },
  {
    q: 'How do I contact for bulk or corporate enquiries?',
    a: 'Use the contact form and mention “Bulk / Corporate”, or WhatsApp us. Our B2B team typically responds within one business day.'
  }
];

const QUICK_LINKS = [
  { title: 'Track Your Order', to: '/dashboard', icon: 'track' },
  { title: 'Returns & Refunds', to: '/legal#refund', icon: 'returns' },
  { title: 'Shipping Information', to: '/own', icon: 'ship' },
  { title: 'Bulk / Corporate Enquiry', to: '/contact-support#message', icon: 'bulk' }
];

function ValueIcon({ type }) {
  if (type === 'bolt') {
    return (
      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M13 2 4 14h7l-1 8 9-12h-7l1-8Z" fill="currentColor" />
      </svg>
    );
  }
  if (type === 'shield') {
    return (
      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path
          d="M12 3 5 6v5c0 4.5 3 7.8 7 9 4-1.2 7-4.5 7-9V6l-7-3Z"
          stroke="currentColor"
          strokeWidth="1.8"
        />
        <path d="m9 12 2 2 4-4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      </svg>
    );
  }
  if (type === 'expert') {
    return (
      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <circle cx="12" cy="8" r="3.2" stroke="currentColor" strokeWidth="1.8" />
        <path
          d="M5.5 19c1.2-3 3.5-4.5 6.5-4.5S17.3 16 18.5 19"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
        />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M12 20s-7-4.4-7-9.2A3.8 3.8 0 0 1 12 8a3.8 3.8 0 0 1 7 2.8C19 15.6 12 20 12 20Z"
        fill="currentColor"
      />
    </svg>
  );
}

function ContactIcon({ type }) {
  if (type === 'call') {
    return (
      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path
          d="M7.5 4.5h3l1.2 4-2 1.2a12 12 0 0 0 5.6 5.6l1.2-2 4 1.2v3A2 2 0 0 1 18.5 19.5 14 14 0 0 1 4.5 5.5a2 2 0 0 1 3-1Z"
          stroke="currentColor"
          strokeWidth="1.7"
          strokeLinejoin="round"
        />
      </svg>
    );
  }
  if (type === 'whatsapp') {
    return (
      <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M12.04 3.5a8.4 8.4 0 0 0-7.2 12.7L4 20.5l4.4-.8a8.4 8.4 0 1 0 3.64-16.2Zm4.86 12.1c-.2.57-1.18 1.05-1.64 1.12-.42.06-.95.09-1.53-.1-.35-.11-.8-.26-1.38-.5-2.43-1.05-4.01-3.5-4.13-3.66-.12-.16-1-1.33-1-2.54 0-1.2.63-1.8.85-2.04.22-.25.48-.31.64-.31h.46c.15 0 .34-.05.53.4.2.48.67 1.65.73 1.77.06.12.1.26.02.42-.08.16-.12.26-.24.4-.12.14-.25.31-.36.42-.12.12-.24.24-.1.47.14.23.62 1.02 1.33 1.65.91.81 1.68 1.06 1.91 1.18.23.12.37.1.5-.06.14-.16.57-.66.72-.89.15-.23.3-.19.5-.11.2.08 1.28.6 1.5.71.22.11.37.17.42.26.06.1.06.57-.14 1.14Z" />
      </svg>
    );
  }
  if (type === 'email') {
    return (
      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <rect x="3.5" y="5.5" width="17" height="13" rx="2" stroke="currentColor" strokeWidth="1.7" />
        <path d="m4.5 7.5 7.5 6 7.5-6" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M12 21s6-5.2 6-10a6 6 0 1 0-12 0c0 4.8 6 10 6 10Z"
        stroke="currentColor"
        strokeWidth="1.7"
      />
      <circle cx="12" cy="11" r="2.2" stroke="currentColor" strokeWidth="1.7" />
    </svg>
  );
}

function QuickIcon({ type }) {
  if (type === 'track') {
    return (
      <svg viewBox="0 0 48 48" fill="none" aria-hidden="true">
        <rect x="8" y="14" width="22" height="20" rx="2.5" stroke="currentColor" strokeWidth="2" />
        <path d="M8 20h22M19 14v20" stroke="currentColor" strokeWidth="2" />
        <circle cx="34" cy="30" r="7" stroke="currentColor" strokeWidth="2" />
        <path d="m39 35 5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </svg>
    );
  }
  if (type === 'returns') {
    return (
      <svg viewBox="0 0 48 48" fill="none" aria-hidden="true">
        <path d="M14 18h20v18H14V18Z" stroke="currentColor" strokeWidth="2" />
        <path d="M14 24h20M24 18v18" stroke="currentColor" strokeWidth="2" />
        <path
          d="M18 12c-4 1.5-7 5-7 9.5 0 1.2.2 2.3.5 3.4"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <path d="m14 10 4 2-3.5 3.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </svg>
    );
  }
  if (type === 'ship') {
    return (
      <svg viewBox="0 0 48 48" fill="none" aria-hidden="true">
        <path d="M6 28h24V16H6v12Z" stroke="currentColor" strokeWidth="2" />
        <path d="M30 22h8l4 6v6h-12v-12Z" stroke="currentColor" strokeWidth="2" />
        <circle cx="14" cy="36" r="3.5" stroke="currentColor" strokeWidth="2" />
        <circle cx="34" cy="36" r="3.5" stroke="currentColor" strokeWidth="2" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 48 48" fill="none" aria-hidden="true">
      <path d="M10 38V18l8-8h12l8 8v20H10Z" stroke="currentColor" strokeWidth="2" />
      <path d="M18 38V24h12v14M22 14v6h8" stroke="currentColor" strokeWidth="2" />
    </svg>
  );
}

function FaqColumn({ items, openFaq, setOpenFaq, offset }) {
  return (
    <div className="cs-faq-col">
      {items.map((item, idx) => {
        const key = offset + idx;
        const open = openFaq === key;
        return (
          <div key={item.q} className={`cs-faq-item${open ? ' is-open' : ''}`}>
            <button
              type="button"
              className="cs-faq-q"
              aria-expanded={open}
              onClick={() => setOpenFaq(open ? null : key)}
            >
              <span className="cs-faq-mark" aria-hidden="true">
                ?
              </span>
              <span className="cs-faq-text">{item.q}</span>
              <span className="cs-faq-chevron" aria-hidden="true">
                ▾
              </span>
            </button>
            {open && <p className="cs-faq-a">{item.a}</p>}
          </div>
        );
      })}
    </div>
  );
}

const ContactSupportPage = () => {
  const { showToast } = useToast();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: ''
  });
  const [openFaq, setOpenFaq] = useState(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    showToast('Thank you! We will get back to you soon.', 'success');
    setFormData({ name: '', email: '', phone: '', message: '' });
  };

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  return (
    <div className="gs-page cs-page">
      <Home2Chrome />

      {/* Hero — Figma image 978: 1201×485 full banner */}
      <section className="cs-hero" aria-label="Contact and support">
        <img
          src={contactSupportBannerFull}
          alt=""
          className="cs-hero-img"
          aria-hidden="true"
        />
        <div className="cs-hero-content">
          <p className="cs-hero-kicker">We&apos;re Here for you</p>
          <h1>Contact &amp; Support</h1>
          <p className="cs-hero-lead">Have a question or need assistance ?</p>
          <p className="cs-hero-body">
            Our team is ready to help you with your orders, investments, or any queries about Gold
            &amp; Silver.
          </p>

          <div className="cs-values">
            <div className="cs-values-bar" aria-hidden="true">
              {VALUE_PROPS.map((item) => (
                <span key={item.title} className="cs-value-ico">
                  <ValueIcon type={item.icon} />
                </span>
              ))}
            </div>
            <div className="cs-values-labels">
              {VALUE_PROPS.map((item) => (
                <div key={item.title} className="cs-value">
                  <strong>{item.title}</strong>
                  <span>{item.text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <div className="cs-shell">
        {/* Get in Touch + Form */}
        <section className="cs-panels">
          <div className="cs-touch-card">
            <h2>Get in Touch</h2>
            <p className="cs-sub">Choose your preferred way to reach us</p>

            <ul className="cs-touch-list">
              <li className="cs-touch-row">
                <span className="cs-touch-ico">
                  <ContactIcon type="call" />
                </span>
                <div className="cs-touch-mid">
                  <strong>Call Us</strong>
                  <p>Speak to our support team for quick assistance</p>
                </div>
                <div className="cs-touch-end">
                  <a href={`tel:${PHONE_TEL}`}>{PHONE}</a>
                  <span>24 hours available</span>
                </div>
              </li>

              <li className="cs-touch-row">
                <span className="cs-touch-ico cs-touch-ico--wa">
                  <ContactIcon type="whatsapp" />
                </span>
                <div className="cs-touch-mid">
                  <strong>Whatsapp Support</strong>
                  <p>Chat with us on whatsApp for instant help</p>
                </div>
                <div className="cs-touch-end">
                  <a href={`tel:${PHONE_TEL}`}>{PHONE}</a>
                  <a
                    className="cs-wa-chip"
                    href={WHATSAPP_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <ContactIcon type="whatsapp" />
                    Chat on WhatApp
                  </a>
                </div>
              </li>

              <li className="cs-touch-row">
                <span className="cs-touch-ico">
                  <ContactIcon type="email" />
                </span>
                <div className="cs-touch-mid">
                  <strong>Email Us</strong>
                  <p>Drop us an email at anytime. We&apos;ll get back to you.</p>
                </div>
                <div className="cs-touch-end">
                  <a href={`mailto:${EMAIL}`}>{EMAIL}</a>
                  <span>We reply within 24 hours</span>
                </div>
              </li>

              <li className="cs-touch-row">
                <span className="cs-touch-ico">
                  <ContactIcon type="office" />
                </span>
                <div className="cs-touch-mid">
                  <strong>Our Office</strong>
                  <p>Visit our office for any assistance or partnership enquiries.</p>
                </div>
                <div className="cs-touch-end">
                  <span className="cs-office-name">Nihar Infor Global Ltd</span>
                  <span>Hyderabad, India</span>
                </div>
              </li>
            </ul>
          </div>

          <div className="cs-form-card" id="message">
            <h2>Send us a Message</h2>
            <p className="cs-form-sub">Fill out the form and our team will get back to you.</p>

            <form className="cs-form" onSubmit={handleSubmit}>
              <div className="cs-form-row">
                <label className="cs-field">
                  <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <circle cx="12" cy="8" r="3.2" stroke="currentColor" strokeWidth="1.6" />
                    <path
                      d="M5.5 19c1.2-3 3.5-4.5 6.5-4.5S17.3 16 18.5 19"
                      stroke="currentColor"
                      strokeWidth="1.6"
                      strokeLinecap="round"
                    />
                  </svg>
                  <input
                    type="text"
                    name="name"
                    placeholder="Full Name *"
                    value={formData.name}
                    onChange={handleChange}
                    required
                  />
                </label>
                <label className="cs-field">
                  <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <rect x="3.5" y="5.5" width="17" height="13" rx="2" stroke="currentColor" strokeWidth="1.6" />
                    <path d="m4.5 7.5 7.5 6 7.5-6" stroke="currentColor" strokeWidth="1.6" />
                  </svg>
                  <input
                    type="email"
                    name="email"
                    placeholder="Email address *"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                </label>
              </div>

              <label className="cs-field">
                <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path
                    d="M7.5 4.5h3l1.2 4-2 1.2a12 12 0 0 0 5.6 5.6l1.2-2 4 1.2v3A2 2 0 0 1 18.5 19.5 14 14 0 0 1 4.5 5.5a2 2 0 0 1 3-1Z"
                    stroke="currentColor"
                    strokeWidth="1.6"
                  />
                </svg>
                <input
                  type="tel"
                  name="phone"
                  placeholder="Phone Number *"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                />
              </label>

              <label className="cs-field cs-field--area">
                <span className="sr-only">Message</span>
                <textarea
                  name="message"
                  placeholder="Type your message here..."
                  rows="5"
                  value={formData.message}
                  onChange={handleChange}
                  required
                />
              </label>

              <button type="submit" className="cs-submit">
                <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path d="M4 11.5 20 4l-4.5 16-3.2-5.8L4 11.5Z" fill="currentColor" />
                </svg>
                Send Message
              </button>
            </form>
          </div>
        </section>

        {/* Still need help CTA */}
        <section className="cs-cta">
          <div className="cs-cta-left">
            <span className="cs-cta-headset" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none">
                <path
                  d="M4 12a8 8 0 0 1 16 0v3.5a2.5 2.5 0 0 1-2.5 2.5H16v-5h3V12a7 7 0 1 0-14 0v1h3v5H6.5A2.5 2.5 0 0 1 4 15.5V12Z"
                  fill="currentColor"
                />
              </svg>
            </span>
            <div>
              <p className="cs-cta-title">Still need help?</p>
              <p className="cs-cta-sub">Our support team is always ready to assist you.</p>
            </div>
          </div>
          <a className="cs-cta-btn" href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer">
            <ContactIcon type="whatsapp" />
            Chat on WhatsApp
          </a>
        </section>

        {/* FAQ */}
        <section className="cs-faq">
          <div className="cs-faq-head">
            <h2>Frequently Asked Questions</h2>
            <a href="#faq-list" className="cs-faq-all">
              view all FAQ&apos;s→
            </a>
          </div>
          <div className="cs-faq-grid" id="faq-list">
            <FaqColumn items={FAQ_LEFT} openFaq={openFaq} setOpenFaq={setOpenFaq} offset={0} />
            <FaqColumn items={FAQ_RIGHT} openFaq={openFaq} setOpenFaq={setOpenFaq} offset={10} />
          </div>
        </section>

        {/* Quick actions */}
        <section className="cs-quick" aria-label="Quick actions">
          {QUICK_LINKS.map((item) => (
            <Link key={item.title} to={item.to} className="cs-quick-item">
              <span className="cs-quick-ico">
                <QuickIcon type={item.icon} />
              </span>
              <div>
                <strong>{item.title}</strong>
                <span>Click here</span>
              </div>
            </Link>
          ))}
        </section>
      </div>

      <GsPageFooter />
    </div>
  );
};

export default ContactSupportPage;
