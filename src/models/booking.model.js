import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema(
    {
        eventId: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: "Event"
        },
        studentId: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: "Student"
        },
        bookingStatus: {
            type: String,
            enum: ["Confirmed", "Temporary", "Cancelled"],
            default: "Temporary"
        },
        expiresAt: {
            type: Date,
            default: null // Only used for temporary bookings
        },
        isRefunded: {
            type: Boolean,
            default: false
        }
    },
    {
        timestamps: true 
    }
);

export const Booking = mongoose.model("Booking", bookingSchema);
