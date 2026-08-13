import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import ZerodhaOAuthRedirect from './components/ZerodhaOAuthRedirect';
import ScrollToTop from './components/ScrollToTop';
import { ToastProvider } from './state/ToastContext';
import HomePage from './pages/HomePage';
import Home2Page from './pages/Home2Page';
import InvestPage from './pages/InvestPage';
import InvestGoldPage from './pages/InvestGoldPage';
import InvestGoldOrderSummaryPage from './pages/InvestGoldOrderSummaryPage';
import InvestSilverPage from './pages/InvestSilverPage';
import InvestGoldSilverPage from './pages/InvestGoldSilverPage';
import SafeGoldTestPage from './pages/SafeGoldTestPage';
import OwnPage from './pages/OwnPage';
import OwnGoldPage from './pages/OwnGoldPage';
import OwnSilverPage from './pages/OwnSilverPage';
import OwnGiftingPage from './pages/OwnGiftingPage';
import OwnMmtcPampPage from './pages/OwnMmtcPampPage';
import OwnMmtcPampProductPage from './pages/OwnMmtcPampProductPage';
import SipPlansPage from './pages/SipPlansPage';
import BuyBackPage from './pages/BuyBackPage';
import DigitalGoldPage from './pages/DigitalGoldPage';
import ELeasePage from './pages/ELeasePage';
import KnowledgeHubPage from './pages/KnowledgeHubPage';
import ZerodhaIntegrationPage from './pages/ZerodhaIntegrationPage';
import MediaPage from './pages/MediaPage';
import AboutTrustPage from './pages/AboutTrustPage';
import PartnersPage from './pages/PartnersPage';
import PurityCertificationPage from './pages/PurityCertificationPage';
import ComplaintsDisclaimersPage from './pages/ComplaintsDisclaimersPage';
import LegalPage from './pages/LegalPage';
import ContactSupportPage from './pages/ContactSupportPage';
import AdminPage from './pages/AdminPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import UserDashboardPage from './pages/UserDashboardPage';
import CartPage from './pages/CartPage';

const App = () => {
  return (
    <ToastProvider>
      <ZerodhaOAuthRedirect />
      <ScrollToTop />
      <Layout>
        <Routes>
          <Route path="/" element={<Home2Page />} />
          <Route path="/home1" element={<HomePage />} />
          <Route path="/home2" element={<Home2Page />} />
          <Route path="/invest" element={<InvestPage />} />
          <Route path="/invest-gold" element={<InvestGoldPage />} />
          <Route path="/invest-gold/order-summary" element={<InvestGoldOrderSummaryPage />} />
          <Route path="/invest-silver" element={<InvestSilverPage />} />
          <Route path="/invest-gold-silver" element={<InvestGoldSilverPage />} />
          <Route path="/safegold" element={<SafeGoldTestPage />} />
          <Route path="/own" element={<OwnPage />} />
          <Route path="/own-gold" element={<OwnGoldPage />} />
          <Route path="/own-silver" element={<OwnSilverPage />} />
          <Route path="/own-gifting" element={<OwnGiftingPage />} />
          <Route path="/own-mmtc-pamp" element={<OwnMmtcPampPage />} />
          <Route path="/own-mmtc-pamp/:productId" element={<OwnMmtcPampProductPage />} />
          <Route path="/sip-plans" element={<SipPlansPage />} />
          <Route path="/buy-back" element={<BuyBackPage />} />
          <Route path="/digital-gold" element={<DigitalGoldPage />} />
          <Route path="/e-lease" element={<ELeasePage />} />
          <Route path="/knowledge-hub" element={<KnowledgeHubPage />} />
          <Route path="/zerodha-integration" element={<ZerodhaIntegrationPage />} />
          <Route path="/media" element={<MediaPage />} />
          <Route path="/about-trust" element={<AboutTrustPage />} />
          <Route path="/partners" element={<PartnersPage />} />
          <Route path="/purity-certification" element={<PurityCertificationPage />} />
          <Route path="/complaints-disclaimers" element={<ComplaintsDisclaimersPage />} />
          <Route path="/legal" element={<LegalPage />} />
          <Route path="/contact-support" element={<ContactSupportPage />} />
          <Route path="/admin" element={<AdminPage />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/dashboard" element={<UserDashboardPage />} />
        </Routes>
      </Layout>
    </ToastProvider>
  );
};

export default App;

