import {
  createProgram,
  getAllPrograms,
  getPublishedPrograms,
  getProgramById,
  getProgramBySlug,
  searchPrograms,
  getProgramsByCategory,
  getFeaturedPrograms,
  updateProgram,
  publishProgram,
  archiveProgram,
  deleteProgram,
  createProgramCategory,
  getAllProgramCategories,
  getProgramCategoryById,
  updateProgramCategory,
  deleteProgramCategory,
} from "../../database/models/programs/program.model.js";

import AppError from "../../middleware/error/AppError.js";
import { pool } from "../../database/config/config.db.js";

// ============================================================
// CREATE PROGRAM
// ============================================================

export const createProgramService = async (data, user) => {
  const {
    title,
    categoryId,
    category,
    categoryName,
    newCategoryName,
    isNewCategory,
    categoryDescription,
    publish,
  } = data;

  if (!title || typeof title !== "string" || !title.trim()) {
    throw new AppError("Program title is required.", 400);
  }

  if (!user?.id) {
    throw new AppError("Authentication is required to create a program.", 401);
  }

  // Only authorized users can create a published program.
  const role =
    typeof user.role === "string"
      ? user.role.toLowerCase()
      : user.role?.name?.toLowerCase();

  const canPublish =
    ["admin", "owner", "super_admin"].includes(role) ||
    user.permissions?.includes("programs:publish");

  if (publish === true && !canPublish) {
    throw new AppError("You do not have permission to publish programs.", 403);
  }

  // Validate status instead of accepting arbitrary values.
  const requestedStatus =
    data.status || (publish === true ? "published" : "draft");

  if (!["draft", "published"].includes(requestedStatus)) {
    throw new AppError("Invalid program status.", 400);
  }

  if (requestedStatus === "published" && !canPublish) {
    throw new AppError("You do not have permission to publish programs.", 403);
  }

  if (requestedStatus === "published") {
    if (!data.summary?.trim() || !data.instructor?.trim()) {
      throw new AppError(
        "A summary and instructor are required before publishing.",
        400,
      );
    }
  }

  const client = await pool.connect();
  let transactionStarted = false;

  try {
    await client.query("BEGIN");
    transactionStarted = true;

    let category_id = categoryId || data.category_id || null;

    // Resolve or create the category inside this transaction.
    if (isNewCategory) {
      const name = newCategoryName || categoryName || category;

      if (!name || typeof name !== "string" || !name.trim()) {
        throw new AppError("New category name is required.", 400);
      }

      const existingCategory = await client.query(
        `SELECT id
         FROM program_categories
         WHERE LOWER(name) = LOWER($1)
         LIMIT 1`,
        [name.trim()],
      );

      if (existingCategory.rows.length > 0) {
        category_id = existingCategory.rows[0].id;
      } else {
        const newCategory = await createProgramCategory(client, {
          name: name.trim(),
          description: categoryDescription ?? null,
        });

        category_id = newCategory.id;
      }
    } else if (category_id) {
      const existingCategory = await client.query(
        `SELECT id
         FROM program_categories
         WHERE id = $1`,
        [category_id],
      );

      if (existingCategory.rows.length === 0) {
        throw new AppError("Selected program category was not found.", 404);
      }
    } else if (typeof category === "string" && category.trim()) {
      const existingCategory = await client.query(
        `SELECT id
         FROM program_categories
         WHERE LOWER(name) = LOWER($1)
         LIMIT 1`,
        [category.trim()],
      );

      if (existingCategory.rows.length === 0) {
        throw new AppError("Selected program category was not found.", 404);
      }

      category_id = existingCategory.rows[0].id;
    } else {
      throw new AppError("A program category is required.", 400);
    }

    // Generate a URL-friendly slug from the program title.
const baseSlug = title
  .trim()
  .normalize("NFKD")
  .replace(/[\u0300-\u036f]/g, "")
  .toLowerCase()
  .replace(/[^a-z0-9]+/g, "-")
  .replace(/^-|-$/g, "") || "program";

// Prevent simultaneous requests from generating the same slug
// through this service.
await client.query("SELECT pg_advisory_xact_lock(42424242)");

let slug = baseSlug;
let suffix = 2;

while (true) {
  const existingSlug = await client.query(
    `SELECT id
     FROM programs
     WHERE slug = $1
     LIMIT 1`,
    [slug]
  );

  if (existingSlug.rows.length === 0) {
    break;
  }

  slug = `${baseSlug}-${suffix}`;
  suffix++;
}

    // Explicitly map frontend fields to database column names.
    // Do not pass the entire frontend object directly to the model.
    const programData = {
      title: title.trim(),
      slug,
      category_id,
      level: data.level,
      age_group: data.ageGroup ?? data.age_group ?? null,
      mode: data.mode,
      duration_weeks: data.durationWeeks ?? data.duration_weeks ?? null,
      sessions_per_week: data.sessionsPerWeek ?? data.sessions_per_week ?? null,
      session_minutes: data.sessionMinutes ?? data.session_minutes ?? null,
      capacity: data.capacity ?? null,
      price: data.price,
      instructor: data.instructor ?? null,
      start_date: data.startDate ?? data.start_date ?? null,
      schedule: data.schedule ?? null,
      display_order: data.displayOrder ?? data.display_order ?? 0,
      summary: data.summary ?? null,
      description: data.description ?? null,
      outcomes: data.outcomes ?? [],
      prerequisites: data.prerequisites ?? [],
      requirements: data.requirements ?? [],
      tools: data.tools ?? [],
      thumbnail: data.thumbnail ?? null,
      status: requestedStatus,
      featured: canPublish ? data.featured === true : false,
      created_by: user.id,
    };

    // The model generates the program code.
    // Never trust a code supplied by the frontend.
    delete programData.code;

    const program = await createProgram(client, programData);

    await client.query("COMMIT");
    transactionStarted = false;

    return program;
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
// GET ALL PROGRAMS
// ============================================================

export const getAllProgramsService = async () => {
  return await getAllPrograms();
};

// ============================================================
// GET PUBLISHED PROGRAMS
// ============================================================

export const getPublishedProgramsService = async () => {
  return await getPublishedPrograms();
};

// ============================================================
// GET PROGRAM BY ID
// ============================================================

export const getProgramByIdService = async (id) => {
  const program = await getProgramById(id);

  if (!program) {
    throw new AppError("Program not found.", 404);
  }

  return program;
};

// ============================================================
// GET PROGRAM BY SLUG
// ============================================================

export const getProgramBySlugService = async (slug) => {
  const program = await getProgramBySlug(slug);

  if (!program) {
    throw new AppError("Published program not found.", 404);
  }

  return program;
};

// ============================================================
// SEARCH PROGRAMS
// ============================================================

export const searchProgramsService = async (searchTerm) => {
  if (!searchTerm || typeof searchTerm !== "string" || !searchTerm.trim()) {
    throw new AppError("Search term is required.", 400);
  }

  return await searchPrograms(searchTerm.trim());
};

// ============================================================
// GET PROGRAMS BY CATEGORY
// ============================================================

export const getProgramsByCategoryService = async (categoryId) => {
  const category = await getProgramCategoryById(categoryId);

  if (!category) {
    throw new AppError("Program category not found.", 404);
  }

  return await getProgramsByCategory(categoryId);
};

// ============================================================
// GET FEATURED PROGRAMS
// ============================================================

export const getFeaturedProgramsService = async () => {
  return await getFeaturedPrograms();
};

// ============================================================
// UPDATE PROGRAM
// ============================================================

export const updateProgramService = async (id, data, user) => {
  const existingProgram = await getProgramById(id);

  if (!existingProgram) {
    throw new AppError("Program not found.", 404);
  }

  if (!user?.id) {
    throw new AppError("Authentication is required.", 401);
  }

  const role =
    typeof user.role === "string"
      ? user.role.toLowerCase()
      : user.role?.name?.toLowerCase();

  const canPublish =
    ["admin", "owner", "super_admin"].includes(role) ||
    user.permissions?.includes("programs:publish");

  // Do not allow unauthorized users to change publication status
  // or featured status through an update request.
  if (
    data.status !== undefined &&
    !["draft", "published", "archived"].includes(data.status)
  ) {
    throw new AppError("Invalid program status.", 400);
  }

  if (data.status === "published" && !canPublish) {
    throw new AppError("You do not have permission to publish programs.", 403);
  }

  if (data.featured !== undefined && !canPublish) {
    throw new AppError(
      "You do not have permission to change featured status.",
      403,
    );
  }

  if (data.status === "published") {
    const summary = data.summary ?? existingProgram.summary;
    const instructor = data.instructor ?? existingProgram.instructor;
    const programTitle = data.title ?? existingProgram.title;

    if (!programTitle?.trim() || !summary?.trim() || !instructor?.trim()) {
      throw new AppError(
        "A title, summary, and instructor are required before publishing.",
        400,
      );
    }
  }

  const client = await pool.connect();
  let transactionStarted = false;

  try {
    await client.query("BEGIN");
    transactionStarted = true;

    const programData = {};

    // Map only the fields the frontend actually supplied.
    if (data.title !== undefined) {
      if (typeof data.title !== "string" || !data.title.trim()) {
        throw new AppError("Program title cannot be empty.", 400);
      }

      programData.title = data.title.trim();
    }

    if (data.slug !== undefined) programData.slug = data.slug;
    if (data.level !== undefined) programData.level = data.level;

    if (data.ageGroup !== undefined || data.age_group !== undefined) {
      programData.age_group = data.ageGroup ?? data.age_group;
    }

    if (data.mode !== undefined) programData.mode = data.mode;

    if (data.durationWeeks !== undefined || data.duration_weeks !== undefined) {
      programData.duration_weeks = data.durationWeeks ?? data.duration_weeks;
    }

    if (
      data.sessionsPerWeek !== undefined ||
      data.sessions_per_week !== undefined
    ) {
      programData.sessions_per_week =
        data.sessionsPerWeek ?? data.sessions_per_week;
    }

    if (
      data.sessionMinutes !== undefined ||
      data.session_minutes !== undefined
    ) {
      programData.session_minutes = data.sessionMinutes ?? data.session_minutes;
    }

    if (data.capacity !== undefined) {
      programData.capacity = data.capacity;
    }

    if (data.price !== undefined) programData.price = data.price;
    if (data.instructor !== undefined) {
      programData.instructor = data.instructor;
    }

    if (data.startDate !== undefined || data.start_date !== undefined) {
      programData.start_date = data.startDate ?? data.start_date;
    }

    if (data.schedule !== undefined) {
      programData.schedule = data.schedule;
    }

    if (data.displayOrder !== undefined || data.display_order !== undefined) {
      programData.display_order = data.displayOrder ?? data.display_order;
    }

    if (data.summary !== undefined) {
      programData.summary = data.summary;
    }

    if (data.description !== undefined) {
      programData.description = data.description;
    }

    if (data.outcomes !== undefined) {
      programData.outcomes = data.outcomes;
    }

    if (data.prerequisites !== undefined) {
      programData.prerequisites = data.prerequisites;
    }

    if (data.requirements !== undefined) {
      programData.requirements = data.requirements;
    }

    if (data.tools !== undefined) {
      programData.tools = data.tools;
    }

    if (data.thumbnail !== undefined) {
      programData.thumbnail = data.thumbnail;
    }

    if (data.status !== undefined) {
      programData.status = data.status;
    }

    if (data.featured !== undefined) {
      programData.featured = data.featured;
    }

    // Resolve the category only if category information was supplied.
    const hasCategoryInput =
      data.categoryId !== undefined ||
      data.category_id !== undefined ||
      data.category !== undefined ||
      data.categoryName !== undefined ||
      data.newCategoryName !== undefined ||
      data.isNewCategory !== undefined;

    if (hasCategoryInput) {
      let category_id = data.categoryId ?? data.category_id ?? null;

      if (data.isNewCategory) {
        const name = data.newCategoryName || data.categoryName || data.category;

        if (!name || typeof name !== "string" || !name.trim()) {
          throw new AppError("New category name is required.", 400);
        }

        const existingCategory = await client.query(
          `SELECT id
           FROM program_categories
           WHERE LOWER(name) = LOWER($1)
           LIMIT 1`,
          [name.trim()],
        );

        if (existingCategory.rows.length > 0) {
          category_id = existingCategory.rows[0].id;
        } else {
          const newCategory = await createProgramCategory(client, {
            name: name.trim(),
            description: data.categoryDescription ?? null,
          });

          category_id = newCategory.id;
        }
      } else if (category_id) {
        const existingCategory = await client.query(
          `SELECT id
           FROM program_categories
           WHERE id = $1`,
          [category_id],
        );

        if (existingCategory.rows.length === 0) {
          throw new AppError("Selected program category was not found.", 404);
        }
      } else {
        const categoryName =
          typeof data.category === "string" ? data.category : data.categoryName;

        if (typeof categoryName === "string" && categoryName.trim()) {
          const existingCategory = await client.query(
            `SELECT id
             FROM program_categories
             WHERE LOWER(name) = LOWER($1)
             LIMIT 1`,
            [categoryName.trim()],
          );

          if (existingCategory.rows.length === 0) {
            throw new AppError("Selected program category was not found.", 404);
          }

          category_id = existingCategory.rows[0].id;
        } else {
          throw new AppError("A program category is required.", 400);
        }
      }

      programData.category_id = category_id;
    }

    // The generated code and creator cannot be changed via this request.
    delete programData.code;
    delete programData.created_by;
    delete programData.category_code;

    const updatedProgram = await updateProgram(client, id, programData);

    if (!updatedProgram) {
      throw new AppError("Program not found.", 404);
    }

    await client.query("COMMIT");
    transactionStarted = false;

    return updatedProgram;
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
// PUBLISH PROGRAM
// ============================================================

export const publishProgramService = async (id, user) => {
  if (!user?.id) {
    throw new AppError("Authentication is required.", 401);
  }

  const role =
    typeof user.role === "string"
      ? user.role.toLowerCase()
      : user.role?.name?.toLowerCase();

  const canPublish =
    ["admin", "owner", "super_admin"].includes(role) ||
    user.permissions?.includes("programs:publish");

  if (!canPublish) {
    throw new AppError("You do not have permission to publish programs.", 403);
  }

  const existingProgram = await getProgramById(id);

  if (!existingProgram) {
    throw new AppError("Program not found.", 404);
  }

  if (
    !existingProgram.title?.trim() ||
    !existingProgram.summary?.trim() ||
    !existingProgram.instructor?.trim()
  ) {
    throw new AppError(
      "A title, summary, and instructor are required before publishing.",
      400,
    );
  }

  const client = await pool.connect();

  try {
    return await publishProgram(client, id);
  } finally {
    client.release();
  }
};

// ============================================================
// ARCHIVE PROGRAM
// ============================================================

export const archiveProgramService = async (id, user) => {
  if (!user?.id) {
    throw new AppError("Authentication is required.", 401);
  }

  const role =
    typeof user.role === "string"
      ? user.role.toLowerCase()
      : user.role?.name?.toLowerCase();

  if (!["admin", "owner", "super_admin"].includes(role)) {
    throw new AppError("You do not have permission to archive programs.", 403);
  }

  const existingProgram = await getProgramById(id);

  if (!existingProgram) {
    throw new AppError("Program not found.", 404);
  }

  const client = await pool.connect();

  try {
    return await archiveProgram(client, id);
  } finally {
    client.release();
  }
};

// ============================================================
// DELETE PROGRAM
// ============================================================

export const deleteProgramService = async (id, user) => {
  if (!user?.id) {
    throw new AppError("Authentication is required.", 401);
  }

  const role =
    typeof user.role === "string"
      ? user.role.toLowerCase()
      : user.role?.name?.toLowerCase();

  if (!["admin", "owner", "super_admin"].includes(role)) {
    throw new AppError("You do not have permission to delete programs.", 403);
  }

  const existingProgram = await getProgramById(id);

  if (!existingProgram) {
    throw new AppError("Program not found.", 404);
  }

  const client = await pool.connect();

  try {
    return await deleteProgram(client, id);
  } finally {
    client.release();
  }
};

// ============================================================
// CREATE CATEGORY
// ============================================================

export const createProgramCategoryService = async (data) => {
  const { name, description } = data;

  if (!name || typeof name !== "string" || !name.trim()) {
    throw new AppError("Category name is required.", 400);
  }

  const client = await pool.connect();

  try {
    const existingCategory = await client.query(
      `SELECT id
       FROM program_categories
       WHERE LOWER(name) = LOWER($1)
       LIMIT 1`,
      [name.trim()],
    );

    if (existingCategory.rows.length > 0) {
      throw new AppError("A category with this name already exists.", 409);
    }

    return await createProgramCategory(client, {
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

export const getAllProgramCategoriesService = async () => {
  return await getAllProgramCategories();
};

// ============================================================
// GET CATEGORY BY ID
// ============================================================

export const getProgramCategoryByIdService = async (id) => {
  const category = await getProgramCategoryById(id);

  if (!category) {
    throw new AppError("Program category not found.", 404);
  }

  return category;
};

// ============================================================
// UPDATE CATEGORY
// ============================================================

export const updateProgramCategoryService = async (id, data) => {
  const existingCategory = await getProgramCategoryById(id);

  if (!existingCategory) {
    throw new AppError("Program category not found.", 404);
  }

  const categoryData = {};

  if (data.name !== undefined) {
    if (typeof data.name !== "string" || !data.name.trim()) {
      throw new AppError("Category name cannot be empty.", 400);
    }

    const duplicateCategory = await pool.query(
      `SELECT id
       FROM program_categories
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

  // Category codes are generated once and remain unchanged.
  delete categoryData.category_code;
  delete categoryData.categoryCode;

  return await updateProgramCategory(id, categoryData);
};

// ============================================================
// DELETE CATEGORY
// ============================================================

export const deleteProgramCategoryService = async (id) => {
  const existingCategory = await getProgramCategoryById(id);

  if (!existingCategory) {
    throw new AppError("Program category not found.", 404);
  }

  return await deleteProgramCategory(id);
};
