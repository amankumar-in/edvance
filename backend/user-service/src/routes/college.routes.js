const express = require("express");
const {
  getAllColleges,
  getCollegeById,
  createCollege,
  updateCollege,
  deleteCollege,
  getFeaturedColleges,
  toggleFeaturedStatus,
  updateCollegeStatus
} = require("../controllers/college.controller");
const authMiddleware = require("../middleware/auth.middleware");
const uploadMiddleware = require("../middleware/upload.middleware");

const router = express.Router();

router.use(authMiddleware.verifyToken);

// Public routes
router.get("/", getAllColleges);
router.get("/featured", getFeaturedColleges);
router.get("/:id", getCollegeById);

// Private routes (Admin only - add authentication middleware as needed)
router.use(authMiddleware.checkRole(["platform_admin"]))

router.post("/", uploadMiddleware.uploadCollegeFiles, createCollege);
router.put("/:id", uploadMiddleware.uploadCollegeFiles, updateCollege);
router.delete("/:id", deleteCollege);
router.patch("/:id/featured", toggleFeaturedStatus);
router.patch("/:id/status", updateCollegeStatus);

module.exports = router;