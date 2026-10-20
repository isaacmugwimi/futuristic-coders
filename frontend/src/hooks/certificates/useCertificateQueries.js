"use client";

import { useQuery } from "@tanstack/react-query";
import { verifyCertificate } from "../../services/student/student.service";
// import { verifyCertificate } from "../../services/certificates/certificate.service";

export const useVerifyCertificate = (certificateNo) => {
  return useQuery({
    queryKey: ["certificates", "verify", certificateNo],
    queryFn: () => verifyCertificate(certificateNo),
    enabled: Boolean(certificateNo),
    staleTime: 1000 * 60,
    retry: (failureCount, error) =>
      error?.response?.status !== 404 && failureCount < 1,
  });
};