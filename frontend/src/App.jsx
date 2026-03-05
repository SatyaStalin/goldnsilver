import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import { ToastProvider } from './state/ToastContext';
import HomePage from './pages/HomePage';
import InvestPage from './pages/InvestPage';
import OwnPage from './pages/OwnPage';
import SipPlansPage from './pages/SipPlansPage';
import BuyBackPage from './pages/BuyBackPage';
import DigitalGoldPage from './pages/DigitalGoldPage';
import ELeasePage from './pages/ELeasePage';
import KnowledgeHubPage from './pages/KnowledgeHubPage';
import MediaPage from './pages/MediaPage';
import AboutTrustPage from './pages/AboutTrustPage';
import AdminPage from './pages/AdminPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import CartPage from './pages/CartPage';

const App = () => {
  return (
    <ToastProvider>
      <Layout>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/invest" element={<InvestPage />} />
          <Route path="/own" element={<OwnPage />} />
          <Route path="/sip-plans" element={<SipPlansPage />} />
          <Route path="/buy-back" element={<BuyBackPage />} />
          <Route path="/digital-gold" element={<DigitalGoldPage />} />
          <Route path="/e-lease" element={<ELeasePage />} />
          <Route path="/knowledge-hub" element={<KnowledgeHubPage />} />
          <Route path="/media" element={<MediaPage />} />
          <Route path="/about-trust" element={<AboutTrustPage />} />
          <Route path="/admin" element={<AdminPage />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
        </Routes>
      </Layout>
    </ToastProvider>
  );
};

export default App;

