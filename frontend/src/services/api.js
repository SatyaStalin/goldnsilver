import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

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

export const orderService = {
  create: (orderData) => api.post('/orders', orderData),
  processPayment: (orderId, paymentData) => api.post(`/orders/${orderId}/payment`, paymentData),
  getById: (orderId) => api.get(`/orders/${orderId}`),
  getByPaymentOrderId: (PaymentOrderId) => api.get(`/orders/payment/${PaymentOrderId}`)
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
  getUsers: (params) => {
    const q = buildQueryString(params);
    return api.get(q ? `/admin/users?${q}` : '/admin/users');
  },
  getBuybacks: (params) => {
    const q = buildQueryString(params);
    return api.get(q ? `/admin/buybacks?${q}` : '/admin/buybacks');
  },
  updateBuyback: (id, data) => api.put(`/admin/buybacks/${id}`, data),
  uploadImage: (formData) => api.post('/admin/products/upload-image', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  importProducts: (formData) => api.post('/products/import/import', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  exportProducts: () => api.get('/products/import/export', { responseType: 'blob' }),
  getGoldRates: () => api.get('/admin/gold-rates'),
  updateGoldRates: (data) => api.put('/admin/gold-rates', data)
};

export const paymentService = {
  createOrder: (data) => api.post('/payment/create-order', data),
  verifyPayment: (data) => api.post('/payment/verify-payment', data)
};

const zerodhaAuthHeaders = (accessToken) =>
  accessToken
    ? {
        'x-zerodha-token': accessToken,
        Authorization: `Bearer ${accessToken}`
      }
    : {};

export const zerodhaService = {
  getLoginUrl: () => api.get('/zerodha/login-url'),
  generateToken: (requestToken) => api.post('/zerodha/generate-token', { request_token: requestToken }),
  getMarketData: (accessToken) => api.get('/zerodha/market-data', {
    headers: zerodhaAuthHeaders(accessToken)
  }),
  getETFs: (accessToken) => api.get('/zerodha/etfs', {
    headers: zerodhaAuthHeaders(accessToken)
  }),
  getProfile: (accessToken) => api.get('/zerodha/profile', {
    headers: zerodhaAuthHeaders(accessToken)
  })
};

export default api;
