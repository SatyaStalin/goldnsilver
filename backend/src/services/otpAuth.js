const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const AuthOtp = require('../models/AuthOtp');
const User = require('../models/User');
const { signAccessToken, signRefreshToken } = require('../middleware/auth');
const { formatUserResponse, roleFromUserType } = require('../services/userOrderService');
const { findAccountConflicts } = require('../services/userAccountService');
const { sendLoginCode } = require('./mailer');

const OTP_TTL_MS = 10 * 60 * 1000;
const RESEND_MS = 45 * 1000;
const MAX_ATTEMPTS = 5;

function phone10(raw) {
  let digits = String(raw || '').replace(/\D/g, '');
  if (digits.length === 12 && digits.startsWith('91')) digits = digits.slice(2);
  if (digits.length === 11 && digits.startsWith('0')) digits = digits.slice(1);
  return /^[6-9]\d{9}$/.test(digits) ? digits : '';
}

function emailNorm(raw) {
  const email = String(raw || '').trim().toLowerCase();
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? email : '';
}

function nameError(raw) {
  const name = String(raw || '').trim();
  if (name.length < 2) return 'Full name is required.';
  if (!/^[a-zA-Z\s.'-]{2,100}$/.test(name)) return 'Enter a valid name (letters, spaces, hyphens only).';
  return '';
}

function hashCode(code) {
  return crypto.createHash('sha256').update(`${process.env.JWT_SECRET || 'devsecret'}:${code}`).digest('hex');
}

function issueSession(user) {
  const tokenType = user.userType === 'admin' || user.role === 'admin' ? 'admin' : 'user';
  return {
    token: signAccessToken(user, tokenType),
    refreshToken: signRefreshToken(user, tokenType),
    user: formatUserResponse(user)
  };
}

async function findByChannel(channel, target) {
  if (channel === 'email') return User.findOne({ email: target });
  return User.findOne({ mobile: target });
}

function smsFailure(message, statusCode, code) {
  const err = new Error(message);
  err.statusCode = statusCode;
  err.code = code;
  return err;
}

function msg91Config() {
  const authKey = String(process.env.MSG91_AUTH_KEY || '').trim();
  const templateId = String(process.env.MSG91_OTP_TEMPLATE_ID || '').trim();
  const base = String(process.env.MSG91_BASE_URL || 'https://control.msg91.com').trim().replace(/\/+$/, '');
  return { authKey, templateId, base };
}

function msg91DeliveryError(reason) {
  const text = String(reason || '');
  if (/211/.test(text)) {
    return 'The code was not delivered. MSG91 rejected it because the DLT template id is missing. Open this OTP template in MSG91 and add the approved DLT template id, then try again.';
  }
  if (/203/.test(text)) {
    return 'The code was not delivered. The sender id on this MSG91 template is not approved.';
  }
  if (text) {
    return 'The code was not delivered to the phone. Please try again in a minute.';
  }
  return '';
}

async function msg91FailureReason(requestId, authKey, base) {
  if (!requestId) return '';
  await new Promise((resolve) => setTimeout(resolve, 3000));
  const axios = require('axios');
  const day = new Date().toISOString().slice(0, 10);
  try {
    const res = await axios.get(`${base}/api/v5/report/logs/p/otp`, {
      timeout: 12000,
      params: {
        startDate: day,
        endDate: day,
        requestId,
        limit: 5,
        fields: 'status,failureReason,requestId'
      },
      headers: { authkey: authKey, accept: 'application/json' },
      validateStatus: () => true
    });
    const rows = Array.isArray(res.data?.data) ? res.data.data : [];
    const row = rows.find((item) => String(item.requestId || '') === String(requestId)) || rows[0];
    return String(row?.failureReason || '');
  } catch {
    return '';
  }
}

async function sendMsg91Otp(mobile, code) {
  const { authKey, templateId, base } = msg91Config();
  if (!authKey || !templateId) {
    throw smsFailure(
      'Mobile OTP is not configured yet. Add the MSG91 details in the backend env, then restart the API.',
      503,
      'SMS_NOT_CONFIGURED'
    );
  }
  const axios = require('axios');
  let response;
  try {
    response = await axios.post(
      `${base}/api/v5/otp`,
      null,
      {
        timeout: 15000,
        params: {
          template_id: templateId,
          mobile: `91${mobile}`,
          otp: String(code),
          otp_expiry: 10,
          realTimeResponse: 1
        },
        headers: {
          authkey: authKey,
          accept: 'application/json',
          'Content-Type': 'application/json'
        },
        validateStatus: () => true
      }
    );
  } catch {
    throw smsFailure('The code could not be sent to this mobile number. Please try again.', 502, 'SMS_SEND_FAILED');
  }
  const data = response.data && typeof response.data === 'object' ? response.data : {};
  const failed = response.status >= 300
    || String(data.type || '').toLowerCase() === 'error'
    || String(data.code || '') === '201';
  if (failed) {
    throw smsFailure('The code could not be sent to this mobile number. Please try again.', 502, 'SMS_SEND_FAILED');
  }
  const reason = await msg91FailureReason(data.request_id || data.requestId, authKey, base);
  const deliveryMessage = msg91DeliveryError(reason);
  if (deliveryMessage) {
    throw smsFailure(deliveryMessage, 502, 'SMS_NOT_DELIVERED');
  }
}

async function sendSms(mobile, code) {
  const msg91 = msg91Config();
  if (msg91.authKey && msg91.templateId) {
    await sendMsg91Otp(mobile, code);
    return;
  }
  const url = String(process.env.SMS_API_URL || '').trim();
  if (!url) {
    throw smsFailure(
      'Mobile OTP is not configured yet. Add the MSG91 details in the backend env, then restart the API.',
      503,
      'SMS_NOT_CONFIGURED'
    );
  }
  const axios = require('axios');
  await axios.post(
    url,
    { to: mobile, message: `Your GoldnSilver verification code is ${code}. It expires in 10 minutes.` },
    {
      timeout: 15000,
      headers: {
        ...(process.env.SMS_API_KEY ? { Authorization: `Bearer ${process.env.SMS_API_KEY}` } : {}),
        'Content-Type': 'application/json'
      }
    }
  );
}

function otpPurpose(intent) {
  if (intent === 'register') return 'register';
  if (intent === 'reset') return 'reset';
  return 'login';
}

function signResetToken(userId) {
  return jwt.sign(
    { purpose: 'password-reset', uid: String(userId) },
    process.env.JWT_SECRET || 'devsecret',
    { expiresIn: '15m' }
  );
}

async function sendOtp({ channel, value, intent }) {
  const method = channel === 'mobile' ? 'mobile' : 'email';
  const purpose = otpPurpose(intent);
  const target = method === 'mobile' ? phone10(value) : emailNorm(value);
  if (!target) {
    const err = new Error(method === 'mobile' ? 'Enter a valid 10-digit mobile number.' : 'Enter a valid email address.');
    err.statusCode = 400;
    throw err;
  }

  const existing = await findByChannel(method, target);
  if ((purpose === 'login' || purpose === 'reset') && !existing) {
    const err = new Error('No account uses these details. Create an account first.');
    err.statusCode = 404;
    err.code = 'ACCOUNT_NOT_FOUND';
    throw err;
  }
  if (purpose === 'reset' && (existing.userType === 'admin' || existing.role === 'admin')) {
    const err = new Error('This account cannot be reset here.');
    err.statusCode = 403;
    throw err;
  }
  if (purpose === 'register' && existing) {
    const err = new Error('This is already registered. Sign in instead.');
    err.statusCode = 409;
    err.code = 'ACCOUNT_EXISTS';
    throw err;
  }

  const recent = await AuthOtp.findOne({ channel: method, target }).sort({ createdAt: -1 });
  if (recent && Date.now() - new Date(recent.createdAt).getTime() < RESEND_MS) {
    const err = new Error('Please wait a few seconds before asking for another code.');
    err.statusCode = 429;
    throw err;
  }

  const code = String(crypto.randomInt(100000, 1000000));
  await AuthOtp.deleteMany({ channel: method, target });
  await AuthOtp.create({
    channel: method,
    target,
    intent: purpose,
    codeHash: hashCode(code),
    expiresAt: new Date(Date.now() + OTP_TTL_MS)
  });

  try {
    if (method === 'email') await sendLoginCode(target, code);
    else await sendSms(target, code);
  } catch (err) {
    await AuthOtp.deleteMany({ channel: method, target, codeHash: hashCode(code) });
    throw err;
  }

  return { sent: true, channel: method, target };
}

async function verifyOtp({ channel, value, code, intent }) {
  const method = channel === 'mobile' ? 'mobile' : 'email';
  const purpose = otpPurpose(intent);
  const target = method === 'mobile' ? phone10(value) : emailNorm(value);
  const otp = String(code || '').replace(/\D/g, '');
  if (!target || otp.length !== 6) {
    const err = new Error('Enter the 6-digit code.');
    err.statusCode = 400;
    throw err;
  }

  const row = await AuthOtp.findOne({ channel: method, target, intent: purpose }).sort({ createdAt: -1 });
  if (!row || row.expiresAt.getTime() < Date.now()) {
    const err = new Error('That code has expired. Ask for a new one.');
    err.statusCode = 400;
    throw err;
  }
  if (row.attempts >= MAX_ATTEMPTS) {
    await AuthOtp.deleteMany({ channel: method, target });
    const err = new Error('Too many tries. Ask for a new code.');
    err.statusCode = 400;
    throw err;
  }
  const given = hashCode(otp);
  const match = crypto.timingSafeEqual(Buffer.from(row.codeHash), Buffer.from(given));
  if (!match) {
    row.attempts += 1;
    await row.save();
    const err = new Error('That code is not correct.');
    err.statusCode = 400;
    throw err;
  }
  await AuthOtp.deleteMany({ channel: method, target });

  if (purpose === 'login') {
    const user = await findByChannel(method, target);
    if (!user) {
      const err = new Error('No account uses these details. Create an account first.');
      err.statusCode = 404;
      throw err;
    }
    return { ...issueSession(user), created: false };
  }

  if (purpose === 'reset') {
    const user = await findByChannel(method, target);
    if (!user) {
      const err = new Error('No account uses these details. Create an account first.');
      err.statusCode = 404;
      throw err;
    }
    return { verified: true, resetToken: signResetToken(user._id) };
  }

  const already = await findByChannel(method, target);
  if (already) {
    const err = new Error('This is already registered. Sign in instead.');
    err.statusCode = 409;
    err.code = 'ACCOUNT_EXISTS';
    throw err;
  }

  const passwordHash = await bcrypt.hash(crypto.randomBytes(24).toString('hex'), 10);
  const emailValue = method === 'email' ? target : `m${target}@account.goldnsilver.shop`;
  const user = await User.create({
    name: '',
    email: emailValue,
    ...(method === 'mobile' ? { mobile: target } : {}),
    passwordHash,
    passwordSet: false,
    userType: 'general',
    role: roleFromUserType('general')
  });
  return { ...issueSession(user), created: true };
}

async function completeOtpSignup({ signupToken, name, email, mobile }) {
  let payload;
  try {
    payload = jwt.verify(signupToken, process.env.JWT_SECRET || 'devsecret');
  } catch {
    const err = new Error('This signup step expired. Ask for a new code.');
    err.statusCode = 400;
    throw err;
  }
  if (payload?.purpose !== 'otp-signup' || !payload.target) {
    const err = new Error('This signup step expired. Ask for a new code.');
    err.statusCode = 400;
    throw err;
  }

  const problem = nameError(name);
  if (problem) {
    const err = new Error(problem);
    err.statusCode = 400;
    throw err;
  }

  const emailValue = payload.channel === 'email' ? payload.target : emailNorm(email);
  const mobileValue = payload.channel === 'mobile' ? payload.target : phone10(mobile);
  if (!emailValue) {
    const err = new Error('Enter a valid email address.');
    err.statusCode = 400;
    throw err;
  }
  if (!mobileValue) {
    const err = new Error('Enter a valid 10-digit mobile number.');
    err.statusCode = 400;
    throw err;
  }

  const { emailOwner, mobileOwner } = await findAccountConflicts({
    email: emailValue,
    mobile: mobileValue
  });
  if (emailOwner || mobileOwner) {
    const err = new Error('Those details are already registered. Sign in instead.');
    err.statusCode = 409;
    err.code = 'ACCOUNT_EXISTS';
    throw err;
  }

  const passwordHash = await bcrypt.hash(crypto.randomBytes(24).toString('hex'), 10);
  const user = await User.create({
    name: String(name).trim(),
    email: emailValue,
    mobile: mobileValue,
    passwordHash,
    passwordSet: false,
    userType: 'general',
    role: roleFromUserType('general')
  });

  try {
    const { ensureSafeGoldCustomer } = require('./safegoldCustomerService');
    await ensureSafeGoldCustomer(user);
  } catch (err) {
    console.warn('[SafeGold] customer link on OTP signup:', err.message);
  }

  return { ...issueSession(user), created: true };
}

function passwordPairError(password, confirmPassword) {
  const nextPassword = String(password || '');
  const again = String(confirmPassword || '');
  if (nextPassword.length < 6 || nextPassword.length > 64) return 'Use 6 to 64 characters for the password.';
  if (!/[A-Za-z]/.test(nextPassword) || !/\d/.test(nextPassword)) {
    return 'Use at least one letter and one number in the password.';
  }
  if (!again || again !== nextPassword) return 'Retype the same password in both fields.';
  return '';
}

async function saveResetPassword(user, password) {
  if (!user || user.userType === 'admin' || user.role === 'admin') {
    const err = new Error('This account cannot be reset here.');
    err.statusCode = 400;
    throw err;
  }
  const nextPassword = String(password || '');
  const unchanged = user.passwordHash && await bcrypt.compare(nextPassword, user.passwordHash);
  if (unchanged) {
    const err = new Error('That is already the password on this account. Enter a different password.');
    err.statusCode = 400;
    throw err;
  }
  const passwordHash = await bcrypt.hash(nextPassword, 10);
  const written = await User.updateOne(
    { _id: user._id },
    { $set: { passwordHash, passwordSet: true } }
  );
  if (!written.matchedCount) {
    const err = new Error('The new password was not saved. Please try again.');
    err.statusCode = 500;
    throw err;
  }
  const fresh = await User.findById(user._id);
  const stored = fresh && await bcrypt.compare(nextPassword, fresh.passwordHash);
  if (!stored) {
    const err = new Error('The new password was not saved. Please try again.');
    err.statusCode = 500;
    throw err;
  }
  return {
    ...issueSession(fresh),
    passwordUpdated: true,
    message: 'Password updated. You are signed in.'
  };
}

async function completePasswordResetFromAccess({ accessToken, password, confirmPassword }) {
  const problem = passwordPairError(password, confirmPassword);
  if (problem) {
    const err = new Error(problem);
    err.statusCode = 400;
    throw err;
  }
  let decoded;
  try {
    decoded = jwt.verify(accessToken, process.env.JWT_SECRET || 'devsecret');
  } catch {
    const err = new Error('This reset step expired. Verify the code again.');
    err.statusCode = 400;
    throw err;
  }
  if (!decoded?.id || decoded.kind === 'refresh') {
    const err = new Error('This reset step expired. Verify the code again.');
    err.statusCode = 400;
    throw err;
  }
  const ageSeconds = Math.floor(Date.now() / 1000) - Number(decoded.iat || 0);
  if (!decoded.iat || ageSeconds > 20 * 60 || ageSeconds < -60) {
    const err = new Error('Verify the code again, then set the password.');
    err.statusCode = 400;
    throw err;
  }
  const user = await User.findById(decoded.id);
  return saveResetPassword(user, password);
}

async function completePasswordReset({ resetToken, password, confirmPassword }) {
  let payload;
  try {
    payload = jwt.verify(resetToken, process.env.JWT_SECRET || 'devsecret');
  } catch {
    const err = new Error('This reset step expired. Verify again.');
    err.statusCode = 400;
    throw err;
  }
  if (payload?.purpose !== 'password-reset' || !payload.uid) {
    const err = new Error('This reset step expired. Verify again.');
    err.statusCode = 400;
    throw err;
  }
  const problem = passwordPairError(password, confirmPassword);
  if (problem) {
    const err = new Error(problem);
    err.statusCode = 400;
    throw err;
  }
  const user = await User.findById(payload.uid);
  return saveResetPassword(user, password);
}

module.exports = {
  sendOtp,
  verifyOtp,
  completeOtpSignup,
  completePasswordReset,
  completePasswordResetFromAccess,
  saveResetPassword,
  signResetToken,
  phone10,
  emailNorm
};
