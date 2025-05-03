import { SuperAdmin } from "../models/superadmin.model.js";
import { APIError } from "../utils/apiError.js";
import { APIResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import {
    replaceOnCloudinary,
    uploadOnCloudinary,
} from "../utils/cloudinary.js";
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
        avatar: null,
        avatarPublicId: null,
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

// Update SuperAdmin
const updateSuperAdmin = asyncHandler(async (req, res) => {
    const { superAdminId } = req.params; // Extracting SuperAdmin ID from params
    const { fullName, phoneNumber, password, newPassword, confirmPassword } = req.body;
    
    // Finding the SuperAdmin by ID
    const superAdmin = await SuperAdmin.findById(superAdminId);
    if (!superAdmin) {
        throw new APIError(404, "❌ SuperAdmin not found");
    }

    // Password update logic (only if password and newPassword are provided)
    if (password && newPassword && confirmPassword) {
        // Check if the current password is correct
        const isPasswordValid = await superAdmin.isPasswordCorrect(password);
        if (!isPasswordValid) {
            throw new APIError(401, "❌ Invalid current password");
        }

        // Validate if new password and confirm password match
        if (newPassword !== confirmPassword) {
            throw new APIError(400, "⚠️ New password and confirm password do not match");
        }

        // The password update will be handled by the pre-save hook in the model
        superAdmin.password = newPassword; // Update password (this will trigger the pre-save hook for hashing)
    }

    // Update phone number if provided
    if (phoneNumber) {
        superAdmin.phoneNumber = phoneNumber;
    }

    // Handle avatar image update (if new avatar is uploaded)
    if (req.files?.avatar) {
        // Upload the new avatar to Cloudinary
        const avatarLocalPath = req.files.avatar[0].path;
        const avatarUpload = await uploadOnCloudinary(avatarLocalPath);
        if (!avatarUpload) {
            throw new APIError(500, "⚠️ Failed to upload avatar image");
        }

        // If avatar is already uploaded, replace it
        if (superAdmin.avatarPublicId) {
            await replaceOnCloudinary(superAdmin.avatarPublicId, avatarLocalPath);
        }

        // Update the SuperAdmin's avatar and avatarPublicId
        superAdmin.avatar = avatarUpload.secure_url;
        superAdmin.avatarPublicId = avatarUpload.public_id;
    }

    // Update other fields
    if (fullName) {
        superAdmin.fullName = fullName;
    }

    // Save the updated SuperAdmin data
    await superAdmin.save();

    // Return success response with updated SuperAdmin data (excluding sensitive info)
    const updatedSuperAdmin = await SuperAdmin.findById(superAdminId).select("-password -refreshToken");

    return res.status(200).json(
        new APIResponse(
            200, 
            updatedSuperAdmin, 
            "✅ SuperAdmin updated successfully"
        )
    );
});

// Delete SuperAdmin
const deleteSuperAdmin = asyncHandler(async (req, res) => {
    const requester = req.user;
    const { id } = req.params;  // The ID of the SuperAdmin to be deleted

    // Check if the requester is a Root SuperAdmin
    if (!requester.isRoot) {
        throw new APIError(
            403,
            "⛔ Forbidden: Only a Root SuperAdmin can delete other SuperAdmins"
        );
    }

    // Prevent deletion of the Root SuperAdmin
    if (requester._id.toString() === id) {
        throw new APIError(400, "⚠️ You cannot delete your own account (Root SuperAdmin)");
    }

    // Find the SuperAdmin to be deleted
    const deleteSuperAdmin = await SuperAdmin.findById(id);

    if (!deleteSuperAdmin) {
        throw new APIError(404, "⚠️ SuperAdmin not found");
    }

    // Perform a soft delete by setting `isDeleted` to true
    deleteSuperAdmin.isDeleted = true;
    
    // Save the updated SuperAdmin document
    await deleteSuperAdmin.save();

    return res.status(200).json(
        new APIResponse(
            200,
            {},
            "✅ SuperAdmin deleted successfully!"
        )
    );
});

export { deleteSuperAdmin, loginSuperAdmin, logoutSuperAdmin, registerSuperAdmin, updateSuperAdmin };