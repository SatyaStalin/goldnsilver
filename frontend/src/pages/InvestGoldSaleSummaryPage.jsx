import { useEffect, useMemo, useRef, useState } from 'react';
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
  const printRef = useRef(null);

  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState(null);

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

  const downloadSummary = () => {
    if (!summary || !printRef.current) return;
    const title = `GoldnSilver-Sale-${shortId(summary.transactionId).replace(/[^\w.-]/g, '')}`;
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
      <div class="badge">SALE SUCCESSFUL</div>
      <h1>Physical Gold — Sale Summary</h1>
      <p class="sub">GoldnSilver.shop · Powered by SafeGold</p>
      <div class="hero">
        <div>You sold</div>
        <strong>${formatGrams(summary.goldAmount)} g</strong>
        <div style="margin-top:8px;opacity:.9">Amount receivable ₹${formatInr(summary.sellPrice)}</div>
      </div>
      <table>${tableRows}</table>
      <p class="foot">Generated on ${formatDateTime(new Date())}. This is a system-generated sale summary for your records.</p>
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
    showToast('Sale summary downloaded', 'success');
  };

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
          <div className="igos-actions-right">
            <button type="button" className="igos-btn igos-btn--outline" onClick={() => window.print()}>
              Print / Save PDF
            </button>
            <button type="button" className="igos-btn igos-btn--gold" onClick={downloadSummary}>
              Download sale summary
            </button>
          </div>
        </div>

        <article className="igos-card" ref={printRef}>
          <header className="igos-card-head">
            <div>
              <p className="igos-kicker">GoldnSilver.shop · SafeGold</p>
              <h1>Sale Summary</h1>
              <p className="igos-sub">Physical gold sale confirmation</p>
            </div>
            <div className="igos-status">Sale successful</div>
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
            <p>
              Your gold has been debited from the SafeGold vault. Keep this summary for your records.
              For support, write to support@goldnsilver.shop.
            </p>
            <p className="igos-generated">Generated {formatDateTime(new Date())}</p>
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
    </div>
  );
};

export default InvestGoldSaleSummaryPage;
