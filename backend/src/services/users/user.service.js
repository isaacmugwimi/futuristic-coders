import bcrypt from "bcryptjs";

import {
  createUser,
  getAllUsers,
  getUserById,
  getUserByEmail,
  updateUser,
  deleteUser,
} from "../../database/models/users/user.model.js";
import AppError from "../../middleware/error/AppError.js";

// ============================================================================
// 1. CREATE USER
// ============================================================================

export const createUserService = async (data) => {
  const { fullName, email, phone, password, role = "admin" } = data;

  // Check whether the email already exists
  const existingUser = await getUserByEmail(email);

  if (existingUser) {
    throw new AppError("A user with this email already exists.", 409);
  }

  // Hash password before storing it
  const hashedPassword = await bcrypt.hash(password, 12);

  return await createUser({
    fullName,
    email,
    phone,
    password: hashedPassword,
    role,
  });
};

// ============================================================================
// 2. GET ALL USERS
// ============================================================================

export const getAllUsersService = async () => {
  return await getAllUsers();
};

// ============================================================================
// 3. GET USER BY ID
// ============================================================================

export const getUserByIdService = async (id) => {
  const user = await getUserById(id);

  if (!user) {
    throw new AppError("User not found.", 404);
  }

  return user;
};

// ============================================================================
// 4. GET USER BY EMAIL
// ============================================================================

export const getUserByEmailService = async (email) => {
  const user = await getUserByEmail(email);

  if (!user) {
    throw new AppError("User not found.", 404);
  }

  // Never expose the password hash
  const { password: _, ...safeUser } = user;

  return safeUser;
};

// ============================================================================
// 5. UPDATE USER
// ============================================================================

export const updateUserService = async (id, data) => {
  const existingUser = await getUserById(id);

  if (!existingUser) {
    throw new AppError("User not found.", 404);
  }

  // Check for duplicate email only when the email is changing
  if (data.email && data.email !== existingUser.email) {
    const userWithEmail = await getUserByEmail(data.email);

    if (userWithEmail && userWithEmail.id !== id) {
      throw new AppError("A user with this email already exists.", 409);
    }
  }

  return await updateUser(id, data);
};

// ============================================================================
// 6. DELETE USER
// ============================================================================

export const deleteUserService = async (id) => {
  const existingUser = await getUserById(id);

  if (!existingUser) {
    throw new AppError("User not found.", 404);
  }

  return await deleteUser(id);
};
