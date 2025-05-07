import { Course } from "../models/course.model.js";
import { APIError } from "../utils/apiError.js";
import { APIResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHander.js";

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

const updateCourse = asyncHandler(async (req, res) => {
    const adminId = req.user._id;
    const { courseId } = req.params;
    const { courseName, duration } = req.body;

    if (!courseName && duration === undefined) {
        throw new APIError(400, "⚠️ At least one of 'courseName' or 'duration' must be provided");
    }

    const course = await Course.findOne({ _id: courseId, adminId, isDeleted: false });

    if (!course) {
        throw new APIError(404, "❌ Course not found");
    }

    if (courseName && courseName !== course.courseName) {
        const existingCourse = await Course.findOne({ courseName });
        if (existingCourse) {
            throw new APIError(400, "⚠️ Course name already exists");
        }
        course.courseName = courseName;
    }

    if (duration !== undefined) {
        if (
            typeof duration !== "number" ||
            !Number.isInteger(duration) ||
            duration < 1 ||
            duration > 5
        ) {
            throw new APIError(400, "⚠️ Duration must be an integer between 1 and 5 years");
        }
        course.duration = duration;
    }

    await course.save();

    return res.status(200).json(
        new APIResponse(200, course, "✏️ Course updated successfully")
    );
});

export { addCourse, getAllCourses, updateCourse };

