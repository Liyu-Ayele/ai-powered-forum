import multer from "multer";
import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";

// ── Cloudinary configuration (shared with avatar upload) ──────────────────────
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// ── Cloudinary storage for PDFs ───────────────────────────────────────────────
// resource_type "raw" is required for non-image files such as PDFs.
const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder:        "forum-rag-documents",
    resource_type: "raw",
    allowed_formats: ["pdf"],
    // Keep the original filename (without extension) as the public_id so that
    // Cloudinary doesn't add an extra extension suffix.
    public_id: (req, file) => {
      const nameWithoutExt = file.originalname.replace(/\.pdf$/i, "");
      return `${Date.now()}-${nameWithoutExt}`;
    },
  },
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype !== "application/pdf") {
    return cb(new Error("Only PDF files are allowed"));
  }
  cb(null, true);
};

const maxSize = (process.env.RAG_MAX_UPLOAD_MB || 50) * 1024 * 1024;

export const uploadDocument = multer({
  storage,
  fileFilter,
  limits: { fileSize: maxSize },
});

export const createDocumentMulterErrorHandler = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    return res.status(400).json({ success: false, message: err.message });
  }
  next(err);
};

// Export the configured cloudinary instance so other modules (rag.service.js)
// can use it for deletion without re-configuring.
export { cloudinary };
