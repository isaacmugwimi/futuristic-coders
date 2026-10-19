// ============================================================================
// BASE URL
// ============================================================================

// Next.js exposes env vars through process.env (import.meta.env is Vite only).
// If this app is Vite, use import.meta.env.VITE_API_URL instead.
export const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

// ============================================================================
// API PATHS
// ============================================================================

export const API_PATHS = {
  // ==========================================================================
  // AUTHENTICATION
  // ==========================================================================

  AUTH: {
    LOGIN: "/api/auth/login",
    LOGOUT: "/api/auth/logout",
    REFRESH_TOKEN: "/api/auth/refresh-token",
  },

  // ==========================================================================
  // USERS
  // ==========================================================================

  USERS: {
    // Create
    CREATE: "/api/users/create-users",

    // Read
    GET_ALL: "/api/users/get-all-users",
    GET_STATISTICS: "/api/users/users/statistics",
    SEARCH: "/api/users/users/search",

    GET_BY_ID: (userId) => `/api/users/users/${userId}`,

    GET_BY_EMAIL: (email) =>
      `/api/users/users/email/${encodeURIComponent(email)}`,

    // Update
    UPDATE: (userId) => `/api/users/users/${userId}`,

    ACTIVATE: (userId) => `/api/users/users/${userId}/activate`,

    DEACTIVATE: (userId) => `/api/users/users/${userId}/deactivate`,

    // Delete
    DELETE: (userId) => `/api/users/users/${userId}`,
  },

  // ==========================================================================
  // PROGRAMS
  // ==========================================================================

  PROGRAMS: {
    // Read
    GET_ALL: "/api/programs/get-all-programs",
    GET_PUBLISHED: "/api/programs/get-published-programs",
    GET_FEATURED: "/api/programs/get-featured-programs",

    GET_BY_ID: (id) => `/api/programs/get-program-by-id/${id}`,

    GET_BY_SLUG: (slug) =>
      `/api/programs/get-program-by-slug/${encodeURIComponent(slug)}`,

    GET_BY_CATEGORY: (categoryId) =>
      `/api/programs/get-programs-by-category/${categoryId}`,

    SEARCH: "/api/programs/search-programs",

    // Create
    CREATE: "/api/programs/create-program",

    // Update
    UPDATE: (id) => `/api/programs/update-program/${id}`,

    // Status management
    PUBLISH: (id) => `/api/programs/publish-program/${id}`,

    ARCHIVE: (id) => `/api/programs/archive-program/${id}`,

    // Delete
    DELETE: (id) => `/api/programs/delete-program/${id}`,

    // ------------------------------------------------------------------------
    // Program categories
    // ------------------------------------------------------------------------
    CATEGORIES: {
      GET_ALL: "/api/programs/get-all-categories",
      CREATE: "/api/programs/create-categories",
    },
  },

  // ==========================================================================
  // STUDENTS
  // ==========================================================================

  STUDENTS: {
    // Create
    CREATE: "/api/students/register-student",

    // Read
    // Query params: search, status, programId, paymentStatus, ageGroup,
    // county, sortBy, sortOrder, page, limit
    GET_ALL: "/api/students/get-all-students",

    GET_STATS: "/api/students/get-student-stats",

    GET_BY_ID: (studentId) => `/api/students/get-student-by-id/${studentId}`,

    // Update
    UPDATE: (studentId) => `/api/students/update-student/${studentId}`,

    // Delete
    // Students with payment history need { force: true } to confirm.
    DELETE: (studentId, { force = false } = {}) =>
      `/api/students/delete-student/${studentId}${force ? "?force=true" : ""}`,

    // ------------------------------------------------------------------------
    // Enrollments
    // ------------------------------------------------------------------------
    ENROLLMENTS: {
      ENROLL: (studentId) => `/api/students/enroll-student/${studentId}`,

      GET_BY_STUDENT: (studentId) =>
        `/api/students/get-student-enrollments/${studentId}`,

      GET_BY_PROGRAM: (programId) =>
        `/api/students/get-program-enrollments/${programId}`,

      GET_BY_ID: (enrollmentId) =>
        `/api/students/get-enrollment-by-id/${enrollmentId}`,

      UPDATE: (enrollmentId) =>
        `/api/students/update-enrollment/${enrollmentId}`,

      // Body: { status: "active" | "on_hold" | "dropped" | "completed" }
      UPDATE_STATUS: (enrollmentId) =>
        `/api/students/update-enrollment-status/${enrollmentId}`,

      // Enrollments with payment history need { force: true } to confirm.
      DELETE: (enrollmentId, { force = false } = {}) =>
        `/api/students/delete-enrollment/${enrollmentId}${
          force ? "?force=true" : ""
        }`,
    },

    // ------------------------------------------------------------------------
    // Payments
    // ------------------------------------------------------------------------
    PAYMENTS: {
      RECORD: (enrollmentId) => `/api/students/record-payment/${enrollmentId}`,

      GET_BY_ENROLLMENT: (enrollmentId) =>
        `/api/students/get-enrollment-payments/${enrollmentId}`,

      // Body: { status: "pending" | "successful" | "failed" | "refunded" }
      UPDATE_STATUS: (paymentId) =>
        `/api/students/update-payment-status/${paymentId}`,

      DELETE: (paymentId) => `/api/students/delete-payment/${paymentId}`,
    },

    // ------------------------------------------------------------------------
    // Attendance
    // ------------------------------------------------------------------------
    ATTENDANCE: {
      // One student, one session
      RECORD: (enrollmentId) =>
        `/api/students/record-attendance/${enrollmentId}`,

      // Whole class register for one session
      RECORD_CLASS: "/api/students/record-class-attendance",

      GET_BY_ENROLLMENT: (enrollmentId) =>
        `/api/students/get-enrollment-attendance/${enrollmentId}`,

      DELETE: (attendanceId) =>
        `/api/students/delete-attendance/${attendanceId}`,
    },

    // ------------------------------------------------------------------------
    // Certificates
    // ------------------------------------------------------------------------
    CERTIFICATES: {
      // Query param: minAttendance (0-100, defaults to 75)
      CHECK_ELIGIBILITY: (enrollmentId) =>
        `/api/students/check-certificate-eligibility/${enrollmentId}`,

      // Body (optional): { certificateType: "completion" | "participation" }
      ISSUE: (enrollmentId) =>
        `/api/students/issue-certificate/${enrollmentId}`,

      GET_BY_ENROLLMENT: (enrollmentId) =>
        `/api/students/get-enrollment-certificates/${enrollmentId}`,

      REVOKE: (certificateId) =>
        `/api/students/revoke-certificate/${certificateId}`,

      // Public: no login needed
      VERIFY: (certificateNo) =>
        `/api/students/verify-certificate/${encodeURIComponent(certificateNo)}`,
    },

    // ------------------------------------------------------------------------
    // Assessments
    // ------------------------------------------------------------------------
    ASSESSMENTS: {
      CREATE: (enrollmentId) =>
        `/api/students/create-assessment/${enrollmentId}`,

      GET_BY_ENROLLMENT: (enrollmentId) =>
        `/api/students/get-enrollment-assessments/${enrollmentId}`,

      UPDATE: (assessmentId) =>
        `/api/students/update-assessment/${assessmentId}`,

      DELETE: (assessmentId) =>
        `/api/students/delete-assessment/${assessmentId}`,
    },
  },

  // ==========================================================================
  // TESTIMONIALS
  // ==========================================================================

  TESTIMONIALS: {
    // Public
    // Body: { name, email, relationship, rating, message }
    SUBMIT: "/api/testimonials/submit-testimonial",

    // Query params: page, limit, rating (0 = all), sort
    // (newest | oldest | highest | lowest)
    GET_PUBLISHED: "/api/testimonials/get-published-testimonials",

    // Query param: limit
    GET_FEATURED: "/api/testimonials/get-featured-testimonials",

    // Admin: read
    // Query params: status (pending | approved | published | rejected |
    // archived), rating, search
    GET_ALL: "/api/testimonials/get-all-testimonials",

    GET_COUNTS: "/api/testimonials/get-testimonial-counts",

    GET_BY_ID: (id) => `/api/testimonials/get-testimonial-by-id/${id}`,

    // Admin: edit
    // Body: { message?, adminNotes?, featured? }
    UPDATE: (id) => `/api/testimonials/update-testimonial/${id}`,

    // Admin: moderation
    APPROVE: (id) => `/api/testimonials/approve-testimonial/${id}`,

    PUBLISH: (id) => `/api/testimonials/publish-testimonial/${id}`,

    // Body (optional): { adminNotes }
    REJECT: (id) => `/api/testimonials/reject-testimonial/${id}`,

    ARCHIVE: (id) => `/api/testimonials/archive-testimonial/${id}`,

    // Body: { featured: true | false }
    FEATURE: (id) => `/api/testimonials/feature-testimonial/${id}`,

    // Admin: delete
    DELETE: (id) => `/api/testimonials/delete-testimonial/${id}`,
  },
};
