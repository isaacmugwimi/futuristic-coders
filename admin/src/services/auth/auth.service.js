
import api from "@/src/utils/api/axiosInstance";
import { API_PATHS } from "@/src/utils/api/apiPaths";

// ============================================================================
// LOGIN
// ============================================================================

export const loginUser = async (credentials) => {
  const response = await api.post(
    API_PATHS.AUTH.LOGIN,
    credentials,
  );

  return response.data;
};

// ============================================================================
// LOGOUT
// ============================================================================

export const logoutUser = async () => {
  const response = await api.post(API_PATHS.AUTH.LOGOUT);

  return response.data;
};

// ============================================================================
// REFRESH TOKEN
// ============================================================================

export const refreshAuthToken = async () => {
  const response = await api.post(API_PATHS.AUTH.REFRESH_TOKEN);

  return response.data;
};
