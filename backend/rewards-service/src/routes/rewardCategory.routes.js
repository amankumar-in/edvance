// src/routes/rewardCategory.routes.js
const express = require("express");
const router = express.Router();
const rewardCategoryController = require("../controllers/rewardCategory.controller");
const {
  authMiddleware,
  authorizeRoles,
} = require("../middleware/auth.middleware");

/**
 * @openapi
 * components:
 *   schemas:
 *     RewardCategory:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           description: Unique identifier for the category
 *         name:
 *           type: string
 *           description: Name of the category
 *         description:
 *           type: string
 *           description: Detailed description of the category
 *         icon:
 *           type: string
 *           description: Icon or emoji for the category
 *         color:
 *           type: string
 *           description: Color for UI representation
 *         parentCategory:
 *           type: string
 *           description: ID of parent category if this is a subcategory
 *         createdBy:
 *           type: string
 *           description: ID of the user who created the category
 *         creatorRole:
 *           type: string
 *           enum: [parent, teacher, school_admin, social_worker, platform_admin, system]
 *           description: Role of the creator
 *         type:
 *           type: string
 *           enum: [family, school, sponsor, custom]
 *           description: Type of category
 *         subcategoryType:
 *           type: string
 *           enum: [privilege, item, experience, digital, custom]
 *           description: Subcategory type
 *         schoolId:
 *           type: string
 *           description: ID of the school (for school-specific categories)
 *         minPointValue:
 *           type: number
 *           description: Minimum recommended point value for rewards in this category
 *         maxPointValue:
 *           type: number
 *           description: Maximum recommended point value for rewards in this category
 *         isSystem:
 *           type: boolean
 *           description: Whether this is a system category that cannot be modified
 *         visibility:
 *           type: string
 *           enum: [private, family, class, school, public]
 *           description: Who can see and use this category
 *         displayOrder:
 *           type: number
 *           description: Ordering for display
 *         isActive:
 *           type: boolean
 *           description: Whether this category is active
 *         isDeleted:
 *           type: boolean
 *           description: Whether this category is deleted (soft delete)
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Creation timestamp
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: Last update timestamp
 *     RewardCategoryCreate:
 *       type: object
 *       required:
 *         - name
 *         - type
 *       properties:
 *         name:
 *           type: string
 *           example: "Extra Playtime"
 *         description:
 *           type: string
 *           example: "Additional recreational time as a reward"
 *         icon:
 *           type: string
 *           example: "game"
 *         color:
 *           type: string
 *           example: "#4285F4"
 *         parentCategory:
 *           type: string
 *           example: "60f8a9b5e6b3f32f8c9a8d7e"
 *         type:
 *           type: string
 *           enum: [family, school, sponsor, custom]
 *           example: "family"
 *         subcategoryType:
 *           type: string
 *           enum: [privilege, item, experience, digital, custom]
 *           example: "privilege"
 *         schoolId:
 *           type: string
 *           example: "60f8a9b5e6b3f32f8c9a8d7e"
 *         minPointValue:
 *           type: number
 *           example: 10
 *         maxPointValue:
 *           type: number
 *           example: 100
 *         visibility:
 *           type: string
 *           enum: [private, family, class, school, public]
 *           example: "family"
 *         displayOrder:
 *           type: number
 *           example: 10
 *     RewardCategoryUpdate:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *         description:
 *           type: string
 *         icon:
 *           type: string
 *         color:
 *           type: string
 *         parentCategory:
 *           type: string
 *         type:
 *           type: string
 *           enum: [family, school, sponsor, custom]
 *         subcategoryType:
 *           type: string
 *           enum: [privilege, item, experience, digital, custom]
 *         schoolId:
 *           type: string
 *         minPointValue:
 *           type: number
 *         maxPointValue:
 *           type: number
 *         visibility:
 *           type: string
 *           enum: [private, family, class, school, public]
 *         displayOrder:
 *           type: number
 *         isActive:
 *           type: boolean
 *     RewardCategoryHierarchy:
 *       type: object
 *       properties:
 *         category:
 *           $ref: '#/components/schemas/RewardCategory'
 *         subcategories:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/RewardCategory'
 */

// All routes require authentication
router.use(authMiddleware);

/**
 * @openapi
 * /rewards/categories:
 *   post:
 *     summary: Create a new reward category
 *     description: Creates a new category for organizing rewards
 *     tags:
 *       - Reward Categories
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       description: Category details
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RewardCategoryCreate'
 *     responses:
 *       '201':
 *         description: Category created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Category created successfully"
 *                 data:
 *                   $ref: '#/components/schemas/RewardCategory'
 *       '400':
 *         description: Missing required fields or category with same name already exists
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Missing required fields: name and type are required"
 *       '403':
 *         description: Not authorized to create reward categories
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Not authorized to create reward categories"
 *       '500':
 *         description: Failed to create category
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Failed to create category"
 *                 error:
 *                   type: string
 */
router.post("/", rewardCategoryController.createCategory);

/**
 * @openapi
 * /rewards/categories/{id}:
 *   get:
 *     summary: Get a specific reward category by ID
 *     description: Retrieves detailed information about a reward category by its ID
 *     tags:
 *       - Reward Categories
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         description: ID of the category to retrieve
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       '200':
 *         description: Category retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/RewardCategory'
 *       '400':
 *         description: Invalid category ID format
 *       '403':
 *         description: Not authorized to view this category
 *       '404':
 *         description: Category not found
 *       '500':
 *         description: Failed to get category
 */
router.get("/:id", rewardCategoryController.getCategoryById);

/**
 * @openapi
 * /rewards/categories/{id}:
 *   put:
 *     summary: Update a reward category
 *     description: Updates a reward category with the provided details
 *     tags:
 *       - Reward Categories
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         description: ID of the category to update
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       description: Updated category details
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RewardCategoryUpdate'
 *     responses:
 *       '200':
 *         description: Category updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Category updated successfully"
 *                 data:
 *                   $ref: '#/components/schemas/RewardCategory'
 *       '400':
 *         description: Invalid category ID format
 *       '403':
 *         description: Not authorized to update this category or system categories cannot be modified
 *       '404':
 *         description: Category not found
 *       '500':
 *         description: Failed to update category
 */
router.put("/:id", rewardCategoryController.updateCategory);

/**
 * @openapi
 * /rewards/categories/{id}:
 *   delete:
 *     summary: Delete a reward category (soft delete)
 *     description: Marks a reward category as deleted (soft delete)
 *     tags:
 *       - Reward Categories
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         description: ID of the category to delete
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       '200':
 *         description: Category deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Category deleted successfully"
 *       '400':
 *         description: Invalid category ID format
 *       '403':
 *         description: Not authorized to delete this category or system categories cannot be deleted
 *       '404':
 *         description: Category not found
 *       '500':
 *         description: Failed to delete category
 */
router.delete("/:id", rewardCategoryController.deleteCategory);

/**
 * @openapi
 * /rewards/categories:
 *   get:
 *     summary: Get reward categories with filtering
 *     description: Retrieves reward categories based on various filter criteria
 *     tags:
 *       - Reward Categories
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: type
 *         in: query
 *         description: Category type
 *         schema:
 *           type: string
 *           enum: [family, school, sponsor, custom]
 *       - name: subcategoryType
 *         in: query
 *         description: Subcategory type
 *         schema:
 *           type: string
 *           enum: [privilege, item, experience, digital, custom]
 *       - name: createdBy
 *         in: query
 *         description: ID of user who created categories
 *         schema:
 *           type: string
 *       - name: visibility
 *         in: query
 *         description: Category visibility
 *         schema:
 *           type: string
 *           enum: [private, family, class, school, public]
 *       - name: schoolId
 *         in: query
 *         description: Filter by school ID
 *         schema:
 *           type: string
 *       - name: isSystem
 *         in: query
 *         description: Filter system categories
 *         schema:
 *           type: boolean
 *       - name: search
 *         in: query
 *         description: Search by name
 *         schema:
 *           type: string
 *       - name: page
 *         in: query
 *         description: Page number for pagination
 *         schema:
 *           type: integer
 *           default: 1
 *       - name: limit
 *         in: query
 *         description: Number of items per page
 *         schema:
 *           type: integer
 *           default: 50
 *     responses:
 *       '200':
 *         description: Categories retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     categories:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/RewardCategory'
 *                     pagination:
 *                       type: object
 *                       properties:
 *                         total:
 *                           type: integer
 *                           example: 45
 *                         page:
 *                           type: integer
 *                           example: 1
 *                         limit:
 *                           type: integer
 *                           example: 50
 *                         pages:
 *                           type: integer
 *                           example: 1
 *       '500':
 *         description: Failed to get categories
 */
router.get("/", rewardCategoryController.getCategories);

/**
 * @openapi
 * /rewards/categories/defaults:
 *   post:
 *     summary: Create default system categories
 *     description: Initializes the system with default reward categories. Only platform admins can perform this action.
 *     tags:
 *       - Reward Categories
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       '200':
 *         description: Default categories initialized successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Default categories initialized: 9 created, 0 already existed"
 *       '403':
 *         description: Only platform administrators can create system categories
 *       '500':
 *         description: Failed to create default categories
 */
router.post(
  "/defaults",
  authorizeRoles("platform_admin"),
  rewardCategoryController.createDefaultCategories
);

/**
 * @openapi
 * /rewards/categories/hierarchy:
 *   get:
 *     summary: Get hierarchical category structure
 *     description: Retrieves reward categories in a hierarchical structure with parent-child relationships
 *     tags:
 *       - Reward Categories
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: type
 *         in: query
 *         description: Filter by category type
 *         schema:
 *           type: string
 *           enum: [family, school, sponsor, custom]
 *     responses:
 *       '200':
 *         description: Category hierarchy retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/RewardCategoryHierarchy'
 *       '500':
 *         description: Failed to get category hierarchy
 */
router.get("/hierarchy", rewardCategoryController.getCategoryHierarchy);

module.exports = router;
