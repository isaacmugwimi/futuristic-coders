
"use client";

import { useQuery } from "@tanstack/react-query";

import {
  getAllUsers,
  getUserById,
  getUserByEmail,
  getUserStatistics,
  searchUsers,
} from "@/src/services/users/user.service";

// ============================================================================
// GET ALL USERS
// ============================================================================

export const useUsers = () => {
  return useQuery({
    queryKey: ["users"],
    queryFn: getAllUsers,
    staleTime: 1000 * 60 * 5,
  });
};

// ============================================================================
// GET USER BY ID
// ============================================================================

export const useUserById = (id) => {
  return useQuery({
    queryKey: ["users", id],
    queryFn: () => getUserById(id),
    enabled: !!id,
    staleTime: 1000 * 60 * 5,
  });
};

// ============================================================================
// GET USER BY EMAIL
// ============================================================================

export const useUserByEmail = (email) => {
  return useQuery({
    queryKey: ["users", "email", email],
    queryFn: () => getUserByEmail(email),
    enabled: !!email,
    staleTime: 1000 * 60 * 5,
  });
};

// ============================================================================
// GET USER STATISTICS
// ============================================================================

export const useUserStatistics = () => {
  return useQuery({
    queryKey: ["users", "statistics"],
    queryFn: getUserStatistics,
    staleTime: 1000 * 60 * 5,
  });
};

// ============================================================================
// SEARCH USERS
// ============================================================================

export const useSearchUsers = (params = {}) => {
  return useQuery({
    queryKey: ["users", "search", params],
    queryFn: () => searchUsers(params),
    enabled: Object.values(params).some(
      (value) => value !== "" && value != null,
    ),
    staleTime: 1000 * 60 * 5,
  });
};
