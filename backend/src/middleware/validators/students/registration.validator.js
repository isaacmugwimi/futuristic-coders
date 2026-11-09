import Joi from "joi";

const REGISTRATION_STATUSES = ["pending", "approved", "rejected"];

// =====================================================
// REUSABLE RULES
// =====================================================

const uuidSchema = Joi.string().guid({ version: ["uuidv4"] });

const dateSchema = Joi.string()
  .pattern(/^\d{4}-\d{2}-\d{2}$/)
  .messages({ "string.pattern.base": "Date must be in YYYY-MM-DD format." });

const phoneSchema = Joi.string()
  .trim()
  .pattern(/^[+\d\s\-().]{7,30}$/)
  .allow("", null)
  .messages({ "string.pattern.base": "Phone number is not valid." });

const emailSchema = Joi.string()
  .trim()
  .email({ tlds: { allow: false } })
  .max(255)
  .allow("", null);

const optionalText = (max) => Joi.string().trim().max(max).allow("", null);

const feeSchema = Joi.number().min(0).precision(2);

// =====================================================
// ID PARAMS
// Route: /approve-registration/:id, /reject-registration/:id
// =====================================================

export const registrationIdParamsSchema = Joi.object({
  id: uuidSchema.required(),
}).unknown(false);

// =====================================================
// GET REGISTRATIONS QUERY
// Route: /get-all-registrations?status=pending&search=amina
// =====================================================

export const getRegistrationsQuerySchema = Joi.object({
  status: Joi.string().valid(...REGISTRATION_STATUSES, "all", ""),

  search: Joi.string().trim().max(100).allow(""),
}).unknown(false);

// =====================================================
// SUBMIT REGISTRATION (PUBLIC)
// Route: POST /submit-registration
// "website" is a hidden honeypot field: real visitors leave it empty.
// =====================================================

export const submitRegistrationSchema = Joi.object({
  fullName: Joi.string().trim().min(2).max(150),

  full_name: Joi.string().trim().min(2).max(150),

  email: emailSchema,

  phone: phoneSchema,

  guardianName: optionalText(150),

  guardian_name: optionalText(150),

  guardianPhone: phoneSchema,

  guardian_phone: phoneSchema,

  ageGroup: optionalText(30),

  age_group: optionalText(30),

  county: optionalText(100),

  notes: optionalText(1000),

  programId: uuidSchema,

  program_id: uuidSchema,

  website: Joi.string().allow("", null).max(500),
})
  .or("fullName", "full_name")
  .or("programId", "program_id")
  .custom((value, helpers) => {
    const hasContact = [
      value.phone,
      value.guardianPhone,
      value.guardian_phone,
      value.email,
    ].some((contact) => typeof contact === "string" && contact.trim());

    if (!hasContact) {
      return helpers.message({
        custom:
          "Provide at least one contact: phone, guardian phone, or email.",
      });
    }

    return value;
  })
  .unknown(false);

// =====================================================
// APPROVE REGISTRATION
// Route: PATCH /approve-registration/:id
// Both fields are optional overrides; the program's price and
// today's date are used when left out.
// =====================================================

export const approveRegistrationSchema = Joi.object({
  agreedFee: feeSchema.allow(null),

  agreed_fee: feeSchema.allow(null),

  enrolledOn: dateSchema.allow(null),

  enrolled_on: dateSchema.allow(null),
}).unknown(false);

// =====================================================
// REJECT REGISTRATION
// Route: PATCH /reject-registration/:id
// =====================================================

export const rejectRegistrationSchema = Joi.object({
  reason: optionalText(500),
}).unknown(false);