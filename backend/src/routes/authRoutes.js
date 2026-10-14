const express = require('express');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const { authMiddleware, signAccessToken, signRefreshToken } = require('../middleware/auth');
const {
  formatUserResponse,
  normalizeMobile,
  roleFromUserType
} = require('../services/userOrderService');
const { findAccountConflicts } = require('../services/userAccountService');
const { gateEmail, gatePassword, refreshGateAdmin } = require('../services/gateAdminService');

const router = express.Router();

const issueSession = (user, tokenType) => ({
  token: signAccessToken(user, tokenType),
  refreshToken: signRefreshToken(user, tokenType),
  user: formatUserResponse(user)
});

router.get('/check', async (req, res, next) => {
  try {
    const { emailNorm, mobileNorm, emailOwner, mobileOwner } = await findAccountConflicts({
      email: req.query.email,
      mobile: req.query.mobile
    });
    if (!emailNorm && !mobileNorm) {
      return res.json({ exists: false });
    }
    const user = emailOwner || mobileOwner;
    res.json({
      exists: Boolean(user),
      userId: user?._id,
      emailExists: Boolean(emailOwner),
      mobileExists: Boolean(mobileOwner)
    });
  } catch (err) {
    next(err);
  }
});

router.post('/register', async (req, res, next) => {
  try {
    const { name, email, password, mobile, userType: rawType, pinCode } = req.body;
    const emailNorm = String(email || '').trim().toLowerCase();
    const mobileNorm = normalizeMobile(mobile);
    const userType = rawType === 'admin' ? 'admin' : 'general';
    const pinNorm = pinCode ? String(pinCode).replace(/\D/g, '').slice(0, 6) : null;

    const { emailOwner, mobileOwner } = await findAccountConflicts({
      email: emailNorm,
      mobile: mobileNorm
    });
    if (emailOwner) {
      return res.status(400).json({
        code: 'EMAIL_EXISTS',
        message: 'This email is already registered. Please log in or use a different email.'
      });
    }
    if (mobileOwner) {
      return res.status(400).json({
        code: 'MOBILE_EXISTS',
        message: 'This mobile number is already registered with another account. Please use a different mobile number.'
      });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await User.create({
      name,
      email: emailNorm,
      mobile: mobileNorm || undefined,
      passwordHash,
      userType,
      role: roleFromUserType(userType),
      pinCode: pinNorm && pinNorm.length === 6 ? pinNorm : undefined
    });
    const session = issueSession(user, 'user');

    let safegold = null;
    if (userType === 'general' && name?.trim() && mobileNorm.length === 10) {
      try {
        const { ensureSafeGoldCustomer } = require('../services/safegoldCustomerService');
        const mapping = await ensureSafeGoldCustomer(user);
        safegold = {
          linked: Boolean(mapping.safegoldCustomerId),
          safegoldCustomerId: mapping.safegoldCustomerId || null,
          status: mapping.status
        };
      } catch (sgErr) {
        console.warn('[SafeGold] customer link on register:', sgErr.message);
        safegold = { linked: false, error: sgErr.message };
      }
    }

    res.status(201).json({ ...session, safegold });
  } catch (err) {
    if (err?.code === 11000) {
      return res.status(400).json({
        code: 'EMAIL_EXISTS',
        message: 'This email is already registered. Please log in or use a different email.'
      });
    }
    next(err);
  }
});

router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const emailNorm = String(email || '').trim().toLowerCase();
    const sentPassword = String(password || '');
    const staticEmail = gateEmail();
    const staticPassword = gatePassword();

    const isGateAttempt = req.body?.gate === true || (Boolean(staticEmail) && emailNorm === staticEmail);
    if (isGateAttempt) {
      if (!emailNorm || !sentPassword) {
        return res.status(400).json({
          code: 'GATE_ENV_MISSING',
          message: 'Superadmin username and password are missing in the frontend env.'
        });
      }
      if (!staticEmail || !staticPassword) {
        return res.status(500).json({
          code: 'GATE_ENV_MISSING',
          message: 'Superadmin username and password are not set in the backend env.'
        });
      }
      if (emailNorm !== staticEmail || sentPassword !== staticPassword) {
        return res.status(401).json({
          code: 'GATE_MISMATCH',
          message: 'Superadmin username or password does not match the backend env. The backend env is the source of truth.'
        });
      }
      const adminUser = await refreshGateAdmin();
      if (!adminUser) {
        return res.status(500).json({
          code: 'GATE_ENV_MISSING',
          message: 'Superadmin username and password are not set in the backend env.'
        });
      }
      return res.json(issueSession(adminUser, 'admin'));
    }

    const user = await User.findOne({ email: emailNorm });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    const tokenType = user.userType === 'admin' || user.role === 'admin' ? 'admin' : 'user';
    const session = issueSession(user, tokenType);

    if (user.userType === 'general' && user.name?.trim() && normalizeMobile(user.mobile).length === 10) {
      const { ensureSafeGoldCustomer } = require('../services/safegoldCustomerService');
      ensureSafeGoldCustomer(user).catch((err) => {
        console.warn('[SafeGold] customer link on login:', err.message);
      });
    }

    res.json(session);
  } catch (err) {
    next(err);
  }
});

router.get('/me', authMiddleware, async (req, res) => {
  res.json({ user: formatUserResponse(req.user) });
});

router.put('/profile', authMiddleware, async (req, res, next) => {
  try {
    const { name, mobile } = req.body;
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    if (name) user.name = name;
    if (mobile !== undefined) {
      const mobileNorm = normalizeMobile(mobile);
      if (mobileNorm) {
        const clash = await User.findOne({
          mobile: mobileNorm,
          _id: { $ne: user._id }
        });
        if (clash) {
          return res.status(400).json({ message: 'Mobile number already in use' });
        }
        user.mobile = mobileNorm;
      }
    }
    if (req.body.pinCode !== undefined) {
      const pinNorm = String(req.body.pinCode).replace(/\D/g, '').slice(0, 6);
      user.pinCode = pinNorm.length === 6 ? pinNorm : user.pinCode;
    }
    await user.save();

    if (user.name && normalizeMobile(user.mobile).length === 10) {
      const { ensureSafeGoldCustomer } = require('../services/safegoldCustomerService');
      ensureSafeGoldCustomer(user).catch((err) => {
        console.warn('[SafeGold] customer link on profile update:', err.message);
      });
    }

    res.json({ user: formatUserResponse(user) });
  } catch (err) {
    next(err);
  }
});

router.put('/change-password', authMiddleware, async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user._id);
    const ok = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!ok) {
      return res.status(400).json({ message: 'Current password is incorrect' });
    }
    if (!newPassword || String(newPassword).length < 6) {
      return res.status(400).json({ message: 'New password must be at least 6 characters' });
    }
    user.passwordHash = await bcrypt.hash(newPassword, 10);
    await user.save();
    res.json({ message: 'Password updated successfully' });
  } catch (err) {
    next(err);
  }
});

/** Same admin panel login as before; returns a JWT so admin APIs can be authorized. */
router.post('/admin-login', async (req, res, next) => {
  try {
    const username = String(req.body?.username || req.body?.email || '').trim();
    const password = String(req.body?.password || '');
    const expectedUser = process.env.ADMIN_USERNAME || 'admin';
    const expectedPass = process.env.ADMIN_PASSWORD || 'admin@1432';
    if (username !== expectedUser || password !== expectedPass) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const email = String(process.env.ADMIN_EMAIL || 'admin@goldnsilver.shop').trim().toLowerCase();
    let user = await User.findOne({ email });
    if (!user) {
      user = await User.create({
        name: 'Admin',
        email,
        passwordHash: await bcrypt.hash(expectedPass, 10),
        userType: 'admin',
        role: 'admin'
      });
    } else if (user.userType !== 'admin' || user.role !== 'admin') {
      user.userType = 'admin';
      user.role = 'admin';
      await user.save();
    }

    const session = issueSession(user, 'admin');
    res.json(session);
  } catch (err) {
    next(err);
  }
});

/** New 15-minute access token from a still-valid refresh token. */
router.post('/refresh', async (req, res, next) => {
  try {
    const refreshToken = String(req.body?.refreshToken || '');
    if (!refreshToken) {
      return res.status(401).json({ code: 'TOKEN_REQUIRED', message: 'Refresh token required' });
    }

    const jwt = require('jsonwebtoken');
    const { JWT_SECRET } = require('../middleware/auth');
    let decoded;
    try {
      decoded = jwt.verify(refreshToken, JWT_SECRET);
    } catch (err) {
      if (err?.name === 'TokenExpiredError') {
        return res.status(401).json({ code: 'TOKEN_EXPIRED', message: 'Your session has expired' });
      }
      return res.status(401).json({ code: 'TOKEN_INVALID', message: 'Invalid refresh token' });
    }

    if (decoded.kind !== 'refresh' || decoded.tokenType === 'app') {
      return res.status(401).json({ code: 'TOKEN_INVALID', message: 'Invalid refresh token' });
    }

    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(401).json({ code: 'TOKEN_INVALID', message: 'User not found' });
    }

    const tokenType = decoded.tokenType === 'admin' ? 'admin' : 'user';
    if (tokenType === 'admin' && user.userType !== 'admin' && user.role !== 'admin') {
      return res.status(403).json({ message: 'Admin access required' });
    }

    res.json(issueSession(user, tokenType));
  } catch (err) {
    next(err);
  }
});

module.exports = router;
