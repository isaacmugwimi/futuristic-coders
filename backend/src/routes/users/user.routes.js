import { Router } from "express";

import {
  createUserController,
  getAllUsersController,
  getUserByIdController,
  getUserByEmailController,
  updateUserController,
  deleteUserController,
} from "../../controller/users/user.controller.js";

import {
  createUserSchema,
  updateUserSchema,
  userIdSchema,
  userEmailSchema,
} from "../../middleware/users/users.validation.js";
import { validate } from "../../middleware/validate.middleware.js";

const router = Router();

// ============================================================================
// GET ALL USERS
// GET /api/users
// ============================================================================

router.get("/", getAllUsersController);

// ============================================================================
// CREATE USER
// POST /api/users
// ============================================================================

router.post("/", validate(createUserSchema), createUserController);

// ============================================================================
// GET USER BY EMAIL
// GET /api/users/email/:email
// ============================================================================

router.get(
  "/email/:email",
  validate(userEmailSchema, "params"),
  getUserByEmailController,
);

// ============================================================================
// GET USER BY ID
// GET /api/users/:id
// ============================================================================

router.get("/:id", validate(userIdSchema, "params"), getUserByIdController);

// ============================================================================
// UPDATE USER
// PATCH /api/users/:id
// ============================================================================

router.patch(
  "/:id",
  validate(userIdSchema, "params"),
  validate(updateUserSchema),
  updateUserController,
);

// ============================================================================
// DELETE USER
// DELETE /api/users/:id
// ============================================================================

router.delete("/:id", validate(userIdSchema, "params"), deleteUserController);

export default router;
