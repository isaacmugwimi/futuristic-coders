// src/services/testimonials/testimonial.service.js  (public website)

import { API_PATHS } from "../../utils/apiPaths";
import api from "../../utils/axiosInstance";

// ============================================================================
// TESTIMONIALS: PUBLIC READ
// ============================================================================

// params: page, limit (1-50), rating (0 = all, 1-5), sort (newest | oldest | highest | lowest)
export const getPublishedTestimonials = async (params = {}) => {
  const { data } = await api.get(API_PATHS.TESTIMONIALS.GET_PUBLISHED, {
    params,
  });
  return data;
};

// params: limit (1-12)
export const getFeaturedTestimonials = async (params = {}) => {
  const { data } = await api.get(API_PATHS.TESTIMONIALS.GET_FEATURED, {
    params,
  });
  return data;
};

// ============================================================================
// TESTIMONIALS: PUBLIC SUBMIT (saved as "pending" until an admin approves it)
// ============================================================================

// payload: { name, email, relationship, rating, message, website? }
// The backend rejects any other field, so send only these.
export const submitTestimonial = async (payload) => {
  const { data } = await api.post(API_PATHS.TESTIMONIALS.SUBMIT, payload);
  return data;
};