const SafeGoldCustomer = require('../models/SafeGoldCustomer');
const SafeGoldWallet = require('../models/SafeGoldWallet');
const SafeGoldTransaction = require('../models/SafeGoldTransaction');
const {
  SafeGoldApiError,
  registerCustomer,
  fetchCustomerBalance,
  fetchCustomerTransactions
} = require('./safegoldApi');

function normalizeMobile(mobile) {
  return String(mobile || '').replace(/\D/g, '').slice(-10);
}

function round4(value) {
  return Math.round(Number(value) * 10000) / 10000;
}

async function getOrCreateWallet(userId) {
  let wallet = await SafeGoldWallet.findOne({ user: userId });
  if (!wallet) {
    wallet = await SafeGoldWallet.create({ user: userId, balanceGrams: 0 });
  }
  return wallet;
}

async function getCustomerMapping(userId) {
  return SafeGoldCustomer.findOne({ user: userId });
}

async function ensureSafeGoldCustomer(user) {
  const partnerUserId = user._id.toString();
  const mobile = normalizeMobile(user.mobile);
  const name = String(user.name || '').trim();

  let mapping = await SafeGoldCustomer.findOne({ user: user._id });
  if (!mapping) {
    mapping = await SafeGoldCustomer.create({
      user: user._id,
      partnerUserId,
      name,
      phoneNo: mobile,
      status: 'pending'
    });
  } else {
    mapping.name = name || mapping.name;
    mapping.phoneNo = mobile || mapping.phoneNo;
  }

  if (mapping.safegoldCustomerId && mapping.status === 'active') {
    await mapping.save();
    return mapping;
  }

  if (!name) {
    throw new SafeGoldApiError(
      'Please update your name in profile before using SafeGold',
      'PROFILE_INCOMPLETE',
      400
    );
  }
  if (mobile.length !== 10) {
    throw new SafeGoldApiError(
      'Please add a valid 10-digit mobile number in your profile',
      'PROFILE_INCOMPLETE',
      400
    );
  }

  try {
    const pinCode = user.pinCode || process.env.SAFEGOLD_DEFAULT_PIN_CODE;
    const result = await registerCustomer({
      name,
      phoneNo: mobile,
      email: user.email,
      pinCode
    });
    if (result.customer_user_id) {
      mapping.safegoldCustomerId = result.customer_user_id;
      mapping.status = 'active';
      mapping.registeredAt = mapping.registeredAt || new Date();
      mapping.lastError = null;
    }
    mapping.lastSyncedAt = new Date();
    await mapping.save();

    const wallet = await getOrCreateWallet(user._id);
    wallet.safegoldUserId = mapping.safegoldCustomerId || wallet.safegoldUserId;
    if (Number.isFinite(result.gold_balance)) {
      wallet.balanceGrams = round4(result.gold_balance);
      wallet.balanceSource = 'safegold';
      wallet.lastSyncedAt = new Date();
    }
    await wallet.save();

    return mapping;
  } catch (err) {
    if (err.code === 'REGISTER_PENDING_TRANSFER') {
      mapping.status = 'pending';
      mapping.lastError = null;
      await mapping.save();
      return mapping;
    }
    mapping.status = 'failed';
    mapping.lastError = err.message;
    await mapping.save();
    throw err;
  }
}

async function activateCustomerFromTransfer(userId, customerUserId) {
  if (!customerUserId) return null;

  const mapping = await SafeGoldCustomer.findOne({ user: userId });
  if (!mapping) return null;

  mapping.safegoldCustomerId = String(customerUserId);
  mapping.status = 'active';
  mapping.registeredAt = mapping.registeredAt || new Date();
  mapping.lastSyncedAt = new Date();
  mapping.lastError = null;
  await mapping.save();
  return mapping;
}

async function syncHoldingsFromSafeGold(userId) {
  const mapping = await SafeGoldCustomer.findOne({ user: userId });
  if (!mapping?.safegoldCustomerId) {
    const wallet = await getOrCreateWallet(userId);
    return { wallet, mapping: null, source: 'local' };
  }

  try {
    const balance = await fetchCustomerBalance(mapping.safegoldCustomerId);
    const wallet = await getOrCreateWallet(userId);

    wallet.balanceGrams = round4(balance.gold_balance);
    wallet.balanceSource = 'safegold';
    wallet.lastSyncedAt = new Date();
    if (balance.customer_user_id) {
      wallet.safegoldUserId = balance.customer_user_id;
      mapping.safegoldCustomerId = balance.customer_user_id;
      mapping.status = 'active';
      mapping.registeredAt = mapping.registeredAt || new Date();
    }
    mapping.lastSyncedAt = new Date();
    mapping.lastError = null;
    await Promise.all([wallet.save(), mapping.save()]);

    return { wallet, mapping, source: 'safegold', balance };
  } catch (err) {
    const wallet = await getOrCreateWallet(userId);
    if (mapping) {
      mapping.lastError = err.message;
      await mapping.save();
    }
    return { wallet, mapping, source: 'local', syncError: err.message };
  }
}

async function getMergedTransactionHistory(userId, limit = 20) {
  const local = await SafeGoldTransaction.find({ user: userId })
    .sort({ createdAt: -1 })
    .limit(limit)
    .lean();

  const mapping = await SafeGoldCustomer.findOne({ user: userId });
  let remote = [];
  let remoteError = null;

  if (mapping?.safegoldCustomerId && mapping.status === 'active') {
    try {
      remote = await fetchCustomerTransactions(mapping.safegoldCustomerId, { limit });
    } catch (err) {
      remoteError = err.message;
    }
  }

  return {
    local,
    remote,
    remoteError,
    source: remote.length ? 'merged' : 'local'
  };
}

/** Clear local SafeGold link cache so user can register fresh with SafeGold API. */
async function resetSafeGoldCustomerLink(userId) {
  await Promise.all([
    SafeGoldCustomer.deleteOne({ user: userId }),
    SafeGoldWallet.deleteOne({ user: userId })
  ]);
  return { reset: true };
}

async function getLocalGoldInvestment(userId) {
  const txs = await SafeGoldTransaction.find({ user: userId, status: 'success' }).lean();
  return txs.reduce((sum, tx) => sum + Number(tx.buyPrice || 0), 0);
}

module.exports = {
  normalizeMobile,
  getOrCreateWallet,
  getCustomerMapping,
  ensureSafeGoldCustomer,
  activateCustomerFromTransfer,
  syncHoldingsFromSafeGold,
  getMergedTransactionHistory,
  resetSafeGoldCustomerLink,
  getLocalGoldInvestment
};
