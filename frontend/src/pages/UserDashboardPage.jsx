import { useEffect, useState, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../state/AuthContext';
import { useToast } from '../state/ToastContext';
import { safegoldService, authService } from '../services/api';

const formatInr = (n) =>
  n == null || Number.isNaN(Number(n))
    ? '—'
    : `₹${Number(n).toLocaleString('en-IN', { maximumFractionDigits: 2 })}`;

const formatGrams = (g) =>
  g == null ? '—' : `${Number(g).toLocaleString('en-IN', { maximumFractionDigits: 4 })} g`;

const normalizeHistoryRows = (local = [], remote = []) => {
  if (remote.length > 0) {
    return remote.map((tx) => ({
      id: tx.safegoldTxId || tx.clientReferenceId || tx.createdAt,
      date: tx.createdAt,
      type: tx.type || 'buy',
      amount: tx.buyPrice,
      grams: tx.goldAmount,
      rate: tx.goldAmount > 0 ? tx.buyPrice / tx.goldAmount : null,
      status: tx.status || 'success',
      source: 'safegold'
    }));
  }

  return local.map((tx) => ({
    id: tx._id || tx.clientReferenceId,
    date: tx.createdAt,
    type: tx.type || 'buy',
    amount: tx.buyPrice,
    grams: tx.goldAmount,
    rate: tx.currentPrice,
    status: tx.status,
    source: 'local'
  }));
};

const UserDashboardPage = () => {
  const { user, isAuthenticated, isGeneral, loading: authLoading, logout, updateUser } = useAuth();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [dashboard, setDashboard] = useState(null);
  const [history, setHistory] = useState({ local: [], remote: [], syncError: null, linked: false });
  const [loadingDash, setLoadingDash] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [linking, setLinking] = useState(false);
  const [resetting, setResetting] = useState(false);

  const [profileForm, setProfileForm] = useState({ name: '', mobile: '' });
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);

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

  useEffect(() => {
    if (!isGeneral) return;
    if (activeTab === 'dashboard') fetchDashboard();
    if (activeTab === 'history') fetchHistory();
    if (activeTab === 'profile' && user) {
      setProfileForm({ name: user.name || '', mobile: user.mobile || '' });
    }
  }, [activeTab, isGeneral, fetchDashboard, fetchHistory, user]);

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

  const handleResetSafeGoldLink = async () => {
    const confirmed = window.confirm(
      'This clears your local SafeGold link only (your portal account and payment history stay). ' +
        'You can then register a fresh SafeGold vault with the same mobile. Continue?'
    );
    if (!confirmed) return;

    setResetting(true);
    try {
      const res = await safegoldService.resetCustomerLink();
      showToast(res.data?.message || 'Local SafeGold link cleared', 'success');
      setDashboard(null);
      await fetchDashboard();
    } catch (err) {
      showToast(err.response?.data?.message || 'Reset failed', 'error');
    } finally {
      setResetting(false);
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

  const historyRows = useMemo(
    () => normalizeHistoryRows(history.local, history.remote),
    [history]
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
        {['dashboard', 'history', 'profile'].map((tab) => (
          <button
            key={tab}
            type="button"
            className={`user-dash-tab ${activeTab === tab ? 'active' : ''}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab === 'dashboard' ? 'Dashboard' : tab === 'history' ? 'History' : 'Profile'}
          </button>
        ))}
        <button type="button" className="btn-secondary user-dash-logout" onClick={() => { logout(); navigate('/'); }}>
          Logout
        </button>
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
                    SafeGold once linked. If this account was never created on SafeGold, link below. If the link is
                    wrong, reset and create fresh.
                  </p>
                  <div className="user-dash-safegold-actions">
                    <button
                      type="button"
                      className="btn-primary"
                      onClick={handleLinkSafeGold}
                      disabled={linking || resetting}
                    >
                      {linking ? 'Linking…' : 'Link SafeGold Vault'}
                    </button>
                    {(dashboard?.customer || customerStatus === 'failed') && (
                      <button
                        type="button"
                        className="btn-secondary"
                        onClick={handleResetSafeGoldLink}
                        disabled={linking || resetting}
                      >
                        {resetting ? 'Resetting…' : 'Reset local link'}
                      </button>
                    )}
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
                {dashboard?.wallet?.safegoldUserId && (
                  <div className="user-dash-rate-box">
                    <span>SafeGold User ID</span>
                    <strong className="user-dash-sg-id">{dashboard.wallet.safegoldUserId}</strong>
                  </div>
                )}
              </div>
              <p className="user-dash-meta">
                Rates source: {dashboard?.rate?.source || 'safegold'}
                {dashboard?.rate?.mock ? ' (staging fallback)' : ''}
                {' · '}
                Balance source: {dashboard?.wallet?.balanceSource || 'local'}
                {' · '}
                {dashboard?.transactions?.length || 0} local transactions
              </p>

              {linked && (
                <div className="user-dash-safegold-actions" style={{ marginTop: '1rem' }}>
                  <button
                    type="button"
                    className="btn-secondary"
                    onClick={handleResetSafeGoldLink}
                    disabled={resetting}
                  >
                    {resetting ? 'Resetting…' : 'Reset local SafeGold link'}
                  </button>
                </div>
              )}
            </>
          )}
        </section>
      )}

      {activeTab === 'history' && (
        <section className="panel user-dash-panel">
          {!history.linked && (
            <div className="user-dash-safegold-banner" style={{ marginBottom: '1rem' }}>
              <p>
                <strong>Showing local purchase history.</strong> Link SafeGold vault on the Dashboard tab for live
                SafeGold transaction history.
              </p>
            </div>
          )}
          {loadingHistory ? (
            <p>Loading transactions…</p>
          ) : historyRows.length === 0 ? (
            <p>No gold transactions yet.</p>
          ) : (
            <div className="user-dash-table-wrap">
              <table className="user-dash-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Type</th>
                    <th>Amount</th>
                    <th>Grams</th>
                    <th>Rate at Purchase</th>
                    <th>Status</th>
                    <th>Source</th>
                  </tr>
                </thead>
                <tbody>
                  {historyRows.map((row) => (
                    <tr key={row.id}>
                      <td>{row.date ? new Date(row.date).toLocaleString() : '—'}</td>
                      <td className="capitalize">{row.type}</td>
                      <td>{formatInr(row.amount)}</td>
                      <td>{formatGrams(row.grams)}</td>
                      <td>{row.rate != null ? `${formatInr(row.rate)}/g` : '—'}</td>
                      <td className="capitalize">{row.status}</td>
                      <td className="capitalize">{row.source}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
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
            <p><strong>User Type:</strong> {user?.userType === 'admin' ? 'Admin' : 'General User'}</p>
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
    </div>
  );
};

export default UserDashboardPage;
