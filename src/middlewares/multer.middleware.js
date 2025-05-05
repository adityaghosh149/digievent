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
const fileTypeFilters = {
    image: imageFilter,
    pdf: pdfFilter,
};

const uploadFile = (fieldName, type, optional = false) => {
    if (!fieldName || !type) {
        throw new Error("❌ 'fieldName' and 'type' are required parameters.");
    }

    const fileFilter = fileTypeFilters[type];
    if (!fileFilter) {
        throw new Error(`❌ Unsupported file type: ${type}`);
    }

    const upload = multer({
        storage,
        limits: { fileSize: 10 * 1024 * 1024 },
        fileFilter,
    }).single(fieldName);

    return (req, res, next) => {
        upload(req, res, (err) => {
            if (err) return next(err);

            if (!optional && !req.file) {
                return next(new APIError(400, `❌ '${fieldName}' file is required.`));
            }

            next();
        });
    };
};


// Multiple file upload function
const uploadFiles = (fields) => {
    if (!Array.isArray(fields) || fields.length === 0) {
        throw new Error("❌ 'fields' must be a non-empty array.");
    }

    const upload = multer({
        storage,
        limits: { fileSize: 10 * 1024 * 1024 },
        fileFilter: (req, file, cb) => {
            const field = fields.find(f => f.name === file.fieldname);
            const fileFilter = field ? fileTypeFilters[field.type] : null;

            if (fileFilter) {
                fileFilter(req, file, cb);
            } else {
                cb(new APIError(400, `❌ Invalid or unsupported file type for field: ${file.fieldname}`));
            }
        },
    }).fields(fields.map(field => ({ name: field.name, maxCount: field.maxCount || 1 })));

    return (req, res, next) => {
        upload(req, res, (err) => {
            if (err) return next(err);

            for (const field of fields) {
                const files = req.files?.[field.name];
                const isOptional = field.optional || false;

                if (!isOptional && (!files || files.length === 0)) {
                    return next(new APIError(400, `❌ '${field.name}' file is required.`));
                }
            }

            next();
        });
    };
};

export { uploadFile, uploadFiles };
