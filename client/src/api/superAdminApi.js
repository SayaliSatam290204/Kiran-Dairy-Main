import axiosInstance from "./axiosInstance";

export const superAdminApi = {
  // Get comprehensive dashboard
  getDashboard: async (filters = {}) => {
    return await axiosInstance.get("/super-admin/dashboard", {
      params: filters
    });
  },

  // Get detailed branch report
  getBranchReport: async (shopId) => {
    return await axiosInstance.get(`/super-admin/branch/${shopId}/report`);
  },

  // Get revenue trends
  getRevenueTrends: async (startDate, endDate) => {
    const params = {};
    if (startDate) params.startDate = startDate;
    if (endDate) params.endDate = endDate;
    return await axiosInstance.get("/super-admin/revenue-trends", { params });
  }
};
