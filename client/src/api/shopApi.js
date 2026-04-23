import axiosInstance from './axiosInstance.js';

export const shopApi = {

  getDashboard: () => axiosInstance.get('/shop/dashboard'),
  getInventory: () => axiosInstance.get('/shop/inventory'),
  getReceivedDispatches: () => axiosInstance.get('/shop/received-dispatches'),
  getReceivedStock: () => axiosInstance.get('/shop/received-dispatches'), // Alias
  getSalesHistory: () => axiosInstance.get('/sales/history'),
  addToInventory: (data) => axiosInstance.post('/sales/add-inventory', data),
  getStaffPerformance: (period = 'monthly', year, month, date) =>
    axiosInstance.get('/shop/staff-performance', { 
      params: { period, year, month, date } 
    }),
  getStaffDetailedPerformance: (staffId, year, month) =>
    axiosInstance.get(`/shop/staff-performance/${staffId}`, {
      params: { year, month }
    }),
  // Restock Requests (shop submits to admin)
  createRestockRequest: (data) => axiosInstance.post('/ledger/restock-requests', data),
  getPreviewData: () => axiosInstance.get('/shop/preview') // Landing page charts
};





