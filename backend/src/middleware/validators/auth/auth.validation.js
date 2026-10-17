import Joi from "joi";

// Reusable validation rules
const emailSchema = Joi.string()
  .trim()
  .lowercase()
  .email()
  .max(255)
  .required()
  .messages({
    "string.email": "Please provide a valid email address.",
    "string.max": "Email cannot exceed 255 characters.",
    "any.required": "Email is required.",
    "string.empty": "Email is required.",
  });

const passwordSchema = Joi.string()
  .min(8)
  .max(128)
  .required()
  .messages({
    "string.min": "Password must be at least 8 characters long.",
    "string.max": "Password cannot exceed 128 characters.",
    "any.required": "Password is required.",
    "string.empty": "Password is required.",
  });

const userIdSchema = Joi.string()
  .guid({ version: ["uuidv4"] })
  .required()
  .messages({
    "string.guid": "User ID must be a valid UUID.",
    "any.required": "User ID is required.",
  });

// ============================
// LOGIN
// ============================

export const loginSchema = Joi.object({
  email: emailSchema,
  password: Joi.string().required().messages({
    "any.required": "Password is required.",
    "string.empty": "Password is required.",
  }),
}).required();

// ============================
// CREATE USER
// ============================

export const createUserSchema = Joi.object({
  fullName: Joi.string().trim().min(2).max(150).required().messages({
    "string.min": "Full name must contain at least 2 characters.",
    "string.max": "Full name cannot exceed 150 characters.",
    "any.required": "Full name is required.",
    "string.empty": "Full name is required.",
  }),

  email: emailSchema,

  phone: Joi.string().trim().min(7).max(30).required().messages({
    "string.min": "Phone number must contain at least 7 characters.",
    "string.max": "Phone number cannot exceed 30 characters.",
    "any.required": "Phone number is required.",
    "string.empty": "Phone number is required.",
  }),

  password: passwordSchema,

  profilePictureUrl: Joi.string()
    .trim()
    .uri({ scheme: ["http", "https"] })
    .allow("", null)
    .optional()
    .messages({
      "string.uri": "Profile picture must be a valid HTTP or HTTPS URL.",
    }),

  role: Joi.string()
    .trim()
    .lowercase()
    .valid("admin", "owner")
    .default("admin")
    .messages({
      "any.only": "Role must be either admin or owner.",
    }),
})
  .unknown(false)
  .required();

// ============================
// UPDATE USER
// ============================

export const updateUserSchema = Joi.object({
  fullName: Joi.string().trim().min(2).max(150),
  email: Joi.string().trim().lowercase().email().max(255),
  phone: Joi.string().trim().min(7).max(30),

  profilePictureUrl: Joi.string()
    .trim()
    .uri({ scheme: ["http", "https"] })
    .allow("", null),

  role: Joi.string()
    .trim()
    .lowercase()
    .valid("admin", "owner"),

  isActive: Joi.boolean(),
})
  .min(1)
  .unknown(false)
  .required()
  .messages({
    "object.min": "Provide at least one field to update.",
    "object.unknown": "You have provided an unsupported field.",
  });

// ============================
// ROUTE PARAMETERS
// ============================

export const userIdParamsSchema = Joi.object({
  userId: userIdSchema,
}).required();

export const emailParamsSchema = Joi.object({
  email: Joi.string().trim().lowercase().email().max(255).required(),
}).required();

// ============================
// SEARCH USERS
// ============================

export const searchUsersQuerySchema = Joi.object({
  query: Joi.string().trim().min(1).max(100).required().messages({
    "any.required": "A search query is required.",
    "string.empty": "Enter a search term.",
    "string.max": "Search query cannot exceed 100 characters.",
  }),
})
  .unknown(false)
  .required();