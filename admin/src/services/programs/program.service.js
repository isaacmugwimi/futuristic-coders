import api from "@/src/utils/api/axiosInstance";
import { API_PATHS } from "@/src/utils/api/apiPaths";

// ============================================================================
// PROGRAMS — PUBLIC READ OPERATIONS
// ============================================================================

export const getAllPrograms = async () => {
  const { data } = await api.get(API_PATHS.PROGRAMS.GET_ALL);
  return data;
};

export const getPublishedPrograms = async () => {
  const { data } = await api.get(API_PATHS.PROGRAMS.GET_PUBLISHED);
  return data;
};

export const getFeaturedPrograms = async () => {
  const { data } = await api.get(API_PATHS.PROGRAMS.GET_FEATURED);
  return data;
};

export const getProgramById = async (programId) => {
  const { data } = await api.get(API_PATHS.PROGRAMS.GET_BY_ID(programId));
  return data;
};

export const getProgramBySlug = async (slug) => {
  const { data } = await api.get(API_PATHS.PROGRAMS.GET_BY_SLUG(slug));
  return data;
};

export const getProgramsByCategory = async (categoryId) => {
  const { data } = await api.get(
    API_PATHS.PROGRAMS.GET_BY_CATEGORY(categoryId),
  );
  return data;
};

export const searchPrograms = async (params = {}) => {
  const { data } = await api.get(API_PATHS.PROGRAMS.SEARCH, { params });
  return data;
};

// ============================================================================
// PROGRAMS — ADMIN MANAGEMENT
// ============================================================================

export const createProgram = async (programData) => {
  const { data } = await api.post(API_PATHS.PROGRAMS.CREATE, programData);
  return data;
};

export const updateProgram = async (programId, programData) => {
  const { data } = await api.patch(
    API_PATHS.PROGRAMS.UPDATE(programId),
    programData,
  );
  return data;
};

export const publishProgram = async (programId) => {
  const { data } = await api.patch(API_PATHS.PROGRAMS.PUBLISH(programId));
  return data;
};

export const archiveProgram = async (programId) => {
  const { data } = await api.patch(API_PATHS.PROGRAMS.ARCHIVE(programId));
  return data;
};

export const deleteProgram = async (programId) => {
  const { data } = await api.delete(API_PATHS.PROGRAMS.DELETE(programId));
  return data;
};

// ============================================================================
// PROGRAM CATEGORIES
// ============================================================================

export const getAllProgramCategories = async () => {
  const { data } = await api.get(API_PATHS.PROGRAMS.CATEGORIES.GET_ALL);
  return data;
};

export const createProgramCategory = async (categoryData) => {
  const { data } = await api.post(
    API_PATHS.PROGRAMS.CATEGORIES.CREATE,
    categoryData,
  );
  return data;
};



export const uploadImage = async (file, category = "general") => {
  const formData = new FormData();

  formData.append("image", file);
  formData.append("category", category);

  const { data } = await api.post(API_PATHS.UPLOADS.IMAGE, formData);

  

  return data.data;
};