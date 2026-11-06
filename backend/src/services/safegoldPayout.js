const crypto = require('crypto');
const SafeGoldTransaction = require('../models/SafeGoldTransaction');
const { sellStatus } = require('./safegoldService');
const { roundInr } = require('../utils/money');
const payoutApi = require('./cashfreePayout');

const IFSC_REGEX = /^[A-Z]{4}0[A-Z0-9]{6}$/;

function cleanName(value) {
  return String(value || '')
    .replace(/[^A-Za-z ]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 100);
}

function validateSellBank(bank, { phone, email } = {}) {
  const errors = {};
  const accountHolderName = cleanName(bank?.accountHolderName);
  const accountNumber = String(bank?.accountNumber || '').replace(/\s/g, '');
  const confirmAccountNumber = String(bank?.confirmAccountNumber || '').replace(/\s/g, '');
  const ifsc = String(bank?.ifsc || '').trim().toUpperCase();

  if (accountHolderName.length < 2) {
    errors.accountHolderName = 'Enter the account holder name as it appears on the bank account.';
  }
  if (!/^\d{9,18}$/.test(accountNumber)) {
    errors.accountNumber = 'Enter a bank account number of 9 to 18 digits.';
  }
  if (!confirmAccountNumber) {
    errors.confirmAccountNumber = 'Re-enter the account number.';
  } else if (confirmAccountNumber !== accountNumber) {
    errors.confirmAccountNumber = 'Account numbers do not match.';
  }
  if (!IFSC_REGEX.test(ifsc)) {
    errors.ifsc = 'Enter a valid 11-character IFSC, for example HDFC0001234.';
  }
  if (!/^\d{10}$/.test(String(phone || ''))) {
    errors.accountHolderName = errors.accountHolderName || 'Add a 10-digit mobile number on your profile before selling.';
  }

  if (Object.keys(errors).length) {
    const err = new Error(Object.values(errors)[0]);
    err.statusCode = 400;
    err.code = 'BANK_DETAILS_INVALID';
    err.errors = errors;
    throw err;
  }

  return {
    accountHolderName,
    accountNumber,
    ifsc,
    phone: String(phone),
    email: email || ''
  };
}

function beneficiaryIdFor(userId, accountNumber, ifsc) {
  const digest = crypto
    .createHash('sha256')
    .update(`${accountNumber}|${ifsc}`)
    .digest('hex')
    .slice(0, 10);
  return `gs${String(userId)}${digest}`.replace(/[^A-Za-z0-9]/g, '').slice(0, 50);
}

function transferMode(amount) {
  return amount <= 200000 ? 'imps' : 'neft';
}

function payoutUserMessage(payout) {
  const last4 = payout?.accountLast4 ? `ending ${payout.accountLast4}` : 'you entered';
  if (payout?.status === 'success') {
    return `₹${Number(payout.amount || 0).toLocaleString('en-IN')} has been sent to the account ${last4}.`;
  }
  if (payout?.status === 'processing') {
    return `The amount is on the way to the account ${last4}. It can take a few minutes to a few hours.`;
  }
  if (payout?.status === 'reversed') {
    return 'The bank returned this transfer. Your gold sale still stands. Contact support before selling again.';
  }
  if (payout?.status === 'failed') {
    return payout.lastError || 'The bank transfer could not be completed. Your gold sale still stands.';
  }
  return 'Gold is sold. The bank transfer starts after SafeGold settles this sale. You do not need to sell again.';
}

function publicPayout(payout) {
  if (!payout || !payout.status || payout.status === 'not_started') return null;
  return {
    status: payout.status,
    accountHolderName: payout.accountHolderName || '',
    accountLast4: payout.accountLast4 || '',
    ifsc: payout.ifsc || '',
    amount: payout.amount || 0,
    utr: payout.utr || null,
    message: payoutUserMessage(payout)
  };
}

function settlementReady(orderStatus, settledStatus) {
  return Number(orderStatus) === 1 && Number(settledStatus) === 1;
}

function settlementBlocked(orderStatus, settledStatus) {
  const order = Number(orderStatus);
  const settled = Number(settledStatus);
  return order === 2 || settled === 2 || settled === 7;
}

function applyCashfreeStatus(payout, data) {
  const raw = String(data?.status || '').toUpperCase();
  payout.cfTransferId = data?.cf_transfer_id ? String(data.cf_transfer_id) : payout.cfTransferId;
  payout.utr = data?.transfer_utr || data?.utr || payout.utr || '';
  if (raw === 'SUCCESS' || raw === 'COMPLETED') {
    payout.status = 'success';
    payout.paidAt = payout.paidAt || new Date();
    payout.lastError = '';
    return;
  }
  if (raw === 'REVERSED') {
    payout.status = 'reversed';
    payout.lastError = 'The bank returned this transfer.';
    return;
  }
  if (raw === 'FAILED' || raw === 'REJECTED') {
    payout.status = 'failed';
    payout.lastError = payoutApi.safePayoutText(data?.status_description || data?.message || 'The bank transfer was declined.');
    return;
  }
  payout.status = 'processing';
}

async function registerSellBeneficiary({ userId, bank, phone, email }) {
  payoutApi.assertPayoutConfigured();
  const details = validateSellBank(bank, { phone, email });
  const beneficiaryId = beneficiaryIdFor(userId, details.accountNumber, details.ifsc);
  try {
    await payoutApi.createBeneficiary({
      beneficiaryId,
      name: details.accountHolderName,
      accountNumber: details.accountNumber,
      ifsc: details.ifsc,
      email: details.email,
      phone: details.phone
    });
  } catch (err) {
    if (err.code === 'PAYOUT_NOT_CONFIGURED') throw err;
    const text = String(err.message || '').toLowerCase();
    const friendly = new Error(
      text.includes('ifsc')
        ? 'Cashfree did not accept this IFSC. Check the 11-character code and try again.'
        : text.includes('account')
          ? 'Cashfree did not accept this account number. Check the digits and try again.'
          : 'Cashfree could not save this bank account. Check the name, account number, and IFSC.'
    );
    friendly.statusCode = 400;
    friendly.code = 'BANK_DETAILS_REJECTED';
    throw friendly;
  }
  return {
    beneficiaryId,
    accountHolderName: details.accountHolderName,
    accountLast4: details.accountNumber.slice(-4),
    ifsc: details.ifsc
  };
}

async function sendPayout(tx) {
  const transferId = `sg${String(tx._id)}`.replace(/[^A-Za-z0-9_]/g, '').slice(0, 40);
  const amount = roundInr(tx.payout?.amount || tx.buyPrice);
  const claimed = await SafeGoldTransaction.findOneAndUpdate(
    {
      _id: tx._id,
      'payout.beneficiaryId': tx.payout.beneficiaryId,
      'payout.transferId': { $in: [null, ''] },
      'payout.status': { $in: ['awaiting_settlement', 'not_started'] }
    },
    {
      $set: {
        'payout.status': 'processing',
        'payout.transferId': transferId,
        'payout.amount': amount,
        'payout.requestedAt': new Date(),
        'payout.lastError': ''
      }
    },
    { new: true }
  );
  if (!claimed) return tx;

  try {
    const result = await payoutApi.createTransfer({
      transferId,
      amount,
      beneficiaryId: claimed.payout.beneficiaryId,
      transferMode: transferMode(amount)
    });
    applyCashfreeStatus(claimed.payout, result);
    await claimed.save();
    return claimed;
  } catch (err) {
    let existing = null;
    try {
      existing = await payoutApi.getTransfer(transferId);
    } catch {
      existing = null;
    }
    if (existing?.transfer_id || existing?.cf_transfer_id || existing?.status) {
      applyCashfreeStatus(claimed.payout, existing);
      await claimed.save();
      return claimed;
    }
    claimed.payout.transferId = '';
    claimed.payout.status = 'awaiting_settlement';
    claimed.payout.lastError = payoutApi.safePayoutText(err.message);
    await claimed.save();
    return claimed;
  }
}

async function refreshTransfer(tx) {
  if (!tx.payout?.transferId) return tx;
  try {
    const result = await payoutApi.getTransfer(tx.payout.transferId);
    applyCashfreeStatus(tx.payout, result);
    await tx.save();
  } catch (err) {
    tx.payout.lastError = payoutApi.safePayoutText(err.message);
    await tx.save();
  }
  return tx;
}

async function advanceSellPayout(tx) {
  if (!tx || tx.type !== 'sell' || tx.status !== 'success' || !tx.payout?.beneficiaryId) return tx;
  if (['success', 'failed', 'reversed'].includes(tx.payout.status)) return tx;

  if (tx.payout.status === 'processing' && tx.payout.transferId) {
    return refreshTransfer(tx);
  }
  if (!['awaiting_settlement', 'not_started'].includes(tx.payout.status || 'not_started')) return tx;
  if (tx.payout.transferId) return refreshTransfer(tx);

  const sellTxId = tx.sellTxId || tx.buyTxId;
  if (!sellTxId || String(sellTxId).startsWith('mock_')) {
    if (Number(tx.settledStatus) === 1) return sendPayout(tx);
    tx.payout.status = 'awaiting_settlement';
    await tx.save();
    return tx;
  }

  try {
    const status = await sellStatus({ txId: sellTxId });
    tx.settledStatus = status.settled_status != null ? Number(status.settled_status) : tx.settledStatus;
    if (settlementBlocked(status.status, status.settled_status)) {
      tx.payout.status = 'failed';
      tx.payout.lastError = 'SafeGold did not settle this sale, so the bank transfer was not sent.';
      await tx.save();
      return tx;
    }
    if (!settlementReady(status.status, status.settled_status)) {
      tx.payout.status = 'awaiting_settlement';
      await tx.save();
      return tx;
    }
    await tx.save();
    return sendPayout(tx);
  } catch (err) {
    tx.payout.status = 'awaiting_settlement';
    tx.payout.lastError = payoutApi.safePayoutText(err.message);
    await tx.save();
    return tx;
  }
}

async function finishSellPayout(tx, sellResult) {
  const orderStatus = sellResult?.order_status;
  const settledStatus = sellResult?.settled_status;
  tx.settledStatus = settledStatus != null ? Number(settledStatus) : tx.settledStatus;
  tx.payout.amount = roundInr(tx.buyPrice);
  if (settlementBlocked(orderStatus, settledStatus)) {
    tx.payout.status = 'failed';
    tx.payout.lastError = 'SafeGold did not settle this sale, so the bank transfer was not sent.';
    await tx.save();
    return tx;
  }
  if (!settlementReady(orderStatus, settledStatus)) {
    tx.payout.status = 'awaiting_settlement';
    await tx.save();
    return tx;
  }
  tx.payout.status = 'awaiting_settlement';
  await tx.save();
  return sendPayout(tx);
}

let payoutTimer = null;
let payoutRunning = false;

async function syncOpenSellPayouts() {
  if (payoutRunning) return { checked: 0 };
  payoutRunning = true;
  try {
    const rows = await SafeGoldTransaction.find({
      type: 'sell',
      status: 'success',
      'payout.status': { $in: ['awaiting_settlement', 'processing', 'not_started'] },
      'payout.beneficiaryId': { $nin: [null, ''] }
    }).limit(40);
    for (const tx of rows) {
      try {
        await advanceSellPayout(tx);
      } catch (err) {
        console.error('[payout] sell sync error:', err.message);
      }
    }
    return { checked: rows.length };
  } finally {
    payoutRunning = false;
  }
}

function startSellPayoutSync() {
  if (payoutTimer) return;
  const run = () => {
    syncOpenSellPayouts().catch((err) => {
      console.error('[payout] sync error:', err.message);
    });
  };
  setTimeout(run, 30000);
  payoutTimer = setInterval(run, 2 * 60 * 1000);
  if (typeof payoutTimer.unref === 'function') payoutTimer.unref();
}

module.exports = {
  validateSellBank,
  registerSellBeneficiary,
  finishSellPayout,
  advanceSellPayout,
  publicPayout,
  payoutUserMessage,
  startSellPayoutSync
};
