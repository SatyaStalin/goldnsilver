import { useEffect, useState } from 'react';
import { Link, Navigate, useLocation, useParams } from 'react-router-dom';
import ProductDetailModal from '../components/ProductDetailModal';
import { productService } from '../services/api';
import { isMmtcCatalog } from '../utils/mmtcCatalog';
import './PageShell.css';
import './OwnMmtcPampProductPage.css';
import './OwnProductPage.css';

const OwnProductPage = () => {
  const { productId } = useParams();
  const { pathname } = useLocation();
  const listPath = pathname.startsWith('/own-gifting') ? '/own-gifting' : '/own-gold';

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [missing, setMissing] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setMissing(false);
      setProduct(null);
      try {
        const { data } = await productService.getBySlug(decodeURIComponent(productId || ''));
        if (cancelled) return;
        if (!data || data.isActive === false) {
          setMissing(true);
          return;
        }
        setProduct(data);
      } catch {
        if (!cancelled) setMissing(true);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [productId]);

  if (loading) {
    return (
      <div className="gs-page mmtc-pd-page own-pd-page">
        <p className="own-pd-status">Loading product…</p>
      </div>
    );
  }

  if (missing || !product) {
    return <Navigate to={listPath} replace />;
  }

  if (isMmtcCatalog(product)) {
    return <Navigate to={`/own-mmtc-pamp/${product.slug || product._id}`} replace />;
  }

  return (
    <div className="gs-page mmtc-pd-page own-pd-page">
      <section className="gs-section mmtc-pd" aria-label="Product details">
        <p className="own-pd-back">
          <Link to={listPath}>← Back to products</Link>
        </p>
        <ProductDetailModal product={product} page />
      </section>
    </div>
  );
};

export default OwnProductPage;
