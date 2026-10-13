import {
  createUserService,
  getAllUsersService,
  getUserByIdService,
  getUserByEmailService,
  updateUserService,
  deleteUserService,
} from "../../services/users/user.service.js";


// ============================================================================
// 1. CREATE USER
// ============================================================================

export const createUserController = async (req, res, next) => {
  try {
    const user = await createUserService(req.body);

    return res.status(201).json({
      success: true,
      message: "User created successfully.",
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

// ============================================================================
// 2. GET ALL USERS
// ============================================================================

export const getAllUsersController = async (req, res, next) => {
  try {
    const users = await getAllUsersService();

    return res.status(200).json({
      success: true,
      message: "Users retrieved successfully.",
      results: users.length,
      data: users,
    });
  } catch (error) {
    next(error);
  }
};

// ============================================================================
// 3. GET USER BY ID
// ============================================================================

export const getUserByIdController = async (req, res, next) => {
  try {
    const { id } = req.params;

    const user = await getUserByIdService(id);

    return res.status(200).json({
      success: true,
      message: "User retrieved successfully.",
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

// ============================================================================
// 4. GET USER BY EMAIL
// ============================================================================

export const getUserByEmailController = async (req, res, next) => {
  try {
    const { email } = req.params;

    const user = await getUserByEmailService(email);

    return res.status(200).json({
      success: true,
      message: "User retrieved successfully.",
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

// ============================================================================
// 5. UPDATE USER
// ============================================================================

export const updateUserController = async (req, res, next) => {
  try {
    const { id } = req.params;

    const user = await updateUserService(id, req.body);

    return res.status(200).json({
      success: true,
      message: "User updated successfully.",
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

// ============================================================================
// 6. DELETE USER
// ============================================================================

export const deleteUserController = async (req, res, next) => {
  try {
    const { id } = req.params;

    const user = await deleteUserService(id);

    return res.status(200).json({
      success: true,
      message: "User deleted successfully.",
      data: user,
    });
  } catch (error) {
    next(error);
  }
};
