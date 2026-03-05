import { useState, useEffect } from 'react';
import { useToast } from '../state/ToastContext';

const KnowledgeHubPage = () => {
  const [zerodhaData, setZerodhaData] = useState(null);
  const [loading, setLoading] = useState(false);
  const { showToast } = useToast();

  useEffect(() => {
    // Fetch Zerodha data from backend
    const fetchZerodhaData = async () => {
      setLoading(true);
      try {
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
        const response = await fetch(`${apiUrl}/api/zerodha/market-data`);
        const result = await response.json();
        
        if (result.success && result.data) {
          setZerodhaData(result.data);
        } else {
          // Use fallback data
          setZerodhaData({
            goldPrice: 6500,
            silverPrice: 95,
            lastUpdated: new Date().toISOString(),
            goldChange: 0,
            silverChange: 0
          });
        }
      } catch (error) {
        console.error('Zerodha API error:', error);
        // Use fallback data on error
        setZerodhaData({
          goldPrice: 6500,
          silverPrice: 95,
          lastUpdated: new Date().toISOString(),
          goldChange: 0,
          silverChange: 0
        });
        showToast('Using fallback market data', 'info');
      } finally {
        setLoading(false);
      }
    };

    fetchZerodhaData();
    // Refresh data every 30 seconds
    const interval = setInterval(fetchZerodhaData, 30000);
    return () => clearInterval(interval);
  }, [showToast]);

  return (
    <div className="page">
      <div className="page-hero">
        <h1 className="page-hero-title">Knowledge Hub</h1>
        <p className="page-hero-desc">
          Learn everything about gold, silver, SIPs, taxation, and smart allocation.
        </p>
      </div>

      {/* Zerodha Integration Section */}
      <section className="panel page-feature">
        <h2>Live Market Data (Zerodha)</h2>
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
            </div>
          </div>
        ) : (
          <p style={{ textAlign: 'center', padding: '2rem' }}>Market data not available</p>
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

