import { Course } from "../models/course.model";
import { APIError } from "../utils/apiError";
import { APIResponse } from "../utils/apiResponse";
import { asyncHandler } from "../utils/asyncHander";

const getAllCourses = asyncHandler(async (req, res) => {
    const adminId = req.user._id;

    const courses = await Course.find({ adminId, isDeleted: false });

    return res.status(200).json(
        new APIResponse(200, courses, "✅ Courses fetched successfully")
    );
});

const addCourse = asyncHandler(async (req, res) => {
    const adminId = req.user._id;
    const { courseName, duration } = req.body;

    // Check if duration is an integer between 1 and 5
    if (
        typeof duration !== "number" ||
        !Number.isInteger(duration) ||
        duration < 1 ||
        duration > 5
    ) {
        throw new APIError(400, "⚠️ Duration must be an integer between 1 and 5 years");
    }

    // Check if the course name already exists
    const existing = await Course.findOne({ courseName });
    if (existing) {
        throw new APIError(400, "⚠️ Course name already exists");
    }

    const newCourse = await Course.create({ courseName, duration, adminId });

    return res.status(201).json(
        new APIResponse(201, newCourse, "🎉 Course added successfully")
    );
});

export { addCourse, getAllCourses };
