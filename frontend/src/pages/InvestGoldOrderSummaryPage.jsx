import { useEffect, useMemo, useRef, useState } from 'react';
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
  const printRef = useRef(null);

  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState(null);
  const [invoiceLoading, setInvoiceLoading] = useState(false);

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

  const openSafeGoldInvoice = async () => {
    if (!summary) return;
    if (summary.invoiceUrl) {
      window.open(summary.invoiceUrl, '_blank', 'noopener,noreferrer');
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
      if (url) {
        setSummary((prev) => (prev ? { ...prev, invoiceUrl: url } : prev));
        window.open(url, '_blank', 'noopener,noreferrer');
      } else {
        showToast(
          res.data?.message ||
            'SafeGold invoice PDF is not available yet. Try again in a few minutes.',
          'error'
        );
      }
    } catch (err) {
      showToast(
        err.response?.data?.message || 'Could not fetch SafeGold invoice. Please try again.',
        'error'
      );
    } finally {
      setInvoiceLoading(false);
    }
  };

  const downloadSummary = () => {
    if (!summary || !printRef.current) return;
    const title = `GoldnSilver-Order-${shortId(summary.orderId).replace(/[^\w.-]/g, '')}`;
    const styles = `
      body { font-family: Georgia, 'Times New Roman', serif; color: #1a1208; margin: 32px; }
      h1 { font-size: 22px; margin: 0 0 4px; }
      .sub { color: #666; font-size: 13px; margin-bottom: 24px; }
      .badge { display: inline-block; background: #e8f5e9; color: #1b5e20; padding: 6px 12px; border-radius: 999px; font-weight: 700; font-size: 12px; margin-bottom: 20px; }
      .hero { background: linear-gradient(135deg, #1b2438, #2c3e5a); color: #fff; padding: 20px; border-radius: 12px; margin-bottom: 20px; }
      .hero strong { color: #f8b70b; font-size: 28px; display: block; margin-top: 6px; }
      table { width: 100%; border-collapse: collapse; }
      td { padding: 10px 8px; border-bottom: 1px solid #eee; font-size: 13px; vertical-align: top; }
      td:first-child { color: #666; width: 38%; }
      td:last-child { font-weight: 600; }
      .foot { margin-top: 28px; font-size: 11px; color: #777; }
    `;
    const tableRows = rows
      .map(
        (r) =>
          `<tr><td>${r.label}</td><td>${String(r.value)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')}</td></tr>`
      )
      .join('');
    const html = `<!DOCTYPE html><html><head><meta charset="utf-8"/><title>${title}</title><style>${styles}</style></head><body>
      <div class="badge">PAYMENT SUCCESSFUL</div>
      <h1>Physical Gold — Order Summary</h1>
      <p class="sub">GoldnSilver.shop · Powered by SafeGold</p>
      <div class="hero">
        <div>You purchased</div>
        <strong>${formatGrams(summary.goldAmount)} g</strong>
        <div style="margin-top:8px;opacity:.9">Amount paid ₹${formatInr(summary.buyPrice)}</div>
      </div>
      <table>${tableRows}</table>
      <p class="foot">Generated on ${formatDateTime(new Date())}. This is a system-generated order summary for your records.</p>
    </body></html>`;

    const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${title}.html`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    showToast('Order summary downloaded', 'success');
  };

  const printSummary = () => {
    window.print();
  };

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
          <div className="igos-actions-right">
            <button type="button" className="igos-btn igos-btn--outline" onClick={printSummary}>
              Print / Save PDF
            </button>
            <button type="button" className="igos-btn igos-btn--gold" onClick={downloadSummary}>
              Download order summary
            </button>
            <button
              type="button"
              className="igos-btn igos-btn--navy"
              onClick={openSafeGoldInvoice}
              disabled={invoiceLoading}
            >
              {invoiceLoading ? 'Fetching SafeGold invoice…' : 'SafeGold Invoice'}
            </button>
          </div>
        </div>

        <article className="igos-card" ref={printRef}>
          <header className="igos-card-head">
            <div>
              <p className="igos-kicker">GoldnSilver.shop · SafeGold</p>
              <h1>Order Summary</h1>
              <p className="igos-sub">Physical gold purchase confirmation</p>
            </div>
            <div className="igos-status">Payment successful</div>
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
            <p>
              Your 24K gold is vault-stored and trustee-protected. Keep this summary for your records.
              For support, write to support@goldnsilver.shop.
            </p>
            <p className="igos-generated">Generated {formatDateTime(new Date())}</p>
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
    </div>
  );
};

export default InvestGoldOrderSummaryPage;
