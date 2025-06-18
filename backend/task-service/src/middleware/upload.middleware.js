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
      const prefix = file.fieldname === 'attachments' ? 'task-attachment' : 'task-file';
      cb(null, `${prefix}-${uniqueSuffix}${ext}`);
    },
  });
};

// Configure multer storage based on environment
const storage = createLocalStorage();

// File filter for task attachments
const fileFilter = (req, file, cb) => {
  // Accept images, documents, and videos
  const allowedTypes = /\.(jpg|jpeg|png|gif|pdf|doc|docx|txt|mp4|mov|avi|mkv)$/;
  
  if (!file.originalname.match(allowedTypes)) {
    return cb(new Error("File type not allowed! Supported: images, PDFs, documents, videos"), false);
  }
  cb(null, true);
};

// Upload middleware
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 1024 * 1024 * 10, // 10MB max file size
  },
  fileFilter: fileFilter,
});

// Export middleware
module.exports = {
  uploadSingle: upload.single("attachment"),
  uploadMultiple: upload.array("attachments", 5), // Max 5 files
  getFileUrl: (filename) => {
    if (!filename) return null;

    const baseUrl =
      process.env.NODE_ENV === "production"
        ? `https://${process.env.PRODUCTION_CLOUD_STORAGE_BUCKET}.storage.googleapis.com`
        : process.env.FILE_STORAGE_URL ||
          `http://localhost:${process.env.TASK_PORT || 3003}/uploads`;

    return `${baseUrl}/${filename}`;
  },
  
  // Helper function to determine file type based on extension
  getFileType: (filename) => {
    const ext = path.extname(filename).toLowerCase();
    
    if (['.jpg', '.jpeg', '.png', '.gif'].includes(ext)) {
      return 'image';
    } else if (['.pdf', '.doc', '.docx', '.txt'].includes(ext)) {
      return 'document';
    } else if (['.mp4', '.mov', '.avi', '.mkv'].includes(ext)) {
      return 'video';
    } else {
      return 'document'; // default fallback
    }
  }
}; 