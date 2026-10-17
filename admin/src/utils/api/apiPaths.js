
 // ============================================================================
 // BASE URL
 // ============================================================================

export const BASE_URL =
  import.meta.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

// ============================================================================
// API PATHS
// ============================================================================

export const API_PATHS = {
  // ==========================================================================
  // AUTHENTICATION
  // ==========================================================================

  AUTH: {
    LOGIN: "/api/users/login",
    LOGOUT: "/api/users/logout",
    REFRESH_TOKEN: "/api/users/refresh-token",
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

    GET_BY_ID: (userId) =>
      `/api/users/users/${userId}`,

    GET_BY_EMAIL: (email) =>
      `/api/users/users/email/${encodeURIComponent(email)}`,

    // Update
    UPDATE: (userId) =>
      `/api/users/users/${userId}`,

    ACTIVATE: (userId) =>
      `/api/users/users/${userId}/activate`,

    DEACTIVATE: (userId) =>
      `/api/users/users/${userId}/deactivate`,

    // Delete
    DELETE: (userId) =>
      `/api/users/users/${userId}`,
  },

  // ==========================================================================
  // PROGRAMS
  // ==========================================================================

  PROGRAMS: {
    // Read
    GET_ALL: "/api/programs/get-all-programs",
    GET_PUBLISHED: "/api/programs/get-published-programs",
    GET_FEATURED: "/api/programs/get-featured-programs",

    GET_BY_ID: (id) =>
      `/api/programs/get-program-by-id/${id}`,

    GET_BY_SLUG: (slug) =>
      `/api/programs/get-program-by-slug/${encodeURIComponent(slug)}`,

    GET_BY_CATEGORY: (categoryId) =>
      `/api/programs/get-programs-by-category/${categoryId}`,

    SEARCH: "/api/programs/search-programs",

    // Create
    CREATE: "/api/programs/create-program",

    // Update
    UPDATE: (id) =>
      `/api/programs/update-program/${id}`,

    // Status management
    PUBLISH: (id) =>
      `/api/programs/publish-program/${id}`,

    ARCHIVE: (id) =>
      `/api/programs/archive-program/${id}`,

    // Delete
    DELETE: (id) =>
      `/api/programs/delete-program/${id}`,
  },
};
