import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import ProductDetailModal from '../components/ProductDetailModal';

const ProductDetailModalContext = createContext(undefined);

export function ProductDetailModalProvider({ children }) {
  const [product, setProduct] = useState(null);
  const openProductDetail = useCallback((p) => {
    if (p) setProduct(p);
  }, []);
  const closeProductDetail = useCallback(() => setProduct(null), []);

  useEffect(() => {
    if (!product) return undefined;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [product]);

  const value = useMemo(
    () => ({ openProductDetail, closeProductDetail }),
    [openProductDetail, closeProductDetail]
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
