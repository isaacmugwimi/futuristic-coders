import bcrypt from "bcryptjs";
// import crypto from "crypto";

import {
  createUser,
  getAllUsers,
  getUserById,
  getUserByEmail,
  emailExists,
  searchUsers,
  getUserStatistics,
  updateUser,
  activateUser,
  deactivateUser,
  deleteUser,
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

const ALLOWED_ROLES = ["admin", "owner"];

// ====================
// HELPER FUNCTIONS
// ====================

const validateRole = (role) => {
  if (!ALLOWED_ROLES.includes(role)) {
    throw new AppError("Invalid user role.", 422);
  }
};

const handleDuplicateEmail = async (email, excludeUserId = null) => {
  if (email && (await emailExists(email, excludeUserId))) {
    throw new AppError("An account with this email already exists.", 409);
  }
};

// ====================
// CREATE USER
// ====================

export const createUserService = async ({
  fullName,
  email,
  phone,
  password,
  profilePictureUrl = null,
  role = "admin",
}) => {
  if (!fullName?.trim() || !email?.trim() || !phone?.trim() || !password) {
    throw new AppError(
      "Full name, email, phone, and password are required.",
      422,
    );
  }

  if (password.length < 8) {
    throw new AppError("Password must be at least 8 characters long.", 422);
  }

  const normalizedEmail = email.trim().toLowerCase();
  const normalizedRole = role.trim().toLowerCase();

  validateRole(normalizedRole);

  await handleDuplicateEmail(normalizedEmail);

  const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

  try {
    const user = await createUser({
      fullName: fullName.trim(),
      email: normalizedEmail,
      phone: phone.trim(),
      password: hashedPassword,
      profilePictureUrl,
      role: normalizedRole,
    });

    return user;
  } catch (error) {
    // Protect against duplicate-email or duplicate-staff-code races.
    if (error.code === "23505") {
      throw new AppError(
        "An account with this email or staff code already exists.",
        409,
      );
    }

    throw error;
  }
};

// ====================
// GET ALL USERS
// ====================

export const getAllUsersService = async () => {
  return await getAllUsers();
};

// ====================
// GET USER BY ID
// ====================

export const getUserByIdService = async (userId) => {
  if (!userId) {
    throw new AppError("User ID is required.", 422);
  }

  const user = await getUserById(userId);

  if (!user) {
    throw new AppError("User not found.", 404);
  }

  return user;
};

// ====================
// GET USER BY EMAIL
// ====================

export const getUserByEmailService = async (email) => {
  if (!email?.trim()) {
    throw new AppError("Email is required.", 422);
  }

  const user = await getUserByEmail(email.trim().toLowerCase());

  if (!user) {
    throw new AppError("User not found.", 404);
  }

  // Never return the password hash to callers.
  const {
    password,
    password_reset_token,
    password_reset_expires,
    ...safeUser
  } = user;

  return safeUser;
};

// ====================
// SEARCH USERS
// ====================

export const searchUsersService = async (search) => {
  if (!search?.trim()) {
    throw new AppError("Enter a search term.", 422);
  }

  return await searchUsers(search.trim());
};

// ====================
// GET USER STATISTICS
// ====================

export const getUserStatisticsService = async () => {
  return await getUserStatistics();
};

// ====================
// UPDATE USER
// ====================

export const updateUserService = async (userId, updates = {}) => {
  if (!userId) {
    throw new AppError("User ID is required.", 422);
  }

  // Confirm that the user exists.
  await getUserByIdService(userId);

  const allowedFields = [
    "fullName",
    "email",
    "phone",
    "profilePictureUrl",
    "role",
    "isActive",
  ];

  const suppliedFields = Object.keys(updates).filter((field) =>
    allowedFields.includes(field),
  );

  if (suppliedFields.length === 0) {
    throw new AppError("Provide at least one valid field to update.", 422);
  }

  const cleanUpdates = {};

  for (const field of suppliedFields) {
    const value = updates[field];

    if (value === undefined) continue;

    if (field === "fullName" || field === "phone") {
      if (typeof value !== "string" || !value.trim()) {
        throw new AppError(`${field} cannot be empty.`, 422);
      }

      cleanUpdates[field] = value.trim();
    } else if (field === "email") {
      if (typeof value !== "string" || !value.trim()) {
        throw new AppError("Email cannot be empty.", 422);
      }

      cleanUpdates.email = value.trim().toLowerCase();
    } else if (field === "role") {
      if (typeof value !== "string") {
        throw new AppError("Invalid user role.", 422);
      }

      const normalizedRole = value.trim().toLowerCase();
      validateRole(normalizedRole);
      cleanUpdates.role = normalizedRole;
    } else if (field === "isActive") {
      if (typeof value !== "boolean") {
        throw new AppError("isActive must be true or false.", 422);
      }

      cleanUpdates.isActive = value;
    } else if (field === "profilePictureUrl") {
      if (value !== null && typeof value !== "string") {
        throw new AppError("Invalid profile picture URL.", 422);
      }

      cleanUpdates.profilePictureUrl = value;
    }
  }

  if (Object.keys(cleanUpdates).length === 0) {
    throw new AppError("No valid fields were provided.", 422);
  }

  if (cleanUpdates.email) {
    await handleDuplicateEmail(cleanUpdates.email, userId);
  }

  try {
    const updatedUser = await updateUser(userId, cleanUpdates);

    if (!updatedUser) {
      throw new AppError("User not found.", 404);
    }

    return updatedUser;
  } catch (error) {
    if (error.code === "23505") {
      throw new AppError("An account with this email already exists.", 409);
    }

    throw error;
  }
};

// ====================
// ACTIVATE USER
// ====================

export const activateUserService = async (userId) => {
  if (!userId) {
    throw new AppError("User ID is required.", 422);
  }

  const user = await activateUser(userId);

  if (!user) {
    throw new AppError("User not found.", 404);
  }

  return user;
};

// ====================
// DEACTIVATE USER
// ====================

export const deactivateUserService = async (userId) => {
  if (!userId) {
    throw new AppError("User ID is required.", 422);
  }

  const user = await deactivateUser(userId);

  if (!user) {
    throw new AppError("User not found.", 404);
  }

  return user;
};

// ====================
// DELETE USER
// ====================

export const deleteUserService = async (userId, requestingUserId = null) => {
  if (!userId) {
    throw new AppError("User ID is required.", 422);
  }

  // Prevent a user from deleting their own account through this operation.
  if (requestingUserId && userId === requestingUserId) {
    throw new AppError("You cannot delete your own account.", 403);
  }

  const user = await deleteUser(userId);

  if (!user) {
    throw new AppError("User not found.", 404);
  }

  return user;
};

// ====================
// LOGIN
// ====================

export const loginService = async ({ email, password }) => {
  if (!email?.trim() || !password) {
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

  // Do not issue tokens for deleted or deactivated users.
  const user = await getUserById(payload.userId);

  if (!user || !user.is_active) {
    await revokeRefreshToken(session.id);
    throw new AppError("Your account is inactive or no longer exists.", 401);
  }

  const newPayload = {
    userId: user.id,
    role: user.role,
  };

  const accessToken = generateAccessToken(newPayload);
  const newRefreshToken = generateRefreshToken(newPayload);
  const newTokenHash = hashRefreshToken(newRefreshToken);

  await createRefreshToken({
    user_id: user.id,
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

/*
export const forgotPasswordService = async (email) => {
  if (!email) {
    throw new AppError("Email is required.", 422);
  }

  const normalizedEmail = email.trim().toLowerCase();
  const rawToken = crypto.randomBytes(32).toString("hex");

  const tokenHash = crypto
    .createHash("sha256")
    .update(rawToken)
    .digest("hex");

  const expiresAt = new Date(
    Date.now() + RESET_TOKEN_TTL_MINUTES * 60 * 1000,
  );

  const user = await setPasswordResetToken(
    normalizedEmail,
    tokenHash,
    expiresAt,
  );

  if (user) {
    const resetLink =
      `${process.env.CLIENT_URL}/reset-password?token=${rawToken}`;

    try {
      await sendPasswordResetEmail({
        to: user.email,
        fullName: user.full_name,
        resetLink,
      });
    } catch (error) {
      console.error("Failed to send password reset email:", error);
    }
  }

  return {
    message:
      "If an account exists for this email, a password reset link has been sent.",
  };
};
*/

// ====================
// RESET PASSWORD
// TEMPORARILY DISABLED
// ====================

/*
export const resetPasswordService = async (token, password) => {
  if (!token || !password) {
    throw new AppError("Token and new password are required.", 422);
  }

  if (password.length < 8) {
    throw new AppError(
      "Password must be at least 8 characters long.",
      422,
    );
  }

  const tokenHash = crypto
    .createHash("sha256")
    .update(token)
    .digest("hex");

  const user = await getUserByPasswordResetTokenHash(tokenHash);

  if (!user) {
    throw new AppError(
      "This reset link is invalid or has expired.",
      400,
    );
  }

  const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

  await resetPasswordWithToken(user.id, hashedPassword);

  return {
    message: "Password reset successful. You can now sign in.",
  };
};
*/