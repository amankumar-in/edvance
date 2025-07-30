const express = require("express");
const schoolClassController = require("../controllers/schoolClass.controller");
const authMiddleware = require("../middleware/auth.middleware");

const router = express.Router();

/**
 * @openapi
 * components:
 *   schemas:
 *     SchoolClass:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           description: Unique identifier for the class
 *         name:
 *           type: string
 *           description: Name of the class
 *         grade:
 *           type: number
 *           description: Grade level of the class (optional)
 *         schoolId:
 *           type: string
 *           description: ID of the school this class belongs to
 *         teacherId:
 *           type: string
 *           description: ID of the teacher assigned to this class
 *         studentIds:
 *           type: array
 *           description: List of student IDs enrolled in this class
 *           items:
 *             type: string
 *         joinCode:
 *           type: string
 *           description: Unique code for students to join this class
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Class creation timestamp
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: Last update timestamp
 */

/**
 * @openapi
 * /classes/{id}:
 *   get:
 *     summary: Get class details
 *     description: Retrieves detailed information about a specific class. Limited to teachers assigned to the class, school admins, and platform admins.
 *     tags:
 *       - School Classes
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         description: ID of the class
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       '200':
 *         description: Class details retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/SchoolClass'
 *       '403':
 *         description: Not authorized to access this class
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
 *                   example: "Not authorized to access this class"
 *       '404':
 *         description: Class not found or teacher profile not found
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
 *                   example: "Class not found"
 *       '500':
 *         description: Failed to get class details
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
 *                   example: "Failed to get class details"
 *                 error:
 *                   type: string
 */
router.get(
  "/:id",
  authMiddleware.verifyToken,
  authMiddleware.checkRole(["teacher", "school_admin", "platform_admin"]),
  schoolClassController.getClassDetails
);

/**
 * @openapi
 * /classes/{id}/students:
 *   get:
 *     summary: Get students in a class
 *     description: Retrieves a list of all students enrolled in a specific class. Limited to teachers assigned to the class, school admins, and platform admins.
 *     tags:
 *       - School Classes
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         description: ID of the class
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       '200':
 *         description: Class students retrieved successfully
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
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                         example: "60d21b4667d0d8992e610c85"
 *                       userId:
 *                         type: object
 *                         properties:
 *                           _id:
 *                             type: string
 *                           firstName:
 *                             type: string
 *                             example: "John"
 *                           lastName:
 *                             type: string
 *                             example: "Smith"
 *                           email:
 *                             type: string
 *                             example: "john.smith@example.com"
 *                           avatar:
 *                             type: string
 *                           dateOfBirth:
 *                             type: string
 *                             format: date
 *                       grade:
 *                         type: number
 *                         example: 5
 *       '403':
 *         description: Not authorized to access this class
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
 *                   example: "Not authorized to access this class"
 *       '404':
 *         description: Class not found or teacher profile not found
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
 *                   example: "Class not found"
 *       '500':
 *         description: Failed to get class students
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
 *                   example: "Failed to get class students"
 *                 error:
 *                   type: string
 */
router.get(
  "/:id/students",
  authMiddleware.verifyToken,
  authMiddleware.checkRole(["teacher", "school_admin", "platform_admin"]),
  schoolClassController.getClassStudents
);

/**
 * @openapi
 * /classes:
 *   post:
 *     summary: Create a new class
 *     description: Creates a new class for a teacher. Limited to teachers, school admins, and platform admins.
 *     tags:
 *       - School Classes
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       description: Class information
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: Name of the class
 *                 example: "5th Grade - Room 2B"
 *               grade:
 *                 type: number
 *                 description: Grade level (optional)
 *                 example: 5
 *               schoolId:
 *                 type: string
 *                 description: ID of the school
 *                 example: "60d21b4667d0d8992e610c87"
 *             required:
 *               - name
 *               - schoolId
 *     responses:
 *       '201':
 *         description: Class created successfully
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
 *                   example: "Class created successfully"
 *                 data:
 *                   $ref: '#/components/schemas/SchoolClass'
 *       '400':
 *         description: Class name and school ID are required
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
 *                   example: "Class name and school ID are required"
 *       '403':
 *         description: Not authorized to create a class for this school
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
 *                   example: "Not authorized to create a class for this school"
 *       '404':
 *         description: Teacher profile not found
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
 *                   example: "Teacher profile not found"
 *       '500':
 *         description: Failed to create class
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
 *                   example: "Failed to create class"
 *                 error:
 *                   type: string
 */
router.post(
  "/",
  authMiddleware.verifyToken,
  authMiddleware.checkRole(["teacher", "school_admin", "platform_admin"]),
  schoolClassController.createClass
);

/**
 * @openapi
 * /classes/{id}:
 *   put:
 *     summary: Update a class
 *     description: Updates an existing class. Limited to teachers assigned to the class, school admins, and platform admins.
 *     tags:
 *       - School Classes
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         description: ID of the class to update
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       description: Updated class information
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: Name of the class (optional)
 *                 example: "5th Grade - Room 2C"
 *               grade:
 *                 type: number
 *                 description: Grade level (optional)
 *                 example: 5
 *     responses:
 *       '200':
 *         description: Class updated successfully
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
 *                   example: "Class updated successfully"
 *                 data:
 *                   $ref: '#/components/schemas/SchoolClass'
 *       '403':
 *         description: Not authorized to update this class
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
 *                   example: "Not authorized to update this class"
 *       '404':
 *         description: Class not found or teacher profile not found
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
 *                   example: "Class not found"
 *       '500':
 *         description: Failed to update class
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
 *                   example: "Failed to update class"
 *                 error:
 *                   type: string
 */
router.put(
  "/:id",
  authMiddleware.verifyToken,
  authMiddleware.checkRole(["teacher", "school_admin", "platform_admin"]),
  schoolClassController.updateClass
);

/**
 * @openapi
 * /classes/{id}:
 *   delete:
 *     summary: Delete a class
 *     description: Deletes an existing class. Limited to teachers assigned to the class, school admins, and platform admins.
 *     tags:
 *       - School Classes
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         description: ID of the class to delete
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       '200':
 *         description: Class deleted successfully
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
 *                   example: "Class deleted successfully"
 *       '403':
 *         description: Not authorized to delete this class
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
 *                   example: "Not authorized to delete this class"
 *       '404':
 *         description: Class not found or teacher profile not found
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
 *                   example: "Class not found"
 *       '500':
 *         description: Failed to delete class
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
 *                   example: "Failed to delete class"
 *                 error:
 *                   type: string
 */
router.delete(
  "/:id",
  authMiddleware.verifyToken,
  authMiddleware.checkRole(["teacher", "school_admin", "platform_admin"]),
  schoolClassController.deleteClass
);

/**
 * @openapi
 * /classes/{id}/join-code:
 *   post:
 *     summary: Generate a new join code for a class
 *     description: Creates a new unique code for students to join the class. Limited to teachers assigned to the class, school admins, and platform admins.
 *     tags:
 *       - School Classes
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         description: ID of the class
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       '200':
 *         description: Join code generated successfully
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
 *                   example: "Join code generated successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     joinCode:
 *                       type: string
 *                       example: "XYZ123"
 *       '403':
 *         description: Not authorized to manage this class
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
 *                   example: "Not authorized to manage this class"
 *       '404':
 *         description: Class not found or teacher profile not found
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
 *                   example: "Class not found"
 *       '500':
 *         description: Failed to generate join code
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
 *                   example: "Failed to generate join code"
 *                 error:
 *                   type: string
 */
router.post(
  "/:id/join-code",
  authMiddleware.verifyToken,
  authMiddleware.checkRole(["teacher", "school_admin", "platform_admin"]),
  schoolClassController.generateJoinCode
);

/**
 * @openapi
 * /classes/{id}/students:
 *   post:
 *     summary: Add a student to a class
 *     description: Adds a student to a class. Limited to teachers assigned to the class, school admins, and platform admins.
 *     tags:
 *       - School Classes
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         description: ID of the class
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       description: Student information
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               studentId:
 *                 type: string
 *                 description: ID of the student to add
 *                 example: "60d21b4667d0d8992e610c85"
 *             required:
 *               - studentId
 *     responses:
 *       '200':
 *         description: Student added to class successfully
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
 *                   example: "Student added to class successfully"
 *                 data:
 *                   $ref: '#/components/schemas/SchoolClass'
 *       '400':
 *         description: Student ID is required or student already in class
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
 *                   example: "Student already in this class"
 *       '403':
 *         description: Not authorized to manage this class
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
 *                   example: "Not authorized to manage this class"
 *       '404':
 *         description: Class, student, or teacher profile not found
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
 *                   example: "Student not found"
 *       '500':
 *         description: Failed to add student to class
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
 *                   example: "Failed to add student to class"
 *                 error:
 *                   type: string
 */
router.post(
  "/:id/students",
  authMiddleware.verifyToken,
  authMiddleware.checkRole(["teacher", "school_admin", "platform_admin"]),
  schoolClassController.addStudentToClass
);

/**
 * @openapi
 * /classes/{id}/students/{studentId}:
 *   delete:
 *     summary: Remove a student from a class
 *     description: Removes a student from a class. Limited to teachers assigned to the class, school admins, and platform admins.
 *     tags:
 *       - School Classes
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         description: ID of the class
 *         required: true
 *         schema:
 *           type: string
 *       - name: studentId
 *         in: path
 *         description: ID of the student to remove
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       '200':
 *         description: Student removed from class successfully
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
 *                   example: "Student removed from class successfully"
 *       '400':
 *         description: Student not in this class
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
 *                   example: "Student not in this class"
 *       '403':
 *         description: Not authorized to manage this class
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
 *                   example: "Not authorized to manage this class"
 *       '404':
 *         description: Class or teacher profile not found
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
 *                   example: "Class not found"
 *       '500':
 *         description: Failed to remove student from class
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
 *                   example: "Failed to remove student from class"
 *                 error:
 *                   type: string
 */
router.delete(
  "/:id/students/:studentId",
  authMiddleware.verifyToken,
  authMiddleware.checkRole(["teacher", "school_admin", "platform_admin"]),
  schoolClassController.removeStudentFromClass
);

/**
 * @openapi
 * /classes/classes/{id}/join-requests:
 *   get:
 *     summary: Get pending join requests for a class
 *     description: Retrieves all pending join requests for a specific class. Limited to teachers assigned to the class, school admins, and platform admins.
 *     tags:
 *       - School Classes
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         description: ID of the class
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       '200':
 *         description: Join requests retrieved successfully
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
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                         example: "60d21b4667d0d8992e610c95"
 *                       studentId:
 *                         type: object
 *                         properties:
 *                           _id:
 *                             type: string
 *                             example: "60d21b4667d0d8992e610c85"
 *                           userId:
 *                             type: string
 *                             example: "60d21b4667d0d8992e610c80"
 *                       requestType:
 *                         type: string
 *                         example: "school"
 *                       targetId:
 *                         type: string
 *                         example: "60d21b4667d0d8992e610c87"
 *                       status:
 *                         type: string
 *                         example: "pending"
 *                       code:
 *                         type: string
 *                         example: "XYZ123"
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *                       studentName:
 *                         type: string
 *                         example: "John Smith"
 *                       studentGrade:
 *                         type: number
 *                         example: 5
 *       '403':
 *         description: Not authorized to view join requests for this class
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
 *                   example: "Not authorized to view join requests for this class"
 *       '404':
 *         description: Class not found or teacher profile not found
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
 *                   example: "Class not found"
 *       '500':
 *         description: Failed to get pending join requests
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
 *                   example: "Failed to get pending join requests"
 *                 error:
 *                   type: string
 */
router.get(
  "/classes/:id/join-requests",
  authMiddleware.verifyToken,
  authMiddleware.checkRole(["teacher", "school_admin", "platform_admin"]),
  schoolClassController.getPendingJoinRequests
);

/**
 * @openapi
 * /classes/classes/{id}/join-requests/{requestId}:
 *   post:
 *     summary: Respond to a join request
 *     description: Approve or reject a student's request to join a class. Limited to teachers assigned to the class, school admins, and platform admins.
 *     tags:
 *       - School Classes
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         description: ID of the class
 *         required: true
 *         schema:
 *           type: string
 *       - name: requestId
 *         in: path
 *         description: ID of the join request
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       description: Response to the join request
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               action:
 *                 type: string
 *                 enum: [approve, reject]
 *                 description: Whether to approve or reject the request
 *                 example: "approve"
 *             required:
 *               - action
 *     responses:
 *       '200':
 *         description: Join request processed successfully
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
 *                   example: "Join request approved successfully"
 *       '400':
 *         description: Action must be either 'approve' or 'reject'
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
 *                   example: "Action must be either 'approve' or 'reject'"
 *       '403':
 *         description: Not authorized to manage join requests for this class
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
 *                   example: "Not authorized to manage join requests for this class"
 *       '404':
 *         description: Class, join request, or teacher profile not found
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
 *                   example: "Join request not found or already processed"
 *       '500':
 *         description: Failed to respond to join request
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
 *                   example: "Failed to respond to join request"
 *                 error:
 *                   type: string
 */
router.post(
  "/classes/:id/join-requests/:requestId",
  authMiddleware.verifyToken,
  authMiddleware.checkRole(["teacher", "school_admin", "platform_admin"]),
  schoolClassController.respondToJoinRequest
);

/**
 * @openapi
 * /classes/{id}/assign-teacher:
 *   put:
 *     summary: Assign a teacher to a class
 *     description: Assigns a teacher to a class. Only school administrators can perform this action.
 *     tags:
 *       - School Classes
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         description: ID of the class
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       description: Teacher assignment information
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               teacherId:
 *                 type: string
 *                 description: ID of the teacher to assign
 *                 example: "60d21b4667d0d8992e610c88"
 *             required:
 *               - teacherId
 *     responses:
 *       '200':
 *         description: Teacher assigned to class successfully
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
 *                   example: "Teacher assigned to class successfully"
 *                 data:
 *                   $ref: '#/components/schemas/SchoolClass'
 *       '400':
 *         description: Teacher ID is required, teacher already assigned, or teacher not from same school
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
 *                   example: "Teacher must belong to the same school as the class"
 *       '403':
 *         description: Not authorized to assign teachers. Only school administrators can perform this action.
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
 *                   example: "Not authorized to assign teachers to this class. Only school administrators can perform this action."
 *       '404':
 *         description: Class or teacher not found
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
 *                   example: "Teacher not found"
 *       '500':
 *         description: Failed to assign teacher to class
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
 *                   example: "Failed to assign teacher to class"
 *                 error:
 *                   type: string
 */
router.put(
  "/:id/assign-teacher",
  authMiddleware.verifyToken,
  authMiddleware.checkRole(["school_admin", "platform_admin"]),
  schoolClassController.assignTeacherToClass
);

module.exports = router;
