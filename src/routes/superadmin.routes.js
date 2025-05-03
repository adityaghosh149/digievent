import { Router } from "express";
import { registerAdmin } from "../controllers/superadmin.admin.controller.js";
import { deleteSuperAdmin, loginSuperAdmin, logoutSuperAdmin, registerSuperAdmin, updateSuperAdmin } from "../controllers/superadmin.auth.controller.js";
import { requireRootSuperAdmin, verifyJWT } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";

const router = Router();

router.route("/login").post(loginSuperAdmin);

// secured routes
router.route("/register").post(verifyJWT, requireRootSuperAdmin, registerSuperAdmin);
router.route("/update").put(
    verifyJWT,
    upload.fields([{ name: "avatar", maxCount: 1 }]),
    updateSuperAdmin
);
router.route("/delete").post(verifyJWT, requireRootSuperAdmin, deleteSuperAdmin)
router.route("/logout").post(verifyJWT, logoutSuperAdmin);

// admin routes
router.route("/admin/register").post(
    verifyJWT, 
    upload.fields([{ name: "avatar", maxCount: 1 }]), 
    registerAdmin
);

export default router;