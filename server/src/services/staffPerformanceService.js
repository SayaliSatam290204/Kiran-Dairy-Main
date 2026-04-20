import Sale from '../models/Sale.js';
import Staff from '../models/Staff.js';
import mongoose from 'mongoose';

export const staffPerformanceService = {
  // Get daily performance for a staff member
  async getDailyPerformance(staffId, date) {
    try {
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);
      
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);

      const sales = await Sale.aggregate([
        {
          $match: {
            staffId: new mongoose.Types.ObjectId(staffId),
            saleDate: { $gte: startOfDay, $lte: endOfDay },
            paymentStatus: 'completed'
          }
        },
        {
          $group: {
            _id: '$shift',
            totalSales: { $sum: 1 },
            totalAmount: { $sum: '$totalAmount' },
            itemsSold: { $sum: { $size: '$items' } }
          }
        }
      ]);

      return sales;
    } catch (error) {
      throw error;
    }
  },

  // Get weekly performance
  async getWeeklyPerformance(staffId, date) {
    try {
      const currentDate = new Date(date);
      const dayOfWeek = currentDate.getDay();
      const startOfWeek = new Date(currentDate);
      startOfWeek.setDate(currentDate.getDate() - dayOfWeek);
      startOfWeek.setHours(0, 0, 0, 0);

      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 6);
      endOfWeek.setHours(23, 59, 59, 999);

      const sales = await Sale.aggregate([
        {
          $match: {
            staffId: new mongoose.Types.ObjectId(staffId),
            saleDate: { $gte: startOfWeek, $lte: endOfWeek },
            paymentStatus: 'completed'
          }
        },
        {
          $group: {
            _id: null,
            totalSales: { $sum: 1 },
            totalAmount: { $sum: '$totalAmount' },
            itemsSold: { $sum: { $size: '$items' } },
            avgSaleAmount: { $avg: '$totalAmount' }
          }
        }
      ]);

      return sales[0] || { totalSales: 0, totalAmount: 0, itemsSold: 0, avgSaleAmount: 0 };
    } catch (error) {
      throw error;
    }
  },

  // Get monthly performance
  async getMonthlyPerformance(staffId, year, month) {
    try {
      const startOfMonth = new Date(year, month - 1, 1);
      const endOfMonth = new Date(year, month, 0);
      endOfMonth.setHours(23, 59, 59, 999);

      const sales = await Sale.aggregate([
        {
          $match: {
            staffId: new mongoose.Types.ObjectId(staffId),
            saleDate: { $gte: startOfMonth, $lte: endOfMonth },
            paymentStatus: 'completed'
          }
        },
        {
          $group: {
            _id: null,
            totalSales: { $sum: 1 },
            totalAmount: { $sum: '$totalAmount' },
            itemsSold: { $sum: { $size: '$items' } },
            avgSaleAmount: { $avg: '$totalAmount' }
          }
        }
      ]);

      return sales[0] || { totalSales: 0, totalAmount: 0, itemsSold: 0, avgSaleAmount: 0 };
    } catch (error) {
      throw error;
    }
  },

  // Get yearly performance
  async getYearlyPerformance(staffId, year) {
    try {
      const startOfYear = new Date(year, 0, 1);
      const endOfYear = new Date(year, 11, 31);
      endOfYear.setHours(23, 59, 59, 999);

      const sales = await Sale.aggregate([
        {
          $match: {
            staffId: new mongoose.Types.ObjectId(staffId),
            saleDate: { $gte: startOfYear, $lte: endOfYear },
            paymentStatus: 'completed'
          }
        },
        {
          $group: {
            _id: null,
            totalSales: { $sum: 1 },
            totalAmount: { $sum: '$totalAmount' },
            itemsSold: { $sum: { $size: '$items' } },
            avgSaleAmount: { $avg: '$totalAmount' }
          }
        }
      ]);

      return sales[0] || { totalSales: 0, totalAmount: 0, itemsSold: 0, avgSaleAmount: 0 };
    } catch (error) {
      throw error;
    }
  },

  // Get shop staff performance with all metrics
  async getShopStaffPerformance(shopId) {
    try {
      const today = new Date();
      const thisMonth = today.getMonth() + 1;
      const thisYear = today.getFullYear();

      // Get all active staff for the shop
      const staff = await Staff.find({ shopId, isActive: true })
        .select('_id name email baseSalary shifts');

      // Calculate performance for each staff member
      const staffPerformance = await Promise.all(
        staff.map(async (member) => {
          const dailyPerf = await this.getDailyPerformance(member._id, today);
          const weeklyPerf = await this.getWeeklyPerformance(member._id, today);
          const monthlyPerf = await this.getMonthlyPerformance(member._id, thisYear, thisMonth);
          const yearlyPerf = await this.getYearlyPerformance(member._id, thisYear);

          return {
            _id: member._id,
            name: member.name,
            email: member.email,
            baseSalary: member.baseSalary,
            shifts: member.shifts,
            daily: dailyPerf,
            weekly: weeklyPerf,
            monthly: monthlyPerf,
            yearly: yearlyPerf
          };
        })
      );

      return staffPerformance;
    } catch (error) {
      throw error;
    }
  },

  // Get admin view of all staff performance across shops
  async getAllStaffPerformance() {
    try {
      const today = new Date();
      const thisMonth = today.getMonth() + 1;
      const thisYear = today.getFullYear();

      // Get all active staff
      const staff = await Staff.find({ isActive: true })
        .populate('shopId', 'name location')
        .select('_id name email shopId baseSalary shifts');

      // Calculate performance for each staff member
      const staffPerformance = await Promise.all(
        staff.map(async (member) => {
          const monthlyPerf = await this.getMonthlyPerformance(member._id, thisYear, thisMonth);

          return {
            _id: member._id,
            name: member.name,
            email: member.email,
            shopId: member.shopId,
            baseSalary: member.baseSalary,
            shifts: member.shifts,
            monthlyPerformance: monthlyPerf
          };
        })
      );

      // Sort by monthly sales amount (descending)
      return staffPerformance.sort((a, b) => 
        (b.monthlyPerformance?.totalAmount || 0) - (a.monthlyPerformance?.totalAmount || 0)
      );
    } catch (error) {
      throw error;
    }
  },

  // Get shop daily performance aggregated by shifts (when >1 staff work same day)
  async getShopDailyPerformanceByShift(shopId, date) {
    try {
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);
      
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);

      const shiftwisePerformance = await Sale.aggregate([
        {
          $match: {
            shopId: new mongoose.Types.ObjectId(shopId),
            saleDate: { $gte: startOfDay, $lte: endOfDay },
            paymentStatus: 'completed'
          }
        },
        {
          $group: {
            _id: '$shift',
            totalSales: { $sum: 1 },
            totalAmount: { $sum: '$totalAmount' },
            itemsSold: { $sum: { $size: '$items' } },
            staffCount: { $addToSet: '$staffId' }
          }
        },
        {
          $project: {
            _id: 1,
            shift: '$_id',
            totalSales: 1,
            totalAmount: 1,
            itemsSold: 1,
            staffWorking: { $size: '$staffCount' }
          }
        },
        {
          $sort: { _id: 1 }
        }
      ]);

      // Also get total combined for the day
      const dailyTotal = shiftwisePerformance.reduce((acc, shift) => ({
        totalSales: acc.totalSales + shift.totalSales,
        totalAmount: acc.totalAmount + shift.totalAmount,
        itemsSold: acc.itemsSold + shift.itemsSold
      }), { totalSales: 0, totalAmount: 0, itemsSold: 0 });

      return {
        byShift: shiftwisePerformance,
        dailyTotal,
        date: startOfDay
      };
    } catch (error) {
      throw error;
    }
  },

  // Get shop monthly performance aggregated by shifts
  async getShopMonthlyPerformanceByShift(shopId, year, month) {
    try {
      const startOfMonth = new Date(year, month - 1, 1);
      const endOfMonth = new Date(year, month, 0);
      endOfMonth.setHours(23, 59, 59, 999);

      const shiftwisePerformance = await Sale.aggregate([
        {
          $match: {
            shopId: new mongoose.Types.ObjectId(shopId),
            saleDate: { $gte: startOfMonth, $lte: endOfMonth },
            paymentStatus: 'completed'
          }
        },
        {
          $group: {
            _id: '$shift',
            totalSales: { $sum: 1 },
            totalAmount: { $sum: '$totalAmount' },
            itemsSold: { $sum: { $size: '$items' } },
            avgSaleAmount: { $avg: '$totalAmount' },
            daysWorked: { $addToSet: { $dateToString: { format: '%Y-%m-%d', date: '$saleDate' } } }
          }
        },
        {
          $project: {
            _id: 1,
            shift: '$_id',
            totalSales: 1,
            totalAmount: 1,
            itemsSold: 1,
            avgSaleAmount: { $round: ['$avgSaleAmount', 2] },
            daysWorked: { $size: '$daysWorked' }
          }
        },
        {
          $sort: { _id: 1 }
        }
      ]);

      const monthlyTotal = shiftwisePerformance.reduce((acc, shift) => ({
        totalSales: acc.totalSales + shift.totalSales,
        totalAmount: acc.totalAmount + shift.totalAmount,
        itemsSold: acc.itemsSold + shift.itemsSold
      }), { totalSales: 0, totalAmount: 0, itemsSold: 0 });

      return {
        byShift: shiftwisePerformance,
        monthlyTotal,
        period: `${year}-${String(month).padStart(2, '0')}`
      };
    } catch (error) {
      throw error;
    }
  },

  // Get shop yearly performance aggregated by shifts
  async getShopYearlyPerformanceByShift(shopId, year) {
    try {
      const startOfYear = new Date(year, 0, 1);
      const endOfYear = new Date(year, 11, 31);
      endOfYear.setHours(23, 59, 59, 999);

      const shiftwisePerformance = await Sale.aggregate([
        {
          $match: {
            shopId: new mongoose.Types.ObjectId(shopId),
            saleDate: { $gte: startOfYear, $lte: endOfYear },
            paymentStatus: 'completed'
          }
        },
        {
          $group: {
            _id: '$shift',
            totalSales: { $sum: 1 },
            totalAmount: { $sum: '$totalAmount' },
            itemsSold: { $sum: { $size: '$items' } },
            avgSaleAmount: { $avg: '$totalAmount' }
          }
        },
        {
          $project: {
            _id: 1,
            shift: '$_id',
            totalSales: 1,
            totalAmount: 1,
            itemsSold: 1,
            avgSaleAmount: { $round: ['$avgSaleAmount', 2] }
          }
        },
        {
          $sort: { _id: 1 }
        }
      ]);

      const yearlyTotal = shiftwisePerformance.reduce((acc, shift) => ({
        totalSales: acc.totalSales + shift.totalSales,
        totalAmount: acc.totalAmount + shift.totalAmount,
        itemsSold: acc.itemsSold + shift.itemsSold
      }), { totalSales: 0, totalAmount: 0, itemsSold: 0 });

      return {
        byShift: shiftwisePerformance,
        yearlyTotal,
        year
      };
    } catch (error) {
      throw error;
    }
  },

  // Get staff individual performance with monthly/yearly breakdown
  async getStaffDetailedPerformance(staffId, year, month) {
    try {
      const staff = await Staff.findById(staffId).populate('shopId', 'name location');
      
      const monthlyPerf = await this.getMonthlyPerformance(staffId, year, month);
      const yearlyPerf = await this.getYearlyPerformance(staffId, year);

      // Get daily breakdown for current month
      const startOfMonth = new Date(year, month - 1, 1);
      const endOfMonth = new Date(year, month, 0);
      endOfMonth.setHours(23, 59, 59, 999);

      const dailyBreakdown = await Sale.aggregate([
        {
          $match: {
            staffId: new mongoose.Types.ObjectId(staffId),
            saleDate: { $gte: startOfMonth, $lte: endOfMonth },
            paymentStatus: 'completed'
          }
        },
        {
          $group: {
            _id: { 
              date: { $dateToString: { format: '%Y-%m-%d', date: '$saleDate' } },
              shift: '$shift'
            },
            totalSales: { $sum: 1 },
            totalAmount: { $sum: '$totalAmount' },
            itemsSold: { $sum: { $size: '$items' } }
          }
        },
        { $sort: { '_id.date': -1, '_id.shift': 1 } },
        { $limit: 50 }
      ]);

      return {
        staff: {
          _id: staff._id,
          name: staff.name,
          email: staff.email,
          shop: staff.shopId
        },
        monthly: monthlyPerf,
        yearly: yearlyPerf,
        dailyBreakdown
      };
    } catch (error) {
      throw error;
    }
  },

  // Get shop staff performance by period (monthly, yearly, daily) with shift breakdown
  async getShopStaffPerformanceByPeriod(shopId, period = 'monthly', year, month, date) {
    try {
      let matchStage = {};

      if (period === 'daily' && date) {
        const startDate = new Date(date);
        startDate.setHours(0, 0, 0, 0);
        const endDate = new Date(date);
        endDate.setHours(23, 59, 59, 999);
        matchStage = {
          shopId: new mongoose.Types.ObjectId(shopId),
          createdAt: { $gte: startDate, $lte: endDate },
          paymentStatus: 'completed'
        };
      } else if (period === 'monthly' && year && month) {
        const startDate = new Date(year, month - 1, 1);
        const endDate = new Date(year, month, 1);
        matchStage = {
          shopId: new mongoose.Types.ObjectId(shopId),
          createdAt: { $gte: startDate, $lte: endDate },
          paymentStatus: 'completed'
        };
      } else if (period === 'yearly' && year) {
        const startDate = new Date(year, 0, 1);
        const endDate = new Date(year + 1, 0, 1);
        matchStage = {
          shopId: new mongoose.Types.ObjectId(shopId),
          createdAt: { $gte: startDate, $lte: endDate },
          paymentStatus: 'completed'
        };
      } else {
        // Default to current month
        const today = new Date();
        const startDate = new Date(today.getFullYear(), today.getMonth(), 1);
        const endDate = new Date(today.getFullYear(), today.getMonth() + 1, 1);
        matchStage = {
          shopId: new mongoose.Types.ObjectId(shopId),
          createdAt: { $gte: startDate, $lte: endDate },
          paymentStatus: 'completed'
        };
      }

      // Get data by shift
      const byShift = await Sale.aggregate([
        { $match: matchStage },
        {
          $group: {
            _id: '$shift',
            totalSales: { $sum: 1 },
            totalAmount: { $sum: '$totalAmount' },
            itemsSold: { $sum: { $size: '$items' } },
            staffIds: { $addToSet: '$staffId' }
          }
        },
        {
          $project: {
            shift: '$_id',
            totalSales: 1,
            totalAmount: 1,
            itemsSold: 1,
            avgSaleAmount: { $round: [{ $divide: ['$totalAmount', '$totalSales'] }, 0] },
            staffWorking: { $size: '$staffIds' },
            daysWorked: 1,
            _id: 0
          }
        },
        { $sort: { shift: 1 } }
      ]);

      // Get monthly/daily total
      const totalData = await Sale.aggregate([
        { $match: matchStage },
        {
          $group: {
            _id: null,
            totalSales: { $sum: 1 },
            totalAmount: { $sum: '$totalAmount' },
            itemsSold: { $sum: { $size: '$items' } }
          }
        },
        {
          $project: {
            totalSales: 1,
            totalAmount: 1,
            itemsSold: 1,
            avgSaleAmount: { $round: [{ $divide: ['$totalAmount', '$totalSales'] }, 0] },
            _id: 0
          }
        }
      ]);

      const total = totalData[0] || {
        totalSales: 0,
        totalAmount: 0,
        itemsSold: 0,
        avgSaleAmount: 0
      };

      // Format period string
      let periodStr = '';
      if (period === 'daily') {
        periodStr = new Date(date).toISOString().split('T')[0];
      } else if (period === 'monthly') {
        periodStr = `${year}-${String(month).padStart(2, '0')}`;
      } else if (period === 'yearly') {
        periodStr = `${year}`;
      }

      return {
        byShift,
        [period === 'monthly' ? 'monthlyTotal' : period === 'yearly' ? 'yearlyTotal' : 'dailyTotal']: total,
        period: periodStr
      };
    } catch (error) {
      throw error;
    }
  }
};
