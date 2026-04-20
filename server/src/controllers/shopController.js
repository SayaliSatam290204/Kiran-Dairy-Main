import mongoose from "mongoose";
import Inventory from "../models/Inventory.js";
import Product from "../models/Product.js";
import Sale from "../models/Sale.js";
import Dispatch from "../models/Dispatch.js";
import Return from "../models/Return.js";
import Staff from "../models/Staff.js";
import { inventoryService } from "../services/inventoryService.js";
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

      const staffPerformance = await staffPerformanceService.getShopStaffPerformance(shopId);

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

      responseHelper.success(
        res,
        {
          totalInventory,
          totalSales,
          totalReceivedDispatches,
          pendingReturns,
          totalRevenue,
          staffPerformance
        },
        "Shop dashboard data fetched successfully"
      );
    } catch (error) {
      console.error("Error fetching shop dashboard:", error);
      responseHelper.error(res, "Failed to fetch shop dashboard data", 500);
    }
  },

  getInventory: async (req, res) => {
    try {
      const shopId = req.user.shopId;
      if (!shopId) return responseHelper.error(res, "ShopId missing in token", 400);

      const inventory = await Inventory.find({ shopId })
        .populate("productId", "name sku price category unit imageUrl")
        .sort({ createdAt: -1 });

      responseHelper.success(res, inventory, "Inventory fetched successfully");
    } catch (error) {
      console.error("Error fetching inventory:", error);
      responseHelper.error(res, "Failed to fetch inventory", 500);
    }
  },

  getReceivedDispatches: async (req, res) => {
    try {
      const shopId = req.user.shopId;
      if (!shopId) return responseHelper.error(res, "ShopId missing in token", 400);

      const dispatches = await Dispatch.find({
        $or: [{ shopId: shopId }, { shopIds: shopId }],
        status: "received"
      })
        .populate("shopId", "name location")
        .populate("shopIds", "name location")
        .populate("items.productId", "name sku price")
        .populate("confirmedBy", "name")
        .sort({ receivedDate: -1 })
        .limit(10);

      responseHelper.success(res, dispatches, "Received dispatches fetched successfully");
    } catch (error) {
      console.error("Error fetching received dispatches:", error);
      responseHelper.error(res, "Failed to fetch received dispatches", 500);
    }
  },

  getStaffPerformance: async (req, res) => {
    try {
      const shopId = req.user.shopId;
      if (!shopId) return responseHelper.error(res, "ShopId missing in token", 400);

      const { period = "monthly", year, month, date } = req.query;

      const staffPerformance = await staffPerformanceService.getShopStaffPerformanceByPeriod(
        shopId,
        period,
        year,
        month,
        date
      );

      responseHelper.success(res, staffPerformance, "Staff performance fetched successfully");
    } catch (error) {
      console.error("Error fetching staff performance:", error);
      responseHelper.error(res, "Failed to fetch staff performance", 500);
    }
  },

  getStaffDetailedPerformance: async (req, res) => {
    try {
      const shopId = req.user.shopId;
      const { staffId } = req.params;
      const year = parseInt(req.query.year) || new Date().getFullYear();
      const month = parseInt(req.query.month) || new Date().getMonth() + 1;

      if (!shopId) return responseHelper.error(res, "ShopId missing in token", 400);
      if (!staffId) return responseHelper.error(res, "Staff ID is required", 400);

      const staff = await Staff.findById(staffId);
      if (!staff) return responseHelper.error(res, "Staff not found", 404);
      if (staff.shopId.toString() !== shopId.toString()) {
        return responseHelper.error(res, "Unauthorized access", 403);
      }

      const performance = await staffPerformanceService.getStaffDetailedPerformance(
        staffId,
        year,
        month
      );

      responseHelper.success(res, performance, "Staff detailed performance fetched successfully");
    } catch (error) {
      console.error("Error fetching staff detailed performance:", error);
      responseHelper.error(res, "Failed to fetch staff detailed performance", 500);
    }
  }
};