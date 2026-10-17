
import api from "@/src/utils/api/axiosInstance";
import { API_PATHS } from "@/src/utils/api/apiPaths";

// ============================================================================
// PROGRAMS SERVICE
// ============================================================================

// GET ALL PROGRAMS
export const getAllPrograms = async () => {
  const response = await api.get(
    API_PATHS.PROGRAMS.GET_ALL,
  );

  return response.data;
};

// GET PUBLISHED PROGRAMS
export const getPublishedPrograms = async () => {
  const response = await api.get(
    API_PATHS.PROGRAMS.GET_PUBLISHED,
  );

  return response.data;
};

// GET FEATURED PROGRAMS
export const getFeaturedPrograms = async () => {
  const response = await api.get(
    API_PATHS.PROGRAMS.GET_FEATURED,
  );

  return response.data;
};

// GET PROGRAM BY ID
export const getProgramById = async (programId) => {
  const response = await api.get(
    API_PATHS.PROGRAMS.GET_BY_ID(programId),
  );

  return response.data;
};

// GET PROGRAM BY SLUG
export const getProgramBySlug = async (slug) => {
  const response = await api.get(
    API_PATHS.PROGRAMS.GET_BY_SLUG(slug),
  );

  return response.data;
};

// GET PROGRAMS BY CATEGORY
export const getProgramsByCategory = async (categoryId) => {
  const response = await api.get(
    API_PATHS.PROGRAMS.GET_BY_CATEGORY(categoryId),
  );

  return response.data;
};

// SEARCH PROGRAMS
export const searchPrograms = async (params = {}) => {
  const response = await api.get(
    API_PATHS.PROGRAMS.SEARCH,
    { params },
  );

  return response.data;
};

// CREATE PROGRAM
export const createProgram = async (programData) => {
  const response = await api.post(
    API_PATHS.PROGRAMS.CREATE,
    programData,
  );

  return response.data;
};

// UPDATE PROGRAM
export const updateProgram = async (programId, programData) => {
  const response = await api.patch(
    API_PATHS.PROGRAMS.UPDATE(programId),
    programData,
  );

  return response.data;
};

// PUBLISH PROGRAM
export const publishProgram = async (programId) => {
  const response = await api.patch(
    API_PATHS.PROGRAMS.PUBLISH(programId),
  );

  return response.data;
};

// ARCHIVE PROGRAM
export const archiveProgram = async (programId) => {
  const response = await api.patch(
    API_PATHS.PROGRAMS.ARCHIVE(programId),
  );

  return response.data;
};

// DELETE PROGRAM
export const deleteProgram = async (programId) => {
  const response = await api.delete(
    API_PATHS.PROGRAMS.DELETE(programId),
  );

  return response.data;
};
