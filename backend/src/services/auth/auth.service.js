
import bcrypt from "bcryptjs";
// import crypto from "crypto";

import {
  getUserByEmail,
  updateLastLogin,
  // setPasswordResetToken,
  // getUserByPasswordResetTokenHash,
  // resetPasswordWithToken,
} from "../../database/models/users/user.model.js";

import {
  createRefreshToken,
  getRefreshTokenByHash,
  revokeRefreshToken,
} from "../../database/models/token/refreshToken.model.js";

import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} from "../../utils/jwt/jwt.utils.js";

import { getRefreshTokenExpiryDate } from "../../utils/tokens/tokenExpiry.js";
// import { sendPasswordResetEmail } from "../../Utils/Email/email.service.js";
import AppError from "../../middleware/error/AppError.js";
import { hashRefreshToken } from "../../utils/tokens/tokenHash.utils.js";

const SALT_ROUNDS = 12;
// const RESET_TOKEN_TTL_MINUTES = 30;

// ====================
// LOGIN
// ====================

export const loginService = async ({ email, password }) => {
  if (!email || !password) {
    throw new AppError("Email and password are required.", 422);
  }

  const normalizedEmail = email.trim().toLowerCase();
  const user = await getUserByEmail(normalizedEmail);

  if (!user) {
    throw new AppError("Invalid email or password.", 401);
  }

  if (!user.is_active) {
    throw new AppError(
      "Your account is inactive. Contact your administrator.",
      403,
    );
  }

  const passwordMatches = await bcrypt.compare(password, user.password);

  if (!passwordMatches) {
    throw new AppError("Invalid email or password.", 401);
  }

  const payload = {
    userId: user.id,
    role: user.role,
  };

  const accessToken = generateAccessToken(payload);
  const refreshToken = generateRefreshToken(payload);

  const tokenHash = hashRefreshToken(refreshToken);

  await createRefreshToken({
    user_id: user.id,
    token_hash: tokenHash,
    expires_at: getRefreshTokenExpiryDate(),
  });

  await updateLastLogin(user.id);

  return {
    accessToken,
    refreshToken,
    user: {
      id: user.id,
      staffCode: user.staff_code,
      fullName: user.full_name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      profilePictureUrl: user.profile_picture_url,
      isActive: user.is_active,
    },
  };
};

// ====================
// LOGOUT
// ====================

export const logoutService = async (refreshToken) => {
  if (!refreshToken) {
    return {
      success: true,
      message: "Logged out successfully.",
    };
  }

  const tokenHash = hashRefreshToken(refreshToken);
  const session = await getRefreshTokenByHash(tokenHash);

  if (session) {
    await revokeRefreshToken(session.id);
  }

  return {
    success: true,
    message: "Logged out successfully.",
  };
};

// ====================
// REFRESH ACCESS TOKEN
// ====================

export const refreshTokenService = async (
  refreshToken,
  ipAddress,
  userAgent,
) => {
  if (!refreshToken) {
    throw new AppError("Refresh token is required.", 401);
  }

  let payload;

  try {
    payload = verifyRefreshToken(refreshToken);
  } catch {
    throw new AppError("Invalid or expired refresh token.", 401);
  }

  const tokenHash = hashRefreshToken(refreshToken);
  const session = await getRefreshTokenByHash(tokenHash);

  if (!session || session.user_id !== payload.userId) {
    throw new AppError("Invalid refresh session.", 401);
  }

  const newPayload = {
    userId: payload.userId,
    role: payload.role,
  };

  const accessToken = generateAccessToken(newPayload);
  const newRefreshToken = generateRefreshToken(newPayload);
  const newTokenHash = hashRefreshToken(newRefreshToken);

  await createRefreshToken({
    user_id: payload.userId,
    token_hash: newTokenHash,
    expires_at: getRefreshTokenExpiryDate(),
    ip_address: ipAddress,
    user_agent: userAgent,
  });

  await revokeRefreshToken(session.id);

  return {
    accessToken,
    refreshToken: newRefreshToken,
  };
};

// ====================
// FORGOT PASSWORD
// TEMPORARILY DISABLED
// ====================

// export const forgotPasswordService = async (email) => {
//   if (!email) {
//     throw new AppError("Email is required.", 422);
//   }

//   const normalizedEmail = email.trim().toLowerCase();
//   const rawToken = crypto.randomBytes(32).toString("hex");

//   const tokenHash = crypto
//     .createHash("sha256")
//     .update(rawToken)
//     .digest("hex");

//   const expiresAt = new Date(
//     Date.now() + RESET_TOKEN_TTL_MINUTES * 60 * 1000,
//   );

//   const user = await setPasswordResetToken(
//     normalizedEmail,
//     tokenHash,
//     expiresAt,
//   );

//   if (user) {
//     const resetLink =
//       `${process.env.CLIENT_URL}/reset-password?token=${rawToken}`;

//     try {
//       await sendPasswordResetEmail({
//         to: user.email,
//         fullName: user.full_name,
//         resetLink,
//       });
//     } catch (error) {
//       console.error("Failed to send password reset email:", error);
//     }
//   }

//   return {
//     message:
//       "If an account exists for this email, a password reset link has been sent.",
//   };
// };

// ====================
// RESET PASSWORD
// TEMPORARILY DISABLED
// ====================

// export const resetPasswordService = async (token, password) => {
//   if (!token || !password) {
//     throw new AppError("Token and new password are required.", 422);
//   }

//   if (password.length < 6) {
//     throw new AppError(
//       "Password must be at least 6 characters long.",
//       422,
//     );
//   }

//   const tokenHash = crypto
//     .createHash("sha256")
//     .update(token)
//     .digest("hex");

//   const user = await getUserByPasswordResetTokenHash(tokenHash);

//   if (!user) {
//     throw new AppError(
//       "This reset link is invalid or has expired.",
//       400,
//     );
//   }

//   const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

//   await resetPasswordWithToken(user.id, hashedPassword);

//   return {
//     message: "Password reset successful. You can now sign in.",
//   };
// };
