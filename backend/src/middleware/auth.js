const jwt = require('jsonwebtoken');
const User = require('../models/User');

const JWT_SECRET = process.env.JWT_SECRET || 'devsecret';
const ACCESS_TOKEN_TTL = '15m';
const REFRESH_TOKEN_TTL = '7d';

const OPEN_API = new Set([
  'POST /auth/login',
  'POST /auth/register',
  'POST /auth/admin-login',
  'POST /auth/refresh',
  'POST /payment/webhook',
  'GET /zerodha/callback',
  'GET /health'
]);

const readRequestToken = (req) => {
  const header = req.headers.authorization || '';
  if (header.startsWith('Bearer ')) return header.slice(7).trim();
  if (req.query && req.query.token) return String(req.query.token).trim();
  return '';
};

const tokenError = (err) => {
  if (err?.name === 'TokenExpiredError') {
    return { code: 'TOKEN_EXPIRED', message: 'Your session has expired' };
  }
  return { code: 'TOKEN_INVALID', message: 'Authentication required' };
};

const signAccessToken = (user, tokenType) =>
  jwt.sign(
    {
      id: String(user._id),
      role: user.role,
      userType: user.userType || (user.role === 'admin' ? 'admin' : 'general'),
      tokenType
    },
    JWT_SECRET,
    { expiresIn: ACCESS_TOKEN_TTL }
  );

const signRefreshToken = (user, tokenType) =>
  jwt.sign(
    {
      id: String(user._id),
      tokenType,
      kind: 'refresh'
    },
    JWT_SECRET,
    { expiresIn: REFRESH_TOKEN_TTL }
  );

/** Every /api route needs a valid access token, except login and outside callbacks. */
const requireApiToken = (req, res, next) => {
  if (req.method === 'OPTIONS') return next();
  const path = String(req.path || '/').replace(/\/$/, '') || '/';
  if (OPEN_API.has(`${req.method} ${path}`)) return next();

  const token = readRequestToken(req);
  if (!token) {
    return res.status(401).json({ code: 'TOKEN_REQUIRED', message: 'Authentication required' });
  }
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    if (decoded.kind === 'refresh') {
      return res.status(401).json({ code: 'TOKEN_INVALID', message: 'Authentication required' });
    }
    req.accessToken = decoded;
    if (!req.headers.authorization) {
      req.headers.authorization = `Bearer ${token}`;
    }
    return next();
  } catch (err) {
    return res.status(401).json(tokenError(err));
  }
};

const authMiddleware = async (req, res, next) => {
  try {
    const token = readRequestToken(req);
    if (!token) {
      return res.status(401).json({ code: 'TOKEN_REQUIRED', message: 'Authentication required' });
    }
    const decoded = req.accessToken || jwt.verify(token, JWT_SECRET);
    req.accessToken = decoded;
    if ((decoded.tokenType || 'user') === 'app') {
      return res.status(401).json({
        code: 'LOGIN_REQUIRED',
        message: 'Please login to continue'
      });
    }
    const user = await User.findById(decoded.id).select('-passwordHash');
    if (!user) {
      return res.status(401).json({ code: 'TOKEN_INVALID', message: 'User not found' });
    }
    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json(tokenError(err));
  }
};

const optionalAuth = async (req, res, next) => {
  try {
    const header = req.headers.authorization || '';
    const token = header.startsWith('Bearer ') ? header.slice(7) : null;
    if (token) {
      const decoded = req.accessToken || jwt.verify(token, JWT_SECRET);
      req.accessToken = decoded;
      if (String(req.get('x-gate-session') || '') === '1') return next();
      if ((decoded.tokenType || 'user') === 'app') return next();
      const user = await User.findById(decoded.id).select('-passwordHash');
      if (user) req.user = user;
    }
    next();
  } catch {
    next();
  }
};

const requireAdmin = (req, res, next) => {
  if (req.accessToken?.tokenType !== 'admin') {
    return res.status(403).json({ message: 'Admin access required' });
  }
  const type = req.user?.userType || (req.user?.role === 'admin' ? 'admin' : 'general');
  if (type !== 'admin') {
    return res.status(403).json({ message: 'Admin access required' });
  }
  next();
};

/** Browser previews (img/iframe) cannot send Authorization; allow ?token= on those GETs. */
const authFromHeaderOrQuery = (req, res, next) => {
  if (!req.headers.authorization && req.query.token) {
    req.headers.authorization = `Bearer ${String(req.query.token)}`;
  }
  return authMiddleware(req, res, next);
};

const requireAdminAuth = (req, res, next) => {
  authFromHeaderOrQuery(req, res, () => requireAdmin(req, res, next));
};

module.exports = {
  authMiddleware,
  optionalAuth,
  requireAdmin,
  authFromHeaderOrQuery,
  requireAdminAuth,
  requireApiToken,
  signAccessToken,
  signRefreshToken,
  JWT_SECRET,
  ACCESS_TOKEN_TTL,
  REFRESH_TOKEN_TTL
};
