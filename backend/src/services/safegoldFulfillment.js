const SafeGoldTransaction = require('../models/SafeGoldTransaction');
const SafeGoldWallet = require('../models/SafeGoldWallet');
const User = require('../models/User');
const { transferGold } = require('./safegoldService');

function round4(value) {
  return Math.round(Number(value) * 10000) / 10000;
}

function normalizeMobile(mobile) {
  return String(mobile || '').replace(/\D/g, '').slice(-10);
}

async function getOrCreateWallet(userId) {
  let wallet = await SafeGoldWallet.findOne({ user: userId });
  if (!wallet) {
    wallet = await SafeGoldWallet.create({ user: userId, balanceGrams: 0 });
  }
  return wallet;
}

async function fulfillSafeGoldOrder(order) {
  if (order.orderType !== 'safegold' || !order.safegoldTransactionId) {
    return null;
  }

  const transaction = await SafeGoldTransaction.findById(order.safegoldTransactionId);
  if (!transaction) {
    throw new Error('SafeGold transaction not found');
  }

  if (transaction.status === 'success') {
    const wallet = await getOrCreateWallet(transaction.user);
    return { transaction, wallet };
  }

  const user = await User.findById(transaction.user);
  if (!user?.name?.trim()) {
    throw new Error('User profile incomplete for SafeGold transfer');
  }

  const mobile = normalizeMobile(user.mobile || order.customerPhone);
  if (mobile.length !== 10) {
    throw new Error('Valid mobile number required for SafeGold transfer');
  }

  transaction.paymentOrderId = order.paymentOrderId;
  transaction.paymentId = order.paymentId;
  transaction.paymentProvider = order.paymentProvider || 'cashfree';
  await transaction.save();

  const transferResult = await transferGold({
    partnerUserId: user._id.toString(),
    name: user.name,
    phoneNo: mobile,
    rateId: transaction.rateId,
    goldAmount: transaction.goldAmount,
    buyPrice: transaction.buyPrice,
    clientReferenceId: transaction.clientReferenceId
  });

  transaction.status = 'success';
  transaction.buyTxId = transferResult.buy_tx_id;
  transaction.transferTxId = transferResult.transfer_tx_id;
  transaction.sgRate = transferResult.sg_rate;
  transaction.safegoldUserId = transferResult.customer_user_id;
  await transaction.save();

  const wallet = await getOrCreateWallet(user._id);
  wallet.balanceGrams = round4(wallet.balanceGrams + transaction.goldAmount);
  if (transferResult.customer_user_id) {
    wallet.safegoldUserId = transferResult.customer_user_id;
  }
  await wallet.save();

  return { transaction, wallet };
}

module.exports = { fulfillSafeGoldOrder };
