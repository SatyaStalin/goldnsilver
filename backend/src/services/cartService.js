const Cart = require('../models/Cart');

const MONGO_ID_HEX = /^[a-f\d]{24}$/i;

function normalizeCartItems(rawItems) {
  if (!Array.isArray(rawItems)) return [];

  const byId = new Map();

  for (const raw of rawItems) {
    if (!raw || typeof raw !== 'object') continue;
    const id = String(raw.id ?? raw.productId ?? '').trim();
    if (!id) continue;

    const quantity = Math.max(1, Math.floor(Number(raw.quantity) || 1));
    const stock = Math.max(0, Number(raw.stock) || 0);
    const cappedQty = stock > 0 ? Math.min(quantity, stock) : quantity;
    const price = Number(raw.price);
    if (!Number.isFinite(price) || price < 0) continue;

    const name = String(raw.name || '').trim() || 'Product';
    const productId = raw.productId ?? raw.product ?? (MONGO_ID_HEX.test(id) ? id : null);
    const product =
      productId && MONGO_ID_HEX.test(String(productId)) ? String(productId) : null;

    const existing = byId.get(id);
    if (existing) {
      const mergedQty = Math.max(existing.quantity, cappedQty);
      existing.quantity = stock > 0 ? Math.min(mergedQty, stock) : mergedQty;
      existing.price = price;
      existing.stock = stock || existing.stock;
      existing.name = name;
      existing.imageUrl = String(raw.imageUrl || existing.imageUrl || '');
      existing.metal = String(raw.metal || existing.metal || '');
      if (product) existing.product = product;
      continue;
    }

    byId.set(id, {
      id,
      product,
      name,
      price,
      quantity: cappedQty,
      stock,
      imageUrl: String(raw.imageUrl || ''),
      metal: String(raw.metal || '')
    });
  }

  return Array.from(byId.values());
}

function toClientItems(cart) {
  const items = cart?.items || [];
  return items.map((item) => ({
    id: item.id,
    productId: item.product ? String(item.product) : undefined,
    name: item.name,
    price: item.price,
    quantity: item.quantity,
    stock: item.stock,
    imageUrl: item.imageUrl || undefined,
    metal: item.metal || undefined
  }));
}

async function getCartForUser(userId) {
  const cart = await Cart.findOne({ user: userId });
  return cart || { user: userId, items: [] };
}

async function saveCartForUser(userId, items) {
  const normalized = normalizeCartItems(items);
  const cart = await Cart.findOneAndUpdate(
    { user: userId },
    { $set: { items: normalized } },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );
  return cart;
}

async function clearCartForUser(userId) {
  if (!userId) return;
  await Cart.findOneAndUpdate(
    { user: userId },
    { $set: { items: [] } },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );
}

/** Merge two cart item lists by id — keep higher qty (stock-capped). */
function mergeCartItems(localItems, serverItems) {
  return normalizeCartItems([...(serverItems || []), ...(localItems || [])]);
}

module.exports = {
  normalizeCartItems,
  toClientItems,
  getCartForUser,
  saveCartForUser,
  clearCartForUser,
  mergeCartItems
};
