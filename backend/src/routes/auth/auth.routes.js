import { Router } from "express";

import {
  login,
  logout,
  refreshToken,
  createUser,
  getAllUsers,
  getUserById,
  getUserByEmail,
  searchUsers,
  getUserStatistics,
  updateUser,
  activateUser,
  deactivateUser,
  deleteUser,
} from "../../controller/auth/auth.controller.js";

import {
  authenticateUser,
  authorizeRoles,
} from "../../middleware/auth/auth.middleware.js";

import { validate } from "../../middleware/validate.middleware.js";

import {
  loginSchema,
  createUserSchema,
  updateUserSchema,
  userIdParamsSchema,
  emailParamsSchema,
  searchUsersQuerySchema,
} from "../../middleware/validators/auth/auth.validation.js";

const router = Router();

// ======================================
// PUBLIC AUTHENTICATION ROUTES
// ======================================

router.post("/login", validate(loginSchema), login);

router.post("/logout", logout);

router.post("/refresh-token", refreshToken);

// ======================================
// USER MANAGEMENT
// ======================================

// Create user — owner only
router.post(
  "/create-users",
  authenticateUser,
  authorizeRoles("owner"),
  validate(createUserSchema),
  createUser,
);

// Get all users — owner and admin
router.get(
  "/get-all-users",
  authenticateUser,
  authorizeRoles("owner", "admin"),
  getAllUsers,
);

// User statistics — owner and admin
router.get(
  "/users/statistics",
  authenticateUser,
  authorizeRoles("owner", "admin"),
  getUserStatistics,
);

// Search users — owner and admin
router.get(
  "/users/search",
  authenticateUser,
  authorizeRoles("owner", "admin"),
  validate(searchUsersQuerySchema, "query"),
  searchUsers,
);

// Get user by email — owner and admin
router.get(
  "/users/email/:email",
  authenticateUser,
  authorizeRoles("owner", "admin"),
  validate(emailParamsSchema, "params"),
  getUserByEmail,
);

// Get user by ID — owner and admin
router.get(
  "/users/:userId",
  authenticateUser,
  authorizeRoles("owner", "admin"),
  validate(userIdParamsSchema, "params"),
  getUserById,
);

// Update user — owner only
router.patch(
  "/users/:userId",
  authenticateUser,
  authorizeRoles("owner"),
  validate(userIdParamsSchema, "params"),
  validate(updateUserSchema),
  updateUser,
);

// Activate user — owner only
router.patch(
  "/users/:userId/activate",
  authenticateUser,
  authorizeRoles("owner"),
  validate(userIdParamsSchema, "params"),
  activateUser,
);

// Deactivate user — owner only
router.patch(
  "/users/:userId/deactivate",
  authenticateUser,
  authorizeRoles("owner"),
  validate(userIdParamsSchema, "params"),
  deactivateUser,
);

// Delete user — owner only
router.delete(
  "/users/:userId",
  authenticateUser,
  authorizeRoles("owner"),
  validate(userIdParamsSchema, "params"),
  deleteUser,
);

export default router;
