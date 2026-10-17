import Joi from "joi";

// =====================================================
// REUSABLE VALIDATION RULES
// =====================================================

const uuidSchema = Joi.string().guid({ version: ["uuidv4"] });

const textArraySchema = Joi.array()
  .items(Joi.string().trim().max(500))
  .max(100);

const thumbnailSchema = Joi.string().trim().max(2000).allow("", null);

const dateSchema = Joi.string()
  .pattern(/^\d{4}-\d{2}-\d{2}$/)
  .allow(null);

// =====================================================
// PROGRAM ID PARAMS
// Route: /:id
// =====================================================

export const programIdParamsSchema = Joi.object({
  id: uuidSchema.required(),
}).unknown(false);

// =====================================================
// PROGRAM SLUG PARAMS
// Route: /:slug
// =====================================================

export const programSlugParamsSchema = Joi.object({
  slug: Joi.string()
    .trim()
    .min(1)
    .max(220)
    .pattern(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
    .required(),
}).unknown(false);

// =====================================================
// PROGRAM CATEGORY ID PARAMS
// Route: /:categoryId
// =====================================================

export const programCategoryParamsSchema = Joi.object({
  categoryId: uuidSchema.required(),
}).unknown(false);

// =====================================================
// SEARCH PROGRAMS QUERY
// Route: /search-programs?query=python
// =====================================================

export const searchProgramsQuerySchema = Joi.object({
  query: Joi.string().trim().min(1).max(100).required(),
}).unknown(false);

// =====================================================
// CREATE PROGRAM
// =====================================================

export const createProgramSchema = Joi.object({
  // Basic information
  title: Joi.string().trim().min(2).max(200).required(),

  level: Joi.string().trim().min(1).max(50).required(),

  ageGroup: Joi.string().trim().min(1).max(50),

  age_group: Joi.string().trim().min(1).max(50),

  mode: Joi.string().trim().min(1).max(30).required(),

  // Category selection or creation
  categoryId: uuidSchema,

  category_id: uuidSchema,

  category: Joi.string().trim().min(1).max(100),

  categoryName: Joi.string().trim().min(1).max(100),

  newCategoryName: Joi.string().trim().min(1).max(100),

  isNewCategory: Joi.boolean().default(false),

  categoryDescription: Joi.string().trim().max(140).allow("", null),

  // Duration and capacity
  durationWeeks: Joi.number().integer().min(1),

  duration_weeks: Joi.number().integer().min(1),

  sessionsPerWeek: Joi.number().integer().min(1),

  sessions_per_week: Joi.number().integer().min(1),

  sessionMinutes: Joi.number().integer().min(15),

  session_minutes: Joi.number().integer().min(15),

  capacity: Joi.number().integer().min(1).required(),

  price: Joi.number().min(0).precision(2).default(0),

  // Instructor and schedule
  instructor: Joi.string().trim().min(1).max(150).required(),

  startDate: dateSchema,

  start_date: dateSchema,

  schedule: Joi.string().trim().max(5000).allow("", null),

  displayOrder: Joi.number().integer().min(1),

  display_order: Joi.number().integer().min(1),

  // Program description
  summary: Joi.string().trim().min(1).max(140).required(),

  description: Joi.string().trim().allow("", null),

  // Learning content
  outcomes: textArraySchema.default([]),

  prerequisites: textArraySchema.default([]),

  requirements: textArraySchema.default([]),

  tools: textArraySchema.default([]),

  // Image
  thumbnail: thumbnailSchema,

  // Publication
  status: Joi.string().valid("draft", "published").default("draft"),

  publish: Joi.boolean().default(false),

  featured: Joi.boolean().default(false),
})
  .custom((value, helpers) => {
    const isNewCategory = value.isNewCategory === true;

    const hasCategoryId = Boolean(value.categoryId || value.category_id);

    const hasCategoryName = Boolean(value.category?.trim());

    const hasNewCategoryName = Boolean(
      value.newCategoryName?.trim() || value.categoryName?.trim(),
    );

    if (isNewCategory && !hasNewCategoryName && !hasCategoryName) {
      return helpers.message({
        custom:
          "Provide newCategoryName, categoryName, or category when creating a new category.",
      });
    }

    if (!isNewCategory && !hasCategoryId && !hasCategoryName) {
      return helpers.message({
        custom:
          "Select a category using categoryId or category_id, or provide an existing category name.",
      });
    }

    return value;
  })
  .unknown(false);

// =====================================================
// UPDATE PROGRAM
// =====================================================

export const updateProgramSchema = Joi.object({
  title: Joi.string().trim().min(2).max(200),

  slug: Joi.string()
    .trim()
    .min(1)
    .max(220)
    .pattern(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),

  categoryId: uuidSchema.allow(null),

  category_id: uuidSchema.allow(null),

  category: Joi.string().trim().min(1).max(100),

  categoryName: Joi.string().trim().min(1).max(100),

  newCategoryName: Joi.string().trim().min(1).max(100),

  isNewCategory: Joi.boolean(),

  categoryDescription: Joi.string().trim().max(140).allow("", null),

  level: Joi.string().trim().min(1).max(50),

  ageGroup: Joi.string().trim().min(1).max(50),

  age_group: Joi.string().trim().min(1).max(50),

  mode: Joi.string().trim().min(1).max(30),

  durationWeeks: Joi.number().integer().min(1),

  duration_weeks: Joi.number().integer().min(1),

  sessionsPerWeek: Joi.number().integer().min(1),

  sessions_per_week: Joi.number().integer().min(1),

  sessionMinutes: Joi.number().integer().min(15),

  session_minutes: Joi.number().integer().min(15),

  capacity: Joi.number().integer().min(1),

  price: Joi.number().min(0).precision(2),

  instructor: Joi.string().trim().min(1).max(150),

  startDate: dateSchema,

  start_date: dateSchema,

  schedule: Joi.string().trim().max(5000).allow("", null),

  displayOrder: Joi.number().integer().min(1).allow(null),

  display_order: Joi.number().integer().min(1).allow(null),

  summary: Joi.string().trim().min(1).max(140),

  description: Joi.string().trim().allow("", null),

  outcomes: textArraySchema,

  prerequisites: textArraySchema,

  requirements: textArraySchema,

  tools: textArraySchema,

  thumbnail: thumbnailSchema,

  status: Joi.string().valid("draft", "published", "archived"),

  featured: Joi.boolean(),
})
  .min(1)
  .custom((value, helpers) => {
    const hasNewCategory = value.isNewCategory === true;

    const hasCategoryInput = [
      "categoryId",
      "category_id",
      "category",
      "categoryName",
      "newCategoryName",
      "isNewCategory",
    ].some((key) => value[key] !== undefined);

    if (hasNewCategory) {
      const hasName = Boolean(
        value.newCategoryName?.trim() ||
        value.categoryName?.trim() ||
        value.category?.trim(),
      );

      if (!hasName) {
        return helpers.message({
          custom: "Provide a category name when creating a new category.",
        });
      }
    }

    if (
      hasCategoryInput &&
      value.isNewCategory !== true &&
      !value.categoryId &&
      !value.category_id &&
      !value.category?.trim() &&
      !value.categoryName?.trim()
    ) {
      return helpers.message({
        custom: "Provide a valid category ID or an existing category name.",
      });
    }

    return value;
  })
  .unknown(false);
