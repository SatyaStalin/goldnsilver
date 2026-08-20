import { useCallback, useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../state/AuthContext';
import { useToast } from '../state/ToastContext';
import { safegoldService } from '../services/api';

const formatInr = (n) =>
  Number(n).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const formatGrams = (n) =>
  Number(n).toLocaleString('en-IN', { minimumFractionDigits: 4, maximumFractionDigits: 4 });

const FAQ_ITEMS = [
  {
    q: 'How does gold sale work?',
    a: 'You sell vault-stored 24K gold at the live SafeGold sell rate. Gold is verified, confirmed, and debited from your SafeGold balance. Sale proceeds are settled as per SafeGold partner payout.'
  },
  {
    q: 'Why is the sell rate lower than the buy rate?',
    a: 'GST is added when you buy, but not refunded when you sell. There is also a buy–sell spread that covers wholesale bullion, vault, insurance, and trustee costs.'
  },
  {
    q: 'Is there a lock-in period?',
    a: 'No lock-in from this portal. You can sell any sellable gold balance at the live sell price, subject to SafeGold limits (minimum ₹10).'
  },
  {
    q: 'Is GST charged on sale?',
    a: 'No. GST is not levied on digital gold sale. The amount shown is the proceeds at the live sell rate.'
  },
  {
    q: 'When do I receive the money?',
    a: 'After a successful SafeGold sell confirm, proceeds are processed through partner settlement. Keep your profile mobile and name updated for payout matching.'
  }
];

const InvestGoldSellPage = () => {
  const { isAuthenticated, user } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [rate, setRate] = useState(null);
  const [rateIsMock, setRateIsMock] = useState(false);
  const [wallet, setWallet] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [minSellInr, setMinSellInr] = useState(10);
  const [loadingRate, setLoadingRate] = useState(true);
  const [sellMode, setSellMode] = useState('grams');
  const [inputValue, setInputValue] = useState('');
  const [quote, setQuote] = useState(null);
  const [quoteError, setQuoteError] = useState('');
  const [quoting, setQuoting] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [rateCountdown, setRateCountdown] = useState(null);
  const [showFaq, setShowFaq] = useState(null);
  const [customer, setCustomer] = useState(null);
  const quoteTimer = useRef(null);

  const sellableGrams = Number(
    wallet?.sellableBalanceGrams > 0 ? wallet.sellableBalanceGrams : wallet?.balanceGrams || 0
  );

  const loadRate = useCallback(async () => {
    setLoadingRate(true);
    try {
      const res = await safegoldService.getSellPrice();
      setRate(res.data);
      setRateIsMock(Boolean(res.data.mock));
      if (res.data.limits?.minSellInr != null) setMinSellInr(res.data.limits.minSellInr);
    } catch {
      showToast('Could not fetch live gold sell rate. Please try again.', 'error');
    } finally {
      setLoadingRate(false);
    }
  }, [showToast]);

  const loadDashboard = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      const res = await safegoldService.getDashboard();
      setWallet(res.data.wallet);
      setCustomer(res.data.customer);
      setTransactions(res.data.transactions || []);
      if (res.data.sellRate) {
        setRate(res.data.sellRate);
        setRateIsMock(Boolean(res.data.sellRate.mock));
      }
      if (res.data.limits?.minSellInr != null) setMinSellInr(res.data.limits.minSellInr);
    } catch {
      /* optional */
    }
  }, [isAuthenticated]);

  useEffect(() => {
    loadRate();
    loadDashboard();
  }, [loadRate, loadDashboard]);

  useEffect(() => {
    if (sellableGrams > 0 && inputValue === '') {
      setInputValue(String(sellableGrams));
    }
  }, [sellableGrams]);

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

  // Gold is sold in 0.0001 g steps. SafeGold: INR entered = INR received (sell_price is authoritative).
  const maxGrams =
    sellableGrams > 0 ? Math.floor(sellableGrams * 10000) / 10000 : 0;
  const maxInrInput = (() => {
    if (!rate?.currentPrice || maxGrams <= 0) return 0;
    let n = Math.ceil(maxGrams * rate.currentPrice);
    while (n >= minSellInr) {
      const g = Math.floor((n / rate.currentPrice) * 10000) / 10000;
      if (g > 0 && g <= maxGrams + 0.00005) return n;
      n -= 1;
    }
    return 0;
  })();

  const validateInput = useCallback(() => {
    const value = Number(inputValue);
    if (!value || value <= 0) {
      return 'Enter a valid amount';
    }
    if (sellableGrams <= 0) {
      return 'You have no gold to sell. Buy gold first.';
    }
    if (sellMode === 'grams') {
      if (value > sellableGrams + 0.00005) {
        return `You can sell up to ${formatGrams(sellableGrams)} g`;
      }
      const estInr = rate ? value * rate.currentPrice : 0;
      if (estInr < minSellInr) {
        return `Minimum sell amount is ₹${minSellInr.toLocaleString('en-IN')}`;
      }
      return '';
    }
    if (!Number.isInteger(value)) {
      return 'Enter a whole rupee amount (no decimals)';
    }
    if (value < minSellInr) {
      return `Minimum sell amount is ₹${minSellInr.toLocaleString('en-IN')}`;
    }
    if (maxInrInput > 0 && value > maxInrInput) {
      return `Maximum you can sell is ₹${maxInrInput.toLocaleString('en-IN')}`;
    }
    return '';
  }, [inputValue, maxInrInput, minSellInr, rate, sellMode, sellableGrams]);

  const fetchQuote = useCallback(async () => {
    const value = Number(inputValue);
    if (!isAuthenticated || !value || value <= 0) {
      setQuote(null);
      setQuoteError('');
      return;
    }

    const validationError = validateInput();
    if (validationError) {
      setQuote(null);
      setQuoteError(validationError);
      return;
    }

    setQuoteError('');
    setQuoting(true);
    try {
      const res = await safegoldService.getSellQuote({
        mode: sellMode,
        value,
        rateId: rate?.rateId
      });
      setQuote(res.data);
      if (res.data.wallet) setWallet(res.data.wallet);
    } catch (err) {
      setQuote(null);
      const msg = err.response?.data?.message || 'Could not calculate sale quote';
      setQuoteError(msg);
    } finally {
      setQuoting(false);
    }
  }, [inputValue, isAuthenticated, rate?.rateId, sellMode, validateInput]);

  useEffect(() => {
    if (quoteTimer.current) clearTimeout(quoteTimer.current);
    quoteTimer.current = setTimeout(fetchQuote, 400);
    return () => clearTimeout(quoteTimer.current);
  }, [fetchQuote, inputValue, sellMode]);

  const formatCountdown = (secs) => {
    if (secs == null) return '';
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${String(s).padStart(2, '0')}`;
  };

  const handleSellModeChange = (mode) => {
    setSellMode(mode);
    setQuote(null);
    setQuoteError('');
    setConfirming(false);
    if (mode === 'grams') {
      setInputValue(sellableGrams > 0 ? String(sellableGrams) : '');
    } else {
      setInputValue(maxInrInput > 0 ? String(maxInrInput) : '');
    }
  };

  const applyPercent = (pct) => {
    if (sellableGrams <= 0) return;
    const grams = Math.floor(sellableGrams * pct * 10000) / 10000;
    setSellMode('grams');
    setInputValue(String(grams));
    setQuoteError('');
    setConfirming(false);
  };

  const handleInrInput = (raw) => {
    // Block decimals in rupee field per SafeGold sell docs
    const cleaned = raw.replace(/[^\d]/g, '');
    setInputValue(cleaned);
    setQuoteError('');
    setConfirming(false);
  };

  const handleSell = async () => {
    if (!isAuthenticated) {
      showToast('Please login to sell gold', 'error');
      navigate('/login', { state: { from: '/invest-gold-sell' } });
      return;
    }

    const validationError = validateInput();
    if (validationError) {
      setQuoteError(validationError);
      return;
    }

    if (!quote) {
      showToast('Enter a valid amount to continue', 'error');
      return;
    }

    if (!user?.mobile) {
      showToast('Add your mobile number in profile before selling', 'error');
      navigate('/dashboard');
      return;
    }

    if (rateCountdown != null && rateCountdown <= 0) {
      showToast('Sell rate expired. Refreshing…', 'error');
      loadRate();
      return;
    }

    if (!confirming) {
      setConfirming(true);
      return;
    }

    setProcessing(true);
    try {
      const res = await safegoldService.initiateSell({
        mode: sellMode,
        value: Number(inputValue),
        rateId: quote.rateId
      });

      showToast('Gold sold successfully', 'success-animated');
      navigate('/invest-gold-sell/order-summary', {
        replace: true,
        state: {
          transaction: res.data.transaction,
          wallet: res.data.wallet,
          quote: res.data.quote,
          transactionId: res.data.safegoldTransactionId,
          sell: res.data.sell
        }
      });
    } catch (err) {
      const msg = err.response?.data?.message || 'Could not complete gold sale';
      if (err.response?.data?.code === 'RATE_EXPIRED') loadRate();
      showToast(msg, 'error');
      setConfirming(false);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="page invest-gold-page">
      <div className="sg-hero sg-hero--sell">
        <div className="sg-hero-content">
          <div className="sg-brand-row">
            <div className="sg-logo-badge">
              <span className="sg-logo-icon">◆</span>
              <span className="sg-logo-text">SafeGold</span>
            </div>
            <span className="sg-powered">Powered by SafeGold</span>
          </div>
          <h1 className="sg-hero-title">Sell 24K Digital Gold</h1>
          <p className="sg-hero-desc">
            Sell vault-stored, trustee-protected gold at the live SafeGold sell rate.
            No GST on sale. Proceeds are settled after a successful vault debit.
          </p>
          <div className="sg-hero-tags">
            <span>Live Sell Rate</span>
            <span>No GST on Sale</span>
            <span>Verify → Confirm</span>
            <span>Min ₹{minSellInr.toLocaleString('en-IN')}</span>
          </div>
        </div>

        {isAuthenticated && wallet && (
          <div className="sg-balance-card">
            <span className="sg-balance-label">Sellable Gold</span>
            <span className="sg-balance-value">{formatGrams(sellableGrams)} g</span>
            <span className="sg-balance-sub">
              {rate
                ? `≈ ₹${formatInr(sellableGrams * rate.currentPrice)} at live sell rate`
                : 'Physical gold in insured vault'}
            </span>
            {customer?.safegoldCustomerId && (
              <span className="sg-balance-sub sg-customer-id">
                SafeGold ID: {customer.safegoldCustomerId}
              </span>
            )}
          </div>
        )}
      </div>

      <div className="sg-main-grid">
        <section className="sg-buy-panel">
          <div className="sg-rate-header">
            <h2>Sell Physical Gold</h2>
            {rateCountdown != null && rateCountdown > 0 && (
              <span className={`sg-rate-timer ${rateCountdown < 60 ? 'sg-rate-timer--urgent' : ''}`}>
                Rate valid: {formatCountdown(rateCountdown)}
              </span>
            )}
          </div>

          {rateIsMock && rate && (
            <div className="sg-mock-warning" role="alert">
              <strong>Demo sell rate — not a live SafeGold quote.</strong>
              <p>
                Live sell uses SafeGold sell-price, sell-gold-verify, and sell-gold-confirm APIs.
                {rate.mockReason ? ` (${rate.mockReason})` : ''}
              </p>
            </div>
          )}

          {rate && !rateIsMock && (
            <p className="sg-rate-source muted">
              Live sell rate source: <strong>SafeGold API</strong> (valid 5 minutes on this site)
            </p>
          )}

          <div className="sg-rate-display">
            {loadingRate ? (
              <p className="muted">Loading live sell rate…</p>
            ) : rate ? (
              <>
                <div className="sg-rate-row sg-rate-row--total">
                  <span>Sell rate</span>
                  <strong>₹{formatInr(rate.currentPrice)} / g</strong>
                </div>
                <p className="sg-quote-note muted" style={{ marginTop: '0.6rem' }}>
                  GST is not charged on gold sale. Minimum sell value is ₹
                  {minSellInr.toLocaleString('en-IN')}. Rupee amounts must be whole numbers (no
                  decimals).
                </p>
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
              className={sellMode === 'inr' ? 'active' : ''}
              onClick={() => handleSellModeChange('inr')}
            >
              Sell in ₹
            </button>
            <button
              type="button"
              className={sellMode === 'grams' ? 'active' : ''}
              onClick={() => handleSellModeChange('grams')}
            >
              Sell in Grams
            </button>
          </div>

          <div className="sg-input-group">
            <label>
              {sellMode === 'inr'
                ? `Amount (₹${minSellInr.toLocaleString('en-IN')} – ₹${(maxInrInput || 0).toLocaleString('en-IN')}, whole rupees)`
                : `Gold amount (max ${formatGrams(sellableGrams)} g)`}
              <input
                type={sellMode === 'inr' ? 'text' : 'number'}
                inputMode={sellMode === 'inr' ? 'numeric' : 'decimal'}
                min={sellMode === 'inr' ? undefined : 0.0001}
                max={sellMode === 'inr' ? undefined : sellableGrams || undefined}
                step={sellMode === 'inr' ? undefined : 0.0001}
                value={inputValue}
                onChange={(e) => {
                  if (sellMode === 'inr') {
                    handleInrInput(e.target.value);
                  } else {
                    setInputValue(e.target.value);
                    setQuoteError('');
                    setConfirming(false);
                  }
                }}
                placeholder={sellMode === 'inr' ? 'Enter whole rupee amount' : 'Enter grams'}
              />
            </label>
            {quoteError && <p className="sg-input-error">{quoteError}</p>}
            {sellableGrams > 0 && (
              <div className="sg-quick-amounts">
                {[
                  { label: '25%', pct: 0.25 },
                  { label: '50%', pct: 0.5 },
                  { label: '75%', pct: 0.75 },
                  { label: 'Sell all', pct: 1 }
                ].map((chip) => (
                  <button key={chip.label} type="button" onClick={() => applyPercent(chip.pct)}>
                    {chip.label}
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
                <span>Sell rate</span>
                <strong>₹{formatInr(quote.currentPrice)} / g</strong>
              </div>
              <div className="sg-quote-row sg-quote-row--total">
                <span>You receive</span>
                <strong>
                  {sellMode === 'inr'
                    ? `₹${Number(quote.sellPrice).toLocaleString('en-IN')}`
                    : `₹${formatInr(quote.sellPrice)}`}
                </strong>
              </div>
            </div>
          )}

          {quoting && <p className="muted sg-quoting">Calculating…</p>}

          {confirming && quote && (
            <div className="sg-confirm-box" role="status">
              <strong>Confirm this sale</strong>
              <p>
                Sell {formatGrams(quote.goldAmount)} g at ₹{formatInr(quote.currentPrice)}/g for{' '}
                <strong>₹{formatInr(quote.sellPrice)}</strong>. This cannot be undone.
              </p>
            </div>
          )}

          <button
            type="button"
            className="btn-primary sg-buy-btn sg-sell-btn"
            onClick={handleSell}
            disabled={
              processing ||
              quoting ||
              loadingRate ||
              Boolean(quoteError) ||
              (isAuthenticated && (!quote || sellableGrams <= 0))
            }
          >
            {processing
              ? 'Selling…'
              : !isAuthenticated
                ? 'Login to Sell'
                : sellableGrams <= 0
                  ? 'No gold to sell'
                  : confirming
                    ? 'Confirm & Sell Gold'
                    : 'Review & Sell Gold'}
          </button>

          {!isAuthenticated && (
            <p className="sg-login-hint">
              <Link to="/login" state={{ from: '/invest-gold-sell' }}>
                Login
              </Link>
              {' or '}
              <Link to="/register" state={{ from: '/invest-gold-sell' }}>
                Register
              </Link>
              {' to sell vault-stored gold.'}
            </p>
          )}

          {isAuthenticated && sellableGrams <= 0 && (
            <p className="sg-login-hint">
              You need a gold balance to sell. <Link to="/invest-gold">Buy Digital  gold</Link>
            </p>
          )}

          <p className="sg-login-hint">
            Looking to invest? <Link to="/invest-gold">Gold Buy</Link>
          </p>
        </section>

        <aside className="sg-info-panel">
          <section className="sg-about">
            <h3>About SafeGold Sale</h3>
            <p>
              SafeGold by Digital Gold India Pvt. Ltd. lets you sell 24K digital  gold from your
              vault balance at a live sell quote. Sale uses SafeGold verify and confirm APIs. Gold
              is stored in Brink&apos;s vaults and protected by Vistra as security trustee.
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
                      <span className={`sg-tx-badge sg-tx-badge--${tx.status}`}>{tx.status}</span>
                      <span className="sg-tx-type">{tx.type === 'buy' ? 'Buy' : 'Sell'}</span>
                    </div>
                    <div className="sg-tx-details">
                      <strong className={tx.type === 'buy' ? 'sg-tx-buy' : 'sg-tx-sell'}>
                        {tx.type === 'buy' ? '+' : '−'}
                        {formatGrams(tx.goldAmount)} g
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

      <section className="sg-compliance">
        <p>
          Physical gold sale · Vault stored · Trustee protected · 24K purity · Powered by SafeGold
        </p>
      </section>
    </div>
  );
};

export default InvestGoldSellPage;
