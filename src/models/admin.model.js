import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";

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
            index: true,
            lowercase: true,
            trim: true,
        },
        phoneNumber: {
            type: String,
            required: true,
            unique: true,
            index: true,
            trim: true,
        },
        password: {
            type: String,
            required: true
        },
        avatar: {
            type: String,
            default: null, 
        },
        avatarPublicId: {
            type: String, 
            default: null,
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
            default: false,
            index: true,
        }
    },
    {
        timestamps: true
    }
);

adminSchema.pre("save", async function (next) {
    if (!this.isModified("password")) return next();
    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (err) {
        next(err);
    }
});

adminSchema.methods.isPasswordCorrect = async function (password) {
    return await bcrypt.compare(password, this.password);
};

adminSchema.methods.generateAccessToken = async function () {
    return jwt.sign(
        {
            _id: this._id,
            role: "Admin",
            email: this.email,
            phoneNumber: this.phoneNumber,
        },
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: process.env.ACCESS_TOKEN_EXPIRY }
    );
};

adminSchema.methods.generateRefreshToken = async function () {
    return jwt.sign(
        {
            _id: this._id,
        },
        process.env.REFRESH_TOKEN_SECRET,
        { expiresIn: process.env.REFRESH_TOKEN_EXPIRY }
    );
};

export const Admin = mongoose.model("Admin", adminSchema);
