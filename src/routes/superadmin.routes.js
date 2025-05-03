import { Router } from "express";
import { deleteSuperAdmin, loginSuperAdmin, logoutSuperAdmin, registerSuperAdmin } from "../controllers/superadmin.controller";
import { requireRootSuperAdmin, verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.route("/login").post(loginSuperAdmin);

// secured routes
router.route("/register").post(verifyJWT, requireRootSuperAdmin, registerSuperAdmin);
router.route("/logout").post(verifyJWT, logoutSuperAdmin);
router.route("/delete").post(verifyJWT, requireRootSuperAdmin, deleteSuperAdmin)

export default router;