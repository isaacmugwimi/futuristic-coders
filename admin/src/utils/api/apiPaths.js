
// ============================================================================
// BASE URL
// ============================================================================

export const BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

// ============================================================================
// API PATHS
// ============================================================================

export const API_PATHS = {
  // ==========================================================================
  // USERS
  // ==========================================================================

  USERS: {
    // --- Create / Register ---
    CREATE: "/api/users/create-user",

    // --- Read ---
    GET_ALL: "/api/users/get-users",
    GET_BY_ID: (id) => `/api/users/get-user-by-id/${id}`,
    GET_BY_EMAIL: (email) =>
      `/api/users/get-user-by-email/${encodeURIComponent(email)}`,

    // --- Update ---
    UPDATE: (id) => `/api/users/update-user/${id}`,

    // --- Delete ---
    DELETE: (id) => `/api/users/delete-user/${id}`,
  },
};
