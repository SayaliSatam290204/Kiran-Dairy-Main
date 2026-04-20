import Inventory from "../models/Inventory.js";
import StockLedger from "../models/StockLedger.js";

export const inventoryService = {
  async updateInventory(shopId, productId, quantity, transactionType, referenceId = null) {
    try {
      // ✅ Input validation
      if (!shopId || !productId) {
        throw new Error("shopId and productId are required");
      }
      if (typeof quantity !== "number" || isNaN(quantity)) {
        throw new Error("quantity must be a valid number");
      }
      if (!["dispatch_in", "received", "sale_out", "return_in", "return_out", "return_reversal", "adjustment"].includes(transactionType)) {
        throw new Error(`Invalid transactionType: ${transactionType}`);
      }

      // ✅ Determine reference type
      let referenceType = null;
      if (["dispatch_in", "received"].includes(transactionType)) {
        referenceType = "dispatch";
      } else if (transactionType === "sale_out") {
        referenceType = "sale";
      } else if (["return_in", "return_out", "return_reversal"].includes(transactionType)) {
        referenceType = "return";
      } else if (transactionType === "adjustment") {
        referenceType = "adjustment";
      }

      // ✅ Prevent negative inventory (except for specific transaction types)
      if (!["return_out", "sale_out", "adjustment"].includes(transactionType)) {
        // These can reduce inventory
      } else {
        const currentInventory = await Inventory.findOne({ shopId, productId });
        if (currentInventory && (currentInventory.quantity + quantity) < 0) {
          throw new Error(`Insufficient inventory. Available: ${currentInventory.quantity}, Requested: ${Math.abs(quantity)}`);
        }
      }

      // ✅ Update inventory and ledger in transaction-like manner
      const inventory = await Inventory.findOneAndUpdate(
        { shopId, productId },
        {
          $inc: { quantity },
          $set: { lastUpdated: new Date() }
        },
        { new: true, upsert: true, setDefaultsOnInsert: true }
      );

      // ✅ Create ledger entry
      await StockLedger.create({
        shopId,
        productId,
        transactionType,
        quantity,
        referenceId: referenceId || null,
        referenceType,
        transactionDate: new Date()
      });

      return inventory;
    } catch (error) {
      throw new Error(`Inventory update failed: ${error.message}`);
    }
  },

  async getInventory(shopId) {
    try {
      if (!shopId) {
        throw new Error("shopId is required");
      }

      return await Inventory.find({ shopId })
        .populate("productId")
        .populate("shopId");
    } catch (error) {
      throw new Error(`Failed to fetch inventory: ${error.message}`);
    }
  }
};