const PHYSICAL_SHIPMENT_TYPES = ['physical_coin', 'physical_bar', 'gifting'];
const PHYSICAL_SHIPMENT_METALS = ['gold', 'silver', 'gold+silver'];

export function isPhysicalShipmentProduct(product) {
  if (!product) return false;
  const metal = String(product.metal || '').toLowerCase();
  if (metal && !PHYSICAL_SHIPMENT_METALS.includes(metal)) return false;
  const type = String(product.type || '');
  if (!type) return Boolean(metal);
  return PHYSICAL_SHIPMENT_TYPES.includes(type);
}

export function isPhysicalGoldProduct(product) {
  return isPhysicalShipmentProduct(product);
}

export function cartHasPhysicalGold(items) {
  return (items || []).some((item) => isPhysicalShipmentProduct(item));
}

export function orderNeedsSequel(order) {
  if (order?.requiresSequelShipment) return true;
  return (order?.items || []).some((item) =>
    isPhysicalShipmentProduct({
      metal: item.metal || item.product?.metal,
      type: item.type || item.product?.type
    })
  );
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
