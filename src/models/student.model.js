import mongoose, { Mongoose } from "mongoose";
import { v4 as uuidv4 } from "uuid";

const studentSchema = new mongoose.Schema(
    {
        student_id: {
            type: String,
            default: () => uuidv4(),
            unique: true,
            index: true
        },
        admin_id: {
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
        temporary_booking_count: {
            type: Number,
            default: 0,
            min: 0
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

export const Student = mongoose.model("Student", studentSchema);
