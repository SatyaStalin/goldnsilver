import React, { createContext, useContext, useMemo, useState, useCallback } from 'react';
import { productService } from '../services/api';

const CartContext = createContext(null);

/** Cart lines from the API use MongoDB ObjectId strings; static marketing pages use ids like gold-0. */
const MONGO_ID_HEX = /^[a-f\d]{24}$/i;

function catalogIdFromCartItem(item) {
  const raw = item.productId ?? item.id;
  const key = raw != null ? String(raw).trim() : '';
  return MONGO_ID_HEX.test(key) ? key : null;
}

export const CartProvider = ({ children }) => {
  const [items, setItems] = useState([]);

  /** Refetch catalogue prices/stock so cart reflects admin updates (e.g. gold rates). */
  const syncCartPrices = useCallback(async () => {
    try {
      const { data } = await productService.getAll();
      if (!Array.isArray(data) || data.length === 0) return;
      const byId = new Map(data.map((p) => [String(p._id), p]));
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

  const addToCart = (product) => {
    setItems((prev) => {
      const existing = prev.find((p) => p.id === product.id);
      if (existing) {
        const newQuantity = existing.quantity + 1;
        // Check stock limit
        if (product.stock && newQuantity > product.stock) {
          return prev; // Don't add if exceeds stock
        }
        return prev.map((p) =>
          p.id === product.id ? { ...p, quantity: newQuantity } : p
        );
      }
      // Check stock for new item
      if (product.stock && product.stock < 1) {
        return prev; // Don't add if out of stock
      }
      return [...prev, { ...product, quantity: 1, imageUrl: product.imageUrl }];
    });
  };

  const removeFromCart = (id) => {
    setItems((prev) => prev.filter((p) => p.id !== id));
  };

  const updateQuantity = (id, quantity) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, quantity: Math.max(1, quantity) } : item
      )
    );
  };

  const clearCart = () => setItems([]);

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
    totalAmount
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

