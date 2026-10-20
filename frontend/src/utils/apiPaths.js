// src/utils/api/apiPaths.js  (public website: Programs, Testimonials and Certificates)

// ============================================================================
// BASE URL
// ============================================================================

export const BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000";

// ============================================================================
// API PATHS
// ============================================================================

export const API_PATHS = {
  PROGRAMS: {
    GET_PUBLISHED: "/api/programs/get-published-programs",

    CATEGORIES: {
      GET_ALL: "/api/programs/get-all-categories",
    },
  },

  TESTIMONIALS: {
    // POST: submit a review from the website form (saved as pending)
    SUBMIT: "/api/testimonials/submit-testimonial",

    // GET: published reviews, paged
    GET_PUBLISHED: "/api/testimonials/get-published-testimonials",

    // GET: featured reviews
    GET_FEATURED: "/api/testimonials/get-featured-testimonials",
  },

  CERTIFICATES: {
    // GET: public check of a certificate by its number. No login needed.
    // The route lives under /api/students on the backend.
    VERIFY: (certificateNo) =>
      `/api/students/verify-certificate/${encodeURIComponent(certificateNo)}`,
  },
};
