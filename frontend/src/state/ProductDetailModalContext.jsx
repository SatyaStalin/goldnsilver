import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ProductDetailModal from '../components/ProductDetailModal';
import { isMmtcCatalog } from '../utils/mmtcCatalog';
import { ownProductPath } from '../utils/ownProductPath';

const ProductDetailModalContext = createContext(undefined);

function productPagePath(product) {
  if (isMmtcCatalog(product) || product?.catalog === 'mmtc') {
    const id = product?.slug || product?._id || product?.id;
    return `/own-mmtc-pamp/${id || ''}`;
  }
  return ownProductPath(product);
}

export function ProductDetailModalProvider({ children }) {
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);

  const openProductDetail = useCallback((p) => {
    if (!p) return;
    setProduct(p);
  }, []);

  const closeProductDetail = useCallback(() => {
    setProduct(null);
  }, []);

  const openProductPage = useCallback(
    (p) => {
      if (!p) return;
      setProduct(null);
      navigate(productPagePath(p));
    },
    [navigate]
  );

  const value = useMemo(
    () => ({ openProductDetail, closeProductDetail, openProductPage }),
    [openProductDetail, closeProductDetail, openProductPage]
  );

  return (
    <ProductDetailModalContext.Provider value={value}>
      {children}
      <ProductDetailModal product={product} onClose={closeProductDetail} />
    </ProductDetailModalContext.Provider>
  );
}

export function useProductDetailModal() {
  const ctx = useContext(ProductDetailModalContext);
  if (ctx === undefined) {
    throw new Error('useProductDetailModal must be used within ProductDetailModalProvider');
  }
  return ctx;
}
