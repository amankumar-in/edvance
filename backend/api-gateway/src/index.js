/**
 * API Gateway for Univance Platform
 */

const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const { createProxyMiddleware } = require("http-proxy-middleware");
require("dotenv").config();
const swaggerUi = require("swagger-ui-express");
const swaggerSpec = require("./swagger"); // the file you just created

// Environment variables
const NODE_ENV = process.env.NODE_ENV || "development";
const PORT =
  NODE_ENV === "production"
    ? process.env.PRODUCTION_API_PORT
    : process.env.API_PORT || 3000;
const HOST =
  NODE_ENV === "production"
    ? process.env.PRODUCTION_API_HOST
    : process.env.API_HOST || "0.0.0.0";
const NETWORK_IP = process.env.NETWORK_IP || "192.168.1.23";

// Get service URLs directly from environment variables
const AUTH_SERVICE_URL =
  NODE_ENV === "production"
    ? process.env.PRODUCTION_AUTH_SERVICE_URL
    : process.env.AUTH_SERVICE_URL;

const USER_SERVICE_URL =
  NODE_ENV === "production"
    ? process.env.PRODUCTION_USER_SERVICE_URL
    : process.env.USER_SERVICE_URL;

const TASK_SERVICE_URL =
  NODE_ENV === "production"
    ? process.env.PRODUCTION_TASK_SERVICE_URL
    : process.env.TASK_SERVICE_URL;

const POINTS_SERVICE_URL =
  NODE_ENV === "production"
    ? process.env.PRODUCTION_POINTS_SERVICE_URL
    : process.env.POINTS_SERVICE_URL;

const REWARDS_SERVICE_URL =
  NODE_ENV === "production"
    ? process.env.PRODUCTION_REWARDS_SERVICE_URL
    : process.env.REWARDS_SERVICE_URL;

const NOTIFICATION_SERVICE_URL =
  NODE_ENV === "production"
    ? process.env.PRODUCTION_NOTIFICATION_SERVICE_URL
    : process.env.NOTIFICATION_SERVICE_URL;

const ANALYTICS_SERVICE_URL =
  NODE_ENV === "production"
    ? process.env.PRODUCTION_ANALYTICS_SERVICE_URL
    : process.env.ANALYTICS_SERVICE_URL;

// Initialize express app
const app = express();

// Middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));
app.use(cors({
  origin: true, // Allow all origins in development
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'X-Role'],
}));
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true, limit: "1mb" }));
app.use(morgan("dev"));

// Serve the Swagger UI at http://localhost:<PORT>/docs
app.use("/devdocs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Optional: serve the raw JSON at /docs/swagger.json
app.get("/docs/swagger.json", (req, res) => {
  res.setHeader("Content-Type", "application/json");
  res.send(swaggerSpec);
});

// Health check endpoint
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "OK",
    message: "API Gateway is running",
    environment: NODE_ENV,
    timestamp: new Date().toISOString(),
  });
});

// Log configured services
console.log("Configured services:");
console.log("AUTH_SERVICE_URL:", AUTH_SERVICE_URL);
console.log("USER_SERVICE_URL:", USER_SERVICE_URL);
console.log("TASK_SERVICE_URL:", TASK_SERVICE_URL);
console.log("POINTS_SERVICE_URL:", POINTS_SERVICE_URL);
console.log("REWARDS_SERVICE_URL:", REWARDS_SERVICE_URL);
console.log("NOTIFICATION_SERVICE_URL:", NOTIFICATION_SERVICE_URL);
console.log("ANALYTICS_SERVICE_URL:", ANALYTICS_SERVICE_URL);

// Helper function for proxy configuration
const createServiceProxy = (path, targetUrl) => {
  if (targetUrl) {
    app.use(
      path,
      createProxyMiddleware({
        target: targetUrl,
        changeOrigin: true,
        onProxyReq: (proxyReq, req) => {
          if (req.headers["content-type"]?.includes("application/json")) {
            // stringify even {} so Content-Length matches
            const bodyData = JSON.stringify(req.body ?? {});
            proxyReq.setHeader("Content-Type", "application/json");
            proxyReq.setHeader("Content-Length", Buffer.byteLength(bodyData));
            proxyReq.write(bodyData);
          }
        },
        onProxyRes: (proxyRes, req, res) => {
          // Ensure CORS headers are set for all responses
          proxyRes.headers['Access-Control-Allow-Origin'] = '*';
          proxyRes.headers['Access-Control-Allow-Methods'] = 'GET, POST, PUT, DELETE, OPTIONS';
          proxyRes.headers['Access-Control-Allow-Headers'] = 'Origin, X-Requested-With, Content-Type, Accept, Authorization';
          proxyRes.headers['Cross-Origin-Resource-Policy'] = 'cross-origin';
        },
        onError: (err, req, res) => {
          console.error(`Proxy Error (${path}):`, err);
          res.status(502).json({
            success: false,
            message: "Service currently unavailable",
            error: NODE_ENV === "development" ? err.message : undefined,
          });
        },
      })
    );
    console.log(`Proxy configured for ${path} -> ${targetUrl}`);
  } else {
    console.log(`Warning: No target URL configured for ${path}`);
  }
};

// Configure all services
createServiceProxy("/api/auth", AUTH_SERVICE_URL);
createServiceProxy("/api/users", USER_SERVICE_URL);
createServiceProxy("/api/students", USER_SERVICE_URL);
createServiceProxy("/api/parents", USER_SERVICE_URL);
createServiceProxy("/api/teachers", USER_SERVICE_URL);
createServiceProxy("/api/attendance", USER_SERVICE_URL);
createServiceProxy("/api/link-requests", USER_SERVICE_URL);
createServiceProxy("/api/badges", USER_SERVICE_URL);
createServiceProxy("/api/classes", USER_SERVICE_URL);
createServiceProxy("/api/search", USER_SERVICE_URL);
createServiceProxy("/api/social-workers", USER_SERVICE_URL);
createServiceProxy("/api/class-attendance", USER_SERVICE_URL);

createServiceProxy("/api/tasks", TASK_SERVICE_URL);
createServiceProxy("/api/points", POINTS_SERVICE_URL);
createServiceProxy("/api/rewards", REWARDS_SERVICE_URL);
createServiceProxy("/api/notifications", NOTIFICATION_SERVICE_URL);
createServiceProxy("/api/schools", USER_SERVICE_URL);
// Configure analytics service routes
createServiceProxy("/api/analytics", ANALYTICS_SERVICE_URL);

// 404 Handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Not Found",
    path: req.originalUrl,
  });
});

// Error Handler
app.use((err, req, res, next) => {
  console.error("API Gateway Error:", err);
  res.status(500).json({
    success: false,
    message: "Internal Server Error",
    error: NODE_ENV === "development" ? err.message : undefined,
  });
});

// Start server
app.listen(PORT, HOST, () => {
  console.log(`Environment: ${NODE_ENV}`);
  console.log(
    `API Gateway running at http://${
      HOST === "0.0.0.0" ? "localhost" : HOST
    }:${PORT}`
  );
  console.log(`For network access: http://${NETWORK_IP}:${PORT}`);

  if (NODE_ENV === "production" && process.env.RENDER_EXTERNAL_URL) {
    console.log(`Production URL: ${process.env.RENDER_EXTERNAL_URL}`);
  }
});
