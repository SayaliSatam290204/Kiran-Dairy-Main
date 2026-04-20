import axiosInstance from './axiosInstance.js';

export const dispatchApi = {
  create: (data) => axiosInstance.post('/dispatch', data),
  createBatch: (data) => axiosInstance.post('/dispatch', { ...data, isBatchDispatch: true }),
  getAll: () => axiosInstance.get('/dispatch'),
  getById: (id) => axiosInstance.get(`/dispatch/${id}`),
  getByShop: (shopId) => axiosInstance.get(`/dispatch/shop/${shopId}`),
  update: (id, data) => axiosInstance.put(`/dispatch/${id}`, data),
  updateStatus: (id, data) => axiosInstance.put(`/dispatch/${id}/status`, data),
  delete: (id) => axiosInstance.delete(`/dispatch/${id}`),
  getAnalytics: (filters = {}) => axiosInstance.get('/dispatch/analytics', { params: filters })
};
