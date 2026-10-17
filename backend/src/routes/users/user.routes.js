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
// import { getAllUsersController } from "../../controller/users/user.controller.js";

const router = Router();

// ============================================================================
// 1. GET ALL USERS
// GET /api/users/get-users
// ============================================================================

router.get(
  "/get-users",
  getAllUsersController,
);

// ============================================================================
// 2. CREATE USER / REGISTER STAFF
// POST /api/users/create-user
// ============================================================================

router.post(
  "/create-user",
  validate(createUserSchema),
  createUserController,
);

// ============================================================================
// 3. GET USER BY EMAIL
// GET /api/users/get-user-by-email/:email
// ============================================================================

router.get(
  "/get-user-by-email/:email",
  validate(userEmailSchema, "params"),
  getUserByEmailController,
);

// ============================================================================
// 4. GET USER BY ID
// GET /api/users/get-user-by-id/:id
// ============================================================================

router.get(
  "/get-user-by-id/:id",
  validate(userIdSchema, "params"),
  getUserByIdController,
);

// ============================================================================
// 5. UPDATE USER
// PATCH /api/users/update-user/:id
// ============================================================================

router.patch(
  "/update-user/:id",
  validate(userIdSchema, "params"),
  validate(updateUserSchema),
  updateUserController,
);

// ============================================================================
// 6. DELETE USER
// DELETE /api/users/delete-user/:id
// ============================================================================

router.delete(
  "/delete-user/:id",
  validate(userIdSchema, "params"),
  deleteUserController,
);

export default router;
