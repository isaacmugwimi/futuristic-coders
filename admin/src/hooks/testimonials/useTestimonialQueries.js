"use client";

import { useQuery } from "@tanstack/react-query";

import {
  getPublishedTestimonials,
  getFeaturedTestimonials,
  getAllTestimonials,
  getTestimonialCounts,
  getTestimonialById,
} from "@/src/services/testimonial/testimonial.service";

const STALE_TIME = 1000 * 60 * 5;

// New reviews arrive at any time, so the admin views refresh sooner.
const ADMIN_STALE_TIME = 1000 * 60;

// ============================================================================
// GET PUBLISHED TESTIMONIALS (public)
// params: { page, limit, rating, sort }
// ============================================================================

export const usePublishedTestimonials = (params = {}) =>
  useQuery({
    queryKey: ["testimonials", "published", params],
    queryFn: () => getPublishedTestimonialsnials(params),
    staleTime: STALE_TIME,
  });

// ============================================================================
// GET FEATURED TESTIMONIALS (public)
// params: { limit }
// ============================================================================

export const useFeaturedTestimonials = (params = {}) =>
  useQuery({
    queryKey: ["testimonials", "featured", params],
    queryFn: () => getFeaturedTestimonials(params),
    staleTime: STALE_TIME,
  });

// ============================================================================
// GET ALL TESTIMONIALS (admin)
// params: { status, rating, search }
// ============================================================================

export const useTestimonials = (params = {}) =>
  useQuery({
    queryKey: ["testimonials", "admin", params],
    queryFn: () => getAllTestimonials(params),
    staleTime: ADMIN_STALE_TIME,
  });

// ============================================================================
// GET TESTIMONIAL COUNTS BY STATUS (admin tab badges)
// ============================================================================

export const useTestimonialCounts = () =>
  useQuery({
    queryKey: ["testimonials", "counts"],
    queryFn: getTestimonialCounts,
    staleTime: ADMIN_STALE_TIME,
  });

// ============================================================================
// GET TESTIMONIAL BY ID (admin)
// ============================================================================

export const useTestimonialById = (id) =>
  useQuery({
    queryKey: ["testimonials", id],
    queryFn: () => getTestimonialById(id),
    enabled: id !== undefined && id !== null && id !== "",
    staleTime: ADMIN_STALE_TIME,
  });
