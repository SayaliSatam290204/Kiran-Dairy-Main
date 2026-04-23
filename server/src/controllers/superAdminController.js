import {
  getSuperAdminDashboard,
  getBranchReport,
  getRevenueTrends
} from "../services/superAdminDashboardService.js";

/**
 * Get comprehensive super admin dashboard
 * GET /api/super-admin/dashboard
 */
export const getDashboard = async (req, res) => {
  try {
    const { days = 30, limit = 10 } = req.query;
    
    console.log(`[DASHBOARD] Loading data for days=${days}, limit=${limit}`);
    const data = await getSuperAdminDashboard({ days: parseInt(days), limit: parseInt(limit) });
    
    return res.status(200).json({
      success: true,
      message: "Dashboard data retrieved successfully",
      data: data
    });
  } catch (error) {
    console.error("Dashboard error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to retrieve dashboard data",
      data: null
    });
  }
};

/**
 * Get detailed branch report
 * GET /api/super-admin/branch/:shopId/report
 */
export const getBranchReportHandler = async (req, res) => {
  try {
    const { shopId } = req.params;
    
    const report = await getBranchReport(shopId);
    
    return res.status(200).json({
      success: true,
      message: "Branch report retrieved successfully",
      data: report
    });
  } catch (error) {
    console.error("Branch report error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to retrieve branch report",
      data: null
    });
  }
};

/**
 * Get revenue trends
 * GET /api/super-admin/revenue-trends
 * Query: startDate, endDate (optional, defaults to current month)
 */
export const getRevenueTrendsHandler = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    // Default to current month if not provided
    const now = new Date();
    const defaultStartDate = startDate || new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
    const defaultEndDate = endDate || new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString();
    
    const trends = await getRevenueTrends(defaultStartDate, defaultEndDate);
    
    return res.status(200).json({
      success: true,
      message: "Revenue trends retrieved successfully",
      data: trends
    });
  } catch (error) {
    console.error("Revenue trends error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to retrieve revenue trends",
      data: null
    });
  }
};
