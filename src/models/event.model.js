import mongoose from "mongoose";

const eventSchema = new mongoose.Schema(
    {
        organizerId: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: "Organizer"
        },
        coverImage: {
            type: String,
            default: null // URL of image, can be null
        },
        totalTickets: {
            type: Number,
            required: true,
            min: 0
        },
        bookedTickets: {
            type: Number,
            default: 0,
            min: 0
        },
        temporaryBookedTickets: {
            type: Number,
            default: 0,
            min: 0
        },
        ticketPrice: {
            type: mongoose.Types.Decimal128,
            default: 0.00
        },
        title: {
            type: String,
            required: true,
            trim: true
        },
        description: {
            type: String,
            required: true
        },
        date: {
            type: Date,
            required: true
        },
        time: {
            type: String, // Stored as "HH:MM" string
            required: true
        },
        venue: {
            type: String,
            required: true
        },
        detailsPdf: {
            type: String,
            default: null // PDF file URL
        },
        status: {
            type: String,
            enum: ["Pending", "Approved", "Rejected"],
            default: "Pending"
        },
        isDeleted: {
            type: Boolean,
            default: false
        }
    },
    {
        timestamps: true
    }
);

export const Event = mongoose.model("Event", eventSchema);
