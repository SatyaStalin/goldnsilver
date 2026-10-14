import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const APP_TOKEN_KEY = 'gs_gate_token';
const ADMIN_SESSION_KEY = 'gs_admin_auth';

let adminAccessToken = null;
let adminRefreshToken = null;
let appToken = null;
let appTokenPromise = null;

const gateClient = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' }
});

export const tokenExpiryMs = (token) => {
  try {
    const part = String(token || '').split('.')[1];
    if (!part) return 0;
    const json = JSON.parse(atob(part.replace(/-/g, '+').replace(/_/g, '/')));
    return json.exp ? json.exp * 1000 : 0;
  } catch {
    return 0;
  }
};

const readStoredAppToken = () => {
  try {
    const raw = sessionStorage.getItem(APP_TOKEN_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed?.token || tokenExpiryMs(parsed.token) <= Date.now()) return null;
    return parsed.token;
  } catch {
    return null;
  }
};

const reportGateError = (message, code) => {
  window.dispatchEvent(new CustomEvent('gs-gate-config-error', { detail: { message, code } }));
};

export const fetchAppToken = async (force = false) => {
  const email = String(import.meta.env.VITE_APP_GATE_EMAIL || '').trim();
  const password = String(import.meta.env.VITE_APP_GATE_PASSWORD || '');
  if (!email || !password) {
    const message = 'Superadmin username and password are missing in the frontend env.';
    reportGateError(message, 'GATE_ENV_MISSING');
    throw Object.assign(new Error(message), { code: 'GATE_ENV_MISSING' });
  }

  if (!force) {
    if (appToken && tokenExpiryMs(appToken) > Date.now() + 15000) return appToken;
    const stored = readStoredAppToken();
    if (stored) {
      appToken = stored;
      return appToken;
    }
  }
  if (appTokenPromise && !force) return appTokenPromise;

  appTokenPromise = gateClient
    .post('/auth/login', { email, password, gate: true })
    .then((res) => {
      appToken = res.data?.token || null;
      if (appToken) {
        sessionStorage.setItem(
          APP_TOKEN_KEY,
          JSON.stringify({ token: appToken, exp: tokenExpiryMs(appToken) })
        );
        window.dispatchEvent(new CustomEvent('gs-gate-config-clear'));
      }
      return appToken;
    })
    .catch((err) => {
      const code = err.response?.data?.code;
      const message = err.response?.data?.message || 'Could not start the superadmin session.';
      if (code === 'GATE_MISMATCH' || code === 'GATE_ENV_MISSING') {
        reportGateError(message, code);
      }
      throw err;
    })
    .finally(() => {
      appTokenPromise = null;
    });
  return appTokenPromise;
};

export const setAdminAccessToken = (token, refreshToken) => {
  adminAccessToken = token || null;
  adminRefreshToken = refreshToken || null;
  try {
    if (token) {
      sessionStorage.setItem(
        ADMIN_SESSION_KEY,
        JSON.stringify({ token, refreshToken: refreshToken || null })
      );
    } else {
      sessionStorage.removeItem(ADMIN_SESSION_KEY);
    }
  } catch {
    /* ignore */
  }
};

export const getAdminAccessToken = () => adminAccessToken;

export const getAdminRefreshToken = () => adminRefreshToken;

export const restoreAdminSession = () => {
  try {
    const raw = sessionStorage.getItem(ADMIN_SESSION_KEY);
    if (!raw) return false;
    const parsed = JSON.parse(raw);
    if (!parsed?.token || tokenExpiryMs(parsed.token) <= Date.now()) return false;
    adminAccessToken = parsed.token;
    adminRefreshToken = parsed.refreshToken || null;
    return true;
  } catch {
    return false;
  }
};

const readUserSession = () => {
  try {
    const raw = localStorage.getItem('gs_auth');
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed?.token) return null;
    return parsed;
  } catch {
    return null;
  }
};

const isOpenAuthUrl = (url) => {
  const path = String(url || '').split('?')[0];
  return (
    path.endsWith('/auth/login') ||
    path.endsWith('/auth/register') ||
    path.endsWith('/auth/admin-login') ||
    path.endsWith('/auth/refresh')
  );
};

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

api.interceptors.request.use(async (config) => {
  const url = String(config.url || '');
  if (isOpenAuthUrl(url)) return config;

  const isAdminCall = url.includes('/admin') || url.includes('/products/import');
  if (isAdminCall && adminAccessToken) {
    config.headers.Authorization = `Bearer ${adminAccessToken}`;
    return config;
  }

  const session = readUserSession();
  if (session?.token) {
    config.headers.Authorization = `Bearer ${session.token}`;
    return config;
  }

  try {
    const token = await fetchAppToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      config.headers['X-Gate-Session'] = '1';
    }
  } catch {
    /* server will reject the call */
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const url = String(error.config?.url || '');
    const code = error.response?.data?.code;
    if (!isOpenAuthUrl(url) && (code === 'TOKEN_EXPIRED' || code === 'TOKEN_REQUIRED')) {
      window.dispatchEvent(new CustomEvent('gs-session-expired', { detail: { code } }));
    }
    return Promise.reject(error);
  }
);

const authHeaders = (token) =>
  token ? { Authorization: `Bearer ${token}` } : {};

function buildQueryString(params) {
  const qs = new URLSearchParams();
  if (!params) return '';
  Object.entries(params).forEach(([k, v]) => {
    if (v != null && String(v).trim() !== '') qs.set(k, String(v).trim());
  });
  return qs.toString();
}

export const productService = {
  /** High default limit for cart price sync; supports q, metal, featured, page, limit */
  getAll: (params = {}) => {
    const merged = { limit: 500, page: 1, ...params };
    const q = buildQueryString(merged);
    return api.get(`/products?${q}`);
  },
  getBySlug: (slug) => api.get(`/products/${slug}`),
  getFeatured: (limit = 100) =>
    api.get(`/products?${buildQueryString({ featured: 'true', limit: Math.min(limit, 500), page: 1 })}`)
};

export const authService = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  adminLogin: (data) => api.post('/auth/admin-login', data),
  refresh: (refreshToken) => api.post('/auth/refresh', { refreshToken }),
  checkExists: (params) => api.get('/auth/check', { params }),
  getMe: (token) => api.get('/auth/me', { headers: authHeaders(token) }),
  updateProfile: (data) => api.put('/auth/profile', data),
  changePassword: (data) => api.put('/auth/change-password', data)
};

export const userService = {
  getDashboard: () => api.get('/user/dashboard'),
  getOrders: (params) => api.get('/user/orders', { params }),
  getLastShippingAddress: () => api.get('/user/last-shipping-address'),
  getProfile: () => api.get('/user/profile')
};

export const orderService = {
  create: (orderData) => api.post('/orders', orderData),
  processPayment: (orderId, paymentData) => api.post(`/orders/${orderId}/payment`, paymentData),
  getById: (orderId) => api.get(`/orders/${orderId}`),
  getByPaymentOrderId: (PaymentOrderId) => api.get(`/orders/payment/${PaymentOrderId}`)
};

export const cartService = {
  get: () => api.get('/cart'),
  save: (items) => api.put('/cart', { items }),
  clear: () => api.delete('/cart')
};

export const kycService = {
  getMe: () => api.get('/kyc/me'),
  submitManual: (formData) =>
    api.post('/kyc/manual', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    }),
  completeDigilocker: (data) => api.post('/kyc/digilocker/complete', data),
  adminList: (params) => api.get('/kyc/admin/list', { params }),
  adminReview: (kycId, data) => api.put(`/kyc/admin/${kycId}/review`, data)
};

export const adminService = {
  getDashboard: () => api.get('/admin/dashboard'),
  getProducts: (page = 1, limit = 10, pricingMode, extra = {}) => {
    const qs = new URLSearchParams({
      page: String(page),
      limit: String(limit)
    });
    if (pricingMode) qs.set('pricingMode', pricingMode);
    Object.entries(extra).forEach(([k, v]) => {
      if (v != null && String(v).trim() !== '') qs.set(k, String(v).trim());
    });
    return api.get(`/admin/products?${qs.toString()}`);
  },
  createProduct: (productData) => api.post('/admin/products', productData),
  updateProduct: (id, productData) => api.put(`/admin/products/${id}`, productData),
  deleteProduct: (id) => api.delete(`/admin/products/${id}`),
  getOrders: (params) => {
    const q = buildQueryString(params);
    return api.get(q ? `/admin/orders?${q}` : '/admin/orders');
  },
  updateOrderStatus: (id, status) => api.put(`/admin/orders/${id}/status`, { status }),
  getSequelStatus: () => api.get('/admin/sequel/status'),
  createSequelAddress: (data) => api.post('/admin/sequel/addresses', data),
  searchSequelAddress: (keyword) => api.post('/admin/sequel/addresses/search', { keyword }),
  saveSequelShipping: (orderId, data) => api.put(`/admin/orders/${orderId}/shipping`, data),
  bookSequelShipment: (orderId, data) => api.post(`/admin/orders/${orderId}/sequel/book`, data || {}),
  trackSequelShipment: (orderId) => api.post(`/admin/orders/${orderId}/sequel/track`),
  cancelSequelShipment: (orderId, reason) =>
    api.post(`/admin/orders/${orderId}/sequel/cancel`, { reason }),
  getUsers: (params) => {
    const q = buildQueryString(params);
    return api.get(q ? `/admin/users?${q}` : '/admin/users');
  },
  getBuybacks: (params) => {
    const q = buildQueryString(params);
    return api.get(q ? `/admin/buybacks?${q}` : '/admin/buybacks');
  },
  updateBuyback: (id, data) => api.put(`/admin/buybacks/${id}`, data),
  getKycList: (params) => {
    const q = buildQueryString(params);
    return api.get(q ? `/admin/kyc?${q}` : '/admin/kyc');
  },
  reviewKyc: (kycId, data) => api.put(`/admin/kyc/${kycId}/review`, data),
  getKycDocumentUrl: (kycId, type) => {
    const token = getAdminAccessToken();
    const q = token ? `?token=${encodeURIComponent(token)}` : '';
    return `${API_BASE_URL}/admin/kyc/${kycId}/documents/${type}${q}`;
  },
  uploadImage: (formData) => api.post('/admin/products/upload-image', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  importProducts: (formData) => api.post('/products/import/import', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  exportProducts: () => api.get('/products/import/export', { responseType: 'blob' }),
  getGoldRates: () => api.get('/admin/gold-rates'),
  updateGoldRates: (data) => api.put('/admin/gold-rates', data),
  registerSafeGoldForUser: (userId) => api.post(`/admin/users/${userId}/safegold/register`),
  resetSafeGoldForUser: (userId) => api.delete(`/admin/users/${userId}/safegold/reset`),
  updateUser: (userId, data) => api.put(`/admin/users/${userId}`, data),
  deleteUser: (userId) => api.delete(`/admin/users/${userId}`)
};

export const sequelService = {
  getStatus: () => api.get('/sequel/status'),
  checkServiceability: (pinCode) => api.post('/sequel/serviceability', { pinCode }),
  estimateDelivery: (pinCode) => api.post('/sequel/edd', { pinCode }),
  getOrderShipment: (orderId) => api.get(`/sequel/orders/${orderId}`),
  trackOrder: (orderId) => api.post(`/sequel/orders/${orderId}/track`)
};

export const paymentService = {
  createOrder: (data) => api.post('/payment/create-order', data),
  verifyPayment: (data) => api.post('/payment/verify-payment', data)
};

export const safegoldService = {
  getStatus: () => api.get('/safegold/status'),
  testConnection: () => api.get('/safegold/test-connection'),
  getBuyPrice: () => api.get('/safegold/buy-price'),
  getSellPrice: () => api.get('/safegold/sell-price'),
  getQuote: (data) => api.post('/safegold/buy/quote', data),
  getSellQuote: (data) => api.post('/safegold/sell/quote', data),
  getCustomer: () => api.get('/safegold/customer'),
  registerCustomer: () => api.post('/safegold/customer/register'),
  resetCustomerLink: () => api.delete('/safegold/customer/reset'),
  getHoldings: () => api.get('/safegold/holdings'),
  getDashboard: () => api.get('/safegold/dashboard'),
  getTransactions: (params) => api.get('/safegold/transactions', { params }),
  getTransaction: (id) => api.get(`/safegold/transactions/${id}`),
  getInvoice: (params) => api.get('/safegold/invoice', { params }),
  getTransactionInvoice: (id, params) =>
    api.get(`/safegold/transactions/${id}/invoice`, { params }),
  /** Same-tab popup iframe src — proxied SafeGold original invoice */
  getInvoiceViewUrl: (transactionId, { download = false } = {}) => {
    let token = '';
    try {
      const raw = localStorage.getItem('gs_auth');
      if (raw) token = JSON.parse(raw).token || '';
    } catch {
      /* ignore */
    }
    const params = new URLSearchParams();
    if (token) params.set('token', token);
    if (download) params.set('download', '1');
    const q = params.toString();
    return `${API_BASE_URL}/safegold/transactions/${transactionId}/invoice/view${q ? `?${q}` : ''}`;
  },
  /**
   * SafeGold blocks server-side fetches from our host (HTTP 403) and forbids framing its page,
   * but allows CORS — so load the PDF in the browser and frame a same-origin blob URL.
   * Falls back to the backend proxy when the browser fetch is not possible.
   */
  loadInvoiceSource: async (transactionId, invoiceUrl) => {
    if (invoiceUrl && /^https?:\/\//i.test(invoiceUrl)) {
      try {
        const res = await fetch(invoiceUrl, {
          mode: 'cors',
          credentials: 'omit',
          signal: AbortSignal.timeout(20000)
        });
        if (res.ok) {
          const type = (res.headers.get('content-type') || '').toLowerCase();
          const blob = await res.blob();
          if (blob.size > 0 && (type.includes('pdf') || type.includes('html'))) {
            const objectUrl = URL.createObjectURL(
              type.includes('pdf') ? new Blob([blob], { type: 'application/pdf' }) : blob
            );
            return { viewSrc: objectUrl, downloadHref: objectUrl, objectUrl, direct: true };
          }
        }
      } catch {
        /* fall through to backend proxy */
      }
    }
    return {
      viewSrc: safegoldService.getInvoiceViewUrl(transactionId),
      downloadHref: safegoldService.getInvoiceViewUrl(transactionId, { download: true }),
      objectUrl: null,
      direct: false
    };
  },
  initiateBuy: (data) => api.post('/safegold/buy/initiate', data),
  initiateSell: (data) => api.post('/safegold/sell/initiate', data),
  cancelPendingBuy: (data) => api.post('/safegold/buy/cancel-pending', data || {})
};

const zerodhaAuthHeaders = (accessToken) =>
  accessToken ? { 'x-zerodha-token': accessToken } : {};

export const zerodhaService = {
  getLoginUrl: () => api.get('/zerodha/login-url'),
  getSessionStatus: () => api.get('/zerodha/session-status'),
  generateToken: (requestToken) => api.post('/zerodha/generate-token', { request_token: requestToken }),
  getMarketData: (accessToken) => api.get('/zerodha/market-data', {
    headers: zerodhaAuthHeaders(accessToken)
  }),
  getETFs: (accessToken, { refresh = false } = {}) => api.get('/zerodha/etfs', {
    params: refresh ? { refresh: '1' } : undefined,
    headers: zerodhaAuthHeaders(accessToken)
  }),
  getProfile: (accessToken) => api.get('/zerodha/profile', {
    headers: zerodhaAuthHeaders(accessToken)
  })
};

export default api;
export { API_BASE_URL };
