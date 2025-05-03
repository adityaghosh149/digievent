import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";

const superAdminSchema = new mongoose.Schema(
    {
        email: {
            type: String,
            required: true,
            unique: true,
            index: true,
            lowercase: true,
            trim: true,
        },
        name: {
            type: String,
            required: true,
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
        refreshToken: {
            type: String,
            default: null
        },
        isRoot: {
            type: Boolean,
            default: false
        },
        isRootOnlyFlag: {
            type: Boolean,
            default: false,
            unique: true,
            sparse: true // required so only "true" values are indexed
        },
        isDeleted: {
            type: Boolean,
            default: false,
            index: true
        }
    },
    {
        timestamps: true
    }
);

superAdminSchema.pre("save", async function (next) {
    if (this.isModified("password")) {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
    }

    // Enforce unique isRoot
    if (this.isRoot) {
        const existingRoot = await mongoose.models.SuperAdmin.findOne({ isRoot: true });

        // If another root exists and it's not this one
        if (existingRoot && existingRoot._id.toString() !== this._id.toString()) {
            return next(new Error("Only one root SuperAdmin is allowed."));
        }
    }

    next();
});


superAdminSchema.methods.isPasswordCorrect = async function (password) {
    return await bcrypt.compare(password, this.password);
};

superAdminSchema.methods.generateAccessToken = async function () {
    return jwt.sign(
        {
            _id: this._id,
            role: "SuperAdmin",
            email: this.email,
            phoneNumber: this.phoneNumber,
        },
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: process.env.ACCESS_TOKEN_EXPIRY }
    );
};

superAdminSchema.methods.generateRefreshToken = async function () {
    return jwt.sign(
        {
            _id: this._id,
        },
        process.env.REFRESH_TOKEN_SECRET,
        { expiresIn: process.env.REFRESH_TOKEN_EXPIRY }
    );
};

export const SuperAdmin = mongoose.model("SuperAdmin", superAdminSchema);

