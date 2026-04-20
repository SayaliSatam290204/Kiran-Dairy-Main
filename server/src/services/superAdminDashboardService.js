import Sale from "../models/Sale.js";
import Shop from "../models/Shop.js";
import Product from "../models/Product.js";
import Inventory from "../models/Inventory.js";
import Staff from "../models/Staff.js";
import Dispatch from "../models/Dispatch.js";
import Return from "../models/Return.js";

export const getSuperAdminDashboard = async () => {
  try {
    console.log("=== Starting Dashboard Data Fetch ===");

    // Get all shops
    console.log("Fetching shops...");
    const shops = await Shop.find({ isActive: true }).select("name location ownerName contactNo email").lean();
    console.log(`Found ${shops.length} shops`);

    if (shops.length === 0) {
      console.log("No shops found, returning empty dashboard");
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
          topBranches: []
        },
        branchAnalytics: [],
        productDistribution: [],
        shops: []
      };
    }

    const shopIds = shops.map((s) => s._id);

    console.log("Fetching core data in parallel...");
    const [allSales, allReturns, allStaff, allProducts, allInventory] = await Promise.all([
      Sale.find({ shopId: { $in: shopIds } }).select("shopId totalAmount items").lean(),
      Return.find({ shopId: { $in: shopIds } }).select("shopId totalRefund").lean(),
      Staff.find({ shopId: { $in: shopIds }, isActive: true }).select("shopId").lean(),
      Product.find().select("name category price").lean(),
      Inventory.find({ shopId: { $in: shopIds } }).select("shopId productId quantity").lean()
    ]);

    console.log("Building lookup maps...");
    const totalRevenue = allSales.reduce((sum, sale) => sum + (sale.totalAmount || 0), 0);

    const productPriceById = new Map(allProducts.map((product) => [product._id.toString(), product.price || 0]));

    const salesByShop = new Map();
    const salesByProduct = new Map();
    allSales.forEach((sale) => {
      const shopId = sale.shopId?.toString();
      if (!shopId) return;
      if (!salesByShop.has(shopId)) {
        salesByShop.set(shopId, { sales: [], revenue: 0 });
      }
      const shopEntry = salesByShop.get(shopId);
      shopEntry.sales.push(sale);
      shopEntry.revenue += sale.totalAmount || 0;

      sale.items?.forEach((item) => {
        const productId = item.productId?.toString();
        if (!productId) return;
        if (!salesByProduct.has(productId)) {
          salesByProduct.set(productId, { totalRevenue: 0 });
        }
        salesByProduct.get(productId).totalRevenue += item.subtotal || 0;
      });
    });

    const returnsByShop = new Map();
    allReturns.forEach((ret) => {
      const shopId = ret.shopId?.toString();
      if (!shopId) return;
      if (!returnsByShop.has(shopId)) {
        returnsByShop.set(shopId, { count: 0, value: 0 });
      }
      const shopEntry = returnsByShop.get(shopId);
      shopEntry.count += 1;
      shopEntry.value += ret.totalRefund || 0;
    });

    const staffByShop = new Map();
    allStaff.forEach((staff) => {
      const shopId = staff.shopId?.toString();
      if (!shopId) return;
      staffByShop.set(shopId, (staffByShop.get(shopId) || 0) + 1);
    });

    const inventoryByShop = new Map();
    const inventoryByProduct = new Map();
    allInventory.forEach((inv) => {
      const shopId = inv.shopId?.toString();
      const productId = inv.productId?.toString();
      if (shopId) {
        if (!inventoryByShop.has(shopId)) {
          inventoryByShop.set(shopId, []);
        }
        inventoryByShop.get(shopId).push(inv);
      }
      if (productId) {
        if (!inventoryByProduct.has(productId)) {
          inventoryByProduct.set(productId, []);
        }
        inventoryByProduct.get(productId).push(inv);
      }
    });

    const totalStockValue = allInventory.reduce((sum, inv) => {
      const price = productPriceById.get(inv.productId?.toString()) || 0;
      return sum + ((inv.quantity || 0) * price);
    }, 0);

    const getInventoryStockValue = (inventoryList) => inventoryList.reduce((sum, inv) => {
      const price = productPriceById.get(inv.productId?.toString()) || 0;
      return sum + ((inv.quantity || 0) * price);
    }, 0);

    console.log("Building branch analytics...");
    const branchAnalytics = shops.map((shop) => {
      const shopId = shop._id.toString();
      const shopSales = salesByShop.get(shopId) || { sales: [], revenue: 0 };
      const shopInventory = inventoryByShop.get(shopId) || [];
      const shopStaff = staffByShop.get(shopId) || 0;
      const shopReturns = returnsByShop.get(shopId) || { count: 0, value: 0 };
      const shopStockValue = getInventoryStockValue(shopInventory);
      const expectedRevenue = shopStockValue;

      return {
        shopId: shop._id,
        shopName: shop.name,
        location: shop.location,
        ownerName: shop.ownerName,
        contactNo: shop.contactNo,
        email: shop.email,
        actualRevenue: shopSales.revenue,
        expectedRevenue,
        revenueDifference: expectedRevenue - shopSales.revenue,
        totalTransactions: shopSales.sales.length,
        avgTransactionValue: shopSales.sales.length > 0 ? shopSales.revenue / shopSales.sales.length : 0,
        productsCount: shopInventory.length,
        totalStockValue: shopStockValue,
        productDetails: [],
        staffCount: shopStaff,
        dispatchesReceived: 0,
        dispatchesPending: 0,
        returnsCount: shopReturns.count,
        returnValue: shopReturns.value
      };
    });

    console.log("Building product distribution...");
    const productDistribution = allProducts.map((product) => {
      const productInventory = inventoryByProduct.get(product._id.toString()) || [];
      const productRevenue = salesByProduct.get(product._id.toString())?.totalRevenue || 0;

      return {
        productId: product._id,
        productName: product.name,
        category: product.category || "N/A",
        price: product.price || 0,
        totalQuantity: productInventory.reduce((sum, inv) => sum + (inv.quantity || 0), 0),
        branchesStocking: productInventory.length,
        branchDistribution: productInventory.map((inv) => ({
          shopName: shops.find((s) => s._id.toString() === inv.shopId.toString())?.name || "Unknown",
          quantity: inv.quantity
        })),
        totalRevenue: productRevenue
      };
    });

    const summary = {
      totalBranches: shops.length,
      totalProducts: allProducts.length,
      totalProductsStocked: allInventory.length,
      totalStockValue,
      totalSalesTransactions: allSales.length,
      totalReturns: allReturns.length,
      totalRevenue,
      totalExpectedRevenue: branchAnalytics.reduce((sum, branch) => sum + branch.expectedRevenue, 0),
      totalStaff: allStaff.length,
      topBranches: branchAnalytics
        .slice()
        .sort((a, b) => b.actualRevenue - a.actualRevenue)
        .slice(0, 5)
        .map(({ shopName, actualRevenue, expectedRevenue, totalTransactions }) => ({
          shopName,
          actualRevenue,
          expectedRevenue,
          totalTransactions
        }))
    };

    console.log("=== Dashboard Data Fetch Complete ===");
    console.log("Summary:", summary);

    return {
      summary,
      branchAnalytics,
      productDistribution,
      shops: shops.map((s) => ({
        id: s._id,
        name: s.name,
        location: s.location,
        ownerName: s.ownerName
      }))
    };
  } catch (error) {
    console.error("=== ERROR in getSuperAdminDashboard ===");
    console.error("Error details:", error);
    console.error("Error stack:", error.stack);
    throw error;
  }
};

export const getBranchReport = async (shopId) => {
  try {
    const shop = await Shop.findById(shopId).lean();
    if (!shop) throw new Error("Shop not found");

    const [sales, inventory, staff, returns] = await Promise.all([
      Sale.find({ shopId }).select("totalAmount items").lean(),
      Inventory.find({ shopId }).populate("productId", "name sku price").lean(),
      Staff.find({ shopId, isActive: true }).select("name role").lean(),
      Return.find({ shopId }).select("totalRefund").lean()
    ]);

    const totalRevenue = sales.reduce((sum, s) => sum + (s.totalAmount || 0), 0);
    const expectedRevenue = inventory.reduce((sum, item) => {
      const price = item.productId?.price || 0;
      return sum + ((item.quantity || 0) * price);
    }, 0);

    return {
      branch: shop,
      salesCount: sales.length,
      totalRevenue,
      expectedRevenue,
      revenueDifference: expectedRevenue - totalRevenue,
      inventory,
      staff,
      dispatches: [],
      returns: returns.length,
      returnValue: returns.reduce((sum, r) => sum + (r.totalRefund || 0), 0)
    };
  } catch (error) {
    console.error("Error in getBranchReport:", error);
    throw error;
  }
};

export const getRevenueTrends = async (startDate, endDate) => {
  try {
    const sales = await Sale.find({
      createdAt: { $gte: new Date(startDate), $lte: new Date(endDate) }
    })
      .lean();

    const shops = await Shop.find({ isActive: true }).lean();

    const trends = shops.map(shop => {
      const shopSales = sales.filter(s => s.shopId.toString() === shop._id.toString());
      const revenue = shopSales.reduce((sum, s) => sum + (s.totalAmount || 0), 0);
      return {
        shopName: shop.name,
        revenue,
        transactions: shopSales.length
      };
    });

    return trends.sort((a, b) => b.revenue - a.revenue);
  } catch (error) {
    console.error("Error in getRevenueTrends:", error);
    throw error;
  }
};
