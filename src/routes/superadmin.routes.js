import { Router } from "express";
import { loginSuperAdmin } from "../controllers/superadmin.controller";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.route("/login").post(verifyJWT, loginSuperAdmin);

export default router;