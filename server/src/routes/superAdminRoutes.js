import express from 'express';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { roleMiddleware } from '../middleware/roleMiddleware.js';
import {
  getDashboard,
  getBranchReportHandler,
  getRevenueTrendsHandler
} from '../controllers/superAdminController.js';

const superAdminRoutes = express.Router();

// All routes require authentication and super-admin role
superAdminRoutes.use(authMiddleware);
superAdminRoutes.use(roleMiddleware(['super-admin']));

/**
 * GET /api/super-admin/dashboard
 * Get comprehensive dashboard with all branches, products, and revenue data
 */
superAdminRoutes.get('/dashboard', getDashboard);

/**
 * GET /api/super-admin/branch/:shopId/report
 * Get detailed report for a specific branch
 */
superAdminRoutes.get('/branch/:shopId/report', getBranchReportHandler);

/**
 * GET /api/super-admin/revenue-trends
 * Get revenue trends with optional date filters
 * Query: startDate, endDate
 */
superAdminRoutes.get('/revenue-trends', getRevenueTrendsHandler);

export default superAdminRoutes;
