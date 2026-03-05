const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-inner">
        <div>
          <h4>GoldnSilver</h4>
          <p>SEBI / RBI compliant partners, MMTC-PAMP sourcing, 99.9% purity.</p>
        </div>
        <div>
          <h5>Support</h5>
          <p>Email: support@goldnsilver.in</p>
          <p>Phone: +91-98765-43210</p>
        </div>
        <div>
          <h5>Legal</h5>
          <p>Terms &amp; Conditions</p>
          <p>Privacy Policy</p>
        </div>
      </div>
      <div className="footer-bottom">
        © {new Date().getFullYear()} GoldnSilver Digital Gold &amp; Silver Platform
      </div>
    </footer>
  );
};

export default Footer;

