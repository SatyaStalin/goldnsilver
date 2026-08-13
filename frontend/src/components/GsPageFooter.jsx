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

const GsPageFooter = () => {
  return (
    <footer className="hm2-footer gs-footer">
      <div className="hm2-container hm2-footer-grid">
        <div className="hm2-footer-brand">
          <img src={logoFooter} alt="GoldnSilver.shop" className="hm2-footer-logo" />
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
              <span>Secunderabad, Hyderabad, Telangana</span>
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
          <Link to="/about-trust">Careers</Link>
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
          <Link to="/contact-support">FAQ</Link>
          <Link to="/dashboard">Track Order</Link>
          <Link to="/legal#refund">Returns &amp; Refunds</Link>
        </div>

        <div className="hm2-footer-col">
          <h4>Knowledge Hub</h4>
          <Link to="/media">Latest news</Link>
          <Link to="/media">Articles</Link>
          <Link to="/knowledge-hub">Daily Market updates</Link>
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
