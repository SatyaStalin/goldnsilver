import { useState, useEffect, useCallback } from 'react';
import { useToast } from '../state/ToastContext';
import { adminService } from '../services/api';

function suggestedPriceFromRates(metal, metalGrams, rates) {
  const g = metalGrams > 0 ? Number(metalGrams) : 1;
  const gold = Number(rates.goldPerGram) || 0;
  const silver = Number(rates.silverPerGram) || 0;
  let base = 0;
  if (metal === 'gold') base = gold * g;
  else if (metal === 'silver') base = silver * g;
  else if (metal === 'gold+silver') base = ((gold + silver) / 2) * g;
  else base = gold * g;
  return Math.round(base * 100) / 100;
}

/** Debounced value for live search (avoids a request per keystroke). */
function useDebouncedValue(value, delayMs = 380) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delayMs);
    return () => clearTimeout(id);
  }, [value, delayMs]);
  return debounced;
}

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
  const [loadingGoldRates, setLoadingGoldRates] = useState(false);
  const [savingGoldRates, setSavingGoldRates] = useState(false);
  const [metalRates, setMetalRates] = useState({ goldPerGram: 0, silverPerGram: 0 });
  const [goldRatesForm, setGoldRatesForm] = useState({ goldPerGram: '', silverPerGram: '' });
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 10,
    tabCounts: { rateLinked: 0, fixed: 0 }
  });
  const [ordersPage, setOrdersPage] = useState(1);
  const [ordersPerPage, setOrdersPerPage] = useState(10);
  const [ordersStatus, setOrdersStatus] = useState('');
  const [ordersSearchInput, setOrdersSearchInput] = useState('');
  const ordersSearchDebounced = useDebouncedValue(ordersSearchInput, 380);
  const [ordersPagination, setOrdersPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 10
  });
  const [usersPage, setUsersPage] = useState(1);
  const [usersPerPage, setUsersPerPage] = useState(10);
  const [usersSearchInput, setUsersSearchInput] = useState('');
  const usersSearchDebounced = useDebouncedValue(usersSearchInput, 380);
  const [usersPagination, setUsersPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 10
  });
  const [buybacksPage, setBuybacksPage] = useState(1);
  const [buybacksPerPage, setBuybacksPerPage] = useState(10);
  const [buybacksStatus, setBuybacksStatus] = useState('');
  const [buybacksMetal, setBuybacksMetal] = useState('');
  const [buybacksSearchInput, setBuybacksSearchInput] = useState('');
  const buybacksSearchDebounced = useDebouncedValue(buybacksSearchInput, 380);
  const [buybacksPagination, setBuybacksPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 10
  });
  const [productSearchInput, setProductSearchInput] = useState('');
  const productSearchDebounced = useDebouncedValue(productSearchInput, 380);
  const [productMetal, setProductMetal] = useState('');
  const [productIsActive, setProductIsActive] = useState('');
  /** Admin product list: rate_linked | fixed (separate tables / counts) */
  const [productsListTab, setProductsListTab] = useState('fixed');
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
    metalGrams: 1,
    pricingMode: 'rate_based',
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
    if (!isLoggedIn) return;
    if (activeTab === 'dashboard') {
      fetchDashboard();
    }
  }, [isLoggedIn, activeTab]);

  useEffect(() => {
    if (!isLoggedIn || activeTab !== 'gold-rates') return;
    fetchGoldRates();
  }, [isLoggedIn, activeTab]);

  const fetchOrders = useCallback(async () => {
    setLoadingOrders(true);
    try {
      const response = await adminService.getOrders({
        page: ordersPage,
        limit: ordersPerPage,
        status: ordersStatus || undefined,
        q: ordersSearchDebounced.trim() || undefined
      });
      const body = response.data;
      const list = Array.isArray(body) ? body : body.orders ?? [];
      setOrders(list);
      if (body.pagination) setOrdersPagination(body.pagination);
    } catch (error) {
      showToast('Error fetching orders', 'error');
    } finally {
      setLoadingOrders(false);
    }
  }, [ordersPage, ordersPerPage, ordersStatus, ordersSearchDebounced, showToast]);

  const fetchUsers = useCallback(async () => {
    setLoadingUsers(true);
    try {
      const response = await adminService.getUsers({
        page: usersPage,
        limit: usersPerPage,
        q: usersSearchDebounced.trim() || undefined
      });
      const body = response.data;
      const list = Array.isArray(body) ? body : body.users ?? [];
      setUsers(list);
      if (body.pagination) setUsersPagination(body.pagination);
    } catch (error) {
      showToast('Error fetching users', 'error');
    } finally {
      setLoadingUsers(false);
    }
  }, [usersPage, usersPerPage, usersSearchDebounced, showToast]);

  const fetchBuybackRequests = useCallback(async () => {
    setLoadingBuybacks(true);
    try {
      const response = await adminService.getBuybacks({
        page: buybacksPage,
        limit: buybacksPerPage,
        status: buybacksStatus || undefined,
        metal: buybacksMetal || undefined,
        q: buybacksSearchDebounced.trim() || undefined
      });
      const body = response.data;
      const list = Array.isArray(body) ? body : body.buybacks ?? [];
      setBuybackRequests(list);
      if (body.pagination) setBuybacksPagination(body.pagination);
    } catch (error) {
      showToast('Error fetching buyback requests', 'error');
    } finally {
      setLoadingBuybacks(false);
    }
  }, [buybacksPage, buybacksPerPage, buybacksStatus, buybacksMetal, buybacksSearchDebounced, showToast]);

  useEffect(() => {
    if (!isLoggedIn || activeTab !== 'sale-orders') return;
    fetchOrders();
  }, [isLoggedIn, activeTab, fetchOrders]);

  useEffect(() => {
    if (!isLoggedIn || activeTab !== 'users') return;
    fetchUsers();
  }, [isLoggedIn, activeTab, fetchUsers]);

  useEffect(() => {
    if (!isLoggedIn || activeTab !== 'gold-buyback') return;
    fetchBuybackRequests();
  }, [isLoggedIn, activeTab, fetchBuybackRequests]);

  useEffect(() => {
    if (!isLoggedIn) return;
    adminService
      .getGoldRates()
      .then((res) => {
        setMetalRates({
          goldPerGram: res.data.goldPerGram,
          silverPerGram: res.data.silverPerGram
        });
      })
      .catch(() => {});
  }, [isLoggedIn]);

  useEffect(() => {
    if (!showProductForm || productForm.pricingMode !== 'rate_based') return;
    if (metalRates.goldPerGram <= 0 && metalRates.silverPerGram <= 0) return;
    const next = suggestedPriceFromRates(productForm.metal, productForm.metalGrams, metalRates);
    setProductForm((prev) => {
      if (prev.pricingMode !== 'rate_based') return prev;
      if (Math.abs((Number(prev.pricePerUnit) || 0) - next) < 0.0001) return prev;
      return { ...prev, pricePerUnit: next };
    });
  }, [
    showProductForm,
    productForm.pricingMode,
    productForm.metal,
    productForm.metalGrams,
    metalRates.goldPerGram,
    metalRates.silverPerGram
  ]);

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

  const handleBuybackStatusChange = async (id, newStatus) => {
    try {
      await adminService.updateBuyback(id, { status: newStatus });
      showToast('Buyback status updated', 'success');
      fetchBuybackRequests();
    } catch (error) {
      showToast('Error updating buyback status', 'error');
    }
  };

  const fetchProducts = useCallback(
    async (page = 1) => {
      setLoading(true);
      try {
        const pricingMode = productsListTab === 'fixed' ? 'fixed' : 'rate_based';
        const response = await adminService.getProducts(page, pagination.itemsPerPage, pricingMode, {
          q: productSearchDebounced.trim() || undefined,
          metal: productMetal || undefined,
          isActive: productIsActive || undefined
        });
        setProducts(response.data.products);
        setPagination((prev) => ({
          ...response.data.pagination,
          tabCounts: response.data.pagination.tabCounts ?? prev.tabCounts
        }));
      } catch (error) {
        showToast('Error fetching products', 'error');
      } finally {
        setLoading(false);
      }
    },
    [
      productsListTab,
      pagination.itemsPerPage,
      productSearchDebounced,
      productMetal,
      productIsActive,
      showToast
    ]
  );

  useEffect(() => {
    if (!isLoggedIn || activeTab !== 'products') return;
    fetchProducts(pagination.currentPage);
  }, [
    isLoggedIn,
    activeTab,
    productsListTab,
    pagination.currentPage,
    pagination.itemsPerPage,
    fetchProducts
  ]);

  const switchProductsListTab = (tab) => {
    setProductsListTab(tab);
    setProducts([]);
    setPagination((prev) => ({ ...prev, currentPage: 1 }));
    setProductSearchInput('');
    setProductMetal('');
    setProductIsActive('');
  };

  const fetchGoldRates = async () => {
    setLoadingGoldRates(true);
    try {
      const res = await adminService.getGoldRates();
      setMetalRates({
        goldPerGram: res.data.goldPerGram,
        silverPerGram: res.data.silverPerGram
      });
      setGoldRatesForm({
        goldPerGram: String(res.data.goldPerGram ?? ''),
        silverPerGram: String(res.data.silverPerGram ?? '')
      });
    } catch (error) {
      showToast('Error loading gold rates', 'error');
    } finally {
      setLoadingGoldRates(false);
    }
  };

  const handleSaveGoldRates = async (applyAll) => {
    const gold = parseFloat(goldRatesForm.goldPerGram);
    const silver = parseFloat(goldRatesForm.silverPerGram);
    if (Number.isNaN(gold) || Number.isNaN(silver) || gold < 0 || silver < 0) {
      showToast('Enter valid non-negative numbers for both rates', 'error');
      return;
    }
    setSavingGoldRates(true);
    try {
      const res = await adminService.updateGoldRates({
        goldPerGram: gold,
        silverPerGram: silver,
        applyAll
      });
      setMetalRates({
        goldPerGram: res.data.goldPerGram,
        silverPerGram: res.data.silverPerGram
      });
      showToast(
        applyAll
          ? `Rates saved. Recalculated ${res.data.bulkUpdated} rate-linked product(s); fixed-price items unchanged.`
          : 'Rates saved.',
        'success'
      );
      if (activeTab === 'products') fetchProducts(pagination.currentPage);
    } catch (error) {
      showToast(error.response?.data?.message || 'Error saving rates', 'error');
    } finally {
      setSavingGoldRates(false);
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
    const form = e.currentTarget;
    /** Native radio `value` (FormData) — source of truth if React state lags the last click */
    let pricingMode = productForm.pricingMode === 'fixed' ? 'fixed' : 'rate_based';
    const selectedMode = new FormData(form).get('pricingMode');
    if (selectedMode === 'fixed' || selectedMode === 'rate_based') {
      pricingMode = selectedMode;
    }

    if (pricingMode === 'rate_based' && !(Number(productForm.metalGrams) > 0)) {
      showToast('Rate-linked products need metal grams greater than zero.', 'error');
      return;
    }
    const g = Number(productForm.metalGrams);
    const metalGrams = Number.isFinite(g) ? g : pricingMode === 'rate_based' ? 1 : 0;
    const payload = {
      name: productForm.name,
      slug: productForm.slug,
      metal: productForm.metal,
      type: productForm.type,
      category: productForm.category || '',
      description: productForm.description || '',
      pricePerUnit: Number(productForm.pricePerUnit) || 0,
      metalGrams,
      unit: productForm.unit || 'gram',
      stock: Number(productForm.stock) || 0,
      imageUrl: productForm.imageUrl || '',
      isFeatured: Boolean(productForm.isFeatured),
      isActive: productForm.isActive !== false,
      pricingMode,
      syncPriceFromRates: pricingMode === 'rate_based'
    };
    try {
      if (editingProduct) {
        await adminService.updateProduct(editingProduct._id, payload);
        showToast('Product updated successfully', 'success');
      } else {
        await adminService.createProduct(payload);
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
      metalGrams:
        product.metalGrams != null ? product.metalGrams : product.pricingMode === 'fixed' ? 0 : 1,
      pricingMode:
        product.pricingMode === 'fixed' || product.pricingMode === 'rate_based'
          ? product.pricingMode
          : 'rate_based',
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
      metalGrams: 1,
      pricingMode: 'rate_based',
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
        <section className="panel page-feature auth-form-panel">
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

  const ratesConfigured =
    metalRates.goldPerGram > 0 || metalRates.silverPerGram > 0;
  const priceLocked =
    productForm.pricingMode === 'rate_based' && ratesConfigured;
  const ratePreview =
    productForm.pricingMode === 'rate_based' && ratesConfigured
      ? suggestedPriceFromRates(
          productForm.metal,
          productForm.metalGrams,
          metalRates
        )
      : null;

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
        <button
          className={`admin-tab ${activeTab === 'gold-rates' ? 'active' : ''}`}
          onClick={() => setActiveTab('gold-rates')}
        >
          Gold rate settings
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
                  <div className="dashboard-stat-card">
                    <h3>Rate-linked catalogue</h3>
                    <div className="stat-value">{dashboardData.rateLinkedProductCount ?? 0}</div>
                    <p style={{ margin: '0.35rem 0 0', fontSize: '0.82rem', color: '#7a6d4a' }}>
                      Prices follow Gold/Silver ₹ per gram × grams.
                    </p>
                    <button
                      type="button"
                      className="btn-secondary"
                      style={{ marginTop: '0.85rem', width: '100%' }}
                      onClick={() => {
                        switchProductsListTab('rate_linked');
                        setActiveTab('products');
                      }}
                    >
                      Open list
                    </button>
                  </div>
                  <div className="dashboard-stat-card">
                    <h3>Fixed-price catalogue</h3>
                    <div className="stat-value">{dashboardData.fixedPriceProductCount ?? 0}</div>
                    <p style={{ margin: '0.35rem 0 0', fontSize: '0.82rem', color: '#7a6d4a' }}>
                      Manual selling price; rate refresh does not change these.
                    </p>
                    <button
                      type="button"
                      className="btn-secondary"
                      style={{ marginTop: '0.85rem', width: '100%' }}
                      onClick={() => {
                        switchProductsListTab('fixed');
                        setActiveTab('products');
                      }}
                    >
                      Open list
                    </button>
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

        {activeTab === 'gold-rates' && (
          <div className="admin-section" style={{ maxWidth: '560px', margin: '0 auto' }}>
            <h2>Gold &amp; silver rates (per gram, INR)</h2>
            <p style={{ color: '#7a6d4a', marginBottom: '1.25rem', fontSize: '0.95rem', lineHeight: 1.5 }}>
              Set per-gram gold and silver prices. Products marked <strong>Rate-linked</strong> use metal type and grams
              to compute price when rates are set. <strong>Save and update all products</strong> recalculates only
              rate-linked items; fixed-price products are left unchanged.
            </p>
            {loadingGoldRates ? (
              <div style={{ textAlign: 'center', padding: '2rem' }}>Loading rates...</div>
            ) : (
              <form
                className="form product-form"
                style={{ padding: 0 }}
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSaveGoldRates(false);
                }}
              >
                <label>
                  Gold (₹ per gram)
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={goldRatesForm.goldPerGram}
                    onChange={(e) =>
                      setGoldRatesForm({ ...goldRatesForm, goldPerGram: e.target.value })
                    }
                    required
                  />
                </label>
                <label>
                  Silver (₹ per gram)
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={goldRatesForm.silverPerGram}
                    onChange={(e) =>
                      setGoldRatesForm({ ...goldRatesForm, silverPerGram: e.target.value })
                    }
                    required
                  />
                </label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', marginTop: '1rem' }}>
                  <button className="btn-primary" type="submit" disabled={savingGoldRates}>
                    Save rates
                  </button>
                  <button
                    type="button"
                    className="btn-secondary"
                    disabled={savingGoldRates}
                    onClick={() => handleSaveGoldRates(true)}
                  >
                    Save and update all products
                  </button>
                </div>
              </form>
            )}
          </div>
        )}

        {activeTab === 'sale-orders' && (
          <div className="admin-orders">
            <div className="admin-table-heading-row admin-table-heading-row--single-line">
              <h2>Orders</h2>
              <div className="admin-toolbar-filters">
                <input
                  type="search"
                  className="admin-filter-input"
                  value={ordersSearchInput}
                  onChange={(e) => {
                    setOrdersSearchInput(e.target.value);
                    setOrdersPage(1);
                  }}
                  aria-label="Search orders by name, email, phone, or order id"
                  placeholder="Name, email, phone, order id"
                />
                <div className="admin-toolbar-tight">
                  <select
                    className="admin-filter-select"
                    value={ordersStatus}
                    aria-label="Order status"
                    onChange={(e) => {
                      setOrdersStatus(e.target.value);
                      setOrdersPage(1);
                    }}
                  >
                    <option value="">All status</option>
                    <option value="pending">Pending</option>
                    <option value="paid">Paid</option>
                    <option value="shipped">Shipped</option>
                    <option value="delivered">Delivered</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                    <option value="failed">Failed</option>
                  </select>
                  <select
                    className="admin-filter-select"
                    value={ordersPerPage}
                    aria-label="Rows per page"
                    onChange={(e) => {
                      setOrdersPerPage(Number(e.target.value));
                      setOrdersPage(1);
                    }}
                  >
                    <option value={10}>10 / page</option>
                    <option value={25}>25 / page</option>
                    <option value={50}>50 / page</option>
                  </select>
                </div>
              </div>
            </div>
            {loadingOrders ? (
              <div style={{ textAlign: 'center', padding: '2rem' }}>Loading orders...</div>
            ) : (
              <div className="orders-table-wrapper">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Order ID</th>
                      <th>Type</th>
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
                        <td colSpan="9" style={{ textAlign: 'center', padding: '2rem' }}>
                          No orders found.
                        </td>
                      </tr>
                    ) : (
                      orders.map((order) => (
                        <tr key={order._id}>
                          <td>{order._id.slice(-12)}</td>
                          <td>
                            <span
                              style={{
                                fontSize: '0.75rem',
                                padding: '0.15rem 0.45rem',
                                borderRadius: '4px',
                                background:
                                  order.orderType === 'safegold' ? '#2d2208' : '#1a2332',
                                color: order.orderType === 'safegold' ? '#c9a227' : '#7eb8ff'
                              }}
                            >
                              {order.orderType === 'safegold' ? 'SafeGold' : 'Product'}
                            </span>
                          </td>
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
            {ordersPagination.totalItems > 0 && (
              <div className="pagination" style={{ marginTop: '1rem' }}>
                <button
                  type="button"
                  className="pagination-btn"
                  onClick={() => setOrdersPage((p) => Math.max(1, p - 1))}
                  disabled={ordersPage <= 1}
                >
                  Previous
                </button>
                <span className="pagination-info">
                  Page {ordersPagination.currentPage} of {ordersPagination.totalPages} (
                  {ordersPagination.totalItems} total)
                </span>
                <button
                  type="button"
                  className="pagination-btn"
                  onClick={() => setOrdersPage((p) => p + 1)}
                  disabled={ordersPage >= ordersPagination.totalPages}
                >
                  Next
                </button>
              </div>
            )}
          </div>
        )}

        {activeTab === 'gold-buyback' && (
          <div className="admin-orders">
            <div className="admin-table-heading-row admin-table-heading-row--single-line">
              <h2>Gold Buy Back Requests</h2>
              <div className="admin-toolbar-filters">
                <input
                  type="search"
                  className="admin-filter-input"
                  value={buybacksSearchInput}
                  onChange={(e) => {
                    setBuybacksSearchInput(e.target.value);
                    setBuybacksPage(1);
                  }}
                  aria-label="Search buybacks by customer name or request id"
                  placeholder="Customer name or request id"
                />
                <div className="admin-toolbar-tight">
                  <select
                    className="admin-filter-select"
                    value={buybacksStatus}
                    aria-label="Buyback status"
                    onChange={(e) => {
                      setBuybacksStatus(e.target.value);
                      setBuybacksPage(1);
                    }}
                  >
                    <option value="">All status</option>
                    <option value="pending">Pending</option>
                    <option value="approved">Approved</option>
                    <option value="rejected">Rejected</option>
                    <option value="paid">Paid</option>
                  </select>
                  <select
                    className="admin-filter-select"
                    value={buybacksMetal}
                    aria-label="Metal"
                    onChange={(e) => {
                      setBuybacksMetal(e.target.value);
                      setBuybacksPage(1);
                    }}
                  >
                    <option value="">All metals</option>
                    <option value="gold">Gold</option>
                    <option value="silver">Silver</option>
                  </select>
                  <select
                    className="admin-filter-select"
                    value={buybacksPerPage}
                    aria-label="Rows per page"
                    onChange={(e) => {
                      setBuybacksPerPage(Number(e.target.value));
                      setBuybacksPage(1);
                    }}
                  >
                    <option value={10}>10 / page</option>
                    <option value={25}>25 / page</option>
                    <option value={50}>50 / page</option>
                  </select>
                </div>
              </div>
            </div>
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
            {buybacksPagination.totalItems > 0 && (
              <div className="pagination" style={{ marginTop: '1rem' }}>
                <button
                  type="button"
                  className="pagination-btn"
                  onClick={() => setBuybacksPage((p) => Math.max(1, p - 1))}
                  disabled={buybacksPage <= 1}
                >
                  Previous
                </button>
                <span className="pagination-info">
                  Page {buybacksPagination.currentPage} of {buybacksPagination.totalPages} (
                  {buybacksPagination.totalItems} total)
                </span>
                <button
                  type="button"
                  className="pagination-btn"
                  onClick={() => setBuybacksPage((p) => p + 1)}
                  disabled={buybacksPage >= buybacksPagination.totalPages}
                >
                  Next
                </button>
              </div>
            )}
          </div>
        )}

        {activeTab === 'products' && (
          <div className="admin-section">
            <div className="admin-section-header" style={{ alignItems: 'flex-start' }}>
              <div>
                <h2 style={{ marginBottom: '0.65rem' }}>Product Management</h2>
                <div
                  role="tablist"
                  aria-label="Products by pricing type"
                  style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}
                >
                  <button
                    type="button"
                    role="tab"
                    aria-selected={productsListTab === 'fixed'}
                    className={`admin-tab ${productsListTab === 'fixed' ? 'active' : ''}`}
                    onClick={() => switchProductsListTab('fixed')}
                    style={{ padding: '0.35rem 0.85rem', fontSize: '0.9rem' }}
                  >
                    Fixed-price products
                    {pagination.tabCounts != null && (
                      <span style={{ opacity: 0.85 }}>
                        {' '}
                        ({pagination.tabCounts.fixed ?? '—'})
                      </span>
                    )}
                  </button>
                  <button
                    type="button"
                    role="tab"
                    aria-selected={productsListTab === 'rate_linked'}
                    className={`admin-tab ${productsListTab === 'rate_linked' ? 'active' : ''}`}
                    onClick={() => switchProductsListTab('rate_linked')}
                    style={{ padding: '0.35rem 0.85rem', fontSize: '0.9rem' }}
                  >
                    Rate-linked products
                    {pagination.tabCounts != null && (
                      <span style={{ opacity: 0.85 }}>
                        {' '}
                        ({pagination.tabCounts.rateLinked ?? '—'})
                      </span>
                    )}
                  </button>
                </div>
              </div>
              <div className="admin-toolbar-filters" style={{ maxWidth: '100%' }}>
                <input
                  type="search"
                  className="admin-filter-input"
                  value={productSearchInput}
                  onChange={(e) => {
                    setProductSearchInput(e.target.value);
                    setPagination((prev) => ({ ...prev, currentPage: 1 }));
                  }}
                  aria-label="Search products by name, slug, or category"
                  placeholder="Name, slug, category"
                />
                <div className="admin-toolbar-tight">
                  <select
                    className="admin-filter-select"
                    value={productMetal}
                    aria-label="Filter by metal"
                    onChange={(e) => {
                      setProductMetal(e.target.value);
                      setPagination((prev) => ({ ...prev, currentPage: 1 }));
                    }}
                  >
                    <option value="">All metals</option>
                    <option value="gold">Gold</option>
                    <option value="silver">Silver</option>
                    <option value="gold+silver">Gold + Silver</option>
                  </select>
                  <select
                    className="admin-filter-select"
                    value={productIsActive}
                    aria-label="Active products"
                    onChange={(e) => {
                      setProductIsActive(e.target.value);
                      setPagination((prev) => ({ ...prev, currentPage: 1 }));
                    }}
                  >
                    <option value="">All</option>
                    <option value="true">Active only</option>
                    <option value="false">Inactive only</option>
                  </select>
                  <select
                    className="admin-filter-select"
                    value={pagination.itemsPerPage}
                    aria-label="Rows per page"
                    onChange={(e) => {
                      const n = Number(e.target.value);
                      setPagination((prev) => ({ ...prev, itemsPerPage: n, currentPage: 1 }));
                    }}
                  >
                    <option value={10}>10 / page</option>
                    <option value={25}>25 / page</option>
                    <option value={50}>50 / page</option>
                  </select>
                </div>
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
                    if (productsListTab === 'fixed') {
                      setProductForm((prev) => ({
                        ...prev,
                        pricingMode: 'fixed',
                        metalGrams: 0
                      }));
                    }
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
                            const name = e.target.value;
                            setProductForm((prev) => ({
                              ...prev,
                              name,
                              ...(!editingProduct
                                ? {
                                    slug: name
                                      .toLowerCase()
                                      .replace(/\s+/g, '-')
                                      .replace(/[^a-z0-9-]/g, '')
                                  }
                                : {})
                            }));
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
                    <fieldset
                      style={{
                        border: '1px solid rgba(212, 175, 55, 0.35)',
                        borderRadius: '10px',
                        padding: '0.85rem 1rem 1rem',
                        margin: '0.75rem 0',
                        gridColumn: '1 / -1'
                      }}
                    >
                      <legend style={{ padding: '0 0.35rem', fontWeight: 700, fontSize: '0.95rem' }}>
                        How is this priced?
                      </legend>
                      <div
                        role="radiogroup"
                        aria-label="Pricing mode"
                        style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}
                      >
                        <label
                          style={{
                            display: 'flex',
                            gap: '0.55rem',
                            alignItems: 'flex-start',
                            cursor: 'pointer',
                            lineHeight: 1.45
                          }}
                        >
                          <input
                            type="radio"
                            name="pricingMode"
                            value="rate_based"
                            checked={productForm.pricingMode === 'rate_based'}
                            onChange={() =>
                              setProductForm((prev) => ({ ...prev, pricingMode: 'rate_based' }))
                            }
                            style={{ marginTop: '0.2rem' }}
                          />
                          <span>
                            <strong>Rate-linked</strong> — price follows Gold / Silver settings (₹ per gram × metal grams).
                            Updating global rates will refresh this price when you use &quot;Save and update all products&quot;.
                          </span>
                        </label>
                        <label
                          style={{
                            display: 'flex',
                            gap: '0.55rem',
                            alignItems: 'flex-start',
                            cursor: 'pointer',
                            lineHeight: 1.45
                          }}
                        >
                          <input
                            type="radio"
                            name="pricingMode"
                            value="fixed"
                            checked={productForm.pricingMode === 'fixed'}
                            onChange={() =>
                              setProductForm((prev) => ({ ...prev, pricingMode: 'fixed' }))
                            }
                            style={{ marginTop: '0.2rem' }}
                          />
                          <span>
                            <strong>Fixed price</strong> — enter the selling price yourself. Metal grams are optional (display /
                            catalog only); rate changes never overwrite this price.
                          </span>
                        </label>
                      </div>
                    </fieldset>
                    <div className="form-row">
                      <label>
                        {productForm.pricingMode === 'rate_based'
                          ? 'Metal grams (multiply by ₹/g) *'
                          : 'Metal grams (optional, informational)'}
                        <input
                          type="number"
                          value={productForm.metalGrams}
                          onChange={(e) => {
                            const raw = e.target.value;
                            const parsed = parseFloat(raw);
                            if (raw === '') {
                              setProductForm({
                                ...productForm,
                                metalGrams: productForm.pricingMode === 'fixed' ? 0 : 1
                              });
                              return;
                            }
                            setProductForm({
                              ...productForm,
                              metalGrams: Number.isFinite(parsed)
                                ? parsed
                                : productForm.pricingMode === 'fixed'
                                  ? 0
                                  : 1
                            });
                          }}
                          required={productForm.pricingMode === 'rate_based'}
                          min={productForm.pricingMode === 'rate_based' ? '0.01' : '0'}
                          step="0.01"
                        />
                      </label>
                      <label style={{ alignSelf: 'end' }}>
                        <span style={{ fontSize: '0.82rem', color: '#7a6d4a', display: 'block', marginBottom: '0.35rem' }}>
                          Live calculation
                        </span>
                        <div
                          style={{
                            padding: '0.5rem 0.65rem',
                            borderRadius: '8px',
                            background: 'rgba(212, 175, 55, 0.12)',
                            fontSize: '0.92rem',
                            minHeight: '2.35rem',
                            display: 'flex',
                            alignItems: 'center'
                          }}
                        >
                          {productForm.pricingMode === 'rate_based' && ratePreview != null ? (
                            <span>
                              ≈ ₹{ratePreview.toLocaleString('en-IN', { maximumFractionDigits: 2 })} from current rates
                            </span>
                          ) : productForm.pricingMode === 'rate_based' ? (
                            <span style={{ color: '#b45309' }}>Set rates in Gold rate settings to preview</span>
                          ) : (
                            <span style={{ color: '#7a6d4a' }}>Uses your price below</span>
                          )}
                        </div>
                      </label>
                    </div>
                    {productForm.pricingMode === 'rate_based' && !ratesConfigured && (
                      <p style={{ fontSize: '0.85rem', color: '#b45309', margin: 0 }}>
                        Set gold/silver per-gram rates in the Gold rate settings tab — until then you can still type a
                        temporary price; it will sync to the formula once rates exist.
                      </p>
                    )}
                    {priceLocked && (
                      <p style={{ fontSize: '0.85rem', color: '#7a6d4a', margin: 0 }}>
                        Stored price follows admin rates × metal grams. Switch to <strong>Fixed price</strong> to set a custom
                        amount.
                      </p>
                    )}
                    <div className="form-row">
                      <label>
                        {productForm.pricingMode === 'rate_based'
                          ? priceLocked
                            ? 'Price (INR), from rates × grams *'
                            : 'Price (INR) *'
                          : 'Selling price (INR) *'}
                        <input
                          type="number"
                          value={productForm.pricePerUnit}
                          readOnly={priceLocked}
                          onChange={(e) => {
                            const raw = e.target.value;
                            setProductForm({
                              ...productForm,
                              pricePerUnit: raw === '' ? 0 : parseFloat(raw) || 0
                            });
                          }}
                          required
                          min="0"
                          step="0.01"
                          style={priceLocked ? { opacity: 0.9, cursor: 'not-allowed' } : undefined}
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
                      <th>Pricing</th>
                      <th>Price</th>
                      <th>Stock</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.length === 0 ? (
                      <tr>
                        <td colSpan="8" style={{ textAlign: 'center', padding: '2rem' }}>
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
                          <td>
                            <span
                              style={{
                                display: 'inline-block',
                                padding: '0.2rem 0.5rem',
                                borderRadius: '999px',
                                fontSize: '0.72rem',
                                fontWeight: 600,
                                backgroundColor:
                                  product.pricingMode === 'fixed' ? '#47556922' : '#d4af3722',
                                color: product.pricingMode === 'fixed' ? '#475569' : '#8a7220'
                              }}
                              title={
                                product.pricingMode === 'fixed'
                                  ? 'Price is manual; bulk rate refresh does not change it.'
                                  : 'Price follows Gold/Silver ₹/gram × grams when rates are saved with update all.'
                              }
                            >
                              {product.pricingMode === 'fixed' ? 'Fixed' : 'Rate-linked'}
                            </span>
                          </td>
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
            {pagination.totalItems > 0 && (
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
            <div className="admin-table-heading-row admin-table-heading-row--single-line">
              <h2>Purchased Users</h2>
              <div className="admin-toolbar-filters">
                <input
                  type="search"
                  className="admin-filter-input"
                  value={usersSearchInput}
                  onChange={(e) => {
                    setUsersSearchInput(e.target.value);
                    setUsersPage(1);
                  }}
                  aria-label="Search users by name, email, or phone"
                  placeholder="Name, email, phone"
                />
                <div className="admin-toolbar-tight">
                  <select
                    className="admin-filter-select"
                    value={usersPerPage}
                    aria-label="Rows per page"
                    onChange={(e) => {
                      setUsersPerPage(Number(e.target.value));
                      setUsersPage(1);
                    }}
                  >
                    <option value={10}>10 / page</option>
                    <option value={25}>25 / page</option>
                    <option value={50}>50 / page</option>
                  </select>
                </div>
              </div>
            </div>
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
            {usersPagination.totalItems > 0 && (
              <div className="pagination" style={{ marginTop: '1rem' }}>
                <button
                  type="button"
                  className="pagination-btn"
                  onClick={() => setUsersPage((p) => Math.max(1, p - 1))}
                  disabled={usersPage <= 1}
                >
                  Previous
                </button>
                <span className="pagination-info">
                  Page {usersPagination.currentPage} of {usersPagination.totalPages} (
                  {usersPagination.totalItems} total)
                </span>
                <button
                  type="button"
                  className="pagination-btn"
                  onClick={() => setUsersPage((p) => p + 1)}
                  disabled={usersPage >= usersPagination.totalPages}
                >
                  Next
                </button>
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
