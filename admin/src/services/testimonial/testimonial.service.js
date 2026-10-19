import api from "@/src/utils/api/axiosInstance";
import { API_PATHS } from "@/src/utils/api/apiPaths";

// ============================================================================
// TESTIMONIALS — PUBLIC OPERATIONS
// ============================================================================

// Body: { name, email, relationship, rating, message }
export const submitTestimonial = async (testimonialData) => {
  const { data } = await api.post(
    API_PATHS.TESTIMONIALS.SUBMIT,
    testimonialData,
  );
  return data;
};

// Params: page, limit, rating (0 = all), sort (newest | oldest | highest | lowest)
// Returns: { success, count, total, stats, data }
export const getPublishedTestimonials = async (params = {}) => {
  const { data } = await api.get(API_PATHS.TESTIMONIALS.GET_PUBLISHED, {
    params,
  });
  return data;
};

// Params: limit
export const getFeaturedTestimonials = async (params = {}) => {
  const { data } = await api.get(API_PATHS.TESTIMONIALS.GET_FEATURED, {
    params,
  });
  return data;
};

// ============================================================================
// TESTIMONIALS — ADMIN READ OPERATIONS
// ============================================================================

// Params: status (pending | approved | published | rejected | archived),
// rating, search
export const getAllTestimonials = async (params = {}) => {
  const { data } = await api.get(API_PATHS.TESTIMONIALS.GET_ALL, { params });
  return data;
};

// Returns counts per status for the tab badges
export const getTestimonialCounts = async () => {
  const { data } = await api.get(API_PATHS.TESTIMONIALS.GET_COUNTS);
  return data;
};

export const getTestimonialById = async (testimonialId) => {
  const { data } = await api.get(
    API_PATHS.TESTIMONIALS.GET_BY_ID(testimonialId),
  );
  return data;
};

// ============================================================================
// TESTIMONIALS — ADMIN MODERATION
// ============================================================================

// Body: { message?, adminNotes?, featured? }
export const updateTestimonial = async (testimonialId, testimonialData) => {
  const { data } = await api.patch(
    API_PATHS.TESTIMONIALS.UPDATE(testimonialId),
    testimonialData,
  );
  return data;
};

export const approveTestimonial = async (testimonialId) => {
  const { data } = await api.patch(
    API_PATHS.TESTIMONIALS.APPROVE(testimonialId),
  );
  return data;
};

export const publishTestimonial = async (testimonialId) => {
  const { data } = await api.patch(
    API_PATHS.TESTIMONIALS.PUBLISH(testimonialId),
  );
  return data;
};

// Body (optional): { adminNotes }
export const rejectTestimonial = async (testimonialId, rejectData = {}) => {
  const { data } = await api.patch(
    API_PATHS.TESTIMONIALS.REJECT(testimonialId),
    rejectData,
  );
  return data;
};

export const archiveTestimonial = async (testimonialId) => {
  const { data } = await api.patch(
    API_PATHS.TESTIMONIALS.ARCHIVE(testimonialId),
  );
  return data;
};

// featured: true | false
export const setTestimonialFeatured = async (testimonialId, featured) => {
  const { data } = await api.patch(
    API_PATHS.TESTIMONIALS.FEATURE(testimonialId),
    { featured },
  );
  return data;
};

// ============================================================================
// TESTIMONIALS — ADMIN DELETE
// ============================================================================

export const deleteTestimonial = async (testimonialId) => {
  const { data } = await api.delete(
    API_PATHS.TESTIMONIALS.DELETE(testimonialId),
  );
  return data;
};