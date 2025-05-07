import { Course } from "../models/course.model.js";
import { Student } from "../models/student.model.js";
import { APIError } from "../utils/apiError.js";
import { APIResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHander.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { isStrongPassword, isValidEmail, isValidIndianPhoneNumber } from "../utils/validators.js";

const registerStudent = asyncHandler(async (req, res) => {
    const adminId = req.user._id;

    // Extract required fields
    const {
        name,
        rollNumber,
        email,
        phoneNumber,
        password,
        stream,
        section,
        semester,
        year,
        currentYear,
        courses
    } = req.body;

    // Validate presence of required fields
    if (
        !name || !rollNumber || !email || !phoneNumber || !password || !stream ||
        !section || !semester || !year || !currentYear || !courses
    ) {
        throw new APIError(400, "⚠️ All fields except avatar are required!");
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

    // Check for existing student by email, phone, or rollNumber
    const existingStudent = await Student.findOne({
        $or: [
            { email },
            { phoneNumber },
            { rollNumber }
        ]
    });

    if (existingStudent) {
        throw new APIError(409, "⚠️ Student with this email, phone number, or roll number already exists!");
    }

    // Validate stream exists in Course collection for this admin
    const streamExists = await Course.findOne({
        adminId,
        courseName: stream,
        isDeleted: false
    });

    if (!streamExists) {
        throw new APIError(400, "❌ Stream is not a valid course under this admin!");
    }

    // Upload avatar to Cloudinary (optional)
    let avatar = null;
    let avatarPublicId = null;

    if (req.file?.path) {
        const uploadResult = await uploadOnCloudinary(req.file.path);
        if (!uploadResult?.url) {
            throw new APIError(500, "⚠️ Failed to upload avatar to Cloudinary");
        }
        avatar = uploadResult.url;
        avatarPublicId = uploadResult.public_id;
    }

    // Create new student
    const student = await Student.create({
        adminId,
        name,
        rollNumber,
        email,
        phoneNumber,
        password,
        stream,
        section,
        semester,
        year,
        currentYear,
        courses,
        avatar,
        avatarPublicId
    });

    const created = await Student.findById(student._id).select("-password -refreshToken");

    return res.status(201).json(
        new APIResponse(201, created, "🎓 Student registered successfully!")
    );
});

export { registerStudent };

