import asyncHandler from "../../middleware/error/asyncHandler.js";
import * as programService from "../../services/programs/programs.service.js";

// ============================================================
// CREATE PROGRAM
// POST /api/programs
// ============================================================

export const createProgram = asyncHandler(async (req, res) => {
  const program = await programService.createProgramService(req.body, req.user);

  return res.status(201).json({
    success: true,
    message: "Program created successfully.",
    data: program,
  });
});

// ============================================================
// GET ALL PROGRAMS
// GET /api/programs
// ============================================================

export const getAllPrograms = asyncHandler(async (req, res) => {
  const programs = await programService.getAllProgramsService();

  return res.status(200).json({
    success: true,
    count: programs.length,
    data: programs,
  });
});

// ============================================================
// GET PUBLISHED PROGRAMS
// GET /api/programs/published
// ============================================================

export const getPublishedPrograms = asyncHandler(async (req, res) => {
  const programs = await programService.getPublishedProgramsService();

  return res.status(200).json({
    success: true,
    count: programs.length,
    data: programs,
  });
});

// ============================================================
// GET PROGRAM BY ID
// GET /api/programs/:id
// ============================================================

export const getProgramById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const program = await programService.getProgramByIdService(id);

  return res.status(200).json({
    success: true,
    data: program,
  });
});

// ============================================================
// GET PROGRAM BY SLUG
// GET /api/programs/slug/:slug
// ============================================================

export const getProgramBySlug = asyncHandler(async (req, res) => {
  const { slug } = req.params;

  const program = await programService.getProgramBySlugService(slug);

  return res.status(200).json({
    success: true,
    data: program,
  });
});

// ============================================================
// SEARCH PROGRAMS
// GET /api/programs/search?q=python
// ============================================================

export const searchPrograms = asyncHandler(async (req, res) => {
  const searchTerm = req.query.q ?? req.query.search;

  const programs = await programService.searchProgramsService(searchTerm);

  return res.status(200).json({
    success: true,
    count: programs.length,
    data: programs,
  });
});

// ============================================================
// GET PROGRAMS BY CATEGORY
// GET /api/programs/category/:categoryId
// ============================================================

export const getProgramsByCategory = asyncHandler(async (req, res) => {
  const { categoryId } = req.params;

  const programs =
    await programService.getProgramsByCategoryService(categoryId);

  return res.status(200).json({
    success: true,
    count: programs.length,
    data: programs,
  });
});

// ============================================================
// GET FEATURED PROGRAMS
// GET /api/programs/featured
// ============================================================

export const getFeaturedPrograms = asyncHandler(async (req, res) => {
  const programs = await programService.getFeaturedProgramsService();

  return res.status(200).json({
    success: true,
    count: programs.length,
    data: programs,
  });
});

// ============================================================
// UPDATE PROGRAM
// PATCH /api/programs/:id
// ============================================================

export const updateProgram = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const program = await programService.updateProgramService(
    id,
    req.body,
    req.user,
  );

  return res.status(200).json({
    success: true,
    message: "Program updated successfully.",
    data: program,
  });
});

// ============================================================
// PUBLISH PROGRAM
// PATCH /api/programs/:id/publish
// ============================================================

export const publishProgram = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const program = await programService.publishProgramService(id, req.user);

  return res.status(200).json({
    success: true,
    message: "Program published successfully.",
    data: program,
  });
});

// ============================================================
// ARCHIVE PROGRAM
// PATCH /api/programs/:id/archive
// ============================================================

export const archiveProgram = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const program = await programService.archiveProgramService(id, req.user);

  return res.status(200).json({
    success: true,
    message: "Program archived successfully.",
    data: program,
  });
});

// ============================================================
// DELETE PROGRAM
// DELETE /api/programs/:id
// ============================================================

export const deleteProgram = asyncHandler(async (req, res) => {
  const { id } = req.params;

  await programService.deleteProgramService(id, req.user);

  return res.status(200).json({
    success: true,
    message: "Program deleted successfully.",
  });
});

// ============================================================
// CREATE PROGRAM CATEGORY
// POST /api/programs/categories
// ============================================================

export const createProgramCategory = asyncHandler(async (req, res) => {
  const category = await programService.createProgramCategoryService(req.body);

  return res.status(201).json({
    success: true,
    message: "Program category created successfully.",
    data: category,
  });
});

// ============================================================
// GET ALL PROGRAM CATEGORIES
// GET /api/programs/categories
// ============================================================

export const getAllProgramCategories = asyncHandler(async (req, res) => {
  const categories = await programService.getAllProgramCategoriesService();

  return res.status(200).json({
    success: true,
    count: categories.length,
    data: categories,
  });
});

// ============================================================
// GET PROGRAM CATEGORY BY ID
// GET /api/programs/categories/:id
// ============================================================

export const getProgramCategoryById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const category = await programService.getProgramCategoryByIdService(id);

  return res.status(200).json({
    success: true,
    data: category,
  });
});

// ============================================================
// UPDATE PROGRAM CATEGORY
// PATCH /api/programs/categories/:id
// ============================================================

export const updateProgramCategory = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const category = await programService.updateProgramCategoryService(
    id,
    req.body,
  );

  return res.status(200).json({
    success: true,
    message: "Program category updated successfully.",
    data: category,
  });
});

// ============================================================
// DELETE PROGRAM CATEGORY
// DELETE /api/programs/categories/:id
// ============================================================

export const deleteProgramCategory = asyncHandler(async (req, res) => {
  const { id } = req.params;

  await programService.deleteProgramCategoryService(id);

  return res.status(200).json({
    success: true,
    message: "Program category deleted successfully.",
  });
});
