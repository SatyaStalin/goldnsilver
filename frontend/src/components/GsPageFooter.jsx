import { Link } from 'react-router-dom';
import { badgeIso, badgeSsl } from '../assets/homepageMain';
import logoFooter from '../assets/homepageMain/image 594.png';
import iconSocialYt from '../assets/homepageMain/image 62.png';
import iconSocialX from '../assets/homepageMain/image 63.png';
import iconSocialIg from '../assets/homepageMain/image 64.png';
import iconSocialIn from '../assets/homepageMain/image 65.png';
import iconSocialFb from '../assets/homepageMain/image 66.png';
import iconLoc from '../assets/homepageMain/image 61.png';
import copyIcon from '../assets/homepageMain/image 69.png';

const MAPS_URL =
  'https://www.google.com/maps/place/Nihar+Info+Global+Ltd./@17.4547018,78.508941,265m/data=!3m1!1e3!4m14!1m7!3m6!1s0x3bcb9b6fa00618e7:0xbd28418dbe62e24f!2sNihar+Info+Global+Ltd.!8m2!3d17.4547861!4d78.5097097!16s%2Fg%2F11gmfygnsw!3m5!1s0x3bcb9b6fa00618e7:0xbd28418dbe62e24f!8m2!3d17.4547861!4d78.5097097!16s%2Fg%2F11gmfygnsw?authuser=0&entry=ttu&g_ep=EgoyMDI2MDgxMC4wIKXMDSoASAFQAw%3D%3D';

const GsPageFooter = () => {
  return (
    <footer className="hm2-footer gs-footer">
      <div className="hm2-container hm2-footer-grid">
        <div className="hm2-footer-brand">
          <img src={logoFooter} alt="GoldnSilver.shop" className="hm2-footer-logo" />
          <p className="hm2-footer-tagline">
            India’s trusted platform to invest in Physical and digital gold and silver and ETF’s
          </p>
          <div className="hm2-footer-contact">
            <p>
              <span className="hm2-contact-ico" aria-hidden="true">📞</span>
              <span>+91- 9014449479</span>
            </p>
            <p>
              <span className="hm2-contact-ico" aria-hidden="true">✉</span>
              <span>support@goldnsilver.shop</span>
            </p>
            <p className="hm2-loc">
              <span className="hm2-contact-ico">
                <img src={iconLoc} alt="" />
              </span>
              <a href={MAPS_URL} target="_blank" rel="noopener noreferrer">
                Secunderabad, Hyderabad, Telangana
              </a>
            </p>
          </div>
          <p className="hm2-follow">Follow Us</p>
          <div className="hm2-socials">
            <a href="https://youtube.com" target="_blank" rel="noreferrer" aria-label="YouTube">
              <img src={iconSocialYt} alt="" />
            </a>
            <a href="https://x.com" target="_blank" rel="noreferrer" aria-label="X">
              <img src={iconSocialX} alt="" />
            </a>
            <a href="https://instagram.com" target="_blank" rel="noreferrer" aria-label="Instagram">
              <img src={iconSocialIg} alt="" />
            </a>
            <a href="https://linkedin.com" target="_blank" rel="noreferrer" aria-label="LinkedIn">
              <img src={iconSocialIn} alt="" />
            </a>
            <a href="https://facebook.com" target="_blank" rel="noreferrer" aria-label="Facebook">
              <img src={iconSocialFb} alt="" />
            </a>
          </div>
        </div>

        <div className="hm2-footer-col">
          <h4>Products</h4>
          <Link to="/own">Physical gold &amp; silver</Link>
          <Link to="/invest">Digital gold &amp; silver</Link>
          <Link to="/zerodha-integration">gold &amp; silver ETF’s</Link>
          <Link to="/sip-plans">SIP Plans</Link>
          <Link to="/own-gifting">Gift Gold and silver</Link>
        </div>

        <div className="hm2-footer-col">
          <h4>Company</h4>
          <Link to="/about-trust">About Us</Link>
          <Link to="/partners">Our Partners</Link>
          <Link to="/coming-soon/careers">Careers</Link>
          <Link to="/media">Press &amp; Media</Link>
          <Link to="/contact-support">Contact Us</Link>
        </div>

        <div className="hm2-footer-col">
          <h4>Legal</h4>
          <Link to="/legal#terms">Terms &amp; conditions</Link>
          <Link to="/legal#privacy">Privacy Policy</Link>
          <Link to="/legal#refund">Refund Policy</Link>
          <Link to="/legal#shipping">Shipping Policy</Link>
          <Link to="/legal#disclaimer">Disclaimer</Link>
        </div>

        <div className="hm2-footer-col">
          <h4>Support</h4>
          <Link to="/contact-support">Help Center</Link>
          <Link to="/coming-soon/faqs">FAQ’s</Link>
          <Link to="/dashboard">Track Order</Link>
          <Link to="/legal#refund">Returns &amp; Refunds</Link>
        </div>

        <div className="hm2-footer-col">
          <h4>Knowledge Hub</h4>
          <Link to="/media">Latest news</Link>
          <Link to="/coming-soon/articles">Articles</Link>
          <Link to="/knowledge-hub">Weekly market updates</Link>
        </div>

        <div className="hm2-secure">
          <h4>Verified &amp; Secure</h4>
          <div className="hm2-badges">
            <img src={badgeIso} alt="ISO Certified" />
            <img src={badgeSsl} alt="SSL Certified" />
          </div>
        </div>
      </div>

      <div className="hm2-footer-bottom">
        <div className="hm2-container hm2-footer-bottom-inner">
          <p className="hm2-copy">
            <img src={copyIcon} alt="" className="hm2-copy-icon" />
            <span>
              {new Date().getFullYear()} Goldnsilver.shop | All Rights Reserved | GoldnSilver.shop
              is owned and operated by Nihar Info global Limited, a BSE listed Company.
            </span>
          </p>
          <p className="hm2-copy hm2-copy-ids">
            GSTIN: 36AAACG6687Q1ZR | CIN: L67120TG1995PLC0192200
          </p>
          <p className="disc">
            <strong>RISK DISCLOSURE:</strong>
            <span>
              Investments in gold, silver and ETF’s and other financial products are subject to
              market risks. Past performance is not indicative of future results. Please read all
              scheme related documents carefully before investing.
            </span>
          </p>
        </div>
      </div>
    </footer>
  );
};

export default GsPageFooter;
