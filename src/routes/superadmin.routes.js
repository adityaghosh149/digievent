import { Router } from "express";
import { registerAdmin, resumeAdmin, suspendAdmin } from "../controllers/superadmin.admin.controller.js";
import { deleteSuperAdmin, loginSuperAdmin, logoutSuperAdmin, registerSuperAdmin, updateSuperAdmin } from "../controllers/superadmin.auth.controller.js";
import { requireRootSuperAdmin, verifyJWT } from "../middlewares/auth.middleware.js";
import { uploadFile } from "../middlewares/multer.middleware.js";

const router = Router();

router.route("/login").post(loginSuperAdmin);

// secured routes
router.route("/register").post(verifyJWT, requireRootSuperAdmin, registerSuperAdmin);
router.route("/update").put(
    verifyJWT,
    uploadFile("avatar", "image"),
    updateSuperAdmin
);
router.route("/delete").post(verifyJWT, requireRootSuperAdmin, deleteSuperAdmin)
router.route("/logout").post(verifyJWT, logoutSuperAdmin);

// admin routes
router.route("/admins").get(verifyJWT, getAllAdmins);
router.route("/admin/register").post(
    verifyJWT, 
    uploadFile("avatar", "image"),  // Upload 'avatar' as image
    registerAdmin
);
router.route("admin/suspend/:adminId").patch(verifyJWT, suspendAdmin);
router.route("admin/resume/:adminId").patch(verifyJWT, resumeAdmin);

export default router;