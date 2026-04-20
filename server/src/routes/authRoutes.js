import express from "express";
import { authController } from "../controllers/authController.js";

const router = express.Router();

// Public registration (admin / shop from Register.jsx)
router.post("/register", authController.register);

// Admin Registration (AdminRegister.jsx)
router.post("/admin/register", authController.registerAdmin);

// ✅ Check if admin exists (for registration flow)
router.get("/admin/exists", authController.adminExists);

// ✅ Login (Admin/Shop)
router.post("/login", authController.login);

export default router;