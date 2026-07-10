const crypto = require('crypto');
const SafeGoldTransaction = require('../models/SafeGoldTransaction');
const User = require('../models/User');
const { transferGold, getOrderStatus } = require('./safegoldService');
const {
  normalizeMobile,
  activateCustomerFromTransfer,
  syncHoldingsFromSafeGold,
  ensureSafeGoldCustomer
} = require('./safegoldCustomerService');

function round4(value) {
  return Math.round(Number(value) * 10000) / 10000;
}

function isDuplicateClientRefError(err) {
  const msg = String(err?.message || err?.details?.responseBody?.message || '').toLowerCase();
  const code = String(err?.code || err?.details?.responseBody?.code || '').toLowerCase();
  return (
    msg.includes('already exist') ||
    msg.includes('already exists') ||
    msg.includes('duplicate') ||
    (msg.includes('client_reference') && msg.includes('exist')) ||
    code.includes('duplicate') ||
    code.includes('already_exist')
  );
}

function pickTransferFields(data = {}) {
  return {
    buy_tx_id: data.buy_tx_id || data.buyTxId || data.tx_id || data.id || null,
    transfer_tx_id: data.transfer_tx_id || data.transferTxId || null,
    sg_rate: data.sg_rate != null ? Number(data.sg_rate) : data.sgRate != null ? Number(data.sgRate) : null,
    customer_user_id: data.customer_user_id || data.customerUserId || data.user_id || null
  };
}

async function reconcileExistingTransfer(transaction) {
  try {
    const statusData = await getOrderStatus(transaction.clientReferenceId);
    const fields = pickTransferFields(statusData);
    // SafeGold status APIs vary; if we got any payload back, treat duplicate as already fulfilled
    return {
      buy_tx_id: fields.buy_tx_id || `reconciled_${transaction.clientReferenceId}`,
      transfer_tx_id: fields.transfer_tx_id || null,
      sg_rate: fields.sg_rate,
      customer_user_id: fields.customer_user_id || transaction.safegoldUserId || null,
      reconciled: true
    };
  } catch {
    return {
      buy_tx_id: `reconciled_${transaction.clientReferenceId}`,
      transfer_tx_id: transaction.transferTxId || null,
      sg_rate: transaction.sgRate || null,
      customer_user_id: transaction.safegoldUserId || null,
      reconciled: true
    };
  }
}

async function applySuccessfulTransfer(transaction, user, transferResult) {
  transaction.status = 'success';
  transaction.failureReason = null;
  transaction.buyTxId = transferResult.buy_tx_id;
  transaction.transferTxId = transferResult.transfer_tx_id;
  transaction.sgRate = transferResult.sg_rate;
  if (transferResult.customer_user_id) {
    transaction.safegoldUserId = transferResult.customer_user_id;
  }
  await transaction.save();

  if (transferResult.customer_user_id) {
    await activateCustomerFromTransfer(user._id, transferResult.customer_user_id);
  }

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

async function fulfillSafeGoldOrder(order) {
  if (order.orderType !== 'safegold' || !order.safegoldTransactionId) {
    return null;
  }

  const existing = await SafeGoldTransaction.findById(order.safegoldTransactionId);
  if (!existing) {
    throw new Error('SafeGold transaction not found');
  }

  if (existing.status === 'success') {
    const synced = await syncHoldingsFromSafeGold(existing.user);
    return { transaction: existing, wallet: synced.wallet, customer: synced.mapping };
  }

  // Claim the transaction so parallel verify-payment calls don't double-transfer
  const transaction = await SafeGoldTransaction.findOneAndUpdate(
    {
      _id: existing._id,
      status: { $in: ['pending', 'failed'] }
    },
    {
      $set: {
        status: 'processing',
        paymentOrderId: order.paymentOrderId,
        paymentId: order.paymentId,
        paymentProvider: order.paymentProvider || 'cashfree',
        failureReason: null
      }
    },
    { new: true }
  );

  if (!transaction) {
    const current = await SafeGoldTransaction.findById(existing._id);
    if (current?.status === 'success') {
      const synced = await syncHoldingsFromSafeGold(current.user);
      return { transaction: current, wallet: synced.wallet, customer: synced.mapping };
    }
    if (current?.status === 'processing') {
      // Another request is fulfilling — wait briefly then return if success
      await new Promise((r) => setTimeout(r, 1500));
      const again = await SafeGoldTransaction.findById(existing._id);
      if (again?.status === 'success') {
        const synced = await syncHoldingsFromSafeGold(again.user);
        return { transaction: again, wallet: synced.wallet, customer: synced.mapping };
      }
      throw new Error('Gold transfer is already in progress. Please refresh in a moment.');
    }
    throw new Error('SafeGold transaction could not be claimed for fulfillment');
  }

  const user = await User.findById(transaction.user);
  if (!user?.name?.trim()) {
    transaction.status = 'failed';
    transaction.failureReason = 'User profile incomplete for SafeGold transfer';
    await transaction.save();
    throw new Error(transaction.failureReason);
  }

  const mobile = normalizeMobile(user.mobile || order.customerPhone);
  if (mobile.length !== 10) {
    transaction.status = 'failed';
    transaction.failureReason = 'Valid mobile number required for SafeGold transfer';
    await transaction.save();
    throw new Error(transaction.failureReason);
  }

  const mapping = await ensureSafeGoldCustomer(user);
  if (!mapping?.safegoldCustomerId) {
    transaction.status = 'failed';
    transaction.failureReason =
      'SafeGold customer wallet not found. Your account could not be linked to SafeGold — please contact support.';
    await transaction.save();
    throw new Error(transaction.failureReason);
  }

  let transferResult;
  try {
    transferResult = await transferGold({
      partnerUserId: mapping.safegoldCustomerId,
      name: user.name,
      phoneNo: mobile,
      rateId: transaction.rateId,
      goldAmount: transaction.goldAmount,
      buyPrice: transaction.buyPrice,
      clientReferenceId: transaction.clientReferenceId
    });
  } catch (err) {
    if (isDuplicateClientRefError(err)) {
      // SafeGold already accepted this client_reference_id — treat as success
      transferResult = await reconcileExistingTransfer(transaction);
    } else {
      // Fresh client ref + one retry for non-duplicate transfer failures after payment
      const newRef = `SG_${transaction.user}_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;
      transaction.clientReferenceId = newRef;
      await transaction.save();
      try {
        transferResult = await transferGold({
          partnerUserId: mapping.safegoldCustomerId,
          name: user.name,
          phoneNo: mobile,
          rateId: transaction.rateId,
          goldAmount: transaction.goldAmount,
          buyPrice: transaction.buyPrice,
          clientReferenceId: newRef
        });
      } catch (retryErr) {
        if (isDuplicateClientRefError(retryErr)) {
          transferResult = await reconcileExistingTransfer(transaction);
        } else {
          transaction.status = 'failed';
          transaction.failureReason = retryErr.message || err.message || 'Gold transfer failed after payment';
          await transaction.save();
          throw retryErr;
        }
      }
    }
  }

  return applySuccessfulTransfer(transaction, user, transferResult);
}

module.exports = { fulfillSafeGoldOrder, isDuplicateClientRefError };
