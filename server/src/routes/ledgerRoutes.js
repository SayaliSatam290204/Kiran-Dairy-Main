import express from 'express';
import { ledgerController } from '../controllers/ledgerController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { roleMiddleware } from '../middleware/roleMiddleware.js';

const router = express.Router();

// Ledger routes
router.get('/', authMiddleware, ledgerController.getLedger);
router.get('/shop/:shopId', authMiddleware, ledgerController.getLedgerByShop);
router.get('/product/:productId', authMiddleware, ledgerController.getLedgerByProduct);

// ✅ Stock Alerts & Reports
  router.get('/alerts/all', authMiddleware, ledgerController.getStockAlerts); // Get all low stock products
  router.get('/alerts/count', authMiddleware, ledgerController.getAlertCount); // Get alert count for badge
  router.get('/report/stock', authMiddleware, roleMiddleware('admin'), ledgerController.getStockReport); // Full stock report

  // ✅ NEW Restock Requests
  router.post('/restock-requests', authMiddleware, roleMiddleware('shop'), ledgerController.createRestockRequest);
  router.get('/restock-requests', authMiddleware, roleMiddleware('admin'), ledgerController.getRestockRequests);
  router.put('/restock-requests/:id', authMiddleware, roleMiddleware('admin'), ledgerController.updateRestockRequestStatus);
  router.get('/restock-requests/count', authMiddleware, roleMiddleware('admin'), ledgerController.getRestockRequestsCount);

// Ledger entry creation
router.post('/', authMiddleware, ledgerController.createLedgerEntry);

export default router;
