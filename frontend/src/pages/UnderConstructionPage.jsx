import { useParams } from 'react-router-dom';
import Home2Chrome from '../components/Home2Chrome';
import GsPageFooter from '../components/GsPageFooter';
import './PageShell.css';
import './UnderConstructionPage.css';

const PAGES = {
  careers: { title: 'Careers', kicker: 'JOIN OUR TEAM' },
  articles: { title: 'Articles', kicker: 'KNOWLEDGE HUB' }
};

function pageCopy(slug) {
  if (PAGES[slug]) return PAGES[slug];
  const title = String(slug || 'Page')
    .replace(/-/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());
  return { title, kicker: 'COMING SOON' };
}

const UnderConstructionPage = () => {
  const { page } = useParams();
  const { title, kicker } = pageCopy(page);

  return (
    <div className="gs-page uc-page">
      <Home2Chrome />

      <section className="gs-hero gs-hero--gradient" aria-label={title}>
        <div className="gs-hero-inner">
          <p className="gs-hero-kicker">{kicker}</p>
          <h1>{title}</h1>
          <p className="gs-hero-copy">This page is under construction.</p>
        </div>
      </section>

      <section className="gs-section uc-body">
        <div className="gs-panel uc-panel">
          <p className="uc-status">Under construction</p>
          <h2>{title} will be available soon</h2>
          <p>
            Check back later, or write to{' '}
            <a href="mailto:support@goldnsilver.shop">support@goldnsilver.shop</a> if you need help.
          </p>
        </div>
      </section>

      <GsPageFooter />
    </div>
  );
};

export default UnderConstructionPage;
