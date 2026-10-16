"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import {
  createUser,
  updateUser,
  deleteUser,
} from "@/src/services/users/user.service";

// ============================================================================
// CREATE USER
// ============================================================================

export const useCreateUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createUser,

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["users"],
      });
    },
  });
};

// ============================================================================
// UPDATE USER
// ============================================================================

export const useUpdateUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, userData }) => updateUser(id, userData),

    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["users"],
      });

      queryClient.invalidateQueries({
        queryKey: ["users", variables.id],
      });
    },
  });
};

// ============================================================================
// DELETE USER
// ============================================================================

export const useDeleteUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteUser,

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["users"],
      });
    },
  });
};
