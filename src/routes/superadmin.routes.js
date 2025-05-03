import { Router } from "express";
import { loginSuperAdmin, logoutSuperAdmin, registerSuperAdmin } from "../controllers/superadmin.controller";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.route("/register").post(registerSuperAdmin);
router.route("/login").post(loginSuperAdmin);

// secured routes
router.route("/logout").post(verifyJWT, logoutSuperAdmin);

export default router;