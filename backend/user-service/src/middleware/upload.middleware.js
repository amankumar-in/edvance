// middleware/upload.middleware.js
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const crypto = require("crypto");

// Set up local storage for development
const createLocalStorage = () => {
  const uploadPath = process.env.FILE_STORAGE_PATH || "./uploads";

  // Create directory if it doesn't exist
  if (!fs.existsSync(uploadPath)) {
    fs.mkdirSync(uploadPath, { recursive: true });
  }

  return multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = `${Date.now()}-${crypto
        .randomBytes(6)
        .toString("hex")}`;
      const ext = path.extname(file.originalname);
      cb(null, `${uniqueSuffix}${ext}`);
    },
  });
};

// Configure multer storage based on environment
const storage = createLocalStorage();

// File filter
const fileFilter = (req, file, cb) => {
  // Accept images only
  if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
    return cb(new Error("Only image files are allowed!"), false);
  }
  cb(null, true);
};

// Upload middleware
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 1024 * 1024 * 5, // 5MB max file size
  },
  fileFilter: fileFilter,
});

// Export middleware
module.exports = {
  uploadSingle: upload.single("file"),
  uploadMultiple: upload.array("files", 5), // Max 5 files
  getFileUrl: (filename) => {
    if (!filename) return null;

    const baseUrl =
      process.env.NODE_ENV === "production"
        ? `https://${process.env.PRODUCTION_CLOUD_STORAGE_BUCKET}.storage.googleapis.com`
        : process.env.FILE_STORAGE_URL ||
          `http://localhost:${process.env.USER_PORT}/uploads`;

    return `${baseUrl}/${filename}`;
  },
};
