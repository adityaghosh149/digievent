import jwt from "jsonwebtoken";
import { Admin } from "../models/admin.model.js";
import { Organizer } from "../models/organizer.model.js";
import { Student } from "../models/student.model.js";
import { SuperAdmin } from "../models/superadmin.model.js";
import { APIError } from "../utils/apiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

// Map roles to corresponding models
const modelMap = {
    SuperAdmin,
    Admin,
    Organizer,
    Student,
};

const verifyJWT = asyncHandler(async (req, res, next) => {
    const accessToken =
        req.cookies?.accessToken ||
        req.header("Authorization")?.replace("Bearer ", "");

    if (!accessToken) {
        throw new APIError(401, "🚫 Unauthorized: Access token missing");
    }

    try {
        const decoded = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET);
        const { _id, role } = decoded;

        const Model = modelMap[role];
        if (!Model) {
            throw new APIError(401, `❌ Invalid role: ${role}`);
        }

        const user = await Model.findById(_id).select("-password -refreshToken");
        if (!user) {
            throw new APIError(401, "❌ User not found");
        }

        req.user = user;
        req.user.role = role; // Attach role to req.user for later access
        next();
    } catch (error) {
        throw new APIError(401, error?.message || "❌ Invalid or expired token");
    }
});

export { verifyJWT };

