const {
  SafeGoldApiError,
  useMock,
  fetchBuyPrice,
  fetchSellPrice,
  sellVerify,
  sellConfirm,
  sellStatus,
  executeSell,
  registerCustomer,
  fetchCustomerBalance,
  fetchCustomerTransactions,
  transferGold,
  getOrderStatus,
  fetchInvoice,
  getSafeGoldConfig,
  testConnection
} = require('./safegoldApi');

const MIN_BUY_INR = Number(process.env.SAFEGOLD_MIN_INR) || 1000;
const MAX_BUY_INR = Number(process.env.SAFEGOLD_MAX_INR) || 500000;
/** SafeGold sell docs: minimum sell value should be ₹10 */
const MIN_SELL_INR = Number(process.env.SAFEGOLD_MIN_SELL_INR) || 10;

function round2(value) {
  return Math.round(Number(value) * 100) / 100;
}

function roundDown(value, decimals) {
  const factor = 10 ** decimals;
  return Math.floor(Number(value) * factor) / factor;
}

function roundUp2(value) {
  const n = Number(value);
  return Math.ceil(n * 100) / 100;
}

function calculateQuote(priceData, mode, value) {
  const currentPrice = round2(priceData.current_price);
  const applicableTax = Number(priceData.applicable_tax) || 3;
  const taxMultiplier = 1 + applicableTax / 100;
  // Round GST/g first, then add — keeps excl + GST = incl with no 1-paisa drift
  const gstPerGram = round2(currentPrice * (applicableTax / 100));
  const rateInclGst = round2(currentPrice + gstPerGram);

  let goldAmount;
  let buyPrice;

  if (mode === 'grams') {
    goldAmount = roundDown(value, 4);
    if (goldAmount <= 0) {
      throw new Error('Enter a valid gold amount in grams');
    }
    buyPrice = roundUp2(goldAmount * rateInclGst);
    if (buyPrice < MIN_BUY_INR) {
      throw new Error(`Minimum buy amount is ₹${MIN_BUY_INR}`);
    }
    if (buyPrice > MAX_BUY_INR) {
      throw new Error(`Maximum buy amount is ₹${MAX_BUY_INR.toLocaleString('en-IN')}`);
    }
  } else {
    buyPrice = roundUp2(value);
    if (buyPrice < MIN_BUY_INR) {
      throw new Error(`Minimum buy amount is ₹${MIN_BUY_INR}`);
    }
    if (buyPrice > MAX_BUY_INR) {
      throw new Error(`Maximum buy amount is ₹${MAX_BUY_INR.toLocaleString('en-IN')}`);
    }
    goldAmount = roundDown(buyPrice / rateInclGst, 4);
    if (goldAmount <= 0) {
      throw new Error('Amount is too low for the current gold rate');
    }
  }

  // Split payable amount into excl. GST + GST (exact 3% of excl) so they always
  // add up to buyPrice. No separate rounding adjustment line.
  // e.g. ₹1000 → excl ₹970.87 + GST ₹29.13
  const goldValueExclGst = round2(buyPrice / taxMultiplier);
  const gstAmount = round2(buyPrice - goldValueExclGst);
  const quoteSubtotal = round2(goldValueExclGst + gstAmount);

  return {
    rateId: String(priceData.rate_id),
    currentPrice,
    applicableTax,
    rateInclGst,
    gstPerGram,
    goldAmount,
    buyPrice,
    gstAmount,
    goldValueExclGst,
    quoteSubtotal,
    roundingAdjustment: 0,
    taxMultiplier,
    expiresAt: priceData.expiresAt,
    source: priceData.source
  };
}

/**
 * Sell quotes use the live sell rate. GST is not charged on digital gold sale.
 * `sellableGrams` is required so the quote cannot exceed vault holdings.
 */
function calculateSellQuote(priceData, mode, value, sellableGrams) {
  const currentPrice = round2(priceData.current_price);
  if (!Number.isFinite(currentPrice) || currentPrice <= 0) {
    throw new Error('Sell rate is unavailable. Please refresh and try again.');
  }

  const available = roundDown(Number(sellableGrams) || 0, 4);
  if (available <= 0) {
    throw new Error('You have no sellable gold balance. Buy gold first.');
  }

  let goldAmount;
  let sellPrice;

  if (mode === 'grams') {
    goldAmount = roundDown(value, 4);
    if (goldAmount <= 0) {
      throw new Error('Enter a valid gold amount in grams');
    }
    sellPrice = round2(goldAmount * currentPrice);
  } else {
    // SafeGold docs: customers must not enter decimal values in the rupee field
    const inrValue = Number(value);
    if (!Number.isFinite(inrValue) || inrValue <= 0) {
      throw new Error('Enter a valid amount');
    }
    if (!Number.isInteger(inrValue)) {
      throw new Error('Enter a whole rupee amount (no decimals)');
    }
    sellPrice = inrValue;
    goldAmount = roundDown(sellPrice / currentPrice, 4);
    if (goldAmount <= 0) {
      throw new Error('Amount is too low for the current gold sell rate');
    }
    sellPrice = round2(goldAmount * currentPrice);
  }

  if (goldAmount > available + 0.00005) {
    const err = new Error(
      `Insufficient gold balance. You can sell up to ${available.toFixed(4)} g.`
    );
    err.code = 'INSUFFICIENT_BALANCE';
    throw err;
  }

  if (sellPrice < MIN_SELL_INR) {
    throw new Error(`Minimum sell amount is ₹${MIN_SELL_INR}`);
  }

  return {
    rateId: String(priceData.rate_id),
    currentPrice,
    applicableTax: 0,
    rateInclGst: currentPrice,
    gstPerGram: 0,
    goldAmount,
    sellPrice,
    buyPrice: sellPrice,
    gstAmount: 0,
    goldValueExclGst: sellPrice,
    quoteSubtotal: sellPrice,
    roundingAdjustment: 0,
    taxMultiplier: 1,
    sellableGrams: available,
    expiresAt: priceData.expiresAt,
    source: priceData.source
  };
}

module.exports = {
  MIN_BUY_INR,
  MAX_BUY_INR,
  MIN_SELL_INR,
  SafeGoldApiError,
  useMock,
  fetchBuyPrice,
  fetchSellPrice,
  calculateQuote,
  calculateSellQuote,
  sellVerify,
  sellConfirm,
  sellStatus,
  executeSell,
  registerCustomer,
  fetchCustomerBalance,
  fetchCustomerTransactions,
  transferGold,
  getOrderStatus,
  fetchInvoice,
  getSafeGoldConfig,
  testConnection
};
