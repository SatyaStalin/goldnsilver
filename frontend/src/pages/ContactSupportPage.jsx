import { useState } from 'react';
import { useToast } from '../state/ToastContext';

const ContactSupportPage = () => {
  const { showToast } = useToast();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    showToast('Thank you! We will get back to you soon.', 'success');
    setFormData({ name: '', email: '', phone: '', subject: '', message: '' });
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="page">
      <div className="page-hero">
        <h1 className="page-hero-title">Contact & Support</h1>
        <p className="page-hero-desc">
          Get in touch with us for any queries, support, or assistance.
        </p>
      </div>

      <div className="grid-two">
        <section className="panel page-feature">
          <h2>Contact Information</h2>
          <div className="list-cards">
            <article className="list-card">
              <div>
                <h3>📧 Email Support</h3>
                <p>support@goldnsilver.shop</p>
                <p className="muted">Response within 24 hours</p>
              </div>
            </article>
            <article className="list-card">
              <div>
                <h3>📞 Phone Support</h3>
                <p>+91-XXXX-XXXXXX</p>
                <p className="muted">Mon-Sat, 9 AM - 6 PM IST</p>
              </div>
            </article>
            <article className="list-card">
              <div>
                <h3>📍 Office Address</h3>
                <p>Gold N Silver Investment Platform</p>
                <p className="muted">Mumbai, Maharashtra, India</p>
              </div>
            </article>
          </div>
        </section>

        <section className="panel page-feature">
          <h2>Send us a Message</h2>
          <form className="calculator" onSubmit={handleSubmit}>
            <label>
              Your Name
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </label>
            <label>
              Email Address
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </label>
            <label>
              Phone Number
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
              />
            </label>
            <label>
              Subject
              <input
                type="text"
                name="subject"
                value={formData.subject}
                onChange={handleChange}
                required
              />
            </label>
            <label>
              Message
              <textarea
                name="message"
                value={formData.message}
                onChange={handleChange}
                rows="4"
                required
              />
            </label>
            <button className="btn-primary" type="submit">
              Send Message
            </button>
          </form>
        </section>
      </div>
    </div>
  );
};

export default ContactSupportPage;
