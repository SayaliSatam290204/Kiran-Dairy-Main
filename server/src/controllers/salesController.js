import Sale from '../models/Sale.js';
import Inventory from '../models/Inventory.js';
import StockLedger from '../models/StockLedger.js';
import { generateBillNo } from '../utils/generateBillNo.js';
import { inventoryService } from '../services/inventoryService.js';
import { responseHelper } from '../utils/responseHelper.js';

export const salesController = {
  // Create a new sale and update inventory
  create: async (req, res) => {
    try {
      const { items, totalAmount, paymentMethod, paymentDetails } = req.body;
      const shopId = req.user?.shopId;

      // Validate input
      if (!items || items.length === 0 || !totalAmount || !paymentMethod) {
        return responseHelper.error(res, 'Items, total amount, and payment method are required', 400);
      }

      if (!shopId) {
        return responseHelper.error(res, 'Shop ID not found in user session', 400);
      }

      // Validate split payment amounts if applicable
      if (paymentMethod === 'split' && paymentDetails) {
        let totalPaid = 0;
        Object.keys(paymentDetails).forEach(method => {
          if (paymentDetails[method] && paymentDetails[method].amount) {
            totalPaid += paymentDetails[method].amount;
          }
        });
        
        if (Math.abs(totalPaid - totalAmount) > 0.01) { // Allow small floating point difference
          return responseHelper.error(res, 'Payment amounts do not equal total amount', 400);
        }
      }

      // Generate unique bill number
      const billNo = await generateBillNo();

      // Validate stock availability for all items
      for (const item of items) {
        const inventory = await Inventory.findOne({
          shopId,
          productId: item.productId
        });

        const availableQty = inventory?.quantity || 0;
        if (availableQty < item.quantity) {
          return responseHelper.error(
            res,
            `Insufficient stock for ${item.productName}. Available: ${availableQty}, Requested: ${item.quantity}`,
            400
          );
        }
      }

      // Calculate items with subtotal
      const processedItems = items.map(item => ({
        productId: item.productId,
        productName: item.productName,
        quantity: item.quantity,
        price: item.price,
        subtotal: item.price * item.quantity
      }));

      // Create sale record
      const sale = new Sale({
        billNo,
        shopId,
        items: processedItems,
        totalAmount,
        paymentMethod,
        paymentDetails: paymentDetails || null,
        paymentStatus: 'completed',
        saleDate: new Date()
      });

      await sale.save();

      // Update inventory for each item (decrease quantity)
      for (const item of items) {
        await inventoryService.updateInventory(
          shopId,
          item.productId,
          -item.quantity, // Negative quantity to decrease
          'sale_out',
          sale._id
        );
      }

      // Populate sale data for response
      await sale.populate('shopId', 'name location');
      await sale.populate('items.productId', 'name sku price category');

      responseHelper.success(
        res,
        sale,
        'Sale completed and inventory updated successfully',
        201
      );
    } catch (error) {
      console.error('Error creating sale:', error);
      responseHelper.error(res, 'Failed to create sale', 500);
    }
  },

  // Get sales history for a shop
  getHistory: async (req, res) => {
    try {
      const shopId = req.user?.shopId;

      if (!shopId) {
        return responseHelper.error(res, 'Shop ID not found in user session', 400);
      }

      const sales = await Sale.find({ shopId })
        .populate('shopId', 'name location')
        .populate('items.productId', 'name sku price category')
        .sort('-saleDate')
        .limit(100);

      responseHelper.success(res, sales, 'Sales history fetched successfully');
    } catch (error) {
      console.error('Error fetching sales history:', error);
      responseHelper.error(res, 'Failed to fetch sales history', 500);
    }
  },

  // Add product quantity to shop inventory (manager can restock from store)
  addToInventory: async (req, res) => {
    try {
      const { productId, quantity } = req.body;
      const shopId = req.user?.shopId;

      if (!productId || !quantity || quantity <= 0) {
        return responseHelper.error(
          res,
          'Product ID and positive quantity are required',
          400
        );
      }

      if (!shopId) {
        return responseHelper.error(res, 'Shop ID not found in user session', 400);
      }

      // Update or create inventory record
      const inventory = await Inventory.findOneAndUpdate(
        { shopId, productId },
        { $inc: { quantity } },
        { new: true, upsert: true }
      ).populate('productId', 'name sku price category');

      // Create stock ledger entry
      await StockLedger.create({
        shopId,
        productId,
        transactionType: 'manual_add',
        quantity,
        referenceType: 'inventory_adjustment'
      });

      responseHelper.success(
        res,
        inventory,
        'Product added to inventory successfully',
        201
      );
    } catch (error) {
      console.error('Error adding to inventory:', error);
      responseHelper.error(res, 'Failed to add to inventory', 500);
    }
  },

  // Get all sales (admin view)
  getAllSales: async (req, res) => {
    try {
      const sales = await Sale.find()
        .populate('shopId', 'name location')
        .populate('items.productId', 'name sku price category')
        .sort('-saleDate')
        .limit(200);

      responseHelper.success(res, sales, 'All sales fetched successfully');
    } catch (error) {
      console.error('Error fetching all sales:', error);
      responseHelper.error(res, 'Failed to fetch sales', 500);
    }
  }
};
