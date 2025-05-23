import { Router } from "express";
import { loginAdmin, logoutAdmin, refreshAccessTokenForAdmin, updateAdmin } from "../controllers/admin.auth.controller.js";
import { addCourse, getAllCourses, updateCourse } from "../controllers/admin.course.controller.js";
import { getAllOrganizers, registerOrganizer, updateOrganizer } from "../controllers/admin.organizer.controller.js";
import { deleteStudent, registerStudent, updateStudent } from "../controllers/admin.student.controller.js";
import { requireAdmin, verifyJWT } from "../middlewares/auth.middleware.js";
import { uploadFile } from "../middlewares/multer.middleware.js";

const router = Router();

// public routes
router.route("/login").post(loginAdmin);

// secured routes

// auth routes
router.route("/logout").post(verifyJWT, requireAdmin, logoutAdmin);
router.route("/update").patch(
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
router.route("/organizer/update/:organizerId").patch(
    verifyJWT,
    requireAdmin,
    uploadFile("avatar", "image", true),
    updateOrganizer
)

// course routes
router.route("/courses").get(verifyJWT, requireAdmin, getAllCourses);
router.route("/course/add-course").post(verifyJWT, requireAdmin, addCourse);
router.route("/course/update/:courseId").patch(verifyJWT, requireAdmin, updateCourse);

// student routes
router.route("/student/register").post(verifyJWT, requireAdmin, registerStudent);
router.route("/student/update/:studentId").patch(verifyJWT, requireAdmin, updateStudent);
router.route("/studnet/delete/:studentId").delete(verifyJWT, requireAdmin, deleteStudent);

export default router;