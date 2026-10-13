import Joi from "joi";

/* ============================================================================
 * COMMON VALIDATION RULES
 * ========================================================================== */

const fullName = Joi.string().trim().min(2).max(150);

const email = Joi.string().trim().email().max(255).lowercase();

const phone = Joi.string().trim().min(7).max(30);

const password = Joi.string().min(8).max(128);

const role = Joi.string().valid("admin", "owner");

/* ============================================================================
 * CREATE USER
 * ========================================================================== */

export const createUserSchema = Joi.object({
  fullName: fullName.required(),
  email: email.required(),
  phone: phone.required(),
  password: password.required(),
  role: role.default("admin"),
}).unknown(false);

/* ============================================================================
 * UPDATE USER
 * ========================================================================== */

export const updateUserSchema = Joi.object({
  fullName,
  email,
  phone,
  role,
  isActive: Joi.boolean(),
})
  .min(1)
  .unknown(false);

/* ============================================================================
 * USER ID PARAMETER
 * ========================================================================== */

export const userIdSchema = Joi.object({
  id: Joi.string()
    .guid({ version: ["uuidv4", "uuidv5"] })
    .required(),
});

/* ============================================================================
 * EMAIL PARAMETER
 * ========================================================================== */

export const userEmailSchema = Joi.object({
  email: email.required(),
});

/* ============================================================================
 * LOGIN
 * ========================================================================== */

export const loginSchema = Joi.object({
  email: email.required(),
  password: Joi.string().required(),
}).unknown(false);
