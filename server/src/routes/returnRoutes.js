import express from "express";
import { returnController } from "../controllers/returnController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { roleMiddleware } from "../middleware/roleMiddleware.js";

const router = express.Router();

// Get pending returns count (admin only)
router.get(
  "/pending/count",
  authMiddleware,
  roleMiddleware(["admin"]),
  returnController.getPendingCount
);

// Get all returns
router.get(
  "/",
  authMiddleware,
  roleMiddleware(["admin", "shop"]),
  returnController.getAll
);

// Get return by ID
router.get(
  "/:id",
  authMiddleware,
  roleMiddleware(["admin", "shop"]),
  returnController.getById
);

// Create new return
router.post(
  "/",
  authMiddleware,
  roleMiddleware(["admin", "shop"]),
  returnController.create
);

// Update return status
router.put(
  "/:id/status",
  authMiddleware,
  roleMiddleware(["admin"]),
  returnController.updateStatus
);

// Delete return
router.delete(
  "/:id",
  authMiddleware,
  roleMiddleware(["admin", "shop"]),
  returnController.deleteReturn
);

export default router;