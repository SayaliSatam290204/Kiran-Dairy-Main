import express from 'express';
import { staffPaymentController } from '../controllers/staffPaymentController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { roleMiddleware } from '../middleware/roleMiddleware.js';

const router = express.Router();

// Middleware to check if user is admin or shop manager
const allowAdminAndShop = [authMiddleware, roleMiddleware(['admin', 'shop'])];

// Get all payments (admin and shop can access)
router.get('/', allowAdminAndShop, staffPaymentController.getAllPayments);

// Get payment summary
router.get('/summary', allowAdminAndShop, staffPaymentController.getPaymentSummary);

// Get pending payments
router.get('/pending', allowAdminAndShop, staffPaymentController.getPendingPayments);

// Get single payment by ID
router.get('/:id', allowAdminAndShop, staffPaymentController.getPaymentById);

// Create new payment (admin and shop can create)
router.post('/', allowAdminAndShop, staffPaymentController.createPayment);

// Update payment (admin and shop can update)
router.put('/:id', allowAdminAndShop, staffPaymentController.updatePayment);

// Delete payment (admin and shop can delete)
router.delete('/:id', allowAdminAndShop, staffPaymentController.deletePayment);

export default router;
