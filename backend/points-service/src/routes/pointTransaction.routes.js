const express = require("express");
const pointTransactionController = require("../controllers/pointTransaction.controller");
const authMiddleware = require("../middleware/auth.middleware");

const router = express.Router();

// Create a transaction (award or deduct points)
router.post(
  "/",
  authMiddleware.verifyToken,
  pointTransactionController.createTransaction
);

// Get transaction by ID
router.get(
  "/:id",
  authMiddleware.verifyToken,
  pointTransactionController.getTransactionById
);

// Get transactions by source (e.g., task, attendance)
router.get(
  "/source/:source/:sourceId",
  authMiddleware.verifyToken,
  pointTransactionController.getTransactionsBySource
);

// Get student transactions (with filters)
router.get(
  "/student/:studentId",
  authMiddleware.verifyToken,
  pointTransactionController.getStudentTransactions
);

// Get student transaction summary
router.get(
  "/student/:studentId/summary",
  authMiddleware.verifyToken,
  pointTransactionController.getStudentTransactionSummary
);

// Reverse a transaction
router.post(
  "/:transactionId/reverse",
  authMiddleware.verifyToken,
  authMiddleware.checkRole(["platform_admin", "school_admin"]),
  pointTransactionController.reverseTransaction
);

// visualization
router.get(
  "/visualization/timeseries",
  authMiddleware.verifyToken,
  pointTransactionController.getPointsTimeSeriesData
);

// categories
router.get(
  "/analysis/categories",
  authMiddleware.verifyToken,
  pointTransactionController.getCategoryAnalysis
);
module.exports = router;
