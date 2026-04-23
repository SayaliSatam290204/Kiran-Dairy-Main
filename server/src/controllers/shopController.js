import mongoose from "mongoose";
import Sale from "../models/Sale.js";
import Shop from "../models/Shop.js";
import Staff from "../models/Staff.js";
import Inventory from "../models/Inventory.js";
import Dispatch from "../models/Dispatch.js";
import Return from "../models/Return.js";
import { staffPerformanceService } from "../services/staffPerformanceService.js";
import { responseHelper } from "../utils/responseHelper.js";

export const shopController = {

  getDashboard: async (req, res) => {
    try {
      const shopId = req.user.shopId;
      if (!shopId) return responseHelper.error(res, "ShopId missing in token", 400);

      const totalInventoryResult = await Inventory.aggregate([
        { $match: { shopId: new mongoose.Types.ObjectId(shopId) } },
        { $group: { _id: null, totalInventory: { $sum: "$quantity" } } }
      ]);

      const totalInventory = totalInventoryResult[0]?.totalInventory || 0;

      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);

      const todayEnd = new Date();
      todayEnd.setHours(23, 59, 59, 999);

      const totalSalesResult = await Sale.aggregate([
        {
          $match: {
            shopId: new mongoose.Types.ObjectId(shopId),
            createdAt: { $gte: todayStart, $lte: todayEnd }
          }
        },
        { $group: { _id: null, totalSales: { $sum: 1 } } }
      ]);

      const totalSales = totalSalesResult[0]?.totalSales || 0;

      const totalReceivedDispatches = await Dispatch.countDocuments({
        shopId,
        status: "received"
      });

      const pendingReturns = await Return.countDocuments({
        shopId,
        status: "pending"
      });

      let staffPerformance = null;
      try {
        staffPerformance = await staffPerformanceService.getShopStaffPerformance(shopId);
      } catch (err) {
        console.error("Staff performance error:", err);
      }

      const totalRevenueResult = await Sale.aggregate([
        {
          $match: {
            shopId: new mongoose.Types.ObjectId(shopId),
            createdAt: { $gte: todayStart, $lte: todayEnd }
          }
        },
        { $group: { _id: null, totalRevenue: { $sum: "$totalAmount" } } }
      ]);

      const totalRevenue = totalRevenueResult[0]?.totalRevenue || 0;

      return responseHelper.success(res, {
        totalInventory,
        totalSales,
        totalReceivedDispatches,
        pendingReturns,
        totalRevenue,
        staffPerformance
      }, "Shop dashboard data fetched successfully");

    } catch (error) {
      console.error("Dashboard error:", error);
      return responseHelper.error(res, "Failed to fetch dashboard", 500);
    }
  },

  getInventory: async (req, res) => {
    try {
      const shopId = req.user.shopId;

      const inventory = await Inventory.find({ shopId })
        .populate("productId", "name sku price category unit imageUrl")
        .sort({ createdAt: -1 });

      return responseHelper.success(res, inventory, "Inventory fetched successfully");
    } catch (error) {
      return responseHelper.error(res, "Failed to fetch inventory", 500);
    }
  },

  getReceivedDispatches: async (req, res) => {
    try {
      const shopId = req.user.shopId;

      const dispatches = await Dispatch.find({
        $or: [{ shopId }, { shopIds: shopId }],
        status: "received"
      })
        .populate("items.productId", "name sku price")
        .populate("confirmedBy", "name")
        .sort({ receivedDate: -1 })
        .limit(10);

      return responseHelper.success(res, dispatches);
    } catch (error) {
      return responseHelper.error(res, "Failed to fetch dispatches", 500);
    }
  },

  getStaffPerformance: async (req, res) => {
    try {
      const shopId = req.user.shopId;

      const { period = "monthly", year, month, date } = req.query;

      const data = await staffPerformanceService.getShopStaffPerformanceByPeriod(
        shopId,
        period,
        year,
        month,
        date
      );

      return responseHelper.success(res, data);
    } catch (error) {
      return responseHelper.error(res, "Failed to fetch staff performance", 500);
    }
  },

  // ✅ SAFE FIX: These prevent route crash
  getStaffDetailedPerformance: async (req, res) => {
    return responseHelper.success(res, {
      message: "Staff detailed performance not implemented yet"
    });
  },

  getPreviewData: async (req, res) => {
    return responseHelper.success(res, {
      branchData: [],
      staffData: [],
      topBranchesData: []
    });
  }
};