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
  slugify,
} from "../../database/models/blogs/blogs.model.js";

import AppError from "../../middleware/error/AppError.js";
import { pool } from "../../database/config/config.db.js";

// ============================================================
// HELPERS
// ============================================================

const getRole = (user) =>
  typeof user?.role === "string"
    ? user.role.toLowerCase()
    : user?.role?.name?.toLowerCase();

const isAdminRole = (user) =>
  ["admin", "owner", "super_admin"].includes(getRole(user));

const canPublishBlog = (user) =>
  isAdminRole(user) || user?.permissions?.includes("blog:publish");

// Matches the column sizes in blog_posts so bad input gives a 400, not a 500.
const LIMITS = { title: 200, excerpt: 300, seoTitle: 70, seoDescription: 160 };

const checkLength = (value, max, label) => {
  if (typeof value === "string" && value.trim().length > max) {
    throw new AppError(`${label} must be ${max} characters or fewer.`, 400);
  }
};

// Accepts ["a","b"] or "a, b". Trims, drops empties and duplicates, max 10.
const cleanTags = (tags) => {
  if (tags == null) return undefined;

  const list = Array.isArray(tags)
    ? tags
    : typeof tags === "string"
      ? tags.split(",")
      : null;

  if (!list) throw new AppError("Tags must be a list of words.", 400);

  const seen = new Set();
  const out = [];

  for (const t of list) {
    const tag = String(t).trim();
    if (!tag || seen.has(tag.toLowerCase())) continue;
    if (tag.length > 40) {
      throw new AppError("Each tag must be 40 characters or fewer.", 400);
    }
    seen.add(tag.toLowerCase());
    out.push(tag);
  }

  if (out.length > 10) {
    throw new AppError("You can add up to 10 tags.", 400);
  }

  return out;
};

// Finds (or creates) the category from whatever the admin form sends.
// Same inputs as the programs service.
const resolveCategoryId = async (client, data) => {
  const {
    categoryId,
    category_id,
    category,
    categoryName,
    newCategoryName,
    isNewCategory,
    categoryDescription,
  } = data;

  let id = categoryId ?? category_id ?? null;

  if (isNewCategory) {
    const name = newCategoryName || categoryName || category;

    if (!name || typeof name !== "string" || !name.trim()) {
      throw new AppError("New category name is required.", 400);
    }

    const existing = await client.query(
      `SELECT id
       FROM blog_categories
       WHERE LOWER(name) = LOWER($1)
       LIMIT 1`,
      [name.trim()],
    );

    if (existing.rows.length > 0) return existing.rows[0].id;

    const created = await createBlogCategory(client, {
      name: name.trim(),
      description: categoryDescription ?? null,
    });

    return created.id;
  }

  if (id) {
    const existing = await client.query(
      `SELECT id
       FROM blog_categories
       WHERE id = $1`,
      [id],
    );

    if (existing.rows.length === 0) {
      throw new AppError("Selected blog category was not found.", 404);
    }

    return id;
  }

  const name = typeof category === "string" ? category : categoryName;

  if (typeof name === "string" && name.trim()) {
    const existing = await client.query(
      `SELECT id
       FROM blog_categories
       WHERE LOWER(name) = LOWER($1)
       LIMIT 1`,
      [name.trim()],
    );

    if (existing.rows.length === 0) {
      throw new AppError("Selected blog category was not found.", 404);
    }

    return existing.rows[0].id;
  }

  throw new AppError("A blog category is required.", 400);
};

// ============================================================
// CREATE POST
// ============================================================

export const createBlogPostService = async (data, user) => {
  const { title, excerpt, content, publish } = data;

  if (!title || typeof title !== "string" || !title.trim()) {
    throw new AppError("Article title is required.", 400);
  }

  if (!excerpt || typeof excerpt !== "string" || !excerpt.trim()) {
    throw new AppError("A short excerpt is required.", 400);
  }

  if (!content || typeof content !== "string" || !content.trim()) {
    throw new AppError("Article content is required.", 400);
  }

  checkLength(title, LIMITS.title, "Title");
  checkLength(excerpt, LIMITS.excerpt, "Excerpt");
  checkLength(data.seoTitle ?? data.seo_title, LIMITS.seoTitle, "SEO title");
  checkLength(
    data.seoDescription ?? data.seo_description,
    LIMITS.seoDescription,
    "SEO description",
  );

  if (!user?.userId) {
    throw new AppError("Authentication is required to create an article.", 401);
  }

  const canPublish = canPublishBlog(user);

  const requestedStatus =
    data.status || (publish === true ? "published" : "draft");

  if (!["draft", "published"].includes(requestedStatus)) {
    throw new AppError("Invalid article status.", 400);
  }

  if (requestedStatus === "published" && !canPublish) {
    throw new AppError("You do not have permission to publish articles.", 403);
  }

  const client = await pool.connect();
  let transactionStarted = false;

  try {
    await client.query("BEGIN");
    transactionStarted = true;

    const category_id = await resolveCategoryId(client, data);

    // Stops two articles with the same title from grabbing the same slug.
    await client.query("SELECT pg_advisory_xact_lock(42424243)");

    const postData = {
      title: title.trim(),
      // The model turns this into a free, unique slug.
      slug: data.slug?.trim() || title.trim(),
      category_id,
      excerpt: excerpt.trim(),
      content,
      cover_image: data.coverImage ?? data.cover_image ?? null,
      cover_alt: data.coverAlt ?? data.cover_alt ?? null,
      tags: cleanTags(data.tags) ?? [],
      author_name:
        data.authorName?.trim() ||
        data.author_name?.trim() ||
        user.name ||
        user.fullName ||
        "Our team",
      author_avatar: data.authorAvatar ?? data.author_avatar ?? null,
      seo_title: data.seoTitle ?? data.seo_title ?? null,
      seo_description: data.seoDescription ?? data.seo_description ?? null,
      status: requestedStatus,
      featured: canPublish ? data.featured === true : false,
      created_by: user.userId,
    };

    const post = await createBlogPost(client, postData);

    await client.query("COMMIT");
    transactionStarted = false;

    return post;
  } catch (error) {
    if (transactionStarted) {
      try {
        await client.query("ROLLBACK");
      } catch {
        // Preserve the original error if rollback also fails.
      }
    }

    throw error;
  } finally {
    client.release();
  }
};

// ============================================================
// GET ALL POSTS (admin)
// ============================================================

export const getAllBlogPostsService = async () => {
  return await getAllBlogPosts();
};

// ============================================================
// GET PUBLISHED POSTS (public)
// ============================================================

export const getPublishedBlogPostsService = async () => {
  return await getPublishedBlogPosts();
};

// ============================================================
// GET POST BY ID (admin edit form)
// ============================================================

export const getBlogPostByIdService = async (id) => {
  const post = await getBlogPostById(id);

  if (!post) {
    throw new AppError("Article not found.", 404);
  }

  return post;
};

// ============================================================
// GET POST BY SLUG (public)
// ============================================================

export const getBlogPostBySlugService = async (slug) => {
  const post = await getBlogPostBySlug(slug);

  if (!post) {
    throw new AppError("Published article not found.", 404);
  }

  return post;
};

// ============================================================
// SEARCH POSTS
// ============================================================

export const searchBlogPostsService = async (searchTerm) => {
  if (!searchTerm || typeof searchTerm !== "string" || !searchTerm.trim()) {
    throw new AppError("Search term is required.", 400);
  }

  return await searchBlogPosts(searchTerm.trim());
};

// ============================================================
// GET POSTS BY CATEGORY
// ============================================================

export const getBlogPostsByCategoryService = async (categoryId) => {
  const category = await getBlogCategoryById(categoryId);

  if (!category) {
    throw new AppError("Blog category not found.", 404);
  }

  return await getBlogPostsByCategory(categoryId);
};

// ============================================================
// GET FEATURED POSTS
// ============================================================

export const getFeaturedBlogPostsService = async () => {
  return await getFeaturedBlogPosts();
};

// ============================================================
// UPDATE POST
// ============================================================

export const updateBlogPostService = async (id, data, user) => {
  const existingPost = await getBlogPostById(id);

  if (!existingPost) {
    throw new AppError("Article not found.", 404);
  }

  if (!user?.userId) {
    throw new AppError("Authentication is required.", 401);
  }

  const canPublish = canPublishBlog(user);

  if (
    data.status !== undefined &&
    !["draft", "published", "archived"].includes(data.status)
  ) {
    throw new AppError("Invalid article status.", 400);
  }

  if (data.status === "published" && !canPublish) {
    throw new AppError("You do not have permission to publish articles.", 403);
  }

  if (data.featured !== undefined && !canPublish) {
    throw new AppError(
      "You do not have permission to change featured status.",
      403,
    );
  }

  if (data.status === "published") {
    const title = data.title ?? existingPost.title;
    const excerpt = data.excerpt ?? existingPost.excerpt;
    const content = data.content ?? existingPost.content;

    if (!title?.trim() || !excerpt?.trim() || !content?.trim()) {
      throw new AppError(
        "A title, excerpt, and content are required before publishing.",
        400,
      );
    }
  }

  const client = await pool.connect();
  let transactionStarted = false;

  try {
    await client.query("BEGIN");
    transactionStarted = true;

    const postData = {};

    if (data.title !== undefined) {
      if (typeof data.title !== "string" || !data.title.trim()) {
        throw new AppError("Article title cannot be empty.", 400);
      }

      checkLength(data.title, LIMITS.title, "Title");
      postData.title = data.title.trim();
    }

    // The slug only changes when the admin sends one on purpose.
    // Renaming the title alone must not break links people already shared.
    if (data.slug !== undefined) {
      if (typeof data.slug !== "string" || !slugify(data.slug)) {
        throw new AppError("Article slug cannot be empty.", 400);
      }

      postData.slug = slugify(data.slug);
    }

    if (data.excerpt !== undefined) {
      if (typeof data.excerpt !== "string" || !data.excerpt.trim()) {
        throw new AppError("Excerpt cannot be empty.", 400);
      }

      checkLength(data.excerpt, LIMITS.excerpt, "Excerpt");
      postData.excerpt = data.excerpt.trim();
    }

    if (data.content !== undefined) {
      if (typeof data.content !== "string" || !data.content.trim()) {
        throw new AppError("Article content cannot be empty.", 400);
      }

      postData.content = data.content;
    }

    if (data.coverImage !== undefined || data.cover_image !== undefined) {
      postData.cover_image = data.coverImage ?? data.cover_image;
    }

    if (data.coverAlt !== undefined || data.cover_alt !== undefined) {
      postData.cover_alt = data.coverAlt ?? data.cover_alt;
    }

    if (data.tags !== undefined) {
      postData.tags = cleanTags(data.tags);
    }

    if (data.authorName !== undefined || data.author_name !== undefined) {
      postData.author_name = data.authorName ?? data.author_name;
    }

    if (data.authorAvatar !== undefined || data.author_avatar !== undefined) {
      postData.author_avatar = data.authorAvatar ?? data.author_avatar;
    }

    if (data.seoTitle !== undefined || data.seo_title !== undefined) {
      const value = data.seoTitle ?? data.seo_title;
      checkLength(value, LIMITS.seoTitle, "SEO title");
      postData.seo_title = value;
    }

    if (
      data.seoDescription !== undefined ||
      data.seo_description !== undefined
    ) {
      const value = data.seoDescription ?? data.seo_description;
      checkLength(value, LIMITS.seoDescription, "SEO description");
      postData.seo_description = value;
    }

    if (data.status !== undefined) {
      postData.status = data.status;
    }

    if (data.featured !== undefined) {
      postData.featured = data.featured;
    }

    const hasCategoryInput =
      data.categoryId !== undefined ||
      data.category_id !== undefined ||
      data.category !== undefined ||
      data.categoryName !== undefined ||
      data.newCategoryName !== undefined ||
      data.isNewCategory !== undefined;

    if (hasCategoryInput) {
      postData.category_id = await resolveCategoryId(client, data);
    }

    delete postData.created_by;
    delete postData.published_at;
    delete postData.reading_time;

    const updatedPost = await updateBlogPost(client, id, postData);

    if (!updatedPost) {
      throw new AppError("Article not found.", 404);
    }

    await client.query("COMMIT");
    transactionStarted = false;

    return updatedPost;
  } catch (error) {
    if (transactionStarted) {
      try {
        await client.query("ROLLBACK");
      } catch {
        // Preserve the original error.
      }
    }

    throw error;
  } finally {
    client.release();
  }
};

// ============================================================
// PUBLISH POST
// ============================================================

export const publishBlogPostService = async (id, user) => {
  if (!user?.userId) {
    throw new AppError("Authentication is required.", 401);
  }

  if (!canPublishBlog(user)) {
    throw new AppError("You do not have permission to publish articles.", 403);
  }

  const existingPost = await getBlogPostById(id);

  if (!existingPost) {
    throw new AppError("Article not found.", 404);
  }

  if (
    !existingPost.title?.trim() ||
    !existingPost.excerpt?.trim() ||
    !existingPost.content?.trim()
  ) {
    throw new AppError(
      "A title, excerpt, and content are required before publishing.",
      400,
    );
  }

  const client = await pool.connect();

  try {
    return await publishBlogPost(client, id);
  } finally {
    client.release();
  }
};

// ============================================================
// ARCHIVE POST
// ============================================================

export const archiveBlogPostService = async (id, user) => {
  if (!user?.userId) {
    throw new AppError("Authentication is required.", 401);
  }

  if (!isAdminRole(user)) {
    throw new AppError("You do not have permission to archive articles.", 403);
  }

  const existingPost = await getBlogPostById(id);

  if (!existingPost) {
    throw new AppError("Article not found.", 404);
  }

  const client = await pool.connect();

  try {
    return await archiveBlogPost(client, id);
  } finally {
    client.release();
  }
};

// ============================================================
// DELETE POST
// ============================================================

export const deleteBlogPostService = async (id, user) => {
  if (!user?.userId) {
    throw new AppError("Authentication is required.", 401);
  }

  if (!isAdminRole(user)) {
    throw new AppError("You do not have permission to delete articles.", 403);
  }

  const existingPost = await getBlogPostById(id);

  if (!existingPost) {
    throw new AppError("Article not found.", 404);
  }

  const client = await pool.connect();

  try {
    return await deleteBlogPost(client, id);
  } finally {
    client.release();
  }
};

// ============================================================
// CREATE CATEGORY
// ============================================================

export const createBlogCategoryService = async (data) => {
  const { name, description } = data;

  if (!name || typeof name !== "string" || !name.trim()) {
    throw new AppError("Category name is required.", 400);
  }

  const client = await pool.connect();

  try {
    const existingCategory = await client.query(
      `SELECT id
       FROM blog_categories
       WHERE LOWER(name) = LOWER($1)
       LIMIT 1`,
      [name.trim()],
    );

    if (existingCategory.rows.length > 0) {
      throw new AppError("A category with this name already exists.", 409);
    }

    return await createBlogCategory(client, {
      name: name.trim(),
      description: description ?? null,
    });
  } finally {
    client.release();
  }
};

// ============================================================
// GET ALL CATEGORIES
// ============================================================

export const getAllBlogCategoriesService = async () => {
  return await getAllBlogCategories();
};

// ============================================================
// GET CATEGORY BY ID
// ============================================================

export const getBlogCategoryByIdService = async (id) => {
  const category = await getBlogCategoryById(id);

  if (!category) {
    throw new AppError("Blog category not found.", 404);
  }

  return category;
};

// ============================================================
// UPDATE CATEGORY
// ============================================================

export const updateBlogCategoryService = async (id, data) => {
  const existingCategory = await getBlogCategoryById(id);

  if (!existingCategory) {
    throw new AppError("Blog category not found.", 404);
  }

  const categoryData = {};

  if (data.name !== undefined) {
    if (typeof data.name !== "string" || !data.name.trim()) {
      throw new AppError("Category name cannot be empty.", 400);
    }

    const duplicateCategory = await pool.query(
      `SELECT id
       FROM blog_categories
       WHERE LOWER(name) = LOWER($1)
         AND id <> $2
       LIMIT 1`,
      [data.name.trim(), id],
    );

    if (duplicateCategory.rows.length > 0) {
      throw new AppError("A category with this name already exists.", 409);
    }

    categoryData.name = data.name.trim();
  }

  if (data.description !== undefined) {
    categoryData.description = data.description;
  }

  return await updateBlogCategory(id, categoryData);
};

// ============================================================
// DELETE CATEGORY (articles stay, they just lose the category)
// ============================================================

export const deleteBlogCategoryService = async (id) => {
  const existingCategory = await getBlogCategoryById(id);

  if (!existingCategory) {
    throw new AppError("Blog category not found.", 404);
  }

  return await deleteBlogCategory(id);
};
