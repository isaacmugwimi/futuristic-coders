// src/services/certificates/certificate.service.js  (public website)

import { API_PATHS } from "../../utils/apiPaths";
import api from "../../utils/axiosInstance";

// ============================================================================
// CERTIFICATES — PUBLIC VERIFY
// ============================================================================

export const verifyCertificate = async (certificateNo) => {
  const { data } = await api.get(API_PATHS.CERTIFICATES.VERIFY(certificateNo));
  return data;
};