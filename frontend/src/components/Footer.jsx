const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-inner">
        <div>
          <h4>Nihar Info Global Ltd</h4>
          <p>An integrated portal for gold and silver</p>
        </div>
        <div>
          <h5>Address </h5>
          <p>34, Ganesh Nagar,</p>
          <p>West Marredpally, Secunderabad,</p>
          <p>Telangana -500026,</p>
          <p>Contact us at : -9014449479</p>
          <p>bsnsuryanarayana@gmail.com</p>
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

