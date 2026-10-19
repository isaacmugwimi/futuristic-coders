// src/utils/api/apiPaths.js  (public website: only what the Programs page needs)

// ============================================================================
// BASE URL
// ============================================================================

export const BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

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
};