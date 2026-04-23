import Sale from "../models/Sale.js";
import Shop from "../models/Shop.js";
import Product from "../models/Product.js";
import Inventory from "../models/Inventory.js";
import Staff from "../models/Staff.js";
import Return from "../models/Return.js";

/* =========================
   SUPER ADMIN DASHBOARD
========================= */
export const getSuperAdminDashboard = async (options = {}) => {
  const {
    days = 30, // Default 30 days for sales/returns
    limit = 10  // Top N branches/products
  } = options;

  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - days);
  try {
    // Get active shops
    const shops = await Shop.find({ isActive: true })
      .select("name location ownerName contactNo email")
      .lean();

    if (!shops.length) {
      return {
        summary: {
          totalBranches: 0,
          totalProducts: 0,
          totalProductsStocked: 0,
          totalStockValue: 0,
          totalSalesTransactions: 0,
          totalReturns: 0,
          totalRevenue: 0,
          totalExpectedRevenue: 0,
          totalStaff: 0,
          topBranches: [],
        },
        branchAnalytics: [],
        productDistribution: [],
        shops: [],
      };
    }

    const shopIds = shops.map((s) => s._id);

    // Use AGGREGATIONS for performance (instead of loading all records)
    const [
      salesSummary,
      returnsSummary,
      staffCount,
      productSummary,
      inventorySummary
    ] = await Promise.all([
      // Sales aggregation: much faster than loading all sales
      Sale.aggregate([
        { $match: { 
          shopId: { $in: shopIds },
          createdAt: { $gte: cutoffDate }
        }},
        {
          $group: {
            _id: { shopId: "$shopId" },
            totalRevenue: { $sum: "$totalAmount" },
            transactionCount: { $sum: 1 }
          }
        },
        { $sort: { totalRevenue: -1 } },
        { $limit: limit * 2 } // Extra for accurate top N
      ]),

      // Returns aggregation
      Return.aggregate([
        { $match: { 
          shopId: { $in: shopIds },
          createdAt: { $gte: cutoffDate }
        }},
        {
          $group: {
            _id: "$shopId",
            totalReturns: { $sum: 1 },
            totalRefund: { $sum: "$totalRefund" }
          }
        }
      ]),

      // Staff count
      Staff.aggregate([
        { $match: { shopId: { $in: shopIds }, isActive: true } },
        {
          $group: {
            _id: "$shopId",
            staffCount: { $sum: 1 }
          }
        }
      ]),

      // Products (limit to active/top products)
      Product.aggregate([
        { 
          $lookup: {
            from: "inventories",
            let: { productId: "$_id" },
            pipeline: [{ $match: { $expr: { $eq: ["$productId", "$$productId"] } } }],
            as: "inventory"
          }
        },
        { $match: { "inventory.0": { $exists: true } } }, // Only stocked products
        { $sort: { "inventory.0.quantity": -1 } },
        { $limit: 50 }
      ]),

      // Inventory total value by shop
      Inventory.aggregate([
        { $match: { shopId: { $in: shopIds } } },
        {
          $group: {
            _id: "$shopId",
            totalQuantity: { $sum: "$quantity" },
            productCount: { $sum: 1 },
            // Approximate value (we'll refine per shop later)
            avgPrice: { $avg: "$estimatedPrice" } // Add this field if needed
          }
        }
      ])
    ]);

    // Convert aggregation results to maps (much lighter)
    const salesByShopMap = new Map(salesSummary.map(s => [s._id.shopId.toString(), {
      totalRevenue: s.totalRevenue || 0,
      transactionCount: s.transactionCount || 0
    }]));

    const returnsByShopMap = new Map(returnsSummary.map(r => [r._id.toString(), {
      totalReturns: r.totalReturns || 0,
      totalRefund: r.totalRefund || 0
    }]));

    const staffByShopMap = new Map(staffCount.map(s => [s._id.toString(), s.staffCount || 0]));
    const inventoryByShopMap = new Map(inventorySummary.map(i => [i._id.toString(), i]));

    // Get top products only (limit processing)
    const productPriceMap = new Map(
      productSummary.map(p => [p._id.toString(), p.price || 0])
    );

    // BRANCH ANALYTICS using aggregation data
    const branchAnalytics = shops.map((shop) => {
      const shopIdStr = shop._id.toString();
      const sales = salesByShopMap.get(shopIdStr) || { totalRevenue: 0, transactionCount: 0 };
      const returnsData = returnsByShopMap.get(shopIdStr) || { totalReturns: 0, totalRefund: 0 };
      const staffCount = staffByShopMap.get(shopIdStr) || 0;
      const invSummary = inventoryByShopMap.get(shopIdStr) || { totalQuantity: 0, productCount: 0 };

      // Approximate stock value (we can add exact calculation endpoint if needed)
      const stockValue = invSummary.totalQuantity * 150; // Avg price estimate

      return {
        shopId: shop._id,
        shopName: shop.name,
        location: shop.location,
        ownerName: shop.ownerName,
        contactNo: shop.contactNo,
        email: shop.email,

        actualRevenue: sales.totalRevenue,
        expectedRevenue: stockValue,
        revenueDifference: stockValue - sales.totalRevenue,

        totalTransactions: sales.transactionCount,
        productsCount: invSummary.productCount || 0,
        totalStockValue: stockValue,

        staffCount,
        returnsCount: returnsData.totalReturns,
        returnValue: returnsData.totalRefund,
      };
    }).slice(0, limit * 2); // Limit returned data

    // PRODUCT DISTRIBUTION (limited)
    const productDistribution = productSummary.slice(0, limit).map((product) => ({
      productId: product._id,
      productName: product.name,
      category: product.category || "N/A",
      price: product.price || 0,
      totalQuantity: product.inventory.reduce((s, i) => s + (i.quantity || 0), 0),
      branchesStocking: product.inventory.length,
      totalRevenue: 0, // Can add sales lookup if needed
    }));

    // Calculate totals from aggregations
    const totalSalesTransactions = salesSummary.reduce((sum, s) => sum + (s.transactionCount || 0), 0);
    const totalRevenue = salesSummary.reduce((sum, s) => sum + (s.totalRevenue || 0), 0);
    const totalReturnsCount = returnsSummary.reduce((sum, r) => sum + (r.totalReturns || 0), 0);
    const totalStaff = staffCount.reduce((sum, s) => sum + (s.staffCount || 0), 0);

    const totalStockValue = inventorySummary.reduce((sum, i) => sum + (i.totalQuantity * 150), 0);

    const topBranches = branchAnalytics
      .sort((a, b) => b.actualRevenue - a.actualRevenue)
      .slice(0, Math.min(limit, 5));

    return {
      summary: {
        totalBranches: shops.length,
        totalProducts: productSummary.length,
        totalProductsStocked: inventorySummary.reduce((sum, i) => sum + (i.productCount || 0), 0),
        totalStockValue,
        totalSalesTransactions,
        totalReturns: totalReturnsCount,
        totalRevenue,
        totalExpectedRevenue: totalStockValue,
        totalStaff,
        topBranches,
        timeRange: { days, cutoffDate: cutoffDate.toISOString() }
      },
      branchAnalytics,
      productDistribution,
      shops: shops.slice(0, limit),
    };
  } catch (err) {
    console.error("Dashboard Error:", err);
    throw err;
  }
};

/* =========================
   FULL WORKING BRANCH REPORT (FIXED)
========================= */
export const getBranchReport = async (shopId) => {
  const shop = await Shop.findById(shopId).lean();
  if (!shop) throw new Error("Shop not found");

  const [sales, inventory, staff, returns] = await Promise.all([
    Sale.find({ shopId }).lean(),
    Inventory.find({ shopId }).populate("productId").lean(),
    Staff.find({ shopId, isActive: true }).lean(),
    Return.find({ shopId }).lean(),
  ]);

  const totalRevenue = sales.reduce(
    (s, x) => s + (x.totalAmount || 0),
    0
  );

  return {
    branch: shop,
    sales,
    inventory,
    staff,
    totalRevenue,
    expectedRevenue: inventory.reduce(
      (s, i) => s + (i.quantity || 0) * (i.productId?.price || 0),
      0
    ),
    returns: returns.length,
    returnValue: returns.reduce((s, r) => s + (r.totalRefund || 0), 0),
  };
};

/* =========================
   REVENUE TRENDS
========================= */
export const getRevenueTrends = async (startDate, endDate) => {
  const sales = await Sale.find({
    createdAt: { $gte: new Date(startDate), $lte: new Date(endDate) },
  }).lean();

  const shops = await Shop.find({ isActive: true }).lean();

  return shops.map((shop) => {
    const shopSales = sales.filter(
      (s) => s.shopId.toString() === shop._id.toString()
    );

    return {
      shopName: shop.name,
      revenue: shopSales.reduce((s, x) => s + (x.totalAmount || 0), 0),
      transactions: shopSales.length,
    };
  });
};