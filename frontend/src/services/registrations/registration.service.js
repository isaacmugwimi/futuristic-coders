import { API_PATHS } from "../../utils/apiPaths";
import api from "../../utils/axiosInstance";

// ============================================================================
// REGISTRATIONS: PUBLIC SUBMIT
// ============================================================================

export const submitRegistration = async (payload) => {
  const { data } = await api.post(API_PATHS.REGISTRATIONS.SUBMIT, payload);
  return data;
};