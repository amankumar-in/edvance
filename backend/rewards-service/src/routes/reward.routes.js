// src/routes/reward.routes.js
const express = require("express");
const router = express.Router();
const rewardController = require("../controllers/reward.controller");
const {
  authMiddleware,
  canManageRewards,
  authorizeRoles,
} = require("../middleware/auth.middleware");
const { uploadSingle, handleUploadError } = require("../middleware/upload.middleware");

/**
 * @openapi
 * components:
 *   schemas:
 *     Reward:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           description: Unique identifier for the reward
 *         title:
 *           type: string
 *           description: Title of the reward
 *         description:
 *           type: string
 *           description: Detailed description of the reward
 *         category:
 *           type: string
 *           enum: [family, school, sponsor]
 *           description: Main category of the reward (DEPRECATED)
 *         subcategory:
 *           type: string
 *           enum: [privilege, item, experience, digital]
 *           description: Subcategory of the reward (DEPRECATED)
 *         categoryId:
 *           type: string
 *           description: Reference to RewardCategory
 *         categoryName:
 *           type: string
 *           description: Category type from RewardCategory
 *         subcategoryName:
 *           type: string
 *           description: Subcategory type from RewardCategory
 *         pointsCost:
 *           type: number
 *           description: Number of points required to redeem the reward
 *           minimum: 0
 *         creatorId:
 *           type: string
 *           description: ID of the user who created the reward
 *         creatorType:
 *           type: string
 *           enum: [parent, school, sponsor, system]
 *           description: Type of entity that created the reward
 *         schoolId:
 *           type: string
 *           description: ID of the school (for school rewards)
 *         limitedQuantity:
 *           type: boolean
 *           description: Whether the reward has limited quantity
 *           default: false
 *         quantity:
 *           type: number
 *           description: Available quantity (if limitedQuantity is true)
 *           minimum: 0
 *         expiryDate:
 *           type: string
 *           format: date-time
 *           description: Expiration date of the reward
 *         image:
 *           type: string
 *           description: URL to reward image
 *         isActive:
 *           type: boolean
 *           description: Whether the reward is currently active
 *           default: true
 *         redemptionInstructions:
 *           type: string
 *           description: Instructions for how to redeem the reward
 *         restrictions:
 *           type: string
 *           description: Any restrictions or requirements for redemption
 *         isDeleted:
 *           type: boolean
 *           description: Whether the reward has been soft deleted
 *           default: false
 *         metadata:
 *           type: object
 *           additionalProperties: true
 *           description: Additional metadata for the reward
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Creation timestamp
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: Last update timestamp
 *     RewardCreate:
 *       type: object
 *       required:
 *         - title
 *         - description
 *         - pointsCost
 *       properties:
 *         title:
 *           type: string
 *           description: Title of the reward
 *           example: "Extra Playtime"
 *         description:
 *           type: string
 *           description: Detailed description of the reward
 *           example: "30 minutes of extra playtime"
 *         category:
 *           type: string
 *           enum: [family, school, sponsor]
 *           description: Main category of the reward (DEPRECATED)
 *           example: "family"
 *         subcategory:
 *           type: string
 *           enum: [privilege, item, experience, digital]
 *           description: Subcategory of the reward (DEPRECATED)
 *           example: "privilege"
 *         categoryId:
 *           type: string
 *           description: ID of the RewardCategory (recommended)
 *           example: "60f8a9b5e6b3f32f8c9a8d7e"
 *         pointsCost:
 *           type: number
 *           description: Number of points required to redeem the reward
 *           minimum: 0
 *           example: 100
 *         limitedQuantity:
 *           type: boolean
 *           description: Whether the reward has limited quantity
 *           example: false
 *         quantity:
 *           type: number
 *           description: Available quantity (required if limitedQuantity is true)
 *           minimum: 0
 *           example: 10
 *         expiryDate:
 *           type: string
 *           format: date-time
 *           description: Expiration date of the reward
 *           example: "2023-12-31T23:59:59.000Z"
 *         image:
 *           type: string
 *           description: URL to reward image
 *           example: "https://example.com/reward-image.jpg"
 *         redemptionInstructions:
 *           type: string
 *           description: Instructions for how to redeem the reward
 *           example: "Show this to your parent to claim your extra playtime"
 *         restrictions:
 *           type: string
 *           description: Any restrictions or requirements for redemption
 *           example: "Must be used within 7 days of redemption"
 *         schoolId:
 *           type: string
 *           description: ID of the school (for school rewards)
 *           example: "60f8a9b5e6b3f32f8c9a8d7e"
 *         metadata:
 *           type: object
 *           additionalProperties: true
 *           description: Additional metadata for the reward
 *     RewardUpdate:
 *       type: object
 *       properties:
 *         title:
 *           type: string
 *           description: Title of the reward
 *         description:
 *           type: string
 *           description: Detailed description of the reward
 *         category:
 *           type: string
 *           enum: [family, school, sponsor]
 *           description: Main category of the reward (DEPRECATED)
 *         subcategory:
 *           type: string
 *           enum: [privilege, item, experience, digital]
 *           description: Subcategory of the reward (DEPRECATED)
 *         categoryId:
 *           type: string
 *           description: ID of the RewardCategory
 *         pointsCost:
 *           type: number
 *           description: Number of points required to redeem the reward
 *           minimum: 0
 *         limitedQuantity:
 *           type: boolean
 *           description: Whether the reward has limited quantity
 *         quantity:
 *           type: number
 *           description: Available quantity (if limitedQuantity is true)
 *           minimum: 0
 *         expiryDate:
 *           type: string
 *           format: date-time
 *           description: Expiration date of the reward
 *         image:
 *           type: string
 *           description: URL to reward image
 *         isActive:
 *           type: boolean
 *           description: Whether the reward is currently active
 *         redemptionInstructions:
 *           type: string
 *           description: Instructions for how to redeem the reward
 *         restrictions:
 *           type: string
 *           description: Any restrictions or requirements for redemption
 *         metadata:
 *           type: object
 *           additionalProperties: true
 *           description: Additional metadata for the reward
 *     RewardEligibility:
 *       type: object
 *       properties:
 *         studentId:
 *           type: string
 *           description: ID of the student to check eligibility for
 *           example: "60f8a9b5e6b3f32f8c9a8d7e"
 */

// All routes require authentication
router.use(authMiddleware);

/**
 * @openapi
 * /rewards:
 *   post:
 *     summary: Create a new reward
 *     description: Creates a new reward in the system. Only parents, school admins, and platform admins can create rewards.
 *     tags:
 *       - Rewards
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       description: Reward details
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RewardCreate'
 *     responses:
 *       '201':
 *         description: Reward created successfully
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
 *                   example: "Reward created successfully"
 *                 data:
 *                   $ref: '#/components/schemas/Reward'
 *       '400':
 *         description: Missing required fields
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
 *                   example: "Missing required fields"
 *       '403':
 *         description: Not authorized to create rewards
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
 *                   example: "Not authorized to create rewards"
 *       '500':
 *         description: Failed to create reward
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
 *                   example: "Failed to create reward"
 *                 error:
 *                   type: string
 */
router.post("/", canManageRewards, uploadSingle, handleUploadError, rewardController.createReward);

/**
 * @openapi
 * /rewards:
 *   get:
 *     summary: Get available rewards with filtering
 *     description: Retrieves a list of available rewards based on various filters. Results are filtered based on user role.
 *     tags:
 *       - Rewards
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: category
 *         in: query
 *         description: Filter by reward category
 *         schema:
 *           type: string
 *           enum: [family, school, sponsor]
 *       - name: subcategory
 *         in: query
 *         description: Filter by reward subcategory
 *         schema:
 *           type: string
 *           enum: [privilege, item, experience, digital]
 *       - name: categoryId
 *         in: query
 *         description: Filter by RewardCategory ID
 *         schema:
 *           type: string
 *       - name: creatorType
 *         in: query
 *         description: Filter by creator type
 *         schema:
 *           type: string
 *           enum: [parent, school, sponsor, system]
 *       - name: schoolId
 *         in: query
 *         description: Filter by school ID
 *         schema:
 *           type: string
 *       - name: minPoints
 *         in: query
 *         description: Minimum points cost filter
 *         schema:
 *           type: number
 *       - name: maxPoints
 *         in: query
 *         description: Maximum points cost filter
 *         schema:
 *           type: number
 *       - name: search
 *         in: query
 *         description: Search by title or description
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
 *           default: 20
 *       - name: sort
 *         in: query
 *         description: Field to sort by
 *         schema:
 *           type: string
 *           default: "pointsCost"
 *       - name: order
 *         in: query
 *         description: Sort order (asc or desc)
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: "asc"
 *       - name: wishlistOnly
 *         in: query
 *         description: Show only rewards in student's wishlist (students only)
 *         schema:
 *           type: string
 *           enum: [true, false]
 *     responses:
 *       '200':
 *         description: Rewards retrieved successfully
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
 *                     rewards:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Reward'
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
 *                           example: 20
 *                         pages:
 *                           type: integer
 *                           example: 3
 *       '500':
 *         description: Failed to get rewards
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
 *                   example: "Failed to get rewards"
 *                 error:
 *                   type: string
 */
router.get("/", rewardController.getRewards);

/**
 * @openapi
 * /rewards/parent:
 *   get:
 *     summary: Get rewards visible to parent (with visibility control)
 *     description: Retrieves all rewards that affect the parent's children with visibility control information. Parents can see global, school, class, and their own rewards.
 *     tags:
 *       - Parent Controls
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: category
 *         in: query
 *         description: Filter by reward category
 *         schema:
 *           type: string
 *           enum: [family, school, sponsor]
 *       - name: subcategory
 *         in: query
 *         description: Filter by reward subcategory
 *         schema:
 *           type: string
 *           enum: [privilege, item, experience, digital]
 *       - name: categoryId
 *         in: query
 *         description: Filter by RewardCategory ID
 *         schema:
 *           type: string
 *       - name: creatorType
 *         in: query
 *         description: Filter by creator type
 *         schema:
 *           type: string
 *           enum: [parent, teacher, school, social_worker, system]
 *       - name: schoolId
 *         in: query
 *         description: Filter by school ID
 *         schema:
 *           type: string
 *       - name: classId
 *         in: query
 *         description: Filter by class ID
 *         schema:
 *           type: string
 *       - name: minPoints
 *         in: query
 *         description: Minimum points cost filter
 *         schema:
 *           type: number
 *       - name: maxPoints
 *         in: query
 *         description: Maximum points cost filter
 *         schema:
 *           type: number
 *       - name: search
 *         in: query
 *         description: Search by title or description
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
 *           default: 20
 *       - name: sort
 *         in: query
 *         description: Field to sort by
 *         schema:
 *           type: string
 *           default: "createdAt"
 *       - name: order
 *         in: query
 *         description: Sort order (asc or desc)
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: "desc"
 *       - name: isFeatured
 *         in: query
 *         description: Filter by featured status
 *         schema:
 *           type: string
 *           enum: [true, false]
 *     responses:
 *       '200':
 *         description: Parent rewards retrieved successfully
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
 *                     rewards:
 *                       type: array
 *                       items:
 *                         allOf:
 *                           - $ref: '#/components/schemas/Reward'
 *                           - type: object
 *                             properties:
 *                               canParentControl:
 *                                 type: boolean
 *                                 description: Whether parent can control this reward's visibility
 *                                 example: true
 *                               isHiddenByParent:
 *                                 type: boolean
 *                                 description: Whether parent has hidden this reward
 *                                 example: false
 *                               isVisibleToMyChildren:
 *                                 type: boolean
 *                                 description: Final visibility status for parent's children
 *                                 example: true
 *                     parentInfo:
 *                       type: object
 *                       properties:
 *                         parentId:
 *                           type: string
 *                         childrenCount:
 *                           type: integer
 *                         childrenSchools:
 *                           type: integer
 *                         childrenClasses:
 *                           type: integer
 *                     pagination:
 *                       type: object
 *                       properties:
 *                         total:
 *                           type: integer
 *                         page:
 *                           type: integer
 *                         limit:
 *                           type: integer
 *                         pages:
 *                           type: integer
 *       '500':
 *         description: Failed to get parent rewards
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
 *                   example: "Failed to get parent rewards"
 *                 error:
 *                   type: string
 */
router.get(
  "/parent",
  authorizeRoles("parent"),
  rewardController.getParentRewards
);

/**
 * @openapi
 * /rewards/student:
 *   get:
 *     summary: Get rewards visible to student (respecting parent controls)
 *     description: Retrieves all rewards visible to the authenticated student, respecting parent visibility controls. Automatically excludes rewards hidden by any parent.
 *     tags:
 *       - Student View
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: category
 *         in: query
 *         description: Filter by reward category
 *         schema:
 *           type: string
 *           enum: [family, school, sponsor]
 *       - name: subcategory
 *         in: query
 *         description: Filter by reward subcategory
 *         schema:
 *           type: string
 *           enum: [privilege, item, experience, digital]
 *       - name: categoryId
 *         in: query
 *         description: Filter by RewardCategory ID
 *         schema:
 *           type: string
 *       - name: creatorType
 *         in: query
 *         description: Filter by creator type
 *         schema:
 *           type: string
 *           enum: [parent, teacher, school, social_worker, system]
 *       - name: schoolId
 *         in: query
 *         description: Filter by school ID
 *         schema:
 *           type: string
 *       - name: classId
 *         in: query
 *         description: Filter by class ID
 *         schema:
 *           type: string
 *       - name: minPoints
 *         in: query
 *         description: Minimum points cost filter
 *         schema:
 *           type: number
 *       - name: maxPoints
 *         in: query
 *         description: Maximum points cost filter
 *         schema:
 *           type: number
 *       - name: search
 *         in: query
 *         description: Search by title or description
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
 *           default: 20
 *       - name: sort
 *         in: query
 *         description: Field to sort by
 *         schema:
 *           type: string
 *           default: "createdAt"
 *       - name: order
 *         in: query
 *         description: Sort order (asc or desc)
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: "desc"
 *       - name: isFeatured
 *         in: query
 *         description: Filter by featured status
 *         schema:
 *           type: string
 *           enum: [true, false]
 *       - name: wishlistOnly
 *         in: query
 *         description: Show only rewards in student's wishlist
 *         schema:
 *           type: string
 *           enum: [true, false]
 *     responses:
 *       '200':
 *         description: Student rewards retrieved successfully
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
 *                     rewards:
 *                       type: array
 *                       items:
 *                         allOf:
 *                           - $ref: '#/components/schemas/Reward'
 *                           - type: object
 *                             properties:
 *                               isInWishlist:
 *                                 type: boolean
 *                                 description: Whether reward is in student's wishlist
 *                                 example: false
 *                     studentInfo:
 *                       type: object
 *                       properties:
 *                         studentId:
 *                           type: string
 *                         parentIds:
 *                           type: array
 *                           items:
 *                             type: string
 *                         schoolId:
 *                           type: string
 *                         classIds:
 *                           type: array
 *                           items:
 *                             type: string
 *                     pagination:
 *                       type: object
 *                       properties:
 *                         total:
 *                           type: integer
 *                         page:
 *                           type: integer
 *                         limit:
 *                           type: integer
 *                         pages:
 *                           type: integer
 *       '500':
 *         description: Failed to get student rewards
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
 *                   example: "Failed to get student rewards"
 *                 error:
 *                   type: string
 */
router.get(
  "/student",
  authorizeRoles("student"),
  rewardController.getStudentRewards
);

/**
 * @openapi
 * /rewards/{id}:
 *   get:
 *     summary: Get reward by ID
 *     description: Retrieves detailed information about a specific reward
 *     tags:
 *       - Rewards
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         description: ID of the reward to retrieve
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       '200':
 *         description: Reward retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Reward'
 *       '400':
 *         description: Invalid reward ID format
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
 *                   example: "Invalid reward ID format"
 *       '404':
 *         description: Reward not found
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
 *                   example: "Reward not found"
 *       '500':
 *         description: Failed to get reward
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
 *                   example: "Failed to get reward"
 *                 error:
 *                   type: string
 */
router.get("/:id", rewardController.getRewardById);

/**
 * @openapi
 * /rewards/{id}:
 *   put:
 *     summary: Update a reward
 *     description: Updates an existing reward. Only the creator or platform admin can update a reward.
 *     tags:
 *       - Rewards
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         description: ID of the reward to update
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       description: Updated reward details
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RewardUpdate'
 *     responses:
 *       '200':
 *         description: Reward updated successfully
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
 *                   example: "Reward updated successfully"
 *                 data:
 *                   $ref: '#/components/schemas/Reward'
 *       '400':
 *         description: Invalid reward ID format
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
 *                   example: "Invalid reward ID format"
 *       '403':
 *         description: Not authorized to update this reward
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
 *                   example: "Not authorized to update this reward"
 *       '404':
 *         description: Reward not found
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
 *                   example: "Reward not found"
 *       '500':
 *         description: Failed to update reward
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
 *                   example: "Failed to update reward"
 *                 error:
 *                   type: string
 */
router.put("/:id", canManageRewards, uploadSingle, handleUploadError, rewardController.updateReward);

/**
 * @openapi
 * /rewards/{id}:
 *   delete:
 *     summary: Delete a reward (soft delete)
 *     description: Marks a reward as deleted (soft delete). Only the creator or platform admin can delete a reward.
 *     tags:
 *       - Rewards
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         description: ID of the reward to delete
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       '200':
 *         description: Reward deleted successfully
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
 *                   example: "Reward deleted successfully"
 *       '400':
 *         description: Invalid reward ID format
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
 *                   example: "Invalid reward ID format"
 *       '403':
 *         description: Not authorized to delete this reward
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
 *                   example: "Not authorized to delete this reward"
 *       '404':
 *         description: Reward not found
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
 *                   example: "Reward not found"
 *       '500':
 *         description: Failed to delete reward
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
 *                   example: "Failed to delete reward"
 *                 error:
 *                   type: string
 */
router.delete("/:id", canManageRewards, rewardController.deleteReward);

/**
 * @openapi
 * /rewards/{id}/check-eligibility:
 *   post:
 *     summary: Check if a reward can be redeemed
 *     description: Checks whether a reward is eligible for redemption by a student
 *     tags:
 *       - Rewards
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         description: ID of the reward to check
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       description: Student information for eligibility check
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RewardEligibility'
 *     responses:
 *       '200':
 *         description: Eligibility check completed
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
 *                     eligible:
 *                       type: boolean
 *                       example: true
 *                     pointsRequired:
 *                       type: number
 *                       example: 100
 *                     reason:
 *                       type: string
 *                       example: "Reward is active and available"
 *       '400':
 *         description: Invalid reward ID format
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
 *                   example: "Invalid reward ID format"
 *       '404':
 *         description: Reward not found
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
 *                   example: "Reward not found"
 *       '500':
 *         description: Failed to check redemption eligibility
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
 *                   example: "Failed to check redemption eligibility"
 *                 error:
 *                   type: string
 */
router.post(
  "/:id/check-eligibility",
  rewardController.checkRedemptionEligibility
);

/**
 * @openapi
 * /rewards/{id}/wishlist:
 *   post:
 *     summary: Add reward to wishlist
 *     description: Adds a reward to the student's wishlist
 *     tags:
 *       - Wishlist
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         description: ID of the reward to add to wishlist
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       description: Student ID for wishlist
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - studentId
 *             properties:
 *               studentId:
 *                 type: string
 *                 description: ID of the student
 *                 example: "60f8a9b5e6b3f32f8c9a8d7e"
 *     responses:
 *       '201':
 *         description: Reward added to wishlist successfully
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
 *                   example: "Reward added to wishlist"
 *                 data:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                     studentId:
 *                       type: string
 *                     rewardId:
 *                       type: string
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *       '400':
 *         description: Invalid reward ID format
 *       '404':
 *         description: Reward not found
 *       '409':
 *         description: Reward already in wishlist
 *       '500':
 *         description: Failed to add reward to wishlist
 */
router.post("/:rewardId/wishlist", rewardController.addToWishlist);

/**
 * @openapi
 * /rewards/{id}/wishlist:
 *   delete:
 *     summary: Remove reward from wishlist
 *     description: Removes a reward from the student's wishlist
 *     tags:
 *       - Wishlist
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         description: ID of the reward to remove from wishlist
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       description: Student ID for wishlist
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - studentId
 *             properties:
 *               studentId:
 *                 type: string
 *                 description: ID of the student
 *                 example: "60f8a9b5e6b3f32f8c9a8d7e"
 *     responses:
 *       '200':
 *         description: Reward removed from wishlist successfully
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
 *                   example: "Reward removed from wishlist"
 *       '400':
 *         description: Invalid reward ID format
 *       '404':
 *         description: Reward not found in wishlist
 *       '500':
 *         description: Failed to remove reward from wishlist
 */
router.delete("/:rewardId/wishlist", rewardController.removeFromWishlist);

/**
 * @openapi
 * /rewards/wishlist/{studentId}:
 *   get:
 *     summary: Get student's wishlist
 *     description: Retrieves all rewards in a student's wishlist with pagination
 *     tags:
 *       - Wishlist
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: studentId
 *         in: path
 *         description: ID of the student
 *         required: true
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
 *           default: 20
 *     responses:
 *       '200':
 *         description: Wishlist retrieved successfully
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
 *                     wishlist:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           _id:
 *                             type: string
 *                           studentId:
 *                             type: string
 *                           rewardId:
 *                             $ref: '#/components/schemas/Reward'
 *                           createdAt:
 *                             type: string
 *                             format: date-time
 *                     pagination:
 *                       type: object
 *                       properties:
 *                         total:
 *                           type: integer
 *                         page:
 *                           type: integer
 *                         limit:
 *                           type: integer
 *                         pages:
 *                           type: integer
 *       '500':
 *         description: Failed to get wishlist
 */
router.get("/wishlist/:studentId", rewardController.getWishlist);

/**
 * @openapi
 * /rewards/{id}/toggle-visibility:
 *   put:
 *     summary: Toggle reward visibility for parent's children
 *     description: Allows a parent to hide or show a specific reward for all their children. Can both hide and unhide rewards.
 *     tags:
 *       - Parent Controls
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         description: ID of the reward to toggle visibility for
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       description: Visibility setting
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - isVisible
 *             properties:
 *               isVisible:
 *                 type: boolean
 *                 description: Whether the reward should be visible to children (true) or hidden (false)
 *                 example: false
 *     responses:
 *       '200':
 *         description: Reward visibility toggled successfully
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
 *                   example: "Reward hidden from your children successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     rewardId:
 *                       type: string
 *                       example: "60f8a9b5e6b3f32f8c9a8d7e"
 *                     parentId:
 *                       type: string
 *                       example: "60f8a9b5e6b3f32f8c9a8d7f"
 *                     isVisible:
 *                       type: boolean
 *                       example: false
 *                     updatedAt:
 *                       type: string
 *                       format: date-time
 *                       example: "2023-12-01T10:30:00.000Z"
 *                     status:
 *                       type: string
 *                       enum: [visible, hidden]
 *                       example: "hidden"
 *       '400':
 *         description: Invalid reward ID format or invalid isVisible value
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
 *                   example: "isVisible must be a boolean value"
 *       '403':
 *         description: Parent cannot control this reward's visibility
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
 *                   example: "You cannot control the visibility of this reward"
 *       '404':
 *         description: Reward not found
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
 *                   example: "Reward not found"
 *       '409':
 *         description: Reward is already in the requested visibility state
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
 *                   example: "Reward is already visible to your children"
 *       '500':
 *         description: Failed to toggle reward visibility
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
 *                   example: "Failed to toggle reward visibility"
 *                 error:
 *                   type: string
 */
router.put(
  "/:id/toggle-visibility",
  authorizeRoles("parent"),
  rewardController.toggleRewardVisibility
);

module.exports = router;
