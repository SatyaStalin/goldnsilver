import { useLocation } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';
import TopStrip from './TopStrip';

const Layout = ({ children }) => {
  const { pathname } = useLocation();
  const isHome1 = pathname === '/home1';
  const isHome2 = pathname === '/' || pathname === '/home2';
  const isMedia = pathname === '/media';
  const isPartners = pathname === '/partners';
  const isKnowledgeHub = pathname === '/knowledge-hub';
  const useHm2Shell = isHome2 || isMedia || isPartners || isKnowledgeHub;

  return (
    <div className={`app-root${useHm2Shell ? ' app-root--hm2' : ''}`}>
      {!useHm2Shell && <Header />}
      {!useHm2Shell && <TopStrip />}
      <main className={`app-main${isHome1 ? ' app-main--home' : ''}${useHm2Shell ? ' app-main--hm2' : ''}`}>
        {children}
      </main>
      {!useHm2Shell && <Footer />}
    </div>
  );
};

export default Layout;
