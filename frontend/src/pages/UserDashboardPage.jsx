import { useEffect, useState, useCallback, useMemo, useRef } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../state/AuthContext';
import { useToast } from '../state/ToastContext';
import { safegoldService, authService, userService, sequelService } from '../services/api';
import { normalizeIndianPhone, validateCheckoutCustomer } from '../utils/checkoutValidation';
import './InvestGoldOrderSummaryPage.css';

const formatInr = (n) =>
  n == null || Number.isNaN(Number(n))
    ? '—'
    : `₹${Number(n).toLocaleString('en-IN', { maximumFractionDigits: 2 })}`;

const formatGrams = (g) =>
  g == null ? '—' : `${Number(g).toLocaleString('en-IN', { maximumFractionDigits: 4 })} g`;

function isPaidOrder(row) {
  const pay = String(row?.paymentStatus || '').toLowerCase();
  const status = String(row?.orderStatus || '').toLowerCase();
  if (pay === 'failed' || status === 'failed' || status === 'cancelled') return false;
  return pay === 'success' || ['paid', 'shipped', 'delivered', 'completed'].includes(status);
}

function safegoldKind(tx) {
  const raw = String(tx?.type || tx?.transaction_type || '').toLowerCase();
  if (raw.includes('sell')) return 'sell';
  if (raw.includes('buy')) return 'buy';
  if (tx?.sellTxId && !tx?.buyTxId) return 'sell';
  return 'buy';
}

function mapSafeGoldHistory(tx, source) {
  const txType = safegoldKind(tx);
  const grams = Number(tx.goldAmount);
  const amount = Number(tx.buyPrice);
  return {
    id: tx._id || tx.safegoldTxId || tx.clientReferenceId || tx.createdAt,
    date: tx.createdAt,
    product: 'Digital Gold (SafeGold)',
    typeLabel: txType === 'sell' ? 'Sell' : 'Buy',
    txType,
    amount: Number.isFinite(amount) ? amount : null,
    quantity: null,
    grams: Number.isFinite(grams) ? grams : null,
    rate: tx.currentPrice || (grams > 0 && amount > 0 ? amount / grams : null),
    status: tx.status || 'success',
    source
  };
}

const normalizeHistoryRows = (local = [], remote = []) => {
  const keys = new Set();
  const remember = (tx) => {
    [tx?._id, tx?.clientReferenceId, tx?.buyTxId, tx?.sellTxId, tx?.safegoldTxId]
      .filter(Boolean)
      .forEach((key) => keys.add(String(key)));
  };
  const alreadyListed = (tx) =>
    [tx?._id, tx?.clientReferenceId, tx?.buyTxId, tx?.sellTxId, tx?.safegoldTxId]
      .filter(Boolean)
      .some((key) => keys.has(String(key)));

  const rows = [];
  local.forEach((tx) => {
    remember(tx);
    rows.push(mapSafeGoldHistory(tx, 'local'));
  });
  remote.forEach((tx) => {
    if (alreadyListed(tx)) return;
    remember(tx);
    rows.push(mapSafeGoldHistory(tx, 'safegold'));
  });
  return rows;
};

function digitalGoldPartner(row) {
  const name = String(row?.productName || row?.product || '').toLowerCase();
  if (name.includes('augmont')) return 'Augmont';
  if (name.includes('mmtc')) return 'MMTC-PAMP';
  return 'SafeGold';
}

function digitalGoldProductName(row) {
  return `Digital Gold (${digitalGoldPartner(row)})`;
}

function physicalShipmentStatus(row) {
  const sequelStatus = String(row?.sequel?.status || '').toLowerCase();
  if (sequelStatus === 'in_transit') return 'In transit';
  if (sequelStatus === 'booked') return 'Booked';
  if (sequelStatus === 'delivered') return 'Delivered';
  if (sequelStatus === 'cancelled') return 'Cancelled';
  if (sequelStatus === 'failed') return 'Booking failed';
  if (sequelStatus === 'pending') return 'Awaiting dispatch';
  if (row?.sequel?.shipmentStatus) return String(row.sequel.shipmentStatus);
  return row?.orderStatus || '—';
}

function productHistoryType(row) {
  if (row.orderType === 'safegold') return 'digital';
  const productType = String(row.productType || '').toLowerCase();
  if (productType === 'etf') return 'etf';
  if (productType === 'fund') return 'fund';
  if (productType === 'sip') return 'sip';
  if (productType === 'sovereign_bond') return 'sovereign bond';
  if (row.catalog === 'mmtc') return 'mmtc';
  return 'own';
}

const PAGE_SIZE = 10;

const TablePager = ({ page, totalPages, totalItems, onPage }) => {
  if (totalItems <= PAGE_SIZE) return null;
  return (
    <div className="pagination">
      <button
        type="button"
        className="pagination-btn"
        disabled={page <= 1}
        onClick={() => onPage(page - 1)}
      >
        Previous
      </button>
      <span className="pagination-info">
        Page {page} of {totalPages} ({totalItems} total)
      </span>
      <button
        type="button"
        className="pagination-btn"
        disabled={page >= totalPages}
        onClick={() => onPage(page + 1)}
      >
        Next
      </button>
    </div>
  );
};

const UserDashboardPage = () => {
  const { user, isAuthenticated, isGeneral, loading: authLoading, logout, updateUser } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [ordersSubTab, setOrdersSubTab] = useState('physical');
  const [dashSubTab, setDashSubTab] = useState('physical');
  const [etfPage, setEtfPage] = useState(1);
  const [ordersPage, setOrdersPage] = useState(1);
  const [digitalPage, setDigitalPage] = useState(1);
  const [historyPage, setHistoryPage] = useState(1);
  const [dashboard, setDashboard] = useState(null);
  const [history, setHistory] = useState({ local: [], remote: [], syncError: null, linked: false });
  const [loadingDash, setLoadingDash] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [productOrders, setProductOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [trackingId, setTrackingId] = useState(null);
  const [linking, setLinking] = useState(false);

  const [profileForm, setProfileForm] = useState({ name: '', mobile: '' });
  const [profileErrors, setProfileErrors] = useState({ name: '', mobile: '' });
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [passwordErrors, setPasswordErrors] = useState({ newPassword: '', confirmPassword: '' });
  const [invoiceLoadingId, setInvoiceLoadingId] = useState(null);
  const [invoicePopupOpen, setInvoicePopupOpen] = useState(false);
  const [invoiceFrameSrc, setInvoiceFrameSrc] = useState('');
  const [invoiceDownloadHref, setInvoiceDownloadHref] = useState('');
  const invoiceObjectUrlRef = useRef(null);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate('/login');
    } else if (!authLoading && isAuthenticated && !isGeneral) {
      navigate('/admin');
    }
  }, [authLoading, isAuthenticated, isGeneral, navigate]);

  const fetchDashboard = useCallback(async () => {
    setLoadingDash(true);
    try {
      const res = await safegoldService.getDashboard();
      setDashboard(res.data);
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to load dashboard', 'error');
    } finally {
      setLoadingDash(false);
    }
  }, [showToast]);

  const fetchHistory = useCallback(async () => {
    setLoadingHistory(true);
    try {
      const res = await safegoldService.getTransactions({ limit: 50 });
      setHistory({
        local: res.data?.transactions || [],
        remote: res.data?.safegoldTransactions || [],
        linked: Boolean(res.data?.linked),
        syncError: res.data?.syncError || null,
        source: res.data?.source || 'local'
      });
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to load history', 'error');
    } finally {
      setLoadingHistory(false);
    }
  }, [showToast]);

  const fetchProductOrders = useCallback(async (options = {}) => {
    if (!options.silent) setLoadingOrders(true);
    try {
      const res = await userService.getOrders();
      setProductOrders(Array.isArray(res.data?.history) ? res.data.history : []);
    } catch (err) {
      if (!options.silent) showToast(err.response?.data?.message || 'Failed to load orders', 'error');
    } finally {
      if (!options.silent) setLoadingOrders(false);
    }
  }, [showToast]);

  const handleTrackOrder = async (orderId) => {
    setTrackingId(orderId);
    try {
      const res = await sequelService.trackOrder(orderId);
      showToast(res.data?.sequel?.shipmentStatus || 'Tracking updated', 'success');
      fetchProductOrders();
    } catch (err) {
      showToast(err.response?.data?.message || 'Could not refresh tracking', 'error');
    } finally {
      setTrackingId(null);
    }
  };

  const releaseInvoiceObjectUrl = () => {
    if (invoiceObjectUrlRef.current) {
      URL.revokeObjectURL(invoiceObjectUrlRef.current);
      invoiceObjectUrlRef.current = null;
    }
  };

  const closeInvoice = () => {
    setInvoicePopupOpen(false);
    setInvoiceFrameSrc('');
    setInvoiceDownloadHref('');
    releaseInvoiceObjectUrl();
  };

  const showInvoice = async (row) => {
    const transactionId = row.safegoldTransactionId;
    const orderId = row.orderId;
    if (!transactionId && !orderId) {
      showToast('Transaction reference missing for SafeGold invoice', 'error');
      return;
    }
    setInvoiceLoadingId(String(orderId));
    try {
      const res = transactionId
        ? await safegoldService.getTransactionInvoice(transactionId)
        : await safegoldService.getInvoice({ orderId });
      const url = res.data?.invoiceUrl;
      const txId = res.data?.transactionId || transactionId;
      if (!url || !txId) {
        showToast(
          res.data?.message || 'SafeGold invoice is not available yet. Please try again shortly.',
          'info'
        );
        return;
      }
      const source = await safegoldService.loadInvoiceSource(txId, url);
      releaseInvoiceObjectUrl();
      invoiceObjectUrlRef.current = source.objectUrl;
      setInvoiceFrameSrc(source.viewSrc);
      setInvoiceDownloadHref(source.downloadHref);
      setInvoicePopupOpen(true);
    } catch (err) {
      showToast(err.response?.data?.message || 'Could not fetch SafeGold invoice. Please try again.', 'error');
    } finally {
      setInvoiceLoadingId(null);
    }
  };

  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab === 'dashboard' || tab === 'orders' || tab === 'history' || tab === 'profile') {
      setActiveTab(tab);
    }
  }, [searchParams]);

  useEffect(() => {
    if (!isGeneral) return;
    if (activeTab === 'dashboard') {
      fetchDashboard();
      fetchProductOrders();
    }
    if (activeTab === 'history') {
      fetchHistory();
      fetchProductOrders();
    }
    if (activeTab === 'profile' && user) {
      setProfileForm({ name: user.name || '', mobile: user.mobile || '' });
    }
    if (activeTab !== 'orders') return undefined;
    fetchProductOrders();
    const refreshId = setInterval(() => {
      fetchProductOrders({ silent: true });
    }, 60 * 1000);
    return () => clearInterval(refreshId);
  }, [activeTab, isGeneral, fetchDashboard, fetchHistory, fetchProductOrders, user]);

  const handleLinkSafeGold = async () => {
    setLinking(true);
    try {
      const res = await safegoldService.registerCustomer();
      showToast(res.data?.message || 'SafeGold vault linked', res.data?.linked ? 'success' : 'info');
      await fetchDashboard();
    } catch (err) {
      showToast(err.response?.data?.message || 'Could not link SafeGold vault', 'error');
    } finally {
      setLinking(false);
    }
  };

  const profileFieldErrors = (name, mobile) => {
    const customer = validateCheckoutCustomer({
      name,
      email: user?.email || 'user@example.com',
      phone: mobile
    });
    return {
      name: customer.errors.name || '',
      mobile: customer.errors.phone || '',
      normalizedName: customer.normalized.name,
      normalizedMobile: normalizeIndianPhone(mobile) || ''
    };
  };

  const handleProfileBlur = async (field) => {
    const check = profileFieldErrors(profileForm.name, profileForm.mobile);
    setProfileErrors((prev) => ({ ...prev, [field]: check[field] }));
    if (field !== 'mobile' || check.mobile || !check.normalizedMobile) return;
    if (check.normalizedMobile === (normalizeIndianPhone(user?.mobile) || '')) return;
    try {
      const exists = await authService.checkExists({ mobile: check.normalizedMobile });
      if (exists.data?.mobileExists) {
        setProfileErrors((prev) => ({
          ...prev,
          mobile: 'This mobile number is already registered with another account.'
        }));
      }
    } catch {
      /* save still checks uniqueness */
    }
  };

  const handleProfileSave = async (e) => {
    e.preventDefault();
    const check = profileFieldErrors(profileForm.name, profileForm.mobile);
    if (check.name || check.mobile) {
      setProfileErrors({ name: check.name, mobile: check.mobile });
      showToast(check.name || check.mobile, 'error');
      return;
    }

    if (check.normalizedMobile !== (normalizeIndianPhone(user?.mobile) || '')) {
      try {
        const exists = await authService.checkExists({ mobile: check.normalizedMobile });
        if (exists.data?.mobileExists) {
          const message = 'This mobile number is already registered with another account.';
          setProfileErrors({ name: '', mobile: message });
          showToast(message, 'error');
          return;
        }
      } catch {
        /* save still checks uniqueness */
      }
    }

    setSavingProfile(true);
    try {
      const res = await authService.updateProfile({
        name: check.normalizedName,
        mobile: check.normalizedMobile
      });
      showToast('Profile updated', 'success');
      if (res.data?.user) {
        updateUser(res.data.user);
        setProfileForm({
          name: res.data.user.name || '',
          mobile: res.data.user.mobile || ''
        });
      }
      setProfileErrors({ name: '', mobile: '' });
    } catch (err) {
      const apiErrors = err.response?.data?.errors;
      if (apiErrors?.name || apiErrors?.mobile) {
        setProfileErrors({
          name: apiErrors.name || '',
          mobile: apiErrors.mobile || ''
        });
      }
      showToast(err.response?.data?.message || 'Update failed', 'error');
    } finally {
      setSavingProfile(false);
    }
  };

  const newPasswordError = (password, confirmPassword) => {
    if (!password) return 'Password is required.';
    if (password.length < 6) return 'Password must be at least 6 characters.';
    if (password.length > 64) return 'Password must be at most 64 characters.';
    if (!/[A-Za-z]/.test(password) || !/\d/.test(password)) {
      return 'Password must include at least one letter and one number.';
    }
    if (confirmPassword && confirmPassword !== password) return '';
    return '';
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    const nextErrors = {
      newPassword: newPasswordError(passwordForm.newPassword, passwordForm.confirmPassword),
      confirmPassword: !passwordForm.confirmPassword
        ? 'Please retype your password.'
        : passwordForm.newPassword !== passwordForm.confirmPassword
          ? 'Passwords do not match.'
          : ''
    };
    setPasswordErrors(nextErrors);
    const firstError = nextErrors.newPassword || nextErrors.confirmPassword;
    if (firstError) {
      showToast(firstError, 'error');
      return;
    }
    setSavingPassword(true);
    try {
      await authService.changePassword({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword
      });
      showToast('Password changed successfully', 'success');
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setPasswordErrors({ newPassword: '', confirmPassword: '' });
    } catch (err) {
      const apiErrors = err.response?.data?.errors;
      if (apiErrors?.newPassword) {
        setPasswordErrors((prev) => ({ ...prev, newPassword: apiErrors.newPassword }));
      }
      showToast(err.response?.data?.message || 'Password change failed', 'error');
    } finally {
      setSavingPassword(false);
    }
  };

  useEffect(() => () => releaseInvoiceObjectUrl(), []);

  const historyRows = useMemo(() => {
    const digital = normalizeHistoryRows(history.local, history.remote);
    const shop = productOrders
      .filter((row) => row.orderType !== 'safegold' && isPaidOrder(row))
      .map((row, idx) => ({
        id: `${row.orderId}-shop-${idx}`,
        date: row.orderDate,
        product: row.productName || 'Product',
        typeLabel: productHistoryType(row),
        amount: row.amountInvested,
        quantity: row.quantity ?? 1,
        grams: row.metalGrams,
        rate: row.purchaseRatePerGram,
        status: row.orderStatus,
        source: 'order'
      }));
    return [...digital, ...shop].sort(
      (a, b) => new Date(b.date || 0) - new Date(a.date || 0)
    );
  }, [history, productOrders]);
  const physicalOrders = useMemo(
    () =>
      productOrders.filter((row) => {
        if (row.orderType === 'safegold') return false;
        if (!isPaidOrder(row)) return false;
        const type = String(row.productType || '').toLowerCase();
        return !['etf', 'fund', 'sip', 'sovereign_bond', 'digital'].includes(type);
      }),
    [productOrders]
  );
  const digitalOrders = useMemo(
    () => productOrders.filter((row) => row.orderType === 'safegold' && isPaidOrder(row)),
    [productOrders]
  );
  const etfOrders = useMemo(
    () =>
      productOrders.filter(
        (row) =>
          row.orderType !== 'safegold' &&
          isPaidOrder(row) &&
          String(row.productType || '').toLowerCase() === 'etf'
      ),
    [productOrders]
  );
  const etfTotalPages = Math.max(1, Math.ceil(etfOrders.length / PAGE_SIZE));
  const etfPageSafe = Math.min(etfPage, etfTotalPages);
  const pagedEtf = etfOrders.slice((etfPageSafe - 1) * PAGE_SIZE, etfPageSafe * PAGE_SIZE);
  const orderTabs = [
    { key: 'physical', label: 'Physical Gold and Silver', hint: 'Sequel tracked delivery', icon: '📦', count: physicalOrders.length },
    { key: 'safegold', label: 'Digital Gold – SafeGold', hint: 'Vault-stored 24K gold', icon: '🪙', count: digitalOrders.length },
    { key: 'etf', label: 'Gold and Silver ETFs', hint: 'Exchange traded funds', icon: '📈', count: etfOrders.length }
  ];
  const ordersTotalPages = Math.max(1, Math.ceil(physicalOrders.length / PAGE_SIZE));
  const ordersPageSafe = Math.min(ordersPage, ordersTotalPages);
  const pagedOrders = physicalOrders.slice(
    (ordersPageSafe - 1) * PAGE_SIZE,
    ordersPageSafe * PAGE_SIZE
  );
  const digitalTotalPages = Math.max(1, Math.ceil(digitalOrders.length / PAGE_SIZE));
  const digitalPageSafe = Math.min(digitalPage, digitalTotalPages);
  const pagedDigital = digitalOrders.slice(
    (digitalPageSafe - 1) * PAGE_SIZE,
    digitalPageSafe * PAGE_SIZE
  );
  const historyTotalPages = Math.max(1, Math.ceil(historyRows.length / PAGE_SIZE));
  const historyPageSafe = Math.min(historyPage, historyTotalPages);
  const pagedHistory = historyRows.slice(
    (historyPageSafe - 1) * PAGE_SIZE,
    historyPageSafe * PAGE_SIZE
  );

  if (authLoading || !isGeneral) {
    return (
      <div className="page">
        <p className="page-hero-desc">Loading your dashboard…</p>
      </div>
    );
  }

  const pl = dashboard?.profitLoss ?? 0;
  const plPositive = pl >= 0;
  const goldRate = dashboard?.rate?.rateInclGst ?? dashboard?.rate?.currentPrice;
  const linked = Boolean(dashboard?.linked);
  const showLinkBanner = dashboard && !linked;
  const customerStatus = dashboard?.customer?.status;
  const syncError = dashboard?.syncError;

  return (
    <div className="page user-dashboard-page">
      <div className="page-hero">
        <h1 className="page-hero-title">My Dashboard</h1>
        <p className="page-hero-desc">Welcome, {user?.name}</p>
      </div>

      <div className="user-dashboard-tabs">
        {['dashboard', 'orders', 'history', 'profile'].map((tab) => (
          <button
            key={tab}
            type="button"
            className={`user-dash-tab ${activeTab === tab ? 'active' : ''}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab === 'dashboard'
              ? 'Dashboard'
              : tab === 'orders'
                ? 'Orders'
                : tab === 'history'
                  ? 'History'
                  : 'Profile'}
          </button>
        ))}
        {/* <button type="button" className="btn-secondary user-dash-logout" onClick={() => { logout(); navigate('/'); }}>
          Logout
        </button> */}
      </div>

      {activeTab === 'dashboard' && (
        <section className="panel user-dash-panel">
          <div className="orders-subtabs" role="tablist" aria-label="Dashboard views">
            {orderTabs.map((t) => (
              <button
                key={t.key}
                type="button"
                role="tab"
                aria-selected={dashSubTab === t.key}
                className={`orders-subtab ${dashSubTab === t.key ? 'is-active' : ''}`}
                onClick={() => setDashSubTab(t.key)}
              >
                <span className="orders-subtab-icon" aria-hidden="true">{t.icon}</span>
                <span className="orders-subtab-text">
                  <strong>{t.label}</strong>
                  <small>{t.hint}</small>
                </span>
                <span className="orders-subtab-count">{loadingOrders ? '…' : t.count}</span>
              </button>
            ))}
          </div>

          {dashSubTab === 'physical' && (
            <>
              {!(user?.kycStatus === 'approved' && user?.kycMethod === 'digilocker') && (
              <div className="user-dash-safegold-banner" style={{ marginBottom: '1rem' }}>
                <p>
                  <strong>KYC:</strong>{' '}
                  {user?.kycStatus === 'approved'
                    ? 'Verified — you can buy physical products.'
                    : user?.kycStatus === 'pending'
                      ? 'Under review — checkout unlocks after approval.'
                      : user?.kycStatus === 'rejected'
                        ? 'Rejected — please resubmit documents.'
                        : 'Not submitted — required before first product purchase.'}
                </p>
                {user?.kycStatus !== 'approved' && (
                  <div className="user-dash-safegold-actions">
                    <Link to="/kyc" className="btn-primary">
                      {user?.kycStatus === 'rejected' ? 'Resubmit KYC' : 'Complete KYC'}
                    </Link>
                  </div>
                )}
                {user?.kycStatus === 'approved' && (
                  <div className="user-dash-safegold-actions">
                    <Link to="/kyc" className="btn-secondary">
                      View KYC status
                    </Link>
                  </div>
                )}
              </div>
              )}
              <div className="user-dash-stats-grid">
                <div className="user-dash-stat-card">
                  <span className="user-dash-stat-label">Paid orders</span>
                  <strong>{physicalOrders.length}</strong>
                  <small>Physical gold and silver</small>
                </div>
                <div className="user-dash-stat-card">
                  <span className="user-dash-stat-label">Amount spent</span>
                  <strong>{formatInr(physicalOrders.reduce((sum, row) => sum + (Number(row.amountInvested) || 0), 0))}</strong>
                  <small>Paid physical orders only</small>
                </div>
                <div className="user-dash-stat-card">
                  <span className="user-dash-stat-label">In delivery</span>
                  <strong>
                    {physicalOrders.filter((row) => ['In transit', 'Booked', 'Awaiting dispatch'].includes(physicalShipmentStatus(row))).length}
                  </strong>
                  <small>Booked, awaiting dispatch, or in transit</small>
                </div>
              </div>
              <button
                type="button"
                className="btn-secondary"
                onClick={() => {
                  setOrdersSubTab('physical');
                  setActiveTab('orders');
                }}
              >
                Open physical orders
              </button>
            </>
          )}

          {dashSubTab === 'etf' && (
            <>
              <div className="user-dash-stats-grid">
                <div className="user-dash-stat-card">
                  <span className="user-dash-stat-label">Paid orders</span>
                  <strong>{etfOrders.length}</strong>
                  <small>Gold and silver ETFs</small>
                </div>
                <div className="user-dash-stat-card">
                  <span className="user-dash-stat-label">Amount spent</span>
                  <strong>{formatInr(etfOrders.reduce((sum, row) => sum + (Number(row.amountInvested) || 0), 0))}</strong>
                  <small>Paid ETF orders only</small>
                </div>
              </div>
              <button
                type="button"
                className="btn-secondary"
                onClick={() => {
                  setOrdersSubTab('etf');
                  setActiveTab('orders');
                }}
              >
                Open ETF orders
              </button>
            </>
          )}

          {dashSubTab === 'safegold' && (loadingDash ? (
            <p>Loading portfolio…</p>
          ) : (
            <>
              {showLinkBanner && (
                <div className="user-dash-safegold-banner">
                  <p>
                    <strong>SafeGold vault not linked.</strong>{' '}
                    {customerStatus === 'failed'
                      ? 'Your previous SafeGold link failed.'
                      : 'Digital gold balance and live rates come from SafeGold.'}{' '}
                    {syncError ? `(${syncError})` : ''}
                  </p>
                  <p className="user-dash-safegold-banner-hint">
                    Total investment is kept from your local purchase records. Gold holdings, rates, and history use
                    SafeGold once linked.
                  </p>
                  <div className="user-dash-safegold-actions">
                    <button
                      type="button"
                      className="btn-primary"
                      onClick={handleLinkSafeGold}
                      disabled={linking}
                    >
                      {linking ? 'Linking…' : 'Link SafeGold Vault'}
                    </button>
                  </div>
                </div>
              )}

              <div className="user-dash-stats-grid">
                <div className="user-dash-stat-card">
                  <span className="user-dash-stat-label">Total Investment</span>
                  <strong>{formatInr(dashboard?.totalInvestment)}</strong>
                  <small>From your paid gold purchases (local records)</small>
                </div>
                <div className="user-dash-stat-card">
                  <span className="user-dash-stat-label">Gold Holdings</span>
                  <strong>{formatGrams(dashboard?.goldHoldingsGrams)}</strong>
                  <small>
                    Current value {formatInr(dashboard?.goldCurrentValue)}
                    {linked ? ' · SafeGold vault' : ' · link SafeGold to sync'}
                  </small>
                </div>
                <div className={`user-dash-stat-card ${plPositive ? 'positive' : 'negative'}`}>
                  <span className="user-dash-stat-label">Profit / Loss</span>
                  <strong>
                    {plPositive ? '+' : ''}
                    {formatInr(pl)}
                  </strong>
                  <small>vs investment at SafeGold live buy rate (incl. GST)</small>
                </div>
                <div className="user-dash-stat-card">
                  <span className="user-dash-stat-label">Vault status</span>
                  <strong className="capitalize">{linked ? 'Linked' : customerStatus || 'Not linked'}</strong>
                  {dashboard?.wallet?.lastSyncedAt && (
                    <small>
                      Last synced {new Date(dashboard.wallet.lastSyncedAt).toLocaleString()}
                    </small>
                  )}
                </div>
              </div>

              <div className="user-dash-rates-row">
                <div className="user-dash-rate-box">
                  <span>SafeGold Buy Rate</span>
                  <strong>{formatInr(goldRate)}/g</strong>
                  {dashboard?.rate?.applicableTax != null && (
                    <small>incl. {dashboard.rate.applicableTax}% GST</small>
                  )}
                </div>
                {dashboard?.sellRate?.currentPrice != null && (
                  <div className="user-dash-rate-box">
                    <span>SafeGold Sell Rate</span>
                    <strong>{formatInr(dashboard.sellRate.currentPrice)}/g</strong>
                    <small>GST not charged on sale</small>
                  </div>
                )}
                {dashboard?.wallet?.safegoldUserId && (
                  <div className="user-dash-rate-box">
                    <span>SafeGold User ID</span>
                    <strong className="user-dash-sg-id">{dashboard.wallet.safegoldUserId}</strong>
                  </div>
                )}
              </div>
              <button
                type="button"
                className="btn-secondary"
                style={{ marginTop: '1rem' }}
                onClick={() => {
                  setOrdersSubTab('safegold');
                  setActiveTab('orders');
                }}
              >
                Open SafeGold orders
              </button>

            </>
          ))}
        </section>
      )}

      {activeTab === 'orders' && (
        <section className="panel user-dash-panel">
          <h2>Orders</h2>
          <p className="page-hero-desc">
            Physical gold orders include Sequel tracking. Digital SafeGold orders include the invoice.
          </p>
          <div className="orders-subtabs" role="tablist" aria-label="Order types">
            {orderTabs.map((t) => (
              <button
                key={t.key}
                type="button"
                role="tab"
                aria-selected={ordersSubTab === t.key}
                className={`orders-subtab ${ordersSubTab === t.key ? 'is-active' : ''}`}
                onClick={() => setOrdersSubTab(t.key)}
              >
                <span className="orders-subtab-icon" aria-hidden="true">{t.icon}</span>
                <span className="orders-subtab-text">
                  <strong>{t.label}</strong>
                  <small>{t.hint}</small>
                </span>
                <span className="orders-subtab-count">{loadingOrders ? '…' : t.count}</span>
              </button>
            ))}
          </div>
          {loadingOrders ? (
            <p>Loading orders…</p>
          ) : (
            <div className="orders-subpanel" key={ordersSubTab}>
              {ordersSubTab === 'physical' && (physicalOrders.length === 0 ? (
                <div className="orders-empty">
                  <span aria-hidden="true">📦</span>
                  <p>No physical gold orders yet.</p>
                  <Link to="/own-gold" className="btn-secondary">Shop physical gold</Link>
                </div>
              ) : (
                <>
            <div className="user-dash-table-wrap">
              <table className="user-dash-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Product</th>
                    <th>Type</th>
                    <th>Quantity</th>
                    <th>Amount</th>
                    <th>Status</th>
                    <th>Sequel</th>
                    <th>Track</th>
                  </tr>
                </thead>
                <tbody>
                  {pagedOrders.map((row, idx) => (
                    <tr key={`${row.orderId}-${idx}`}>
                      <td>{row.orderDate ? new Date(row.orderDate).toLocaleString() : '—'}</td>
                      <td>{row.productName}</td>
                      <td>{row.catalog === 'mmtc' ? 'mmtc' : 'own'}</td>
                      <td>{row.quantity ?? 1}</td>
                      <td>{formatInr(row.amountInvested)}</td>
                      <td className="capitalize">{physicalShipmentStatus(row)}</td>
                      <td>
                        {row.sequel?.docketNumber ? (
                          <div className="user-dash-sequel">
                            <span>Docket {row.sequel.docketNumber}</span>
                            {row.sequel.estimatedDelivery ? (
                              <span>EDD {row.sequel.estimatedDelivery}</span>
                            ) : null}
                          </div>
                        ) : row.sequel?.status === 'failed' ? (
                          <div className="user-dash-sequel">
                            <span>failed</span>
                            {row.sequel.lastError ? (
                              <span className="user-dash-sequel-error">{row.sequel.lastError}</span>
                            ) : null}
                          </div>
                        ) : row.sequel ? (
                          row.sequel.status || 'pending'
                        ) : (
                          '—'
                        )}
                      </td>
                      <td>
                        {row.sequel?.docketNumber ? (
                          <div className="user-dash-sequel-actions">
                            {row.sequel.trackingUrl && (
                              <a
                                href={row.sequel.trackingUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="sequel-track-link"
                              >
                                Track shipment
                              </a>
                            )}
                            <button
                              type="button"
                              className="btn-secondary"
                              disabled={trackingId === row.orderId}
                              onClick={() => handleTrackOrder(row.orderId)}
                            >
                              {trackingId === row.orderId ? 'Updating…' : 'Refresh'}
                            </button>
                          </div>
                        ) : row.sequel?.required ? (
                          <span className="user-dash-muted">Awaiting Sequel dispatch</span>
                        ) : (
                          '—'
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <TablePager
              page={ordersPageSafe}
              totalPages={ordersTotalPages}
              totalItems={physicalOrders.length}
              onPage={setOrdersPage}
            />
                </>
              ))}

              {ordersSubTab === 'safegold' && (digitalOrders.length === 0 ? (
                <div className="orders-empty">
                  <span aria-hidden="true">🪙</span>
                  <p>No SafeGold orders yet.</p>
                  <Link to="/invest-gold" className="btn-secondary">Buy digital gold</Link>
                </div>
              ) : (
                <>
                  <div className="user-dash-table-wrap">
                    <table className="user-dash-table">
                      <thead>
                        <tr>
                          <th>Date</th>
                          <th>Product</th>
                          <th>Weight</th>
                          <th>Amount</th>
                          <th>Status</th>
                          <th>Invoice</th>
                        </tr>
                      </thead>
                      <tbody>
                        {pagedDigital.map((row, idx) => (
                          <tr key={`${row.orderId}-sg-${idx}`}>
                            <td>{row.orderDate ? new Date(row.orderDate).toLocaleString() : '—'}</td>
                            <td>{digitalGoldProductName(row)}</td>
                            <td>{row.metalGrams != null ? formatGrams(row.metalGrams) : '—'}</td>
                            <td>{formatInr(row.amountInvested)}</td>
                            <td className="capitalize">{row.orderStatus}</td>
                            <td>
                              {row.paymentStatus === 'success' || row.orderStatus === 'paid' ? (
                                <button
                                  type="button"
                                  className="btn-secondary"
                                  disabled={invoiceLoadingId === String(row.orderId)}
                                  onClick={() => showInvoice(row)}
                                >
                                  {invoiceLoadingId === String(row.orderId) ? 'Loading…' : 'Show invoice'}
                                </button>
                              ) : (
                                '—'
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <TablePager
                    page={digitalPageSafe}
                    totalPages={digitalTotalPages}
                    totalItems={digitalOrders.length}
                    onPage={setDigitalPage}
                  />
                </>
              ))}

              {ordersSubTab === 'etf' && (etfOrders.length === 0 ? (
                <div className="orders-empty">
                  <span aria-hidden="true">📈</span>
                  <p>No ETF orders yet.</p>
                  <Link to="/invest" className="btn-secondary">Explore Gold and Silver ETFs</Link>
                </div>
              ) : (
                <>
                  <div className="user-dash-table-wrap">
                    <table className="user-dash-table">
                      <thead>
                        <tr>
                          <th>Date</th>
                          <th>Product</th>
                          <th>Amount</th>
                          <th>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {pagedEtf.map((row, idx) => (
                          <tr key={`${row.orderId}-etf-${idx}`}>
                            <td>{row.orderDate ? new Date(row.orderDate).toLocaleString() : '—'}</td>
                            <td>{row.productName}</td>
                            <td>{formatInr(row.amountInvested)}</td>
                            <td className="capitalize">{row.orderStatus}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <TablePager
                    page={etfPageSafe}
                    totalPages={etfTotalPages}
                    totalItems={etfOrders.length}
                    onPage={setEtfPage}
                  />
                </>
              ))}
            </div>
          )}
        </section>
      )}

      {activeTab === 'history' && (
        <section className="panel user-dash-panel">
          {!history.linked && (
            <div className="user-dash-safegold-banner" style={{ marginBottom: '1rem' }}>
              <p>
                <strong>Shop orders are included</strong> (physical, MMTC, and other products). Link SafeGold on the
                Dashboard tab to add live vault transactions.
              </p>
            </div>
          )}
          {loadingHistory || loadingOrders ? (
            <p>Loading transactions…</p>
          ) : historyRows.length === 0 ? (
            <p>No transactions yet.</p>
          ) : (
            <>
            <div className="user-dash-table-wrap">
              <table className="user-dash-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Product</th>
                    <th>Type</th>
                    <th>Quantity</th>
                    <th>Amount</th>
                    <th>Grams</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {pagedHistory.map((row) => (
                    <tr key={row.id}>
                      <td>{row.date ? new Date(row.date).toLocaleString() : '—'}</td>
                      <td>{row.product}</td>
                      <td className={row.txType === 'sell' ? 'user-dash-sell' : row.txType === 'buy' ? 'user-dash-buy' : ''}>
                        {row.typeLabel}
                      </td>
                      <td>{row.quantity != null ? row.quantity : '—'}</td>
                      <td className={row.txType === 'sell' ? 'user-dash-sell' : row.txType === 'buy' ? 'user-dash-buy' : ''}>
                        {row.txType === 'sell'
                          ? `Received ${formatInr(row.amount)}`
                          : row.txType === 'buy'
                            ? `Paid ${formatInr(row.amount)}`
                            : formatInr(row.amount)}
                      </td>
                      <td className={row.txType === 'sell' ? 'user-dash-sell' : row.txType === 'buy' ? 'user-dash-buy' : ''}>
                        {row.grams == null
                          ? '—'
                          : `${row.txType === 'sell' ? '−' : row.txType === 'buy' ? '+' : ''}${formatGrams(row.grams)}`}
                      </td>
                      <td className="capitalize">{row.status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <TablePager
              page={historyPageSafe}
              totalPages={historyTotalPages}
              totalItems={historyRows.length}
              onPage={setHistoryPage}
            />
            </>
          )}
          {/* {history.syncError && (
            <p className="user-dash-meta" style={{ color: '#b45309' }}>
              SafeGold history sync: {history.syncError}
            </p>
          )} */}
        </section>
      )}

      {activeTab === 'profile' && (
        <section className="panel user-dash-panel">
          <div className="user-dash-profile-readonly">
            <p><strong>Name:</strong> {user?.name}</p>
            <p><strong>Email:</strong> {user?.email}</p>
            <p><strong>Mobile:</strong> {user?.mobile || '—'}</p>
            {/* <p><strong>User Type:</strong> {user?.userType === 'admin' ? 'Admin' : 'General User'}</p> */}
          </div>

          <div className={`user-dash-profile-grid${(!user?.kycStatus || user.kycStatus === 'not_submitted') ? '' : ' cols-2'}`}>
            <article className="user-dash-profile-card">
              <div className="user-dash-card-head">
                <span className="user-dash-card-icon" aria-hidden="true">
                  <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8">
                    <circle cx="12" cy="8" r="3.2" />
                    <path d="M5 19.2c1.4-3 3.8-4.5 7-4.5s5.6 1.5 7 4.5" strokeLinecap="round" />
                  </svg>
                </span>
                <h3>Edit Profile</h3>
              </div>
              <form className="form" onSubmit={handleProfileSave} noValidate>
                <label className={profileErrors.name ? 'has-error' : ''}>
                  Full Name
                  <input
                    type="text"
                    placeholder="Your Name"
                    value={profileForm.name}
                    onChange={(e) => {
                      const name = e.target.value;
                      setProfileForm((p) => ({ ...p, name }));
                      if (profileErrors.name) setProfileErrors((p) => ({ ...p, name: '' }));
                    }}
                    onBlur={() => handleProfileBlur('name')}
                    autoComplete="name"
                    maxLength={100}
                    aria-invalid={Boolean(profileErrors.name)}
                    required
                  />
                  {profileErrors.name && <span className="field-error">{profileErrors.name}</span>}
                </label>
                <label className={profileErrors.mobile ? 'has-error' : ''}>
                  Mobile Number
                  <input
                    type="tel"
                    inputMode="numeric"
                    autoComplete="tel"
                    placeholder="10-digit mobile"
                    value={profileForm.mobile}
                    onChange={(e) => {
                      const mobile = e.target.value.replace(/\D/g, '').slice(0, 10);
                      setProfileForm((p) => ({ ...p, mobile }));
                      if (profileErrors.mobile) setProfileErrors((p) => ({ ...p, mobile: '' }));
                    }}
                    onBlur={() => handleProfileBlur('mobile')}
                    maxLength={10}
                    aria-invalid={Boolean(profileErrors.mobile)}
                    required
                  />
                  {profileErrors.mobile && <span className="field-error">{profileErrors.mobile}</span>}
                </label>
                <button className="btn-primary" type="submit" disabled={savingProfile}>
                  {savingProfile ? 'Saving…' : 'Save Profile'}
                </button>
              </form>
            </article>

            <article className="user-dash-profile-card">
              <div className="user-dash-card-head">
                <span className="user-dash-card-icon" aria-hidden="true">
                  <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8">
                    <rect x="5" y="10.5" width="14" height="9" rx="2" />
                    <path d="M8 10.5V8a4 4 0 0 1 8 0v2.5" strokeLinecap="round" />
                  </svg>
                </span>
                <h3>Change Password</h3>
              </div>
              <form className="form" onSubmit={handlePasswordChange} noValidate>
                <label>
                  Current Password
                  <input
                    type="password"
                    value={passwordForm.currentPassword}
                    onChange={(e) =>
                      setPasswordForm((p) => ({ ...p, currentPassword: e.target.value }))
                    }
                    autoComplete="current-password"
                    required
                  />
                </label>
                <label className={passwordErrors.newPassword ? 'has-error' : ''}>
                  New Password
                  <input
                    type="password"
                    placeholder="Min. 6 characters, with a letter and a number"
                    value={passwordForm.newPassword}
                    onChange={(e) => {
                      const newPassword = e.target.value;
                      setPasswordForm((p) => ({ ...p, newPassword }));
                      if (passwordErrors.newPassword) {
                        setPasswordErrors((p) => ({ ...p, newPassword: '' }));
                      }
                    }}
                    onBlur={() =>
                      setPasswordErrors((p) => ({
                        ...p,
                        newPassword: newPasswordError(passwordForm.newPassword, passwordForm.confirmPassword)
                      }))
                    }
                    autoComplete="new-password"
                    maxLength={64}
                    aria-invalid={Boolean(passwordErrors.newPassword)}
                    required
                  />
                  {passwordErrors.newPassword && (
                    <span className="field-error">{passwordErrors.newPassword}</span>
                  )}
                </label>
                <label className={passwordErrors.confirmPassword ? 'has-error' : ''}>
                  Confirm New Password
                  <input
                    type="password"
                    value={passwordForm.confirmPassword}
                    onChange={(e) => {
                      const confirmPassword = e.target.value;
                      setPasswordForm((p) => ({ ...p, confirmPassword }));
                      if (passwordErrors.confirmPassword) {
                        setPasswordErrors((p) => ({ ...p, confirmPassword: '' }));
                      }
                    }}
                    autoComplete="new-password"
                    maxLength={64}
                    aria-invalid={Boolean(passwordErrors.confirmPassword)}
                    required
                  />
                  {passwordErrors.confirmPassword && (
                    <span className="field-error">{passwordErrors.confirmPassword}</span>
                  )}
                </label>
                <button className="btn-primary" type="submit" disabled={savingPassword}>
                  {savingPassword ? 'Updating…' : 'Change Password'}
                </button>
              </form>
            </article>

            {(!user?.kycStatus || user.kycStatus === 'not_submitted') && (
              <article className="user-dash-profile-card user-dash-kyc-card">
                <div className="user-dash-card-head">
                  <span className="user-dash-card-icon" aria-hidden="true">
                    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8">
                      <path d="M12 3.5 5.5 6.2v5.3c0 4.1 2.8 7.2 6.5 8.5 3.7-1.3 6.5-4.4 6.5-8.5V6.2L12 3.5Z" strokeLinejoin="round" />
                      <path d="M9.2 12.1 11 13.9l3.8-4" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </span>
                  <h3>Add KYC</h3>
                </div>
                <span className="user-dash-kyc-badge">Not submitted</span>
                <p>
                  Verify your identity with DigiLocker or by uploading documents. Needed when an order is ₹2,00,000 or more.
                </p>
                <Link to="/kyc" className="btn-primary">Add KYC</Link>
              </article>
            )}
          </div>
        </section>
      )}

      {invoicePopupOpen && invoiceFrameSrc && (
        <div className="igos-invoice-overlay" role="dialog" aria-modal="true" aria-labelledby="dash-invoice-title">
          <div className="igos-invoice-popup">
            <div className="igos-invoice-popup-head">
              <h2 id="dash-invoice-title">SafeGold Invoice</h2>
              <div className="igos-invoice-popup-actions">
                <a href={invoiceDownloadHref} className="igos-invoice-download" download="safegold-invoice.pdf">
                  Download
                </a>
                <button type="button" className="igos-invoice-close" onClick={closeInvoice} aria-label="Close invoice">
                  ×
                </button>
              </div>
            </div>
            <iframe className="igos-invoice-frame" title="SafeGold invoice" src={invoiceFrameSrc} />
          </div>
        </div>
      )}
    </div>
  );
};

export default UserDashboardPage;
