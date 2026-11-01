import { Router } from "express";

import {
  createBlogPost,
  getAllBlogPosts,
  getPublishedBlogPosts,
  getBlogPostById,
  getBlogPostBySlug,
  searchBlogPosts,
  getBlogPostsByCategory,
  getFeaturedBlogPosts,
  updateBlogPost,
  publishBlogPost,
  archiveBlogPost,
  deleteBlogPost,
  createBlogCategory,
  getAllBlogCategories,
  getBlogCategoryById,
  updateBlogCategory,
  deleteBlogCategory,
} from "../../controller/blogs/blog.controller.js";

import {
  authenticateUser,
  authorizeRoles,
} from "../../middleware/auth/auth.middleware.js";

import { validate } from "../../middleware/validate.middleware.js";

import {
  createBlogPostSchema,
  updateBlogPostSchema,
  blogPostIdParamsSchema,
  blogPostSlugParamsSchema,
  blogCategoryParamsSchema,
  blogCategoryIdParamsSchema,
  searchBlogPostsQuerySchema,
  createBlogCategorySchema,
  updateBlogCategorySchema,
} from "../../middleware/validators/blogs/blogs.validation.js";

const router = Router();

// Mount in your app with:  app.use("/api/blog", blogRoutes);

// ======================================
// PUBLIC BLOG ROUTES (website, no login)
// ======================================

// Get published posts   (frontend: API_PATHS.BLOG.GET_PUBLISHED)
router.get("/get-published-posts", getPublishedBlogPosts);

// Get featured posts
router.get("/get-featured-posts", getFeaturedBlogPosts);

// Search published posts
router.get(
  "/search-posts",
  validate(searchBlogPostsQuerySchema, "query"),
  searchBlogPosts,
);

// Get one published post by slug   (frontend: API_PATHS.BLOG.GET_PUBLISHED_BY_SLUG)
router.get(
  "/get-post-by-slug/:slug",
  validate(blogPostSlugParamsSchema, "params"),
  getBlogPostBySlug,
);

// Get posts by category
router.get(
  "/get-posts-by-category/:categoryId",
  validate(blogCategoryParamsSchema, "params"),
  getBlogPostsByCategory,
);

// ======================================
// BLOG CATEGORY ROUTES
// ======================================

// Get all blog categories   (frontend: API_PATHS.BLOG.CATEGORIES.GET_ALL)
router.get("/get-all-categories", getAllBlogCategories);

// Get a category by ID
router.get(
  "/get-category-by-id/:id",
  validate(blogCategoryIdParamsSchema, "params"),
  getBlogCategoryById,
);

// Create a blog category — admin only
router.post(
  "/create-category",
  authenticateUser,
  authorizeRoles("admin"),
  validate(createBlogCategorySchema),
  createBlogCategory,
);

// Update a blog category — admin only
router.patch(
  "/update-category/:id",
  authenticateUser,
  authorizeRoles("admin"),
  validate(blogCategoryIdParamsSchema, "params"),
  validate(updateBlogCategorySchema),
  updateBlogCategory,
);

// Delete a blog category — admin only (articles stay, they just lose the category)
router.delete(
  "/delete-category/:id",
  authenticateUser,
  authorizeRoles("admin"),
  validate(blogCategoryIdParamsSchema, "params"),
  deleteBlogCategory,
);

// ======================================
// BLOG MANAGEMENT (admin dashboard)
// ======================================

// Get ALL posts, including drafts and archived — admin only
router.get(
  "/get-all-posts",
  authenticateUser,
  authorizeRoles("admin"),
  getAllBlogPosts,
);

// Get a post by ID (includes drafts, used by the edit form) — admin only
router.get(
  "/get-post-by-id/:id",
  authenticateUser,
  authorizeRoles("admin"),
  validate(blogPostIdParamsSchema, "params"),
  getBlogPostById,
);

// Create post — admin only
router.post(
  "/create-post",
  authenticateUser,
  authorizeRoles("admin"),
  validate(createBlogPostSchema),
  createBlogPost,
);

// Update post — admin only
router.patch(
  "/update-post/:id",
  authenticateUser,
  authorizeRoles("admin"),
  validate(blogPostIdParamsSchema, "params"),
  validate(updateBlogPostSchema),
  updateBlogPost,
);

// Publish post — admin only
router.patch(
  "/publish-post/:id",
  authenticateUser,
  authorizeRoles("admin"),
  validate(blogPostIdParamsSchema, "params"),
  publishBlogPost,
);

// Archive post — admin only
router.patch(
  "/archive-post/:id",
  authenticateUser,
  authorizeRoles("admin"),
  validate(blogPostIdParamsSchema, "params"),
  archiveBlogPost,
);

// Delete post — admin only
router.delete(
  "/delete-post/:id",
  authenticateUser,
  authorizeRoles("admin"),
  validate(blogPostIdParamsSchema, "params"),
  deleteBlogPost,
);

export default router;
