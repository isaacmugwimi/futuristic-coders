import asyncHandler from "../../middleware/error/asyncHandler.js";
import * as blogService from "../../services/blogs/blogs.service.js";

// ============================================================
// CREATE POST
// ============================================================

export const createBlogPost = asyncHandler(async (req, res) => {
  const user = {
    ...req.user,
    id: req.user?.id ?? req.user?.userId,
  };

  const post = await blogService.createBlogPostService(req.body, user);

  return res.status(201).json({
    success: true,
    message: "Article created successfully.",
    data: post,
  });
});

// ============================================================
// GET ALL POSTS (admin)
// ============================================================

export const getAllBlogPosts = asyncHandler(async (req, res) => {
  const posts = await blogService.getAllBlogPostsService();

  return res.status(200).json({
    success: true,
    count: posts.length,
    data: posts,
  });
});

// ============================================================
// GET PUBLISHED POSTS (public)
// ============================================================

export const getPublishedBlogPosts = asyncHandler(async (req, res) => {
  const posts = await blogService.getPublishedBlogPostsService();

  return res.status(200).json({
    success: true,
    count: posts.length,
    data: posts,
  });
});

// ============================================================
// GET POST BY ID (admin)
// ============================================================

export const getBlogPostById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const post = await blogService.getBlogPostByIdService(id);

  return res.status(200).json({
    success: true,
    data: post,
  });
});

// ============================================================
// GET POST BY SLUG (public)
// ============================================================

export const getBlogPostBySlug = asyncHandler(async (req, res) => {
  const { slug } = req.params;

  const post = await blogService.getBlogPostBySlugService(slug);

  return res.status(200).json({
    success: true,
    data: post,
  });
});

// ============================================================
// SEARCH POSTS
// ============================================================

export const searchBlogPosts = asyncHandler(async (req, res) => {
  const searchTerm = req.query.q ?? req.query.search;

  const posts = await blogService.searchBlogPostsService(searchTerm);

  return res.status(200).json({
    success: true,
    count: posts.length,
    data: posts,
  });
});

// ============================================================
// GET POSTS BY CATEGORY
// ============================================================

export const getBlogPostsByCategory = asyncHandler(async (req, res) => {
  const { categoryId } = req.params;

  const posts = await blogService.getBlogPostsByCategoryService(categoryId);

  return res.status(200).json({
    success: true,
    count: posts.length,
    data: posts,
  });
});

// ============================================================
// GET FEATURED POSTS
// ============================================================

export const getFeaturedBlogPosts = asyncHandler(async (req, res) => {
  const posts = await blogService.getFeaturedBlogPostsService();

  return res.status(200).json({
    success: true,
    count: posts.length,
    data: posts,
  });
});

// ============================================================
// UPDATE POST
// ============================================================

export const updateBlogPost = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const post = await blogService.updateBlogPostService(id, req.body, req.user);

  return res.status(200).json({
    success: true,
    message: "Article updated successfully.",
    data: post,
  });
});

// ============================================================
// PUBLISH POST
// ============================================================

export const publishBlogPost = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const post = await blogService.publishBlogPostService(id, req.user);

  return res.status(200).json({
    success: true,
    message: "Article published successfully.",
    data: post,
  });
});

// ============================================================
// ARCHIVE POST
// ============================================================

export const archiveBlogPost = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const post = await blogService.archiveBlogPostService(id, req.user);

  return res.status(200).json({
    success: true,
    message: "Article archived successfully.",
    data: post,
  });
});

// ============================================================
// DELETE POST
// ============================================================

export const deleteBlogPost = asyncHandler(async (req, res) => {
  const { id } = req.params;

  await blogService.deleteBlogPostService(id, req.user);

  return res.status(200).json({
    success: true,
    message: "Article deleted successfully.",
  });
});

// ============================================================
// CREATE CATEGORY
// ============================================================

export const createBlogCategory = asyncHandler(async (req, res) => {
  const category = await blogService.createBlogCategoryService(req.body);

  return res.status(201).json({
    success: true,
    message: "Blog category created successfully.",
    data: category,
  });
});

// ============================================================
// GET ALL CATEGORIES
// ============================================================

export const getAllBlogCategories = asyncHandler(async (req, res) => {
  const categories = await blogService.getAllBlogCategoriesService();

  return res.status(200).json({
    success: true,
    count: categories.length,
    data: categories,
  });
});

// ============================================================
// GET CATEGORY BY ID
// ============================================================

export const getBlogCategoryById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const category = await blogService.getBlogCategoryByIdService(id);

  return res.status(200).json({
    success: true,
    data: category,
  });
});

// ============================================================
// UPDATE CATEGORY
// ============================================================

export const updateBlogCategory = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const category = await blogService.updateBlogCategoryService(id, req.body);

  return res.status(200).json({
    success: true,
    message: "Blog category updated successfully.",
    data: category,
  });
});

// ============================================================
// DELETE CATEGORY
// ============================================================

export const deleteBlogCategory = asyncHandler(async (req, res) => {
  const { id } = req.params;

  await blogService.deleteBlogCategoryService(id);

  return res.status(200).json({
    success: true,
    message: "Blog category deleted successfully.",
  });
});
