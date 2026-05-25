import Header from './Header';
import Footer from './Footer';
import TopStrip from './TopStrip';

const Layout = ({ children }) => {
  return (
    <div className="app-root">
      <Header />
      <TopStrip />
      <main className="app-main">{children}</main>
      <Footer />
    </div>
  );
};

export default Layout;

