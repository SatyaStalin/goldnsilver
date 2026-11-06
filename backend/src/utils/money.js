/** Rupees to 2 decimal places. Drops float noise such as 24952.800000000003. */
function roundInr(value) {
  const n = Number(value);
  if (!Number.isFinite(n)) return 0;
  return Number(n.toFixed(2));
}

function lineTotalInr(price, quantity) {
  return roundInr((Number(price) || 0) * (Number(quantity) || 1));
}

/** Cashfree account limit for one physical or MMTC-PAMP checkout. */
const CASHFREE_MAX_PRODUCT_INR = 50000;

function cashfreeProductLimitMessage() {
  return 'Online payment for physical gold, silver, and MMTC-PAMP products can be at most ₹50,000 in one order. Reduce the quantity or place the products in more than one order.';
}

module.exports = {
  roundInr,
  lineTotalInr,
  CASHFREE_MAX_PRODUCT_INR,
  cashfreeProductLimitMessage
};
