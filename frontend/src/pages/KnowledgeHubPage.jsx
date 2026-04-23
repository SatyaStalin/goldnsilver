import { useState, useEffect } from 'react';
import { useToast } from '../state/ToastContext';
import { zerodhaService } from '../services/api';

const KnowledgeHubPage = () => {
  const [zerodhaData, setZerodhaData] = useState(null);
  const [etfs, setEtfs] = useState({ goldETFs: [], silverETFs: [] });
  const [loading, setLoading] = useState(false);
  const [etfLoading, setEtfLoading] = useState(false);
  const [accessToken, setAccessToken] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const { showToast } = useToast();

  // Check for access token in localStorage
  useEffect(() => {
    const storedToken = localStorage.getItem('zerodha_access_token');
    if (storedToken) {
      setAccessToken(storedToken);
    }

    // Check for request token from OAuth callback
    const urlParams = new URLSearchParams(window.location.search);
    const requestToken = urlParams.get('request_token');
    const status = urlParams.get('status');

    if (requestToken && status === 'success') {
      handleGenerateToken(requestToken);
      // Clean URL
      window.history.replaceState({}, document.title, window.location.pathname);
    } else if (status === 'error') {
      showToast('Zerodha login failed or was cancelled', 'error');
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, [showToast]);

  // Fetch market data
  useEffect(() => {
    fetchZerodhaData();
    const interval = setInterval(fetchZerodhaData, 30000);
    return () => clearInterval(interval);
  }, [accessToken]);

  // Fetch ETFs when access token is available
  useEffect(() => {
    if (accessToken) {
      fetchETFs();
    }
  }, [accessToken]);

  const fetchZerodhaData = async () => {
    setLoading(true);
    try {
      const response = await zerodhaService.getMarketData(accessToken);
      
      if (response.data.success && response.data.data) {
        console.log(response.data)
        setZerodhaData({
          ...response.data.data,
          isMockData: response.data.requiresAuth || response.data.message?.includes('mock data'),
          message: response.data.message
        });
        if (response.data.requiresAuth && !accessToken) {
          // Don't show toast on every fetch, only once
        }
      }
    } catch (error) {
      console.error('Zerodha API error:', error);
      showToast('Error fetching market data', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchETFs = async () => {
    if (!accessToken) return;
    
    setEtfLoading(true);
    try {
      const response = await zerodhaService.getETFs(accessToken);
      if (response.data.success && response.data.data) {
        setEtfs(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching ETFs:', error);
      if (error.response?.data?.requiresAuth) {
        showToast('Please connect Zerodha to view ETFs', 'info');
      } else {
        showToast('Error fetching ETFs', 'error');
      }
    } finally {
      setEtfLoading(false);
    }
  };

  const handleZerodhaLogin = async () => {
    try {
      const response = await zerodhaService.getLoginUrl();
      if (response.data.success && response.data.loginUrl) {
        // Redirect to Zerodha login
        window.location.href = "http://72.60.20.221:5173/knowledge-hub";
      } else {
        showToast('Error generating login URL', 'error');
      }
    } catch (error) {
      console.error('Error getting login URL:', error);
      showToast('Error connecting to Zerodha', 'error');
    }
  };

  const handleGenerateToken = async (requestToken) => {
    try {
      const response = await zerodhaService.generateToken(requestToken);
      if (response.data.success && response.data.data) {
        const token = response.data.data.access_token;
        setAccessToken(token);
        localStorage.setItem('zerodha_access_token', token);
        localStorage.setItem('zerodha_user', JSON.stringify(response.data.data));
        setUserProfile(response.data.data);
        showToast('Zerodha connected successfully!', 'success');
        // Fetch data after successful connection
        fetchZerodhaData();
        fetchETFs();
      }
    } catch (error) {
      console.error('Error generating token:', error);
      showToast('Error connecting to Zerodha. Please try again.', 'error');
    }
  };

  const handleLogout = () => {
    setAccessToken(null);
    setUserProfile(null);
    setEtfs({ goldETFs: [], silverETFs: [] });
    localStorage.removeItem('zerodha_access_token');
    localStorage.removeItem('zerodha_user');
    showToast('Disconnected from Zerodha', 'info');
  };

  return (
    <div className="page">
      <div className="page-hero">
        <h1 className="page-hero-title">Knowledge Hub</h1>
        <p className="page-hero-desc">
          Learn everything about gold, silver, SIPs, taxation, and smart allocation. Connect with Zerodha for live trading data.
        </p>
      </div>

      {/* Zerodha Integration Section */}
      <section className="panel page-feature">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h2>Zerodha Integration</h2>
          {accessToken ? (
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
              {userProfile && (
                <span style={{ fontSize: '0.9rem', color: 'var(--muted)' }}>
                  Connected as: {userProfile.user_name || userProfile.user_shortname}
                </span>
              )}
              <button className="btn-secondary" onClick={handleLogout}>
                Disconnect
              </button>
            </div>
          ) : (
            <button className="btn-primary" onClick={handleZerodhaLogin}>
              Connect Zerodha
            </button>
          )}
        </div>

        {/* Market Data */}
        <div style={{ marginBottom: '2rem' }}>
          <h3>Live Market Data</h3>
          {loading ? (
            <p style={{ textAlign: 'center', padding: '2rem' }}>Loading market data...</p>
          ) : zerodhaData ? (
            <div className="zerodha-data">
              <div className="zerodha-price-item">
                <strong>Gold Price:</strong> 
                <span style={{ fontSize: '1.3rem', fontWeight: '700', color: '#d4af37', marginLeft: '0.5rem' }}>
                  ₹{zerodhaData.goldPrice?.toLocaleString()}/gram
                </span>
                {(zerodhaData.changeGold !== undefined || zerodhaData.goldChange !== undefined) && (
                  <span className={`price-change ${(zerodhaData.changeGold ?? zerodhaData.goldChange) >= 0 ? 'positive' : 'negative'}`}>
                    {(zerodhaData.changeGold ?? zerodhaData.goldChange) >= 0 ? '▲' : '▼'} {Math.abs(zerodhaData.changeGold ?? zerodhaData.goldChange ?? 0)}%
                  </span>
                )}
              </div>
              <div className="zerodha-price-item">
                <strong>Silver Price:</strong> 
                <span style={{ fontSize: '1.3rem', fontWeight: '700', color: '#c0c0c0', marginLeft: '0.5rem' }}>
                  ₹{zerodhaData.silverPrice?.toLocaleString()}/gram
                </span>
                {(zerodhaData.changeSilver !== undefined || zerodhaData.silverChange !== undefined) && (
                  <span className={`price-change ${(zerodhaData.changeSilver ?? zerodhaData.silverChange) >= 0 ? 'positive' : 'negative'}`}>
                    {(zerodhaData.changeSilver ?? zerodhaData.silverChange) >= 0 ? '▲' : '▼'} {Math.abs(zerodhaData.changeSilver ?? zerodhaData.silverChange ?? 0)}%
                  </span>
                )}
              </div>
              <div className="zerodha-price-item">
                <strong>Last Updated:</strong> {new Date(zerodhaData.lastUpdated).toLocaleString()}
                {zerodhaData.source && <span style={{ marginLeft: '0.5rem', fontSize: '0.85rem', color: 'var(--muted)' }}>({zerodhaData.source})</span>}
                {zerodhaData.isMockData && (
                  <span style={{ marginLeft: '0.5rem', fontSize: '0.85rem', color: '#f59e0b', fontStyle: 'italic' }}>
                    (Mock Data - Connect Zerodha for live prices)
                  </span>
                )}
              </div>
            </div>
          ) : (
            <p style={{ textAlign: 'center', padding: '2rem' }}>Market data not available</p>
          )}
        </div>

        {/* Gold & Silver ETFs */}
        {accessToken && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3>Gold & Silver ETFs</h3>
              <button className="btn-secondary" onClick={fetchETFs} disabled={etfLoading}>
                {etfLoading ? 'Loading...' : 'Refresh'}
              </button>
            </div>
            
            {etfLoading ? (
              <p style={{ textAlign: 'center', padding: '2rem' }}>Loading ETFs...</p>
            ) : (
              <>
                {/* Gold ETFs */}
                {etfs.goldETFs && etfs.goldETFs.length > 0 && (
                  <div style={{ marginBottom: '2rem' }}>
                    <h4 style={{ color: '#d4af37', marginBottom: '1rem' }}>Gold ETFs ({etfs.goldETFs.length})</h4>
                    <div className="etf-grid">
                      {etfs.goldETFs.map((etf, idx) => (
                        <div key={idx} className="etf-card">
                          <div className="etf-header">
                            <h5>{etf.name || etf.tradingsymbol}</h5>
                            <span className="etf-exchange">{etf.exchange}</span>
                          </div>
                          <div className="etf-price">
                            <span className="etf-symbol">{etf.tradingsymbol}</span>
                            <div className="etf-price-value">
                              ₹{etf.lastPrice?.toLocaleString() || '0.00'}
                              {etf.changePercent !== undefined && (
                                <span className={`price-change ${etf.changePercent >= 0 ? 'positive' : 'negative'}`}>
                                  {etf.changePercent >= 0 ? '▲' : '▼'} {Math.abs(etf.changePercent).toFixed(2)}%
                                </span>
                              )}
                            </div>
                          </div>
                          {etf.volume > 0 && (
                            <div className="etf-volume">
                              Volume: {etf.volume.toLocaleString()}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Silver ETFs */}
                {etfs.silverETFs && etfs.silverETFs.length > 0 && (
                  <div>
                    <h4 style={{ color: '#c0c0c0', marginBottom: '1rem' }}>Silver ETFs ({etfs.silverETFs.length})</h4>
                    <div className="etf-grid">
                      {etfs.silverETFs.map((etf, idx) => (
                        <div key={idx} className="etf-card">
                          <div className="etf-header">
                            <h5>{etf.name || etf.tradingsymbol}</h5>
                            <span className="etf-exchange">{etf.exchange}</span>
                          </div>
                          <div className="etf-price">
                            <span className="etf-symbol">{etf.tradingsymbol}</span>
                            <div className="etf-price-value">
                              ₹{etf.lastPrice?.toLocaleString() || '0.00'}
                              {etf.changePercent !== undefined && (
                                <span className={`price-change ${etf.changePercent >= 0 ? 'positive' : 'negative'}`}>
                                  {etf.changePercent >= 0 ? '▲' : '▼'} {Math.abs(etf.changePercent).toFixed(2)}%
                                </span>
                              )}
                            </div>
                          </div>
                          {etf.volume > 0 && (
                            <div className="etf-volume">
                              Volume: {etf.volume.toLocaleString()}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {(!etfs.goldETFs || etfs.goldETFs.length === 0) && (!etfs.silverETFs || etfs.silverETFs.length === 0) && (
                  <p style={{ textAlign: 'center', padding: '2rem', color: 'var(--muted)' }}>
                    No ETFs found. ETFs are available during market hours.
                  </p>
                )}
              </>
            )}
          </div>
        )}

        {!accessToken && (
          <div style={{ padding: '1.5rem', background: 'rgba(212, 175, 55, 0.1)', borderRadius: '12px', marginTop: '1rem' }}>
            <p style={{ marginBottom: '0.5rem' }}>
              <strong>Connect Zerodha</strong> to access:
            </p>
            <ul style={{ marginLeft: '1.5rem', marginTop: '0.5rem' }}>
              <li>Live Gold & Silver prices from MCX</li>
              <li>Real-time Gold & Silver ETFs data</li>
              <li>Trading capabilities</li>
              <li>Portfolio tracking</li>
            </ul>
          </div>
        )}
      </section>

      <section className="panel page-feature">
        <h2>Featured Articles</h2>
        <ul className="bullet-list">
          <li>5 ways to use gold SIPs for your child&apos;s education.</li>
          <li>Physical vs Digital Gold vs Sovereign Gold Bonds.</li>
          <li>How much gold should be in your portfolio?</li>
        </ul>
      </section>
    </div>
  );
};

export default KnowledgeHubPage;
