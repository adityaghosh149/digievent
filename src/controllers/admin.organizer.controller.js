// controllers/organizer.controller.js
import { Organizer } from "../models/organizer.model.js";
import { APIError } from "../utils/apiError.js";
import { APIResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHander.js";

// Register Organizer
const registerOrganizer = asyncHandler(async (req, res) => {
    const requester = req.user; // Must be Admin, validated via verifyJWT

    const {
        organizerName,
        clubName,
        email,
        phoneNumber,
        password,
    } = req.body;

    // Validate required fields
    if (!organizerName || !clubName || !email || !phoneNumber || !password) {
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

    // Check for existing organizer with email or phone
    const existing = await Organizer.findOne({
        $or: [{ email }, { phoneNumber }],
    });

    if (existing) {
        throw new APIError(409, "⚠️ Organizer with this email or phone number already exists!");
    }

    let avatar = null;
    let avatarPublicId = null;

    // Optional avatar upload
    if (req?.file) {
        const response = await uploadOnCloudinary(req.file.path);
        if (!response) {
            throw new APIError(500, "❌ Failed to upload avatar to Cloudinary");
        }
        avatar = response.secure_url;
        avatarPublicId = response.public_id;
    }

    // 🏗️ Create Organizer
    const newOrganizer = await Organizer.create({
        adminId: requester._id,
        organizerName,
        clubName,
        email,
        phoneNumber,
        password,
        avatar,
        avatarPublicId,
    });
    
    await newOrganizer.save();

    const createdOrganizer = await Organizer.findById(newOrganizer._id)
        .select("-password -refreshToken");

    // Response
    return res.status(201).json(
        new APIResponse(
            201,
            {
                organizer: createdOrganizer,
                accessToken,
                refreshToken,
            },
            "🎉 Organizer registered successfully!"
        )
    );
});

// Update Organizer
const updateOrganizer = asyncHandler(async (req, res) => {
    const { organizerId } = req.params;
    const adminId = req.user._id; // The currently authenticated admin making the request

    const { organizerName, clubName, phoneNumber } = req.body;

    const organizer = await Organizer.findById(organizerId);
    if (!organizer || organizer.isDeleted) {
        throw new APIError(404, "❌ Organizer not found or deleted");
    }

    // Check if the current admin is the same admin who created this organizer
    if (organizer.adminId.toString() !== adminId.toString()) {
        throw new APIError(403, "❌ You are not authorized to update this organizer");
    }

    // Phone number update
    if (phoneNumber && phoneNumber !== organizer.phoneNumber) {
        if (!isValidIndianPhoneNumber(phoneNumber)) {
            throw new APIError(400, "📱 Invalid Indian phone number");
        }

        const existing = await Organizer.findOne({ phoneNumber });
        if (existing && existing._id.toString() !== organizerId.toString()) {
            throw new APIError(409, "⚠️ Phone number already in use");
        }

        organizer.phoneNumber = phoneNumber;
    }

    // Update optional fields
    if (organizerName) organizer.organizerName = organizerName;
    if (clubName) organizer.clubName = clubName;

    // Avatar update with safe fallback
    if (req?.file) {
        let response;

        if (organizer.avatarPublicId) {
            try {
                response = await replaceOnCloudinary(req.file.path, organizer.avatarPublicId);
            } catch (err) {
                console.warn("⚠️ Failed to replace existing avatar. Falling back to upload:", err.message);
                response = await uploadOnCloudinary(req.file.path);
            }
        } else {
            response = await uploadOnCloudinary(req.file.path);
        }

        if (!response) {
            throw new APIError(500, "❌ Failed to upload or replace avatar on Cloudinary");
        }

        organizer.avatar = response.secure_url;
        organizer.avatarPublicId = response.public_id;
    }

    await organizer.save();

    const updatedOrganizer = await Organizer.findById(organizer._id)
        .select("-password -refreshToken");

    return res.status(200).json(
        new APIResponse(200, updatedOrganizer, "✅ Organizer profile updated successfully")
    );
});

// Get All Orgainzers
const getAllOrganizers = asyncHandler(async (req, res) => {
    const adminId = req.user._id; // The currently authenticated admin making the request

    const organizers = await Organizer.find({ adminId, isDeleted: false }) // Filter by adminId and exclude deleted organizers
        .select("-password -refreshToken"); // Exclude sensitive fields

    return res.status(200).json(
        new APIResponse(
            200,
            organizers, // If no organizers, an empty array will be returned
            "✅ All organizers for this admin retrieved successfully"
        )
    );
});

export { getAllOrganizers, registerOrganizer, updateOrganizer };

