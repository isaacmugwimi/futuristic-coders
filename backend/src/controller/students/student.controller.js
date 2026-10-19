import asyncHandler from "../../middleware/error/asyncHandler.js";
import * as studentService from "../../services/students/students.service.js";

// ============================================================
// HELPERS
// ============================================================

// The services read user.userId; make sure it exists whichever
// field name the auth middleware used (id or userId).
const getUser = (req) => ({
  ...req.user,
  id: req.user?.id ?? req.user?.userId,
  userId: req.user?.userId ?? req.user?.id,
});

// ?force=true confirms deleting records that have payment history.
const isForced = (req) => req.query.force === "true";

// ============================================================
// CREATE STUDENT
// POST /api/students
// ============================================================

export const createStudent = asyncHandler(async (req, res) => {
  const student = await studentService.createStudentService(
    req.body,
    getUser(req),
  );

  return res.status(201).json({
    success: true,
    message: "Student registered successfully.",
    data: student,
  });
});

// ============================================================
// GET ALL STUDENTS
// GET /api/students?search=&status=&programId=&paymentStatus=
//     &ageGroup=&county=&sortBy=&sortOrder=&page=&limit=
// ============================================================

export const getAllStudents = asyncHandler(async (req, res) => {
  const { students, total, page, limit, total_pages } =
    await studentService.getAllStudentsService(req.query);

  return res.status(200).json({
    success: true,
    count: students.length,
    pagination: {
      total,
      page,
      limit,
      totalPages: total_pages,
    },
    data: students,
  });
});

// ============================================================
// GET STUDENT STATS
// GET /api/students/stats
// ============================================================

export const getStudentStats = asyncHandler(async (req, res) => {
  const stats = await studentService.getStudentStatsService();

  return res.status(200).json({
    success: true,
    data: stats,
  });
});

// ============================================================
// GET STUDENT BY ID
// GET /api/students/:id
// ============================================================

export const getStudentById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const student = await studentService.getStudentByIdService(id);

  return res.status(200).json({
    success: true,
    data: student,
  });
});

// ============================================================
// UPDATE STUDENT
// PATCH /api/students/:id
// ============================================================

export const updateStudent = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const student = await studentService.updateStudentService(
    id,
    req.body,
    getUser(req),
  );

  return res.status(200).json({
    success: true,
    message: "Student updated successfully.",
    data: student,
  });
});

// ============================================================
// DELETE STUDENT
// DELETE /api/students/:id?force=true
// ============================================================

export const deleteStudent = asyncHandler(async (req, res) => {
  const { id } = req.params;

  await studentService.deleteStudentService(id, getUser(req), {
    force: isForced(req),
  });

  return res.status(200).json({
    success: true,
    message: "Student deleted successfully.",
  });
});

// ============================================================
// ENROL STUDENT IN A PROGRAM
// POST /api/students/:id/enrollments
// ============================================================

export const enrollStudent = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const enrollment = await studentService.enrollStudentService(
    id,
    req.body,
    getUser(req),
  );

  return res.status(201).json({
    success: true,
    message: "Student enrolled successfully.",
    data: enrollment,
  });
});

// ============================================================
// GET ENROLLMENTS BY STUDENT
// GET /api/students/:id/enrollments
// ============================================================

export const getStudentEnrollments = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const enrollments = await studentService.getStudentEnrollmentsService(id);

  return res.status(200).json({
    success: true,
    count: enrollments.length,
    data: enrollments,
  });
});

// ============================================================
// GET ENROLLMENTS BY PROGRAM (class list)
// GET /api/enrollments/program/:programId
// ============================================================

export const getProgramEnrollments = asyncHandler(async (req, res) => {
  const { programId } = req.params;

  const enrollments =
    await studentService.getProgramEnrollmentsService(programId);

  return res.status(200).json({
    success: true,
    count: enrollments.length,
    data: enrollments,
  });
});

// ============================================================
// GET ENROLLMENT BY ID
// GET /api/enrollments/:id
// ============================================================

export const getEnrollmentById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const enrollment = await studentService.getEnrollmentByIdService(id);

  return res.status(200).json({
    success: true,
    data: enrollment,
  });
});

// ============================================================
// UPDATE ENROLLMENT (fee, progress, final score, notes)
// PATCH /api/enrollments/:id
// ============================================================

export const updateEnrollment = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const enrollment = await studentService.updateEnrollmentService(
    id,
    req.body,
    getUser(req),
  );

  return res.status(200).json({
    success: true,
    message: "Enrollment updated successfully.",
    data: enrollment,
  });
});

// ============================================================
// UPDATE ENROLLMENT STATUS
// PATCH /api/enrollments/:id/status
// Body: { "status": "active" | "on_hold" | "dropped" | "completed" }
// ============================================================

export const updateEnrollmentStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  const enrollment = await studentService.updateEnrollmentStatusService(
    id,
    status,
    getUser(req),
  );

  return res.status(200).json({
    success: true,
    message: "Enrollment status updated successfully.",
    data: enrollment,
  });
});

// ============================================================
// DELETE ENROLLMENT
// DELETE /api/enrollments/:id?force=true
// ============================================================

export const deleteEnrollment = asyncHandler(async (req, res) => {
  const { id } = req.params;

  await studentService.deleteEnrollmentService(id, getUser(req), {
    force: isForced(req),
  });

  return res.status(200).json({
    success: true,
    message: "Enrollment deleted successfully.",
  });
});

// ============================================================
// RECORD PAYMENT
// POST /api/enrollments/:id/payments
// ============================================================

export const recordPayment = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const payment = await studentService.recordPaymentService(
    id,
    req.body,
    getUser(req),
  );

  return res.status(201).json({
    success: true,
    message: "Payment recorded successfully.",
    data: payment,
  });
});

// ============================================================
// GET PAYMENTS BY ENROLLMENT (with totals)
// GET /api/enrollments/:id/payments
// ============================================================

export const getEnrollmentPayments = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const { financials, payments } =
    await studentService.getEnrollmentPaymentsService(id);

  return res.status(200).json({
    success: true,
    count: payments.length,
    financials,
    data: payments,
  });
});

// ============================================================
// UPDATE PAYMENT STATUS
// PATCH /api/payments/:id/status
// Body: { "status": "pending" | "successful" | "failed" | "refunded" }
// ============================================================

export const updatePaymentStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  const payment = await studentService.updatePaymentStatusService(
    id,
    status,
    getUser(req),
  );

  return res.status(200).json({
    success: true,
    message: "Payment status updated successfully.",
    data: payment,
  });
});

// ============================================================
// DELETE PAYMENT
// DELETE /api/payments/:id
// ============================================================

export const deletePayment = asyncHandler(async (req, res) => {
  const { id } = req.params;

  await studentService.deletePaymentService(id, getUser(req));

  return res.status(200).json({
    success: true,
    message: "Payment deleted successfully.",
  });
});

// ============================================================
// RECORD ATTENDANCE (single student)
// POST /api/enrollments/:id/attendance
// ============================================================

export const recordAttendance = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const { record, summary } = await studentService.recordAttendanceService(
    id,
    req.body,
    getUser(req),
  );

  return res.status(201).json({
    success: true,
    message: "Attendance recorded successfully.",
    data: record,
    summary,
  });
});

// ============================================================
// RECORD CLASS ATTENDANCE (whole register for one session)
// POST /api/attendance/class
// Body: { "sessionDate": "2026-10-19", "records": [{ enrollmentId, status }] }
// ============================================================

export const recordClassAttendance = asyncHandler(async (req, res) => {
  const result = await studentService.recordClassAttendanceService(
    req.body,
    getUser(req),
  );

  return res.status(201).json({
    success: true,
    message: "Class attendance recorded successfully.",
    data: result,
  });
});

// ============================================================
// GET ATTENDANCE BY ENROLLMENT
// GET /api/enrollments/:id/attendance
// ============================================================

export const getAttendance = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const { summary, records } = await studentService.getAttendanceService(id);

  return res.status(200).json({
    success: true,
    count: records.length,
    summary,
    data: records,
  });
});

// ============================================================
// DELETE ATTENDANCE RECORD
// DELETE /api/attendance/:id
// ============================================================

export const deleteAttendance = asyncHandler(async (req, res) => {
  const { id } = req.params;

  await studentService.deleteAttendanceService(id, getUser(req));

  return res.status(200).json({
    success: true,
    message: "Attendance record deleted successfully.",
  });
});

// ============================================================
// GET CERTIFICATE ELIGIBILITY
// GET /api/enrollments/:id/certificate-eligibility?minAttendance=75
// ============================================================

export const getCertificateEligibility = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const eligibility = await studentService.getCertificateEligibilityService(
    id,
    { minAttendance: req.query.minAttendance },
  );

  return res.status(200).json({
    success: true,
    data: eligibility,
  });
});

// ============================================================
// ISSUE CERTIFICATE
// POST /api/enrollments/:id/certificates
// Body (optional): { "certificateType": "completion" | "participation" }
// ============================================================

export const issueCertificate = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const certificate = await studentService.issueCertificateService(
    id,
    req.body ?? {},
    getUser(req),
  );

  return res.status(201).json({
    success: true,
    message: "Certificate issued successfully.",
    data: certificate,
  });
});

// ============================================================
// GET CERTIFICATES BY ENROLLMENT
// GET /api/enrollments/:id/certificates
// ============================================================

export const getCertificates = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const certificates = await studentService.getCertificatesService(id);

  return res.status(200).json({
    success: true,
    count: certificates.length,
    data: certificates,
  });
});

// ============================================================
// REVOKE CERTIFICATE
// PATCH /api/certificates/:id/revoke
// ============================================================

export const revokeCertificate = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const certificate = await studentService.revokeCertificateService(
    id,
    getUser(req),
  );

  return res.status(200).json({
    success: true,
    message: "Certificate revoked successfully.",
    data: certificate,
  });
});

// ============================================================
// VERIFY CERTIFICATE (public, no login)
// GET /api/certificates/verify/:certificateNo
// ============================================================

export const verifyCertificate = asyncHandler(async (req, res) => {
  const { certificateNo } = req.params;

  const certificate =
    await studentService.verifyCertificateService(certificateNo);

  return res.status(200).json({
    success: true,
    valid: certificate.valid,
    data: certificate,
  });
});

// ============================================================
// CREATE ASSESSMENT
// POST /api/enrollments/:id/assessments
// ============================================================

export const createAssessment = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const assessment = await studentService.createAssessmentService(
    id,
    req.body,
    getUser(req),
  );

  return res.status(201).json({
    success: true,
    message: "Assessment recorded successfully.",
    data: assessment,
  });
});

// ============================================================
// GET ASSESSMENTS BY ENROLLMENT
// GET /api/enrollments/:id/assessments
// ============================================================

export const getAssessments = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const { assessments, average_percentage } =
    await studentService.getAssessmentsService(id);

  return res.status(200).json({
    success: true,
    count: assessments.length,
    averagePercentage: average_percentage,
    data: assessments,
  });
});

// ============================================================
// UPDATE ASSESSMENT
// PATCH /api/assessments/:id
// ============================================================

export const updateAssessment = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const assessment = await studentService.updateAssessmentService(
    id,
    req.body,
    getUser(req),
  );

  return res.status(200).json({
    success: true,
    message: "Assessment updated successfully.",
    data: assessment,
  });
});

// ============================================================
// DELETE ASSESSMENT
// DELETE /api/assessments/:id
// ============================================================

export const deleteAssessment = asyncHandler(async (req, res) => {
  const { id } = req.params;

  await studentService.deleteAssessmentService(id, getUser(req));

  return res.status(200).json({
    success: true,
    message: "Assessment deleted successfully.",
  });
});