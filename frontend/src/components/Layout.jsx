import { useLocation } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';
import TopStrip from './TopStrip';

const Layout = ({ children }) => {
  const { pathname } = useLocation();
  const isHome = pathname === '/';
  const isHome2 = pathname === '/home2';

  return (
    <div className={`app-root${isHome2 ? ' app-root--hm2' : ''}`}>
      {!isHome2 && <Header />}
      {!isHome2 && <TopStrip />}
      <main className={`app-main${isHome ? ' app-main--home' : ''}${isHome2 ? ' app-main--hm2' : ''}`}>
        {children}
      </main>
      {!isHome2 && <Footer />}
    </div>
  );
};

export default Layout;
