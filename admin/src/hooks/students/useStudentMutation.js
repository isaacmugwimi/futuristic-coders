"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import {
  createStudent,
  updateStudent,
  deleteStudent,
  enrollStudent,
  updateEnrollment,
  updateEnrollmentStatus,
  deleteEnrollment,
  recordPayment,
  updatePaymentStatus,
  deletePayment,
  recordAttendance,
  recordClassAttendance,
  deleteAttendance,
  issueCertificate,
  revokeCertificate,
  createAssessment,
  updateAssessment,
  deleteAssessment,
} from "@/src/services/students/student.service";

// ============================================================================
// SHARED INVALIDATION
// ============================================================================

// Payments, attendance, statuses and certificates all change values that
// appear in the student list, the stats cards and the enrollment views,
// so these two prefixes are refreshed together.
const invalidateStudentData = (queryClient) =>
  Promise.all([
    queryClient.invalidateQueries({ queryKey: ["students"] }),
    queryClient.invalidateQueries({ queryKey: ["enrollments"] }),
  ]);

// ============================================================================
// CREATE STUDENT
// ============================================================================

// Can also enrol the student and record a first deposit, so enrollment
// queries are refreshed as well.
export const useCreateStudent = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createStudent,

    onSuccess: async () => {
      await invalidateStudentData(queryClient);
    },
  });
};

// ============================================================================
// UPDATE STUDENT
// ============================================================================

// Usage: mutate({ id: studentId, data: { fullName: "..." } })
export const useUpdateStudent = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }) => updateStudent(id, data),

    onSuccess: async () => {
      await invalidateStudentData(queryClient);
    },
  });
};

// ============================================================================
// DELETE STUDENT
// ============================================================================

// Usage: mutate({ id: studentId, force: true })
// force confirms deleting a student who has payment history.
export const useDeleteStudent = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, force = false }) => deleteStudent(id, { force }),

    onSuccess: async (_, { id }) => {
      queryClient.removeQueries({ queryKey: ["students", "detail", id] });
      queryClient.removeQueries({ queryKey: ["enrollments", "student", id] });

      await invalidateStudentData(queryClient);
    },
  });
};

// ============================================================================
// ENROL STUDENT IN A PROGRAM
// ============================================================================

// Usage: mutate({ studentId, data: { programId, agreedFee } })
export const useEnrollStudent = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ studentId, data }) => enrollStudent(studentId, data),

    onSuccess: async () => {
      await invalidateStudentData(queryClient);
    },
  });
};

// ============================================================================
// UPDATE ENROLLMENT (fee, progress, final score, notes)
// ============================================================================

// Usage: mutate({ id: enrollmentId, data: { progress: 60 } })
export const useUpdateEnrollment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }) => updateEnrollment(id, data),

    onSuccess: async () => {
      await invalidateStudentData(queryClient);
    },
  });
};

// ============================================================================
// UPDATE ENROLLMENT STATUS
// ============================================================================

// Usage: mutate({ id: enrollmentId, status: "completed" })
export const useUpdateEnrollmentStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, status }) => updateEnrollmentStatus(id, status),

    onSuccess: async () => {
      await invalidateStudentData(queryClient);
    },
  });
};

// ============================================================================
// DELETE ENROLLMENT
// ============================================================================

// Usage: mutate({ id: enrollmentId, force: true })
// force confirms deleting an enrollment with payment history.
export const useDeleteEnrollment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, force = false }) => deleteEnrollment(id, { force }),

    onSuccess: async (_, { id }) => {
      // Drop every cached view that belongs to this enrollment
      // (detail, payments, attendance, certificates, assessments).
      queryClient.removeQueries({
        predicate: (query) =>
          query.queryKey[0] === "enrollments" && query.queryKey[2] === id,
      });

      await invalidateStudentData(queryClient);
    },
  });
};

// ============================================================================
// RECORD PAYMENT
// ============================================================================

// Usage: mutate({ enrollmentId, data: { amount, paymentMethod, reference } })
export const useRecordPayment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ enrollmentId, data }) => recordPayment(enrollmentId, data),

    onSuccess: async () => {
      await invalidateStudentData(queryClient);
    },
  });
};

// ============================================================================
// UPDATE PAYMENT STATUS
// ============================================================================

// Usage: mutate({ id: paymentId, status: "refunded" })
export const useUpdatePaymentStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, status }) => updatePaymentStatus(id, status),

    onSuccess: async () => {
      await invalidateStudentData(queryClient);
    },
  });
};

// ============================================================================
// DELETE PAYMENT
// ============================================================================

// Usage: mutate(paymentId)
export const useDeletePayment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deletePayment,

    onSuccess: async () => {
      await invalidateStudentData(queryClient);
    },
  });
};

// ============================================================================
// RECORD ATTENDANCE (single student)
// ============================================================================

// Usage: mutate({ enrollmentId, data: { sessionDate, status } })
export const useRecordAttendance = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ enrollmentId, data }) =>
      recordAttendance(enrollmentId, data),

    onSuccess: async () => {
      await invalidateStudentData(queryClient);
    },
  });
};

// ============================================================================
// RECORD CLASS ATTENDANCE (whole register for one session)
// ============================================================================

// Usage: mutate({ sessionDate, records: [{ enrollmentId, status }] })
export const useRecordClassAttendance = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: recordClassAttendance,

    onSuccess: async () => {
      await invalidateStudentData(queryClient);
    },
  });
};

// ============================================================================
// DELETE ATTENDANCE RECORD
// ============================================================================

// Usage: mutate(attendanceId)
export const useDeleteAttendance = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteAttendance,

    onSuccess: async () => {
      await invalidateStudentData(queryClient);
    },
  });
};

// ============================================================================
// ISSUE CERTIFICATE
// ============================================================================

// Usage: mutate({ enrollmentId, data: { certificateType: "completion" } })
// data is optional and defaults to a completion certificate.
export const useIssueCertificate = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ enrollmentId, data = {} }) =>
      issueCertificate(enrollmentId, data),

    onSuccess: async () => {
      await invalidateStudentData(queryClient);

      // A newly issued certificate may now show as valid.
      await queryClient.invalidateQueries({ queryKey: ["certificates"] });
    },
  });
};

// ============================================================================
// REVOKE CERTIFICATE
// ============================================================================

// Usage: mutate(certificateId)
export const useRevokeCertificate = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: revokeCertificate,

    onSuccess: async () => {
      await invalidateStudentData(queryClient);

      // Cached verification results must now show it as revoked.
      await queryClient.invalidateQueries({ queryKey: ["certificates"] });
    },
  });
};

// ============================================================================
// CREATE ASSESSMENT
// ============================================================================

// Usage: mutate({ enrollmentId, data: { title, score, maxScore } })
export const useCreateAssessment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ enrollmentId, data }) =>
      createAssessment(enrollmentId, data),

    // Assessments only appear in the assessment views.
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["enrollments", "assessments"],
      });
    },
  });
};

// ============================================================================
// UPDATE ASSESSMENT
// ============================================================================

// Usage: mutate({ id: assessmentId, data: { score: 80 } })
export const useUpdateAssessment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }) => updateAssessment(id, data),

    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["enrollments", "assessments"],
      });
    },
  });
};

// ============================================================================
// DELETE ASSESSMENT
// ============================================================================

// Usage: mutate(assessmentId)
export const useDeleteAssessment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteAssessment,

    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["enrollments", "assessments"],
      });
    },
  });
};