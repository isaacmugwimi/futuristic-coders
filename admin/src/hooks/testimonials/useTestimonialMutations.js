"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import {
  submitTestimonial,
  updateTestimonial,
  approveTestimonial,
  publishTestimonial,
  rejectTestimonial,
  archiveTestimonial,
  setTestimonialFeatured,
  deleteTestimonial,
} from "@/src/services/testimonial/testimonial.service";

// Every key starts with "testimonials", so invalidating that one prefix
// refreshes the admin lists, the status counts, the public lists, the featured
// strip, and any single-review query in one call.

// ============================================================================
// SUBMIT TESTIMONIAL (public form)
// New reviews are saved as pending, so nothing public changes yet.
// ============================================================================

export const useSubmitTestimonial = () =>
  useMutation({
    mutationFn: submitTestimonial,
  });

// ============================================================================
// UPDATE TESTIMONIAL (admin: fix typos, notes, featured)
// ============================================================================

export const useUpdateTestimonial = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }) => updateTestimonial(id, data),

    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["testimonials"],
      });
    },
  });
};

// ============================================================================
// APPROVE TESTIMONIAL
// ============================================================================

export const useApproveTestimonial = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: approveTestimonial,

    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["testimonials"],
      });
    },
  });
};

// ============================================================================
// PUBLISH TESTIMONIAL
// ============================================================================

export const usePublishTestimonial = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: publishTestimonial,

    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["testimonials"],
      });
    },
  });
};

// ============================================================================
// REJECT TESTIMONIAL
// Usage: reject({ id, data: { adminNotes: "Looks like spam" } })
// ============================================================================

export const useRejectTestimonial = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }) => rejectTestimonial(id, data),

    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["testimonials"],
      });
    },
  });
};

// ============================================================================
// ARCHIVE TESTIMONIAL
// ============================================================================

export const useArchiveTestimonial = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: archiveTestimonial,

    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["testimonials"],
      });
    },
  });
};

// ============================================================================
// SET TESTIMONIAL FEATURED
// Usage: setFeatured({ id, featured: true })
// ============================================================================

export const useSetTestimonialFeatured = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, featured }) => setTestimonialFeatured(id, featured),

    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["testimonials"],
      });
    },
  });
};

// ============================================================================
// DELETE TESTIMONIAL
// ============================================================================

export const useDeleteTestimonial = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteTestimonial,

    onSuccess: async (_, id) => {
      // Drop the deleted review's own cache entry first so nothing refetches
      // an id that no longer exists, then refresh everything else.
      queryClient.removeQueries({
        queryKey: ["testimonials", id],
      });

      await queryClient.invalidateQueries({
        queryKey: ["testimonials"],
      });
    },
  });
};
