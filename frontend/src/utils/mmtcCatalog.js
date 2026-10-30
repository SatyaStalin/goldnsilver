export function isMmtcCatalog(product) {
  return product?.catalog === 'mmtc-pamp';
}

export function isOwnCatalog(product) {
  return !isMmtcCatalog(product);
}

/** Order and cart label: mmtc or own. */
export function catalogTypeKey(product) {
  const value = product?.catalog;
  if (value === 'mmtc' || value === 'mmtc-pamp') return 'mmtc';
  return 'own';
}

export function mmtcTags(product) {
  if (Array.isArray(product?.tags) && product.tags.length) return product.tags;
  return String(product?.category || '')
    .split(',')
    .map((part) => part.trim())
    .filter(Boolean);
}

/** Shape an API product the way the MMTC shop cards and detail page read it. */
export function mmtcView(product) {
  const weight = Number(product?.metalGrams ?? product?.weightGrams) || 0;
  return {
    ...product,
    id: product?.slug || String(product?._id || ''),
    price: Number(product?.pricePerUnit ?? product?.price ?? 0),
    weightGrams: weight,
    weightOptions: product?.weightOptions?.length ? product.weightOptions : [weight],
    category: mmtcTags(product),
    displayName: product?.displayName || product?.name || '',
    imageUrl: product?.imageUrl || ''
  };
}
