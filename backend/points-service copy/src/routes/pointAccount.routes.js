const express = require("express");
const pointAccountController = require("../controllers/pointAccount.controller");
const authMiddleware = require("../middleware/auth.middleware");

const router = express.Router();

// Create a new point account
router.post(
  "/",
  authMiddleware.verifyToken,
  authMiddleware.checkRole(["platform_admin", "school_admin", "student"]),
  pointAccountController.createAccount
);

// Get account by student ID
router.get(
  "/student/:studentId",
  authMiddleware.verifyToken,
  pointAccountController.getAccountByStudentId
);

// Get account balance
router.get(
  "/student/:studentId/balance",
  authMiddleware.verifyToken,
  pointAccountController.getBalance
);

// Get account level and progress
router.get(
  "/student/:studentId/level",
  authMiddleware.verifyToken,
  pointAccountController.getLevelInfo
);

// Get account transaction history
router.get(
  "/student/:studentId/history",
  authMiddleware.verifyToken,
  pointAccountController.getTransactionHistory
);

module.exports = router;
