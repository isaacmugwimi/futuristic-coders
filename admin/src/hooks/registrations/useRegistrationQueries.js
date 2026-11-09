"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";

import { getRegistrations } from "@/src/services/registrations/registration.service";

// New website submissions arrive at any time, so this refreshes sooner.
const ADMIN_STALE_TIME = 1000 * 60;

// ============================================================================
// GET REGISTRATION REQUESTS (admin)
// params: { status, search }
// The response also carries counts: { pending, approved, rejected }, so the
// tab badges and the sidebar badge don't need a separate query.
// ============================================================================

export const useRegistrations = (params = {}) =>
  useQuery({
    queryKey: ["registrations", "admin", params],
    queryFn: () => getRegistrations(params),
    staleTime: ADMIN_STALE_TIME,
    // Switching tabs keeps the old rows on screen instead of a full loader.
    placeholderData: keepPreviousData,
  });