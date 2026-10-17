import asyncHandler from "../../middleware/error/asyncHandler.js";
import * as authService from "../../services/auth/auth.service.js";

import {
  ACCESS_COOKIE_OPTIONS,
  REFRESH_COOKIE_OPTIONS,
} from "../../utils/cookies/authCookies.js";

// ─── LOGIN ────────────────────────────────────────────────────────────────
// POST /api/auth/login

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

// ─── LOGOUT ───────────────────────────────────────────────────────────────
// POST /api/auth/logout

export const logout = asyncHandler(async (req, res) => {
  const refreshToken = req.cookies?.refreshToken;

  const result = await authService.logoutService(refreshToken);

  res.clearCookie("accessToken", ACCESS_COOKIE_OPTIONS);
  res.clearCookie("refreshToken", REFRESH_COOKIE_OPTIONS);

  return res.status(200).json({
    success: true,
    message: result?.message || "Logged out successfully.",
  });
});

// ─── REFRESH TOKEN ────────────────────────────────────────────────────────
// POST /api/auth/refresh

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

// ─── FORGOT PASSWORD ─────────────────────────────────────────────────────
// POST /api/auth/forgot-password
// Temporarily disabled. Uncomment when enabling password recovery.

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

// ─── RESET PASSWORD ──────────────────────────────────────────────────────
// POST /api/auth/reset-password
// Temporarily disabled. Uncomment when enabling password recovery.

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