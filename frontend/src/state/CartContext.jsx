import React, {
  createContext,
  useContext,
  useMemo,
  useState,
  useCallback,
  useEffect,
  useRef
} from 'react';
import { productService, cartService } from '../services/api';
import { productStock } from '../utils/stock';
import { useAuth } from './AuthContext';

const CartContext = createContext(null);

const LOCAL_CART_KEY = 'gs_cart';
const MONGO_ID_HEX = /^[a-f\d]{24}$/i;

/** Cart lines from the API use MongoDB ObjectId strings; static marketing pages use ids like gold-0. */
function catalogIdFromCartItem(item) {
  const raw = item.productId ?? item.id;
  const key = raw != null ? String(raw).trim() : '';
  return MONGO_ID_HEX.test(key) ? key : null;
}

function readLocalCart() {
  try {
    const raw = localStorage.getItem(LOCAL_CART_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeLocalCart(items) {
  try {
    localStorage.setItem(LOCAL_CART_KEY, JSON.stringify(items));
  } catch {
    /* ignore quota / private mode */
  }
}

function clearLocalCart() {
  try {
    localStorage.removeItem(LOCAL_CART_KEY);
  } catch {
    /* ignore */
  }
}

/** Merge by line id — keep higher quantity (stock-capped). */
function mergeCartItems(a, b) {
  const map = new Map();
  for (const item of [...(a || []), ...(b || [])]) {
    if (!item?.id) continue;
    const stock = productStock(item);
    const qty = Math.max(1, Number(item.quantity) || 1);
    const existing = map.get(item.id);
    if (!existing) {
      map.set(item.id, {
        ...item,
        quantity: stock > 0 ? Math.min(qty, stock) : qty,
        stock
      });
      continue;
    }
    const mergedQty = Math.max(existing.quantity, qty);
    map.set(item.id, {
      ...existing,
      ...item,
      quantity: stock > 0 ? Math.min(mergedQty, stock) : mergedQty,
      stock: stock || existing.stock
    });
  }
  return Array.from(map.values());
}

export const CartProvider = ({ children }) => {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const [items, setItems] = useState(() => readLocalCart());
  const [ready, setReady] = useState(false);
  const skipNextPersist = useRef(false);
  const persistTimer = useRef(null);

  /** Load / merge server cart when user logs in; keep local for guests. */
  useEffect(() => {
    if (authLoading) return undefined;

    let cancelled = false;

    const hydrate = async () => {
      const local = readLocalCart();

      if (!isAuthenticated) {
        skipNextPersist.current = true;
        setItems(local);
        setReady(true);
        return;
      }

      try {
        const { data } = await cartService.get();
        const serverItems = Array.isArray(data?.items) ? data.items : [];
        const merged = mergeCartItems(local, serverItems);

        if (cancelled) return;

        skipNextPersist.current = true;
        setItems(merged);
        writeLocalCart(merged);

        // Persist merge so DB matches browser after login
        await cartService.save(merged);
      } catch {
        if (cancelled) return;
        skipNextPersist.current = true;
        setItems(local);
      } finally {
        if (!cancelled) setReady(true);
      }
    };

    setReady(false);
    hydrate();

    return () => {
      cancelled = true;
    };
  }, [authLoading, isAuthenticated]);

  /** Persist to localStorage always; debounce save to DB when logged in. */
  useEffect(() => {
    if (!ready) return undefined;
    if (skipNextPersist.current) {
      skipNextPersist.current = false;
      return undefined;
    }

    writeLocalCart(items);

    if (!isAuthenticated) return undefined;

    if (persistTimer.current) clearTimeout(persistTimer.current);
    persistTimer.current = setTimeout(() => {
      cartService.save(items).catch(() => {
        /* keep local; retry on next change */
      });
    }, 400);

    return () => {
      if (persistTimer.current) clearTimeout(persistTimer.current);
    };
  }, [items, ready, isAuthenticated]);

  /** Refetch catalogue prices/stock so cart reflects admin updates (e.g. gold rates). */
  const syncCartPrices = useCallback(async () => {
    try {
      const { data } = await productService.getAll();
      const catalog = Array.isArray(data) ? data : data?.products ?? [];
      if (!Array.isArray(catalog) || catalog.length === 0) return;
      const byId = new Map(catalog.map((p) => [String(p._id), p]));
      setItems((prev) => {
        let changed = false;
        const next = prev.map((item) => {
          const pid = catalogIdFromCartItem(item);
          if (!pid) return item;
          const p = byId.get(pid);
          if (!p) return item;
          const newPrice = Number(p.pricePerUnit ?? p.price ?? 0);
          const newStock = p.stock ?? item.stock;
          const newName = p.name ?? item.name;
          const newImageUrl = p.imageUrl ?? item.imageUrl;
          if (
            Number(item.price) === newPrice &&
            item.stock === newStock &&
            item.name === newName &&
            item.imageUrl === newImageUrl
          ) {
            return item;
          }
          changed = true;
          return {
            ...item,
            price: newPrice,
            stock: newStock,
            name: newName,
            imageUrl: newImageUrl
          };
        });
        return changed ? next : prev;
      });
    } catch {
      // keep existing cart prices if catalogue is unreachable
    }
  }, []);

  const addToCart = useCallback((product) => {
    setItems((prev) => {
      const stock = productStock(product);
      const existing = prev.find((p) => p.id === product.id);
      if (existing) {
        const newQuantity = existing.quantity + 1;
        if (newQuantity > stock) return prev;
        return prev.map((p) =>
          p.id === product.id ? { ...p, quantity: newQuantity, stock } : p
        );
      }
      if (stock < 1) return prev;
      return [...prev, { ...product, quantity: 1, stock, imageUrl: product.imageUrl }];
    });
  }, []);

  const removeFromCart = useCallback((id) => {
    setItems((prev) => prev.filter((p) => p.id !== id));
  }, []);

  const updateQuantity = useCallback((id, quantity) => {
    setItems((prev) =>
      prev.map((item) => {
        if (item.id !== id) return item;
        const stock = productStock(item);
        if (stock < 1) return { ...item, quantity: 1 };
        const nextQty = Math.max(1, Number(quantity) || 1);
        return { ...item, quantity: Math.min(nextQty, stock) };
      })
    );
  }, []);

  const clearCart = useCallback(() => {
    skipNextPersist.current = true;
    setItems([]);
    clearLocalCart();
    if (isAuthenticated) {
      cartService.clear().catch(() => {
        /* ignore — local already cleared */
      });
    }
  }, [isAuthenticated]);

  const totalItems = useMemo(
    () => items.reduce((sum, item) => sum + item.quantity, 0),
    [items]
  );

  const totalAmount = useMemo(
    () => items.reduce((sum, item) => sum + item.quantity * (item.price || 0), 0),
    [items]
  );

  const value = {
    items,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    syncCartPrices,
    totalItems,
    totalAmount,
    cartReady: ready
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) {
    throw new Error('useCart must be used within CartProvider');
  }
  return ctx;
};
