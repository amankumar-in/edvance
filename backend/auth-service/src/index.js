const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const mongoose = require("mongoose");
require("dotenv").config();

// Import routes
const authRoutes = require("./routes/auth.routes");

// Initialize express app
const app = express();
const PORT = process.env.AUTH_PORT || 3001;
const HOST = process.env.AUTH_HOST || "0.0.0.0"; // Listen on all network interfaces

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

// Routes
app.get("/health", (req, res) => {
  res.status(200).json({ status: "OK", message: "Auth Service is running" });
});

app.use("/api/auth", authRoutes);

// MongoDB connection
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB connected successfully");
  } catch (error) {
    console.error("MongoDB connection error:", error);
    process.exit(1);
  }
};

// Start the server
const startServer = async () => {
  await connectDB();
  app.listen(PORT, HOST, () => {
    console.log(
      `Auth Service running at http://${
        HOST === "0.0.0.0" ? "localhost" : HOST
      }:${PORT}`
    );
    console.log(
      `For network access: http://${
        process.env.NETWORK_IP || "192.168.1.23"
      }:${PORT}`
    );
  });
};

startServer();
