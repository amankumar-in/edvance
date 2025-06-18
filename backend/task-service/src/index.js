const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const mongoose = require("mongoose");
const path = require("path");
require("dotenv").config();

// Import routes
const taskRoutes = require("./routes/task.routes");
const taskCategoryRoutes = require("./routes/taskCategory.routes");
const taskTemplateRoutes = require("./routes/taskTemplate.routes");

// Environment variables
const NODE_ENV = process.env.NODE_ENV || "development";
const PORT =
  NODE_ENV === "production"
    ? process.env.PRODUCTION_TASK_PORT
    : process.env.TASK_PORT || 3003;
const HOST =
  NODE_ENV === "production"
    ? process.env.PRODUCTION_TASK_HOST
    : process.env.TASK_HOST || "0.0.0.0";
const NETWORK_IP = process.env.NETWORK_IP || "192.168.1.23";
const MONGO_URI =
  NODE_ENV === "production"
    ? process.env.PRODUCTION_MONGO_URI
    : process.env.MONGO_URI;

// Initialize express app
const app = express();

// Middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
  crossOriginOpenerPolicy: { policy: "same-origin-allow-popups" }
}));
app.use(cors({
  origin: [
    'http://localhost:3000',
    'http://localhost:5173',
    'http://127.0.0.1:3000',
    'http://127.0.0.1:5173',
    process.env.FRONTEND_URL
  ].filter(Boolean),
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use(morgan("dev"));

// Serve uploaded files with CORS headers
const uploadsPath = process.env.FILE_STORAGE_PATH || "./uploads";

// Handle OPTIONS requests for uploads
app.options("/uploads/*", (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
  res.sendStatus(200);
});

// Download endpoint with forced download headers
app.get("/uploads/download/:filename", (req, res) => {
  const filename = req.params.filename;
  const uploadsPath = process.env.FILE_STORAGE_PATH || "./uploads";
  const filePath = path.resolve(uploadsPath, filename);
  
  // Check if file exists
  if (!require('fs').existsSync(filePath)) {
    return res.status(404).json({ error: 'File not found' });
  }
  
  // Set headers to force download
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
  res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
  
  // Send file
  res.sendFile(filePath);
});

app.use("/uploads", (req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
  next();
}, express.static(path.resolve(uploadsPath)));

// Health check route
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "OK",
    message: "Task Service is running",
    environment: NODE_ENV,
  });
});

// API Routes - include full path prefixes to match gateway routing
app.use("/api/tasks/categories", taskCategoryRoutes);
app.use("/api/tasks/templates", taskTemplateRoutes);
app.use("/api/tasks", taskRoutes);

// MongoDB connection
const connectDB = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("MongoDB connected successfully");
  } catch (error) {
    console.error("MongoDB connection error:", error);
    process.exit(1);
  }
};

// Error handling middleware
app.use((err, req, res, next) => {
  console.error("Task Service Error:", err);
  res.status(500).json({
    success: false,
    message: "Internal Server Error",
    error: NODE_ENV === "development" ? err.message : undefined,
  });
});

// Start the server
const startServer = async () => {
  try {
    console.log(`Environment: ${NODE_ENV}`);
    console.log("Attempting to connect to MongoDB...");
    await connectDB();
    console.log("Starting server...");

    app.listen(PORT, HOST, () => {
      console.log(
        `Task Service running at http://${
          HOST === "0.0.0.0" ? "localhost" : HOST
        }:${PORT}`
      );
      console.log(`For network access: http://${NETWORK_IP}:${PORT}`);

      if (NODE_ENV === "production" && process.env.RENDER_EXTERNAL_URL) {
        console.log(`Production URL: ${process.env.RENDER_EXTERNAL_URL}`);
      }
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
};

startServer();
