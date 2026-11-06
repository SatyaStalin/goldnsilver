/** Rupees to 2 decimal places. Drops float noise such as 24952.800000000003. */
function roundInr(value) {
  const n = Number(value);
  if (!Number.isFinite(n)) return 0;
  return Number(n.toFixed(2));
}

function lineTotalInr(price, quantity) {
  return roundInr((Number(price) || 0) * (Number(quantity) || 1));
}

module.exports = { roundInr, lineTotalInr };
