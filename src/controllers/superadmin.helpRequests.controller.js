import { HelpRequest } from "../models/helprequest.model.js";
import { APIError } from "../utils/apiError.js";
import { APIResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHander.js";

const getAllHelpRequests = asyncHandler(async (req, res) => {
    const helpRequests = await HelpRequest.aggregate([
        {
            $lookup: {
                from: "admins", // name of the Admin collection (Mongo pluralizes by default)
                localField: "adminId",
                foreignField: "_id",
                as: "adminDetails"
            }
        },
        {
            $unwind: "$adminDetails"
        },
        {
            $project: {
                _id: 0,
                subject: 1,
                body: 1,
                status: 1,
                receivedTime: 1,
                "admin.universityName": "$adminDetails.universityName",
                "admin.email": "$adminDetails.email",
                "admin.city": "$adminDetails.city", // assuming city is stored here
                "admin.state": "$adminDetails.state"
            }
        },
        {
            $sort: { receivedTime: -1 }
        }
    ]);

    return res.status(200).json(
        new APIResponse(200, helpRequests, "✅ Help requests fetched successfully")
    );
})

export { getAllHelpRequests };

