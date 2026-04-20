import axiosInstance from './axiosInstance.js';

export const adminApi = {
  getDashboard: () => axiosInstance.get('/admin/dashboard'),
  getShops: () => axiosInstance.get('/admin/shops'),
  getAllShops: () => axiosInstance.get('/admin/all-shops'),
  createShop: (data) => axiosInstance.post('/admin/shops', data),
  updateShop: (id, data) => axiosInstance.put(`/admin/shops/${id}`, data),
  deleteShop: (id) => axiosInstance.delete(`/admin/shops/${id}`),
  getProducts: () => axiosInstance.get('/admin/products'),
  getStaffPerformance: () => axiosInstance.get('/admin/staff-performance'),

  // ✅ NEW: Shop Ledger & Inventory Management
  getShopsWithInventory: () => axiosInstance.get('/admin/shop-ledger'),
  getShopInventory: (shopId) => axiosInstance.get(`/admin/shop-inventory/${shopId}`),
  addProductToShop: (shopId, data) => axiosInstance.post(`/admin/shop-inventory/${shopId}`, data),

  // ✅ NEW: Product Management
  getAllProducts: () => axiosInstance.get('/admin/all-products'),
  createProduct: (data) => axiosInstance.post('/admin/products', data),
  updateProduct: (productId, data) => axiosInstance.put(`/admin/products/${productId}`, data),
  getCategories: () => axiosInstance.get('/admin/categories'),
  getUnits: () => axiosInstance.get('/admin/units'),

  // Dispatch operations
  createDispatch: (data) => axiosInstance.post('/dispatch', data),
  createBatchDispatch: (data) => axiosInstance.post('/dispatch', { ...data, isBatchDispatch: true }),
  getDispatches: () => axiosInstance.get('/dispatch'),
  getDispatchById: (id) => axiosInstance.get(`/dispatch/${id}`),
  updateDispatch: (id, data) => axiosInstance.put(`/dispatch/${id}`, data),
  updateDispatchStatus: (id, data) => axiosInstance.put(`/dispatch/${id}/status`, data),
  getDispatchAnalytics: (filters = {}) => axiosInstance.get('/dispatch/analytics', { params: filters }),

  // Stock Ledger
  getStockLedger: () => axiosInstance.get('/ledger'),
  getLedgerByShop: (shopId) => axiosInstance.get(`/ledger/shop/${shopId}`),
  getLedgerByProduct: (productId) => axiosInstance.get(`/ledger/product/${productId}`),

  // ✅ Stock Alerts (NEW)
  getStockAlerts: (shopId = null) =>
    axiosInstance.get('/ledger/alerts/all', { params: shopId ? { shopId } : {} }),
  getAlertCount: (shopId = null) =>
    axiosInstance.get('/ledger/alerts/count', { params: shopId ? { shopId } : {} }),
  getStockReport: () => axiosInstance.get('/ledger/report/stock'),

  // Restock Requests
  createRestockRequest: (data) => axiosInstance.post('/ledger/restock-requests', data),
  getRestockRequests: (params = {}) => axiosInstance.get('/ledger/restock-requests', { params }),
  updateRestockRequestStatus: (id, data) => axiosInstance.put(`/ledger/restock-requests/${id}`, data),
  getRestockRequestsCount: () => axiosInstance.get('/ledger/restock-requests/count'),

  // Reports
  generateReport: (filters) => axiosInstance.get('/admin/reports', { params: filters }),

  // Sales
  getAllSales: () => axiosInstance.get('/sales'),

  // Staff Performance
  getStaffPerformance: () => axiosInstance.get('/admin/staff-performance'),
  getStaffDetailedPerformance: (staffId, year, month) =>
    axiosInstance.get(`/admin/staff-performance/${staffId}`, { params: { year, month } }),
  getShopStaffPerformance: (shopId, period = 'monthly', year, month) =>
    axiosInstance.get(`/admin/shop-staff-performance/${shopId}`, {
      params: { period, year, month }
    }),

  // Returns Management
  getReturns: (shopId = null) => axiosInstance.get('/return', { params: shopId ? { shopId } : {} }),
  getPendingReturns: () => axiosInstance.get('/return/pending/count'),
  getReturnById: (id) => axiosInstance.get(`/return/${id}`),
  updateReturnStatus: (id, data) => axiosInstance.put(`/return/${id}/status`, data)
};
