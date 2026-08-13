import { useLocation } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';
import TopStrip from './TopStrip';

const Layout = ({ children }) => {
  const { pathname } = useLocation();
  const isHome2 = pathname === '/';
  const isMedia = pathname === '/media';
  const isPartners = pathname === '/partners';
  const isKnowledgeHub = pathname === '/knowledge-hub';
  const isOwnGifting = pathname === '/own-gifting';
  const isOwnMmtc =
    pathname === '/own-mmtc-pamp' || pathname.startsWith('/own-mmtc-pamp/');
  const isOwnGold = pathname === '/own-gold';
  const isOwnSilver = pathname === '/own-silver';
  const isContactSupport = pathname === '/contact-support';
  const isLegal = pathname === '/legal';
  const isComingSoon =
    pathname.startsWith('/coming-soon') ||
    pathname === '/careers' ||
    pathname === '/articles';
  const useHm2Shell =
    isHome2 ||
    isMedia ||
    isPartners ||
    isKnowledgeHub ||
    isOwnGifting ||
    isOwnMmtc ||
    isOwnGold ||
    isOwnSilver ||
    isContactSupport ||
    isLegal ||
    isComingSoon;

  return (
    <div className={`app-root${useHm2Shell ? ' app-root--hm2' : ''}`}>
      {!useHm2Shell && <Header />}
      {!useHm2Shell && <TopStrip />}
      <main className={`app-main${useHm2Shell ? ' app-main--hm2' : ''}`}>
        {children}
      </main>
      {!useHm2Shell && <Footer />}
    </div>
  );
};

export default Layout;
