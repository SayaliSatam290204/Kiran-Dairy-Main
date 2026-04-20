import axiosInstance from './axiosInstance.js';

export const staffPaymentApi = {
  // Get all payments
  getAllPayments: async (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.shopId) params.append('shopId', filters.shopId);
    if (filters.staffId) params.append('staffId', filters.staffId);
    if (filters.month) params.append('month', filters.month);
    if (filters.status) params.append('status', filters.status);
    
    return axiosInstance.get(`/staff-payment?${params.toString()}`);
  },

  // Get single payment
  getPaymentById: async (id) => {
    return axiosInstance.get(`/staff-payment/${id}`);
  },

  // Create payment
  createPayment: async (data) => {
    return axiosInstance.post('/staff-payment', data);
  },

  // Update payment
  updatePayment: async (id, data) => {
    return axiosInstance.put(`/staff-payment/${id}`, data);
  },

  // Delete payment
  deletePayment: async (id) => {
    return axiosInstance.delete(`/staff-payment/${id}`);
  },

  // Get payment summary
  getPaymentSummary: async (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.shopId) params.append('shopId', filters.shopId);
    if (filters.year) params.append('year', filters.year);
    if (filters.month) params.append('month', filters.month);
    
    return axiosInstance.get(`/staff-payment/summary?${params.toString()}`);
  },

  // Get pending payments
  getPendingPayments: async (shopId = null) => {
    const params = new URLSearchParams();
    if (shopId) params.append('shopId', shopId);
    
    return axiosInstance.get(`/staff-payment/pending?${params.toString()}`);
  }
};
