import { useEffect, useState, useCallback, useMemo, useRef } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../state/AuthContext';
import { useToast } from '../state/ToastContext';
import { safegoldService, authService, userService, sequelService } from '../services/api';
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

const normalizeHistoryRows = (local = [], remote = []) => {
  if (remote.length > 0) {
    return remote.map((tx) => ({
      id: tx.safegoldTxId || tx.clientReferenceId || tx.createdAt,
      date: tx.createdAt,
      product: 'Digital Gold (SafeGold)',
      typeLabel: 'digital',
      amount: tx.buyPrice,
      quantity: null,
      grams: tx.goldAmount,
      rate: tx.goldAmount > 0 ? tx.buyPrice / tx.goldAmount : null,
      status: tx.status || 'success',
      source: 'safegold'
    }));
  }

  return local.map((tx) => ({
    id: tx._id || tx.clientReferenceId,
    date: tx.createdAt,
    product: 'Digital Gold (SafeGold)',
    typeLabel: 'digital',
    amount: tx.buyPrice,
    quantity: null,
    grams: tx.goldAmount,
    rate: tx.currentPrice,
    status: tx.status,
    source: 'local'
  }));
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
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
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

  const fetchProductOrders = useCallback(async () => {
    setLoadingOrders(true);
    try {
      const res = await userService.getOrders();
      setProductOrders(Array.isArray(res.data?.history) ? res.data.history : []);
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to load orders', 'error');
    } finally {
      setLoadingOrders(false);
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
    if (activeTab === 'dashboard') fetchDashboard();
    if (activeTab === 'history') {
      fetchHistory();
      fetchProductOrders();
    }
    if (activeTab === 'orders') fetchProductOrders();
    if (activeTab === 'profile' && user) {
      setProfileForm({ name: user.name || '', mobile: user.mobile || '' });
    }
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

  const handleProfileSave = async (e) => {
    e.preventDefault();
    setSavingProfile(true);
    try {
      const res = await authService.updateProfile(profileForm);
      showToast('Profile updated', 'success');
      if (res.data?.user) updateUser(res.data.user);
    } catch (err) {
      showToast(err.response?.data?.message || 'Update failed', 'error');
    } finally {
      setSavingProfile(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      showToast('New passwords do not match', 'error');
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
    } catch (err) {
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
    { key: 'physical', label: 'Physical Gold', hint: 'Sequel tracked delivery', icon: '📦', count: physicalOrders.length },
    { key: 'safegold', label: 'Digital Gold – SafeGold', hint: 'Vault-stored 24K gold', icon: '🪙', count: digitalOrders.length },
    { key: 'etf', label: 'Digital Gold – ETFs', hint: 'Exchange traded funds', icon: '📈', count: etfOrders.length }
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
          {loadingDash ? (
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

            </>
          )}
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
                      <td className="capitalize">{row.orderStatus}</td>
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
                  <p>No gold ETF orders yet.</p>
                  <Link to="/invest" className="btn-secondary">Explore gold ETFs</Link>
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
                      <td>{row.typeLabel}</td>
                      <td>{row.quantity != null ? row.quantity : '—'}</td>
                      <td>{formatInr(row.amount)}</td>
                      <td>{row.grams != null ? formatGrams(row.grams) : '—'}</td>
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
          {history.syncError && (
            <p className="user-dash-meta" style={{ color: '#b45309' }}>
              SafeGold history sync: {history.syncError}
            </p>
          )}
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

          <h3>Edit Profile</h3>
          <form className="form" onSubmit={handleProfileSave}>
            <label>
              Name
              <input
                type="text"
                value={profileForm.name}
                onChange={(e) => setProfileForm((p) => ({ ...p, name: e.target.value }))}
                required
              />
            </label>
            <label>
              Mobile Number
              <input
                type="tel"
                value={profileForm.mobile}
                onChange={(e) => setProfileForm((p) => ({ ...p, mobile: e.target.value }))}
              />
            </label>
            <button className="btn-primary" type="submit" disabled={savingProfile}>
              {savingProfile ? 'Saving…' : 'Save Profile'}
            </button>
          </form>

          <h3 style={{ marginTop: '2rem' }}>Change Password</h3>
          <form className="form" onSubmit={handlePasswordChange}>
            <label>
              Current Password
              <input
                type="password"
                value={passwordForm.currentPassword}
                onChange={(e) =>
                  setPasswordForm((p) => ({ ...p, currentPassword: e.target.value }))
                }
                required
              />
            </label>
            <label>
              New Password
              <input
                type="password"
                value={passwordForm.newPassword}
                onChange={(e) =>
                  setPasswordForm((p) => ({ ...p, newPassword: e.target.value }))
                }
                minLength={6}
                required
              />
            </label>
            <label>
              Confirm New Password
              <input
                type="password"
                value={passwordForm.confirmPassword}
                onChange={(e) =>
                  setPasswordForm((p) => ({ ...p, confirmPassword: e.target.value }))
                }
                required
              />
            </label>
            <button className="btn-primary" type="submit" disabled={savingPassword}>
              {savingPassword ? 'Updating…' : 'Change Password'}
            </button>
          </form>
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
