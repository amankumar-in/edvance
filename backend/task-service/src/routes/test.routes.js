const express = require("express");
const router = express.Router();
const testController = require("../controllers/test.controller");
const authMiddleware = require("../middleware/auth.middleware");

// Special route without authentication for testing visibility
// GET /api/test/visibility/:taskId/:studentId - Test visibility check without auth
router.get("/visibility/:taskId/:studentId", testController.testVisibilityCheck);

// POST /api/test/school-control - Test school control without auth
router.post("/school-control", testController.testSchoolControl);

// POST /api/test/multi-child - Test multi-child parent control without auth
router.post("/multi-child", testController.testMultiChildControl);

// Apply authentication middleware to all other routes
router.use(authMiddleware.verifyToken);

/**
 * Test Routes for New Task Management Models
 * These routes are for testing the new models during development
 */

// POST /api/test/task - Create a test task with new schema
router.post("/task", testController.createTestTask);

// POST /api/test/assignment - Create a test task assignment
router.post("/assignment", testController.createTestAssignment);

// POST /api/test/visibility - Create a test visibility control
router.post("/visibility", testController.createTestVisibilityControl);

// GET /api/test/data - Get all test data
router.get("/data", testController.getTestData);

// DELETE /api/test/cleanup - Clean up test data
router.delete("/cleanup", testController.cleanupTestData);

module.exports = router;