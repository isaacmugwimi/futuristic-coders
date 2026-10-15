// import { API_PATHS } from "../../utils/Api/apiPaths";
import api from  "@/src/utils/api/axiosInstance";

import { API_PATHS } from "@/src/utils/api/apiPaths";

// ============================================================================
// USERS
// ============================================================================

// ====================
// CREATE USER
// ====================

export const createUser = async (userData) => {
  const response = await api.post(
    API_PATHS.USERS.CREATE,
    userData,
  );

  return response.data;
};

// ====================
// GET ALL USERS
// ====================

export const getAllUsers = async () => {
  const response = await api.get(
    API_PATHS.USERS.GET_ALL,
  );

  return response.data;
};

// ====================
// GET USER BY ID
// ====================

export const getUserById = async (userId) => {
  const response = await api.get(
    API_PATHS.USERS.GET_BY_ID(userId),
  );

  return response.data;
};

// ====================
// GET USER BY EMAIL
// ====================

export const getUserByEmail = async (email) => {
  const response = await api.get(
    API_PATHS.USERS.GET_BY_EMAIL(email),
  );

  return response.data;
};

// ====================
// UPDATE USER
// ====================

export const updateUser = async (userId, userData) => {
  const response = await api.patch(
    API_PATHS.USERS.UPDATE(userId),
    userData,
  );

  return response.data;
};

// ====================
// DELETE USER
// ====================

export const deleteUser = async (userId) => {
  const response = await api.delete(
    API_PATHS.USERS.DELETE(userId),
  );

  return response.data;
};
