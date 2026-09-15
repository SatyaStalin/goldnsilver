const PHYSICAL_GOLD_TYPES = ['physical_coin', 'physical_bar', 'gifting'];

export function isPhysicalGoldProduct(product) {
  if (!product) return false;
  const metal = String(product.metal || '').toLowerCase();
  if (metal !== 'gold') return false;
  const type = String(product.type || '');
  if (!type) return true;
  return PHYSICAL_GOLD_TYPES.includes(type);
}

export function cartHasPhysicalGold(items) {
  return (items || []).some((item) => isPhysicalGoldProduct(item));
}

export function toCartItem(product) {
  const pid = String(product?._id || product?.id || product?.productId || '');
  return {
    id: pid,
    productId: pid,
    name: product.name,
    price: Number(product.pricePerUnit ?? product.price ?? 0),
    imageUrl: product.imageUrl || product.image,
    metal: product.metal,
    type: product.type,
    metalGrams: Number(product.metalGrams) || 0,
    stock: Number(product.stock) || 0
  };
}
