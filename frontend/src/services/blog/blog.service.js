// src/services/blog/blog.service.js  (public website)

import { API_PATHS } from "../../utils/apiPaths";
import api from "../../utils/axiosInstance";

// ============================================================================
// BLOG POSTS — PUBLIC READ
// ============================================================================

export const getPublishedPosts = async () => {
  const { data } = await api.get(API_PATHS.BLOG.GET_PUBLISHED);
  return data;
};

export const getPostBySlug = async (slug) => {
  const { data } = await api.get(API_PATHS.BLOG.GET_PUBLISHED_BY_SLUG(slug));
  return data;
};

// ============================================================================
// BLOG CATEGORIES — PUBLIC READ
// ============================================================================

export const getAllBlogCategories = async () => {
  const { data } = await api.get(API_PATHS.BLOG.CATEGORIES.GET_ALL);
  return data;
};