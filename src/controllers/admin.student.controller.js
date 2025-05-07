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


const updateStudent = asyncHandler(async (req, res) => {
    const adminId = req.user._id;
    const { studentId } = req.params;
    const { name, rollNumber, phoneNumber, currentYear } = req.body;

    const student = await Student.findOne({
        _id: studentId,
        adminId,
        isDeleted: false
    });

    if (!student) {
        throw new APIError(404, "❌ Student not found!");
    }

    // Ensure at least one field is provided for update
    if (!name && !rollNumber && !phoneNumber && !currentYear && !req.file?.path) {
        throw new APIError(400, "⚠️ At least one field must be provided for update.");
    }

    // Validate phone number if provided
    if (phoneNumber && !isValidIndianPhoneNumber(phoneNumber)) {
        throw new APIError(400, "📱 Invalid phone number! Must be valid 10-digit Indian number starting with 6-9.");
    }

    // Check uniqueness of roll number if changed
    if (rollNumber && rollNumber !== student.rollNumber) {
        const rollExists = await Student.findOne({ rollNumber });
        if (rollExists) {
            throw new APIError(409, "⚠️ Roll number already exists for another student.");
        }
        student.rollNumber = rollNumber;
    }

    // Check uniqueness of phone number if changed
    if (phoneNumber && phoneNumber !== student.phoneNumber) {
        const phoneExists = await Student.findOne({ phoneNumber });
        if (phoneExists) {
            throw new APIError(409, "⚠️ Phone number already exists for another student.");
        }
        student.phoneNumber = phoneNumber;
    }

    // Update fields if provided
    if (name) student.name = name;
    if (currentYear) student.currentYear = currentYear;

    // Handle avatar upload or replacement
    if (req?.file) {
        let response;

        if (student.avatarPublicId) {
            try {
                // Attempt to replace existing avatar using publicId
                response = await replaceOnCloudinary(req.file.path, student.avatarPublicId);
            } catch (err) {
                // If replace fails (invalid publicId), fallback to uploading a new avatar
                response = await uploadOnCloudinary(req.file.path);
            }
        } else {
            // If no avatar exists, upload a new avatar
            response = await uploadOnCloudinary(req.file.path);
        }

        // If upload or replace failed, throw error
        if (!response) {
            throw new APIError(500, "❌ Failed to upload or replace avatar on Cloudinary");
        }

        // Update avatar URL and publicId in student record
        student.avatar = response.secure_url;
        student.avatarPublicId = response.public_id;
    }

    await student.save();

    const updated = await Student.findById(student._id).select("-password -refreshToken");

    return res.status(200).json(
        new APIResponse(200, updated, "✏️ Student updated successfully!")
    );
});

export { registerStudent, updateStudent };
