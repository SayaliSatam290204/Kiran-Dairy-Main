import express from 'express';
import { dispatchController } from '../controllers/dispatchController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();

// Dispatch routes
router.get('/', authMiddleware, dispatchController.getAll);
router.get('/analytics', authMiddleware, dispatchController.getAnalytics);
router.get('/shop/:shopId', authMiddleware, dispatchController.getByShop);
router.get('/:id', authMiddleware, dispatchController.getById);
router.post('/', authMiddleware, dispatchController.create);
router.put('/:id/status', authMiddleware, dispatchController.updateStatus);

export default router;
