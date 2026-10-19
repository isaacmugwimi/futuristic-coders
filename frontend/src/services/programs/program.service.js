// src/services/programs/program.service.js  (public website)

import { API_PATHS } from "../../utils/apiPaths";
import api from "../../utils/axiosInstance";


// ============================================================================
// PROGRAMS — PUBLIC READ
// ============================================================================

export const getPublishedPrograms = async () => {
  const { data } = await api.get(API_PATHS.PROGRAMS.GET_PUBLISHED);
  return data;
};

// ============================================================================
// PROGRAM CATEGORIES — PUBLIC READ
// ============================================================================

export const getAllCategories = async () => {
  const { data } = await api.get(API_PATHS.PROGRAMS.CATEGORIES.GET_ALL);
  return data;
};