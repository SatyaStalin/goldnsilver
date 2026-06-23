const {
  SafeGoldApiError,
  useMock,
  fetchBuyPrice,
  registerCustomer,
  fetchCustomerBalance,
  fetchCustomerTransactions,
  transferGold,
  getOrderStatus,
  getSafeGoldConfig
} = require('./safegoldApi');

const MIN_BUY_INR = Number(process.env.SAFEGOLD_MIN_INR) || 10;
const MAX_BUY_INR = Number(process.env.SAFEGOLD_MAX_INR) || 500000;

function round2(value) {
  return Math.round(Number(value) * 100) / 100;
}

function roundDown(value, decimals) {
  const factor = 10 ** decimals;
  return Math.floor(Number(value) * factor) / factor;
}

function calculateQuote(priceData, mode, value) {
  const currentPrice = round2(priceData.current_price);
  const applicableTax = Number(priceData.applicable_tax) || 3;
  const taxMultiplier = 1 + applicableTax / 100;
  const rateInclGst = round2(currentPrice * taxMultiplier);
  const gstPerGram = round2(currentPrice * (applicableTax / 100));

  let goldAmount;
  let buyPrice;

  if (mode === 'grams') {
    goldAmount = roundDown(value, 4);
    if (goldAmount <= 0) {
      throw new Error('Enter a valid gold amount in grams');
    }
    buyPrice = round2(goldAmount * rateInclGst);
    if (buyPrice < MIN_BUY_INR) {
      throw new Error(`Minimum buy amount is ₹${MIN_BUY_INR}`);
    }
    if (buyPrice > MAX_BUY_INR) {
      throw new Error(`Maximum buy amount is ₹${MAX_BUY_INR.toLocaleString('en-IN')}`);
    }
  } else {
    buyPrice = round2(value);
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

  const goldValueExclGst = round2(goldAmount * currentPrice);
  const gstAmount = round2(buyPrice - goldValueExclGst);

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
    expiresAt: priceData.expiresAt,
    source: priceData.source
  };
}

module.exports = {
  MIN_BUY_INR,
  MAX_BUY_INR,
  SafeGoldApiError,
  useMock,
  fetchBuyPrice,
  calculateQuote,
  registerCustomer,
  fetchCustomerBalance,
  fetchCustomerTransactions,
  transferGold,
  getOrderStatus,
  getSafeGoldConfig
};
