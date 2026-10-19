import { Router } from "express";

import {
  createStudent,
  getAllStudents,
  getStudentStats,
  getStudentById,
  updateStudent,
  deleteStudent,
  enrollStudent,
  getStudentEnrollments,
  getProgramEnrollments,
  getEnrollmentById,
  updateEnrollment,
  updateEnrollmentStatus,
  deleteEnrollment,
  recordPayment,
  getEnrollmentPayments,
  updatePaymentStatus,
  deletePayment,
  recordAttendance,
  recordClassAttendance,
  getAttendance,
  deleteAttendance,
  getCertificateEligibility,
  issueCertificate,
  getCertificates,
  revokeCertificate,
  verifyCertificate,
  createAssessment,
  getAssessments,
  updateAssessment,
  deleteAssessment,
} from "../../controller/students/student.controller.js";

import {
  authenticateUser,
  authorizeRoles,
} from "../../middleware/auth/auth.middleware.js";

import { validate } from "../../middleware/validate.middleware.js";
// import { createStudentSchema } from "../../middleware/validators/students/student.validator.js";

import {
  createStudentSchema,
  updateStudentSchema,
  enrollStudentSchema,
  updateEnrollmentSchema,
  updateEnrollmentStatusSchema,
  recordPaymentSchema,
  updatePaymentStatusSchema,
  recordAttendanceSchema,
  recordClassAttendanceSchema,
  issueCertificateSchema,
  createAssessmentSchema,
  updateAssessmentSchema,
  studentIdParamsSchema,
  enrollmentIdParamsSchema,
  enrollmentProgramParamsSchema,
  paymentIdParamsSchema,
  attendanceIdParamsSchema,
  certificateIdParamsSchema,
  certificateNoParamsSchema,
  assessmentIdParamsSchema,
  getStudentsQuerySchema,
  forceDeleteQuerySchema,
  certificateEligibilityQuerySchema,
} from "../../middleware/validators/students/student.validator.js";

const router = Router();

// Mounted at /api/students, for example:
//   app.use("/api/students", studentRoutes);
//
// In the routes below, ":id" is the ID named in the comment above
// each route (student, enrollment, payment, attendance record,
// certificate or assessment).

// ======================================
// PUBLIC ROUTES
// ======================================

// Verify a certificate by its number (anyone can check authenticity)
// Example: GET /verify-certificate/CERT-2026-0001
router.get(
  "/verify-certificate/:certificateNo",
  validate(certificateNoParamsSchema, "params"),
  verifyCertificate,
);

// ======================================
// STUDENT RECORDS
// ======================================

// Register a new student — admin only
// Can also enrol the student in a program and record a first deposit
router.post(
  "/register-student",
  authenticateUser,
  authorizeRoles("admin"),
  validate(createStudentSchema),
  createStudent,
);

// Get all students — admin only
// Supports search, filters, sorting and pagination
// Example: GET /get-all-students?search=amina&status=active&page=1&limit=10
router.get(
  "/get-all-students",
  authenticateUser,
  authorizeRoles("admin"),
  validate(getStudentsQuerySchema, "query"),
  getAllStudents,
);

// Get student summary figures (status counts and fee totals) — admin only
router.get(
  "/get-student-stats",
  authenticateUser,
  authorizeRoles("admin"),
  getStudentStats,
);

// Get one student with all their enrollments (:id = student ID) — admin only
router.get(
  "/get-student-by-id/:id",
  authenticateUser,
  authorizeRoles("admin"),
  validate(studentIdParamsSchema, "params"),
  getStudentById,
);

// Update a student's details (:id = student ID) — admin only
router.patch(
  "/update-student/:id",
  authenticateUser,
  authorizeRoles("admin"),
  validate(studentIdParamsSchema, "params"),
  validate(updateStudentSchema),
  updateStudent,
);

// Delete a student (:id = student ID) — admin only
// Students with payment history need ?force=true
router.delete(
  "/delete-student/:id",
  authenticateUser,
  authorizeRoles("admin"),
  validate(studentIdParamsSchema, "params"),
  validate(forceDeleteQuerySchema, "query"),
  deleteStudent,
);

// ======================================
// ENROLLMENTS
// ======================================

// Enrol an existing student in a program (:id = student ID) — admin only
router.post(
  "/enroll-student/:id",
  authenticateUser,
  authorizeRoles("admin"),
  validate(studentIdParamsSchema, "params"),
  validate(enrollStudentSchema),
  enrollStudent,
);

// Get all enrollments of one student (:id = student ID) — admin only
router.get(
  "/get-student-enrollments/:id",
  authenticateUser,
  authorizeRoles("admin"),
  validate(studentIdParamsSchema, "params"),
  getStudentEnrollments,
);

// Get the class list of a program — admin only
// Example: GET /get-program-enrollments/:programId
router.get(
  "/get-program-enrollments/:programId",
  authenticateUser,
  authorizeRoles("admin"),
  validate(enrollmentProgramParamsSchema, "params"),
  getProgramEnrollments,
);

// Get one enrollment with fees, attendance and certificate info
// (:id = enrollment ID) — admin only
router.get(
  "/get-enrollment-by-id/:id",
  authenticateUser,
  authorizeRoles("admin"),
  validate(enrollmentIdParamsSchema, "params"),
  getEnrollmentById,
);

// Update an enrollment's fee, progress, final score or notes
// (:id = enrollment ID) — admin only
router.patch(
  "/update-enrollment/:id",
  authenticateUser,
  authorizeRoles("admin"),
  validate(enrollmentIdParamsSchema, "params"),
  validate(updateEnrollmentSchema),
  updateEnrollment,
);

// Change an enrollment's status: active, on_hold, dropped or completed
// (:id = enrollment ID) — admin only
router.patch(
  "/update-enrollment-status/:id",
  authenticateUser,
  authorizeRoles("admin"),
  validate(enrollmentIdParamsSchema, "params"),
  validate(updateEnrollmentStatusSchema),
  updateEnrollmentStatus,
);

// Delete an enrollment (:id = enrollment ID) — admin only
// Enrollments with payment history need ?force=true
router.delete(
  "/delete-enrollment/:id",
  authenticateUser,
  authorizeRoles("admin"),
  validate(enrollmentIdParamsSchema, "params"),
  validate(forceDeleteQuerySchema, "query"),
  deleteEnrollment,
);

// ======================================
// PAYMENTS
// ======================================

// Record a payment for an enrollment (:id = enrollment ID) — admin only
router.post(
  "/record-payment/:id",
  authenticateUser,
  authorizeRoles("admin"),
  validate(enrollmentIdParamsSchema, "params"),
  validate(recordPaymentSchema),
  recordPayment,
);

// Get an enrollment's payments with total fee, amount paid and balance
// (:id = enrollment ID) — admin only
router.get(
  "/get-enrollment-payments/:id",
  authenticateUser,
  authorizeRoles("admin"),
  validate(enrollmentIdParamsSchema, "params"),
  getEnrollmentPayments,
);

// Change a payment's status: pending, successful, failed or refunded
// (:id = payment ID) — admin only
router.patch(
  "/update-payment-status/:id",
  authenticateUser,
  authorizeRoles("admin"),
  validate(paymentIdParamsSchema, "params"),
  validate(updatePaymentStatusSchema),
  updatePaymentStatus,
);

// Delete a payment record (:id = payment ID) — admin only
router.delete(
  "/delete-payment/:id",
  authenticateUser,
  authorizeRoles("admin"),
  validate(paymentIdParamsSchema, "params"),
  deletePayment,
);

// ======================================
// ATTENDANCE
// ======================================

// Record attendance for one student in one session
// (:id = enrollment ID) — admin only
router.post(
  "/record-attendance/:id",
  authenticateUser,
  authorizeRoles("admin"),
  validate(enrollmentIdParamsSchema, "params"),
  validate(recordAttendanceSchema),
  recordAttendance,
);

// Record the whole class register for one session — admin only
router.post(
  "/record-class-attendance",
  authenticateUser,
  authorizeRoles("admin"),
  validate(recordClassAttendanceSchema),
  recordClassAttendance,
);

// Get an enrollment's attendance records and percentage
// (:id = enrollment ID) — admin only
router.get(
  "/get-enrollment-attendance/:id",
  authenticateUser,
  authorizeRoles("admin"),
  validate(enrollmentIdParamsSchema, "params"),
  getAttendance,
);

// Delete an attendance record (:id = attendance record ID) — admin only
router.delete(
  "/delete-attendance/:id",
  authenticateUser,
  authorizeRoles("admin"),
  validate(attendanceIdParamsSchema, "params"),
  deleteAttendance,
);

// ======================================
// CERTIFICATES
// ======================================

// Check whether an enrollment qualifies for a certificate
// (:id = enrollment ID) — admin only
// Example: GET /check-certificate-eligibility/:id?minAttendance=75
router.get(
  "/check-certificate-eligibility/:id",
  authenticateUser,
  authorizeRoles("admin"),
  validate(enrollmentIdParamsSchema, "params"),
  validate(certificateEligibilityQuerySchema, "query"),
  getCertificateEligibility,
);

// Issue a completion or participation certificate
// (:id = enrollment ID) — admin only
router.post(
  "/issue-certificate/:id",
  authenticateUser,
  authorizeRoles("admin"),
  validate(enrollmentIdParamsSchema, "params"),
  validate(issueCertificateSchema),
  issueCertificate,
);

// Get all certificates of an enrollment, including revoked ones
// (:id = enrollment ID) — admin only
router.get(
  "/get-enrollment-certificates/:id",
  authenticateUser,
  authorizeRoles("admin"),
  validate(enrollmentIdParamsSchema, "params"),
  getCertificates,
);

// Revoke an issued certificate (:id = certificate ID) — admin only
// The record is kept so verification shows it as revoked
router.patch(
  "/revoke-certificate/:id",
  authenticateUser,
  authorizeRoles("admin"),
  validate(certificateIdParamsSchema, "params"),
  revokeCertificate,
);

// ======================================
// ASSESSMENTS
// ======================================

// Record an assessment score for an enrollment
// (:id = enrollment ID) — admin only
router.post(
  "/create-assessment/:id",
  authenticateUser,
  authorizeRoles("admin"),
  validate(enrollmentIdParamsSchema, "params"),
  validate(createAssessmentSchema),
  createAssessment,
);

// Get an enrollment's assessments with the average percentage
// (:id = enrollment ID) — admin only
router.get(
  "/get-enrollment-assessments/:id",
  authenticateUser,
  authorizeRoles("admin"),
  validate(enrollmentIdParamsSchema, "params"),
  getAssessments,
);

// Update an assessment (:id = assessment ID) — admin only
router.patch(
  "/update-assessment/:id",
  authenticateUser,
  authorizeRoles("admin"),
  validate(assessmentIdParamsSchema, "params"),
  validate(updateAssessmentSchema),
  updateAssessment,
);

// Delete an assessment (:id = assessment ID) — admin only
router.delete(
  "/delete-assessment/:id",
  authenticateUser,
  authorizeRoles("admin"),
  validate(assessmentIdParamsSchema, "params"),
  deleteAssessment,
);

export default router;
