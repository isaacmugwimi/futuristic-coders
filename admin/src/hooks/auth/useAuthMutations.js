
"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { loginUser, logoutUser } from "@/src/services/auth/auth.service";

// ============================================================================
// LOGIN
// ============================================================================

export const useLogin = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: loginUser,

    onSuccess: () => {
      queryClient.clear();
    },
  });
};

// ============================================================================
// LOGOUT
// ============================================================================

export const useLogout = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: logoutUser,

    onSuccess: () => {
      queryClient.clear();
    },
  });
};
