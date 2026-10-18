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
  getAllProgramCategories,
} from "@/src/services/programs/program.service";

const STALE_TIME = 1000 * 60 * 5;

// ============================================================================
// GET ALL PROGRAMS
// ============================================================================

export const usePrograms = () =>
  useQuery({
    queryKey: ["programs"],
    queryFn: getAllPrograms,
    staleTime: STALE_TIME,
  });

// ============================================================================
// GET PUBLISHED PROGRAMS
// ============================================================================

export const usePublishedPrograms = () =>
  useQuery({
    queryKey: ["programs", "published"],
    queryFn: getPublishedPrograms,
    staleTime: STALE_TIME,
  });

// ============================================================================
// GET FEATURED PROGRAMS
// ============================================================================

export const useFeaturedPrograms = () =>
  useQuery({
    queryKey: ["programs", "featured"],
    queryFn: getFeaturedPrograms,
    staleTime: STALE_TIME,
  });

// ============================================================================
// GET PROGRAM BY ID
// ============================================================================

export const useProgramById = (id) =>
  useQuery({
    queryKey: ["programs", id],
    queryFn: () => getProgramById(id),
    enabled: id !== undefined && id !== null && id !== "",
    staleTime: STALE_TIME,
  });

// ============================================================================
// GET ALL PROGRAM CATEGORIES
// ============================================================================

export const useProgramCategories = () =>
  useQuery({
    queryKey: ["programCategories"],
    queryFn: getAllProgramCategories,
    staleTime: 1000 * 60 * 5,
  });

// ============================================================================
// GET PROGRAM BY SLUG
// ============================================================================

export const useProgramBySlug = (slug) =>
  useQuery({
    queryKey: ["programs", "slug", slug],
    queryFn: () => getProgramBySlug(slug),
    enabled: Boolean(slug),
    staleTime: STALE_TIME,
  });

// ============================================================================
// GET PROGRAMS BY CATEGORY
// ============================================================================

export const useProgramsByCategory = (categoryId) =>
  useQuery({
    queryKey: ["programs", "category", categoryId],
    queryFn: () => getProgramsByCategory(categoryId),
    enabled:
      categoryId !== undefined && categoryId !== null && categoryId !== "",
    staleTime: STALE_TIME,
  });

// ============================================================================
// SEARCH PROGRAMS
// ============================================================================

export const useSearchPrograms = (params = {}) => {
  const hasSearchParams = Object.values(params).some(
    (value) => value !== "" && value !== null && value !== undefined,
  );

  return useQuery({
    queryKey: ["programs", "search", params],
    queryFn: () => searchPrograms(params),
    enabled: hasSearchParams,
    staleTime: STALE_TIME,
  });
};
