import { useState, useEffect } from 'react';
import { useToast } from '../state/ToastContext';
import { adminService } from '../services/api';

const AdminPage = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [users, setUsers] = useState([]);
  const [buybackRequests, setBuybackRequests] = useState([]);
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [loadingBuybacks, setLoadingBuybacks] = useState(false);
  const [loadingDashboard, setLoadingDashboard] = useState(false);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 10
  });
  const [showProductForm, setShowProductForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [productForm, setProductForm] = useState({
    name: '',
    slug: '',
    metal: 'gold',
    type: 'digital',
    category: '',
    description: '',
    pricePerUnit: 0,
    unit: 'gram',
    stock: 0,
    imageUrl: '',
    isFeatured: false,
    isActive: true
  });
  const { showToast } = useToast();


  const handleLogin = (e) => {
    e.preventDefault();
    if (username === 'admin' && password === 'admin@1432') {
      setIsLoggedIn(true);
      showToast('Login successful!', 'success');
    } else {
      showToast('Invalid credentials!', 'error');
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setUsername('');
    setPassword('');
    setActiveTab('dashboard');
    showToast('Logged out successfully', 'info');
  };

  useEffect(() => {
    if (isLoggedIn) {
      if (activeTab === 'dashboard') {
        fetchDashboard();
      } else if (activeTab === 'products') {
        fetchProducts(pagination.currentPage);
      } else if (activeTab === 'sale-orders') {
        fetchOrders();
      } else if (activeTab === 'users') {
        fetchUsers();
      } else if (activeTab === 'gold-buyback') {
        fetchBuybackRequests();
      }
    }
  }, [isLoggedIn, activeTab, pagination.currentPage]);

  const fetchDashboard = async () => {
    setLoadingDashboard(true);
    try {
      const response = await adminService.getDashboard();
      setDashboardData(response.data);
    } catch (error) {
      showToast('Error fetching dashboard data', 'error');
    } finally {
      setLoadingDashboard(false);
    }
  };

  const fetchOrders = async () => {
    setLoadingOrders(true);
    try {
      const response = await adminService.getOrders();
      setOrders(response.data);
    } catch (error) {
      showToast('Error fetching orders', 'error');
    } finally {
      setLoadingOrders(false);
    }
  };

  const fetchUsers = async () => {
    setLoadingUsers(true);
    try {
      const response = await adminService.getUsers();
      setUsers(response.data);
    } catch (error) {
      showToast('Error fetching users', 'error');
    } finally {
      setLoadingUsers(false);
    }
  };

  const fetchBuybackRequests = async () => {
    setLoadingBuybacks(true);
    try {
      const response = await adminService.getBuybacks();
      setBuybackRequests(response.data);
    } catch (error) {
      showToast('Error fetching buyback requests', 'error');
    } finally {
      setLoadingBuybacks(false);
    }
  };

  const handleBuybackStatusChange = async (id, newStatus) => {
    try {
      await adminService.updateBuyback(id, { status: newStatus });
      showToast('Buyback status updated', 'success');
      fetchBuybackRequests();
    } catch (error) {
      showToast('Error updating buyback status', 'error');
    }
  };

  const fetchProducts = async (page = 1) => {
    setLoading(true);
    try {
      const response = await adminService.getProducts(page, pagination.itemsPerPage);
      setProducts(response.data.products);
      setPagination(response.data.pagination);
    } catch (error) {
      showToast('Error fetching products', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      showToast('Image size must be less than 5MB', 'error');
      return;
    }

    setUploadingImage(true);
    try {
      const formData = new FormData();
      formData.append('image', file);
      const response = await adminService.uploadImage(formData);
      const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      setProductForm({ ...productForm, imageUrl: `${baseUrl}${response.data.imageUrl}` });
      showToast('Image uploaded successfully', 'success');
    } catch (error) {
      showToast('Error uploading image', 'error');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleCSVImport = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);
    try {
      const response = await adminService.importProducts(formData);
      showToast(`Imported ${response.data.imported} products successfully`, 'success');
      fetchProducts(pagination.currentPage);
    } catch (error) {
      showToast('Error importing products', 'error');
    }
  };

  const handleCSVExport = async () => {
    try {
      const response = await adminService.exportProducts();
      const blob = new Blob([response.data], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `products-export-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      showToast('Products exported successfully', 'success');
    } catch (error) {
      showToast('Error exporting products', 'error');
    }
  };

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await adminService.updateOrderStatus(orderId, newStatus);
      showToast(`Order status updated to ${newStatus}`, 'success');
      fetchOrders(); // Refresh orders
    } catch (error) {
      showToast('Error updating order status', 'error');
    }
  };

  const handleProductSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingProduct) {
        await adminService.updateProduct(editingProduct._id, productForm);
        showToast('Product updated successfully', 'success');
      } else {
        await adminService.createProduct(productForm);
        showToast('Product created successfully', 'success');
      }
      setShowProductForm(false);
      setEditingProduct(null);
      resetProductForm();
      fetchProducts(pagination.currentPage);
    } catch (error) {
      showToast(error.response?.data?.message || 'Error saving product', 'error');
    }
  };

  const handleEditProduct = (product) => {
    setEditingProduct(product);
    setProductForm({
      name: product.name || '',
      slug: product.slug || '',
      metal: product.metal || 'gold',
      type: product.type || 'digital',
      category: product.category || '',
      description: product.description || '',
      pricePerUnit: product.pricePerUnit || 0,
      unit: product.unit || 'gram',
      stock: product.stock || 0,
      imageUrl: product.imageUrl || '',
      isFeatured: product.isFeatured || false,
      isActive: product.isActive !== undefined ? product.isActive : true
    });
    setShowProductForm(true);
  };

  const handleDeleteProduct = async (id) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;
    try {
      await adminService.deleteProduct(id);
      showToast('Product deleted successfully', 'success');
      fetchProducts(pagination.currentPage);
    } catch (error) {
      showToast('Error deleting product', 'error');
    }
  };

  const resetProductForm = () => {
    setProductForm({
      name: '',
      slug: '',
      metal: 'gold',
      type: 'digital',
      category: '',
      description: '',
      pricePerUnit: 0,
      unit: 'gram',
      stock: 0,
      imageUrl: '',
      isFeatured: false,
      isActive: true
    });
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: '#f59e0b',
      confirmed: '#3b82f6',
      shipped: '#8b5cf6',
      delivered: '#10b981',
      approved: '#10b981',
      rejected: '#ef4444',
      paid: '#10b981',
      ordered: '#f59e0b',
      received: '#10b981',
      cancelled: '#ef4444'
    };
    return colors[status] || '#6b7280';
  };

  // Dashboard data

  if (!isLoggedIn) {
    return (
      <div className="page">
        <div className="page-hero">
          <h1 className="page-hero-title">Admin Login</h1>
          <p className="page-hero-desc">Enter your credentials to access the admin panel</p>
        </div>
        <section className="panel page-feature" style={{ maxWidth: '400px', margin: '0 auto' }}>
          <form className="form" onSubmit={handleLogin}>
            <label>
              Username
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter username"
                required
              />
            </label>
            <label>
              Password
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                required
              />
            </label>
            <button className="btn-primary" type="submit">
              Login
            </button>
          </form>
        </section>
      </div>
    );
  }

  return (
    <div className="page admin-page">
      <div className="admin-header">
        <h1>Admin Dashboard</h1>
        <button className="btn-secondary" onClick={handleLogout}>
          Logout
        </button>
      </div>

      <div className="admin-tabs">
        <button
          className={`admin-tab ${activeTab === 'dashboard' ? 'active' : ''}`}
          onClick={() => setActiveTab('dashboard')}
        >
          Dashboard
        </button>
        <button
          className={`admin-tab ${activeTab === 'sale-orders' ? 'active' : ''}`}
          onClick={() => setActiveTab('sale-orders')}
        >
          Orders
        </button>
        <button
          className={`admin-tab ${activeTab === 'gold-buyback' ? 'active' : ''}`}
          onClick={() => setActiveTab('gold-buyback')}
        >
          Gold Buy Back
        </button>
        <button
          className={`admin-tab ${activeTab === 'products' ? 'active' : ''}`}
          onClick={() => setActiveTab('products')}
        >
          Products
        </button>
        <button
          className={`admin-tab ${activeTab === 'users' ? 'active' : ''}`}
          onClick={() => setActiveTab('users')}
        >
          Users
        </button>
      </div>

      <div className="admin-content">
        {activeTab === 'dashboard' && (
          <div className="admin-dashboard">
            {loadingDashboard ? (
              <div style={{ textAlign: 'center', padding: '2rem' }}>Loading dashboard...</div>
            ) : dashboardData ? (
              <>
                <div className="dashboard-stats">
                  <div className="dashboard-stat-card">
                    <h3>Total Revenue</h3>
                    <div className="stat-value">₹{dashboardData.totalRevenue?.toLocaleString() || '0'}</div>
                  </div>
                  <div className="dashboard-stat-card">
                    <h3>Total Orders</h3>
                    <div className="stat-value">{dashboardData.totalOrders || 0}</div>
                  </div>
                  <div className="dashboard-stat-card">
                    <h3>Pending Orders</h3>
                    <div className="stat-value">{dashboardData.pendingOrders || 0}</div>
                  </div>
                  <div className="dashboard-stat-card">
                    <h3>Completed Orders</h3>
                    <div className="stat-value">{dashboardData.completedOrders || 0}</div>
                  </div>
                </div>

                <div className="dashboard-charts">
                  <div className="chart-card">
                    <h3>Monthly Revenue</h3>
                    {dashboardData.monthlyRevenue && dashboardData.monthlyRevenue.length > 0 ? (
                      <div className="bar-chart">
                        {dashboardData.monthlyRevenue.map((value, index) => {
                          const maxValue = Math.max(...dashboardData.monthlyRevenue, 1);
                          return (
                            <div key={index} className="bar-chart-item">
                              <div className="bar-chart-bar" style={{ height: `${(value / maxValue) * 100}%` }}>
                                <span className="bar-value">₹{(value / 100000).toFixed(1)}L</span>
                              </div>
                              <div className="bar-chart-label">{dashboardData.monthlyLabels?.[index] || `Month ${index + 1}`}</div>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <p style={{ textAlign: 'center', padding: '2rem', color: '#7a6d4a' }}>No revenue data available</p>
                    )}
                  </div>

                  <div className="chart-card">
                    <h3>Revenue Distribution</h3>
                    {dashboardData.productDistribution && dashboardData.productDistribution.length > 0 ? (
                      <div className="pie-chart">
                        {dashboardData.productDistribution.map((item, index) => {
                          const total = dashboardData.productDistribution.reduce((sum, i) => sum + i.revenue, 0);
                          const percentage = (item.revenue / total) * 100;
                          const colors = ['#d4af37', '#c0c0c0', '#e0b63a', '#f4d03f'];
                          return (
                            <div key={index} className="pie-segment" style={{ '--percentage': `${percentage}%`, '--color': colors[index % colors.length] }}>
                              <span>{item._id || 'Other'} ({percentage.toFixed(1)}%)</span>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <p style={{ textAlign: 'center', padding: '2rem', color: '#7a6d4a' }}>No distribution data available</p>
                    )}
                  </div>
                </div>
              </>
            ) : (
              <div style={{ textAlign: 'center', padding: '2rem' }}>No dashboard data available</div>
            )}
          </div>
        )}

        {activeTab === 'sale-orders' && (
          <div className="admin-orders">
            <h2>Orders</h2>
            {loadingOrders ? (
              <div style={{ textAlign: 'center', padding: '2rem' }}>Loading orders...</div>
            ) : (
              <div className="orders-table-wrapper">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Order ID</th>
                      <th>Customer Name</th>
                      <th>Customer Email</th>
                      <th>Items</th>
                      <th>Amount</th>
                      <th>Date</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.length === 0 ? (
                      <tr>
                        <td colSpan="8" style={{ textAlign: 'center', padding: '2rem' }}>
                          No orders found.
                        </td>
                      </tr>
                    ) : (
                      orders.map((order) => (
                        <tr key={order._id}>
                          <td>{order._id.slice(-12)}</td>
                          <td>{order.customerName || order.user?.name || 'Guest'}</td>
                          <td>{order.customerEmail || order.user?.email || 'N/A'}</td>
                          <td>
                            {order.items?.map((item, idx) => (
                              <div key={idx} style={{ fontSize: '0.85rem' }}>
                                {item.name || item.product?.name || 'Product'} ({item.quantity})
                              </div>
                            ))}
                          </td>
                          <td>₹{order.totalAmount?.toLocaleString() || '0'}</td>
                          <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                          <td>
                            <select
                              className="status-select"
                              value={order.status}
                              onChange={(e) => handleStatusChange(order._id, e.target.value)}
                              style={{ backgroundColor: getStatusColor(order.status) + '20', color: getStatusColor(order.status) }}
                            >
                              <option value="pending">Pending</option>
                              <option value="paid">Paid</option>
                              <option value="shipped">Shipped</option>
                              <option value="delivered">Delivered</option>
                              <option value="cancelled">Cancelled</option>
                              <option value="failed">Failed</option>
                            </select>
                          </td>
                          <td>
                            <button
                              className="btn-view-details"
                              onClick={() => setSelectedOrder(order)}
                            >
                              View Details
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {activeTab === 'gold-buyback' && (
          <div className="admin-orders">
            <h2>Gold Buy Back Requests</h2>
            {loadingBuybacks ? (
              <div style={{ textAlign: 'center', padding: '2rem' }}>Loading buyback requests...</div>
            ) : (
              <div className="orders-table-wrapper">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Request ID</th>
                      <th>Customer Name</th>
                      <th>Metal</th>
                      <th>Weight (grams)</th>
                      <th>Estimated Value</th>
                      <th>Payout Method</th>
                      <th>Date</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {buybackRequests.length === 0 ? (
                      <tr>
                        <td colSpan="9" style={{ textAlign: 'center', padding: '2rem' }}>
                          No buyback requests found.
                        </td>
                      </tr>
                    ) : (
                      buybackRequests.map((buyback) => (
                        <tr key={buyback._id}>
                          <td>{buyback._id.slice(-8)}</td>
                          <td>{buyback.customerName}</td>
                          <td style={{ textTransform: 'capitalize' }}>{buyback.metal}</td>
                          <td>{buyback.weightInGrams}g</td>
                          <td>₹{buyback.estimatedValue?.toLocaleString()}</td>
                          <td style={{ textTransform: 'capitalize' }}>
                            {buyback.payoutMethod?.replace('_', ' ')}
                          </td>
                          <td>{new Date(buyback.createdAt).toLocaleDateString()}</td>
                          <td>
                            <select
                              className="status-select"
                              value={buyback.status}
                              onChange={(e) => handleBuybackStatusChange(buyback._id, e.target.value)}
                              style={{ 
                                backgroundColor: getStatusColor(buyback.status) + '20', 
                                color: getStatusColor(buyback.status) 
                              }}
                            >
                              <option value="pending">Pending</option>
                              <option value="approved">Approved</option>
                              <option value="rejected">Rejected</option>
                              <option value="paid">Paid</option>
                            </select>
                          </td>
                          <td>
                            <button
                              className="btn-view-details"
                              onClick={() => setSelectedOrder(buyback)}
                            >
                              View Details
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {activeTab === 'products' && (
          <div className="admin-section">
            <div className="admin-section-header">
              <h2>Product Management</h2>
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <label className="btn-secondary" style={{ cursor: 'pointer', margin: 0 }}>
                  Import CSV
                  <input
                    type="file"
                    accept=".csv"
                    onChange={handleCSVImport}
                    style={{ display: 'none' }}
                  />
                </label>
                <button className="btn-secondary" onClick={handleCSVExport}>
                  Export CSV
                </button>
                <a
                  href="/sample-products.csv"
                  download="sample-products.csv"
                  className="btn-secondary"
                  style={{ textDecoration: 'none', display: 'inline-block' }}
                  onClick={(e) => {
                    e.preventDefault();
                    window.open(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/sample-products.csv`, '_blank');
                  }}
                >
                  Download Sample
                </a>
                <button 
                  className="btn-primary" 
                  onClick={() => {
                    resetProductForm();
                    setEditingProduct(null);
                    setShowProductForm(true);
                  }}
                >
                  Add New Product
                </button>
              </div>
            </div>

            {showProductForm && (
              <div className="product-form-modal">
                <div className="product-form-content">
                  <div className="product-form-header">
                    <h3>{editingProduct ? 'Edit Product' : 'Add New Product'}</h3>
                    <button className="form-close-btn" onClick={() => {
                      setShowProductForm(false);
                      setEditingProduct(null);
                      resetProductForm();
                    }}>×</button>
                  </div>
                  <form className="product-form" onSubmit={handleProductSubmit}>
                    <div className="form-row">
                      <label>
                        Product Name *
                        <input
                          type="text"
                          value={productForm.name}
                          onChange={(e) => {
                            setProductForm({ ...productForm, name: e.target.value });
                            if (!editingProduct) {
                              setProductForm(prev => ({
                                ...prev,
                                slug: e.target.value.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
                              }));
                            }
                          }}
                          required
                        />
                      </label>
                      <label>
                        Slug *
                        <input
                          type="text"
                          value={productForm.slug}
                          onChange={(e) => setProductForm({ ...productForm, slug: e.target.value })}
                          required
                        />
                      </label>
                    </div>
                    <div className="form-row">
                      <label>
                        Metal *
                        <select
                          value={productForm.metal}
                          onChange={(e) => setProductForm({ ...productForm, metal: e.target.value })}
                          required
                        >
                          <option value="gold">Gold</option>
                          <option value="silver">Silver</option>
                          <option value="gold+silver">Gold + Silver</option>
                        </select>
                      </label>
                      <label>
                        Type *
                        <select
                          value={productForm.type}
                          onChange={(e) => setProductForm({ ...productForm, type: e.target.value })}
                          required
                        >
                          <option value="digital">Digital</option>
                          <option value="physical_coin">Physical Coin</option>
                          <option value="physical_bar">Physical Bar</option>
                          <option value="gifting">Gifting</option>
                          <option value="sip">SIP</option>
                          <option value="fund">Fund</option>
                          <option value="etf">ETF</option>
                          <option value="sovereign_bond">Sovereign Bond</option>
                        </select>
                      </label>
                    </div>
                    <div className="form-row">
                      <label>
                        Category
                        <input
                          type="text"
                          value={productForm.category}
                          onChange={(e) => setProductForm({ ...productForm, category: e.target.value })}
                        />
                      </label>
                      <label>
                        Unit
                        <input
                          type="text"
                          value={productForm.unit}
                          onChange={(e) => setProductForm({ ...productForm, unit: e.target.value })}
                          placeholder="gram, month, etc"
                        />
                      </label>
                    </div>
                    <label>
                      Description
                      <textarea
                        value={productForm.description}
                        onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                        rows="3"
                      />
                    </label>
                    <div className="form-row">
                      <label>
                        Price Per Unit *
                        <input
                          type="number"
                          value={productForm.pricePerUnit}
                          onChange={(e) => setProductForm({ ...productForm, pricePerUnit: parseFloat(e.target.value) || 0 })}
                          required
                          min="0"
                          step="0.01"
                        />
                      </label>
                      <label>
                        Stock *
                        <input
                          type="number"
                          value={productForm.stock}
                          onChange={(e) => setProductForm({ ...productForm, stock: parseInt(e.target.value) || 0 })}
                          required
                          min="0"
                        />
                      </label>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      <label>
                        Product Image
                        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-end' }}>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleImageUpload}
                            disabled={uploadingImage}
                            style={{ flex: 1 }}
                          />
                          {uploadingImage && <span>Uploading...</span>}
                        </div>
                      </label>
                      {productForm.imageUrl && (
                        <div style={{ marginTop: '0.5rem' }}>
                          <img
                            src={productForm.imageUrl}
                            alt="Preview"
                            style={{ width: '150px', height: '150px', objectFit: 'cover', borderRadius: '8px', border: '1px solid rgba(212, 175, 55, 0.3)' }}
                          />
                        </div>
                      )}
                      <label>
                        Or enter Image URL
                        <input
                          type="url"
                          value={productForm.imageUrl}
                          onChange={(e) => setProductForm({ ...productForm, imageUrl: e.target.value })}
                          placeholder="https://..."
                        />
                      </label>
                    </div>
                    <div className="form-row">
                      <label className="checkbox-label">
                        <input
                          type="checkbox"
                          checked={productForm.isFeatured}
                          onChange={(e) => setProductForm({ ...productForm, isFeatured: e.target.checked })}
                        />
                        Featured Product
                      </label>
                      <label className="checkbox-label">
                        <input
                          type="checkbox"
                          checked={productForm.isActive}
                          onChange={(e) => setProductForm({ ...productForm, isActive: e.target.checked })}
                        />
                        Active
                      </label>
                    </div>
                    <div className="form-actions">
                      <button type="button" className="btn-secondary" onClick={() => {
                        setShowProductForm(false);
                        setEditingProduct(null);
                        resetProductForm();
                      }}>
                        Cancel
                      </button>
                      <button type="submit" className="btn-primary">
                        {editingProduct ? 'Update Product' : 'Create Product'}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            {loading ? (
              <div style={{ textAlign: 'center', padding: '2rem' }}>Loading products...</div>
            ) : (
              <div className="products-table-wrapper">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Category</th>
                      <th>Metal</th>
                      <th>Price</th>
                      <th>Stock</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.length === 0 ? (
                      <tr>
                        <td colSpan="7" style={{ textAlign: 'center', padding: '2rem' }}>
                          No products found. Click "Add New Product" to create one.
                        </td>
                      </tr>
                    ) : (
                      products.map((product) => (
                        <tr key={product._id}>
                          <td>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                              {product.imageUrl && (
                                <img 
                                  src={product.imageUrl} 
                                  alt={product.name}
                                  style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '4px' }}
                                />
                              )}
                              <span>{product.name}</span>
                            </div>
                          </td>
                          <td>{product.category || '-'}</td>
                          <td>{product.metal}</td>
                          <td>₹{product.pricePerUnit?.toLocaleString()}</td>
                          <td>
                            <span style={{ 
                              color: product.stock === 0 ? '#ef4444' : product.stock < 10 ? '#f59e0b' : '#10b981',
                              fontWeight: '600'
                            }}>
                              {product.stock}
                            </span>
                          </td>
                          <td>
                            <span style={{
                              padding: '0.25rem 0.5rem',
                              borderRadius: '999px',
                              fontSize: '0.75rem',
                              fontWeight: '600',
                              backgroundColor: product.isActive ? '#10b98120' : '#ef444420',
                              color: product.isActive ? '#10b981' : '#ef4444'
                            }}>
                              {product.isActive ? 'Active' : 'Inactive'}
                            </span>
                          </td>
                          <td>
                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                              <button
                                className="btn-view-details"
                                onClick={() => handleEditProduct(product)}
                                style={{ fontSize: '0.8rem', padding: '0.3rem 0.8rem' }}
                              >
                                Edit
                              </button>
                              <button
                                className="btn-secondary"
                                onClick={() => handleDeleteProduct(product._id)}
                                style={{ fontSize: '0.8rem', padding: '0.3rem 0.8rem', backgroundColor: '#ef4444', color: '#fff' }}
                              >
                                Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="pagination">
                <button
                  className="pagination-btn"
                  onClick={() => fetchProducts(pagination.currentPage - 1)}
                  disabled={pagination.currentPage === 1}
                >
                  Previous
                </button>
                <span className="pagination-info">
                  Page {pagination.currentPage} of {pagination.totalPages} ({pagination.totalItems} total)
                </span>
                <button
                  className="pagination-btn"
                  onClick={() => fetchProducts(pagination.currentPage + 1)}
                  disabled={pagination.currentPage === pagination.totalPages}
                >
                  Next
                </button>
              </div>
            )}
          </div>
        )}

        {activeTab === 'users' && (
          <div className="admin-users">
            <h2>Purchased Users</h2>
            {loadingUsers ? (
              <div style={{ textAlign: 'center', padding: '2rem' }}>Loading users...</div>
            ) : (
              <div className="orders-table-wrapper">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Phone</th>
                      <th>Total Orders</th>
                      <th>Total Spent</th>
                      <th>Last Purchase Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.length === 0 ? (
                      <tr>
                        <td colSpan="6" style={{ textAlign: 'center', padding: '2rem' }}>
                          No users found.
                        </td>
                      </tr>
                    ) : (
                      users.map((user) => (
                        <tr key={user._id}>
                          <td>{user.name || 'Guest'}</td>
                          <td>{user.email || 'N/A'}</td>
                          <td>{user.phone || 'N/A'}</td>
                          <td>{user.totalOrders || 0}</td>
                          <td>₹{user.totalSpent?.toLocaleString() || '0'}</td>
                          <td>{user.lastPurchaseDate ? new Date(user.lastPurchaseDate).toLocaleString() : 'N/A'}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>

      {selectedOrder && (
        <div className="order-modal">
          <div className="order-modal-content">
            <div className="order-modal-header">
              <h2>Order Details - {selectedOrder._id?.slice(-12) || selectedOrder.id}</h2>
              <button className="order-modal-close" onClick={() => setSelectedOrder(null)}>×</button>
            </div>
            <div className="order-modal-body">
              <div className="order-detail-row">
                <strong>Order ID:</strong> <span>{selectedOrder._id || selectedOrder.id}</span>
              </div>
              <div className="order-detail-row">
                <strong>Customer:</strong> <span>{selectedOrder.user?.name || selectedOrder.customerName || selectedOrder.customer || 'Guest'}</span>
              </div>
              <div className="order-detail-row">
                <strong>Email:</strong> <span>{selectedOrder.user?.email || selectedOrder.customerEmail || 'N/A'}</span>
              </div>
              <div className="order-detail-row">
                <strong>Phone:</strong> <span>{selectedOrder.customerPhone || 'N/A'}</span>
              </div>
              <div className="order-detail-row">
                <strong>Date:</strong> <span>{new Date(selectedOrder.createdAt || selectedOrder.date || Date.now()).toLocaleString()}</span>
              </div>
              <div className="order-detail-row">
                <strong>Status:</strong> <span style={{ textTransform: 'capitalize' }}>{selectedOrder.status}</span>
              </div>
              <div className="order-detail-row">
                <strong>Payment Status:</strong> <span style={{ textTransform: 'capitalize' }}>{selectedOrder.paymentStatus || 'N/A'}</span>
              </div>
              <div className="order-detail-row">
                <strong>Total Amount:</strong> <span>₹{selectedOrder.totalAmount?.toLocaleString() || selectedOrder.amount?.toLocaleString() || '0'}</span>
              </div>
              <div className="order-detail-row">
                <strong>Items:</strong>
                <ul style={{ marginTop: '0.5rem', paddingLeft: '1.5rem' }}>
                  {selectedOrder.items?.map((item, idx) => (
                    <li key={idx}>
                      {item.name || item.product?.name || selectedOrder.product || 'Product'} - 
                      Qty: {item.quantity || 1} × ₹{item.price?.toLocaleString() || item.product?.pricePerUnit?.toLocaleString() || '0'}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="order-detail-row">
                <strong>{selectedOrder.type === 'sale' ? 'Customer' : 'Supplier'}:</strong>
                <span>{selectedOrder.customer || selectedOrder.supplier}</span>
              </div>
              <div className="order-detail-row">
                <strong>Product:</strong> <span>{selectedOrder.product}</span>
              </div>
              <div className="order-detail-row">
                <strong>Amount:</strong> <span>₹{selectedOrder.amount.toLocaleString()}</span>
              </div>
              <div className="order-detail-row">
                <strong>Date:</strong> <span>{selectedOrder.date}</span>
              </div>
              <div className="order-detail-row">
                <strong>Status:</strong>
                <span style={{ color: getStatusColor(selectedOrder.status) }}>
                  {selectedOrder.status.toUpperCase()}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPage;
