import multer from "multer";
import { v2 as cloudinary } from "cloudinary";

// ── Cloudinary configuration ──────────────────────────────────────────────────
function ensureCloudinaryConfigured() {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
}

ensureCloudinaryConfigured();

// ── Memory storage — file arrives as req.file.buffer (no disk, no adapter) ───
const storage = multer.memoryStorage();

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

/**
 * Upload a Buffer to Cloudinary as a raw (non-image) resource.
 *
 * @param {Buffer}  buffer       - Raw PDF bytes
 * @param {string}  originalName - Original filename (used for public_id)
 * @returns {Promise<string>}    - Cloudinary secure_url
 */
export function uploadBufferToCloudinary(buffer, originalName) {
  return new Promise((resolve, reject) => {
    ensureCloudinaryConfigured();

    const nameWithoutExt = originalName.replace(/\.pdf$/i, "");
    const publicId = `forum-rag-documents/${Date.now()}-${nameWithoutExt}`;

    const uploadStream = cloudinary.uploader.upload_stream(
      {
        resource_type: "raw",
        public_id: publicId,
        format: "pdf",
        access_mode: "public",   // allow direct browser fetch without signed URL
      },
      (error, result) => {
        if (error) return reject(error);
        resolve(result.secure_url);
      },
    );

    uploadStream.end(buffer);
  });
}

// Exported so rag.service.js can call cloudinary.uploader.destroy for deletions
export { cloudinary };
