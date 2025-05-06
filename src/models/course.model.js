import mongoose from 'mongoose';

const courseSchema = new mongoose.Schema(
    {
        courseName: {
            type: String,
            required: true,
            unique: true,
            trim: true
        },
        duration: {
            type: Number,
            required: true,
            min: 1,
            max: 5
        },
        adminId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Admin',
            required: true
        }
    },
    {
        timestamps: true
    }
);

export const Course = mongoose.model("Course", courseSchema);
