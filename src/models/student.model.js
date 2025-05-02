import mongoose from "mongoose";

const studentSchema = new mongoose.Schema(
    {
        adminId: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: "Admin"
        },
        name: {
            type: String,
            required: true,
            trim: true
        },
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true
        },
        password: {
            type: String,
            required: true
        },
        stream: {
            type: String,
            required: true,
            trim: true
        },
        section: {
            type: String,
            required: true,
            trim: true
        },
        semester: {
            type: Number,
            required: true,
            min: 1
        },
        year: {
            type: Number,
            required: true,
            min: 1
        },
        temporaryBookingCount: {
            type: Number,
            default: 0,
            min: 0
        },
        refreshToken: {
            type: String,
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

export const Student = mongoose.model("Student", studentSchema);
