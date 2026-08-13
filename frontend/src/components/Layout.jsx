import Home2Chrome from './Home2Chrome';
import GsPageFooter from './GsPageFooter';
import '../pages/Home2Page.css';

const Layout = ({ children }) => {
  return (
    <div className="app-root app-root--hm2">
      <Home2Chrome />
      <main className="app-main app-main--hm2">{children}</main>
      <GsPageFooter />
    </div>
  );
};

export default Layout;
