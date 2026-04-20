import express from 'express';
import { staffController } from '../controllers/staffController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { roleMiddleware } from '../middleware/roleMiddleware.js';

const router = express.Router();

// Middleware to check if user is admin or shop manager
const allowAdminAndShop = [authMiddleware, roleMiddleware(['admin', 'shop'])];

// Get all staff (admin and shop can access)
router.get('/', allowAdminAndShop, staffController.getAllStaff);

// Get staff by shop ID
router.get('/shop/:shopId', allowAdminAndShop, staffController.getStaffByShop);

// Get single staff by ID
router.get('/:id', allowAdminAndShop, staffController.getStaffById);

// Create new staff (admin and shop can create)
router.post('/', allowAdminAndShop, staffController.createStaff);

// Update staff (admin and shop can update)
router.put('/:id', allowAdminAndShop, staffController.updateStaff);

// Delete staff (admin and shop can delete)
router.delete('/:id', allowAdminAndShop, staffController.deleteStaff);

export default router;
