import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../state/AuthContext';
import { useToast } from '../state/ToastContext';
import { userService, authService, zerodhaService } from '../services/api';

const formatInr = (n) =>
  n == null || Number.isNaN(Number(n))
    ? '—'
    : `₹${Number(n).toLocaleString('en-IN', { maximumFractionDigits: 2 })}`;

const formatGrams = (g) =>
  g == null ? '—' : `${Number(g).toLocaleString('en-IN', { maximumFractionDigits: 3 })} g`;

const UserDashboardPage = () => {
  const { user, isAuthenticated, isGeneral, loading: authLoading, logout, updateUser } = useAuth();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [dashboard, setDashboard] = useState(null);
  const [history, setHistory] = useState([]);
  const [loadingDash, setLoadingDash] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [historyFilter, setHistoryFilter] = useState('all');
  const [liveMarket, setLiveMarket] = useState(null);

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
      const res = await userService.getDashboard();
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
      const params = historyFilter === 'all' ? {} : { metal: historyFilter };
      const res = await userService.getOrders(params);
      setHistory(res.data.history || []);
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to load history', 'error');
    } finally {
      setLoadingHistory(false);
    }
  }, [historyFilter, showToast]);

  useEffect(() => {
    if (!isGeneral) return;
    const token = localStorage.getItem('zerodha_access_token');
    zerodhaService.getMarketData(token).then((res) => {
      if (res.data?.success && res.data?.data) setLiveMarket(res.data.data);
    }).catch(() => {});
  }, [isGeneral]);

  useEffect(() => {
    if (!isGeneral) return;
    if (activeTab === 'dashboard') fetchDashboard();
    if (activeTab === 'history') fetchHistory();
    if (activeTab === 'profile' && user) {
      setProfileForm({ name: user.name || '', mobile: user.mobile || '' });
    }
  }, [activeTab, isGeneral, fetchDashboard, fetchHistory, user]);

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

  if (authLoading || !isGeneral) {
    return (
      <div className="page">
        <p className="page-hero-desc">Loading your dashboard…</p>
      </div>
    );
  }

  const pl = dashboard?.profitLoss ?? 0;
  const plPositive = pl >= 0;
  const goldRate = liveMarket?.goldPrice ?? dashboard?.liveRates?.goldPerGram;
  const silverRate = liveMarket?.silverPrice ?? dashboard?.liveRates?.silverPerGram;

  const filteredHistory =
    historyFilter === 'all'
      ? history
      : history.filter((h) => h.metal === historyFilter);

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
              <div className="user-dash-stats-grid">
                <div className="user-dash-stat-card">
                  <span className="user-dash-stat-label">Total Investment</span>
                  <strong>{formatInr(dashboard?.totalInvestment)}</strong>
                </div>
                <div className="user-dash-stat-card">
                  <span className="user-dash-stat-label">Gold Holdings</span>
                  <strong>{formatGrams(dashboard?.goldHoldingsGrams)}</strong>
                  <small>Current value {formatInr(dashboard?.goldCurrentValue)}</small>
                </div>
                <div className="user-dash-stat-card">
                  <span className="user-dash-stat-label">Silver Holdings</span>
                  <strong>{formatGrams(dashboard?.silverHoldingsGrams)}</strong>
                  <small>Current value {formatInr(dashboard?.silverCurrentValue)}</small>
                </div>
                <div className={`user-dash-stat-card ${plPositive ? 'positive' : 'negative'}`}>
                  <span className="user-dash-stat-label">Profit / Loss</span>
                  <strong>
                    {plPositive ? '+' : ''}
                    {formatInr(pl)}
                  </strong>
                  <small>vs purchase cost at live Zerodha rates</small>
                </div>
              </div>

              <div className="user-dash-rates-row">
                <div className="user-dash-rate-box">
                  <span>Live Gold Rate</span>
                  <strong>{formatInr(goldRate)}/g</strong>
                </div>
                <div className="user-dash-rate-box">
                  <span>Live Silver Rate</span>
                  <strong>{formatInr(silverRate)}/g</strong>
                </div>
              </div>
              <p className="user-dash-meta">
                Rates source: {dashboard?.liveRates?.source || 'zerodha'} · {dashboard?.orderCount || 0} paid orders
              </p>
            </>
          )}
        </section>
      )}

      {activeTab === 'history' && (
        <section className="panel user-dash-panel">
          <div className="user-dash-history-filters">
            <label>
              Metal
              <select
                value={historyFilter}
                onChange={(e) => setHistoryFilter(e.target.value)}
              >
                <option value="all">All</option>
                <option value="gold">Gold</option>
                <option value="silver">Silver</option>
              </select>
            </label>
          </div>
          {loadingHistory ? (
            <p>Loading transactions…</p>
          ) : filteredHistory.length === 0 ? (
            <p>No purchase transactions yet.</p>
          ) : (
            <div className="user-dash-table-wrap">
              <table className="user-dash-table">
                <thead>
                  <tr>
                    <th>Order Date</th>
                    <th>Product</th>
                    <th>Metal</th>
                    <th>Amount</th>
                    <th>Quantity</th>
                    <th>Grams</th>
                    <th>Rate at Purchase</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredHistory.map((row, idx) => (
                    <tr key={`${row.orderId}-${idx}`}>
                      <td>{new Date(row.orderDate).toLocaleDateString()}</td>
                      <td>{row.productName}</td>
                      <td className="capitalize">{row.metal}</td>
                      <td>{formatInr(row.amountInvested)}</td>
                      <td>{row.quantity}</td>
                      <td>{formatGrams(row.metalGrams)}</td>
                      <td>{formatInr(row.purchaseRatePerGram)}/g</td>
                      <td className="capitalize">{row.paymentStatus === 'success' ? row.orderStatus : row.paymentStatus}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
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
