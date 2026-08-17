import { useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../state/AuthContext';
import { useToast } from '../state/ToastContext';
import { orderService, safegoldService } from '../services/api';
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

function buildSummaryFromSources({ order, transaction, wallet, customer, user }) {
  const tx = transaction || order?.safegoldTransactionId || null;
  const txObj = tx && typeof tx === 'object' && tx.goldAmount != null ? tx : null;
  const item = order?.items?.[0];

  const goldAmount = Number(txObj?.goldAmount ?? item?.metalGrams ?? item?.quantity ?? 0);
  const buyPrice = Number(txObj?.buyPrice ?? order?.totalAmount ?? 0);
  const ratePerGram = Number(
    txObj?.currentPrice ?? order?.liveGoldRateAtPurchase ?? item?.purchaseRatePerGram ?? 0
  );
  const taxPct = Number(txObj?.applicableTax ?? 3);

  return {
    orderId: order?._id || order?.id || null,
    transactionId:
      txObj?._id ||
      (typeof order?.safegoldTransactionId === 'string' || typeof order?.safegoldTransactionId === 'object'
        ? order?.safegoldTransactionId?._id || order?.safegoldTransactionId
        : null) ||
      null,
    paymentOrderId: order?.paymentOrderId || txObj?.paymentOrderId || null,
    paymentId: order?.paymentId || txObj?.paymentId || null,
    status: order?.paymentStatus || txObj?.status || 'success',
    createdAt: order?.createdAt || txObj?.createdAt || new Date().toISOString(),
    goldAmount,
    buyPrice,
    ratePerGram,
    taxPct,
    gstAmount: ratePerGram > 0 && goldAmount > 0 ? (ratePerGram * goldAmount * taxPct) / 100 : 0,
    buyTxId: txObj?.buyTxId || null,
    transferTxId: txObj?.transferTxId || null,
    clientReferenceId: txObj?.clientReferenceId || null,
    invoiceUrl: txObj?.invoiceUrl || null,
    balanceGrams: wallet?.balanceGrams ?? null,
    customerName: order?.customerName || user?.name || customer?.name || '—',
    customerEmail: order?.customerEmail || user?.email || '—',
    customerPhone: order?.customerPhone || user?.mobile || '—'
  };
}

const InvestGoldOrderSummaryPage = () => {
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

  const orderIdParam = searchParams.get('orderId') || location.state?.orderId || null;

  useEffect(() => {
    let cancelled = false;

    const hydrate = async () => {
      const state = location.state || {};
      if (state.order || state.transaction) {
        const next = buildSummaryFromSources({
          order: state.order,
          transaction: state.transaction,
          wallet: state.wallet,
          customer: state.customer,
          user
        });
        if (!cancelled) {
          setSummary(next);
          setLoading(false);
        }
        return;
      }

      if (!orderIdParam) {
        if (!cancelled) {
          setSummary(null);
          setLoading(false);
        }
        return;
      }

      try {
        const { data: order } = await orderService.getById(orderIdParam);
        let wallet = null;
        if (isAuthenticated) {
          try {
            const dash = await safegoldService.getDashboard();
            wallet = dash.data?.wallet || null;
          } catch {
            /* optional */
          }
        }
        if (!cancelled) {
          setSummary(
            buildSummaryFromSources({
              order,
              transaction: order.safegoldTransactionId,
              wallet,
              user
            })
          );
        }
      } catch {
        if (!cancelled) {
          setSummary(null);
          showToast('Could not load order summary', 'error');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    hydrate();
    return () => {
      cancelled = true;
    };
  }, [isAuthenticated, location.state, orderIdParam, showToast, user]);

  const rows = useMemo(() => {
    if (!summary) return [];
    return [
      { label: 'Order ID', value: summary.orderId || '—' },
      { label: 'Payment reference', value: summary.paymentOrderId || '—' },
      { label: 'Payment ID', value: summary.paymentId || '—' },
      { label: 'SafeGold buy TX', value: summary.buyTxId || '—' },
      { label: 'Transfer TX', value: summary.transferTxId || '—' },
      { label: 'Client reference', value: summary.clientReferenceId || '—' },
      { label: 'Date & time', value: formatDateTime(summary.createdAt) },
      { label: 'Customer', value: summary.customerName },
      { label: 'Email', value: summary.customerEmail },
      { label: 'Mobile', value: summary.customerPhone },
      { label: 'Metal', value: '24K Physical Gold' },
      { label: 'Quantity', value: `${formatGrams(summary.goldAmount)} g` },
      {
        label: 'Live rate (excl. GST)',
        value: summary.ratePerGram ? `₹${formatInr(summary.ratePerGram)} / g` : '—'
      },
      { label: `GST (${summary.taxPct}%)`, value: `₹${formatInr(summary.gstAmount)}` },
      { label: 'Amount paid', value: `₹${formatInr(summary.buyPrice)}` },
      {
        label: 'Updated gold balance',
        value:
          summary.balanceGrams != null ? `${formatGrams(summary.balanceGrams)} g` : 'Available in dashboard'
      },
      { label: 'Payment status', value: String(summary.status || 'success').toUpperCase() },
      { label: 'Storage', value: "Brink's insured vaults · Trustee protected" }
    ];
  }, [summary]);

  const closeInvoicePopup = () => {
    setInvoicePopupOpen(false);
    setInvoiceFrameSrc('');
  };

  const showInvoicePopup = (transactionId) => {
    if (!transactionId) {
      showToast('Transaction reference missing for SafeGold invoice', 'error');
      return;
    }
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
    if (!summary.transactionId && !summary.orderId) {
      showToast('Transaction reference missing for SafeGold invoice', 'error');
      return;
    }

    setInvoiceLoading(true);
    try {
      const res = summary.transactionId
        ? await safegoldService.getTransactionInvoice(summary.transactionId)
        : await safegoldService.getInvoice({ orderId: summary.orderId });
      const url = res.data?.invoiceUrl;
      const txId = res.data?.transactionId || summary.transactionId;
      if (url && txId) {
        setSummary((prev) =>
          prev ? { ...prev, invoiceUrl: url, transactionId: txId } : prev
        );
        showInvoicePopup(txId);
      } else {
        showToast(
          res.data?.message ||
            'SafeGold invoice PDF is not available yet. Please try again shortly.',
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
      title="Download official SafeGold buy invoice"
    >
      {invoiceLoading ? 'Loading invoice…' : 'Download Invoice'}
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
          <p className="igos-loading">Loading order summary…</p>
        </div>
      </div>
    );
  }

  if (!summary) {
    return (
      <div className="page igos-page">
        <div className="igos-shell igos-empty">
          <h1>Order summary not found</h1>
          <p>Complete a physical gold purchase to view your order summary here.</p>
          <Link to="/invest-gold" className="igos-btn igos-btn--gold">
            Buy Physical Gold
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="page igos-page">
      <div className="igos-shell">
        <div className="igos-actions no-print">
          <button type="button" className="igos-btn igos-btn--ghost" onClick={() => navigate('/invest-gold')}>
            ← Back to Invest Gold
          </button>
        </div>

        <article className="igos-card">
          <header className="igos-card-head">
            <div>
              <p className="igos-kicker">GoldnSilver.shop · SafeGold</p>
              <h1>Order Summary</h1>
              <p className="igos-sub">Physical gold purchase confirmation</p>
            </div>
            <div className="igos-head-actions">
              <div className="igos-status">Payment successful</div>
              {invoiceButton('igos-btn--invoice-sm')}
            </div>
          </header>

          <div className="igos-hero">
            <div>
              <span>Gold purchased</span>
              <strong>{formatGrams(summary.goldAmount)} g</strong>
            </div>
            <div>
              <span>Amount paid</span>
              <strong>₹{formatInr(summary.buyPrice)}</strong>
            </div>
            <div>
              <span>Order</span>
              <strong className="igos-mono">{shortId(summary.orderId)}</strong>
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
                  Your 24K gold is vault-stored and trustee-protected. Keep this summary for your
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
          <Link to="/invest-gold" className="igos-btn igos-btn--outline">
            Buy more gold
          </Link>
          <Link to="/invest-gold-sell" className="igos-btn igos-btn--gold">
            Sell gold
          </Link>
        </div>
      </div>

      {invoicePopupOpen && invoiceFrameSrc && (
        <div
          className="igos-invoice-overlay"
          role="dialog"
          aria-modal="true"
          aria-labelledby="igos-invoice-title"
          onClick={closeInvoicePopup}
        >
          <div className="igos-invoice-popup" onClick={(e) => e.stopPropagation()}>
            <div className="igos-invoice-popup-head">
              <h2 id="igos-invoice-title">Download Invoice</h2>
              <button
                type="button"
                className="igos-invoice-close"
                onClick={closeInvoicePopup}
                aria-label="Close invoice"
              >
                ×
              </button>
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

export default InvestGoldOrderSummaryPage;
