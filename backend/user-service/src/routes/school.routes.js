const express = require("express");
const schoolController = require("../controllers/school.controller");
const authMiddleware = require("../middleware/auth.middleware");
const studentController = require("../controllers/student.controller");

const router = express.Router();

/**
 * @openapi
 * components:
 *   schemas:
 *     School:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           description: Unique identifier for the school
 *         name:
 *           type: string
 *           description: Name of the school
 *         address:
 *           type: string
 *           description: Physical address of the school
 *         city:
 *           type: string
 *           description: City where the school is located
 *         state:
 *           type: string
 *           description: State/province where the school is located
 *         zipCode:
 *           type: string
 *           description: Postal/ZIP code
 *         country:
 *           type: string
 *           description: Country where the school is located
 *         phone:
 *           type: string
 *           description: Contact phone number
 *         email:
 *           type: string
 *           description: Contact email address
 *         website:
 *           type: string
 *           description: School website URL
 *         logo:
 *           type: string
 *           description: URL to school logo image
 *         adminIds:
 *           type: array
 *           items:
 *             type: string
 *           description: List of user IDs who are administrators of this school
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: School creation timestamp
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: School last update timestamp
 */

/**
 * @openapi
 * /schools:
 *   post:
 *     summary: Create a new school
 *     description: Creates a new school and makes the current user a school admin
 *     tags:
 *       - Schools
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       description: School details
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: Name of the school
 *                 example: "Springfield Elementary School"
 *               address:
 *                 type: string
 *                 description: Physical address
 *                 example: "123 School Lane"
 *               city:
 *                 type: string
 *                 description: City
 *                 example: "Springfield"
 *               state:
 *                 type: string
 *                 description: State/province
 *                 example: "IL"
 *               zipCode:
 *                 type: string
 *                 description: Postal/ZIP code
 *                 example: "62701"
 *               country:
 *                 type: string
 *                 description: Country
 *                 example: "USA"
 *               phone:
 *                 type: string
 *                 description: Contact phone
 *                 example: "555-123-4567"
 *               email:
 *                 type: string
 *                 description: Contact email
 *                 example: "info@springfield.edu"
 *               website:
 *                 type: string
 *                 description: Website URL
 *                 example: "https://springfield.edu"
 *               logo:
 *                 type: string
 *                 description: Logo URL
 *                 example: "https://example.com/logo.png"
 *             required:
 *               - name
 *     responses:
 *       '201':
 *         description: School created successfully
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
 *                   example: "School created successfully"
 *                 data:
 *                   $ref: '#/components/schemas/School'
 *       '400':
 *         description: School name is required
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
 *                   example: "School name is required"
 *       '500':
 *         description: Failed to create school
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
 *                   example: "Failed to create school"
 *                 error:
 *                   type: string
 */
router.post("/", authMiddleware.verifyToken, schoolController.createSchool);

/**
 * @openapi
 * /schools/me:
 *   get:
 *     summary: Get current user's school profile
 *     description: Retrieves the school profile that the current user is an admin of
 *     tags:
 *       - Schools
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       '200':
 *         description: School profile retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/School'
 *       '404':
 *         description: School profile not found
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
 *                   example: "School profile not found"
 *       '500':
 *         description: Failed to get school profile
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
 *                   example: "Failed to get school profile"
 *                 error:
 *                   type: string
 */
router.get(
  "/me",
  authMiddleware.verifyToken,
  authMiddleware.checkRole(["school_admin", "platform_admin"]),
  schoolController.getSchoolProfile
);

/**
 * @openapi
 * /schools/me:
 *   put:
 *     summary: Update school profile
 *     description: Updates the school profile that the current user is an admin of
 *     tags:
 *       - Schools
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       description: Updated school details
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: School name
 *               address:
 *                 type: string
 *                 description: Physical address
 *               city:
 *                 type: string
 *                 description: City
 *               state:
 *                 type: string
 *                 description: State/province
 *               zipCode:
 *                 type: string
 *                 description: Postal/ZIP code
 *               country:
 *                 type: string
 *                 description: Country
 *               phone:
 *                 type: string
 *                 description: Contact phone
 *               email:
 *                 type: string
 *                 description: Contact email
 *               website:
 *                 type: string
 *                 description: Website URL
 *               logo:
 *                 type: string
 *                 description: Logo URL
 *     responses:
 *       '200':
 *         description: School profile updated successfully
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
 *                   example: "School profile updated successfully"
 *                 data:
 *                   $ref: '#/components/schemas/School'
 *       '404':
 *         description: School profile not found
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
 *                   example: "School profile not found"
 *       '500':
 *         description: Failed to update school profile
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
 *                   example: "Failed to update school profile"
 *                 error:
 *                   type: string
 */
router.put(
  "/me",
  authMiddleware.verifyToken,
  authMiddleware.checkRole(["school_admin", "platform_admin"]),
  schoolController.updateSchoolProfile
);

/**
 * @openapi
 * /schools/me/teachers:
 *   get:
 *     summary: Get all teachers for a school
 *     description: Retrieves all teachers associated with the current user's school
 *     tags:
 *       - Schools
 *       - Teachers
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       '200':
 *         description: Teachers retrieved successfully
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
 *                       userId:
 *                         type: object
 *                         properties:
 *                           _id:
 *                             type: string
 *                           firstName:
 *                             type: string
 *                           lastName:
 *                             type: string
 *                           email:
 *                             type: string
 *                           avatar:
 *                             type: string
 *                       schoolId:
 *                         type: string
 *                       classIds:
 *                         type: array
 *                         items:
 *                           type: string
 *                       subjectsTaught:
 *                         type: array
 *                         items:
 *                           type: string
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *                       updatedAt:
 *                         type: string
 *                         format: date-time
 *       '404':
 *         description: School profile not found
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
 *                   example: "School profile not found"
 *       '500':
 *         description: Failed to get teachers
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
 *                   example: "Failed to get teachers"
 *                 error:
 *                   type: string
 */
router.get(
  "/me/teachers",
  authMiddleware.verifyToken,
  authMiddleware.checkRole(["school_admin", "platform_admin"]),
  schoolController.getTeachers
);

/**
 * @openapi
 * /schools/teachers:
 *   post:
 *     summary: Add a teacher to the school
 *     description: Adds a teacher to the current user's school by email
 *     tags:
 *       - Schools
 *       - Teachers
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       description: Teacher details
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               teacherEmail:
 *                 type: string
 *                 format: email
 *                 description: Email of the user to add as teacher
 *                 example: "teacher@example.com"
 *               subjectsTaught:
 *                 type: array
 *                 description: Subjects taught by the teacher (optional)
 *                 items:
 *                   type: string
 *                   example: "Mathematics"
 *             required:
 *               - teacherEmail
 *     responses:
 *       '201':
 *         description: Teacher added successfully
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
 *                   example: "Teacher added successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                     userId:
 *                       type: string
 *                     schoolId:
 *                       type: string
 *                     subjectsTaught:
 *                       type: array
 *                       items:
 *                         type: string
 *                     classIds:
 *                       type: array
 *                       items:
 *                         type: string
 *       '400':
 *         description: User is already a teacher
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
 *                   example: "User is already a teacher"
 *       '404':
 *         description: User not found or school profile not found
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
 *                   example: "User not found with this email"
 *       '500':
 *         description: Failed to add teacher
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
 *                   example: "Failed to add teacher"
 *                 error:
 *                   type: string
 */
router.post(
  "/teachers",
  authMiddleware.verifyToken,
  authMiddleware.checkRole(["school_admin", "platform_admin"]),
  schoolController.addTeacher
);

/**
 * @openapi
 * /schools/teachers/{id}:
 *   delete:
 *     summary: Remove a teacher from the school
 *     description: Removes a teacher from the current user's school
 *     tags:
 *       - Schools
 *       - Teachers
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         description: ID of the teacher to remove
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       '200':
 *         description: Teacher removed successfully
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
 *                   example: "Teacher removed successfully"
 *       '403':
 *         description: Not authorized to remove this teacher
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
 *                   example: "Not authorized to remove this teacher"
 *       '404':
 *         description: Teacher not found or school profile not found
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
 *         description: Failed to remove teacher
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
 *                   example: "Failed to remove teacher"
 *                 error:
 *                   type: string
 */
router.delete(
  "/teachers/:id",
  authMiddleware.verifyToken,
  authMiddleware.checkRole(["school_admin", "platform_admin"]),
  schoolController.removeTeacher
);

/**
 * @openapi
 * /schools/me/students:
 *   get:
 *     summary: Get all students for a school
 *     description: Retrieves all students associated with the current user's school
 *     tags:
 *       - Schools
 *       - Students
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       '200':
 *         description: Students retrieved successfully
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
 *                       userId:
 *                         type: object
 *                         properties:
 *                           _id:
 *                             type: string
 *                           firstName:
 *                             type: string
 *                           lastName:
 *                             type: string
 *                           email:
 *                             type: string
 *                           avatar:
 *                             type: string
 *                           dateOfBirth:
 *                             type: string
 *                             format: date-time
 *                       grade:
 *                         type: number
 *                       schoolId:
 *                         type: string
 *                       parentIds:
 *                         type: array
 *                         items:
 *                           type: string
 *                       teacherIds:
 *                         type: array
 *                         items:
 *                           type: string
 *       '404':
 *         description: School profile not found
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
 *                   example: "School profile not found"
 *       '500':
 *         description: Failed to get students
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
 *                   example: "Failed to get students"
 *                 error:
 *                   type: string
 */
router.get(
  "/me/students",
  authMiddleware.verifyToken,
  authMiddleware.checkRole(["school_admin", "platform_admin", "teacher"]),
  schoolController.getStudents
);

/**
 * @openapi
 * /schools/me/classes:
 *   get:
 *     summary: Get all classes for a school
 *     description: Retrieves all classes associated with the current user's school
 *     tags:
 *       - Schools
 *       - Classes
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       '200':
 *         description: Classes retrieved successfully
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
 *                       name:
 *                         type: string
 *                       grade:
 *                         type: number
 *                       schoolId:
 *                         type: string
 *                       teacherId:
 *                         type: object
 *                         properties:
 *                           _id:
 *                             type: string
 *                           userId:
 *                             type: string
 *                       studentIds:
 *                         type: array
 *                         items:
 *                           type: string
 *                       joinCode:
 *                         type: string
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *                       updatedAt:
 *                         type: string
 *                         format: date-time
 *       '404':
 *         description: School profile not found
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
 *                   example: "School profile not found"
 *       '500':
 *         description: Failed to get classes
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
 *                   example: "Failed to get classes"
 *                 error:
 *                   type: string
 */
router.get(
  "/me/classes",
  authMiddleware.verifyToken,
  authMiddleware.checkRole(["school_admin", "platform_admin"]),
  schoolController.getClasses
);

/**
 * @openapi
 * /schools/import/students:
 *   post:
 *     summary: Bulk import students
 *     description: Imports multiple students at once for the school
 *     tags:
 *       - Schools
 *       - Students
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       description: Student data for import
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               students:
 *                 type: array
 *                 description: Array of student data to import
 *                 items:
 *                   type: object
 *                   properties:
 *                     firstName:
 *                       type: string
 *                       description: Student's first name
 *                     lastName:
 *                       type: string
 *                       description: Student's last name
 *                     email:
 *                       type: string
 *                       description: Student's email
 *                     grade:
 *                       type: number
 *                       description: Student's grade level
 *                     classId:
 *                       type: string
 *                       description: Optional class ID to assign the student to
 *             required:
 *               - students
 *     responses:
 *       '200':
 *         description: Students imported successfully
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
 *                   example: "25 students imported successfully"
 *       '400':
 *         description: No students provided for import
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
 *                   example: "No students provided for import"
 *       '404':
 *         description: School profile not found
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
 *                   example: "School profile not found"
 *       '500':
 *         description: Failed to import students
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
 *                   example: "Failed to import students"
 *                 error:
 *                   type: string
 */
router.post(
  "/import/students",
  authMiddleware.verifyToken,
  authMiddleware.checkRole(["school_admin", "platform_admin"]),
  schoolController.importStudents
);

/**
 * @openapi
 * /schools/{id}/points-account:
 *   patch:
 *     summary: Update student's points account ID
 *     description: Updates the points account ID for a student. Used by the points service.
 *     tags:
 *       - Students
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         description: Student ID
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       description: Points account details
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               pointsAccountId:
 *                 type: string
 *                 description: Points account ID from the points service
 *                 example: "60d21b4667d0d8992e610c96"
 *             required:
 *               - pointsAccountId
 *     responses:
 *       '200':
 *         description: Points account ID updated successfully
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
 *                   example: "Points account ID updated successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     studentId:
 *                       type: string
 *                       example: "60d21b4667d0d8992e610c85"
 *                     pointsAccountId:
 *                       type: string
 *                       example: "60d21b4667d0d8992e610c96"
 *       '400':
 *         description: Points account ID is required
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
 *                   example: "Points account ID is required"
 *       '404':
 *         description: Student not found
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
 *         description: Failed to update points account ID
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
 *                   example: "Failed to update points account ID"
 *                 error:
 *                   type: string
 */
router.patch(
  "/:id/points-account",
  authMiddleware.verifyToken,
  authMiddleware.checkRole([
    "platform_admin",
    "school_admin",
    "system",
    "student",
  ]),
  studentController.updatePointsAccount
);

/**
 * @openapi
 * /schools/{id}/administrators:
 *   put:
 *     summary: Update school administrators
 *     description: Replaces the list of administrators for a school
 *     tags:
 *       - Schools
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         description: School ID
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       description: Administrator details
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               adminIds:
 *                 type: array
 *                 description: Array of user IDs to set as administrators
 *                 items:
 *                   type: string
 *                   example: "60d21b4667d0d8992e610c87"
 *             required:
 *               - adminIds
 *     responses:
 *       '200':
 *         description: School administrators updated successfully
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
 *                   example: "School administrators updated successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     schoolId:
 *                       type: string
 *                       example: "60d21b4667d0d8992e610c88"
 *                     administrators:
 *                       type: array
 *                       items:
 *                         type: string
 *                         example: "60d21b4667d0d8992e610c87"
 *       '400':
 *         description: Administrator IDs are required
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
 *                   example: "Administrator IDs are required (must be a non-empty array)"
 *       '403':
 *         description: Not authorized to update school administrators
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
 *                   example: "Not authorized to update school administrators"
 *       '404':
 *         description: School not found or user not found
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
 *                   example: "School not found"
 *       '500':
 *         description: Failed to update administrators
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
 *                   example: "Failed to update school administrators"
 *                 error:
 *                   type: string
 */
router.put(
  "/:id/administrators",
  authMiddleware.verifyToken,
  authMiddleware.checkRole(["school_admin", "platform_admin"]),
  schoolController.updateAdministrators
);

/**
 * @openapi
 * /schools/{id}/administrators:
 *   post:
 *     summary: Add an administrator to a school
 *     description: Adds a new administrator to a school by email
 *     tags:
 *       - Schools
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         description: School ID
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       description: Administrator details
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userEmail:
 *                 type: string
 *                 format: email
 *                 description: Email of the user to add as administrator
 *                 example: "admin@example.com"
 *             required:
 *               - userEmail
 *     responses:
 *       '200':
 *         description: Administrator added successfully
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
 *                   example: "Administrator added successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     schoolId:
 *                       type: string
 *                       example: "60d21b4667d0d8992e610c88"
 *                     administrators:
 *                       type: array
 *                       items:
 *                         type: string
 *                         example: "60d21b4667d0d8992e610c87"
 *       '400':
 *         description: User email is required or user is already an administrator
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
 *                   example: "User email is required"
 *       '403':
 *         description: Not authorized to add school administrators
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
 *                   example: "Not authorized to add school administrators"
 *       '404':
 *         description: School not found or user not found
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
 *                   example: "User not found with this email"
 *       '500':
 *         description: Failed to add administrator
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
 *                   example: "Failed to add administrator"
 *                 error:
 *                   type: string
 */
router.post(
  "/:id/administrators",
  authMiddleware.verifyToken,
  authMiddleware.checkRole(["school_admin", "platform_admin"]),
  schoolController.addAdministrator
);

/**
 * @openapi
 * /schools/{id}/administrators/{userId}:
 *   delete:
 *     summary: Remove an administrator from a school
 *     description: Removes an administrator from a school
 *     tags:
 *       - Schools
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         description: School ID
 *         required: true
 *         schema:
 *           type: string
 *       - name: userId
 *         in: path
 *         description: User ID of the administrator to remove
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       '200':
 *         description: Administrator removed successfully
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
 *                   example: "Administrator removed successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     schoolId:
 *                       type: string
 *                       example: "60d21b4667d0d8992e610c88"
 *                     administrators:
 *                       type: array
 *                       items:
 *                         type: string
 *                         example: "60d21b4667d0d8992e610c87"
 *       '400':
 *         description: Cannot remove yourself or the last administrator
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
 *                   example: "Cannot remove the last administrator of a school"
 *       '403':
 *         description: Not authorized to remove school administrators
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
 *                   example: "Not authorized to remove school administrators"
 *       '404':
 *         description: School not found
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
 *                   example: "School not found"
 *       '500':
 *         description: Failed to remove administrator
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
 *                   example: "Failed to remove administrator"
 *                 error:
 *                   type: string
 */
router.delete(
  "/:id/administrators/:userId",
  authMiddleware.verifyToken,
  authMiddleware.checkRole(["school_admin", "platform_admin"]),
  schoolController.removeAdministrator
);

/**
 * @openapi
 * /schools/{id}/administrators:
 *   get:
 *     summary: Get all administrators for a school
 *     description: Retrieves all administrators for a school
 *     tags:
 *       - Schools
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         description: School ID
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       '200':
 *         description: Administrators retrieved successfully
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
 *                       email:
 *                         type: string
 *                       firstName:
 *                         type: string
 *                       lastName:
 *                         type: string
 *                       roles:
 *                         type: array
 *                         items:
 *                           type: string
 *                       avatar:
 *                         type: string
 *       '404':
 *         description: School not found
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
 *                   example: "School not found"
 *       '500':
 *         description: Failed to get school administrators
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
 *                   example: "Failed to get school administrators"
 *                 error:
 *                   type: string
 */
router.get(
  "/:id/administrators",
  authMiddleware.verifyToken,
  schoolController.getAdministrators
);

/**
 * @openapi
 * /schools/join-requests:
 *   get:
 *     summary: Get all pending join requests
 *     description: Retrieves all pending join requests for the school
 *     tags:
 *       - Schools
 *       - Link Requests
 *     security:
 *       - bearerAuth: []
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
 *                       studentId:
 *                         type: object
 *                         properties:
 *                           _id:
 *                             type: string
 *                           userId:
 *                             type: string
 *                       requestType:
 *                         type: string
 *                         enum: [school]
 *                       targetId:
 *                         type: string
 *                       status:
 *                         type: string
 *                         enum: [pending]
 *                       code:
 *                         type: string
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *                       expiresAt:
 *                         type: string
 *                         format: date-time
 *                       studentName:
 *                         type: string
 *                       studentGrade:
 *                         type: number
 *       '404':
 *         description: School profile not found
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
 *                   example: "School profile not found"
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
  "/join-requests",
  authMiddleware.verifyToken,
  authMiddleware.checkRole(["school_admin", "platform_admin"]),
  schoolController.getAllPendingJoinRequests
);

/**
 * @openapi
 * /schools/join-requests/{requestId}:
 *   post:
 *     summary: Respond to a join request
 *     description: Approve or reject a student's request to join the school
 *     tags:
 *       - Schools
 *       - Link Requests
 *     security:
 *       - bearerAuth: []
 *     parameters:
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
 *                 description: Action to take on the request
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
 *       '404':
 *         description: Join request not found or school profile not found
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
  "/join-requests/:requestId",
  authMiddleware.verifyToken,
  authMiddleware.checkRole(["school_admin", "platform_admin"]),
  schoolController.respondToJoinRequest
);

module.exports = router;
