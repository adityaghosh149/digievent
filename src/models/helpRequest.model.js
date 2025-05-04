import mongoose from "mongoose";

const helpRequestSchema = new mongoose.Schema(
    {
        adminId: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: "Admin",
        },
        subject: {
            type: String,
            required: true,
            trim: true,
        },
        body: {
            type: String,
            required: true,
            trim: true,
        },
        receivedTime: {
            type: Date,
            required: true,
            default: Date.now,
        },
        status: {
            type: String,
            enum: ["Unread", "Read", "Resolved"],
            default: "Unread",
        },
        readTime: {
            type: Date,
            default: null,
        },
        readBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "SuperAdmin"
        },
        resolvedTime: {
            type: Date,
            default: null,
        },
        resolvedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "SuperAdmin"
        },
    },
    {
        timestamps: true, 
    }
);

export const HelpRequest = mongoose.model("HelpRequest", helpRequestSchema);
