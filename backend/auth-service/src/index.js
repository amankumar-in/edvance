const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const mongoose = require("mongoose");
const rateLimit = require("express-rate-limit");
require("dotenv").config();

// Import routes
const authRoutes = require("./routes/auth.routes");

// Environment variables
const NODE_ENV = process.env.NODE_ENV || "development";
const PORT =
  NODE_ENV === "production"
    ? process.env.PRODUCTION_AUTH_PORT
    : process.env.AUTH_PORT || 3001;
const HOST =
  NODE_ENV === "production"
    ? process.env.PRODUCTION_AUTH_HOST
    : process.env.AUTH_HOST || "0.0.0.0";
const NETWORK_IP = process.env.NETWORK_IP || "192.168.1.23";
const MONGO_URI =
  NODE_ENV === "production"
    ? process.env.PRODUCTION_MONGO_URI
    : process.env.MONGO_URI;

// Initialize express app
const app = express();

// Security middleware
app.use(helmet()); // Set various HTTP headers for security
app.use(cors({
  origin: NODE_ENV === "production" 
    ? [process.env.PRODUCTION_URL, /\.univance\.com$/] 
    : "*",
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

// Apply rate limiting to all requests
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many requests, please try again later."
  }
});
app.use(limiter);

// Stricter rate limit for auth endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200000, // Limit each IP to 20 auth requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many authentication attempts, please try again later."
  }
});

// Parse JSON requests
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true, limit: "1mb" }));

// Request logging
const morganFormat = NODE_ENV === "production" ? "combined" : "dev";
app.use(morgan(morganFormat));

// Health check endpoint
app.get("/health", (req, res) => {
  const mongoStatus = mongoose.connection.readyState === 1 ? "connected" : "disconnected";
  
  res.status(200).json({
    success: true,
    message: "Auth Service is running",
    environment: NODE_ENV,
    mongodb: mongoStatus,
    timestamp: new Date().toISOString()
  });
});

// API routes
app.use("/api/auth", authLimiter, authRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Endpoint not found"
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error("Auth Service Error:", err);
  
  // Log detailed error in development
  if (NODE_ENV === "development") {
    console.error(err.stack);
  }
  
  // Handle specific known errors
  if (err.name === "ValidationError") {
    return res.status(400).json({
      success: false,
      message: "Validation Error",
      errors: Object.values(err.errors).map(e => e.message)
    });
  }
  
  if (err.name === "MongoServerError" && err.code === 11000) {
    return res.status(400).json({
      success: false,
      message: "Duplicate key error",
      field: Object.keys(err.keyValue)[0]
    });
  }
  
  // Generic error response
  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal Server Error",
    error: NODE_ENV === "development" ? err.stack : undefined
  });
});

// MongoDB connection with retry logic
const connectDB = async (retries = 5, delay = 5000) => {
  try {
    await mongoose.connect(MONGO_URI, {
      // These options are no longer needed in newer Mongoose versions,
      // but kept for compatibility
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log("MongoDB connected successfully");
    return true;
  } catch (error) {
    if (retries === 0) {
      console.error("MongoDB connection failed after multiple attempts:", error);
      return false;
    }
    
    console.log(`MongoDB connection attempt failed. Retrying in ${delay/1000} seconds...`);
    await new Promise(resolve => setTimeout(resolve, delay));
    return connectDB(retries - 1, delay);
  }
};

// Flag to prevent multiple shutdown attempts
let isShuttingDown = false;

// Graceful shutdown function
const gracefulShutdown = () => {
  // Prevent multiple calls
  if (isShuttingDown) {
    console.log("Shutdown already in progress...");
    return;
  }
  
  isShuttingDown = true;
  console.log("Shutting down gracefully...");
  
  try {
    // Only attempt to close server if it exists and has a close method
    if (server && typeof server.close === 'function') {
      server.close(() => {
        console.log("HTTP server closed");
        
        // Close database connection if connected
        if (mongoose.connection.readyState === 1) {
          mongoose.connection.close(false)
            .then(() => {
              console.log("MongoDB connection closed");
              process.exit(0);
            })
            .catch(err => {
              console.error("Error closing MongoDB connection:", err);
              process.exit(1);
            });
        } else {
          console.log("No active MongoDB connection to close");
          process.exit(0);
        }
      });
    } else {
      console.log("No HTTP server to close");
      process.exit(0);
    }
    
    // Force close after timeout
    setTimeout(() => {
      console.error("Could not close connections in time, forcefully shutting down");
      process.exit(1);
    }, 10000);
  } catch (err) {
    console.error("Error during shutdown:", err);
    process.exit(1);
  }
};

// Define server variable at a global scope
let server;

// Start the server
const startServer = async () => {
  try {
    console.log(`Environment: ${NODE_ENV}`);
    console.log("Attempting to connect to MongoDB...");
    
    const connected = await connectDB();
    if (!connected) {
      console.error("Failed to connect to MongoDB after multiple attempts. Exiting...");
      process.exit(1);
    }
    
    console.log("Starting server...");
    
    // Assign to the global server variable
    server = app.listen(PORT, HOST, () => {
      const displayHost = HOST === "0.0.0.0" ? "localhost" : HOST;
      console.log(`Auth Service running at http://${displayHost}:${PORT}`);
      console.log(`For network access: http://${NETWORK_IP}:${PORT}`);
      
      if (NODE_ENV === "production" && process.env.RENDER_EXTERNAL_URL) {
        console.log(`Production URL: ${process.env.RENDER_EXTERNAL_URL}`);
      }
    });
    
    // Handle uncaught exceptions
    process.on("uncaughtException", (error) => {
      console.error("Uncaught Exception:", error);
      gracefulShutdown();
    });
    
    // Handle unhandled promise rejections
    process.on("unhandledRejection", (reason, promise) => {
      console.error("Unhandled Rejection at:", promise, "reason:", reason);
      gracefulShutdown();
    });
    
    // Handle termination signals
    process.on("SIGTERM", gracefulShutdown);
    process.on("SIGINT", gracefulShutdown);
    
    return server;
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
};

// Only start server if this file is run directly (not imported)
if (require.main === module) {
  startServer().catch(err => {
    console.error("Failed to start server:", err);
    process.exit(1);
  });
}

// Export for testing
module.exports = { app, startServer };