import { query } from "../../config/config.db.js";

// ─────────────────────────────────────────────
// CREATE TABLES
// ─────────────────────────────────────────────

export const CREATE_PROGRAM_CATEGORIES_TABLE = `
  CREATE TABLE IF NOT EXISTS program_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL UNIQUE,
    category_code VARCHAR(20) UNIQUE,
    slug VARCHAR(120) NOT NULL UNIQUE,
    description VARCHAR(140),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  );
`;

export const CREATE_PROGRAM_CODE_COUNTERS_TABLE = `
  CREATE TABLE IF NOT EXISTS program_code_counters (
    entity_type VARCHAR(20) NOT NULL
      CHECK (entity_type IN ('program', 'category')),
    prefix VARCHAR(10) NOT NULL,
    last_number INTEGER NOT NULL DEFAULT 0,
    PRIMARY KEY (entity_type, prefix)
  );
`;

export const CREATE_PROGRAMS_TABLE = `
  CREATE TABLE IF NOT EXISTS programs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    title VARCHAR(200) NOT NULL,
    code VARCHAR(50) UNIQUE,
    slug VARCHAR(220) NOT NULL UNIQUE,

    category_id UUID REFERENCES program_categories(id)
      ON UPDATE CASCADE ON DELETE SET NULL,

    level VARCHAR(50) NOT NULL,
    age_group VARCHAR(50) NOT NULL,
    mode VARCHAR(30) NOT NULL,

    duration_weeks INTEGER NOT NULL CHECK (duration_weeks >= 1),
    sessions_per_week INTEGER NOT NULL CHECK (sessions_per_week >= 1),
    session_minutes INTEGER NOT NULL CHECK (session_minutes >= 15),
    capacity INTEGER NOT NULL CHECK (capacity >= 1),

    price NUMERIC(12,2) NOT NULL DEFAULT 0 CHECK (price >= 0),

    instructor VARCHAR(150) NOT NULL,
    start_date DATE,
    schedule TEXT,

    display_order INTEGER CHECK (
      display_order IS NULL OR display_order >= 1
    ),

    summary VARCHAR(140) NOT NULL,
    description TEXT,

    outcomes JSONB NOT NULL DEFAULT '[]'::jsonb,
    prerequisites JSONB NOT NULL DEFAULT '[]'::jsonb,
    requirements JSONB NOT NULL DEFAULT '[]'::jsonb,
    tools JSONB NOT NULL DEFAULT '[]'::jsonb,

    thumbnail TEXT,

    status VARCHAR(20) NOT NULL DEFAULT 'draft'
      CHECK (status IN ('draft', 'published', 'archived')),

    featured BOOLEAN NOT NULL DEFAULT FALSE,

    created_by UUID REFERENCES users(id) ON DELETE SET NULL,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  );
`;

export const CREATE_PROGRAM_INDEXES = `
  CREATE INDEX IF NOT EXISTS idx_programs_category_id
    ON programs(category_id);

  CREATE INDEX IF NOT EXISTS idx_programs_status
    ON programs(status);

  CREATE INDEX IF NOT EXISTS idx_programs_featured
    ON programs(featured);

  CREATE INDEX IF NOT EXISTS idx_programs_display_order
    ON programs(display_order);

  CREATE INDEX IF NOT EXISTS idx_programs_created_by
    ON programs(created_by);
`;

// ─────────────────────────────────────────────
// INITIALIZE TABLES
// ─────────────────────────────────────────────

export const createProgramTables = async () => {
  await query(CREATE_PROGRAM_CODE_COUNTERS_TABLE);
  await query(CREATE_PROGRAM_CATEGORIES_TABLE);

  await query(CREATE_PROGRAMS_TABLE);
  await query(CREATE_PROGRAM_INDEXES);

  // Ensure category codes are unique when populated.
  await query(`
    CREATE UNIQUE INDEX IF NOT EXISTS
    idx_program_categories_category_code
    ON program_categories(category_code)
    WHERE category_code IS NOT NULL
  `);
};

// ─────────────────────────────────────────────
// CODE GENERATORS
// ─────────────────────────────────────────────

// Examples:
// Scratch Programming -> SCR
// Web Development     -> WEB
// Python Programming  -> PYT
// Young Creators      -> YOU
// Junior Developers   -> JUN
// Future Creators     -> FUT

const getCodePrefix = (name) => {
  const firstWord = String(name).trim().split(/\s+/)[0] || "GEN";

  return firstWord
    .replace(/[^a-zA-Z0-9]/g, "")
    .slice(0, 3)
    .toUpperCase()
    .padEnd(3, "X");
};

// Atomically increments the counter for a given code prefix.
const generateEntityCode = async (client, entityType, name) => {
  const prefix = getCodePrefix(name);

  const result = await client.query(
    `INSERT INTO program_code_counters (
      entity_type,
      prefix,
      last_number
    )
    VALUES ($1, $2, 1)
    ON CONFLICT (entity_type, prefix)
    DO UPDATE SET
      last_number = program_code_counters.last_number + 1
    RETURNING last_number`,
    [entityType, prefix],
  );

  const number = result.rows[0].last_number;

  return `${prefix}-${String(number).padStart(4, "0")}`;
};

export const generateProgramCode = async (client, title) => {
  return generateEntityCode(client, "program", title);
};

export const generateCategoryCode = async (client, name) => {
  return generateEntityCode(client, "category", name);
};

// ─────────────────────────────────────────────
// CREATE CATEGORY
// ─────────────────────────────────────────────

export const createProgramCategory = async (client, categoryData) => {
  const { name, description } = categoryData;

  const cleanName = name.trim();

  const slug = cleanName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

  const categoryCode = await generateCategoryCode(client, cleanName);

  const result = await client.query(
    `INSERT INTO program_categories (
      name,
      category_code,
      slug,
      description
    )
    VALUES ($1, $2, $3, $4)
    RETURNING *`,
    [cleanName, categoryCode, slug, description ?? null],
  );

  return result.rows[0];
};

// ─────────────────────────────────────────────
// READ ALL CATEGORIES
// ─────────────────────────────────────────────

export const getAllProgramCategories = async () => {
  const result = await query(
    `SELECT
      id,
      name,
      category_code,
      slug,
      description,
      created_at,
      updated_at
    FROM program_categories
    ORDER BY name ASC`,
  );

  return result.rows;
};

// ─────────────────────────────────────────────
// READ CATEGORY BY ID
// ─────────────────────────────────────────────

export const getProgramCategoryById = async (id) => {
  const result = await query(
    `SELECT
      id,
      name,
      category_code,
      slug,
      description,
      created_at,
      updated_at
    FROM program_categories
    WHERE id = $1`,
    [id],
  );

  return result.rows[0] ?? null;
};

// ─────────────────────────────────────────────
// UPDATE CATEGORY
// ─────────────────────────────────────────────

export const updateProgramCategory = async (id, categoryData) => {
  const { name, description } = categoryData;

  const cleanName = name?.trim() ?? null;

  const slug = cleanName
    ? cleanName
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "")
    : null;

  const result = await query(
    `UPDATE program_categories
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
// DELETE CATEGORY
// ─────────────────────────────────────────────

export const deleteProgramCategory = async (id) => {
  const result = await query(
    `DELETE FROM program_categories
    WHERE id = $1
    RETURNING id, name, category_code, slug`,
    [id],
  );

  return result.rows[0] ?? null;
};

// ─────────────────────────────────────────────
// CREATE PROGRAM
// ─────────────────────────────────────────────

export const createProgram = async (client, programData) => {
  const {
    title,
    slug,
    category_id,
    level,
    age_group,
    mode,
    duration_weeks,
    sessions_per_week,
    session_minutes,
    capacity,
    price,
    instructor,
    start_date,
    schedule,
    display_order,
    summary,
    description,
    outcomes,
    prerequisites,
    requirements,
    tools,
    thumbnail,
    status,
    featured,
    created_by,
  } = programData;

  // The backend generates the program code.
  const generatedCode = await generateProgramCode(client, title);

  const result = await client.query(
    `INSERT INTO programs (
      title,
      code,
      slug,
      category_id,
      level,
      age_group,
      mode,
      duration_weeks,
      sessions_per_week,
      session_minutes,
      capacity,
      price,
      instructor,
      start_date,
      schedule,
      display_order,
      summary,
      description,
      outcomes,
      prerequisites,
      requirements,
      tools,
      thumbnail,
      status,
      featured,
      created_by
    )
    VALUES (
      $1, $2, $3, $4, $5, $6, $7, $8, $9, $10,
      $11, $12, $13, $14, $15, $16, $17, $18,
      $19::jsonb, $20::jsonb, $21::jsonb, $22::jsonb,
      $23, $24, $25, $26
    )
    RETURNING *`,
    [
      title,
      generatedCode,
      slug,
      category_id ?? null,
      level,
      age_group,
      mode,
      duration_weeks,
      sessions_per_week,
      session_minutes,
      capacity,
      price ?? 0,
      instructor,
      start_date ?? null,
      schedule ?? null,
      display_order ?? null,
      summary,
      description ?? null,
      JSON.stringify(outcomes ?? []),
      JSON.stringify(prerequisites ?? []),
      JSON.stringify(requirements ?? []),
      JSON.stringify(tools ?? []),
      thumbnail ?? null,
      status ?? "draft",
      featured ?? false,
      created_by ?? null,
    ],
  );

  return result.rows[0];
};

// ─────────────────────────────────────────────
// READ ALL PROGRAMS
// ─────────────────────────────────────────────

export const getAllPrograms = async () => {
  const result = await query(
    `SELECT
      p.*,
      pc.name AS category,
      pc.category_code
    FROM programs p
    LEFT JOIN program_categories pc ON pc.id = p.category_id
    ORDER BY p.display_order ASC NULLS LAST, p.created_at DESC`,
  );

  return result.rows;
};

// ─────────────────────────────────────────────
// READ PUBLISHED PROGRAMS
// ─────────────────────────────────────────────

export const getPublishedPrograms = async () => {
  const result = await query(
    `SELECT
      p.*,
      pc.name AS category,
      pc.category_code
    FROM programs p
    LEFT JOIN program_categories pc ON pc.id = p.category_id
    WHERE p.status = 'published'
    ORDER BY
      p.featured DESC,
      p.display_order ASC NULLS LAST,
      p.created_at DESC`,
  );

  return result.rows;
};

// ─────────────────────────────────────────────
// READ PROGRAM BY ID
// ─────────────────────────────────────────────

export const getProgramById = async (id) => {
  const result = await query(
    `SELECT
      p.*,
      pc.name AS category,
      pc.category_code
    FROM programs p
    LEFT JOIN program_categories pc ON pc.id = p.category_id
    WHERE p.id = $1`,
    [id],
  );

  return result.rows[0] ?? null;
};

// ─────────────────────────────────────────────
// READ PROGRAM BY SLUG
// ─────────────────────────────────────────────

export const getProgramBySlug = async (slug) => {
  const result = await query(
    `SELECT
      p.*,
      pc.name AS category,
      pc.category_code
    FROM programs p
    LEFT JOIN program_categories pc ON pc.id = p.category_id
    WHERE p.slug = $1
      AND p.status = 'published'`,
    [slug],
  );

  return result.rows[0] ?? null;
};

// ─────────────────────────────────────────────
// SEARCH PROGRAMS
// ─────────────────────────────────────────────

export const searchPrograms = async (searchTerm) => {
  const result = await query(
    `SELECT
      p.*,
      pc.name AS category,
      pc.category_code
    FROM programs p
    LEFT JOIN program_categories pc ON pc.id = p.category_id
    WHERE
      p.title ILIKE $1 OR
      p.code ILIKE $1 OR
      p.summary ILIKE $1 OR
      p.instructor ILIKE $1 OR
      pc.name ILIKE $1 OR
      pc.category_code ILIKE $1
    ORDER BY p.created_at DESC`,
    [`%${searchTerm}%`],
  );

  return result.rows;
};

// ─────────────────────────────────────────────
// READ PROGRAMS BY CATEGORY
// ─────────────────────────────────────────────

export const getProgramsByCategory = async (categoryId) => {
  const result = await query(
    `SELECT
      p.*,
      pc.name AS category,
      pc.category_code
    FROM programs p
    LEFT JOIN program_categories pc ON pc.id = p.category_id
    WHERE p.category_id = $1
    ORDER BY p.display_order ASC NULLS LAST, p.created_at DESC`,
    [categoryId],
  );

  return result.rows;
};

// ─────────────────────────────────────────────
// READ FEATURED PROGRAMS
// ─────────────────────────────────────────────

export const getFeaturedPrograms = async () => {
  const result = await query(
    `SELECT
      p.*,
      pc.name AS category,
      pc.category_code
    FROM programs p
    LEFT JOIN program_categories pc ON pc.id = p.category_id
    WHERE p.featured = TRUE
      AND p.status = 'published'
    ORDER BY p.display_order ASC NULLS LAST`,
  );

  return result.rows;
};

// ─────────────────────────────────────────────
// UPDATE PROGRAM
// ─────────────────────────────────────────────

export const updateProgram = async (client, id, programData) => {
  const {
    title,
    slug,
    category_id,
    level,
    age_group,
    mode,
    duration_weeks,
    sessions_per_week,
    session_minutes,
    capacity,
    price,
    instructor,
    start_date,
    schedule,
    display_order,
    summary,
    description,
    outcomes,
    prerequisites,
    requirements,
    tools,
    thumbnail,
    status,
    featured,
  } = programData;

  // The generated program code is intentionally not editable.
  const result = await client.query(
    `UPDATE programs
    SET
      title = COALESCE($2, title),
      slug = COALESCE($3, slug),
      category_id = COALESCE($4, category_id),
      level = COALESCE($5, level),
      age_group = COALESCE($6, age_group),
      mode = COALESCE($7, mode),
      duration_weeks = COALESCE($8, duration_weeks),
      sessions_per_week = COALESCE($9, sessions_per_week),
      session_minutes = COALESCE($10, session_minutes),
      capacity = COALESCE($11, capacity),
      price = COALESCE($12, price),
      instructor = COALESCE($13, instructor),
      start_date = COALESCE($14, start_date),
      schedule = COALESCE($15, schedule),
      display_order = COALESCE($16, display_order),
      summary = COALESCE($17, summary),
      description = COALESCE($18, description),
      outcomes = COALESCE($19::jsonb, outcomes),
      prerequisites = COALESCE($20::jsonb, prerequisites),
      requirements = COALESCE($21::jsonb, requirements),
      tools = COALESCE($22::jsonb, tools),
      thumbnail = COALESCE($23, thumbnail),
      status = COALESCE($24, status),
      featured = COALESCE($25, featured),
      updated_at = NOW()
    WHERE id = $1
    RETURNING *`,
    [
      id,
      title ?? null,
      slug ?? null,
      category_id ?? null,
      level ?? null,
      age_group ?? null,
      mode ?? null,
      duration_weeks ?? null,
      sessions_per_week ?? null,
      session_minutes ?? null,
      capacity ?? null,
      price ?? null,
      instructor ?? null,
      start_date ?? null,
      schedule ?? null,
      display_order ?? null,
      summary ?? null,
      description ?? null,
      outcomes == null ? null : JSON.stringify(outcomes),
      prerequisites == null ? null : JSON.stringify(prerequisites),
      requirements == null ? null : JSON.stringify(requirements),
      tools == null ? null : JSON.stringify(tools),
      thumbnail ?? null,
      status ?? null,
      featured ?? null,
    ],
  );

  return result.rows[0] ?? null;
};

// ─────────────────────────────────────────────
// PUBLISH PROGRAM
// ─────────────────────────────────────────────

export const publishProgram = async (client, id) => {
  const result = await client.query(
    `UPDATE programs
    SET
      status = 'published',
      updated_at = NOW()
    WHERE id = $1
    RETURNING *`,
    [id],
  );

  return result.rows[0] ?? null;
};

// ─────────────────────────────────────────────
// ARCHIVE PROGRAM
// ─────────────────────────────────────────────

export const archiveProgram = async (client, id) => {
  const result = await client.query(
    `UPDATE programs
    SET
      status = 'archived',
      updated_at = NOW()
    WHERE id = $1
    RETURNING *`,
    [id],
  );

  return result.rows[0] ?? null;
};

// ─────────────────────────────────────────────
// DELETE PROGRAM
// ─────────────────────────────────────────────

export const deleteProgram = async (client, id) => {
  const result = await client.query(
    `DELETE FROM programs
    WHERE id = $1
    RETURNING id, title, code, slug`,
    [id],
  );

  return result.rows[0] ?? null;
};
