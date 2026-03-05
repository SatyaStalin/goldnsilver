import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

export const productService = {
  getAll: () => api.get('/products'),
  getBySlug: (slug) => api.get(`/products/${slug}`),
  getFeatured: () => api.get('/products?featured=true')
};

export const orderService = {
  create: (orderData) => api.post('/orders', orderData),
  processPayment: (orderId, paymentData) => api.post(`/orders/${orderId}/payment`, paymentData),
  getById: (orderId) => api.get(`/orders/${orderId}`)
};

export const adminService = {
  getDashboard: () => api.get('/admin/dashboard'),
  getProducts: (page = 1, limit = 10) => api.get(`/admin/products?page=${page}&limit=${limit}`),
  createProduct: (productData) => api.post('/admin/products', productData),
  updateProduct: (id, productData) => api.put(`/admin/products/${id}`, productData),
  deleteProduct: (id) => api.delete(`/admin/products/${id}`),
  getOrders: () => api.get('/admin/orders'),
  updateOrderStatus: (id, status) => api.put(`/admin/orders/${id}/status`, { status }),
  getUsers: () => api.get('/admin/users'),
  getBuybacks: () => api.get('/admin/buybacks'),
  updateBuyback: (id, data) => api.put(`/admin/buybacks/${id}`, data),
  uploadImage: (formData) => api.post('/admin/products/upload-image', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  importProducts: (formData) => api.post('/products/import/import', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  exportProducts: () => api.get('/products/import/export', { responseType: 'blob' })
};

export const paymentService = {
  createOrder: (data) => api.post('/payment/create-order', data),
  verifyPayment: (data) => api.post('/payment/verify-payment', data)
};

export default api;
