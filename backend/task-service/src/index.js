const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const mongoose = require("mongoose");
require("dotenv").config();

// Import routes
const taskRoutes = require("./routes/task.routes");
const taskCategoryRoutes = require("./routes/taskCategory.routes");
const taskTemplateRoutes = require("./routes/taskTemplate.routes");
const testRoutes = require("./routes/test.routes");
const taskManagementRoutes = require("./routes/taskManagement.routes");

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
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

// Health check route
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "OK",
    message: "Task Service is running",
    environment: NODE_ENV,
  });
});

// API Routes - mount specific routes before general ones
app.use("/api/tasks/categories", taskCategoryRoutes);
app.use("/api/tasks/templates", taskTemplateRoutes);
app.use("/api/test", testRoutes);
app.use("/api/task-management", taskManagementRoutes);
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
