import { v2 as cloudinary } from "cloudinary";
import dotenv from "dotenv";
import fs from "fs";

dotenv.config({
    path: "./.env",
});

// Cloudinary Configuration
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadOnCloudinary = async (localFilePath) => {
    if (!localFilePath) return null;

    try {
        // Upload the file to Cloudinary
        const response = await cloudinary.uploader.upload(localFilePath, {
            resource_type: "auto",
        });

        console.log(`✅ File uploaded to Cloudinary: ${response.secure_url}`);
        return response;
    } catch (error) {
        console.error(`❌ Cloudinary upload failed: ${error.message}`);
        return null;
    } finally {
        // Remove the local file regardless of success or failure
        try {
            fs.unlinkSync(localFilePath);
            console.log(`🗑️ Local file deleted: ${localFilePath}`);
        } catch (unlinkError) {
            console.error(
                `⚠️ Failed to delete local file: ${unlinkError.message}`
            );
        }
    }
};

// Function to delete a file from Cloudinary
const deleteFromCloudinary = async (publicId) => {
    if (!publicId) {
        console.error("❌ Public ID is required to delete the file.");
        return null;
    }

    try {
        // Delete the file from Cloudinary
        const response = await cloudinary.uploader.destroy(publicId);
        console.log(`✅ File deleted from Cloudinary: ${response.result}`);
        return response;
    } catch (error) {
        console.error(`❌ Cloudinary delete failed: ${error.message}`);
        return null;
    }
};


// Function to replace a file on Cloudinary
const replaceOnCloudinary = async (publicId, localFilePath) => {
    if (!publicId || !localFilePath) {
        console.error("❌ Both public ID and file path are required.");
        return null;
    }

    try {
        // Replace the file with the new one
        const response = await cloudinary.uploader.upload(localFilePath, {
            public_id: publicId, // This ensures the file is replaced
            overwrite: true, // Ensures the file is replaced
            resource_type: "auto",
        });

        console.log(`✅ File replaced on Cloudinary: ${response.secure_url}`);
        return response;
    } catch (error) {
        console.error(`❌ Cloudinary file replacement failed: ${error.message}`);
        return null;
    }
};

export { deleteFromCloudinary, replaceOnCloudinary, uploadOnCloudinary };

