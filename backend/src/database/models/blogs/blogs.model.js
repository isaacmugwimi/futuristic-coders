import { query } from "../../config/config.db.js";

// ─────────────────────────────────────────────
// CREATE TABLES
// ─────────────────────────────────────────────

export const CREATE_BLOG_CATEGORIES_TABLE = `
  CREATE TABLE IF NOT EXISTS blog_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL UNIQUE,
    slug VARCHAR(120) NOT NULL UNIQUE,
    description VARCHAR(200),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  );
`;

export const CREATE_BLOG_POSTS_TABLE = `
  CREATE TABLE IF NOT EXISTS blog_posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    title VARCHAR(200) NOT NULL,
    slug VARCHAR(220) NOT NULL UNIQUE,

    category_id UUID REFERENCES blog_categories(id)
      ON UPDATE CASCADE ON DELETE SET NULL,

    excerpt VARCHAR(300) NOT NULL,
    content TEXT NOT NULL,

    cover_image TEXT,
    cover_alt VARCHAR(200),

    tags JSONB NOT NULL DEFAULT '[]'::jsonb,

    author_name VARCHAR(150) NOT NULL DEFAULT 'Our team',
    author_avatar TEXT,

    reading_time INTEGER NOT NULL DEFAULT 1 CHECK (reading_time >= 1),

    seo_title VARCHAR(70),
    seo_description VARCHAR(160),

    status VARCHAR(20) NOT NULL DEFAULT 'draft'
      CHECK (status IN ('draft', 'published', 'archived')),

    featured BOOLEAN NOT NULL DEFAULT FALSE,

    published_at TIMESTAMPTZ,

    created_by UUID REFERENCES users(id) ON DELETE SET NULL,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  );
`;

export const CREATE_BLOG_INDEXES = `
  CREATE INDEX IF NOT EXISTS idx_blog_posts_category_id
    ON blog_posts(category_id);

  CREATE INDEX IF NOT EXISTS idx_blog_posts_status
    ON blog_posts(status);

  CREATE INDEX IF NOT EXISTS idx_blog_posts_featured
    ON blog_posts(featured);

  CREATE INDEX IF NOT EXISTS idx_blog_posts_published_at
    ON blog_posts(published_at DESC);

  CREATE INDEX IF NOT EXISTS idx_blog_posts_created_by
    ON blog_posts(created_by);

  CREATE INDEX IF NOT EXISTS idx_blog_posts_tags
    ON blog_posts USING GIN (tags);
`;

// ─────────────────────────────────────────────
// INITIALIZE TABLES  (call after the users table exists)
// ─────────────────────────────────────────────

export const createBlogTables = async () => {
  await query(CREATE_BLOG_CATEGORIES_TABLE);
  await query(CREATE_BLOG_POSTS_TABLE);
  await query(CREATE_BLOG_INDEXES);
};

// ─────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────

export const slugify = (text) =>
  String(text)
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

// Same rule as the website: about 200 words a minute, never less than 1.
export const calculateReadingTime = (markdown) => {
  const words = String(markdown ?? "")
    .trim()
    .split(/\s+/)
    .filter(Boolean).length;

  return Math.max(1, Math.round(words / 200));
};

// "my-post" -> "my-post-2" -> "my-post-3" until the slug is free.
// Pass excludeId when updating so a post doesn't clash with itself.
export const generateUniqueSlug = async (client, text, excludeId = null) => {
  const base = slugify(text) || "post";
  let candidate = base;
  let n = 1;

  // eslint-disable-next-line no-constant-condition
  while (true) {
    const { rows } = await client.query(
      `SELECT 1 FROM blog_posts
      WHERE slug = $1 AND ($2::uuid IS NULL OR id <> $2::uuid)`,
      [candidate, excludeId],
    );
    if (rows.length === 0) return candidate;
    n += 1;
    candidate = `${base}-${n}`;
  }
};

// ─────────────────────────────────────────────
// SHARED SELECT
// Columns are aliased to camelCase and category/author are nested objects,
// which is exactly what the website's normalizePost() expects:
// { id, slug, title, excerpt, content, coverImage, coverAlt,
//   category{id,name}, categoryId, tags[], author{name,avatar},
//   publishedAt, updatedAt, readingTime }
// ─────────────────────────────────────────────

const POST_FIELDS = `
  p.id,
  p.title,
  p.slug,
  p.excerpt,
  p.cover_image AS "coverImage",
  p.cover_alt AS "coverAlt",
  p.tags,
  p.reading_time AS "readingTime",
  p.featured,
  p.status,
  p.category_id AS "categoryId",
  CASE
    WHEN bc.id IS NULL THEN NULL
    ELSE json_build_object('id', bc.id, 'name', bc.name, 'slug', bc.slug)
  END AS category,
  json_build_object('name', p.author_name, 'avatar', p.author_avatar) AS author,
  p.seo_title AS "seoTitle",
  p.seo_description AS "seoDescription",
  p.published_at AS "publishedAt",
  p.created_by AS "createdBy",
  p.created_at AS "createdAt",
  p.updated_at AS "updatedAt"
`;

const POST_FROM = `
  FROM blog_posts p
  LEFT JOIN blog_categories bc ON bc.id = p.category_id
`;

// ─────────────────────────────────────────────
// CREATE CATEGORY
// ─────────────────────────────────────────────

export const createBlogCategory = async (client, categoryData) => {
  const { name, description } = categoryData;

  const cleanName = name.trim();
  const slug = slugify(cleanName);

  const result = await client.query(
    `INSERT INTO blog_categories (name, slug, description)
    VALUES ($1, $2, $3)
    RETURNING *`,
    [cleanName, slug, description ?? null],
  );

  return result.rows[0];
};

// ─────────────────────────────────────────────
// READ ALL CATEGORIES
// ─────────────────────────────────────────────

export const getAllBlogCategories = async () => {
  const result = await query(
    `SELECT
      id,
      name,
      slug,
      description,
      created_at AS "createdAt",
      updated_at AS "updatedAt"
    FROM blog_categories
    ORDER BY name ASC`,
  );

  return result.rows;
};

// ─────────────────────────────────────────────
// READ CATEGORY BY ID
// ─────────────────────────────────────────────

export const getBlogCategoryById = async (id) => {
  const result = await query(
    `SELECT
      id,
      name,
      slug,
      description,
      created_at AS "createdAt",
      updated_at AS "updatedAt"
    FROM blog_categories
    WHERE id = $1`,
    [id],
  );

  return result.rows[0] ?? null;
};

// ─────────────────────────────────────────────
// UPDATE CATEGORY
// ─────────────────────────────────────────────

export const updateBlogCategory = async (id, categoryData) => {
  const { name, description } = categoryData;

  const cleanName = name?.trim() ?? null;
  const slug = cleanName ? slugify(cleanName) : null;

  const result = await query(
    `UPDATE blog_categories
    SET
      name = COALESCE($2, name),
      slug = COALESCE($3, slug),
      description = COALESCE($4, description),
      updated_at = NOW()
    WHERE id = $1
    RETURNING *`,
    [id, cleanName, slug, description ?? null],
  );

  return result.rows[0] ?? null;
};

// ─────────────────────────────────────────────
// DELETE CATEGORY  (posts keep existing, category becomes NULL)
// ─────────────────────────────────────────────

export const deleteBlogCategory = async (id) => {
  const result = await query(
    `DELETE FROM blog_categories
    WHERE id = $1
    RETURNING id, name, slug`,
    [id],
  );

  return result.rows[0] ?? null;
};

// ─────────────────────────────────────────────
// CREATE POST
// ─────────────────────────────────────────────

export const createBlogPost = async (client, postData) => {
  const {
    title,
    slug,
    category_id,
    excerpt,
    content,
    cover_image,
    cover_alt,
    tags,
    author_name,
    author_avatar,
    seo_title,
    seo_description,
    status,
    featured,
    created_by,
  } = postData;

  // Slug is generated from the title unless the admin typed one.
  const finalSlug = await generateUniqueSlug(client, slug || title);
  const finalStatus = status ?? "draft";

  const result = await client.query(
    `INSERT INTO blog_posts (
      title,
      slug,
      category_id,
      excerpt,
      content,
      cover_image,
      cover_alt,
      tags,
      author_name,
      author_avatar,
      reading_time,
      seo_title,
      seo_description,
      status,
      featured,
      published_at,
      created_by
    )
    VALUES (
      $1, $2, $3, $4, $5, $6, $7, $8::jsonb, $9, $10,
      $11, $12, $13, $14, $15,
      CASE WHEN $14 = 'published' THEN NOW() ELSE NULL END,
      $16
    )
    RETURNING id`,
    [
      title,
      finalSlug,
      category_id ?? null,
      excerpt,
      content,
      cover_image ?? null,
      cover_alt ?? null,
      JSON.stringify(tags ?? []),
      author_name ?? "Our team",
      author_avatar ?? null,
      calculateReadingTime(content),
      seo_title ?? null,
      seo_description ?? null,
      finalStatus,
      featured ?? false,
      created_by ?? null,
    ],
  );

  return getBlogPostById(result.rows[0].id, client);
};

// ─────────────────────────────────────────────
// READ ALL POSTS  (admin: every status, no body text to keep it light)
// ─────────────────────────────────────────────

export const getAllBlogPosts = async () => {
  const result = await query(
    `SELECT ${POST_FIELDS}
    ${POST_FROM}
    ORDER BY p.created_at DESC`,
  );

  return result.rows;
};

// ─────────────────────────────────────────────
// READ PUBLISHED POSTS  (public list: no body text, cards don't need it)
// ─────────────────────────────────────────────

export const getPublishedBlogPosts = async () => {
  const result = await query(
    `SELECT ${POST_FIELDS}
    ${POST_FROM}
    WHERE p.status = 'published'
    ORDER BY p.published_at DESC NULLS LAST, p.created_at DESC`,
  );

  return result.rows;
};

// ─────────────────────────────────────────────
// READ POST BY ID  (admin edit form, includes content)
// Pass a client to read inside a transaction.
// ─────────────────────────────────────────────

export const getBlogPostById = async (id, client = null) => {
  const run = client ? client.query.bind(client) : query;

  const result = await run(
    `SELECT ${POST_FIELDS}, p.content
    ${POST_FROM}
    WHERE p.id = $1`,
    [id],
  );

  return result.rows[0] ?? null;
};

// ─────────────────────────────────────────────
// READ POST BY SLUG  (public single post, published only, includes content)
// ─────────────────────────────────────────────

export const getBlogPostBySlug = async (slug) => {
  const result = await query(
    `SELECT ${POST_FIELDS}, p.content
    ${POST_FROM}
    WHERE p.slug = $1
      AND p.status = 'published'`,
    [slug],
  );

  return result.rows[0] ?? null;
};

// ─────────────────────────────────────────────
// SEARCH POSTS
// ─────────────────────────────────────────────

export const searchBlogPosts = async (searchTerm) => {
  const result = await query(
    `SELECT ${POST_FIELDS}
    ${POST_FROM}
    WHERE
      p.title ILIKE $1 OR
      p.excerpt ILIKE $1 OR
      p.author_name ILIKE $1 OR
      bc.name ILIKE $1 OR
      p.tags::text ILIKE $1
    ORDER BY p.created_at DESC`,
    [`%${searchTerm}%`],
  );

  return result.rows;
};

// ─────────────────────────────────────────────
// READ POSTS BY CATEGORY
// ─────────────────────────────────────────────

export const getBlogPostsByCategory = async (categoryId) => {
  const result = await query(
    `SELECT ${POST_FIELDS}
    ${POST_FROM}
    WHERE p.category_id = $1
    ORDER BY p.published_at DESC NULLS LAST, p.created_at DESC`,
    [categoryId],
  );

  return result.rows;
};

// ─────────────────────────────────────────────
// READ FEATURED POSTS
// ─────────────────────────────────────────────

export const getFeaturedBlogPosts = async () => {
  const result = await query(
    `SELECT ${POST_FIELDS}
    ${POST_FROM}
    WHERE p.featured = TRUE
      AND p.status = 'published'
    ORDER BY p.published_at DESC NULLS LAST`,
  );

  return result.rows;
};

// ─────────────────────────────────────────────
// UPDATE POST
// ─────────────────────────────────────────────

export const updateBlogPost = async (client, id, postData) => {
  const {
    title,
    slug,
    category_id,
    excerpt,
    content,
    cover_image,
    cover_alt,
    tags,
    author_name,
    author_avatar,
    seo_title,
    seo_description,
    status,
    featured,
  } = postData;

  // Only touch the slug when the admin sent a new one.
  // Changing a live slug breaks old links and shared URLs, so avoid it.
  const finalSlug = slug ? await generateUniqueSlug(client, slug, id) : null;

  const result = await client.query(
    `UPDATE blog_posts
    SET
      title = COALESCE($2, title),
      slug = COALESCE($3, slug),
      category_id = COALESCE($4, category_id),
      excerpt = COALESCE($5, excerpt),
      content = COALESCE($6, content),
      cover_image = COALESCE($7, cover_image),
      cover_alt = COALESCE($8, cover_alt),
      tags = COALESCE($9::jsonb, tags),
      author_name = COALESCE($10, author_name),
      author_avatar = COALESCE($11, author_avatar),
      reading_time = COALESCE($12, reading_time),
      seo_title = COALESCE($13, seo_title),
      seo_description = COALESCE($14, seo_description),
      status = COALESCE($15, status),
      featured = COALESCE($16, featured),
      published_at = CASE
        WHEN COALESCE($15, status) = 'published' AND published_at IS NULL
          THEN NOW()
        ELSE published_at
      END,
      updated_at = NOW()
    WHERE id = $1
    RETURNING id`,
    [
      id,
      title ?? null,
      finalSlug,
      category_id ?? null,
      excerpt ?? null,
      content ?? null,
      cover_image ?? null,
      cover_alt ?? null,
      tags == null ? null : JSON.stringify(tags),
      author_name ?? null,
      author_avatar ?? null,
      content == null ? null : calculateReadingTime(content),
      seo_title ?? null,
      seo_description ?? null,
      status ?? null,
      featured ?? null,
    ],
  );

  if (!result.rows[0]) return null;
  return getBlogPostById(id, client);
};

// ─────────────────────────────────────────────
// PUBLISH POST  (published_at is set once, on first publish)
// ─────────────────────────────────────────────

export const publishBlogPost = async (client, id) => {
  const result = await client.query(
    `UPDATE blog_posts
    SET
      status = 'published',
      published_at = COALESCE(published_at, NOW()),
      updated_at = NOW()
    WHERE id = $1
    RETURNING id`,
    [id],
  );

  if (!result.rows[0]) return null;
  return getBlogPostById(id, client);
};

// ─────────────────────────────────────────────
// ARCHIVE POST
// ─────────────────────────────────────────────

export const archiveBlogPost = async (client, id) => {
  const result = await client.query(
    `UPDATE blog_posts
    SET
      status = 'archived',
      updated_at = NOW()
    WHERE id = $1
    RETURNING id`,
    [id],
  );

  if (!result.rows[0]) return null;
  return getBlogPostById(id, client);
};

// ─────────────────────────────────────────────
// DELETE POST
// ─────────────────────────────────────────────

export const deleteBlogPost = async (client, id) => {
  const result = await client.query(
    `DELETE FROM blog_posts
    WHERE id = $1
    RETURNING id, title, slug`,
    [id],
  );

  return result.rows[0] ?? null;
};