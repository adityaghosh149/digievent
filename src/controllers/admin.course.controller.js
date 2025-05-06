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

export { getAllCourses };

