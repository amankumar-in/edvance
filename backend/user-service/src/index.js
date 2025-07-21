const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const mongoose = require("mongoose");
const path = require("path");

require("dotenv").config();

// Import routes
const userRoutes = require("./routes/user.routes");
const studentRoutes = require("./routes/student.routes");
const parentRoutes = require("./routes/parent.routes");
const teacherRoutes = require("./routes/teacher.routes");
const socialWorkerRoutes = require("./routes/socialWorker.routes");
const schoolRoutes = require("./routes/school.routes");
const badgeRoutes = require("./routes/badge.routes");
const attendanceRoutes = require("./routes/attendance.routes");
const schoolClassRoutes = require("./routes/schoolClass.routes");
const searchRoutes = require("./routes/search.routes");
const linkRequestRoutes = require("./routes/linkRequest.routes");
const classAttendanceRoutes = require("./routes/classAttendance.routes");

// Environment variables
const NODE_ENV = process.env.NODE_ENV || "development";
const PORT =
  NODE_ENV === "production"
    ? process.env.PRODUCTION_USER_PORT
    : process.env.USER_PORT || 3002;
const HOST =
  NODE_ENV === "production"
    ? process.env.PRODUCTION_USER_HOST
    : process.env.USER_HOST || "0.0.0.0";
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

// Routes
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "OK",
    message: "User Service is running",
    environment: NODE_ENV,
  });
});

app.use("/api/users", userRoutes);
app.use("/api/students", studentRoutes);
app.use("/api/parents", parentRoutes);
app.use("/api/teachers", teacherRoutes);
app.use("/api/social-workers", socialWorkerRoutes);
app.use("/api/schools", schoolRoutes);
app.use("/api/badges", badgeRoutes);
app.use("/api/attendance", attendanceRoutes);
app.use("/api/classes", schoolClassRoutes);
app.use("/api/search", searchRoutes);
app.use("/api/link-requests", linkRequestRoutes);
app.use("/api/class-attendance", classAttendanceRoutes);

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

// Serve uploaded files in development mode
if (process.env.NODE_ENV !== "production") {
  app.use("/uploads", express.static(path.join(__dirname, "../uploads")));
}
// Error handling middleware
app.use((err, req, res, next) => {
  console.error("User Service Error:", err);
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
        `User Service running at http://${
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
