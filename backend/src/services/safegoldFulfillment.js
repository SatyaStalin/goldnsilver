const SafeGoldTransaction = require('../models/SafeGoldTransaction');
const User = require('../models/User');
const { transferGold } = require('./safegoldService');
const {
  normalizeMobile,
  getOrCreateWallet,
  activateCustomerFromTransfer,
  syncHoldingsFromSafeGold,
  ensureSafeGoldCustomer
} = require('./safegoldCustomerService');

function round4(value) {
  return Math.round(Number(value) * 10000) / 10000;
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
    const synced = await syncHoldingsFromSafeGold(transaction.user);
    return { transaction, wallet: synced.wallet, customer: synced.mapping };
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

  const mapping = await ensureSafeGoldCustomer(user);
  if (!mapping?.safegoldCustomerId) {
    throw new Error(
      'SafeGold customer wallet not found. Your account could not be linked to SafeGold — please contact support.'
    );
  }

  const transferResult = await transferGold({
    partnerUserId: mapping.safegoldCustomerId,
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

  await activateCustomerFromTransfer(user._id, transferResult.customer_user_id);

  const synced = await syncHoldingsFromSafeGold(user._id);
  const wallet = synced.wallet;

  if (wallet.balanceSource !== 'safegold') {
    wallet.balanceGrams = round4(wallet.balanceGrams + transaction.goldAmount);
    if (transferResult.customer_user_id) {
      wallet.safegoldUserId = transferResult.customer_user_id;
    }
    await wallet.save();
  }

  return { transaction, wallet, customer: synced.mapping };
}

module.exports = { fulfillSafeGoldOrder };
