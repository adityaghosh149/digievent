import mongoose from "mongoose";
import { v4 as uuidv4 } from "uuid";

const eventSchema = new mongoose.Schema(
    {
        event_id: {
            type: String,
            default: () => uuidv4(),
            unique: true,
            index: true
        },
        organizer_id: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: "Organizer"
        },
        cover_image: {
            type: String,
            default: null // URL of image, can be null
        },
        total_tickets: {
            type: Number,
            required: true,
            min: 0
        },
        booked_tickets: {
            type: Number,
            default: 0,
            min: 0
        },
        temporary_booked_tickets: {
            type: Number,
            default: 0,
            min: 0
        },
        ticket_price: {
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
        details_pdf: {
            type: String,
            default: null // PDF file URL
        },
        status: {
            type: String,
            enum: ["Pending", "Approved", "Rejected"],
            default: "Pending"
        },
        is_deleted: {
            type: Boolean,
            default: false
        }
    },
    {
        timestamps: true
    }
);

export const Event = mongoose.model("Event", eventSchema);
