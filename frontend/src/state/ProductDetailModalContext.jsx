import { createContext, useCallback, useContext, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { isMmtcCatalog } from '../utils/mmtcCatalog';
import { ownProductPath } from '../utils/ownProductPath';

const ProductDetailModalContext = createContext(undefined);

export function ProductDetailModalProvider({ children }) {
  const navigate = useNavigate();
  const openProductDetail = useCallback(
    (p) => {
      if (!p) return;
      if (isMmtcCatalog(p)) {
        navigate(`/own-mmtc-pamp/${p.slug || p._id || p.id}`);
        return;
      }
      navigate(ownProductPath(p));
    },
    [navigate]
  );
  const closeProductDetail = useCallback(() => {}, []);

  const value = useMemo(
    () => ({ openProductDetail, closeProductDetail }),
    [openProductDetail, closeProductDetail]
  );

  return (
    <ProductDetailModalContext.Provider value={value}>{children}</ProductDetailModalContext.Provider>
  );
}

export function useProductDetailModal() {
  const ctx = useContext(ProductDetailModalContext);
  if (ctx === undefined) {
    throw new Error('useProductDetailModal must be used within ProductDetailModalProvider');
  }
  return ctx;
}
