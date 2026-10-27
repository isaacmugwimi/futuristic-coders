import asyncHandler from "../../middleware/error/asyncHandler.js";
import * as programService from "../../services/programs/programs.service.js";

// ============================================================
// CREATE PROGRAM
// ============================================================

export const createProgram = asyncHandler(async (req, res) => {
  const user = {
    ...req.user,
    id: req.user?.id ?? req.user?.userId,
  };

  console.log("Authenticated user:", {
    id: user.id,
    userId: user.userId,
    role: user.role,
  });

  const program = await programService.createProgramService(
    req.body,
    user
  );

  return res.status(201).json({
    success: true,
    message: "Program created successfully.",
    data: program,
  });
});

// ============================================================
// GET ALL PROGRAMS
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

// ============================================================

export const deleteProgramCategory = asyncHandler(async (req, res) => {
  const { id } = req.params;

  await programService.deleteProgramCategoryService(id);

  return res.status(200).json({
    success: true,
    message: "Program category deleted successfully.",
  });
});

