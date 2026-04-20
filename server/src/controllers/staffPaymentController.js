import mongoose from 'mongoose';
import StaffPayment from '../models/StaffPayment.js';
import Staff from '../models/Staff.js';
import { responseHelper } from '../utils/responseHelper.js';

export const staffPaymentController = {
  // Get all staff payments
  getAllPayments: async (req, res) => {
    try {
      const { shopId, staffId, month, status } = req.query;
      const userRole = req.user.role;

      let query = {};

      // Shop manager can only see payments for their shop
      if (userRole === 'shop') {
        query.shopId = req.user.shopId;
      } else if (shopId) {
        // Admin can filter by specific shop
        query.shopId = new mongoose.Types.ObjectId(shopId);
      }

      if (staffId) {
        query.staffId = new mongoose.Types.ObjectId(staffId);
      }

      if (month) {
        query.month = month;
      }

      if (status) {
        query.status = status;
      }

      const payments = await StaffPayment.find(query)
        .populate('staffId', 'name email')
        .populate('shopId', 'name')
        .populate('approvedBy', 'name')
        .populate('paidBy', 'name')
        .sort({ paymentDate: -1 });

      return responseHelper.success(res, payments, 'Payments retrieved successfully');
    } catch (error) {
      return responseHelper.error(res, error.message, 500);
    }
  },

  // Get single payment by ID
  getPaymentById: async (req, res) => {
    try {
      const { id } = req.params;
      const userRole = req.user.role;

      const payment = await StaffPayment.findById(id)
        .populate('staffId', 'name email')
        .populate('shopId', 'name')
        .populate('approvedBy', 'name')
        .populate('paidBy', 'name');

      if (!payment) {
        return responseHelper.error(res, 'Payment not found', 404);
      }

      // Shop manager can only view payments for their shop
      if (userRole === 'shop' && payment.shopId._id.toString() !== req.user.shopId.toString()) {
        return responseHelper.error(res, 'Unauthorized access', 403);
      }

      return responseHelper.success(res, payment, 'Payment retrieved successfully');
    } catch (error) {
      return responseHelper.error(res, error.message, 500);
    }
  },

  // Create staff payment
  createPayment: async (req, res) => {
    try {
      const { staffId, amount, paymentDate, paymentMethod, paymentPeriod, month, notes } = req.body;
      const userRole = req.user.role;
      const userId = req.user.id;

      // Validation
      if (!staffId || !amount || !paymentDate || !month) {
        return responseHelper.error(res, 'Missing required fields', 400);
      }

      const staff = await Staff.findById(staffId);
      if (!staff) {
        return responseHelper.error(res, 'Staff not found', 404);
      }

      // Shop manager can only create payments for their shop
      if (userRole === 'shop' && staff.shopId.toString() !== req.user.shopId.toString()) {
        return responseHelper.error(res, 'Unauthorized access', 403);
      }

      // Check if payment already exists for this month
      const existingPayment = await StaffPayment.findOne({
        staffId,
        month,
        shopId: staff.shopId
      });

      if (existingPayment) {
        return responseHelper.error(res, 'Payment already exists for this month', 400);
      }

      const newPayment = new StaffPayment({
        staffId,
        shopId: staff.shopId,
        amount,
        paymentDate,
        paymentMethod: paymentMethod || 'cash',
        paymentPeriod,
        month,
        notes,
        approvedBy: userId
      });

      await newPayment.save();
      await newPayment.populate('staffId', 'name email');
      await newPayment.populate('shopId', 'name');
      await newPayment.populate('approvedBy', 'name');

      return responseHelper.success(res, newPayment, 'Payment created successfully', 201);
    } catch (error) {
      return responseHelper.error(res, error.message, 500);
    }
  },

  // Update payment
  updatePayment: async (req, res) => {
    try {
      const { id } = req.params;
      const { amount, paymentDate, paymentMethod, status, notes, paidBy } = req.body;
      const userRole = req.user.role;

      const payment = await StaffPayment.findById(id);
      if (!payment) {
        return responseHelper.error(res, 'Payment not found', 404);
      }

      // Shop manager can only update payments for their shop
      if (userRole === 'shop' && payment.shopId.toString() !== req.user.shopId.toString()) {
        return responseHelper.error(res, 'Unauthorized access', 403);
      }

      // Update fields
      if (amount) payment.amount = amount;
      if (paymentDate) payment.paymentDate = paymentDate;
      if (paymentMethod) payment.paymentMethod = paymentMethod;
      if (status) payment.status = status;
      if (notes !== undefined) payment.notes = notes;
      if (paidBy) payment.paidBy = paidBy;

      await payment.save();
      await payment.populate('staffId', 'name email');
      await payment.populate('shopId', 'name');
      await payment.populate('approvedBy', 'name');
      await payment.populate('paidBy', 'name');

      return responseHelper.success(res, payment, 'Payment updated successfully');
    } catch (error) {
      return responseHelper.error(res, error.message, 500);
    }
  },

  // Delete payment
  deletePayment: async (req, res) => {
    try {
      const { id } = req.params;
      const userRole = req.user.role;

      const payment = await StaffPayment.findById(id);
      if (!payment) {
        return responseHelper.error(res, 'Payment not found', 404);
      }

      // Shop manager can only delete payments for their shop
      if (userRole === 'shop' && payment.shopId.toString() !== req.user.shopId.toString()) {
        return responseHelper.error(res, 'Unauthorized access', 403);
      }

      // Can only delete pending payments
      if (payment.status !== 'pending') {
        return responseHelper.error(res, 'Can only delete pending payments', 400);
      }

      await StaffPayment.findByIdAndDelete(id);

      return responseHelper.success(res, null, 'Payment deleted successfully');
    } catch (error) {
      return responseHelper.error(res, error.message, 500);
    }
  },

  // Get staff payment summary
  getPaymentSummary: async (req, res) => {
    try {
      const { shopId, year, month } = req.query;
      const userRole = req.user.role;

      let matchQuery = {};

      if (userRole === 'shop') {
        matchQuery.shopId = req.user.shopId;
      } else if (shopId) {
        matchQuery.shopId = new mongoose.Types.ObjectId(shopId);
      }

      if (year && month) {
        matchQuery.month = `${year}-${month.padStart(2, '0')}`;
      }

      const summary = await StaffPayment.aggregate([
        { $match: matchQuery },
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 },
            totalAmount: { $sum: '$amount' }
          }
        }
      ]);

      return responseHelper.success(res, summary, 'Payment summary retrieved successfully');
    } catch (error) {
      return responseHelper.error(res, error.message, 500);
    }
  },

  // Get pending payments
  getPendingPayments: async (req, res) => {
    try {
      const { shopId } = req.query;
      const userRole = req.user.role;

      let query = { status: 'pending' };

      if (userRole === 'shop') {
        query.shopId = req.user.shopId;
      } else if (shopId) {
        query.shopId = new mongoose.Types.ObjectId(shopId);
      }

      const payments = await StaffPayment.find(query)
        .populate('staffId', 'name email baseSalary')
        .populate('shopId', 'name')
        .sort({ paymentDate: 1 });

      return responseHelper.success(res, payments, 'Pending payments retrieved successfully');
    } catch (error) {
      return responseHelper.error(res, error.message, 500);
    }
  }
};
