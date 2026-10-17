

import { verifyAccessToken } from "../../utils/jwt/jwt.utils.js";

/*
|--------------------------------------------------------------------------
| Authenticate User
|--------------------------------------------------------------------------
*/

export const authenticateUser = (req, res, next) => {
  try {
    const token = req.cookies?.accessToken;

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Authentication required.",
      });
    }

    const decoded = verifyAccessToken(token);

    req.user = decoded;

    return next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Invalid or expired token!",
    });
  }
};

/*
|--------------------------------------------------------------------------
| Authorize Roles
|--------------------------------------------------------------------------
*/

export const authorizeRoles = (...allowedRoles) => {
  if (allowedRoles.length === 0) {
    throw new Error("authorizeRoles requires at least one role.");
  }

  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required.",
      });
    }

    const { role } = req.user;

    if (!allowedRoles.includes(role)) {
      return res.status(403).json({
        success: false,
        message: "You do not have permission to perform this action.",
      });
    }

    return next();
  };
};
