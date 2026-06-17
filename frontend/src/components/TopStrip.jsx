import { useEffect, useState } from 'react';
import { zerodhaService } from '../services/api';

const MARQUEE_ITEMS = [
  'Live Gold Prices Powered by Zerodha APIs',
  'Digital Gold Investment with Live Market Pricing',
  'Buy Gold Based on Real-Time Zerodha Market Data'
];

const formatPrice = (value) => {
  if (value == null || Number.isNaN(Number(value))) return '—';
  return Number(value).toLocaleString('en-IN', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2
  });
};

const PriceChange = ({ change }) => {
  if (change == null || Number.isNaN(Number(change))) return null;
  const n = Number(change);
  const positive = n >= 0;
  return (
    <span className={`top-strip-change ${positive ? 'positive' : 'negative'}`}>
      {positive ? '▲' : '▼'} {Math.abs(n).toFixed(2)}%
    </span>
  );
};

const TopStrip = () => {
  const [market, setMarket] = useState(null);
  const [loading, setLoading] = useState(true);

  const accessToken =
    typeof window !== 'undefined' ? localStorage.getItem('zerodha_access_token') : null;

  useEffect(() => {
    let cancelled = false;

    const fetchPrices = async () => {
      try {
        const response = await zerodhaService.getMarketData(accessToken);
        if (cancelled) return;
        if (response.data?.success && response.data?.data) {
          setMarket(response.data.data);
        }
      } catch (err) {
        if (!cancelled) console.error('TopStrip Zerodha fetch:', err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchPrices();
    const interval = setInterval(fetchPrices, 60 * 1000);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [accessToken]);

  const goldChange = market?.changeGold ?? market?.goldChange;
  const silverChange = market?.changeSilver ?? market?.silverChange;

  return (
    <div className="top-strip" role="region" aria-label="Live Zerodha market updates">
      <div className="top-strip-grid">
        <div className="top-strip-panel top-strip-gold" aria-label="Live gold price">
          <span className="top-strip-live-dot" aria-hidden="true" />
          <span className="top-strip-metal-label">Gold</span>
          <span className="top-strip-metal-price">
            {loading ? (
              <span className="top-strip-skeleton">…</span>
            ) : (
              <>
                ₹{formatPrice(market?.goldPrice)}
                <span className="top-strip-unit">/10g</span>
              </>
            )}
          </span>
          {!loading && <PriceChange change={goldChange} />}
        </div>

        <div className="top-strip-panel top-strip-marquee-wrap" aria-label="Announcements">
          <div className="marquee">
            <div className="marquee-track">
              {[...MARQUEE_ITEMS, ...MARQUEE_ITEMS].map((t, idx) => (
                <span key={`${t}-${idx}`} className="top-strip-item">
                  {t}
                  <span className="top-strip-sep"> • </span>
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="top-strip-panel top-strip-silver" aria-label="Live silver price">
          <span className="top-strip-live-dot" aria-hidden="true" />
          <span className="top-strip-metal-label">Silver</span>
          <span className="top-strip-metal-price">
            {loading ? (
              <span className="top-strip-skeleton">…</span>
            ) : (
              <>
                ₹{formatPrice(market?.silverPrice)}
                <span className="top-strip-unit">/kg</span>
              </>
            )}
          </span>
          {!loading && <PriceChange change={silverChange} />}
        </div>
      </div>
    </div>
  );
};

export default TopStrip;
