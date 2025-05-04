import { SuperAdmin } from "../models/superadmin.model.js";
import { APIError } from "../utils/apiError.js";
import { APIResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHander.js";
import {
    replaceOnCloudinary,
    uploadOnCloudinary,
} from "../utils/cloudinary.js";
import { generateAccessAndRefreshTokens } from "../utils/tokens.js";
import { isStrongPassword, isValidEmail, isValidIndianPhoneNumber } from "../utils/validators.js";

// Login SuperAdmin
const loginSuperAdmin = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        throw new APIError(400, "⚠️ Email and password are required");
    }

    const superAdmin = await SuperAdmin.findOne({ email });

    if (!superAdmin || superAdmin.isDeleted || !(await superAdmin.isPasswordCorrect(password))) {
        throw new APIError(401, "❌ Invalid credentials");
    }

    const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(superAdmin);

    superAdmin.refreshToken = refreshToken;
    await superAdmin.save();

    const user = {
        id: superAdmin._id,
        email: superAdmin.email,
        name: superAdmin.name,
        phoneNumber: superAdmin.phoneNumber,
        isRoot: superAdmin.isRoot,
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
                "✅ SuperAdmin logged in successfully"
            )
        );
});

// Logout SuperAdmin
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

// Register SuperAdmin
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

    if (!isValidIndianPhoneNumber(phoneNumber)) {
        throw new APIError(400, "📱 Invalid phone number! Must be a valid 10-digit Indian number starting with 6-9.");
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
        
        if (!isValidIndianPhoneNumber(phoneNumber)) {
            throw new APIError(400, "📱 Invalid phone number! Must be a valid 10-digit Indian number starting with 6-9.");
        }

        superAdmin.phoneNumber = phoneNumber;
    }

    // Handle avatar image update (if new avatar is uploaded)
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

const refreshAccessToken = asyncHandler(async (req, res) => {
    const incomingRefreshToken =
        req.cookies.refreshToken || req.body.refreshToken;

    if (!incomingRefreshToken) {
        throw new APIError(401, "🔐 Unauthorized request");
    }

    try {
        const decodedToken = jwt.verify(
            incomingRefreshToken,
            process.env.REFRESH_TOKEN_SECRET
        );

        const superAdmin = await SuperAdmin.findById(decodedToken?._id);

        if (!superAdmin) {
            throw new APIError(401, "🚫 Invalid refresh token");
        }

        if (incomingRefreshToken !== superAdmin?.refreshToken) {
            throw new APIError(
                401,
                "🔄 Refresh token is expired or already used!"
            );
        }

        const { newAccessToken, newRefreshToken } = await generateAccessAndRefreshTokens(superAdmin);

        superAdmin.refreshToken = newRefreshToken;
        await superAdmin.save();

        const user = {
            id: superAdmin._id,
            email: superAdmin.email,
            name: superAdmin.name,
            phoneNumber: superAdmin.phoneNumber,
            isRoot: superAdmin.isRoot,
        };

        const options = {
            httpOnly: true,
            secure: true,
        };

        return res
            .status(200)
            .cookie("accessToken", newAccessToken, options)
            .cookie("refreshToken", newRefreshToken, options)
            .json(
                new APIResponse(
                    200,
                    {
                        user,
                        newAccessToken,
                        newRefreshToken,
                    },
                    "✅ Access token refreshed"
                )
            );
    } catch (error) {
        throw new APIError(
            401,
            error?.message || "❌ Invalid Refresh Token! 🔄🚫"
        );
    }
});

export { deleteSuperAdmin, loginSuperAdmin, logoutSuperAdmin, refreshAccessToken, registerSuperAdmin, updateSuperAdmin };

