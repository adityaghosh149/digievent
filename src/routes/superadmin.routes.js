import { Router } from "express";
import { loginSuperAdmin, logoutSuperAdmin } from "../controllers/superadmin.controller";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.route("/login").post(verifyJWT, loginSuperAdmin);

// secured routes
router.route("/logout").post(verifyJWT, logoutSuperAdmin);

export default router;