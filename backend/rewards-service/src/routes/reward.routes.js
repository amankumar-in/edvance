// src/routes/reward.routes.js
const express = require("express");
const router = express.Router();
const rewardController = require("../controllers/reward.controller");
const {
  authMiddleware,
  canManageRewards,
  authorizeRoles,
} = require("../middleware/auth.middleware");

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
router.post("/", canManageRewards, rewardController.createReward);

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
router.put("/:id", canManageRewards, rewardController.updateReward);

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

module.exports = router;
