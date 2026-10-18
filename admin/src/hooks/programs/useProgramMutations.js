"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import {
  createProgram,
  updateProgram,
  publishProgram,
  archiveProgram,
  deleteProgram,
  createProgramCategory,
} from "@/src/services/programs/program.service";

// ============================================================================
// CREATE PROGRAM
// ============================================================================

export const useCreateProgram = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createProgram,

    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["programs"],
      });
    },
  });
};

// ============================================================================
// CREATE PROGRAM CATEGORY
// ============================================================================

export const useCreateProgramCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createProgramCategory,

    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["programCategories"],
      });

      // Refresh program lists in case categories affect their display.
      await queryClient.invalidateQueries({
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

    onSuccess: async (_, { id }) => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: ["programs"],
        }),
        queryClient.invalidateQueries({
          queryKey: ["programs", id],
        }),
      ]);
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

    onSuccess: async (_, id) => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: ["programs"],
        }),
        queryClient.invalidateQueries({
          queryKey: ["programs", id],
        }),
      ]);
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

    onSuccess: async (_, id) => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: ["programs"],
        }),
        queryClient.invalidateQueries({
          queryKey: ["programs", id],
        }),
      ]);
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

    onSuccess: async (_, id) => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: ["programs"],
        }),
        queryClient.removeQueries({
          queryKey: ["programs", id],
        }),
      ]);
    },
  });
};
