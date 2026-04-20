import axiosInstance from './axiosInstance.js';

export const staffApi = {
  // Get all staff
  getAllStaff: async (shopId = null) => {
    const params = new URLSearchParams();
    if (shopId) params.append('shopId', shopId);
    
    return axiosInstance.get(`/staff?${params.toString()}`);
  },

  // Get staff by shop
  getStaffByShop: async (shopId) => {
    return axiosInstance.get(`/staff/shop/${shopId}`);
  },

  // Get single staff
  getStaffById: async (id) => {
    return axiosInstance.get(`/staff/${id}`);
  },

  // Create staff
  createStaff: async (data) => {
    return axiosInstance.post('/staff', data);
  },

  // Update staff
  updateStaff: async (id, data) => {
    return axiosInstance.put(`/staff/${id}`, data);
  },

  // Delete staff
  deleteStaff: async (id) => {
    return axiosInstance.delete(`/staff/${id}`);
  }
};
