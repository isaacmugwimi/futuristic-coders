
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


// import {
//   authenticateUser,
//   authorizeRoles,
// } from "../../middleware/auth.middleware.js";

const router = Router();

/*
|--------------------------------------------------------------------------
| Public Routes
|--------------------------------------------------------------------------
*/

// GET all programs
router.get("/get-all-programs", getAllPrograms);

// GET published programs
router.get("/get-published-programs", getPublishedPrograms);

// GET featured programs
router.get("/get-featured-programs", getFeaturedPrograms);

// Search programs
router.get("/search-programs", searchPrograms);

// GET program by ID
router.get("/get-program-by-id/:id", getProgramById);

// GET program by slug
router.get("/get-program-by-slug/:slug", getProgramBySlug);

// GET programs by category
router.get(
  "/get-programs-by-category/:categoryId",
  getProgramsByCategory
);

/*
|--------------------------------------------------------------------------
| Protected Admin Routes
|--------------------------------------------------------------------------
*/

// CREATE program
router.post(
  "/create-program",
  authenticateUser,
  authorizeRoles("admin"),
  createProgram
);

// UPDATE program
router.patch(
  "/update-program/:id",
  authenticateUser,
  authorizeRoles("admin"),
  updateProgram
);

// PUBLISH program
router.patch(
  "/publish-program/:id",
  authenticateUser,
  authorizeRoles("admin"),
  publishProgram
);

// ARCHIVE program
router.patch(
  "/archive-program/:id",
  authenticateUser,
  authorizeRoles("admin"),
  archiveProgram
);

// DELETE program
router.delete(
  "/delete-program/:id",
  authenticateUser,
  authorizeRoles("admin"),
  deleteProgram
);

export default router;
