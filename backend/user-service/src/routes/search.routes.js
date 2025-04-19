const express = require("express");
const searchController = require("../controllers/search.controller");
const authMiddleware = require("../middleware/auth.middleware");

const router = express.Router();

// Search students
router.get(
  "/students",
  authMiddleware.verifyToken,
  searchController.searchStudents
);

// Search parents
router.get(
  "/parents",
  authMiddleware.verifyToken,
  searchController.searchParents
);

// Search teachers
router.get(
  "/teachers",
  authMiddleware.verifyToken,
  searchController.searchTeachers
);

// Search schools
router.get(
  "/schools",
  authMiddleware.verifyToken,
  searchController.searchSchools
);

module.exports = router;
