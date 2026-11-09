"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import {
  approveRegistration,
  rejectRegistration,
} from "@/src/services/registrations/registration.service";

// Every registration key starts with "registrations", so invalidating that one
// prefix refreshes the lists and the status counts in one call.

// ============================================================================
// APPROVE REGISTRATION
// Creates the student (or reuses a match) and enrolls them in the program.
// Usage: approve({ id, data: { agreedFee, enrolledOn } })
// ============================================================================

export const useApproveRegistration = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }) => approveRegistration(id, data),

    onSuccess: async () => {
      // The request moves tabs, and a new student and enrollment now exist.
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["registrations"] }),
        queryClient.invalidateQueries({ queryKey: ["students"] }),
      ]);
    },
  });
};

// ============================================================================
// REJECT REGISTRATION
// Usage: reject({ id, data: { reason: "Program is full" } })
// ============================================================================

export const useRejectRegistration = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }) => rejectRegistration(id, data),

    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["registrations"],
      });
    },
  });
};