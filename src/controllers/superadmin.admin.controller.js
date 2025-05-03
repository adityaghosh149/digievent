import { Admin } from "../models/admin.model.js";
import { APIError } from "../utils/apiError.js";
import { APIResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHander.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import {
    isStrongPassword,
    isValidEmail,
    isValidIndianPhoneNumber,
} from "../utils/validators.js";

const registerAdmin = asyncHandler(async (req, res) => {
    const requester = req.user; // from verifyJWT middleware (must be SuperAdmin)

    const {
        universityName,
        email,
        phoneNumber,
        password,
        address,
        state,
        country,
    } = req.body;

    // Validate required fields
    if (!universityName || !email || !phoneNumber || !password || !address || !state || !country) {
        throw new APIError(400, "⚠️ All fields are required!");
    }

    if (!isValidEmail(email)) {
        throw new APIError(400, "📧 Invalid email format!");
    }

    if (!isValidIndianPhoneNumber(phoneNumber)) {
        throw new APIError(400, "📱 Invalid phone number! Must be a valid 10-digit Indian number starting with 6-9.");
    }

    if (!isStrongPassword(password)) {
        throw new APIError(
            400,
            "🔐 Weak password! Must include uppercase, lowercase, number, special character, and be at least 8 characters long."
        );
    }

    // Check for duplicate email or phone number
    const existing = await Admin.findOne({
        $or: [{ email }, { phoneNumber }],
    });

    if (existing) {
        throw new APIError(409, "⚠️ Admin with this email or phone number already exists!");
    }

    let avatar = null;
    let avatarPublicId = null;

    // If avatar file is provided, upload to Cloudinary
    if (req.file) {
        const response = await uploadOnCloudinary(req.file.path);
        if (!response) {
            throw new APIError(500, "❌ Failed to upload avatar to Cloudinary");
        }

        avatar = response.secure_url;
        avatarPublicId = response.public_id;
    }

    // Create Admin
    const newAdmin = await Admin.create({
        superAdminId: requester._id,
        universityName,
        email,
        phoneNumber,
        password, 
        avatar,
        avatarPublicId,
        address,
        state,
        country,
    });

    const createdAdmin = await Admin.findById(newAdmin._id).select("-password -refreshToken");

    return res
        .status(201)
        .json(new APIResponse(
            201, 
            createdAdmin, 
            "🎉 Admin registered successfully!"
        ));
});

export { registerAdmin };

