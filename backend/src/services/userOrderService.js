const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Product = require('../models/Product');
const { getLiveMetalRates } = require('./metalRatesService');

function catalogTypeKey(product) {
  const value = product?.catalog;
  if (value === 'mmtc' || value === 'mmtc-pamp') return 'mmtc';
  return 'own';
}

const normalizeMobile = (mobile) => String(mobile || '').replace(/\D/g, '').slice(-10);

const roleFromUserType = (userType) => (userType === 'admin' ? 'admin' : 'user');

/**
 * Find user by email or mobile; create general user if missing (password required).
 */
async function resolveOrCreateUser({ name, email, mobile, password }) {
  const normalizedEmail = String(email || '').trim().toLowerCase();
  const normalizedMobile = normalizeMobile(mobile);

  if (!normalizedEmail && !normalizedMobile) {
    throw new Error('Email or mobile is required');
  }

  const orConditions = [];
  if (normalizedEmail) orConditions.push({ email: normalizedEmail });
  if (normalizedMobile) orConditions.push({ mobile: normalizedMobile });

  let user = await User.findOne({ $or: orConditions });
  let created = false;

  if (!user) {
    if (!password || String(password).length < 6) {
      const err = new Error('Password is required (min 6 characters) to create your account');
      err.statusCode = 400;
      err.code = 'PASSWORD_REQUIRED';
      throw err;
    }
    if (!normalizedEmail) {
      const err = new Error('Email is required to create a new account');
      err.statusCode = 400;
      throw err;
    }
    const existingEmail = await User.findOne({ email: normalizedEmail });
    if (existingEmail) {
      user = existingEmail;
    } else {
      const passwordHash = await bcrypt.hash(password, 10);
      user = await User.create({
        name: name || 'Customer',
        email: normalizedEmail,
        mobile: normalizedMobile || undefined,
        passwordHash,
        passwordSet: true,
        userType: 'general',
        role: 'user'
      });
      created = true;
    }
  } else if (name && !user.name) {
    user.name = name;
    await user.save();
  }

  return { user, created };
}

async function enrichOrderItems(items) {
  const rates = await getLiveMetalRates();
  const enriched = [];

  for (const item of items) {
    const product = await Product.findById(item.productId || item.product).lean();
    const metal = product?.metal || 'gold';
    const gramsPerUnit = product?.metalGrams > 0 ? product.metalGrams : 1;
    const qty = item.quantity || 1;
    let purchaseRatePerGram = rates.goldPerGram;
    if (metal === 'silver') purchaseRatePerGram = rates.silverPerGram;
    else if (metal === 'gold+silver') {
      purchaseRatePerGram = (rates.goldPerGram + rates.silverPerGram) / 2;
    }

    enriched.push({
      product: item.productId || item.product,
      name: item.name || product?.name,
      price: item.price,
      quantity: qty,
      metal,
      catalog: catalogTypeKey(product || item),
      type: product?.type || item.type || null,
      metalGrams: gramsPerUnit * qty,
      purchaseRatePerGram
    });
  }

  return { items: enriched, liveRatesAtPurchase: rates };
}

function formatUserResponse(user) {
  return {
    id: user._id,
    name: user.name,
    email: isPlaceholderEmail(user.email) ? '' : user.email,
    mobile: user.mobile || '',
    userType: user.userType || (user.role === 'admin' ? 'admin' : 'general'),
    role: user.role,
    kycStatus: user.kycStatus || 'not_submitted',
    kycMethod: user.kycMethod || null,
    hasPassword: user.passwordSet !== false
  };
}

function isPlaceholderEmail(email) {
  return /@account\.goldnsilver\.shop$/i.test(String(email || '').trim());
}

function checkoutPhone(raw) {
  let digits = String(raw || '').replace(/\D/g, '');
  if (digits.length === 12 && digits.startsWith('91')) digits = digits.slice(2);
  if (digits.length === 11 && digits.startsWith('0')) digits = digits.slice(1);
  return /^[6-9]\d{9}$/.test(digits) ? digits : '';
}

/** Save name, email, or mobile from the first checkout only when that field is still empty. */
async function applyCheckoutProfile(userId, { name, email, mobile } = {}) {
  const user = await User.findById(userId);
  if (!user) return null;
  let changed = false;

  const nextName = String(name || '').trim();
  if (String(user.name || '').trim().length < 2 && /^[a-zA-Z\s.'-]{2,100}$/.test(nextName)) {
    user.name = nextName;
    changed = true;
  }

  const phone = checkoutPhone(mobile);
  if (!checkoutPhone(user.mobile) && phone) {
    const clash = await User.findOne({ mobile: phone, _id: { $ne: user._id } });
    if (!clash) {
      user.mobile = phone;
      changed = true;
    }
  }

  const nextEmail = String(email || '').trim().toLowerCase();
  if (
    isPlaceholderEmail(user.email) &&
    nextEmail &&
    !isPlaceholderEmail(nextEmail) &&
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(nextEmail)
  ) {
    const clash = await User.findOne({ email: nextEmail, _id: { $ne: user._id } });
    if (!clash) {
      user.email = nextEmail;
      changed = true;
    }
  }

  if (!changed) return user;
  await user.save();
  if (String(user.name || '').trim() && checkoutPhone(user.mobile)) {
    try {
      const { ensureSafeGoldCustomer } = require('./safegoldCustomerService');
      await ensureSafeGoldCustomer(user);
    } catch (err) {
      console.warn('[SafeGold] customer link on checkout profile:', err.message);
    }
  }
  return user;
}

module.exports = {
  resolveOrCreateUser,
  enrichOrderItems,
  formatUserResponse,
  normalizeMobile,
  roleFromUserType,
  isPlaceholderEmail,
  applyCheckoutProfile
};
