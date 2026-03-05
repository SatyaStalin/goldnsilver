const ComplaintsDisclaimersPage = () => {
  return (
    <div className="page">
      <div className="page-hero">
        <h1 className="page-hero-title">Complaints & Disclaimers</h1>
        <p className="page-hero-desc">
          Important information about our services, policies, and how to file complaints.
        </p>
      </div>

      <div className="grid-two">
        <section className="panel page-feature">
          <h2>File a Complaint</h2>
          <div className="list-cards">
            <article className="list-card">
              <div>
                <h3>Customer Support</h3>
                <p>Contact our support team for any issues or concerns.</p>
                <p className="muted">Email: support@goldnsilver.shop</p>
                <p className="muted">Phone: +91-XXXX-XXXXXX</p>
              </div>
            </article>
            <article className="list-card">
              <div>
                <h3>Grievance Redressal</h3>
                <p>We aim to resolve all complaints within 7-14 business days.</p>
                <p className="muted">Escalation process available</p>
              </div>
            </article>
          </div>
        </section>

        <section className="panel page-feature">
          <h2>Important Disclaimers</h2>
          <ul className="bullet-list">
            <li><strong>Investment Risk:</strong> Gold and silver prices are subject to market fluctuations. Past performance does not guarantee future returns.</li>
            <li><strong>Regulatory:</strong> We are a platform facilitating gold and silver investments. Please consult with SEBI-registered advisors for investment decisions.</li>
            <li><strong>Physical Delivery:</strong> Delivery timelines and charges may vary based on location and product availability.</li>
            <li><strong>Digital Gold:</strong> Stored in insured vaults. Redemption subject to terms and conditions.</li>
            <li><strong>Payment Security:</strong> All transactions are processed through secure payment gateways. We do not store payment card details.</li>
            <li><strong>KYC Compliance:</strong> All users must complete KYC as per regulatory requirements.</li>
          </ul>

          <h3>Terms & Conditions</h3>
          <p>
            By using our platform, you agree to our terms of service, privacy policy, 
            and all applicable regulations. Please read all documentation carefully before investing.
          </p>
        </section>
      </div>
    </div>
  );
};

export default ComplaintsDisclaimersPage;
