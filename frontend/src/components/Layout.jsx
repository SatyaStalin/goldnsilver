import Header from './Header';
import Footer from './Footer';
import TopStrip from './TopStrip';

const Layout = ({ children }) => {
  return (
    <div className="app-root">
      <TopStrip />
      <Header />
      <main className="app-main">{children}</main>
      <Footer />
    </div>
  );
};

export default Layout;

