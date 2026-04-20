import mongoose from 'mongoose';
import Staff from '../models/Staff.js';
import { responseHelper } from '../utils/responseHelper.js';

export const staffController = {
  // Get all staff for admin or shop manager
  getAllStaff: async (req, res) => {
    try {
      const { shopId } = req.query;
      const userId = req.user.id;
      const userRole = req.user.role;

      let query = {};

      // Shop manager can only see staff of their shop
      if (userRole === 'shop') {
        query.shopId = req.user.shopId;
      } else if (shopId) {
        // Admin can filter by specific shop
        query.shopId = new mongoose.Types.ObjectId(shopId);
      }

      const staff = await Staff.find(query)
        .populate('shopId', 'name location')
        .populate('createdBy', 'name email')
        .sort({ createdAt: -1 });

      return responseHelper.success(res, staff, 'Staff retrieved successfully');
    } catch (error) {
      return responseHelper.error(res, error.message, 500);
    }
  },

  // Get single staff by ID
  getStaffById: async (req, res) => {
    try {
      const { id } = req.params;
      const userRole = req.user.role;

      const staff = await Staff.findById(id)
        .populate('shopId', 'name location')
        .populate('createdBy', 'name email');

      if (!staff) {
        return responseHelper.error(res, 'Staff not found', 404);
      }

      // Shop manager can only view staff from their shop
      if (userRole === 'shop' && staff.shopId._id.toString() !== req.user.shopId.toString()) {
        return responseHelper.error(res, 'Unauthorized access', 403);
      }

      return responseHelper.success(res, staff, 'Staff retrieved successfully');
    } catch (error) {
      return responseHelper.error(res, error.message, 500);
    }
  },

  // Create new staff
  createStaff: async (req, res) => {
    try {
      const { name, email, phone, shopId, shifts, baseSalary, joinDate, notes } = req.body;
      const userRole = req.user.role;
      const userId = req.user.id;

      // Validation
      if (!name || !email || !phone || !baseSalary || !joinDate) {
        return responseHelper.error(res, 'Missing required fields', 400);
      }

      // Shop manager can only create staff for their shop
      const assignedShopId = userRole === 'shop' ? req.user.shopId : shopId;
      if (!assignedShopId) {
        return responseHelper.error(res, 'Shop ID is required', 400);
      }

      // Check if email already exists
      const existingStaff = await Staff.findOne({ email });
      if (existingStaff) {
        return responseHelper.error(res, 'Email already exists', 400);
      }

      const newStaff = new Staff({
        name,
        email,
        phone,
        shopId: assignedShopId,
        shifts: shifts || ['morning'],
        baseSalary,
        joinDate,
        createdBy: userId,
        notes
      });

      await newStaff.save();
      await newStaff.populate('shopId', 'name location');
      await newStaff.populate('createdBy', 'name email');

      return responseHelper.success(res, newStaff, 'Staff created successfully', 201);
    } catch (error) {
      return responseHelper.error(res, error.message, 500);
    }
  },

  // Update staff
  updateStaff: async (req, res) => {
    try {
      const { id } = req.params;
      const { name, email, phone, shifts, baseSalary, status, joinDate, notes } = req.body;
      const userRole = req.user.role;

      const staff = await Staff.findById(id);
      if (!staff) {
        return responseHelper.error(res, 'Staff not found', 404);
      }

      // Shop manager can only update staff from their shop
      if (userRole === 'shop' && staff.shopId.toString() !== req.user.shopId.toString()) {
        return responseHelper.error(res, 'Unauthorized access', 403);
      }

      // Update fields
      if (name) staff.name = name;
      if (email && email !== staff.email) {
        const existingStaff = await Staff.findOne({ email });
        if (existingStaff) {
          return responseHelper.error(res, 'Email already exists', 400);
        }
        staff.email = email;
      }
      if (phone) staff.phone = phone;
      if (shifts) staff.shifts = shifts;
      if (baseSalary) staff.baseSalary = baseSalary;
      if (status) staff.status = status;
      if (joinDate) staff.joinDate = joinDate;
      if (notes !== undefined) staff.notes = notes;

      await staff.save();
      await staff.populate('shopId', 'name location');
      await staff.populate('createdBy', 'name email');

      return responseHelper.success(res, staff, 'Staff updated successfully');
    } catch (error) {
      return responseHelper.error(res, error.message, 500);
    }
  },

  // Delete staff (soft delete)
  deleteStaff: async (req, res) => {
    try {
      const { id } = req.params;
      const userRole = req.user.role;

      const staff = await Staff.findById(id);
      if (!staff) {
        return responseHelper.error(res, 'Staff not found', 404);
      }

      // Shop manager can only delete staff from their shop
      if (userRole === 'shop' && staff.shopId.toString() !== req.user.shopId.toString()) {
        return responseHelper.error(res, 'Unauthorized access', 403);
      }

      staff.isActive = false;
      staff.status = 'inactive';
      await staff.save();

      return responseHelper.success(res, staff, 'Staff deleted successfully');
    } catch (error) {
      return responseHelper.error(res, error.message, 500);
    }
  },

  // Get staff by shop
  getStaffByShop: async (req, res) => {
    try {
      const { shopId } = req.params;
      const userRole = req.user.role;

      // Shop manager can only view their own shop's staff
      if (userRole === 'shop' && shopId !== req.user.shopId.toString()) {
        return responseHelper.error(res, 'Unauthorized access', 403);
      }

      const staff = await Staff.find({
        shopId: new mongoose.Types.ObjectId(shopId),
        isActive: true
      })
        .populate('shopId', 'name location')
        .sort({ name: 1 });

      return responseHelper.success(res, staff, 'Shop staff retrieved successfully');
    } catch (error) {
      return responseHelper.error(res, error.message, 500);
    }
  }
};
