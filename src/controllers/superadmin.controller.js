import { SuperAdmin } from "../models/superadmin.model.js";
import { APIError } from "../utils/apiError.js";
import { APIResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { isStrongPassword, isValidEmail } from "../utils/validators.js";

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

// Logout
const logoutSuperAdmin = asyncHandler(async (req, res) => {
    const { user } = req.body;

    await SuperAdmin.findByIdAndUpdate(
        user?._id,
        {
            $set: {
                refreshToken: undefined,
            },
        },
        { new: true }
    );

    const options = {
        httpOnly: true,
        secure: true,
    };

    return res
        .status(200)
        .clearCookie("accessToken", options)
        .clearCookie("refreshToken", options)
        .json(new APIResponse(200, {}, "✅ SuperAdmin logged out successfully"));
});

// Register
const registerSuperAdmin = asyncHandler(async (req, res) => {
    const { email, name, phoneNumber, password, isRoot = false } = req.body;

    // Validation: Required fields
    if (!email || !name || !phoneNumber || !password) {
        throw new APIError(400, "⚠️ All fields are required! 🚫");
    }

    // Validate email format
    if (!isValidEmail(email)) {
        throw new APIError(400, "⚠️ Invalid email address! 📧❌");
    }

    // Validate password strength
    if (!isStrongPassword(password)) {
        throw new APIError(
            400,
            "⚠️ Weak password! Must be at least 8 characters long, include uppercase, lowercase, a number, and a special character. 🔐❌"
        );
    }

    // Check if SuperAdmin already exists by email or phone
    const existingAdmin = await SuperAdmin.findOne({
        $or: [{ email }, { phoneNumber }],
    });

    if (existingAdmin) {
        throw new APIError(
            409,
            "⚠️ SuperAdmin with this email or phone number already exists! 👤❌"
        );
    }

    // If root, ensure no other root exists
    if (isRoot) {
        const existingRoot = await SuperAdmin.findOne({ isRoot: true });
        if (existingRoot) {
            throw new APIError(400, "❌ A root SuperAdmin already exists");
        }
    }

    // Create the SuperAdmin
    const superAdmin = await SuperAdmin.create({
        email,
        name,
        phoneNumber,
        password,
        isRoot,
        isRootOnlyFlag: isRoot ? true : undefined,
    });

    // Fetch the created admin without sensitive fields
    const createdSuperAdmin = await SuperAdmin.findById(superAdmin._id).select(
        "-password -refreshToken"
    );

    if (!createdSuperAdmin) {
        throw new APIError(500, "⚠️ SuperAdmin creation failed! ❌");
    }

    // Send success response
    return res.status(201).json(
        new APIResponse(
            201,
            createdSuperAdmin,
            "🎉 SuperAdmin registered successfully! ✅"
        )
    );
});

export { loginSuperAdmin, logoutSuperAdmin };

