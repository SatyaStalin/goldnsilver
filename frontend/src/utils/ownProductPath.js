/** Catalogue page for an own-gold or own-gifting product. */
export function ownProductPath(product) {
  const id = product?.slug || product?._id || product?.id;
  if (!id) return '/own-gold';
  const type = String(product?.type || '').toLowerCase();
  const base = type === 'gifting' ? '/own-gifting' : '/own-gold';
  return `${base}/${encodeURIComponent(String(id))}`;
}
