import fs from "fs";
import multer from "multer";
import path from "path";
import { APIError } from "../utils/apiError.js";

// Manually create __dirname in ES Modules
import { fileURLToPath } from "url";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure the "uploads" directory exists
const uploadPath = path.join(__dirname, "../public/uploads");
if (!fs.existsSync(uploadPath)) {
    fs.mkdirSync(uploadPath, { recursive: true });
}

// Multer storage configuration
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadPath); // Files will be saved to the 'uploads' directory
    },
    filename: (req, file, cb) => {
        cb(
            null,
            `${file.fieldname}-${Date.now()}-${Math.round(Math.random() * 1e9)}${path.extname(file.originalname)}`
        ); // Generates a unique filename with the original extension
    },
});

// Image file filter
const imageFilter = (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype.toLowerCase());

    if (extname && mimetype) {
        cb(null, true);
    } else {
        cb(new APIError(400, "❌ Only image files (jpg, jpeg, png, webp) are allowed!"));
    }
};

// PDF file filter
const pdfFilter = (req, file, cb) => {
    const extname = path.extname(file.originalname).toLowerCase() === ".pdf";
    const mimetype = file.mimetype === "application/pdf";

    if (extname && mimetype) {
        cb(null, true);
    } else {
        cb(new APIError(400, "❌ Only PDF files are allowed!"));
    }
};

// Single file upload function
const uploadFile = (fieldName, type = 'image') => {
    let fileFilter;

    // Choose filter based on type (image or pdf)
    if (type === 'image') {
        fileFilter = imageFilter;
    } else if (type === 'pdf') {
        fileFilter = pdfFilter;
    }

    const upload = multer({
        storage,
        limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
        fileFilter: fileFilter,
    });

    return upload.single(fieldName); // Single file upload for a specific field
};

// Multiple file upload function
const uploadFiles = (fields) => {
    const fileFilters = {};

    // Dynamically assign file filters based on field type
    fields.forEach(field => {
        if (field.type === 'image') {
            fileFilters[field.name] = imageFilter;
        } else if (field.type === 'pdf') {
            fileFilters[field.name] = pdfFilter;
        }
    });

    const upload = multer({
        storage,
        limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
        fileFilter: (req, file, cb) => {
            const filter = fileFilters[file.fieldname];
            if (filter) {
                filter(req, file, cb);
            } else {
                cb(new APIError(400, "❌ Invalid file type!"));
            }
        },
    });

    return upload.fields(fields.map(field => ({ name: field.name, maxCount: field.maxCount || 1 })));
};

export { uploadFile, uploadFiles };

