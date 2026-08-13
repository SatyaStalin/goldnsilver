/** Catalogue stock as a non-negative integer. Missing or invalid values count as 0. */
export function productStock(productOrStock) {
  const raw =
    productOrStock != null && typeof productOrStock === 'object'
      ? productOrStock.stock
      : productOrStock;
  const n = Number(raw);
  return Number.isFinite(n) && n > 0 ? Math.floor(n) : 0;
}

export function isInStock(productOrStock) {
  return productStock(productOrStock) > 0;
}

export function remainingStock(productOrStock, cartQty = 0) {
  return Math.max(0, productStock(productOrStock) - Number(cartQty || 0));
}

export function atStockLimit(productOrStock, cartQty = 0) {
  return remainingStock(productOrStock, cartQty) <= 0;
}

export function clampToStock(qty, productOrStock) {
  const stock = productStock(productOrStock);
  if (stock <= 0) return 1;
  const n = Number(qty);
  const next = Number.isFinite(n) ? n : 1;
  return Math.min(Math.max(1, next), stock);
}
