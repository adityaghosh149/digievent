import { Router } from "express";
import { loginAdmin, logoutAdmin, refreshAccessTokenForAdmin, updateAdmin } from "../controllers/admin.auth.controller.js";
import { getAllCourses } from "../controllers/admin.course.controller.js";
import { getAllOrganizers, registerOrganizer, updateOrganizer } from "../controllers/admin.organizer.controller.js";
import { requireAdmin, verifyJWT } from "../middlewares/auth.middleware.js";
import { uploadFile } from "../middlewares/multer.middleware.js";

const router = Router();

// public routes
router.route("/login").post(loginAdmin);

// secured routes

// auth routes
router.route("/logout").post(verifyJWT, requireAdmin, logoutAdmin);
router.route("/update/:adminId").patch(
    verifyJWT, 
    requireAdmin, 
    uploadFile("avatar", "image", true), 
    updateAdmin
);
router.route("/refesh-token").post(verifyJWT, requireAdmin, refreshAccessTokenForAdmin);

// organizer routes
router.route("/organizers").get(verifyJWT, requireAdmin, getAllOrganizers);
router.route("/organizer/register").post(
    verifyJWT, 
    requireAdmin,
    uploadFile("avatar", "image", true), 
    registerOrganizer
);
router.route("organizer/update/:organizerId").patch(
    verifyJWT,
    requireAdmin,
    uploadFile("avatar", "image", true),
    updateOrganizer
)

// course routes
router.route("/courses").get(verifyJWT, requireAdmin, getAllCourses);

export default router;