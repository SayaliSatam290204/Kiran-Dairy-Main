import Dispatch from '../models/Dispatch.js';

export const dispatchAnalyticsService = {
  // Get dispatch frequency by shop
  getFrequencyByShop: async (filters = {}) => {
    try {
      const frequencyByShop = await Dispatch.aggregate([
        { $match: filters },
        {
          $addFields: {
            allShopIds: {
              $cond: [
                { $gt: [{ $size: { $ifNull: ['$shopIds', []] } }, 0] },
                { $concatArrays: [['$shopId'], '$shopIds'] },
                ['$shopId']
              ]
            }
          }
        },
        { $unwind: '$allShopIds' },
        {
          $group: {
            _id: '$allShopIds',
            dispatchCount: { $sum: 1 },
            avgDeliveryTime: { $avg: '$deliveryTime' },
            totalItems: { $sum: { $size: '$items' } },
            receivedCount: {
              $sum: { $cond: [{ $eq: ['$status', 'received'] }, 1, 0] }
            },
            pendingCount: {
              $sum: {
                $cond: [
                  {
                    $in: ['$status', ['created', 'dispatched', 'pending']]
                  },
                  1,
                  0
                ]
              }
            }
          }
        },
        {
          $lookup: {
            from: 'shops',
            localField: '_id',
            foreignField: '_id',
            as: 'shopDetails'
          }
        },
        {
          $unwind: {
            path: '$shopDetails',
            preserveNullAndEmptyArrays: true
          }
        },
        {
          $project: {
            shopId: '$_id',
            shopName: '$shopDetails.name',
            dispatchCount: 1,
            avgDeliveryTime: { $round: ['$avgDeliveryTime', 2] },
            totalItems: 1,
            receivedCount: 1,
            pendingCount: 1,
            successRate: {
              $round: [
                {
                  $multiply: [
                    { $divide: ['$receivedCount', '$dispatchCount'] },
                    100
                  ]
                },
                2
              ]
            }
          }
        },
        { $sort: { dispatchCount: -1 } }
      ]);

      return frequencyByShop;
    } catch (error) {
      console.error('Error calculating dispatch frequency:', error);
      throw error;
    }
  },

  // Get dispatch status summary
  getStatusSummary: async (filters = {}) => {
    try {
      const statusSummary = await Dispatch.aggregate([
        { $match: filters },
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 },
            totalItems: { $sum: { $size: '$items' } }
          }
        },
        { $sort: { count: -1 } }
      ]);

      return statusSummary;
    } catch (error) {
      console.error('Error calculating status summary:', error);
      throw error;
    }
  },

  // Get batch dispatch statistics
  getBatchStats: async (filters = {}) => {
    try {
      const batchStats = await Dispatch.aggregate([
        { $match: filters },
        {
          $group: {
            _id: '$isBatchDispatch',
            count: { $sum: 1 },
            totalItems: { $sum: { $size: '$items' } },
            avgDeliveryTime: { $avg: '$deliveryTime' }
          }
        }
      ]);

      return {
        singleDispatch: batchStats.find((stat) => !stat._id) || {
          _id: false,
          count: 0
        },
        batchDispatch: batchStats.find((stat) => stat._id) || {
          _id: true,
          count: 0
        }
      };
    } catch (error) {
      console.error('Error calculating batch stats:', error);
      throw error;
    }
  },

  // Get delivery time statistics
  getDeliveryTimeStats: async (filters = {}) => {
    try {
      const deliveryTimeStats = await Dispatch.aggregate([
        {
          $match: {
            ...filters,
            deliveryTime: { $ne: null }
          }
        },
        {
          $group: {
            _id: null,
            avgDeliveryTime: { $avg: '$deliveryTime' },
            minDeliveryTime: { $min: '$deliveryTime' },
            maxDeliveryTime: { $max: '$deliveryTime' },
            medianDeliveryTime: { $avg: '$deliveryTime' }, // Simplified
            count: { $sum: 1 }
          }
        }
      ]);

      return deliveryTimeStats[0] || {
        avgDeliveryTime: 0,
        minDeliveryTime: 0,
        maxDeliveryTime: 0,
        medianDeliveryTime: 0,
        count: 0
      };
    } catch (error) {
      console.error('Error calculating delivery time stats:', error);
      throw error;
    }
  },

  // Get daily dispatch trend
  getDailyTrend: async (startDate, endDate) => {
    try {
      const dailyTrend = await Dispatch.aggregate([
        {
          $match: {
            dispatchDate: {
              $gte: new Date(startDate),
              $lte: new Date(endDate)
            }
          }
        },
        {
          $group: {
            _id: {
              $dateToString: {
                format: '%Y-%m-%d',
                date: '$dispatchDate'
              }
            },
            dispatchCount: { $sum: 1 },
            totalItems: { $sum: { $size: '$items' } },
            receivedCount: {
              $sum: { $cond: [{ $eq: ['$status', 'received'] }, 1, 0] }
            }
          }
        },
        { $sort: { _id: 1 } }
      ]);

      return dailyTrend;
    } catch (error) {
      console.error('Error calculating daily trend:', error);
      throw error;
    }
  },

  // Get top dispatching shops
  getTopDispatchingShops: async (limit = 10, filters = {}) => {
    try {
      const topShops = await Dispatch.aggregate([
        { $match: filters },
        {
          $addFields: {
            allShopIds: {
              $cond: [
                { $gt: [{ $size: { $ifNull: ['$shopIds', []] } }, 0] },
                { $concatArrays: [['$shopId'], '$shopIds'] },
                ['$shopId']
              ]
            }
          }
        },
        { $unwind: '$allShopIds' },
        {
          $group: {
            _id: '$allShopIds',
            dispatchCount: { $sum: 1 },
            totalItems: { $sum: { $size: '$items' } },
            avgDeliveryTime: { $avg: '$deliveryTime' },
            lastDispatch: { $max: '$dispatchDate' }
          }
        },
        {
          $lookup: {
            from: 'shops',
            localField: '_id',
            foreignField: '_id',
            as: 'shopDetails'
          }
        },
        {
          $unwind: {
            path: '$shopDetails',
            preserveNullAndEmptyArrays: true
          }
        },
        {
          $project: {
            shopId: '$_id',
            shopName: '$shopDetails.name',
            dispatchCount: 1,
            totalItems: 1,
            avgDeliveryTime: { $round: ['$avgDeliveryTime', 2] },
            lastDispatch: 1
          }
        },
        { $sort: { dispatchCount: -1 } },
        { $limit: limit }
      ]);

      return topShops;
    } catch (error) {
      console.error('Error fetching top dispatching shops:', error);
      throw error;
    }
  },

  // Get comprehensive dispatch analytics
  getComprehensiveAnalytics: async function(startDate, endDate) {
    try {
      const filters = {};
      if (startDate || endDate) {
        filters.dispatchDate = {};
        if (startDate) filters.dispatchDate.$gte = new Date(startDate);
        if (endDate) {
          const end = new Date(endDate);
          end.setHours(23, 59, 59, 999);
          filters.dispatchDate.$lte = end;
        }
      }

      const [
        frequencyByShop,
        statusSummary,
        batchStats,
        deliveryTimeStats,
        topShops
      ] = await Promise.all([
        dispatchAnalyticsService.getFrequencyByShop(filters),
        dispatchAnalyticsService.getStatusSummary(filters),
        dispatchAnalyticsService.getBatchStats(filters),
        dispatchAnalyticsService.getDeliveryTimeStats(filters),
        dispatchAnalyticsService.getTopDispatchingShops(10, filters)
      ]);

      return {
        frequencyByShop: frequencyByShop || [],
        statusSummary: statusSummary || [],
        batchStats: batchStats || [],
        deliveryTimeStats: deliveryTimeStats || { avgDeliveryTime: 0, minDeliveryTime: 0, maxDeliveryTime: 0 },
        topShops: topShops || [],
        dateRange: {
          startDate,
          endDate
        },
        message: frequencyByShop.length === 0 ? "No dispatch data available yet" : undefined
      };
    } catch (error) {
      console.error('Error fetching comprehensive analytics:', error);
      throw error;
    }
  }
};