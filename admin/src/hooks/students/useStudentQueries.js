"use client";

import { useQuery } from "@tanstack/react-query";

import {
  getAllStudents,
  getStudentStats,
  getStudentById,
  getStudentEnrollments,
  getProgramEnrollments,
  getEnrollmentById,
  getEnrollmentPayments,
  getEnrollmentAttendance,
  checkCertificateEligibility,
  getEnrollmentCertificates,
  verifyCertificate,
  getEnrollmentAssessments,
} from "@/src/services/students/student.service";

// Fees, balances and attendance change often, so data goes stale faster
// than it does for programs.
const STALE_TIME = 1000 * 60;

const hasValue = (value) =>
  value !== undefined && value !== null && value !== "";

// ----------------------------------------------------------------------------
// QUERY KEYS (the mutations hooks invalidate by these prefixes)
//
// ["students", "list", params]         student list
// ["students", "stats"]                summary cards
// ["students", "detail", studentId]    one student + enrollments
//
// ["enrollments", "student", studentId]
// ["enrollments", "program", programId]
// ["enrollments", "detail", enrollmentId]
// ["enrollments", "payments", enrollmentId]
// ["enrollments", "attendance", enrollmentId]
// ["enrollments", "eligibility", enrollmentId, params]
// ["enrollments", "certificates", enrollmentId]
// ["enrollments", "assessments", enrollmentId]
//
// ["certificates", "verify", certificateNo]
// ----------------------------------------------------------------------------

// ============================================================================
// GET ALL STUDENTS (search, filter, sort, paginate)
// ============================================================================

// params: search, status, programId, paymentStatus, ageGroup, county,
// sortBy, sortOrder, page, limit
export const useStudents = (params = {}) =>
  useQuery({
    queryKey: ["students", "list", params],
    queryFn: () => getAllStudents(params),
    staleTime: STALE_TIME,
    // Keeps the current page on screen while the next one loads.
    placeholderData: (previousData) => previousData,
  });

// ============================================================================
// GET STUDENT STATS
// ============================================================================

export const useStudentStats = () =>
  useQuery({
    queryKey: ["students", "stats"],
    queryFn: getStudentStats,
    staleTime: STALE_TIME,
  });

// ============================================================================
// GET STUDENT BY ID
// ============================================================================

export const useStudentById = (studentId) =>
  useQuery({
    queryKey: ["students", "detail", studentId],
    queryFn: () => getStudentById(studentId),
    enabled: hasValue(studentId),
    staleTime: STALE_TIME,
  });

// ============================================================================
// GET ENROLLMENTS BY STUDENT
// ============================================================================

export const useStudentEnrollments = (studentId) =>
  useQuery({
    queryKey: ["enrollments", "student", studentId],
    queryFn: () => getStudentEnrollments(studentId),
    enabled: hasValue(studentId),
    staleTime: STALE_TIME,
  });

// ============================================================================
// GET ENROLLMENTS BY PROGRAM (class list)
// ============================================================================

export const useProgramEnrollments = (programId) =>
  useQuery({
    queryKey: ["enrollments", "program", programId],
    queryFn: () => getProgramEnrollments(programId),
    enabled: hasValue(programId),
    staleTime: STALE_TIME,
  });

// ============================================================================
// GET ENROLLMENT BY ID
// ============================================================================

export const useEnrollmentById = (enrollmentId) =>
  useQuery({
    queryKey: ["enrollments", "detail", enrollmentId],
    queryFn: () => getEnrollmentById(enrollmentId),
    enabled: hasValue(enrollmentId),
    staleTime: STALE_TIME,
  });

// ============================================================================
// GET ENROLLMENT PAYMENTS (with total fee, amount paid and balance)
// ============================================================================

export const useEnrollmentPayments = (enrollmentId) =>
  useQuery({
    queryKey: ["enrollments", "payments", enrollmentId],
    queryFn: () => getEnrollmentPayments(enrollmentId),
    enabled: hasValue(enrollmentId),
    staleTime: STALE_TIME,
  });

// ============================================================================
// GET ENROLLMENT ATTENDANCE (records + percentage)
// ============================================================================

export const useEnrollmentAttendance = (enrollmentId) =>
  useQuery({
    queryKey: ["enrollments", "attendance", enrollmentId],
    queryFn: () => getEnrollmentAttendance(enrollmentId),
    enabled: hasValue(enrollmentId),
    staleTime: STALE_TIME,
  });

// ============================================================================
// CHECK CERTIFICATE ELIGIBILITY
// ============================================================================

// params: minAttendance (0-100, defaults to 75)
export const useCertificateEligibility = (enrollmentId, params = {}) =>
  useQuery({
    queryKey: ["enrollments", "eligibility", enrollmentId, params],
    queryFn: () => checkCertificateEligibility(enrollmentId, params),
    enabled: hasValue(enrollmentId),
    staleTime: STALE_TIME,
  });

// ============================================================================
// GET ENROLLMENT CERTIFICATES
// ============================================================================

export const useEnrollmentCertificates = (enrollmentId) =>
  useQuery({
    queryKey: ["enrollments", "certificates", enrollmentId],
    queryFn: () => getEnrollmentCertificates(enrollmentId),
    enabled: hasValue(enrollmentId),
    staleTime: STALE_TIME,
  });

// ============================================================================
// VERIFY CERTIFICATE (public)
// ============================================================================

export const useVerifyCertificate = (certificateNo) =>
  useQuery({
    queryKey: ["certificates", "verify", certificateNo],
    queryFn: () => verifyCertificate(certificateNo),
    enabled: Boolean(certificateNo),
    // "Not found" is an expected answer here, so don't retry it.
    retry: false,
    staleTime: STALE_TIME,
  });

// ============================================================================
// GET ENROLLMENT ASSESSMENTS (with average percentage)
// ============================================================================

export const useEnrollmentAssessments = (enrollmentId) =>
  useQuery({
    queryKey: ["enrollments", "assessments", enrollmentId],
    queryFn: () => getEnrollmentAssessments(enrollmentId),
    enabled: hasValue(enrollmentId),
    staleTime: STALE_TIME,
  });