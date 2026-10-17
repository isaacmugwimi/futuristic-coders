
"use client";

import { useQuery } from "@tanstack/react-query";

import {
  getAllPrograms,
  getPublishedPrograms,
  getFeaturedPrograms,
  getProgramById,
  getProgramBySlug,
  getProgramsByCategory,
  searchPrograms,
} from "@/src/services/programs/program.service";

// ============================================================================
// GET ALL PROGRAMS
// ============================================================================

export const usePrograms = () => {
  return useQuery({
    queryKey: ["programs"],
    queryFn: getAllPrograms,
    staleTime: 1000 * 60 * 5,
  });
};

// ============================================================================
// GET PUBLISHED PROGRAMS
// ============================================================================

export const usePublishedPrograms = () => {
  return useQuery({
    queryKey: ["programs", "published"],
    queryFn: getPublishedPrograms,
    staleTime: 1000 * 60 * 5,
  });
};

// ============================================================================
// GET FEATURED PROGRAMS
// ============================================================================

export const useFeaturedPrograms = () => {
  return useQuery({
    queryKey: ["programs", "featured"],
    queryFn: getFeaturedPrograms,
    staleTime: 1000 * 60 * 5,
  });
};

// ============================================================================
// GET PROGRAM BY ID
// ============================================================================

export const useProgramById = (id) => {
  return useQuery({
    queryKey: ["programs", id],
    queryFn: () => getProgramById(id),
    enabled: !!id,
    staleTime: 1000 * 60 * 5,
  });
};

// ============================================================================
// GET PROGRAM BY SLUG
// ============================================================================

export const useProgramBySlug = (slug) => {
  return useQuery({
    queryKey: ["programs", "slug", slug],
    queryFn: () => getProgramBySlug(slug),
    enabled: !!slug,
    staleTime: 1000 * 60 * 5,
  });
};

// ============================================================================
// GET PROGRAMS BY CATEGORY
// ============================================================================

export const useProgramsByCategory = (categoryId) => {
  return useQuery({
    queryKey: ["programs", "category", categoryId],
    queryFn: () => getProgramsByCategory(categoryId),
    enabled: !!categoryId,
    staleTime: 1000 * 60 * 5,
  });
};

// ============================================================================
// SEARCH PROGRAMS
// ============================================================================

export const useSearchPrograms = (params = {}) => {
  return useQuery({
    queryKey: ["programs", "search", params],
    queryFn: () => searchPrograms(params),
    enabled: Object.values(params).some(
      (value) => value !== "" && value != null,
    ),
    staleTime: 1000 * 60 * 5,
  });
};
