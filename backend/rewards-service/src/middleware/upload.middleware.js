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
      cb(null, `reward-${uniqueSuffix}${ext}`);
    },
  });
};

// Configure multer storage based on environment
const storage = createLocalStorage();

// File filter for images
const fileFilter = (req, file, cb) => {
  // Accept images only
  if (!file.originalname.match(/\.(jpg|jpeg|png|gif|webp)$/i)) {
    return cb(new Error("Only image files are allowed! (jpg, jpeg, png, gif, webp)"), false);
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

// Helper function to get file URL
const getFileUrl = (filename) => {
  if (!filename) return null;

  const baseUrl =
    process.env.NODE_ENV === "production"
      ? process.env.PRODUCTION_FILE_STORAGE_URL
      : process.env.FILE_STORAGE_URL ||
        `http://localhost:${process.env.REWARDS_PORT || 3005}/uploads`;

  return `${baseUrl}/${filename}`;
};

// Export middleware
module.exports = {
  uploadSingle: upload.single("image"),
  uploadMultiple: upload.array("images", 5), // Max 5 files
  getFileUrl,
  // Error handler for multer errors
  handleUploadError: (err, req, res, next) => {
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({
          success: false,
          message: "File too large. Maximum size is 5MB.",
        });
      }
      if (err.code === 'LIMIT_FILE_COUNT') {
        return res.status(400).json({
          success: false,
          message: "Too many files. Maximum is 5 files.",
        });
      }
    }
    
    if (err.message.includes("Only image files are allowed")) {
      return res.status(400).json({
        success: false,
        message: err.message,
      });
    }

    next(err);
  }
}; 