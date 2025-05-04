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

// Register Admin
const registerAdmin = asyncHandler(async (req, res) => {
    const requester = req.user; // from verifyJWT middleware (must be SuperAdmin)

    const {
        universityName,
        email,
        phoneNumber,
        password,
        city,
        state,
    } = req.body;

    // Validate required fields
    if (!universityName || !email || !phoneNumber || !password || !city|| !state) {
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
    if (req?.file) {
        // Upload the file to Cloudinary
        const response = await uploadOnCloudinary(req.file.path);

        // Check if the upload was successful
        if (!response) {
            throw new APIError(500, "❌ Failed to upload avatar to Cloudinary");
        }

        // Assign the secure URL and public ID to the avatar variables
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
        city,
        state,
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

// Suspend Admin
const suspendAdmin = asyncHandler(async (req, res) => {
    const { adminId } = req.params;

    const admin = await Admin.findById(adminId);
    if (!admin || admin.isDeleted) {
        throw new APIError(404, "❌ Admin not found");
    }

    // Update status to Suspended (using "Expired" as per schema)
    admin.subscriptionStatus = "Expired";

    await admin.save();

    return res.status(200).json(
        new APIResponse(200, null, "⛔ Admin suspended successfully")
    );
});

const resumeAdmin = asyncHandler(async (req, res) => {
    const { adminId } = req.params;

    const admin = await Admin.findById(adminId);
    if (!admin || admin.isDeleted) {
        throw new APIError(404, "❌ Admin not found");
    }

    // Resume subscription
    admin.subscriptionStatus = "Active";

    await admin.save();

    return res.status(200).json(
        new APIResponse(200, null, "✅ Admin resumed successfully")
    );
});

export const getAllAdmins = asyncHandler(async (req, res) => {
    const { subscriptionStatus } = req.query;

    const filter = { isDeleted: false };

    if (subscriptionStatus) {
        filter.subscriptionStatus = subscriptionStatus;
    }

    const admins = await Admin.find(filter).select(
        "_id universityName avatar phoneNumber city email subscriptionStatus"
    );

    return res.status(200).json(
        new APIResponse(200, admins, "✅ Admins fetched successfully")
    );
});

export { getAllAdmins, registerAdmin, resumeAdmin, suspendAdmin };
