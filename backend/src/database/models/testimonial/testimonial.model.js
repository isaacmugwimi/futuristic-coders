import { query } from "../../config/config.db.js";

// Flow:
//   website form -> createTestimonial()  (status: pending)
//   admin panel  -> approve / reject / edit typos
//   admin panel  -> publish              (status: published, visible on the site)
//   admin panel  -> archive              (hide again without deleting)

// ─────────────────────────────────────────────
// CREATE TABLES
// ─────────────────────────────────────────────

export const CREATE_TESTIMONIALS_TABLE = `
  CREATE TABLE IF NOT EXISTS testimonials (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    name VARCHAR(100) NOT NULL CHECK (char_length(name) >= 2),
    email VARCHAR(255) NOT NULL,
    relationship VARCHAR(30) NOT NULL DEFAULT 'Parent'
      CHECK (relationship IN ('Parent', 'Student', 'Alumni')),

    rating SMALLINT NOT NULL CHECK (rating BETWEEN 1 AND 5),
    message VARCHAR(600) NOT NULL CHECK (char_length(message) >= 20),

    status VARCHAR(20) NOT NULL DEFAULT 'pending'
      CHECK (status IN ('pending', 'approved', 'published', 'rejected', 'archived')),

    featured BOOLEAN NOT NULL DEFAULT FALSE,

    admin_notes TEXT,
    reviewed_by UUID REFERENCES users(id) ON DELETE SET NULL,
    reviewed_at TIMESTAMPTZ,
    published_at TIMESTAMPTZ,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  );
`;

export const CREATE_TESTIMONIAL_INDEXES = `
  CREATE INDEX IF NOT EXISTS idx_testimonials_status
    ON testimonials(status);

  CREATE INDEX IF NOT EXISTS idx_testimonials_rating
    ON testimonials(rating);

  CREATE INDEX IF NOT EXISTS idx_testimonials_featured
    ON testimonials(featured);

  CREATE INDEX IF NOT EXISTS idx_testimonials_created_at
    ON testimonials(created_at DESC);

  CREATE INDEX IF NOT EXISTS idx_testimonials_reviewed_by
    ON testimonials(reviewed_by);

  CREATE INDEX IF NOT EXISTS idx_testimonials_email
    ON testimonials(LOWER(email));
`;

// ─────────────────────────────────────────────
// INITIALIZE TABLES
// ─────────────────────────────────────────────

export const createTestimonialTables = async () => {
  await query(CREATE_TESTIMONIALS_TABLE);
  await query(CREATE_TESTIMONIAL_INDEXES);
};

// ─────────────────────────────────────────────
// SHARED SQL
// ─────────────────────────────────────────────

// Public responses never include email, admin notes, or reviewer info.
// Aliased to camelCase so they match what the frontend components expect.
const PUBLIC_COLUMNS = `
  id,
  name,
  relationship,
  rating,
  message,
  featured,
  created_at AS "createdAt"
`;

// Whitelist: sort values from the query string are never put in SQL directly.
const PUBLIC_SORTS = {
  newest: "published_at DESC, created_at DESC",
  oldest: "published_at ASC, created_at ASC",
  highest: "rating DESC, published_at DESC",
  lowest: "rating ASC, published_at DESC",
};

const REVIEW_STATUSES = [
  "pending",
  "approved",
  "published",
  "rejected",
  "archived",
];

// ─────────────────────────────────────────────
// CREATE TESTIMONIAL (public form submission)
// ─────────────────────────────────────────────

export const createTestimonial = async (client, testimonialData) => {
  const { name, email, relationship, rating, message } = testimonialData;

  // Status is always 'pending' for submissions, whatever the client sends.
  const result = await client.query(
    `INSERT INTO testimonials (
      name,
      email,
      relationship,
      rating,
      message,
      status
    )
    VALUES ($1, $2, $3, $4, $5, 'pending')
    RETURNING id, name, relationship, rating, message, status, created_at`,
    [
      name.trim(),
      email.trim().toLowerCase(),
      relationship ?? "Parent",
      rating,
      message.trim(),
    ],
  );

  return result.rows[0];
};

// ─────────────────────────────────────────────
// READ PUBLISHED TESTIMONIALS (public website)
// Returns { data, total } for GET /testimonials
// ─────────────────────────────────────────────

export const getPublishedTestimonials = async ({
  page = 1,
  limit = 6,
  rating = 0,
  sort = "newest",
} = {}) => {
  const safeLimit = Math.min(Math.max(Number(limit) || 6, 1), 50);
  const safePage = Math.max(Number(page) || 1, 1);
  const offset = (safePage - 1) * safeLimit;
  const safeRating =
    Number(rating) >= 1 && Number(rating) <= 5 ? Number(rating) : null;
  const orderBy = PUBLIC_SORTS[sort] ?? PUBLIC_SORTS.newest;

  const [rows, count] = await Promise.all([
    query(
      `SELECT ${PUBLIC_COLUMNS}
      FROM testimonials
      WHERE status = 'published'
        AND ($1::int IS NULL OR rating = $1)
      ORDER BY ${orderBy}
      LIMIT $2 OFFSET $3`,
      [safeRating, safeLimit, offset],
    ),
    query(
      `SELECT COUNT(*)::int AS total
      FROM testimonials
      WHERE status = 'published'
        AND ($1::int IS NULL OR rating = $1)`,
      [safeRating],
    ),
  ]);

  return { data: rows.rows, total: count.rows[0].total };
};

// ─────────────────────────────────────────────
// PUBLISHED STATS (average, count, breakdown)
// Always computed across ALL published reviews, ignoring the rating filter,
// so the breakdown bars stay stable while visitors filter.
// ─────────────────────────────────────────────

export const getPublishedTestimonialStats = async () => {
  const result = await query(
    `SELECT
      COUNT(*)::int AS count,
      COALESCE(ROUND(AVG(rating), 1), 0)::float AS average,
      COUNT(*) FILTER (WHERE rating = 1)::int AS r1,
      COUNT(*) FILTER (WHERE rating = 2)::int AS r2,
      COUNT(*) FILTER (WHERE rating = 3)::int AS r3,
      COUNT(*) FILTER (WHERE rating = 4)::int AS r4,
      COUNT(*) FILTER (WHERE rating = 5)::int AS r5
    FROM testimonials
    WHERE status = 'published'`,
  );

  const row = result.rows[0];

  return {
    average: row.average,
    count: row.count,
    breakdown: { 1: row.r1, 2: row.r2, 3: row.r3, 4: row.r4, 5: row.r5 },
  };
};

// ─────────────────────────────────────────────
// READ FEATURED TESTIMONIALS (e.g. home page strip)
// ─────────────────────────────────────────────

export const getFeaturedTestimonials = async (limit = 3) => {
  const result = await query(
    `SELECT ${PUBLIC_COLUMNS}
    FROM testimonials
    WHERE status = 'published'
      AND featured = TRUE
    ORDER BY published_at DESC
    LIMIT $1`,
    [Math.min(Math.max(Number(limit) || 3, 1), 12)],
  );

  return result.rows;
};

// ─────────────────────────────────────────────
// READ ALL TESTIMONIALS (admin panel)
// Optional filters: status, rating, search
// ─────────────────────────────────────────────

export const getAllTestimonials = async ({ status, rating, search } = {}) => {
  const safeStatus = REVIEW_STATUSES.includes(status) ? status : null;
  const safeRating =
    Number(rating) >= 1 && Number(rating) <= 5 ? Number(rating) : null;
  const term = search?.trim() ? `%${search.trim()}%` : null;

  const result = await query(
    `SELECT
      t.*,
      u.email AS reviewed_by_email
    FROM testimonials t
    LEFT JOIN users u ON u.id = t.reviewed_by
    WHERE ($1::text IS NULL OR t.status = $1)
      AND ($2::int IS NULL OR t.rating = $2)
      AND (
        $3::text IS NULL OR
        t.name ILIKE $3 OR
        t.email ILIKE $3 OR
        t.message ILIKE $3
      )
    ORDER BY
      (t.status = 'pending') DESC,
      t.created_at DESC`,
    [safeStatus, safeRating, term],
  );

  return result.rows;
};

// ─────────────────────────────────────────────
// COUNT BY STATUS (admin tab badges)
// ─────────────────────────────────────────────

export const getTestimonialCountsByStatus = async () => {
  const result = await query(
    `SELECT status, COUNT(*)::int AS count
    FROM testimonials
    GROUP BY status`,
  );

  const counts = Object.fromEntries(REVIEW_STATUSES.map((s) => [s, 0]));
  result.rows.forEach((r) => {
    counts[r.status] = r.count;
  });

  return counts;
};

// ─────────────────────────────────────────────
// READ TESTIMONIAL BY ID
// ─────────────────────────────────────────────

export const getTestimonialById = async (id) => {
  const result = await query(
    `SELECT
      t.*,
      u.email AS reviewed_by_email
    FROM testimonials t
    LEFT JOIN users u ON u.id = t.reviewed_by
    WHERE t.id = $1`,
    [id],
  );

  return result.rows[0] ?? null;
};

// ─────────────────────────────────────────────
// UPDATE TESTIMONIAL (admin: fix typos, notes, featured flag)
// The reviewer's rating and identity are intentionally not editable.
// ─────────────────────────────────────────────

export const updateTestimonial = async (client, id, testimonialData) => {
  const { message, admin_notes, featured } = testimonialData;

  const result = await client.query(
    `UPDATE testimonials
    SET
      message = COALESCE($2, message),
      admin_notes = COALESCE($3, admin_notes),
      featured = COALESCE($4, featured),
      updated_at = NOW()
    WHERE id = $1
    RETURNING *`,
    [id, message?.trim() ?? null, admin_notes ?? null, featured ?? null],
  );

  return result.rows[0] ?? null;
};

// ─────────────────────────────────────────────
// MODERATION: APPROVE / PUBLISH / REJECT / ARCHIVE
// ─────────────────────────────────────────────

// Approve = "I checked it, it's genuine", but it is not public yet.
export const approveTestimonial = async (client, id, reviewedBy) => {
  const result = await client.query(
    `UPDATE testimonials
    SET
      status = 'approved',
      reviewed_by = $2,
      reviewed_at = NOW(),
      updated_at = NOW()
    WHERE id = $1
      AND status IN ('pending', 'rejected')
    RETURNING *`,
    [id, reviewedBy ?? null],
  );

  return result.rows[0] ?? null;
};

// Publish = visible on the public website.
// Allowed from pending, approved, or archived (re-publish). Rejected must be
// approved first. Returns null if the review isn't in an allowed state.
export const publishTestimonial = async (client, id, reviewedBy) => {
  const result = await client.query(
    `UPDATE testimonials
    SET
      status = 'published',
      reviewed_by = COALESCE($2, reviewed_by),
      reviewed_at = COALESCE(reviewed_at, NOW()),
      published_at = NOW(),
      updated_at = NOW()
    WHERE id = $1
      AND status IN ('pending', 'approved', 'archived')
    RETURNING *`,
    [id, reviewedBy ?? null],
  );

  return result.rows[0] ?? null;
};

export const rejectTestimonial = async (client, id, reviewedBy, adminNotes) => {
  const result = await client.query(
    `UPDATE testimonials
    SET
      status = 'rejected',
      reviewed_by = $2,
      reviewed_at = NOW(),
      admin_notes = COALESCE($3, admin_notes),
      featured = FALSE,
      updated_at = NOW()
    WHERE id = $1
      AND status IN ('pending', 'approved')
    RETURNING *`,
    [id, reviewedBy ?? null, adminNotes ?? null],
  );

  return result.rows[0] ?? null;
};

// Archive = take it off the public site without deleting it.
export const archiveTestimonial = async (client, id) => {
  const result = await client.query(
    `UPDATE testimonials
    SET
      status = 'archived',
      featured = FALSE,
      updated_at = NOW()
    WHERE id = $1
      AND status = 'published'
    RETURNING *`,
    [id],
  );

  return result.rows[0] ?? null;
};

// ─────────────────────────────────────────────
// TOGGLE FEATURED (published reviews only)
// ─────────────────────────────────────────────

export const setTestimonialFeatured = async (client, id, featured) => {
  const result = await client.query(
    `UPDATE testimonials
    SET
      featured = $2,
      updated_at = NOW()
    WHERE id = $1
      AND status = 'published'
    RETURNING *`,
    [id, Boolean(featured)],
  );

  return result.rows[0] ?? null;
};

// ─────────────────────────────────────────────
// ABUSE CHECK (use in the controller before createTestimonial)
// Counts recent submissions from the same email.
// ─────────────────────────────────────────────

export const countRecentTestimonialsByEmail = async (email, hours = 24) => {
  const result = await query(
    `SELECT COUNT(*)::int AS count
    FROM testimonials
    WHERE LOWER(email) = LOWER($1)
      AND created_at > NOW() - ($2 || ' hours')::interval`,
    [email.trim(), String(hours)],
  );

  return result.rows[0].count;
};

// ─────────────────────────────────────────────
// DELETE TESTIMONIAL
// ─────────────────────────────────────────────

export const deleteTestimonial = async (client, id) => {
  const result = await client.query(
    `DELETE FROM testimonials
    WHERE id = $1
    RETURNING id, name, status`,
    [id],
  );

  return result.rows[0] ?? null;
};
