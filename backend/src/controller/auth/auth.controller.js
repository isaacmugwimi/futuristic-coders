import asyncHandler from "../../middleware/error/asyncHandler.js";
import * as authService from "../../services/auth/auth.service.js";

import {
  ACCESS_COOKIE_OPTIONS,
  CLEAR_COOKIE_OPTIONS,
  REFRESH_COOKIE_OPTIONS,
} from "../../utils/cookies/authCookies.js";

// ============================================================
// LOGIN
// POST /api/auth/login
// ============================================================

export const login = asyncHandler(async (req, res) => {
  const result = await authService.loginService(req.body);

  res.cookie("accessToken", result.accessToken, ACCESS_COOKIE_OPTIONS);
  res.cookie("refreshToken", result.refreshToken, REFRESH_COOKIE_OPTIONS);

  return res.status(200).json({
    success: true,
    message: "Login successful.",
    data: {
      user: result.user,
    },
  });
});

// ============================================================
// LOGOUT
// POST /api/auth/logout
// ============================================================

export const logout = asyncHandler(async (req, res) => {
  const refreshToken = req.cookies?.refreshToken;

  const result = await authService.logoutService(refreshToken);

res.clearCookie("accessToken", CLEAR_COOKIE_OPTIONS);
res.clearCookie("refreshToken", CLEAR_COOKIE_OPTIONS);

  return res.status(200).json({
    success: true,
    message: result.message,
  });
});

// ============================================================
// REFRESH TOKEN
// POST /api/auth/refresh-token
// ============================================================

export const refreshToken = asyncHandler(async (req, res) => {
  const token = req.cookies?.refreshToken;

  const ipAddress =
    req.headers["x-forwarded-for"]?.split(",")[0].trim() || req.ip;

  const userAgent = req.get("user-agent") || null;

  const result = await authService.refreshTokenService(
    token,
    ipAddress,
    userAgent,
  );

  res.cookie("accessToken", result.accessToken, ACCESS_COOKIE_OPTIONS);
  res.cookie("refreshToken", result.refreshToken, REFRESH_COOKIE_OPTIONS);

  return res.status(200).json({
    success: true,
    message: "Session refreshed successfully.",
  });
});

// ============================================================
// CREATE USER
// POST /api/auth/users
// ============================================================

export const createUser = asyncHandler(async (req, res) => {
  const user = await authService.createUserService(req.body);

  return res.status(201).json({
    success: true,
    message: "User created successfully.",
    data: user,
  });
});

// ============================================================
// GET ALL USERS
// GET /api/auth/users
// ============================================================

export const getAllUsers = asyncHandler(async (req, res) => {
  const users = await authService.getAllUsersService();

  return res.status(200).json({
    success: true,
    message: "Users retrieved successfully.",
    data: users,
  });
});

// ============================================================
// GET USER BY ID
// GET /api/auth/users/:userId
// ============================================================

export const getUserById = asyncHandler(async (req, res) => {
  const user = await authService.getUserByIdService(req.params.userId);

  return res.status(200).json({
    success: true,
    message: "User retrieved successfully.",
    data: user,
  });
});

// ============================================================
// GET USER BY EMAIL
// GET /api/auth/users/email/:email
// ============================================================

export const getUserByEmail = asyncHandler(async (req, res) => {
  const user = await authService.getUserByEmailService(req.params.email);

  return res.status(200).json({
    success: true,
    message: "User retrieved successfully.",
    data: user,
  });
});

// ============================================================
// SEARCH USERS
// GET /api/auth/users/search?query=
// ============================================================

export const searchUsers = asyncHandler(async (req, res) => {
  const users = await authService.searchUsersService(req.query.query);

  return res.status(200).json({
    success: true,
    message: "User search completed successfully.",
    data: users,
  });
});

// ============================================================
// GET USER STATISTICS
// GET /api/auth/users/statistics
// ============================================================

export const getUserStatistics = asyncHandler(async (req, res) => {
  const statistics = await authService.getUserStatisticsService();

  return res.status(200).json({
    success: true,
    message: "User statistics retrieved successfully.",
    data: statistics,
  });
});

// ============================================================
// UPDATE USER
// PATCH /api/auth/users/:userId
// ============================================================

export const updateUser = asyncHandler(async (req, res) => {
  const user = await authService.updateUserService(
    req.params.userId,
    req.body,
  );

  return res.status(200).json({
    success: true,
    message: "User updated successfully.",
    data: user,
  });
});

// ============================================================
// ACTIVATE USER
// PATCH /api/auth/users/:userId/activate
// ============================================================

export const activateUser = asyncHandler(async (req, res) => {
  const user = await authService.activateUserService(req.params.userId);

  return res.status(200).json({
    success: true,
    message: "User activated successfully.",
    data: user,
  });
});

// ============================================================
// DEACTIVATE USER
// PATCH /api/auth/users/:userId/deactivate
// ============================================================

export const deactivateUser = asyncHandler(async (req, res) => {
  const user = await authService.deactivateUserService(req.params.userId);

  return res.status(200).json({
    success: true,
    message: "User deactivated successfully.",
    data: user,
  });
});

// ============================================================
// DELETE USER
// DELETE /api/auth/users/:userId
// ============================================================

export const deleteUser = asyncHandler(async (req, res) => {
  const user = await authService.deleteUserService(
    req.params.userId,
    req.user?.userId,
  );

  return res.status(200).json({
    success: true,
    message: "User deleted successfully.",
    data: user,
  });
});

// ============================================================
// FORGOT PASSWORD
// POST /api/auth/forgot-password
// TEMPORARILY DISABLED
// ============================================================

/*
export const forgotPassword = asyncHandler(async (req, res) => {
  const email = req.body.email.trim().toLowerCase();

  const result = await authService.forgotPasswordService(email);

  return res.status(200).json({
    success: true,
    ...result,
  });
});
*/

// ============================================================
// RESET PASSWORD
// POST /api/auth/reset-password
// TEMPORARILY DISABLED
// ============================================================

/*
export const resetPassword = asyncHandler(async (req, res) => {
  const { token, password } = req.body;

  const result = await authService.resetPasswordService(token, password);

  return res.status(200).json({
    success: true,
    ...result,
  });
});
*/