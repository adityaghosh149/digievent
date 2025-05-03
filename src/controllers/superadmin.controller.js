import { SuperAdmin } from "../models/superadmin.model.js";
import { APIError } from "../utils/apiError.js";
import { APIResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

// Login
const loginSuperAdmin = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        throw new APIError(400, "⚠️ Email and password are required");
    }

    const admin = await SuperAdmin.findOne({ email });

    if (!admin || admin.isDeleted || !(await admin.isPasswordCorrect(password))) {
        throw new APIError(401, "❌ Invalid credentials");
    }

    const accessToken = await admin.generateAccessToken();
    const refreshToken = await admin.generateRefreshToken();

    admin.refreshToken = refreshToken;
    await admin.save();

    const user = {
        id: admin._id,
        email: admin.email,
        name: admin.name,
        phoneNumber: admin.phoneNumber,
        isRoot: admin.isRoot,
    };

    const options = {
        httpOnly: true,
        secure: true,
    };

    return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(
            new APIResponse(
                200,
                { user, accessToken, refreshToken },
                "✅ SuperAdmin logged in successfully"
            )
        );
});


export { loginSuperAdmin };
