import Joi from "joi";

// =====================================================
// REUSABLE VALIDATION RULES
// =====================================================

const uuidSchema = Joi.string().guid({ version: ["uuidv4"] });

const slugSchema = Joi.string()
  .trim()
  .min(1)
  .max(220)
  .pattern(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);

// Accepts ["coding", "kids"] or "coding, kids". The service cleans it up
// (trims, removes duplicates) so here we only guard the size.
const tagsSchema = Joi.alternatives().try(
  Joi.array().items(Joi.string().trim().min(1).max(40)).max(10),
  Joi.string().trim().max(500).allow(""),
);

const imageUrlSchema = Joi.string().trim().max(2000).allow("", null);

// Article body is Markdown. The cap just stops absurd uploads (~200k characters).
const contentSchema = Joi.string().min(1).max(200000);

// =====================================================
// POST ID PARAMS
// Route: /:id
// =====================================================

export const blogPostIdParamsSchema = Joi.object({
  id: uuidSchema.required(),
}).unknown(false);

// =====================================================
// POST SLUG PARAMS
// Route: /:slug
// =====================================================

export const blogPostSlugParamsSchema = Joi.object({
  slug: slugSchema.required(),
}).unknown(false);

// =====================================================
// BLOG CATEGORY ID PARAMS
// Route: /:categoryId  and  /categories/:id
// =====================================================

export const blogCategoryParamsSchema = Joi.object({
  categoryId: uuidSchema.required(),
}).unknown(false);

export const blogCategoryIdParamsSchema = Joi.object({
  id: uuidSchema.required(),
}).unknown(false);

// =====================================================
// SEARCH POSTS QUERY
// Route: /search-posts?q=python   (the controller reads q or search)
// =====================================================

export const searchBlogPostsQuerySchema = Joi.object({
  q: Joi.string().trim().min(1).max(100),
  search: Joi.string().trim().min(1).max(100),
})
  .or("q", "search")
  .unknown(false);

// =====================================================
// CREATE POST
// =====================================================

export const createBlogPostSchema = Joi.object({
  // Basic information
  title: Joi.string().trim().min(2).max(200).required(),

  // Optional. When left out, the slug is built from the title.
  slug: slugSchema,

  excerpt: Joi.string().trim().min(1).max(300).required(),

  content: contentSchema.required(),

  // Category selection or creation
  categoryId: uuidSchema,

  category_id: uuidSchema,

  category: Joi.string().trim().min(1).max(100),

  categoryName: Joi.string().trim().min(1).max(100),

  newCategoryName: Joi.string().trim().min(1).max(100),

  isNewCategory: Joi.boolean().default(false),

  categoryDescription: Joi.string().trim().max(200).allow("", null),

  // Cover image
  coverImage: imageUrlSchema,

  cover_image: imageUrlSchema,

  coverAlt: Joi.string().trim().max(200).allow("", null),

  cover_alt: Joi.string().trim().max(200).allow("", null),

  // Tags
  tags: tagsSchema,

  // Author
  authorName: Joi.string().trim().min(1).max(150),

  author_name: Joi.string().trim().min(1).max(150),

  authorAvatar: imageUrlSchema,

  author_avatar: imageUrlSchema,

  // SEO
  seoTitle: Joi.string().trim().max(70).allow("", null),

  seo_title: Joi.string().trim().max(70).allow("", null),

  seoDescription: Joi.string().trim().max(160).allow("", null),

  seo_description: Joi.string().trim().max(160).allow("", null),

  // Publication
  // No default on status: the service reads `publish: true` only when status
  // is missing, so a default of "draft" here would silently ignore `publish`.
  status: Joi.string().valid("draft", "published"),

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
// UPDATE POST
// =====================================================

export const updateBlogPostSchema = Joi.object({
  title: Joi.string().trim().min(2).max(200),

  // Only send this to change the URL on purpose. Changing a live slug
  // breaks links people already shared.
  slug: slugSchema,

  excerpt: Joi.string().trim().min(1).max(300),

  content: contentSchema,

  categoryId: uuidSchema.allow(null),

  category_id: uuidSchema.allow(null),

  category: Joi.string().trim().min(1).max(100),

  categoryName: Joi.string().trim().min(1).max(100),

  newCategoryName: Joi.string().trim().min(1).max(100),

  isNewCategory: Joi.boolean(),

  categoryDescription: Joi.string().trim().max(200).allow("", null),

  coverImage: imageUrlSchema,

  cover_image: imageUrlSchema,

  coverAlt: Joi.string().trim().max(200).allow("", null),

  cover_alt: Joi.string().trim().max(200).allow("", null),

  tags: tagsSchema,

  authorName: Joi.string().trim().min(1).max(150),

  author_name: Joi.string().trim().min(1).max(150),

  authorAvatar: imageUrlSchema,

  author_avatar: imageUrlSchema,

  seoTitle: Joi.string().trim().max(70).allow("", null),

  seo_title: Joi.string().trim().max(70).allow("", null),

  seoDescription: Joi.string().trim().max(160).allow("", null),

  seo_description: Joi.string().trim().max(160).allow("", null),

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

// =====================================================
// CREATE CATEGORY
// =====================================================

export const createBlogCategorySchema = Joi.object({
  name: Joi.string().trim().min(1).max(100).required(),

  description: Joi.string().trim().max(200).allow("", null),
}).unknown(false);

// =====================================================
// UPDATE CATEGORY
// =====================================================

export const updateBlogCategorySchema = Joi.object({
  name: Joi.string().trim().min(1).max(100),

  description: Joi.string().trim().max(200).allow("", null),
})
  .min(1)
  .unknown(false);