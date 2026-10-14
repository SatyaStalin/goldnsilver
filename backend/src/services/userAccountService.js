const fs = require('fs');
const path = require('path');
const User = require('../models/User');
const Cart = require('../models/Cart');
const KycDocument = require('../models/KycDocument');
const SafeGoldCustomer = require('../models/SafeGoldCustomer');
const SafeGoldWallet = require('../models/SafeGoldWallet');
const { normalizeMobile } = require('./userOrderService');

const kycUploadDir = path.join(__dirname, '../../uploads/kyc');

function normalizeEmail(email) {
  return String(email || '').trim().toLowerCase();
}

function escapeRegex(str) {
  return String(str).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Accounts that already own this email and/or mobile.
 * Email is matched case-insensitively so legacy mixed-case rows are still caught.
 */
async function findAccountConflicts({ email, mobile, excludeUserId = null } = {}) {
  const emailNorm = normalizeEmail(email);
  const mobileNorm = normalizeMobile(mobile);
  const notSelf = excludeUserId ? { _id: { $ne: excludeUserId } } : {};

  const [emailOwner, mobileOwner] = await Promise.all([
    emailNorm
      ? User.findOne({ ...notSelf, email: new RegExp(`^\\s*${escapeRegex(emailNorm)}\\s*$`, 'i') })
          .select('_id email mobile')
          .lean()
      : null,
    mobileNorm
      ? User.findOne({ ...notSelf, mobile: mobileNorm }).select('_id email mobile').lean()
      : null
  ]);

  return { emailNorm, mobileNorm, emailOwner, mobileOwner };
}

function removeKycFiles(userId) {
  const dir = path.join(kycUploadDir, String(userId));
  if (!dir.startsWith(kycUploadDir + path.sep)) return false;
  try {
    if (fs.existsSync(dir)) {
      fs.rmSync(dir, { recursive: true, force: true });
      return true;
    }
  } catch (err) {
    console.warn('[user-delete] could not remove KYC files:', err.message);
  }
  return false;
}

/**
 * Permanently delete a customer account so the same email / mobile can register again.
 * Removes login, cart, KYC (records + uploaded files) and the SafeGold link/wallet cache.
 * Orders and SafeGold transactions are kept as financial records.
 */
async function deleteUserAccount(userId) {
  const user = await User.findById(userId);
  if (!user) {
    const err = new Error('User not found');
    err.statusCode = 404;
    throw err;
  }
  if (user.userType === 'admin' || user.role === 'admin') {
    const err = new Error('Admin accounts cannot be deleted here');
    err.statusCode = 403;
    throw err;
  }

  const { _id: id, email, mobile } = user;

  const [carts, kyc, sgCustomers, sgWallets] = await Promise.all([
    Cart.deleteMany({ user: id }),
    KycDocument.deleteMany({ user: id }),
    SafeGoldCustomer.deleteMany({ user: id }),
    SafeGoldWallet.deleteMany({ user: id })
  ]);
  const kycFilesRemoved = removeKycFiles(id);

  const result = await User.deleteOne({ _id: id });
  if (result.deletedCount !== 1 || (await User.exists({ _id: id }))) {
    const err = new Error('User could not be deleted. Please try again.');
    err.statusCode = 500;
    throw err;
  }

  const { emailOwner, mobileOwner } = await findAccountConflicts({ email, mobile });

  return {
    email,
    mobile: mobile || null,
    removed: {
      carts: carts.deletedCount,
      kycDocuments: kyc.deletedCount,
      kycFiles: kycFilesRemoved,
      safegoldLinks: sgCustomers.deletedCount,
      safegoldWallets: sgWallets.deletedCount
    },
    emailStillUsedBy: emailOwner ? { userId: emailOwner._id, email: emailOwner.email } : null,
    mobileStillUsedBy: mobileOwner ? { userId: mobileOwner._id, email: mobileOwner.email } : null
  };
}

module.exports = {
  normalizeEmail,
  findAccountConflicts,
  deleteUserAccount
};
