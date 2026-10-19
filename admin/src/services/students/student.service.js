import api from "@/src/utils/api/axiosInstance";
import { API_PATHS } from "@/src/utils/api/apiPaths";

// ============================================================================
// STUDENTS — RECORDS
// ============================================================================

// Registers a student. Can also enrol them in a program and record a first
// deposit: include programId, agreedFee, enrolledOn and initialPayment.
export const createStudent = async (studentData) => {
  const { data } = await api.post(API_PATHS.STUDENTS.CREATE, studentData);
  return data;
};

// params: search, status, programId, paymentStatus, ageGroup, county,
// sortBy, sortOrder, page, limit
export const getAllStudents = async (params = {}) => {
  const { data } = await api.get(API_PATHS.STUDENTS.GET_ALL, { params });
  return data;
};

export const getStudentStats = async () => {
  const { data } = await api.get(API_PATHS.STUDENTS.GET_STATS);
  return data;
};

export const getStudentById = async (studentId) => {
  const { data } = await api.get(API_PATHS.STUDENTS.GET_BY_ID(studentId));
  return data;
};

export const updateStudent = async (studentId, studentData) => {
  const { data } = await api.patch(
    API_PATHS.STUDENTS.UPDATE(studentId),
    studentData,
  );
  return data;
};

// options.force: true confirms deleting a student who has payment history.
export const deleteStudent = async (studentId, options = {}) => {
  const { data } = await api.delete(
    API_PATHS.STUDENTS.DELETE(studentId, options),
  );
  return data;
};

// ============================================================================
// STUDENTS — ENROLLMENTS
// ============================================================================

export const enrollStudent = async (studentId, enrollmentData) => {
  const { data } = await api.post(
    API_PATHS.STUDENTS.ENROLLMENTS.ENROLL(studentId),
    enrollmentData,
  );
  return data;
};

export const getStudentEnrollments = async (studentId) => {
  const { data } = await api.get(
    API_PATHS.STUDENTS.ENROLLMENTS.GET_BY_STUDENT(studentId),
  );
  return data;
};

export const getProgramEnrollments = async (programId) => {
  const { data } = await api.get(
    API_PATHS.STUDENTS.ENROLLMENTS.GET_BY_PROGRAM(programId),
  );
  return data;
};

export const getEnrollmentById = async (enrollmentId) => {
  const { data } = await api.get(
    API_PATHS.STUDENTS.ENROLLMENTS.GET_BY_ID(enrollmentId),
  );
  return data;
};

// Fee, progress, final score or notes.
export const updateEnrollment = async (enrollmentId, enrollmentData) => {
  const { data } = await api.patch(
    API_PATHS.STUDENTS.ENROLLMENTS.UPDATE(enrollmentId),
    enrollmentData,
  );
  return data;
};

// status: "active" | "on_hold" | "dropped" | "completed"
export const updateEnrollmentStatus = async (enrollmentId, status) => {
  const { data } = await api.patch(
    API_PATHS.STUDENTS.ENROLLMENTS.UPDATE_STATUS(enrollmentId),
    { status },
  );
  return data;
};

// options.force: true confirms deleting an enrollment with payment history.
export const deleteEnrollment = async (enrollmentId, options = {}) => {
  const { data } = await api.delete(
    API_PATHS.STUDENTS.ENROLLMENTS.DELETE(enrollmentId, options),
  );
  return data;
};

// ============================================================================
// STUDENTS — PAYMENTS
// ============================================================================

export const recordPayment = async (enrollmentId, paymentData) => {
  const { data } = await api.post(
    API_PATHS.STUDENTS.PAYMENTS.RECORD(enrollmentId),
    paymentData,
  );
  return data;
};

// Returns the payments plus total fee, amount paid and balance.
export const getEnrollmentPayments = async (enrollmentId) => {
  const { data } = await api.get(
    API_PATHS.STUDENTS.PAYMENTS.GET_BY_ENROLLMENT(enrollmentId),
  );
  return data;
};

// status: "pending" | "successful" | "failed" | "refunded"
export const updatePaymentStatus = async (paymentId, status) => {
  const { data } = await api.patch(
    API_PATHS.STUDENTS.PAYMENTS.UPDATE_STATUS(paymentId),
    { status },
  );
  return data;
};

export const deletePayment = async (paymentId) => {
  const { data } = await api.delete(
    API_PATHS.STUDENTS.PAYMENTS.DELETE(paymentId),
  );
  return data;
};

// ============================================================================
// STUDENTS — ATTENDANCE
// ============================================================================

// One student, one session: { sessionDate, status, remarks }
export const recordAttendance = async (enrollmentId, attendanceData) => {
  const { data } = await api.post(
    API_PATHS.STUDENTS.ATTENDANCE.RECORD(enrollmentId),
    attendanceData,
  );
  return data;
};

// Whole class register: { sessionDate, records: [{ enrollmentId, status }] }
export const recordClassAttendance = async (registerData) => {
  const { data } = await api.post(
    API_PATHS.STUDENTS.ATTENDANCE.RECORD_CLASS,
    registerData,
  );
  return data;
};

// Returns the records plus the attendance summary and percentage.
export const getEnrollmentAttendance = async (enrollmentId) => {
  const { data } = await api.get(
    API_PATHS.STUDENTS.ATTENDANCE.GET_BY_ENROLLMENT(enrollmentId),
  );
  return data;
};

export const deleteAttendance = async (attendanceId) => {
  const { data } = await api.delete(
    API_PATHS.STUDENTS.ATTENDANCE.DELETE(attendanceId),
  );
  return data;
};

// ============================================================================
// STUDENTS — CERTIFICATES
// ============================================================================

// params: minAttendance (0-100, defaults to 75)
export const checkCertificateEligibility = async (
  enrollmentId,
  params = {},
) => {
  const { data } = await api.get(
    API_PATHS.STUDENTS.CERTIFICATES.CHECK_ELIGIBILITY(enrollmentId),
    { params },
  );
  return data;
};

// certificateData (optional): { certificateType: "completion" | "participation" }
export const issueCertificate = async (enrollmentId, certificateData = {}) => {
  const { data } = await api.post(
    API_PATHS.STUDENTS.CERTIFICATES.ISSUE(enrollmentId),
    certificateData,
  );
  return data;
};

export const getEnrollmentCertificates = async (enrollmentId) => {
  const { data } = await api.get(
    API_PATHS.STUDENTS.CERTIFICATES.GET_BY_ENROLLMENT(enrollmentId),
  );
  return data;
};

export const revokeCertificate = async (certificateId) => {
  const { data } = await api.patch(
    API_PATHS.STUDENTS.CERTIFICATES.REVOKE(certificateId),
  );
  return data;
};

// Public: works without a login.
export const verifyCertificate = async (certificateNo) => {
  const { data } = await api.get(
    API_PATHS.STUDENTS.CERTIFICATES.VERIFY(certificateNo),
  );
  return data;
};

// ============================================================================
// STUDENTS — ASSESSMENTS
// ============================================================================

export const createAssessment = async (enrollmentId, assessmentData) => {
  const { data } = await api.post(
    API_PATHS.STUDENTS.ASSESSMENTS.CREATE(enrollmentId),
    assessmentData,
  );
  return data;
};

// Returns the assessments plus the average percentage.
export const getEnrollmentAssessments = async (enrollmentId) => {
  const { data } = await api.get(
    API_PATHS.STUDENTS.ASSESSMENTS.GET_BY_ENROLLMENT(enrollmentId),
  );
  return data;
};

export const updateAssessment = async (assessmentId, assessmentData) => {
  const { data } = await api.patch(
    API_PATHS.STUDENTS.ASSESSMENTS.UPDATE(assessmentId),
    assessmentData,
  );
  return data;
};

export const deleteAssessment = async (assessmentId) => {
  const { data } = await api.delete(
    API_PATHS.STUDENTS.ASSESSMENTS.DELETE(assessmentId),
  );
  return data;
};