import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { zerodhaService } from '../services/api';
import './PageShell.css';
import './LatestNewsPage.css';

const formatPrice = (value) => {
  if (value == null || Number.isNaN(Number(value))) return '—';
  return Number(value).toLocaleString('en-IN', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2
  });
};

const ChangeBadge = ({ change }) => {
  if (change == null || Number.isNaN(Number(change))) {
    return <span className="ln-change">—</span>;
  }
  const n = Number(change);
  const up = n >= 0;
  return (
    <span className={`ln-change ${up ? 'is-up' : 'is-down'}`}>
      {up ? '▲' : '▼'} {Math.abs(n).toFixed(2)}%
    </span>
  );
};

const LatestNewsPage = () => {
  const [market, setMarket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updatedAt, setUpdatedAt] = useState(null);

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
          setUpdatedAt(new Date());
        }
      } catch (err) {
        if (!cancelled) console.error('LatestNews Zerodha fetch:', err);
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
    <div className="gs-page ln-page">
      <section className="gs-hero gs-hero--gradient ln-hero" aria-label="Latest news">
        <div className="ln-hero-sparkle" aria-hidden="true" />
        <div className="gs-hero-inner">
          <p className="gs-hero-kicker">KNOWLEDGE HUB</p>
          <h1>Latest News</h1>
          <p className="gs-hero-copy">
            Live gold and silver prices, powered by the same Zerodha feed as the header ticker.
          </p>
          <div className="gs-hero-meta">
            <p className="gs-hero-badge ln-hero-live">LIVE RATES</p>
            <p className="gs-hero-badge">GOLD · /10g &nbsp;|&nbsp; SILVER · /kg</p>
          </div>
        </div>
      </section>

      <section className="gs-section ln-body" aria-label="Live market prices">
        <div className="ln-live-head">
          <p className="ln-live-kicker">
            <span className="ln-live-dot" aria-hidden="true" />
            Live market
          </p>
          <p className="ln-updated">
            {updatedAt
              ? `Updated ${updatedAt.toLocaleTimeString('en-IN', {
                  hour: '2-digit',
                  minute: '2-digit',
                  second: '2-digit'
                })}`
              : loading
                ? 'Fetching live rates…'
                : 'Rates will appear when the live feed is available'}
          </p>
        </div>

        <div className="ln-price-grid">
          <article className="ln-price-card ln-price-card--gold" aria-label="Live gold price">
            <span className="ln-card-dot" aria-hidden="true" />
            <p className="ln-metal">Gold</p>
            <p className="ln-price">
              {loading ? <span className="ln-skeleton">…</span> : `₹${formatPrice(market?.goldPrice)}`}
            </p>
            <p className="ln-unit">/10g</p>
            {!loading && <ChangeBadge change={goldChange} />}
          </article>

          <article className="ln-price-card ln-price-card--silver" aria-label="Live silver price">
            <span className="ln-card-dot" aria-hidden="true" />
            <p className="ln-metal">Silver</p>
            <p className="ln-price">
              {loading ? <span className="ln-skeleton">…</span> : `₹${formatPrice(market?.silverPrice)}`}
            </p>
            <p className="ln-unit">/kg</p>
            {!loading && <ChangeBadge change={silverChange} />}
          </article>
        </div>

        <div className="gs-panel ln-note">
          <p>
            Prices refresh every minute, matching the live ticker in the header. For weekly market
            commentary, visit{' '}
            <Link to="/knowledge-hub">Weekly market updates</Link>.
          </p>
        </div>
      </section>
    </div>
  );
};

export default LatestNewsPage;
