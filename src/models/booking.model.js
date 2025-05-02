import mongoose from "mongoose";
import { v4 as uuidv4 } from "uuid";

const bookingSchema = new mongoose.Schema(
    {
        booking_id: {
            type: String,
            default: () => uuidv4(),
            unique: true,
            index: true
        },
        event_id: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: "Event"
        },
        student_id: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: "Student"
        },
        booking_status: {
            type: String,
            enum: ["Confirmed", "Temporary", "Cancelled"],
            default: "Temporary"
        },
        expires_at: {
            type: Date,
            default: null // Only used for temporary bookings
        },
        is_refunded: {
            type: Boolean,
            default: false
        }
    },
    {
        timestamps: true 
    }
);

export const Booking = mongoose.model("Booking", bookingSchema);
