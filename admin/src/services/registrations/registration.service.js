import api from "@/src/utils/api/axiosInstance";
import { API_PATHS } from "@/src/utils/api/apiPaths";

// ============================================================================
// REGISTRATIONS: ADMIN REVIEW
// ============================================================================

// params: status ("pending" | "approved" | "rejected" | "all"), search
// Returns the requests plus counts for each status.
export const getRegistrations = async (params = {}) => {
  const { data } = await api.get(API_PATHS.REGISTRATIONS.GET_ALL, { params });
  return data;
};

// approvalData (optional): { agreedFee, enrolledOn }
// Creates the student (or reuses a match) and enrolls them.
export const approveRegistration = async (
  registrationId,
  approvalData = {},
) => {
  const { data } = await api.patch(
    API_PATHS.REGISTRATIONS.APPROVE(registrationId),
    approvalData,
  );
  return data;
};

// rejectionData (optional): { reason }
export const rejectRegistration = async (
  registrationId,
  rejectionData = {},
) => {
  const { data } = await api.patch(
    API_PATHS.REGISTRATIONS.REJECT(registrationId),
    rejectionData,
  );
  return data;
};
