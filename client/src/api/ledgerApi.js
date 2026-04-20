import axiosInstance from './axiosInstance.js';

export const ledgerApi = {
  getAll: () => axiosInstance.get('/ledger'),
  getByShop: (shopId) => axiosInstance.get(`/ledger/shop/${shopId}`),
  getByProduct: (productId) => axiosInstance.get(`/ledger/product/${productId}`),
  getByDateRange: (startDate, endDate) => 
    axiosInstance.get('/ledger', { params: { startDate, endDate } })
};
