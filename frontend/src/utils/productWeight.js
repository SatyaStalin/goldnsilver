/** Product weight is stored as grams. Milligrams are a display and entry unit. */

export function normalizeWeightUnit(value) {
  const s = String(value || '').trim().toLowerCase();
  if (s === 'mg' || s === 'milligram' || s === 'milligrams') return 'mg';
  return 'g';
}

export function gramsFromEnteredWeight(amount, unit) {
  const n = Number(amount);
  if (!Number.isFinite(n) || n < 0) return 0;
  const grams = normalizeWeightUnit(unit) === 'mg' ? n / 1000 : n;
  return Math.round(grams * 1e6) / 1e6;
}

export function enteredWeightFromGrams(grams, unit) {
  const g = Number(grams);
  if (!Number.isFinite(g)) return 0;
  if (normalizeWeightUnit(unit) === 'mg') return Math.round(g * 1000 * 1000) / 1000;
  return g;
}

function trimWeight(n) {
  const rounded = Math.round(Number(n) * 1000) / 1000;
  if (!Number.isFinite(rounded)) return '0';
  return Number.isInteger(rounded) ? String(rounded) : String(rounded);
}

/** "50 mg" or "10 g". Empty when there is no positive weight. */
export function formatProductWeight(product) {
  const grams = Number(product?.metalGrams ?? product?.weightGrams) || 0;
  if (!(grams > 0)) return '';
  if (normalizeWeightUnit(product?.weightUnit) === 'mg') {
    return `${trimWeight(grams * 1000)} mg`;
  }
  return `${trimWeight(grams)} g`;
}
