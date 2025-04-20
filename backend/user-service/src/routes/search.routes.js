const express = require("express");
const searchController = require("../controllers/search.controller");
const authMiddleware = require("../middleware/auth.middleware");

const router = express.Router();

/**
 * @openapi
 * /search/students:
 *   get:
 *     summary: Search for students
 *     description: Search for students with various filtering options and pagination
 *     tags:
 *       - Search
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: name
 *         in: query
 *         description: Search by first or last name (case-insensitive)
 *         schema:
 *           type: string
 *       - name: email
 *         in: query
 *         description: Search by email address (case-insensitive)
 *         schema:
 *           type: string
 *       - name: grade
 *         in: query
 *         description: Filter by grade level
 *         schema:
 *           type: integer
 *       - name: schoolId
 *         in: query
 *         description: Filter by school ID
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
 *       - name: sortBy
 *         in: query
 *         description: Field to sort by (prefix with 'user.' for user fields like user.firstName)
 *         schema:
 *           type: string
 *           default: "createdAt"
 *       - name: sortOrder
 *         in: query
 *         description: Sort direction
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: "desc"
 *     responses:
 *       '200':
 *         description: List of students matching search criteria
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
 *                     students:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           _id:
 *                             type: string
 *                           grade:
 *                             type: number
 *                           schoolId:
 *                             type: string
 *                           parentIds:
 *                             type: array
 *                             items:
 *                               type: string
 *                           teacherIds:
 *                             type: array
 *                             items:
 *                               type: string
 *                           pointsAccountId:
 *                             type: string
 *                           level:
 *                             type: number
 *                           badges:
 *                             type: array
 *                             items:
 *                               type: string
 *                           attendanceStreak:
 *                             type: number
 *                           createdAt:
 *                             type: string
 *                             format: date-time
 *                           user:
 *                             type: object
 *                             properties:
 *                               _id:
 *                                 type: string
 *                               email:
 *                                 type: string
 *                               firstName:
 *                                 type: string
 *                               lastName:
 *                                 type: string
 *                               dateOfBirth:
 *                                 type: string
 *                                 format: date-time
 *                               avatar:
 *                                 type: string
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
 *                         hasNext:
 *                           type: boolean
 *                           example: true
 *                         hasPrev:
 *                           type: boolean
 *                           example: false
 *       '500':
 *         description: Failed to search students
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
 *                   example: "Failed to search students"
 *                 error:
 *                   type: string
 */
router.get(
  "/students",
  authMiddleware.verifyToken,
  searchController.searchStudents
);

/**
 * @openapi
 * /search/parents:
 *   get:
 *     summary: Search for parents
 *     description: Search for parents with various filtering options and pagination
 *     tags:
 *       - Search
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: name
 *         in: query
 *         description: Search by first or last name (case-insensitive)
 *         schema:
 *           type: string
 *       - name: email
 *         in: query
 *         description: Search by email address (case-insensitive)
 *         schema:
 *           type: string
 *       - name: childCount
 *         in: query
 *         description: Filter by number of children
 *         schema:
 *           type: integer
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
 *       - name: sortBy
 *         in: query
 *         description: Field to sort by (prefix with 'user.' for user fields like user.firstName)
 *         schema:
 *           type: string
 *           default: "createdAt"
 *       - name: sortOrder
 *         in: query
 *         description: Sort direction
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: "desc"
 *     responses:
 *       '200':
 *         description: List of parents matching search criteria
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
 *                     parents:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           _id:
 *                             type: string
 *                           childIds:
 *                             type: array
 *                             items:
 *                               type: string
 *                           tuitPoints:
 *                             type: number
 *                           createdAt:
 *                             type: string
 *                             format: date-time
 *                           user:
 *                             type: object
 *                             properties:
 *                               _id:
 *                                 type: string
 *                               email:
 *                                 type: string
 *                               firstName:
 *                                 type: string
 *                               lastName:
 *                                 type: string
 *                               avatar:
 *                                 type: string
 *                           childCount:
 *                             type: number
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
 *                         hasNext:
 *                           type: boolean
 *                           example: true
 *                         hasPrev:
 *                           type: boolean
 *                           example: false
 *       '500':
 *         description: Failed to search parents
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
 *                   example: "Failed to search parents"
 *                 error:
 *                   type: string
 */
router.get(
  "/parents",
  authMiddleware.verifyToken,
  searchController.searchParents
);

/**
 * @openapi
 * /search/teachers:
 *   get:
 *     summary: Search for teachers
 *     description: Search for teachers with various filtering options and pagination
 *     tags:
 *       - Search
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: name
 *         in: query
 *         description: Search by first or last name (case-insensitive)
 *         schema:
 *           type: string
 *       - name: email
 *         in: query
 *         description: Search by email address (case-insensitive)
 *         schema:
 *           type: string
 *       - name: schoolId
 *         in: query
 *         description: Filter by school ID
 *         schema:
 *           type: string
 *       - name: subject
 *         in: query
 *         description: Filter by subject taught
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
 *       - name: sortBy
 *         in: query
 *         description: Field to sort by (prefix with 'user.' for user fields like user.firstName)
 *         schema:
 *           type: string
 *           default: "createdAt"
 *       - name: sortOrder
 *         in: query
 *         description: Sort direction
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: "desc"
 *     responses:
 *       '200':
 *         description: List of teachers matching search criteria
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
 *                     teachers:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           _id:
 *                             type: string
 *                           schoolId:
 *                             type: string
 *                           classIds:
 *                             type: array
 *                             items:
 *                               type: string
 *                           subjectsTaught:
 *                             type: array
 *                             items:
 *                               type: string
 *                           createdAt:
 *                             type: string
 *                             format: date-time
 *                           user:
 *                             type: object
 *                             properties:
 *                               _id:
 *                                 type: string
 *                               email:
 *                                 type: string
 *                               firstName:
 *                                 type: string
 *                               lastName:
 *                                 type: string
 *                               avatar:
 *                                 type: string
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
 *                         hasNext:
 *                           type: boolean
 *                           example: true
 *                         hasPrev:
 *                           type: boolean
 *                           example: false
 *       '500':
 *         description: Failed to search teachers
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
 *                   example: "Failed to search teachers"
 *                 error:
 *                   type: string
 */
router.get(
  "/teachers",
  authMiddleware.verifyToken,
  searchController.searchTeachers
);

/**
 * @openapi
 * /search/schools:
 *   get:
 *     summary: Search for schools
 *     description: Search for schools with various filtering options and pagination
 *     tags:
 *       - Search
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: name
 *         in: query
 *         description: Search by school name (case-insensitive)
 *         schema:
 *           type: string
 *       - name: city
 *         in: query
 *         description: Filter by city (case-insensitive)
 *         schema:
 *           type: string
 *       - name: state
 *         in: query
 *         description: Filter by state (case-insensitive)
 *         schema:
 *           type: string
 *       - name: zipCode
 *         in: query
 *         description: Filter by ZIP code (case-insensitive)
 *         schema:
 *           type: string
 *       - name: country
 *         in: query
 *         description: Filter by country (case-insensitive)
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
 *       - name: sortBy
 *         in: query
 *         description: Field to sort by
 *         schema:
 *           type: string
 *           default: "name"
 *       - name: sortOrder
 *         in: query
 *         description: Sort direction
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: "asc"
 *     responses:
 *       '200':
 *         description: List of schools matching search criteria
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
 *                     schools:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           _id:
 *                             type: string
 *                           name:
 *                             type: string
 *                           address:
 *                             type: string
 *                           city:
 *                             type: string
 *                           state:
 *                             type: string
 *                           zipCode:
 *                             type: string
 *                           country:
 *                             type: string
 *                           phone:
 *                             type: string
 *                           email:
 *                             type: string
 *                           website:
 *                             type: string
 *                           logo:
 *                             type: string
 *                           adminIds:
 *                             type: array
 *                             items:
 *                               type: string
 *                           createdAt:
 *                             type: string
 *                             format: date-time
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
 *                         hasNext:
 *                           type: boolean
 *                           example: true
 *                         hasPrev:
 *                           type: boolean
 *                           example: false
 *       '500':
 *         description: Failed to search schools
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
 *                   example: "Failed to search schools"
 *                 error:
 *                   type: string
 */
router.get(
  "/schools",
  authMiddleware.verifyToken,
  searchController.searchSchools
);

module.exports = router;
