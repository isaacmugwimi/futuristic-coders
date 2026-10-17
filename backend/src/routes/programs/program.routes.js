import { Router } from "express";

import {
  createProgram,
  getAllPrograms,
  getPublishedPrograms,
  getProgramById,
  getProgramBySlug,
  searchPrograms,
  getProgramsByCategory,
  getFeaturedPrograms,
  updateProgram,
  publishProgram,
  archiveProgram,
  deleteProgram,
} from "../../controller/programs/program.controller.js";

import {
  authenticateUser,
  authorizeRoles,
} from "../../middleware/auth/auth.middleware.js";

import { validate } from "../../middleware/validate.middleware.js";

import {
  createProgramSchema,
  updateProgramSchema,
  programIdParamsSchema,
  programSlugParamsSchema,
  programCategoryParamsSchema,
  searchProgramsQuerySchema,
} from "../../middleware/validators/programs/programs.validation.js";

const router = Router();

// ======================================
// PUBLIC PROGRAM ROUTES
// ======================================

// Get all programs
router.get("/get-all-programs", getAllPrograms);

// Get published programs
router.get("/get-published-programs", getPublishedPrograms);

// Get featured programs
router.get("/get-featured-programs", getFeaturedPrograms);

// Search programs
router.get(
  "/search-programs",
  validate(searchProgramsQuerySchema, "query"),
  searchPrograms,
);

// Get program by ID
router.get(
  "/get-program-by-id/:id",
  validate(programIdParamsSchema, "params"),
  getProgramById,
);

// Get program by slug
router.get(
  "/get-program-by-slug/:slug",
  validate(programSlugParamsSchema, "params"),
  getProgramBySlug,
);

// Get programs by category
router.get(
  "/get-programs-by-category/:categoryId",
  validate(programCategoryParamsSchema, "params"),
  getProgramsByCategory,
);

// ======================================
// PROGRAM MANAGEMENT
// ======================================

// Create program — admin only
router.post(
  "/create-program",
  authenticateUser,
  authorizeRoles("admin"),
  validate(createProgramSchema),
  createProgram,
);

// Update program — admin only
router.patch(
  "/update-program/:id",
  authenticateUser,
  authorizeRoles("admin"),
  validate(programIdParamsSchema, "params"),
  validate(updateProgramSchema),
  updateProgram,
);

// Publish program — admin only
router.patch(
  "/publish-program/:id",
  authenticateUser,
  authorizeRoles("admin"),
  validate(programIdParamsSchema, "params"),
  publishProgram,
);

// Archive program — admin only
router.patch(
  "/archive-program/:id",
  authenticateUser,
  authorizeRoles("admin"),
  validate(programIdParamsSchema, "params"),
  archiveProgram,
);

// Delete program — admin only
router.delete(
  "/delete-program/:id",
  authenticateUser,
  authorizeRoles("admin"),
  validate(programIdParamsSchema, "params"),
  deleteProgram,
);

export default router;
