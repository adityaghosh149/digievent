import { Router } from "express";
import { getAllAdmins, registerAdmin, resumeAdmin, suspendAdmin } from "../controllers/superadmin.admin.controller.js";
import { deleteSuperAdmin, loginSuperAdmin, logoutSuperAdmin, refreshAccessTokenForSuperAdmin, registerSuperAdmin, updateSuperAdmin } from "../controllers/superadmin.auth.controller.js";
import { getAllHelpRequests, markHelpRequestAsRead, markHelpRequestAsResolved } from "../controllers/superadmin.helpRequests.controller.js";
import { requireRootSuperAdmin, requireSuperAdmin, verifyJWT } from "../middlewares/auth.middleware.js";
import { uploadFile } from "../middlewares/multer.middleware.js";

const router = Router();

// public route
router.route("/login").post(loginSuperAdmin);

// secured routes

// auth routes
router.route("/register").post(verifyJWT, requireRootSuperAdmin, registerSuperAdmin);
router.route("/refresh-token").post(verifyJWT, requireSuperAdmin, refreshAccessTokenForSuperAdmin)
router.route("/update/:superAdminId").put(
    verifyJWT,
    requireSuperAdmin,
    uploadFile("avatar", "image", true),
    updateSuperAdmin
);
router.route("/delete").post(verifyJWT, requireRootSuperAdmin, deleteSuperAdmin);
router.route("/logout").post(verifyJWT,requireSuperAdmin, logoutSuperAdmin);

// help requests
router.route("/help-requests").get(verifyJWT, requireSuperAdmin, getAllHelpRequests);
router.route("/read/:helpRequestId").patch(verifyJWT, requireSuperAdmin, markHelpRequestAsRead);
router.route("/relove/:helpRequestId").patch(verifyJWT, requireSuperAdmin, markHelpRequestAsResolved);

// admin routes
router.route("/admins").get(verifyJWT, requireSuperAdmin, getAllAdmins);
router.route("/admin/register").post(
    verifyJWT, 
    requireSuperAdmin,
    uploadFile("avatar", "image", true), 
    registerAdmin
);
router.route("admin/suspend/:adminId").patch(verifyJWT, requireSuperAdmin, suspendAdmin);
router.route("admin/resume/:adminId").patch(verifyJWT, requireSuperAdmin, resumeAdmin);

export default router;