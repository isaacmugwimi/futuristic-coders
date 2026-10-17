
"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import {
  createProgram,
  updateProgram,
  publishProgram,
  archiveProgram,
  deleteProgram,
} from "@/src/services/programs/program.service";

// ============================================================================
// CREATE PROGRAM
// ============================================================================

export const useCreateProgram = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createProgram,

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["programs"],
      });
    },
  });
};

// ============================================================================
// UPDATE PROGRAM
// ============================================================================

export const useUpdateProgram = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, programData }) => updateProgram(id, programData),

    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["programs"],
      });

      queryClient.invalidateQueries({
        queryKey: ["programs", variables.id],
      });
    },
  });
};

// ============================================================================
// PUBLISH PROGRAM
// ============================================================================

export const usePublishProgram = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: publishProgram,

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["programs"],
      });
    },
  });
};

// ============================================================================
// ARCHIVE PROGRAM
// ============================================================================

export const useArchiveProgram = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: archiveProgram,

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["programs"],
      });
    },
  });
};

// ============================================================================
// DELETE PROGRAM
// ============================================================================

export const useDeleteProgram = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteProgram,

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["programs"],
      });
    },
  });
};
