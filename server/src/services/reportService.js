import Sale from '../models/Sale.js';
import Dispatch from '../models/Dispatch.js';

export const reportService = {
  async getSalesReport(shopId, startDate, endDate) {
    try {
      const query = { shopId };

      if (startDate || endDate) {
        query.saleDate = {};
        if (startDate) {
          query.saleDate.$gte = new Date(startDate);
        }
        if (endDate) {
          query.saleDate.$lte = new Date(endDate);
        }
      }

      return await Sale.find(query).populate('shopId').populate('items.productId');
    } catch (error) {
      throw error;
    }
  },

  async getDispatchReport(startDate, endDate) {
    try {
      const query = {};

      if (startDate || endDate) {
        query.dispatchDate = {};
        if (startDate) {
          query.dispatchDate.$gte = new Date(startDate);
        }
        if (endDate) {
          query.dispatchDate.$lte = new Date(endDate);
        }
      }

      return await Dispatch.find(query).populate('shopId').populate('items.productId');
    } catch (error) {
      throw error;
    }
  }
};
