const bcrypt = require('bcryptjs');
const User = require('../models/User');

const gateEmail = () => String(process.env.APP_GATE_EMAIL || '').trim().toLowerCase();
const gatePassword = () => String(process.env.APP_GATE_PASSWORD || '');

/**
 * Backend env is the only source for the superadmin.
 * Creates the user when missing, and resets role and password to those env values.
 */
const refreshGateAdmin = async () => {
  const email = gateEmail();
  const password = gatePassword();
  if (!email || !password) {
    console.error(
      '[auth] Set APP_GATE_EMAIL and APP_GATE_PASSWORD in backend .env. Those values are the static superadmin.'
    );
    return null;
  }

  let user = await User.findOne({ email });
  if (!user) {
    user = await User.create({
      name: 'Super Admin',
      email,
      passwordHash: await bcrypt.hash(password, 10),
      userType: 'admin',
      role: 'admin'
    });
    console.info('[auth] Superadmin created from backend env');
    return user;
  }

  const hashOk = await bcrypt.compare(password, user.passwordHash);
  if (!hashOk) user.passwordHash = await bcrypt.hash(password, 10);
  if (user.userType !== 'admin') user.userType = 'admin';
  if (user.role !== 'admin') user.role = 'admin';
  if (!String(user.name || '').trim()) user.name = 'Super Admin';
  await user.save();
  return user;
};

module.exports = {
  gateEmail,
  gatePassword,
  refreshGateAdmin
};
