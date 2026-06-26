import { useState, useEffect, useCallback } from 'react';
import { useToast } from '../state/ToastContext';
import { zerodhaService } from '../services/api';

const ZerodhaIntegrationPage = () => {
  const [zerodhaData, setZerodhaData] = useState(null);
  const [etfs, setEtfs] = useState({ goldETFs: [], silverETFs: [] });
  const [loading, setLoading] = useState(false);
  const [etfLoading, setEtfLoading] = useState(false);
  const [serverConnected, setServerConnected] = useState(false);
  const [accessToken, setAccessToken] = useState(() =>
    typeof window !== 'undefined' ? localStorage.getItem('zerodha_access_token') : null
  );
  const [userProfile, setUserProfile] = useState(null);
  const { showToast } = useToast();

  const checkServerSession = useCallback(async () => {
    try {
      const response = await zerodhaService.getSessionStatus();
      setServerConnected(Boolean(response.data?.hasPersistedAccessToken));
    } catch {
      setServerConnected(false);
    }
  }, []);

  const fetchZerodhaData = useCallback(async () => {
    setLoading(true);
    try {
      const response = await zerodhaService.getMarketData(accessToken);

      if (response.data.success && response.data.data) {
        setZerodhaData({
          ...response.data.data,
          isMockData: response.data.requiresAuth || response.data.message?.includes('mock data'),
          message: response.data.message
        });
      }
    } catch (error) {
      console.error('Zerodha API error:', error);
      showToast('Error fetching market data', 'error');
    } finally {
      setLoading(false);
    }
  }, [accessToken, showToast]);

  const fetchETFs = useCallback(
    async (refresh = false) => {
      setEtfLoading(true);
      try {
        const response = await zerodhaService.getETFs(accessToken, { refresh });
        if (response.data.success && response.data.data) {
          setEtfs(response.data.data);
        }
      } catch (error) {
        console.error('Error fetching ETFs:', error);
        if (error.response?.data?.requiresAuth) {
          setEtfs({ goldETFs: [], silverETFs: [] });
        } else {
          showToast('Error fetching ETFs', 'error');
        }
      } finally {
        setEtfLoading(false);
      }
    },
    [accessToken, showToast]
  );

  const handleGenerateToken = useCallback(
    async (requestToken) => {
      try {
        const response = await zerodhaService.generateToken(requestToken);
        if (response.data.success && response.data.data) {
          const token = response.data.data.access_token;
          setAccessToken(token);
          setServerConnected(true);
          localStorage.setItem('zerodha_access_token', token);
          localStorage.setItem('zerodha_user', JSON.stringify(response.data.data));
          setUserProfile(response.data.data);
          showToast('Zerodha connected successfully!', 'success');
          fetchZerodhaData();
          fetchETFs(true);
        }
      } catch (error) {
        console.error('Error generating token:', error);
        showToast('Error connecting to Zerodha. Please try again.', 'error');
      }
    },
    [fetchETFs, fetchZerodhaData, showToast]
  );

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const requestToken =
      urlParams.get('zerodha_token') || urlParams.get('request_token');
    const status = urlParams.get('status');
    const action = urlParams.get('action');
    const zerodhaStatus = urlParams.get('zerodha_status');
    const serverConnectedParam = urlParams.get('zerodha_connected');

    const kiteLoginOk = status === 'success' || action === 'login';

    if (serverConnectedParam === '1' && status === 'success') {
      checkServerSession().then(() => {
        fetchZerodhaData();
        fetchETFs(true);
        showToast('Zerodha connected on server — ETFs available for all visitors', 'success');
      });
      window.history.replaceState({}, document.title, window.location.pathname);
    } else if (requestToken && kiteLoginOk) {
      handleGenerateToken(requestToken);
      window.history.replaceState({}, document.title, window.location.pathname);
    } else if (zerodhaStatus === 'error' || status === 'error') {
      showToast('Zerodha login failed or was cancelled', 'error');
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, [checkServerSession, fetchETFs, fetchZerodhaData, handleGenerateToken, showToast]);

  useEffect(() => {
    checkServerSession();
    fetchZerodhaData();
    fetchETFs();
    const interval = setInterval(() => {
      fetchZerodhaData();
      fetchETFs();
    }, 30 * 60 * 1000);
    return () => clearInterval(interval);
  }, [checkServerSession, fetchZerodhaData, fetchETFs]);

  const handleZerodhaLogin = async () => {
    try {
      const response = await zerodhaService.getLoginUrl();
      if (response.data.success && response.data.loginUrl) {
        window.location.href = response.data.loginUrl;
      } else {
        showToast('Error generating login URL', 'error');
      }
    } catch (error) {
      console.error('Error getting login URL:', error);
      showToast('Error connecting to Zerodha', 'error');
    }
  };

  const handleLogout = () => {
    setAccessToken(null);
    setUserProfile(null);
    localStorage.removeItem('zerodha_access_token');
    localStorage.removeItem('zerodha_user');
    showToast('Disconnected from Zerodha on this browser (server session unchanged)', 'info');
    checkServerSession();
    fetchETFs();
  };

  const showEtfs = serverConnected || accessToken;
  const connectedLabel = serverConnected
    ? 'Zerodha connected on server (live data for all visitors)'
    : accessToken
      ? 'Connected on this browser only'
      : null;

  return (
    <div className="page">
      <div className="page-hero">
        <h1 className="page-hero-title">Zerodha Integration</h1>
        <p className="page-hero-desc">
          Connect Zerodha once on the server for live MCX gold &amp; silver prices and ETF listings
          for everyone.
        </p>
      </div>

      <section className="panel page-feature">
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '1.5rem',
            flexWrap: 'wrap',
            gap: '1rem'
          }}
        >
          <h2>Market &amp; ETFs</h2>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
            {connectedLabel && (
              <span style={{ fontSize: '0.9rem', color: 'var(--muted)' }}>
                {userProfile?.user_name || userProfile?.user_shortname
                  ? `Last login: ${userProfile.user_name || userProfile.user_shortname} · `
                  : ''}
                {connectedLabel}
              </span>
            )}
            {accessToken && (
              <button type="button" className="btn-secondary" onClick={handleLogout}>
                Clear browser session
              </button>
            )}
            {!accessToken && (
              <button type="button" className="btn-primary" onClick={handleZerodhaLogin}>
                {serverConnected ? 'Reconnect Zerodha' : 'Connect Zerodha'}
              </button>
            )}
          </div>
        </div>

        <div style={{ marginBottom: '2rem' }}>
          <h3>Live Market Data</h3>
          {loading ? (
            <p style={{ textAlign: 'center', padding: '2rem' }}>Loading market data...</p>
          ) : zerodhaData ? (
            <div className="zerodha-data">
              <div className="zerodha-price-item">
                <strong>Gold Price:</strong>
                <span
                  style={{
                    fontSize: '1.3rem',
                    fontWeight: '700',
                    color: '#d4af37',
                    marginLeft: '0.5rem'
                  }}
                >
                  ₹{zerodhaData.goldPrice?.toLocaleString()}
                </span>
                {(zerodhaData.changeGold !== undefined || zerodhaData.goldChange !== undefined) && (
                  <span
                    className={`price-change ${(zerodhaData.changeGold ?? zerodhaData.goldChange) >= 0 ? 'positive' : 'negative'}`}
                  >
                    {(zerodhaData.changeGold ?? zerodhaData.goldChange) >= 0 ? '▲' : '▼'}{' '}
                    {Math.abs(zerodhaData.changeGold ?? zerodhaData.goldChange ?? 0)}%
                  </span>
                )}
              </div>
              <div className="zerodha-price-item">
                <strong>Silver Price:</strong>
                <span
                  style={{
                    fontSize: '1.3rem',
                    fontWeight: '700',
                    color: '#c0c0c0',
                    marginLeft: '0.5rem'
                  }}
                >
                  ₹{zerodhaData.silverPrice?.toLocaleString()}
                </span>
                {(zerodhaData.changeSilver !== undefined || zerodhaData.silverChange !== undefined) && (
                  <span
                    className={`price-change ${(zerodhaData.changeSilver ?? zerodhaData.silverChange) >= 0 ? 'positive' : 'negative'}`}
                  >
                    {(zerodhaData.changeSilver ?? zerodhaData.silverChange) >= 0 ? '▲' : '▼'}{' '}
                    {Math.abs(zerodhaData.changeSilver ?? zerodhaData.silverChange ?? 0)}%
                  </span>
                )}
              </div>
              <div className="zerodha-price-item">
                <strong>Last Updated:</strong> {new Date(zerodhaData.lastUpdated).toLocaleString()}
                {zerodhaData.source && (
                  <span style={{ marginLeft: '0.5rem', fontSize: '0.85rem', color: 'var(--muted)' }}>
                    ({zerodhaData.source})
                  </span>
                )}
                {zerodhaData.isMockData && (
                  <span
                    style={{
                      marginLeft: '0.5rem',
                      fontSize: '0.85rem',
                      color: '#f59e0b',
                      fontStyle: 'italic'
                    }}
                  >
                    (Mock Data — Connect Zerodha for live prices)
                  </span>
                )}
              </div>
            </div>
          ) : (
            <p style={{ textAlign: 'center', padding: '2rem' }}>Market data not available</p>
          )}
        </div>

        {showEtfs ? (
          <div>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '1rem',
                flexWrap: 'wrap',
                gap: '0.75rem'
              }}
            >
              <h3>Gold &amp; Silver ETFs</h3>
              <button
                type="button"
                className="btn-secondary"
                onClick={() => fetchETFs(true)}
                disabled={etfLoading}
              >
                {etfLoading ? 'Loading...' : 'Refresh'}
              </button>
            </div>

            {etfLoading ? (
              <p style={{ textAlign: 'center', padding: '2rem' }}>Loading ETFs...</p>
            ) : (
              <>
                {etfs.goldETFs && etfs.goldETFs.length > 0 && (
                  <div style={{ marginBottom: '2rem' }}>
                    <h4 style={{ color: '#d4af37', marginBottom: '1rem' }}>
                      Gold ETFs ({etfs.goldETFs.length})
                    </h4>
                    <div className="etf-grid">
                      {etfs.goldETFs.map((etf, idx) => (
                        <div key={etf.instrumentToken || idx} className="etf-card">
                          <div className="etf-header">
                            <h5>{etf.name || etf.tradingsymbol}</h5>
                            <span className="etf-exchange">{etf.exchange}</span>
                          </div>
                          <div className="etf-price">
                            <span className="etf-symbol">{etf.tradingsymbol}</span>
                            <div className="etf-price-value">
                              ₹{etf.lastPrice?.toLocaleString() || '0.00'}
                              {etf.changePercent !== undefined && (
                                <span
                                  className={`price-change ${etf.changePercent >= 0 ? 'positive' : 'negative'}`}
                                >
                                  {etf.changePercent >= 0 ? '▲' : '▼'}{' '}
                                  {Math.abs(etf.changePercent).toFixed(2)}%
                                </span>
                              )}
                            </div>
                          </div>
                          {etf.volume > 0 && (
                            <div className="etf-volume">Volume: {etf.volume.toLocaleString()}</div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {etfs.silverETFs && etfs.silverETFs.length > 0 && (
                  <div>
                    <h4 style={{ color: '#c0c0c0', marginBottom: '1rem' }}>
                      Silver ETFs ({etfs.silverETFs.length})
                    </h4>
                    <div className="etf-grid">
                      {etfs.silverETFs.map((etf, idx) => (
                        <div key={etf.instrumentToken || idx} className="etf-card">
                          <div className="etf-header">
                            <h5>{etf.name || etf.tradingsymbol}</h5>
                            <span className="etf-exchange">{etf.exchange}</span>
                          </div>
                          <div className="etf-price">
                            <span className="etf-symbol">{etf.tradingsymbol}</span>
                            <div className="etf-price-value">
                              ₹{etf.lastPrice?.toLocaleString() || '0.00'}
                              {etf.changePercent !== undefined && (
                                <span
                                  className={`price-change ${etf.changePercent >= 0 ? 'positive' : 'negative'}`}
                                >
                                  {etf.changePercent >= 0 ? '▲' : '▼'}{' '}
                                  {Math.abs(etf.changePercent).toFixed(2)}%
                                </span>
                              )}
                            </div>
                          </div>
                          {etf.volume > 0 && (
                            <div className="etf-volume">Volume: {etf.volume.toLocaleString()}</div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {(!etfs.goldETFs || etfs.goldETFs.length === 0) &&
                  (!etfs.silverETFs || etfs.silverETFs.length === 0) && (
                    <p style={{ textAlign: 'center', padding: '2rem', color: 'var(--muted)' }}>
                      No ETFs found. ETFs are available during market hours.
                    </p>
                  )}
              </>
            )}
          </div>
        ) : (
          <div
            style={{
              padding: '1.5rem',
              background: 'rgba(212, 175, 55, 0.1)',
              borderRadius: '12px',
              marginTop: '1rem'
            }}
          >
            <p style={{ marginBottom: '0.5rem' }}>
              <strong>Connect Zerodha once</strong> on the server to enable for everyone:
            </p>
            <ul style={{ marginLeft: '1.5rem', marginTop: '0.5rem' }}>
              <li>Live Gold &amp; Silver prices from MCX</li>
              <li>Gold &amp; Silver ETF listings for all visitors</li>
              <li>Session saved on server (not per browser)</li>
            </ul>
          </div>
        )}
      </section>
    </div>
  );
};

export default ZerodhaIntegrationPage;
