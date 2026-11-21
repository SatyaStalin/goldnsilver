import { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { productService } from '../services/api';
import { isMmtcCatalog } from '../utils/mmtcCatalog';
import { ownProductPath } from '../utils/ownProductPath';
import { isInStock, productStock } from '../utils/stock';
import './PageShell.css';
import './SearchPage.css';

const TYPE_LABELS = {
  digital: 'Digital',
  physical_coin: 'Coin',
  physical_bar: 'Bar',
  gifting: 'Gift',
  sip: 'SIP',
  fund: 'Fund',
  etf: 'ETF',
  sovereign_bond: 'Sovereign bond'
};

function metalLabel(metal) {
  if (metal === 'gold+silver') return 'Gold + Silver';
  if (metal === 'silver') return 'Silver';
  if (metal === 'gold') return 'Gold';
  return metal || '';
}

function productHref(product) {
  if (isMmtcCatalog(product)) return `/own-mmtc-pamp/${product.slug || product._id}`;
  return ownProductPath(product);
}

const SearchPage = () => {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const q = String(params.get('q') || '').trim();
  const [draft, setDraft] = useState(q);
  const [products, setProducts] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setDraft(q);
  }, [q]);

  useEffect(() => {
    if (!q) {
      setProducts([]);
      setTotal(0);
      setFailed(false);
      setLoading(false);
      return undefined;
    }
    let cancelled = false;
    (async () => {
      setLoading(true);
      setFailed(false);
      try {
        const { data } = await productService.getAll({
          q,
          catalog: 'all',
          limit: 100,
          page: 1
        });
        if (cancelled) return;
        const list = Array.isArray(data) ? data : data?.products ?? [];
        setProducts(list);
        setTotal(Number(data?.pagination?.totalItems) || list.length);
      } catch {
        if (!cancelled) {
          setProducts([]);
          setTotal(0);
          setFailed(true);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [q]);

  const submit = (e) => {
    e.preventDefault();
    const next = draft.trim();
    if (!next) return;
    navigate(`/search?q=${encodeURIComponent(next)}`);
  };

  const showEtf = /\betfs?\b/i.test(q);

  return (
    <div className="gs-page search-page">
      <section className="gs-section search-page-section">
        <h1>Search products</h1>
        <form className="search-page-form" onSubmit={submit}>
          <input
            type="search"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="Search coins, bars, gifts…"
            aria-label="Search products"
          />
          <button type="submit">Search</button>
        </form>

        {q && (
          <p className="search-page-summary">
            {loading
              ? `Searching for “${q}”…`
              : failed
                ? `Could not load results for “${q}”.`
                : `${total} product${total === 1 ? '' : 's'} for “${q}”`}
          </p>
        )}

        {!q && <p className="search-page-summary">Enter a product name, metal, or type.</p>}

        {showEtf && (
          <p className="search-page-note">
            Looking for exchange-traded funds?{' '}
            <Link to="/zerodha-integration">Open Gold and Silver ETFs</Link>
          </p>
        )}

        {!loading && q && !failed && products.length === 0 && (
          <p className="search-page-empty">No products match that search. Try a shorter name, such as gold, silver, coin, or bar.</p>
        )}

        <div className="search-page-grid">
          {products.map((product) => {
            const href = productHref(product);
            const price = Number(product.pricePerUnit ?? product.price ?? 0);
            const title = product.displayName || product.name;
            const stock = productStock(product);
            return (
              <article key={String(product._id || product.slug)} className="search-card">
                <Link to={href} className="search-card-media">
                  {product.imageUrl ? (
                    <img src={product.imageUrl} alt={title} />
                  ) : (
                    <span>No image</span>
                  )}
                </Link>
                <p className="search-card-meta">
                  <span>{metalLabel(product.metal)}</span>
                  {product.type && <span>{TYPE_LABELS[product.type] || product.type}</span>}
                  {isMmtcCatalog(product) && <span>MMTC-PAMP</span>}
                </p>
                <h2>
                  <Link to={href}>{title}</Link>
                </h2>
                <p className="search-card-price">
                  ₹{price.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
                <p className={`search-card-stock${isInStock(product) ? '' : ' is-out'}`}>
                  {isInStock(product) ? `${stock} in stock` : 'Out of stock'}
                </p>
                <Link to={href} className="search-card-view">
                  View product
                </Link>
              </article>
            );
          })}
        </div>
      </section>
    </div>
  );
};

export default SearchPage;
