import mongoose from "mongoose";
import { v4 as uuidv4 } from "uuid";

const adminSchema = new mongoose.Schema(
    {
        admin_id: {
            type: String,
            default: () => uuidv4(),
            unique: true,
            index: true
        },
        super_admin_id: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: "SuperAdmin"
        },
        university_name: {
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
        phone_number: {
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
        subscription_status: {
            type: String,
            enum: ["Active", "Pending", "Expired"],
            default: "Active"
        },
        subscription_end_date: {
            type: Date,
            default: null
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

export const Admin = mongoose.model("Admin", adminSchema);
