const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const KycDocument = require('../models/KycDocument');
const { signAccessToken, signRefreshToken } = require('../middleware/auth');
const { formatUserResponse, roleFromUserType } = require('./userOrderService');
const {
  readAccountState,
  exchangeCode,
  fetchVerifiedIdentity
} = require('./digilockerService');
const { validatePan, syncUserKycFields, toClientKyc } = require('./kycService');

function issueSession(user) {
  const tokenType = user.userType === 'admin' || user.role === 'admin' ? 'admin' : 'user';
  return {
    token: signAccessToken(user, tokenType),
    refreshToken: signRefreshToken(user, tokenType),
    user: formatUserResponse(user)
  };
}

function validEmail(value) {
  const email = String(value || '').trim().toLowerCase();
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? email : '';
}

async function saveApprovedKyc(user, identity, panNumber) {
  const now = new Date();
  const doc = await KycDocument.findOneAndUpdate(
    { user: user._id },
    {
      $set: {
        user: user._id,
        method: 'digilocker',
        fullName: identity.name,
        panNumber,
        aadhaarLast4: identity.aadhaarLast4 || '',
        aadhaarNumber: identity.aadhaarNumber || '',
        dateOfBirth: identity.dob || '',
        address: {
          line1: identity.address?.line1 || '',
          line2: identity.address?.line2 || '',
          city: identity.address?.city || '',
          state: identity.address?.state || '',
          pincode: String(identity.address?.pincode || '').replace(/\D/g, '').slice(0, 6)
        },
        digilocker: {
          requestId: identity.digilockerId || `digi_${Date.now()}`,
          status: 'completed',
          verifiedName: identity.name,
          verifiedPan: panNumber,
          verifiedAadhaarLast4: identity.aadhaarLast4 || '',
          panUri: identity.panUri || '',
          referenceKey: identity.referenceKey || ''
        },
        documents: {},
        status: 'approved',
        reviewedAt: now,
        rejectionReason: null,
        consentAccepted: true,
        consentAt: now
      }
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );
  const updated = await syncUserKycFields(user._id, {
    kycStatus: 'approved',
    kycMethod: 'digilocker',
    kycSubmittedAt: user.kycSubmittedAt || now,
    kycVerifiedAt: now,
    kycRejectedReason: null
  });
  if (identity.name && identity.name !== updated.name) {
    updated.name = identity.name;
    await updated.save();
  }
  return { user: updated, kyc: toClientKyc(doc, updated) };
}

async function findExistingUser(identity) {
  if (identity.digilockerId) {
    const kyc = await KycDocument.findOne({ 'digilocker.requestId': identity.digilockerId });
    if (kyc?.user) {
      const user = await User.findById(kyc.user);
      if (user) return user;
    }
  }
  if (identity.mobile) {
    const byMobile = await User.findOne({ mobile: identity.mobile });
    if (byMobile) return byMobile;
  }
  if (identity.email) {
    const byEmail = await User.findOne({ email: identity.email });
    if (byEmail) return byEmail;
  }
  return null;
}

async function createFromIdentity(identity) {
  const email = identity.email || `dl-${crypto.randomBytes(8).toString('hex')}@account.goldnsilver.shop`;
  const taken = await User.findOne({ email });
  const finalEmail = taken ? `dl-${crypto.randomBytes(8).toString('hex')}@account.goldnsilver.shop` : email;
  const passwordHash = await bcrypt.hash(crypto.randomBytes(24).toString('hex'), 10);
  let user;
  try {
    user = await User.create({
      name: identity.name,
      email: finalEmail,
      mobile: identity.mobile || undefined,
      passwordHash,
      passwordSet: false,
      userType: 'general',
      role: roleFromUserType('general')
    });
  } catch (err) {
    if (err?.code === 11000 && identity.mobile) {
      const existing = await User.findOne({ mobile: identity.mobile });
      if (existing && existing.userType !== 'admin' && existing.role !== 'admin') return existing;
    }
    throw err;
  }
  if (identity.mobile) {
    try {
      const { ensureSafeGoldCustomer } = require('./safegoldCustomerService');
      await ensureSafeGoldCustomer(user);
    } catch (err) {
      console.warn('[SafeGold] customer link on DigiLocker signup:', err.message);
    }
  }
  return user;
}

async function completeDigilockerAccount({ code, state }) {
  const session = readAccountState(state);
  const token = await exchangeCode(code, session.v);
  const identity = await fetchVerifiedIdentity(token);
  if (!identity.name || identity.name.length < 2) {
    const err = new Error('DigiLocker did not return a verified name.');
    err.statusCode = 502;
    throw err;
  }
  identity.email = validEmail(identity.email);

  let user = await findExistingUser(identity);
  if (user && (user.userType === 'admin' || user.role === 'admin')) {
    const err = new Error('This DigiLocker account cannot be used to sign in here.');
    err.statusCode = 400;
    throw err;
  }
  const created = !user;
  if (!user) user = await createFromIdentity(identity);

  let kyc = null;
  let panNumber = '';
  try {
    panNumber = validatePan(identity.panNumber);
  } catch {
    panNumber = '';
  }
  if (panNumber && user.kycStatus !== 'approved') {
    const saved = await saveApprovedKyc(user, identity, panNumber);
    user = saved.user;
    kyc = saved.kyc;
  } else {
    user = await User.findById(user._id);
  }

  const redirectTo = session.from && String(session.from).startsWith('/') ? session.from : '/dashboard';
  if (session.reset) {
    const { signResetToken } = require('./otpAuth');
    return {
      account: true,
      created,
      resetToken: signResetToken(user._id),
      verified: true,
      kyc,
      message: 'DigiLocker verified. Set your new password.'
    };
  }
  return {
    account: true,
    created,
    redirectTo,
    kyc,
    message: kyc
      ? 'Signed in with DigiLocker. Your KYC is approved.'
      : 'Signed in with DigiLocker.',
    ...issueSession(user)
  };
}

module.exports = { completeDigilockerAccount };
