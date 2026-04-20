import axiosInstance from "./axiosInstance.js";

export const returnApi = {
  getAll: (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.shopId) params.append("shopId", filters.shopId);
    if (filters.status) params.append("status", filters.status);
    return axiosInstance.get(`/return?${params.toString()}`);
  },

  getById: (id) => axiosInstance.get(`/return/${id}`),

  create: (data) => axiosInstance.post("/return", data),

  updateStatus: (id, payload) => axiosInstance.put(`/return/${id}/status`, payload),

  deleteReturn: (id) => axiosInstance.delete(`/return/${id}`),

  getByStatus: (status) => axiosInstance.get("/return", { params: { status } }),

  // Admin notification: pending returns count
  getPendingCount: () => axiosInstance.get("/return/pending/count")
};