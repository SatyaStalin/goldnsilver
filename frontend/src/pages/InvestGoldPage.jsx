import { useCallback, useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../state/AuthContext';
import { useToast } from '../state/ToastContext';
import { safegoldService } from '../services/api';

const formatInr = (n) =>
  Number(n).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const formatGrams = (n) =>
  Number(n).toLocaleString('en-IN', { minimumFractionDigits: 4, maximumFractionDigits: 4 });

const OTHER_OPTIONS = [
  {
    title: 'Gold SIP',
    desc: 'Automated monthly gold accumulation to reach long-term goals.',
    price: 2000
  },
  {
    title: 'Gold Mutual Funds',
    desc: 'Diversified gold-backed funds for long-term wealth creation.',
    price: 1000
  },
  {
    title: 'Gold ETFs',
    desc: 'Exchange-traded funds backed by physical gold holdings.',
    price: 5000
  },
  {
    title: 'Sovereign Gold Bonds',
    desc: 'Government-backed bonds with interest + gold price appreciation.',
    price: 5000
  }
];

const FAQ_ITEMS = [
  { q: 'What is the minimum buy amount?', a: 'You can start buying physical gold from ₹10 onwards.' },
  { q: 'Where is my gold stored?', a: 'Your 24K physical gold is stored in Brink\'s insured vaults, trustee protected by Vistra Corporate Services.' },
  { q: 'Is there a lock-in period?', a: 'No lock-in. You can sell your gold anytime after purchase.' },
  { q: 'What are storage charges?', a: 'Storage is free for the first 24 months, and allowed up to 5 years.' },
  { q: 'Can I cancel after payment?', a: 'Orders cannot be cancelled once the gold transfer is successful.' }
];

const InvestGoldPage = () => {
  const { isAuthenticated, user } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [rate, setRate] = useState(null);
  const [wallet, setWallet] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [limits, setLimits] = useState({ minInr: 10, maxInr: 500000 });
  const [loadingRate, setLoadingRate] = useState(true);
  const [buyMode, setBuyMode] = useState('inr');
  const [inputValue, setInputValue] = useState('1000');
  const [quote, setQuote] = useState(null);
  const [quoting, setQuoting] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [rateCountdown, setRateCountdown] = useState(null);
  const [showFaq, setShowFaq] = useState(null);
  const [buySuccess, setBuySuccess] = useState(null);
  const quoteTimer = useRef(null);

  const loadRate = useCallback(async () => {
    setLoadingRate(true);
    try {
      const res = await safegoldService.getBuyPrice();
      setRate(res.data);
    } catch {
      showToast('Could not fetch live gold rate. Please try again.', 'error');
    } finally {
      setLoadingRate(false);
    }
  }, [showToast]);

  const loadDashboard = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      const res = await safegoldService.getDashboard();
      setWallet(res.data.wallet);
      setTransactions(res.data.transactions || []);
      setRate(res.data.rate);
      if (res.data.limits) setLimits(res.data.limits);
    } catch {
      /* optional */
    }
  }, [isAuthenticated]);

  useEffect(() => {
    loadRate();
    loadDashboard();
  }, [loadRate, loadDashboard]);

  useEffect(() => {
    if (!rate?.expiresAt) {
      setRateCountdown(null);
      return;
    }
    const tick = () => {
      const remaining = Math.max(0, Math.floor((new Date(rate.expiresAt) - Date.now()) / 1000));
      setRateCountdown(remaining);
      if (remaining === 0) loadRate();
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [rate?.expiresAt, loadRate]);

  const fetchQuote = useCallback(async () => {
    const value = Number(inputValue);
    if (!value || value <= 0) {
      setQuote(null);
      return;
    }
    setQuoting(true);
    try {
      const res = await safegoldService.getQuote({
        mode: buyMode,
        value,
        rateId: rate?.rateId
      });
      setQuote(res.data);
    } catch (err) {
      setQuote(null);
      const msg = err.response?.data?.message || 'Could not calculate quote';
      if (value > 0) showToast(msg, 'error');
    } finally {
      setQuoting(false);
    }
  }, [buyMode, inputValue, rate?.rateId, showToast]);

  useEffect(() => {
    if (quoteTimer.current) clearTimeout(quoteTimer.current);
    quoteTimer.current = setTimeout(fetchQuote, 400);
    return () => clearTimeout(quoteTimer.current);
  }, [fetchQuote, inputValue, buyMode]);

  const formatCountdown = (secs) => {
    if (secs == null) return '';
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${String(s).padStart(2, '0')}`;
  };

  const handleBuy = async () => {
    if (!isAuthenticated) {
      showToast('Please login to buy physical gold', 'error');
      navigate('/login', { state: { from: '/invest-gold' } });
      return;
    }

    if (!quote) {
      showToast('Enter a valid amount to continue', 'error');
      return;
    }

    if (!user?.mobile) {
      showToast('Add your mobile number in profile before buying', 'error');
      navigate('/dashboard');
      return;
    }

    setProcessing(true);
    try {
      const initRes = await safegoldService.initiateBuy({
        mode: buyMode,
        value: Number(inputValue),
        rateId: quote.rateId,
        gatewayType: 'razorpay'
      });

      const { transactionId, payment, quote: lockedQuote } = initRes.data;

      if (!payment?.keyId) {
        showToast(
          'Razorpay is not configured. Add RAZORPAY_KEY_ID to backend .env.',
          'error'
        );
        setProcessing(false);
        return;
      }

      const options = {
        key: payment.keyId,
        amount: payment.amount,
        currency: payment.currency,
        name: 'SafeGold — Physical Gold',
        description: `Buy ${formatGrams(lockedQuote.goldAmount)}g 24K Gold`,
        order_id: payment.orderId,
        handler: async (response) => {
          try {
            const verifyRes = await safegoldService.verifyBuy({
              transactionId,
              gatewayType: 'razorpay',
              paymentData: {
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_signature: response.razorpay_signature
              }
            });

            if (verifyRes.data.success) {
              setBuySuccess(verifyRes.data);
              setWallet(verifyRes.data.wallet);
              showToast('Physical gold purchased successfully!', 'success-animated');
              loadDashboard();
            } else {
              showToast(verifyRes.data.message || 'Verification failed', 'error');
            }
          } catch (err) {
            const msg = err.response?.data?.message || 'Payment verification failed';
            showToast(msg, 'error');
          } finally {
            setProcessing(false);
          }
        },
        prefill: {
          name: user?.name || '',
          email: user?.email || '',
          contact: user?.mobile || ''
        },
        theme: { color: '#c9a227' },
        modal: {
          ondismiss: () => setProcessing(false)
        }
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();
      razorpay.on('payment.failed', (response) => {
        const desc =
          response?.error?.description ||
          response?.error?.reason ||
          'Payment failed. Please try again.';
        showToast(desc, 'error');
        setProcessing(false);
      });
    } catch (err) {
      const msg = err.response?.data?.message || 'Could not start purchase';
      if (err.response?.data?.code === 'RATE_EXPIRED') loadRate();
      showToast(msg, 'error');
      setProcessing(false);
    }
  };

  const gstPerGram = rate
    ? (rate.currentPrice * (rate.applicableTax || 3)) / 100
    : 0;
  const rateInclGst = rate
    ? rate.currentPrice * (1 + (rate.applicableTax || 3) / 100)
    : 0;

  return (
    <div className="page invest-gold-page">
      <div className="sg-hero">
        <div className="sg-hero-content">
          <div className="sg-brand-row">
            <div className="sg-logo-badge">
              <span className="sg-logo-icon">◆</span>
              <span className="sg-logo-text">SafeGold</span>
            </div>
            <span className="sg-powered">Powered by SafeGold</span>
          </div>
          <h1 className="sg-hero-title">Invest in 24K Physical Gold</h1>
          <p className="sg-hero-desc">
            Buy vault-stored, trustee-protected physical gold digitally.
            Insured storage in Brink&apos;s vaults — title remains with you.
          </p>
          <div className="sg-hero-tags">
            <span>24K Purity</span>
            <span>Vault Stored</span>
            <span>Trustee Protected</span>
            <span>From ₹{limits.minInr}</span>
          </div>
        </div>

        {isAuthenticated && wallet && (
          <div className="sg-balance-card">
            <span className="sg-balance-label">Your Gold Balance</span>
            <span className="sg-balance-value">{formatGrams(wallet.balanceGrams)} g</span>
            <span className="sg-balance-sub">Physical gold in insured vault</span>
          </div>
        )}
      </div>

      {buySuccess && (
        <div className="sg-success-banner">
          <div className="sg-success-icon">✓</div>
          <div>
            <strong>Purchase successful!</strong>
            <p>
              You bought {formatGrams(buySuccess.transaction?.goldAmount)} g for ₹
              {formatInr(buySuccess.transaction?.buyPrice)}. New balance:{' '}
              {formatGrams(buySuccess.wallet?.balanceGrams)} g
            </p>
          </div>
          <button type="button" className="btn-ghost sg-dismiss" onClick={() => setBuySuccess(null)}>
            Dismiss
          </button>
        </div>
      )}

      <div className="sg-main-grid">
        <section className="sg-buy-panel">
          <div className="sg-rate-header">
            <h2>Buy Physical Gold</h2>
            {rateCountdown != null && rateCountdown > 0 && (
              <span className={`sg-rate-timer ${rateCountdown < 60 ? 'sg-rate-timer--urgent' : ''}`}>
                Rate valid: {formatCountdown(rateCountdown)}
              </span>
            )}
          </div>

          <div className="sg-rate-display">
            {loadingRate ? (
              <p className="muted">Loading live rate…</p>
            ) : rate ? (
              <>
                <div className="sg-rate-row">
                  <span>Gold Rate</span>
                  <strong>₹{formatInr(rate.currentPrice)} / g <small>(excl. GST)</small></strong>
                </div>
                <div className="sg-rate-row">
                  <span>GST ({rate.applicableTax || 3}%)</span>
                  <strong>₹{formatInr(gstPerGram)} / g</strong>
                </div>
                <div className="sg-rate-row sg-rate-row--total">
                  <span>Rate incl. GST</span>
                  <strong>₹{formatInr(rateInclGst)} / g</strong>
                </div>
              </>
            ) : (
              <button type="button" className="btn-ghost" onClick={loadRate}>
                Retry loading rate
              </button>
            )}
          </div>

          <div className="sg-mode-toggle">
            <button
              type="button"
              className={buyMode === 'inr' ? 'active' : ''}
              onClick={() => setBuyMode('inr')}
            >
              Buy in ₹
            </button>
            <button
              type="button"
              className={buyMode === 'grams' ? 'active' : ''}
              onClick={() => setBuyMode('grams')}
            >
              Buy in Grams
            </button>
          </div>

          <div className="sg-input-group">
            <label>
              {buyMode === 'inr' ? `Amount (₹${limits.minInr} – ₹${limits.maxInr.toLocaleString('en-IN')})` : 'Gold amount (grams)'}
              <input
                type="number"
                min={buyMode === 'inr' ? limits.minInr : 0.0001}
                step={buyMode === 'inr' ? 1 : 0.0001}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder={buyMode === 'inr' ? '1000' : '0.5000'}
              />
            </label>
            {buyMode === 'inr' && (
              <div className="sg-quick-amounts">
                {[500, 1000, 2500, 5000].map((amt) => (
                  <button
                    key={amt}
                    type="button"
                    className={Number(inputValue) === amt ? 'active' : ''}
                    onClick={() => setInputValue(String(amt))}
                  >
                    ₹{amt.toLocaleString('en-IN')}
                  </button>
                ))}
              </div>
            )}
          </div>

          {quote && (
            <div className="sg-quote-breakdown">
              <div className="sg-quote-row">
                <span>Gold weight</span>
                <strong>{formatGrams(quote.goldAmount)} g</strong>
              </div>
              <div className="sg-quote-row">
                <span>Gold value (excl. GST)</span>
                <strong>₹{formatInr(quote.goldValueExclGst)}</strong>
              </div>
              <div className="sg-quote-row">
                <span>GST ({quote.applicableTax}%)</span>
                <strong>₹{formatInr(quote.gstAmount)}</strong>
              </div>
              <div className="sg-quote-row sg-quote-row--total">
                <span>Final amount</span>
                <strong>₹{formatInr(quote.buyPrice)}</strong>
              </div>
            </div>
          )}

          {quoting && <p className="muted sg-quoting">Calculating…</p>}

          <button
            type="button"
            className="btn-primary sg-buy-btn"
            onClick={handleBuy}
            disabled={processing || quoting || !quote || loadingRate}
          >
            {processing ? 'Processing…' : isAuthenticated ? 'Buy Physical Gold' : 'Login to Buy'}
          </button>

          {!isAuthenticated && (
            <p className="sg-login-hint">
              <Link to="/login" state={{ from: '/invest-gold' }}>Login</Link>
              {' or '}
              <Link to="/register" state={{ from: '/invest-gold' }}>Register</Link>
              {' to start buying vault-stored gold.'}
            </p>
          )}
        </section>

        <aside className="sg-info-panel">
          <section className="sg-about">
            <h3>About SafeGold</h3>
            <p>
              SafeGold by Digital Gold India Pvt. Ltd. lets you own 24K (995/9999 fineness)
              physical gold digitally. Gold is procured, stored in Brink&apos;s vaults, and
              protected by Vistra Corporate Services as security trustee. Title remains with you.
            </p>
          </section>

          <section className="sg-faq">
            <h3>FAQ</h3>
            {FAQ_ITEMS.map((item, idx) => (
              <div key={idx} className={`sg-faq-item ${showFaq === idx ? 'open' : ''}`}>
                <button type="button" onClick={() => setShowFaq(showFaq === idx ? null : idx)}>
                  {item.q}
                  <span className="sg-faq-chevron">{showFaq === idx ? '−' : '+'}</span>
                </button>
                {showFaq === idx && <p>{item.a}</p>}
              </div>
            ))}
          </section>

          {isAuthenticated && transactions.length > 0 && (
            <section className="sg-history">
              <h3>Recent Transactions</h3>
              <ul className="sg-tx-list">
                {transactions.map((tx) => (
                  <li key={tx._id} className={`sg-tx-item sg-tx-item--${tx.type}`}>
                    <div>
                      <span className={`sg-tx-badge sg-tx-badge--${tx.status}`}>
                        {tx.status}
                      </span>
                      <span className="sg-tx-type">{tx.type === 'buy' ? 'Buy' : 'Sell'}</span>
                    </div>
                    <div className="sg-tx-details">
                      <strong className={tx.type === 'buy' ? 'sg-tx-buy' : 'sg-tx-sell'}>
                        {tx.type === 'buy' ? '+' : '−'}{formatGrams(tx.goldAmount)} g
                      </strong>
                      <span>₹{formatInr(tx.buyPrice)}</span>
                    </div>
                    <time>{new Date(tx.createdAt).toLocaleDateString('en-IN')}</time>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </aside>
      </div>

      <section className="panel page-feature sg-other-options">
        <h2>More Gold Investment Options</h2>
        <div className="list-cards">
          {OTHER_OPTIONS.map((item, idx) => (
            <article key={idx} className="list-card" style={{ justifyContent: 'flex-start' }}>
              <div>
                <h3>{item.title}</h3>
                <p>{item.desc}</p>
                <p className="muted">Starting from ₹{item.price.toLocaleString('en-IN')}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="sg-compliance">
        <p>
          Physical gold · Vault stored · Trustee protected · 24K purity · Powered by SafeGold
        </p>
      </section>
    </div>
  );
};

export default InvestGoldPage;
