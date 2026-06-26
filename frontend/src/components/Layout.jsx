import { useLocation } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';
import TopStrip from './TopStrip';

const Layout = ({ children }) => {
  const { pathname } = useLocation();
  const isHome = pathname === '/';

  return (
    <div className="app-root">
      <Header />
      <TopStrip />
      <main className={`app-main${isHome ? ' app-main--home' : ''}`}>{children}</main>
      <Footer />
    </div>
  );
};

export default Layout;
