import { useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../state/AuthContext';
import { useToast } from '../state/ToastContext';
import { safegoldService } from '../services/api';
import './InvestGoldOrderSummaryPage.css';

const formatInr = (n) =>
  Number(n || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const formatGrams = (n) =>
  Number(n || 0).toLocaleString('en-IN', { minimumFractionDigits: 4, maximumFractionDigits: 4 });

const formatDateTime = (value) => {
  if (!value) return '—';
  try {
    return new Date(value).toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch {
    return String(value);
  }
};

const shortId = (id) => {
  if (!id) return '—';
  const s = String(id);
  return s.length > 10 ? `${s.slice(0, 8)}…${s.slice(-4)}` : s;
};

function buildSaleSummary({ transaction, wallet, quote, user }) {
  const tx = transaction && typeof transaction === 'object' ? transaction : null;
  const goldAmount = Number(tx?.goldAmount ?? quote?.goldAmount ?? 0);
  const sellPrice = Number(tx?.buyPrice ?? quote?.sellPrice ?? 0);
  const ratePerGram = Number(tx?.currentPrice ?? quote?.currentPrice ?? 0);

  return {
    transactionId: tx?._id || null,
    sellTxId: tx?.sellTxId || tx?.buyTxId || null,
    clientReferenceId: tx?.clientReferenceId || null,
    status: tx?.status || 'success',
    createdAt: tx?.createdAt || new Date().toISOString(),
    goldAmount,
    sellPrice,
    ratePerGram,
    invoiceUrl: tx?.invoiceUrl || null,
    balanceGrams: wallet?.balanceGrams ?? null,
    customerName: user?.name || '—',
    customerEmail: user?.email || '—',
    customerPhone: user?.mobile || '—'
  };
}

const InvestGoldSaleSummaryPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, isAuthenticated } = useAuth();
  const { showToast } = useToast();

  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState(null);
  const [invoiceLoading, setInvoiceLoading] = useState(false);
  const [invoicePopupOpen, setInvoicePopupOpen] = useState(false);
  const [invoiceFrameSrc, setInvoiceFrameSrc] = useState('');
  const [activeInvoiceTxId, setActiveInvoiceTxId] = useState(null);

  const txIdParam = searchParams.get('txId') || location.state?.transactionId || null;

  useEffect(() => {
    let cancelled = false;

    const hydrate = async () => {
      const state = location.state || {};
      if (state.transaction) {
        const next = buildSaleSummary({
          transaction: state.transaction,
          wallet: state.wallet,
          quote: state.quote,
          user
        });
        if (!cancelled) {
          setSummary(next);
          setLoading(false);
        }
        return;
      }

      if (!txIdParam || !isAuthenticated) {
        if (!cancelled) {
          setSummary(null);
          setLoading(false);
        }
        return;
      }

      try {
        const { data } = await safegoldService.getTransaction(txIdParam);
        if (!cancelled) {
          setSummary(
            buildSaleSummary({
              transaction: data.transaction,
              wallet: data.wallet,
              user
            })
          );
        }
      } catch {
        if (!cancelled) {
          setSummary(null);
          showToast('Could not load sale summary', 'error');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    hydrate();
    return () => {
      cancelled = true;
    };
  }, [isAuthenticated, location.state, showToast, txIdParam, user]);

  const rows = useMemo(() => {
    if (!summary) return [];
    return [
      { label: 'Sale ID', value: summary.transactionId || '—' },
      { label: 'SafeGold sell TX', value: summary.sellTxId || '—' },
      { label: 'Client reference', value: summary.clientReferenceId || '—' },
      { label: 'Date & time', value: formatDateTime(summary.createdAt) },
      { label: 'Customer', value: summary.customerName },
      { label: 'Email', value: summary.customerEmail },
      { label: 'Mobile', value: summary.customerPhone },
      { label: 'Metal', value: '24K Physical Gold' },
      { label: 'Quantity sold', value: `${formatGrams(summary.goldAmount)} g` },
      {
        label: 'Sell rate',
        value: summary.ratePerGram ? `₹${formatInr(summary.ratePerGram)} / g` : '—'
      },
      { label: 'Amount receivable', value: `₹${formatInr(summary.sellPrice)}` },
      {
        label: 'Updated gold balance',
        value:
          summary.balanceGrams != null ? `${formatGrams(summary.balanceGrams)} g` : 'Available in dashboard'
      },
      { label: 'Sale status', value: String(summary.status || 'success').toUpperCase() },
      { label: 'GST', value: 'Not applicable on gold sale' }
    ];
  }, [summary]);

  const closeInvoicePopup = () => {
    setInvoicePopupOpen(false);
    setInvoiceFrameSrc('');
    setActiveInvoiceTxId(null);
  };

  const showInvoicePopup = (transactionId) => {
    if (!transactionId) {
      showToast('Transaction reference missing for SafeGold invoice', 'error');
      return;
    }
    setActiveInvoiceTxId(transactionId);
    setInvoiceFrameSrc(safegoldService.getInvoiceViewUrl(transactionId));
    setInvoicePopupOpen(true);
  };

  const openSafeGoldInvoice = async () => {
    if (!summary) return;

    if (summary.transactionId && summary.invoiceUrl) {
      showInvoicePopup(summary.transactionId);
      return;
    }

    if (!isAuthenticated) {
      showToast('Please login to view the SafeGold invoice', 'error');
      return;
    }
    if (!summary.transactionId) {
      showToast('Transaction reference missing for SafeGold invoice', 'error');
      return;
    }

    setInvoiceLoading(true);
    try {
      const res = await safegoldService.getTransactionInvoice(summary.transactionId);
      const url = res.data?.invoiceUrl;
      const txId = res.data?.transactionId || summary.transactionId;
      if (url && txId) {
        setSummary((prev) => (prev ? { ...prev, invoiceUrl: url, transactionId: txId } : prev));
        showInvoicePopup(txId);
      } else {
        showToast(
          res.data?.message ||
            'SafeGold invoice is not available yet. Please try again shortly.',
          'error'
        );
      }
    } catch (err) {
      const code = err.response?.data?.code;
      const msg =
        err.response?.data?.message || 'Could not fetch SafeGold invoice. Please try again.';
      showToast(
        msg,
        code === 'SAFEGOLD_TX_MISSING' || code === 'INVOICE_NOT_READY' ? 'info' : 'error'
      );
    } finally {
      setInvoiceLoading(false);
    }
  };

  const invoiceButton = (className = '') => (
    <button
      type="button"
      className={`igos-btn igos-btn--navy igos-btn--invoice ${className}`.trim()}
      onClick={openSafeGoldInvoice}
      disabled={invoiceLoading}
      title="Show or download official SafeGold invoice"
    >
      {invoiceLoading ? 'Loading invoice…' : 'Show or download invoice'}
    </button>
  );

  useEffect(() => {
    if (!invoicePopupOpen) return undefined;
    const onKey = (e) => {
      if (e.key === 'Escape') closeInvoicePopup();
    };
    document.addEventListener('keydown', onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [invoicePopupOpen]);

  if (loading) {
    return (
      <div className="page igos-page">
        <div className="igos-shell">
          <p className="igos-loading">Loading sale summary…</p>
        </div>
      </div>
    );
  }

  if (!summary) {
    return (
      <div className="page igos-page">
        <div className="igos-shell igos-empty">
          <h1>Sale summary not found</h1>
          <p>Complete a physical gold sale to view your summary here.</p>
          <Link to="/invest-gold-sell" className="igos-btn igos-btn--gold">
            Sell Physical Gold
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="page igos-page">
      <div className="igos-shell">
        <div className="igos-actions no-print">
          <button type="button" className="igos-btn igos-btn--ghost" onClick={() => navigate('/invest-gold-sell')}>
            ← Back to Gold Sale
          </button>
        </div>

        <article className="igos-card">
          <header className="igos-card-head">
            <div>
              <p className="igos-kicker">GoldnSilver.shop · SafeGold</p>
              <h1>Sale Summary</h1>
              <p className="igos-sub">Physical gold sale confirmation</p>
            </div>
            <div className="igos-head-actions">
              <div className="igos-status">Sale successful</div>
              {invoiceButton('igos-btn--invoice-sm')}
            </div>
          </header>

          <div className="igos-hero">
            <div>
              <span>Gold sold</span>
              <strong>{formatGrams(summary.goldAmount)} g</strong>
            </div>
            <div>
              <span>Amount receivable</span>
              <strong>₹{formatInr(summary.sellPrice)}</strong>
            </div>
            <div>
              <span>Sale</span>
              <strong className="igos-mono">{shortId(summary.transactionId)}</strong>
            </div>
          </div>

          <div className="igos-grid">
            {rows.map((row) => (
              <div key={row.label} className="igos-row">
                <span>{row.label}</span>
                <strong>{row.value}</strong>
              </div>
            ))}
          </div>

          <footer className="igos-foot">
            <div className="igos-foot-inner">
              <div className="igos-foot-copy">
                <p>
                  Your gold has been debited from the SafeGold vault. Keep this summary for your
                  records. For support, write to support@goldnsilver.shop.
                </p>
                <p className="igos-generated">Generated {formatDateTime(new Date())}</p>
              </div>
              <div className="igos-foot-actions">{invoiceButton()}</div>
            </div>
          </footer>
        </article>

        <div className="igos-bottom no-print">
          <Link to="/dashboard" className="igos-btn igos-btn--navy">
            Go to Dashboard
          </Link>
          <Link to="/invest-gold-sell" className="igos-btn igos-btn--outline">
            Sell more gold
          </Link>
          <Link to="/invest-gold" className="igos-btn igos-btn--gold">
            Buy gold
          </Link>
        </div>
      </div>

      {invoicePopupOpen && invoiceFrameSrc && activeInvoiceTxId && (
        <div
          className="igos-invoice-overlay"
          role="dialog"
          aria-modal="true"
          aria-labelledby="igos-invoice-title"
          onClick={closeInvoicePopup}
        >
          <div className="igos-invoice-popup" onClick={(e) => e.stopPropagation()}>
            <div className="igos-invoice-popup-head">
              <h2 id="igos-invoice-title">SafeGold Invoice</h2>
              <div className="igos-invoice-popup-actions">
                <a
                  href={safegoldService.getInvoiceViewUrl(activeInvoiceTxId, { download: true })}
                  className="igos-invoice-download"
                  download="safegold-sell-invoice.pdf"
                >
                  Download
                </a>
                <button
                  type="button"
                  className="igos-invoice-close"
                  onClick={closeInvoicePopup}
                  aria-label="Close invoice"
                >
                  ×
                </button>
              </div>
            </div>
            <iframe
              className="igos-invoice-frame"
              title="SafeGold invoice"
              src={invoiceFrameSrc}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default InvestGoldSaleSummaryPage;
