import Joi from "joi";

// =====================================================
// REUSABLE VALIDATION RULES
// =====================================================

const uuidSchema = Joi.string().guid({ version: ["uuidv4"] });

const ratingSchema = Joi.number().integer().min(1).max(5);

const messageSchema = Joi.string().trim().min(20).max(600);

const adminNotesSchema = Joi.string().trim().max(2000).allow("", null);

const RELATIONSHIPS = ["Parent", "Student", "Alumni"];

const REVIEW_STATUSES = [
  "pending",
  "approved",
  "published",
  "rejected",
  "archived",
];

const PUBLIC_SORTS = ["newest", "oldest", "highest", "lowest"];

// =====================================================
// TESTIMONIAL ID PARAMS
// Route: /:id
// =====================================================

export const testimonialIdParamsSchema = Joi.object({
  id: uuidSchema.required(),
}).unknown(false);

// =====================================================
// PUBLISHED TESTIMONIALS QUERY (public website)
// Route: /?page=1&limit=6&rating=0&sort=newest
// rating 0 means "all ratings"
// =====================================================

export const publishedTestimonialsQuerySchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),

  limit: Joi.number().integer().min(1).max(50).default(6),

  rating: Joi.number().integer().min(0).max(5).default(0),

  sort: Joi.string()
    .valid(...PUBLIC_SORTS)
    .default("newest"),
}).unknown(false);

// =====================================================
// FEATURED TESTIMONIALS QUERY
// Route: /featured?limit=3
// =====================================================

export const featuredTestimonialsQuerySchema = Joi.object({
  limit: Joi.number().integer().min(1).max(12).default(3),
}).unknown(false);

// =====================================================
// ADMIN TESTIMONIALS QUERY
// Route: /admin?status=pending&rating=5&search=grace
// =====================================================

export const adminTestimonialsQuerySchema = Joi.object({
  status: Joi.string().valid(...REVIEW_STATUSES),

  rating: Joi.number().integer().min(1).max(5),

  search: Joi.string().trim().min(1).max(100),
}).unknown(false);

// =====================================================
// CREATE TESTIMONIAL (public form submission)
// =====================================================

export const createTestimonialSchema = Joi.object({
  name: Joi.string().trim().min(2).max(100).required(),

  email: Joi.string()
    .trim()
    .lowercase()
    .email({ tlds: { allow: false } })
    .max(255)
    .required(),

  relationship: Joi.string()
    .valid(...RELATIONSHIPS)
    .default("Parent"),

  rating: ratingSchema.required(),

  message: messageSchema.required(),

  // Honeypot: hidden on the form, so real visitors send nothing or "".
  // Bots that fill it are silently dropped by the service.
  website: Joi.string().trim().max(500).allow("", null),
}).unknown(false);

// =====================================================
// UPDATE TESTIMONIAL (admin)
// Only the message, notes, and featured flag are editable.
// =====================================================

export const updateTestimonialSchema = Joi.object({
  message: messageSchema,

  adminNotes: adminNotesSchema,

  admin_notes: adminNotesSchema,

  featured: Joi.boolean(),
})
  .min(1)
  .unknown(false);

// =====================================================
// REJECT TESTIMONIAL (admin)
// Body is optional: { "adminNotes": "Looks like spam" }
// =====================================================

export const rejectTestimonialSchema = Joi.object({
  adminNotes: adminNotesSchema,

  admin_notes: adminNotesSchema,
}).unknown(false);

// =====================================================
// SET FEATURED (admin)
// Body: { "featured": true }
// =====================================================

export const setTestimonialFeaturedSchema = Joi.object({
  featured: Joi.boolean().required(),
}).unknown(false);
