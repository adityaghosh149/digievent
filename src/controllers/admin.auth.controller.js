import { Admin } from "../models/admin.model.js";
import { APIError } from "../utils/apiError.js";
import { APIResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHander.js";
import { generateAccessAndRefreshTokens } from "../utils/tokens.js";

// Login Admin
const loginAdmin = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        throw new APIError(400, "⚠️ Email and password are required");
    }

    const admin = await Admin.findOne({ email });

    if (!admin || admin.isDeleted || !(await admin.isPasswordCorrect(password))) {
        throw new APIError(401, "❌ Invalid credentials");
    }

    const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(admin);

    admin.refreshToken = refreshToken;
    await admin.save();

    const user = {
        id: admin._id,
        email: admin.email,
        phoneNumber: admin.phoneNumber,
        universityName: admin.universityName,
        subscriptionStatus: admin.subscriptionStatus,
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
                {
                    user,
                    accessToken,
                    refreshToken,
                },
                "✅ Admin logged in successfully"
            )
        );
});

// Logout Admin
const logoutAdmin = asyncHandler(async (req, res) => {
    const { user } = req.body;

    const updatedAdmin = await Admin.findByIdAndUpdate(
        user?._id,
        {
            $set: {
                refreshToken: undefined,
            },
        },
        { new: true }
    );

    if (!updatedAdmin) {
        throw new APIError(404, "❌ Admin not found for logout");
    }

    const options = {
        httpOnly: true,
        secure: true,
    };

    return res
        .status(200)
        .clearCookie("accessToken", options)
        .clearCookie("refreshToken", options)
        .json(new APIResponse(200, {}, "✅ Admin logged out successfully"));
});

export { loginAdmin, logoutAdmin };
