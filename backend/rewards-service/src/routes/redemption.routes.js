const express = require("express");
const router = express.Router();
const redemptionController = require("../controllers/redemption.controller");
const {
  authMiddleware,
  authorizeRoles,
} = require("../middleware/auth.middleware");

/**
 * @openapi
 * components:
 *   schemas:
 *     RewardRedemption:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           description: Unique identifier for the redemption
 *         rewardId:
 *           type: string
 *           description: ID of the redeemed reward
 *         studentId:
 *           type: string
 *           description: ID of the student who redeemed the reward
 *         pointsSpent:
 *           type: number
 *           description: Number of points spent for this redemption
 *           minimum: 0
 *         redemptionDate:
 *           type: string
 *           format: date-time
 *           description: Date when the reward was redeemed
 *         status:
 *           type: string
 *           enum: [pending, fulfilled, canceled, expired]
 *           description: Current status of the redemption
 *           default: pending
 *         fulfillmentDate:
 *           type: string
 *           format: date-time
 *           description: Date when the redemption was fulfilled
 *         fulfillerId:
 *           type: string
 *           description: ID of the user who fulfilled the redemption
 *         redemptionCode:
 *           type: string
 *           description: Unique code for this redemption
 *         feedback:
 *           type: string
 *           description: Feedback provided during fulfillment
 *         metadata:
 *           type: object
 *           additionalProperties: true
 *           description: Additional metadata for the redemption
 *         cancelReason:
 *           type: string
 *           description: Reason for cancellation (if canceled)
 *         cancelledBy:
 *           type: string
 *           description: ID of the user who canceled the redemption
 *         cancelledAt:
 *           type: string
 *           format: date-time
 *           description: Date when the redemption was canceled
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Creation timestamp
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: Last update timestamp
 *     RedemptionRequest:
 *       type: object
 *       properties:
 *         studentId:
 *           type: string
 *           description: ID of the student redeeming the reward (optional, defaults to authenticated user)
 *           example: "60f8a9b5e6b3f32f8c9a8d7e"
 *     FulfillmentRequest:
 *       type: object
 *       properties:
 *         feedback:
 *           type: string
 *           description: Feedback about the fulfillment
 *           example: "Reward delivered successfully"
 *     CancellationRequest:
 *       type: object
 *       required:
 *         - reason
 *       properties:
 *         reason:
 *           type: string
 *           description: Reason for canceling the redemption
 *           example: "Student changed their mind"
 */

// All routes require authentication
router.use(authMiddleware);

/**
 * @openapi
 * /rewards/redemptions/{id}/redeem:
 *   post:
 *     summary: Redeem a reward
 *     description: Redeems a reward using the student's points. Students can redeem for themselves, parents can redeem for their children.
 *     tags:
 *       - Reward Redemptions
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         description: ID of the reward to redeem
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       description: Redemption request details
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RedemptionRequest'
 *     responses:
 *       '201':
 *         description: Reward redeemed successfully
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
 *                   example: "Reward redeemed successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     redemption:
 *                       $ref: '#/components/schemas/RewardRedemption'
 *                     redemptionCode:
 *                       type: string
 *                       example: "RDM-19F2Y3-A9B2C8"
 *       '400':
 *         description: Invalid reward ID, insufficient points, or reward cannot be redeemed
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
 *                   example: "Insufficient points for redemption"
 *                 data:
 *                   type: object
 *                   properties:
 *                     currentBalance:
 *                       type: number
 *                       example: 50
 *                     required:
 *                       type: number
 *                       example: 100
 *       '403':
 *         description: Not authorized to redeem this reward
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
 *                   example: "Students can only redeem rewards for themselves"
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
 *         description: Failed to redeem reward
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
 *                   example: "Failed to redeem reward"
 *                 error:
 *                   type: string
 */
router.post(
  "/:id/redeem",
  authorizeRoles("student", "parent"),
  redemptionController.redeemReward
);

/**
 * @openapi
 * /rewards/redemptions:
 *   get:
 *     summary: Get redemption history
 *     description: Retrieves a list of redemptions with filtering options. Results are filtered based on user role.
 *     tags:
 *       - Reward Redemptions
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: studentId
 *         in: query
 *         description: Filter by student ID (students can only see their own)
 *         schema:
 *           type: string
 *       - name: rewardId
 *         in: query
 *         description: Filter by reward ID
 *         schema:
 *           type: string
 *       - name: status
 *         in: query
 *         description: Filter by redemption status
 *         schema:
 *           type: string
 *           enum: [pending, fulfilled, canceled, expired]
 *       - name: startDate
 *         in: query
 *         description: Filter redemptions after this date (YYYY-MM-DD)
 *         schema:
 *           type: string
 *           format: date
 *       - name: endDate
 *         in: query
 *         description: Filter redemptions before this date (YYYY-MM-DD)
 *         schema:
 *           type: string
 *           format: date
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
 *           default: "redemptionDate"
 *       - name: order
 *         in: query
 *         description: Sort order (asc or desc)
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: "desc"
 *     responses:
 *       '200':
 *         description: Redemption history retrieved successfully
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
 *                     redemptions:
 *                       type: array
 *                       items:
 *                         allOf:
 *                           - $ref: '#/components/schemas/RewardRedemption'
 *                           - type: object
 *                             properties:
 *                               rewardId:
 *                                 type: object
 *                                 properties:
 *                                   _id:
 *                                     type: string
 *                                   title:
 *                                     type: string
 *                                   category:
 *                                     type: string
 *                                   subcategory:
 *                                     type: string
 *                                   pointsCost:
 *                                     type: number
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
 *         description: Failed to get redemption history
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
 *                   example: "Failed to get redemption history"
 *                 error:
 *                   type: string
 */
router.get("/", redemptionController.getRedemptionHistory);

/**
 * @openapi
 * /rewards/redemptions/pending:
 *   get:
 *     summary: Get pending redemptions for fulfillment
 *     description: Retrieves a list of pending redemptions that need to be fulfilled. Only available to reward creators and admins.
 *     tags:
 *       - Reward Redemptions
 *     security:
 *       - bearerAuth: []
 *     parameters:
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
 *         description: Pending redemptions retrieved successfully
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
 *                     redemptions:
 *                       type: array
 *                       items:
 *                         allOf:
 *                           - $ref: '#/components/schemas/RewardRedemption'
 *                           - type: object
 *                             properties:
 *                               rewardId:
 *                                 type: object
 *                                 properties:
 *                                   _id:
 *                                     type: string
 *                                   title:
 *                                     type: string
 *                                   category:
 *                                     type: string
 *                                   subcategory:
 *                                     type: string
 *                                   pointsCost:
 *                                     type: number
 *                     pagination:
 *                       type: object
 *                       properties:
 *                         total:
 *                           type: integer
 *                           example: 10
 *                         page:
 *                           type: integer
 *                           example: 1
 *                         limit:
 *                           type: integer
 *                           example: 20
 *                         pages:
 *                           type: integer
 *                           example: 1
 *       '403':
 *         description: Not authorized to view pending redemptions
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
 *                   example: "Not authorized to view pending redemptions"
 *       '500':
 *         description: Failed to get pending redemptions
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
 *                   example: "Failed to get pending redemptions"
 *                 error:
 *                   type: string
 */
router.get("/pending", redemptionController.getPendingRedemptions);

/**
 * @openapi
 * /rewards/redemptions/{id}:
 *   get:
 *     summary: Get redemption by ID
 *     description: Retrieves detailed information about a specific redemption. Students can view their own, creators can view theirs.
 *     tags:
 *       - Reward Redemptions
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         description: ID of the redemption to retrieve
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       '200':
 *         description: Redemption retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   allOf:
 *                     - $ref: '#/components/schemas/RewardRedemption'
 *                     - type: object
 *                       properties:
 *                         rewardId:
 *                           type: object
 *                           properties:
 *                             _id:
 *                               type: string
 *                             title:
 *                               type: string
 *                             category:
 *                               type: string
 *                             subcategory:
 *                               type: string
 *                             pointsCost:
 *                               type: number
 *                             creatorId:
 *                               type: string
 *                             creatorType:
 *                               type: string
 *       '400':
 *         description: Invalid redemption ID format
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
 *                   example: "Invalid redemption ID format"
 *       '403':
 *         description: Not authorized to view this redemption
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
 *                   example: "Not authorized to view this redemption"
 *       '404':
 *         description: Redemption not found
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
 *                   example: "Redemption not found"
 *       '500':
 *         description: Failed to get redemption
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
 *                   example: "Failed to get redemption"
 *                 error:
 *                   type: string
 */
router.get("/:id", redemptionController.getRedemptionById);

/**
 * @openapi
 * /rewards/redemptions/{id}/fulfill:
 *   put:
 *     summary: Fulfill a redemption
 *     description: Marks a pending redemption as fulfilled. Only the reward creator or admin can fulfill.
 *     tags:
 *       - Reward Redemptions
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         description: ID of the redemption to fulfill
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       description: Fulfillment details
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/FulfillmentRequest'
 *     responses:
 *       '200':
 *         description: Redemption fulfilled successfully
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
 *                   example: "Redemption fulfilled successfully"
 *                 data:
 *                   $ref: '#/components/schemas/RewardRedemption'
 *       '400':
 *         description: Invalid redemption ID format or redemption not in pending status
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
 *                   example: "Can only fulfill pending redemptions"
 *       '403':
 *         description: Not authorized to fulfill this redemption
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
 *                   example: "Not authorized to fulfill this redemption"
 *       '404':
 *         description: Redemption not found
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
 *                   example: "Redemption not found"
 *       '500':
 *         description: Failed to fulfill redemption
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
 *                   example: "Failed to fulfill redemption"
 *                 error:
 *                   type: string
 */
router.put("/:id/fulfill", redemptionController.fulfillRedemption);

/**
 * @openapi
 * /rewards/redemptions/{id}/cancel:
 *   post:
 *     summary: Cancel a redemption
 *     description: Cancels a pending redemption and refunds points. Students can cancel their own, reward creators can cancel any.
 *     tags:
 *       - Reward Redemptions
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         description: ID of the redemption to cancel
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       description: Cancellation details
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CancellationRequest'
 *     responses:
 *       '200':
 *         description: Redemption cancelled successfully
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
 *                   example: "Redemption cancelled successfully"
 *                 data:
 *                   $ref: '#/components/schemas/RewardRedemption'
 *       '400':
 *         description: Invalid redemption ID format or redemption not in pending status
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
 *                   example: "Can only cancel pending redemptions"
 *       '403':
 *         description: Not authorized to cancel this redemption
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
 *                   example: "Not authorized to cancel this redemption"
 *       '404':
 *         description: Redemption not found
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
 *                   example: "Redemption not found"
 *       '500':
 *         description: Failed to cancel redemption
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
 *                   example: "Failed to cancel redemption"
 *                 error:
 *                   type: string
 */
router.post("/:id/cancel", redemptionController.cancelRedemption);

module.exports = router;
