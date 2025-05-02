import mongoose from "mongoose";
import { v4 as uuidv4 } from "uuid";

const superAdminSchema = new mongoose.Schema(
    {
        super_admin_id: {
            type: String,
            default: () => uuidv4(),
            unique: true,
            index: true
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
        refreshToken: {
            type: String,
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

export const SuperAdmin = mongoose.model("SuperAdmin", superAdminSchema);

