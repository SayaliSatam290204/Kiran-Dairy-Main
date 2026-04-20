import express from 'express';
import { salesController } from '../controllers/salesController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { roleMiddleware } from '../middleware/roleMiddleware.js';

const router = express.Router();

// Sales routes
router.get('/', authMiddleware, roleMiddleware('admin'), salesController.getAllSales);
router.post('/', authMiddleware, roleMiddleware('shop'), salesController.create);
router.get('/history', authMiddleware, roleMiddleware('shop'), salesController.getHistory);
router.post('/add-inventory', authMiddleware, roleMiddleware('shop'), salesController.addToInventory);

export default router;
