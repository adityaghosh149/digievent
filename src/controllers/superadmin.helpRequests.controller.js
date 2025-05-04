import { HelpRequest } from "../models/helprequest.model.js";
import { APIError } from "../utils/apiError.js";
import { APIResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHander.js";

// Get all help requests
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
                id: "$_id",
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

// Mark as read
const markHelpRequestAsRead = asyncHandler(async (req, res) => {
    const { helpRequestId } = req.params;
    const superAdminId = req.user._id;

    // Fetch the help request details using aggregation pipeline
    const helpRequest = await HelpRequest.aggregate([
        { $match: { _id: mongoose.Types.ObjectId(helpRequestId) } },
        {
            $lookup: {
                from: "admins",
                localField: "adminId",
                foreignField: "_id",
                as: "adminDetails"
            }
        },
        { $unwind: "$adminDetails" },
        {
            $set: {
                subject: "$subject",
                body: "$body",
                status: "$status",
                receivedTime: "$receivedTime",
                readTime: { $cond: [{ $eq: ["$status", "Read"] }, new Date(), null] },
                admin: {
                    universityName: "$adminDetails.universityName",
                    email: "$adminDetails.email",
                    city: "$adminDetails.address",
                    state: "$adminDetails.state"
                }
            }
        }
    ]);

    // If no help request found, return an error
    if (!helpRequest || helpRequest.length === 0) {
        throw new APIError(404, "❌ Help request not found");
    }

    const updatedHelpRequest = helpRequest[0];

    // If the help request is unread, update it to 'Read'
    if (updatedHelpRequest.status === "Unread") {
        // Store the result of the update operation
        const updateResult = await HelpRequest.findByIdAndUpdate(
            helpRequestId,
            {
                status: "Read",
                readTime: new Date(),
                readBy: superAdminId
            },
            { new: true } // Return the updated document
        );

        // If the update fails, throw an error
        if (!updateResult) {
            throw new APIError(500, "❌ Failed to update the help request status");
        }

        // Update the local variable with the latest status and include id
        updatedHelpRequest.status = "Read";
        updatedHelpRequest.readTime = new Date();
        updatedHelpRequest.id = updatedHelpRequest._id; // Adding the 'id' explicitly to the response
    }

    // Return the updated help request with 'id' included
    return res.status(200).json(
        new APIResponse(200, updatedHelpRequest, "✅ Help request marked as read")
    );
});

export { getAllHelpRequests, markHelpRequestAsRead };

