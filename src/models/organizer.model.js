import mongoose from "mongoose";
import { v4 as uuidv4 } from "uuid";

const organizerSchema = new mongoose.Schema(
    {
        organizer_id: {
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
        organizer_name: {
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
        is_deleted: {
            type: Boolean,
            default: false
        }
    },
    {
        timestamps: true
    }
);

export const Organizer = mongoose.model("Organizer", organizerSchema);
