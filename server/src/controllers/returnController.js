import Return from "../models/Return.js";
import Sale from "../models/Sale.js";
import Product from "../models/Product.js";
import { inventoryService } from "../services/inventoryService.js";
import { responseHelper } from "../utils/responseHelper.js";
import mongoose from "mongoose";

// Helper function to generate return number
const generateReturnNo = async () => {
  const lastReturn = await Return.findOne().sort({ createdAt: -1 });
  const lastNo = lastReturn?.returnNo?.split("/")[1] || 0;
  const newNo = parseInt(lastNo) + 1;
  return `RET/${newNo.toString().padStart(6, "0")}`;
};

export const returnController = {
  // Get all returns
  getAll: async (req, res) => {
    try {
      const { shopId, status } = req.query;
      const userRole = req.user.role;

      let query = {};

      // Shop can only see their returns
      if (userRole === "shop") {
        query.shopId = req.user.shopId;
      } else if (shopId) {
        query.shopId = new mongoose.Types.ObjectId(shopId);
      }

      if (status) query.status = status;

      const returns = await Return.find(query)
        .populate("saleId", "billNo")
        .populate("shopId", "name location")
        .populate("items.productId", "name category")
        .sort({ returnDate: -1 });

      return responseHelper.success(res, returns, "Returns retrieved successfully");
    } catch (error) {
      console.error("Error fetching returns:", error);
      return responseHelper.error(res, error.message, 500);
    }
  },

  // Get return by ID
  getById: async (req, res) => {
    try {
      const { id } = req.params;
      const userRole = req.user.role;

      const returnRecord = await Return.findById(id)
        .populate("saleId", "billNo items totalAmount")
        .populate("shopId", "name location")
        .populate("items.productId", "name category price");

      if (!returnRecord) {
        return responseHelper.error(res, "Return not found", 404);
      }

      // Shop can only view own returns
      if (
        userRole === "shop" &&
        returnRecord.shopId._id.toString() !== req.user.shopId.toString()
      ) {
        return responseHelper.error(res, "Unauthorized access", 403);
      }

      return responseHelper.success(res, returnRecord, "Return retrieved successfully");
    } catch (error) {
      console.error("Error fetching return:", error);
      return responseHelper.error(res, error.message, 500);
    }
  },

  // ✅ Create a return (shop -> pending)  [NO inventory update here]
  create: async (req, res) => {
    
    console.log("POST /api/return HIT");
    console.log("User:", req.user);
    console.log("RETURN CREATE API HIT");
    console.log("BODY:", req.body);

    try {
      const { saleId, items } = req.body;
      const userRole = req.user.role;
      const shopId = userRole === "shop" ? req.user.shopId : req.body.shopId;

      if (!items || items.length === 0) {
        return responseHelper.error(res, "Items are required", 400);
      }

      // Validate each item has productId, quantity, reason
      for (const it of items) {
        if (!it.productId || !it.quantity || it.quantity <= 0 || !it.reason) {
          return responseHelper.error(
            res,
            "Each item must have productId, quantity, and reason",
            400
          );
        }

        // Validate reason is one of allowed reasons
        if (!['damaged', 'expired', 'excess'].includes(it.reason)) {
          return responseHelper.error(
            res,
            "Invalid reason. Must be: damaged, expired, or excess",
            400
          );
        }
      }

      let totalRefund = 0;

      // ✅ If saleId provided: calculate from sale
      if (saleId) {
        const sale = await Sale.findById(saleId);
        if (!sale) return responseHelper.error(res, "Sale not found", 404);

        // Shop can only return its own sale
        if (userRole === "shop" && sale.shopId.toString() !== shopId.toString()) {
          return responseHelper.error(res, "Unauthorized access", 403);
        }

        // Calculate total refund from sale items
        for (const item of items) {
          const saleItem = sale.items.find(
            (si) => si.productId.toString() === item.productId.toString()
          );
          if (!saleItem) {
            return responseHelper.error(res, "Returned item not found in the sale", 400);
          }
          totalRefund += (saleItem.price || 0) * item.quantity;
        }
      } else {
        // ✅ No sale: use current product prices
        for (const item of items) {
          const product = await Product.findById(item.productId);
          if (!product) {
            return responseHelper.error(res, `Product not found: ${item.productId}`, 404);
          }
          totalRefund += (product.price || 0) * item.quantity;
        }
      }

      const returnNo = await generateReturnNo();

      const newReturn = await Return.create({
        returnNo,
        saleId: saleId || null,
        shopId,
        items,
        totalRefund,
        status: "pending",
        returnDate: new Date()
      });

      await newReturn.populate("saleId", "billNo");
      await newReturn.populate("shopId", "name location");
      await newReturn.populate("items.productId", "name category");

      // ✅ IMPORTANT: do NOT update inventory here
      return responseHelper.success(
        res,
        newReturn,
        "Return request submitted (pending admin approval)",
        201
      );
    } catch (error) {
      console.error("Error creating return:", error);
      return responseHelper.error(res, error.message, 500);
    }
  },

  // ✅ Update return status (admin only)
  updateStatus: async (req, res) => {
    try {
      const { id } = req.params;
      const { status } = req.body;
      const userRole = req.user.role;

      if (userRole !== "admin") {
        return responseHelper.error(res, "Only admin can update return status", 403);
      }

      if (!["approved", "rejected", "pending"].includes(status)) {
        return responseHelper.error(res, "Invalid status", 400);
      }

      const returnRecord = await Return.findById(id);
      if (!returnRecord) {
        return responseHelper.error(res, "Return not found", 404);
      }

      const previousStatus = returnRecord.status;

      // ✅ BLOCK repeated updates
      if (previousStatus === status) {
        return responseHelper.success(res, returnRecord, "Return already in this status");
      }

      // ✅ BLOCK rejected -> approved
      if (previousStatus === "rejected" && status === "approved") {
        return responseHelper.error(
          res,
          "Cannot approve a rejected return. Create a new return instead.",
          400
        );
      }

      // Apply new status
      returnRecord.status = status;

      // ✅ Inventory updates ONLY on admin approval
      if (previousStatus === "pending" && status === "approved") {
        returnRecord.approvedDate = new Date();
        returnRecord.approvedBy = req.user.id;

        for (const item of returnRecord.items) {
          // Decrease inventory because products are being returned to farm
          await inventoryService.updateInventory(
            returnRecord.shopId,
            item.productId,
            -item.quantity,
            "return_out",
            returnRecord._id.toString()
          );
        }
      }

      // If rejecting, store rejection reason
      if (status === "rejected" && req.body.rejectionReason) {
        returnRecord.rejectionReason = req.body.rejectionReason;
      }

      // If admin changes approved -> rejected, reverse inventory
      if (previousStatus === "approved" && status === "rejected") {
        for (const item of returnRecord.items) {
          // Add back inventory since return is being rejected
          await inventoryService.updateInventory(
            returnRecord.shopId,
            item.productId,
            item.quantity,
            "return_reversal",
            returnRecord._id.toString()
          );
        }
      }

      await returnRecord.save();

      await returnRecord.populate("saleId", "billNo");
      await returnRecord.populate("shopId", "name location");
      await returnRecord.populate("items.productId", "name category");

      return responseHelper.success(res, returnRecord, "Return status updated successfully");
    } catch (error) {
      console.error("Error updating return:", error);
      return responseHelper.error(res, error.message, 500);
    }
  },

  // Delete return (pending only)
  deleteReturn: async (req, res) => {
    try {
      const { id } = req.params;
      const userRole = req.user.role;

      const returnRecord = await Return.findById(id);
      if (!returnRecord) {
        return responseHelper.error(res, "Return not found", 404);
      }

      // Shop can only delete own returns
      if (userRole === "shop" && returnRecord.shopId.toString() !== req.user.shopId.toString()) {
        return responseHelper.error(res, "Unauthorized access", 403);
      }

      // Only pending can be deleted
      if (returnRecord.status !== "pending") {
        return responseHelper.error(res, "Can only delete pending returns", 400);
      }

      // ✅ No inventory was updated in pending stage, so no reverse needed now
      await Return.findByIdAndDelete(id);

      return responseHelper.success(res, null, "Return deleted successfully");
    } catch (error) {
      console.error("Error deleting return:", error);
      return responseHelper.error(res, error.message, 500);
    }
  },

  // Pending count (admin notifications)
  getPendingCount: async (req, res) => {
    try {
      const pendingCount = await Return.countDocuments({ status: "pending" });
      const pendingReturns = await Return.find({ status: "pending" })
        .populate("shopId", "name")
        .populate("items.productId", "name")
        .sort({ returnDate: -1 })
        .limit(5);

      return responseHelper.success(
        res,
        { count: pendingCount, recentReturns: pendingReturns },
        "Pending returns retrieved successfully"
      );
    } catch (error) {
      console.error("Error fetching pending returns:", error);
      return responseHelper.error(res, error.message, 500);
    }
  }
};