import axiosInstance from './axiosInstance.js';

export const salesApi = {
  create: (data) => axiosInstance.post('/sales', data),
  getAll: () => axiosInstance.get('/sales'),
  getById: (id) => axiosInstance.get(`/sales/${id}`),
  getHistory: () => axiosInstance.get('/sales/history'),
  addToInventory: (data) => axiosInstance.post('/sales/add-inventory', data)
};
