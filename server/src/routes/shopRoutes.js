import express from "express";
import { shopController } from "../controllers/shopController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/dashboard", authMiddleware, shopController.getDashboard);
router.get("/inventory", authMiddleware, shopController.getInventory);
router.get("/received-dispatches", authMiddleware, shopController.getReceivedDispatches);
router.get("/staff-performance", authMiddleware, shopController.getStaffPerformance);

// ✅ SAFE (no crash even if logic not ready)
router.get("/staff-performance/:staffId", authMiddleware, shopController.getStaffDetailedPerformance);
router.get("/preview", shopController.getPreviewData);

export default router;