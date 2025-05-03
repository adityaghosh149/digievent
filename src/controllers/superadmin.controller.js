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
    const requester = req.user;

    // Extract required fields
    const { email, name, phoneNumber, password } = req.body;

    // Validate required fields
    if (!email || !name || !phoneNumber || !password) {
        throw new APIError(400, "⚠️ All fields are required!");
    }

    if (!isValidEmail(email)) {
        throw new APIError(400, "📧 Invalid email format!");
    }

    if (!isStrongPassword(password)) {
        throw new APIError(
            400,
            "🔐 Weak password! Must include uppercase, lowercase, number, special character, and be at least 8 characters long."
        );
    }

    // Check for existing SuperAdmin with same email or phone number
    const existing = await SuperAdmin.findOne({
        $or: [{ email }, { phoneNumber }],
    });

    if (existing) {
        throw new APIError(409, "⚠️ SuperAdmin with this email or phone number already exists!");
    }

    // Optional: If `isRootOnlyFlag` is passed in the request body, validate exclusivity
    if (req.body.isRootOnlyFlag) {
        const existingRoot = await SuperAdmin.findOne({ isRootOnlyFlag: true });
        if (existingRoot) {
            throw new APIError(409, "⚠️ A Root SuperAdmin already exists!");
        }
    }

    // Create the new SuperAdmin (do NOT allow client to set isRoot directly unless root is assigning it intentionally)
    const newSuperAdmin = await SuperAdmin.create({
        email,
        name,
        phoneNumber,
        password,
        isRoot: req.body.isRoot === true && requester.isRoot ? true : false,
        isRootOnlyFlag: req.body.isRootOnlyFlag === true && requester.isRoot ? true : false,
    });

    const created = await SuperAdmin.findById(newSuperAdmin._id).select(
        "-password -refreshToken"
    );

    return res.status(201).json(
        new APIResponse(
            201,
            created,
            "🎉 SuperAdmin registered successfully!"
        )
    );
});

export { loginSuperAdmin, logoutSuperAdmin };

