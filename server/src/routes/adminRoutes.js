import express from "express";
import { adminController } from "../controllers/adminController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { roleMiddleware } from "../middleware/roleMiddleware.js";

const router = express.Router();

// Admin routes
router.get("/dashboard", authMiddleware, roleMiddleware("admin"), adminController.getDashboard);
router.get("/shops", authMiddleware, roleMiddleware("admin"), adminController.getShops);
router.get("/all-shops", authMiddleware, roleMiddleware("admin"), adminController.getAllShops);
router.post("/shops", authMiddleware, roleMiddleware("admin"), adminController.createShop);
router.put("/shops/:id", authMiddleware, roleMiddleware("admin"), adminController.updateShop);
router.delete("/shops/:id", authMiddleware, roleMiddleware("admin"), adminController.deleteShop);

// ✅ Shop Ledger & Inventory Routes
router.get("/shop-ledger", authMiddleware, roleMiddleware("admin"), adminController.getShopsWithInventory);
router.get("/shop-inventory/:shopId", authMiddleware, roleMiddleware("admin"), adminController.getShopInventory);
router.post("/shop-inventory/:shopId", authMiddleware, roleMiddleware("admin"), adminController.addProductToShop);

// ✅ Product Management Routes
router.get("/all-products", authMiddleware, roleMiddleware("admin"), adminController.getAllProducts);
router.post("/products", authMiddleware, roleMiddleware("admin"), adminController.createProduct);
router.put("/products/:productId", authMiddleware, roleMiddleware("admin"), adminController.updateProduct);

// ✅ NEW: Category & Unit Management Routes
router.get('/categories', authMiddleware, adminController.getCategories);
router.get('/units', authMiddleware, adminController.getUnits);

// Existing routes
router.get("/products", authMiddleware, roleMiddleware("admin"), adminController.getProducts);
router.get("/staff-performance", authMiddleware, roleMiddleware("admin"), adminController.getStaffPerformance);
router.get("/staff-performance/:staffId", authMiddleware, roleMiddleware("admin"), adminController.getStaffDetailedPerformance);
router.get("/shop-staff-performance/:shopId", authMiddleware, roleMiddleware("admin"), adminController.getShopStaffPerformance);

export default router;