import Shop from "../models/Shop.js";
import Inventory from "../models/Inventory.js";
import Dispatch from "../models/Dispatch.js";
import Return from "../models/Return.js";
import Product from "../models/Product.js";
import Staff from "../models/Staff.js";
import Sale from "../models/Sale.js";
import User from "../models/User.js";
import Category from "../models/Category.js";
import Unit from "../models/Unit.js";
import bcryptjs from "bcryptjs";
import { staffPerformanceService } from "../services/staffPerformanceService.js";
import { responseHelper } from "../utils/responseHelper.js";

export const adminController = {
  getDashboard: async (req, res) => {
    try {
      const totalShops = await Shop.countDocuments({ isActive: true });

      const totalStockResult = await Inventory.aggregate([
        { $group: { _id: null, totalStock: { $sum: "$quantity" } } }
      ]);
      const totalStock = totalStockResult[0]?.totalStock || 0;

      const totalDispatches = await Dispatch.countDocuments();

      const dispatchesByStatus = await Dispatch.aggregate([
        { $group: { _id: "$status", count: { $sum: 1 } } }
      ]);

      const pendingReturns = await Return.countDocuments({ status: "pending" });

      const totalRevenueResult = await Sale.aggregate([
        { $group: { _id: null, totalRevenue: { $sum: "$totalAmount" } } }
      ]);
      const totalRevenue = totalRevenueResult[0]?.totalRevenue || 0;

      const totalStaff = await Staff.countDocuments();
      const activeStaff = await Staff.countDocuments({ status: "active" });

      const allStaffPerformance = await staffPerformanceService.getAllStaffPerformance();
      const topPerformers = allStaffPerformance.slice(0, 5);

      const activeShops = await Dispatch.aggregate([
        { $group: { _id: "$shopId", dispatchCount: { $sum: 1 } } },
        { $sort: { dispatchCount: -1 } },
        { $limit: 5 },
        {
          $lookup: {
            from: "shops",
            localField: "_id",
            foreignField: "_id",
            as: "shopDetails"
          }
        }
      ]);

      responseHelper.success(
        res,
        {
          totalShops,
          totalStock,
          totalDispatches,
          dispatchesByStatus,
          pendingReturns,
          totalRevenue,
          totalStaff,
          activeStaff,
          topPerformers,
          activeShops
        },
        "Dashboard data fetched successfully"
      );
    } catch (error) {
      console.error("Error fetching dashboard:", error);
      responseHelper.error(res, "Failed to fetch dashboard data", 500);
    }
  },

  getShops: async (req, res) => {
    try {
      const shops = await Shop.find({ isActive: true })
        .select("_id name location ownerName")
        .limit(100);

      responseHelper.success(res, shops, "Shops fetched successfully");
    } catch (error) {
      console.error("Error fetching shops:", error);
      responseHelper.error(res, "Failed to fetch shops", 500);
    }
  },

  getProducts: async (req, res) => {
    try {
      const products = await Product.find().select("_id name category").limit(100);

      responseHelper.success(res, products, "Products fetched successfully");
    } catch (error) {
      console.error("Error fetching products:", error);
      responseHelper.error(res, "Failed to fetch products", 500);
    }
  },

  getStaffPerformance: async (req, res) => {
    try {
      const staffPerformance = await staffPerformanceService.getAllStaffPerformance();

      responseHelper.success(res, staffPerformance, "Staff performance fetched successfully");
    } catch (error) {
      console.error("Error fetching staff performance:", error);
      responseHelper.error(res, "Failed to fetch staff performance", 500);
    }
  },

  getStaffDetailedPerformance: async (req, res) => {
    try {
      const { staffId } = req.params;
      const year = parseInt(req.query.year) || new Date().getFullYear();
      const month = parseInt(req.query.month) || new Date().getMonth() + 1;

      if (!staffId) return responseHelper.error(res, "Staff ID is required", 400);

      const performance = await staffPerformanceService.getStaffDetailedPerformance(
        staffId,
        year,
        month
      );

      responseHelper.success(res, performance, "Staff detailed performance fetched successfully");
    } catch (error) {
      console.error("Error fetching staff detailed performance:", error);
      responseHelper.error(res, "Failed to fetch staff detailed performance", 500);
    }
  },

  getShopStaffPerformance: async (req, res) => {
    try {
      const { shopId } = req.params;
      const period = req.query.period || "monthly";
      const year = parseInt(req.query.year) || new Date().getFullYear();
      const month = parseInt(req.query.month) || new Date().getMonth() + 1;
      const date = req.query.date ? new Date(req.query.date) : new Date();

      if (!shopId) return responseHelper.error(res, "Shop ID is required", 400);

      let performance;
      if (period === "daily") {
        performance = await staffPerformanceService.getShopDailyPerformanceByShift(shopId, date);
      } else if (period === "yearly") {
        performance = await staffPerformanceService.getShopYearlyPerformanceByShift(shopId, year);
      } else {
        performance = await staffPerformanceService.getShopMonthlyPerformanceByShift(
          shopId,
          year,
          month
        );
      }

      responseHelper.success(res, performance, `Shop staff ${period} performance fetched successfully`);
    } catch (error) {
      console.error("Error fetching shop staff performance:", error);
      responseHelper.error(res, "Failed to fetch shop staff performance", 500);
    }
  },

  getAllShops: async (req, res) => {
    try {
      const shops = await Shop.find()
        .select("_id name location ownerName contactNo email address isActive createdAt")
        .sort("-createdAt")
        .lean();

      responseHelper.success(res, shops || [], "All shops fetched successfully");
    } catch (error) {
      console.error("Error fetching shops:", error);
      responseHelper.error(res, "Failed to fetch shops", 500);
    }
  },

  // ✅ Create new shop (Username = Shop Name, Password = admin-set)
  createShop: async (req, res) => {
    try {
      const {
        name,
        location,
        ownerName,
        contactNo,
        email,
        address,
        password,
        isActive
      } = req.body;

      if (!name || !location || !ownerName || !contactNo || !email || !address || !password) {
        return responseHelper.error(res, "All fields including password are required", 400);
      }

      const phone = String(contactNo).trim();
      const username = String(name).trim();

      const existingShopByEmail = await Shop.findOne({ email });
      if (existingShopByEmail) {
        return responseHelper.error(res, "Shop with this email already exists", 400);
      }

      const existingShopByPhone = await Shop.findOne({ contactNo: phone });
      if (existingShopByPhone) {
        return responseHelper.error(res, "Shop with this contact number already exists", 400);
      }

      const existingUserByEmail = await User.findOne({ email });
      if (existingUserByEmail) {
        return responseHelper.error(res, "User account with this email already exists", 400);
      }

      const existingUserByUsername = await User.findOne({ username });
      if (existingUserByUsername) {
        return responseHelper.error(res, "Username (Shop name) already exists", 400);
      }

      const shop = await Shop.create({
        name,
        location,
        ownerName,
        contactNo: phone,
        email,
        address,
        isActive: isActive ?? true
      });

      const hashedPassword = await bcryptjs.hash(password, 10);

      const user = await User.create({
        name: ownerName,
        email,
        phone,
        username, // ✅ proper username field
        password: hashedPassword,
        role: "shop",
        shopId: shop._id,
        isActive: true
      });

      responseHelper.success(
        res,
        {
          shop,
          user: {
            id: user._id,
            name: user.name,
            email: user.email,
            phone: user.phone,
            username: user.username,
            role: user.role
          }
        },
        "Shop created successfully (Login: Username = Shop Name, Password = Set by admin)",
        201
      );
    } catch (error) {
      console.error("Error creating shop:", error);

      if (error.code === 11000) {
        return responseHelper.error(res, "Email / Phone / Username already exists", 400);
      }
      return responseHelper.error(res, "Failed to create shop", 500);
    }
  },

  updateShop: async (req, res) => {
    try {
      const { id } = req.params;
      const { name, location, ownerName, contactNo, email, address, password, isActive } = req.body;

      if (!id || !id.match(/^[0-9a-fA-F]{24}$/)) {
        return responseHelper.error(res, "Invalid shop ID", 400);
      }

      const shop = await Shop.findById(id);
      if (!shop) return responseHelper.error(res, "Shop not found", 404);

      const user = await User.findOne({ shopId: id });

      if (email && email !== shop.email) {
        const existingShop = await Shop.findOne({ email });
        if (existingShop) return responseHelper.error(res, "Email already exists", 400);

        const existingUserEmail = await User.findOne({ email, _id: { $ne: user?._id } });
        if (existingUserEmail) return responseHelper.error(res, "User email already exists", 400);
      }

      if (contactNo && contactNo !== shop.contactNo) {
        const existingShopPhone = await Shop.findOne({ contactNo });
        if (existingShopPhone) return responseHelper.error(res, "Contact number already exists", 400);

        const existingUserPhone = await User.findOne({ phone: contactNo, _id: { $ne: user?._id } });
        if (existingUserPhone) return responseHelper.error(res, "User phone already exists", 400);
      }

      if (name && name !== shop.name) {
        const existingUsername = await User.findOne({
          username: name,
          _id: { $ne: user?._id }
        });
        if (existingUsername) {
          return responseHelper.error(res, "Username (Shop name) already exists", 400);
        }
      }

      if (name) shop.name = name;
      if (location) shop.location = location;
      if (ownerName) shop.ownerName = ownerName;
      if (contactNo) shop.contactNo = contactNo;
      if (email) shop.email = email;
      if (address) shop.address = address;
      if (isActive !== undefined) shop.isActive = isActive;

      await shop.save();

      if (user) {
        if (ownerName) user.name = ownerName;
        if (email) user.email = email;
        if (contactNo) user.phone = contactNo;
        if (name) user.username = name;
        if (isActive !== undefined) user.isActive = isActive;

        if (password) {
          const hashedPassword = await bcryptjs.hash(password, 10);
          user.password = hashedPassword;
        }

        await user.save();
      }

      responseHelper.success(res, shop, "Shop updated successfully");
    } catch (error) {
      console.error("Error updating shop:", error);
      responseHelper.error(res, "Failed to update shop", 500);
    }
  },

  deleteShop: async (req, res) => {
    try {
      const { id } = req.params;

      if (!id || !id.match(/^[0-9a-fA-F]{24}$/)) {
        return responseHelper.error(res, "Invalid shop ID", 400);
      }

      const shop = await Shop.findById(id);
      if (!shop) return responseHelper.error(res, "Shop not found", 404);

      const inventoryCount = await Inventory.countDocuments({ shopId: id });
      const saleCount = await Sale.countDocuments({ shopId: id });

      if (inventoryCount > 0 || saleCount > 0) {
        return responseHelper.error(
          res,
          "Cannot delete shop with existing inventory or sales. Deactivate instead.",
          400
        );
      }

      await User.findOneAndDelete({ shopId: id });
      await Shop.findByIdAndDelete(id);

      responseHelper.success(res, null, "Shop deleted successfully");
    } catch (error) {
      console.error("Error deleting shop:", error);
      responseHelper.error(res, "Failed to delete shop", 500);
    }
  },

  getShopsWithInventory: async (req, res) => {
    try {
      const shops = await Shop.find({ isActive: true })
        .select("_id name location ownerName contactNo")
        .sort("-createdAt");

      const shopsWithInventory = await Promise.all(
        shops.map(async (shop) => {
          const inventory = await Inventory.find({ shopId: shop._id })
            .populate("productId", "_id name category price unit sku imageUrl")
            .sort("-lastUpdated");

          return {
            ...shop.toObject(),
            inventory: inventory || [],
            totalProducts: inventory.length,
            totalStock: inventory.reduce((sum, item) => sum + (item.quantity || 0), 0)
          };
        })
      );

      responseHelper.success(
        res,
        shopsWithInventory,
        "Shops with inventory fetched successfully"
      );
    } catch (error) {
      console.error("Error fetching shops with inventory:", error);
      responseHelper.error(res, "Failed to fetch shops with inventory", 500);
    }
  },

  getShopInventory: async (req, res) => {
    try {
      const { shopId } = req.params;

      const shop = await Shop.findById(shopId).select("_id name location ownerName");
      if (!shop) {
        return responseHelper.error(res, "Shop not found", 404);
      }

      const inventory = await Inventory.find({ shopId })
        .populate("productId", "_id name category price unit sku imageUrl")
        .sort("-lastUpdated");

      responseHelper.success(
        res,
        { shop, inventory },
        "Shop inventory fetched successfully"
      );
    } catch (error) {
      console.error("Error fetching shop inventory:", error);
      responseHelper.error(res, "Failed to fetch shop inventory", 500);
    }
  },

  addProductToShop: async (req, res) => {
    try {
      const { shopId } = req.params;
      const { productId, quantity } = req.body;

      if (!productId || quantity === undefined || quantity < 0) {
        return responseHelper.error(
          res,
          "Product ID and valid quantity are required",
          400
        );
      }

      const shop = await Shop.findById(shopId);
      if (!shop) {
        return responseHelper.error(res, "Shop not found", 404);
      }

      const product = await Product.findById(productId);
      if (!product) {
        return responseHelper.error(res, "Product not found", 404);
      }

      const existingInventory = await Inventory.findOne({ shopId, productId });

      let inventory;
      if (existingInventory) {
        existingInventory.quantity = quantity;
        existingInventory.lastUpdated = new Date();
        inventory = await existingInventory.save();
      } else {
        inventory = new Inventory({
          shopId,
          productId,
          quantity
        });
        await inventory.save();
      }

      await inventory.populate("productId", "name category price unit sku imageUrl");

      responseHelper.success(
        res,
        inventory,
        `Product ${existingInventory ? "updated" : "added"} to shop inventory successfully`,
        201
      );
    } catch (error) {
      console.error("Error adding product to shop:", error);
      responseHelper.error(res, "Failed to add product to shop", 500);
    }
  },

  createProduct: async (req, res) => {
    try {
      const { name, sku, description, price, unit, category, imageUrl } = req.body;

      if (!name || !sku || !price || !unit) {
        return responseHelper.error(
          res,
          "Name, SKU, price, and unit are required",
          400
        );
      }

      const existingProduct = await Product.findOne({ sku });
      if (existingProduct) {
        return responseHelper.error(
          res,
          `Product with SKU "${sku}" already exists`,
          400
        );
      }

      const product = new Product({
        name,
        sku,
        description: description || "",
        price,
        unit,
        category: category || "General",
        imageUrl: imageUrl || "",
        isActive: true
      });

      await product.save();

      responseHelper.success(res, product, "Product created successfully", 201);
    } catch (error) {
      console.error("Error creating product:", error);
      responseHelper.error(res, "Failed to create product", 500);
    }
  },

  getAllProducts: async (req, res) => {
    try {
      const products = await Product.find({ isActive: true })
        .select("_id name sku description category subcategory price unit image imageUrl images isActive")
        .sort("name");

      responseHelper.success(res, products, "Products fetched successfully");
    } catch (error) {
      console.error("Error fetching products:", error);
      responseHelper.error(res, "Failed to fetch products", 500);
    }
  },

  updateProduct: async (req, res) => {
    try {
      const { productId } = req.params;
      const { name, description, price, imageUrl, category } = req.body;

      const product = await Product.findById(productId);
      if (!product) {
        return responseHelper.error(res, "Product not found", 404);
      }

      if (name) product.name = name;
      if (description !== undefined) product.description = description;
      if (price) product.price = price;
      if (imageUrl !== undefined) product.imageUrl = imageUrl;
      if (category) product.category = category;

      await product.save();

      responseHelper.success(res, product, "Product updated successfully");
    } catch (error) {
      console.error("Error updating product:", error);
      responseHelper.error(res, "Failed to update product", 500);
    }
  },

  getCategories: async (req, res) => {
    try {
      const categories = await Category.find({ isActive: true }).sort("name");
      responseHelper.success(res, categories, "Categories fetched successfully");
    } catch (error) {
      console.error("Error fetching categories:", error);
      responseHelper.error(res, "Failed to fetch categories", 500);
    }
  },

  getUnits: async (req, res) => {
    try {
      const units = await Unit.find({ isActive: true }).sort("name");
      responseHelper.success(res, units, "Units fetched successfully");
    } catch (error) {
      console.error("Error fetching units:", error);
      responseHelper.error(res, "Failed to fetch units", 500);
    }
  }
};