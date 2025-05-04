import { Router } from "express";
import { loginAdmin, logoutAdmin, refreshAccessTokenForAdmin } from "../controllers/admin.auth.controller.js";
import { requireAdmin, verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

// public routes
router.route("/login").post(loginAdmin);

// secured routes

// auth routes
router.route("/logout").post(verifyJWT, requireAdmin, logoutAdmin);
router.route("/refesh-token").post(verifyJWT, requireAdmin, refreshAccessTokenForAdmin);

export default router;