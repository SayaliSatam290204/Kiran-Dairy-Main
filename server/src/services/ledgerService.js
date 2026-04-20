import StockLedger from '../models/StockLedger.js';

export const ledgerService = {
  async getLedger(shopId, filters = {}) {
    try {
      const query = { shopId };

      if (filters.productId) {
        query.productId = filters.productId;
      }

      if (filters.startDate || filters.endDate) {
        query.transactionDate = {};
        if (filters.startDate) {
          query.transactionDate.$gte = new Date(filters.startDate);
        }
        if (filters.endDate) {
          query.transactionDate.$lte = new Date(filters.endDate);
        }
      }

      return await StockLedger.find(query)
        .populate('productId')
        .populate('shopId')
        .sort({ transactionDate: -1 });
    } catch (error) {
      throw error;
    }
  }
};
