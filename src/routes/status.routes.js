import { Router } from "express";
import { getHealthStatus } from "../controllers/status.controller.js";
import { requireAdmin, verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.route("/health").get(verifyJWT, requireAdmin, getHealthStatus);

export default Router;