/**
 * Analytics Service for Univance Platform
 */

const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const mongoose = require("mongoose");
const path = require("path");
require("dotenv").config();

// Import scheduler explicitly
const schedulerService = require("./services/scheduler.service");

// Import routes
const analyticsRoutes = require("./routes/analytics.routes");
const userAnalyticsRoutes = require("./routes/userAnalytics.routes");
const taskAnalyticsRoutes = require("./routes/taskAnalytics.routes");
const pointsAnalyticsRoutes = require("./routes/pointsAnalytics.routes");
const badgeAnalyticsRoutes = require("./routes/badgeAnalytics.routes");

// Environment variables
const NODE_ENV = process.env.NODE_ENV || "development";
const PORT =
  NODE_ENV === "production"
    ? process.env.PRODUCTION_ANALYTICS_PORT
    : process.env.ANALYTICS_PORT || 3007;
const HOST =
  NODE_ENV === "production"
    ? process.env.PRODUCTION_ANALYTICS_HOST
    : process.env.ANALYTICS_HOST || "0.0.0.0";
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
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true, limit: "1mb" }));
app.use(morgan("dev"));

// Health check route
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "OK",
    message: "Analytics Service is running",
    environment: NODE_ENV,
    timestamp: new Date().toISOString(),
  });
});

// Routes with full path prefixes to match gateway routing
app.use("/api/analytics", analyticsRoutes);
app.use("/api/analytics/users", userAnalyticsRoutes);
app.use("/api/analytics/tasks", taskAnalyticsRoutes);
app.use("/api/analytics/points", pointsAnalyticsRoutes);
app.use("/api/analytics/badges", badgeAnalyticsRoutes);

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

// 404 Handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Not Found",
    path: req.originalUrl,
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error("Analytics Service Error:", err);
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

    const server = app.listen(PORT, HOST, () => {
      console.log(
        `Analytics Service running at http://${
          HOST === "0.0.0.0" ? "localhost" : HOST
        }:${PORT}`
      );
      console.log(`For network access: http://${NETWORK_IP}:${PORT}`);

      if (NODE_ENV === "production" && process.env.RENDER_EXTERNAL_URL) {
        console.log(`Production URL: ${process.env.RENDER_EXTERNAL_URL}`);
      }
    });

    // Initialize scheduler after server starts
    console.log("Initializing analytics scheduler...");
    schedulerService.initScheduler();
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
};

startServer();
