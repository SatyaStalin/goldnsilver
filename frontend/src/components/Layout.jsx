import Home2Chrome from './Home2Chrome';
import GsPageFooter from './GsPageFooter';
import { AuthDialogProvider } from '../state/AuthDialogContext';
import '../pages/Home2Page.css';

const Layout = ({ children }) => {
  return (
    <AuthDialogProvider>
      <div className="app-root app-root--hm2">
        <Home2Chrome />
        <main className="app-main app-main--hm2">{children}</main>
        <GsPageFooter />
      </div>
    </AuthDialogProvider>
  );
};

export default Layout;
