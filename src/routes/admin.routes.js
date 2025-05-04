import { Router } from "express";
import { loginAdmin } from "../controllers/admin.auth.controller.js";

const router = Router();

// public route
router.route("/login").post(loginAdmin);

export default router;