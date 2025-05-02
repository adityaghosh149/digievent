import mongoose from "mongoose";
import { v4 as uuidv4 } from "uuid";

const adminSchema = new mongoose.Schema(
    {
        superAdminId: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: "SuperAdmin"
        },
        universityName: {
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
        phoneNumber: {
            type: String,
            required: true,
            unique: true,
            trim: true
        },
        password: {
            type: String,
            required: true
        },
        address: {
            type: String,
            required: true
        },
        state: {
            type: String,
            required: true
        },
        country: {
            type: String,
            required: true
        },
        subscriptionStatus: {
            type: String,
            enum: ["Active", "Pending", "Expired"],
            default: "Active"
        },
        subscriptionEndDate: {
            type: Date,
            default: null
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

export const Admin = mongoose.model("Admin", adminSchema);
