import {
  createTestimonial,
  getPublishedTestimonials,
  getPublishedTestimonialStats,
  getFeaturedTestimonials,
  getAllTestimonials,
  getTestimonialCountsByStatus,
  getTestimonialById,
  updateTestimonial,
  approveTestimonial,
  publishTestimonial,
  rejectTestimonial,
  archiveTestimonial,
  setTestimonialFeatured,
  countRecentTestimonialsByEmail,
  deleteTestimonial,
} from "../../database/models/testimonial/testimonial.model.js";

import AppError from "../../middleware/error/AppError.js";
import { pool } from "../../database/config/config.db.js";

// ============================================================
// HELPERS
// ============================================================

const RELATIONSHIPS = ["Parent", "Student", "Alumni"];
const REVIEW_STATUSES = [
  "pending",
  "approved",
  "published",
  "rejected",
  "archived",
];

const MAX_SUBMISSIONS_PER_DAY = 3;

const EMAIL_REGEX = /^\S+@\S+\.\S+$/;

const getRole = (user) =>
  typeof user?.role === "string"
    ? user.role.toLowerCase()
    : user?.role?.name?.toLowerCase();

// Same rule your program service uses for publishing.
const canModerate = (user) =>
  ["admin", "owner", "super_admin"].includes(getRole(user)) ||
  Boolean(user?.permissions?.includes("testimonials:moderate"));

const requireModerator = (user, action) => {
  if (!user?.userId) {
    throw new AppError("Authentication is required.", 401);
  }

  if (!canModerate(user)) {
    throw new AppError(
      `You do not have permission to ${action} testimonials.`,
      403,
    );
  }
};

const validateMessage = (message) => {
  if (typeof message !== "string" || !message.trim()) {
    throw new AppError("A review message is required.", 400);
  }

  const length = message.trim().length;

  if (length < 20) {
    throw new AppError("Your review must be at least 20 characters.", 400);
  }

  if (length > 600) {
    throw new AppError("Your review must be 600 characters or fewer.", 400);
  }
};

// ============================================================
// CREATE TESTIMONIAL (public form submission)
// ============================================================

// Returns the saved review, or null when the honeypot caught a bot.
// The controller should respond with the same success message either way,
// so bots can't tell they were filtered.
export const createTestimonialService = async (data) => {
  const { name, email, relationship, rating, message, website } = data;

  // Honeypot: real visitors never see or fill this field.
  if (website) {
    return null;
  }

  if (!name || typeof name !== "string" || name.trim().length < 2) {
    throw new AppError("Please enter your name.", 400);
  }

  if (name.trim().length > 100) {
    throw new AppError("Your name must be 100 characters or fewer.", 400);
  }

  if (
    !email ||
    typeof email !== "string" ||
    !EMAIL_REGEX.test(email.trim()) ||
    email.trim().length > 255
  ) {
    throw new AppError("Please enter a valid email address.", 400);
  }

  if (relationship !== undefined && !RELATIONSHIPS.includes(relationship)) {
    throw new AppError("Invalid relationship.", 400);
  }

  const numericRating = Number(rating);

  if (
    !Number.isInteger(numericRating) ||
    numericRating < 1 ||
    numericRating > 5
  ) {
    throw new AppError("Rating must be a whole number from 1 to 5.", 400);
  }

  validateMessage(message);

  const recent = await countRecentTestimonialsByEmail(email, 24);

  if (recent >= MAX_SUBMISSIONS_PER_DAY) {
    throw new AppError(
      "You have submitted several reviews recently. Please try again tomorrow.",
      429,
    );
  }

  const client = await pool.connect();

  try {
    return await createTestimonial(client, {
      name,
      email,
      relationship: relationship ?? "Parent",
      rating: numericRating,
      message,
    });
  } finally {
    client.release();
  }
};

// ============================================================
// GET PUBLISHED TESTIMONIALS (public website)
// Returns { data, total, stats } to match the frontend hook.
// ============================================================

export const getPublishedTestimonialsService = async (params = {}) => {
  const page = Math.max(parseInt(params.page, 10) || 1, 1);
  const limit = Math.min(Math.max(parseInt(params.limit, 10) || 6, 1), 50);
  const rating = parseInt(params.rating, 10) || 0;
  const sort = typeof params.sort === "string" ? params.sort : "newest";

  const [{ data, total }, stats] = await Promise.all([
    getPublishedTestimonials({ page, limit, rating, sort }),
    getPublishedTestimonialStats(),
  ]);

  return { data, total, stats };
};

// ============================================================
// GET FEATURED TESTIMONIALS
// ============================================================

export const getFeaturedTestimonialsService = async (limit) => {
  return await getFeaturedTestimonials(parseInt(limit, 10) || 3);
};

// ============================================================
// GET ALL TESTIMONIALS (admin panel)
// ============================================================

export const getAllTestimonialsService = async (filters = {}, user) => {
  requireModerator(user, "view");

  if (filters.status && !REVIEW_STATUSES.includes(filters.status)) {
    throw new AppError("Invalid testimonial status.", 400);
  }

  return await getAllTestimonials({
    status: filters.status,
    rating: filters.rating,
    search: filters.search,
  });
};

// ============================================================
// GET COUNTS BY STATUS (admin tab badges)
// ============================================================

export const getTestimonialCountsService = async (user) => {
  requireModerator(user, "view");

  return await getTestimonialCountsByStatus();
};

// ============================================================
// GET TESTIMONIAL BY ID
// ============================================================

export const getTestimonialByIdService = async (id, user) => {
  requireModerator(user, "view");

  const testimonial = await getTestimonialById(id);

  if (!testimonial) {
    throw new AppError("Testimonial not found.", 404);
  }

  return testimonial;
};

// ============================================================
// UPDATE TESTIMONIAL (fix typos, notes, featured)
// ============================================================

export const updateTestimonialService = async (id, data, user) => {
  requireModerator(user, "edit");

  const existing = await getTestimonialById(id);

  if (!existing) {
    throw new AppError("Testimonial not found.", 404);
  }

  const testimonialData = {};

  if (data.message !== undefined) {
    validateMessage(data.message);
    testimonialData.message = data.message;
  }

  if (data.adminNotes !== undefined || data.admin_notes !== undefined) {
    testimonialData.admin_notes = data.adminNotes ?? data.admin_notes;
  }

  if (data.featured !== undefined) {
    if (typeof data.featured !== "boolean") {
      throw new AppError("Featured must be true or false.", 400);
    }

    if (data.featured && existing.status !== "published") {
      throw new AppError("Only published testimonials can be featured.", 409);
    }

    testimonialData.featured = data.featured;
  }

  // Rating, name, email and status are intentionally not editable here.
  const client = await pool.connect();

  try {
    return await updateTestimonial(client, id, testimonialData);
  } finally {
    client.release();
  }
};

// ============================================================
// APPROVE TESTIMONIAL
// ============================================================

export const approveTestimonialService = async (id, user) => {
  requireModerator(user, "approve");

  const existing = await getTestimonialById(id);

  if (!existing) {
    throw new AppError("Testimonial not found.", 404);
  }

  const client = await pool.connect();

  try {
    const approved = await approveTestimonial(client, id, user.userId);

    if (!approved) {
      throw new AppError(
        `A ${existing.status} testimonial cannot be approved.`,
        409,
      );
    }

    return approved;
  } finally {
    client.release();
  }
};

// ============================================================
// PUBLISH TESTIMONIAL
// ============================================================

export const publishTestimonialService = async (id, user) => {
  requireModerator(user, "publish");

  const existing = await getTestimonialById(id);

  if (!existing) {
    throw new AppError("Testimonial not found.", 404);
  }

  if (existing.status === "rejected") {
    throw new AppError(
      "A rejected testimonial must be approved before it can be published.",
      409,
    );
  }

  if (existing.status === "published") {
    throw new AppError("This testimonial is already published.", 409);
  }

  if (!existing.name?.trim() || !existing.message?.trim()) {
    throw new AppError(
      "A name and message are required before publishing.",
      400,
    );
  }

  const client = await pool.connect();

  try {
    const published = await publishTestimonial(client, id, user.userId);

    if (!published) {
      throw new AppError("This testimonial cannot be published.", 409);
    }

    return published;
  } finally {
    client.release();
  }
};

// ============================================================
// REJECT TESTIMONIAL
// ============================================================

export const rejectTestimonialService = async (id, data = {}, user) => {
  requireModerator(user, "reject");

  const existing = await getTestimonialById(id);

  if (!existing) {
    throw new AppError("Testimonial not found.", 404);
  }

  const adminNotes = data.adminNotes ?? data.admin_notes ?? null;

  if (adminNotes !== null && typeof adminNotes !== "string") {
    throw new AppError("Admin notes must be text.", 400);
  }

  const client = await pool.connect();

  try {
    const rejected = await rejectTestimonial(
      client,
      id,
      user.userId,
      adminNotes,
    );

    if (!rejected) {
      throw new AppError(
        `A ${existing.status} testimonial cannot be rejected. Archive it instead.`,
        409,
      );
    }

    return rejected;
  } finally {
    client.release();
  }
};

// ============================================================
// ARCHIVE TESTIMONIAL (unpublish without deleting)
// ============================================================

export const archiveTestimonialService = async (id, user) => {
  requireModerator(user, "archive");

  const existing = await getTestimonialById(id);

  if (!existing) {
    throw new AppError("Testimonial not found.", 404);
  }

  const client = await pool.connect();

  try {
    const archived = await archiveTestimonial(client, id);

    if (!archived) {
      throw new AppError("Only published testimonials can be archived.", 409);
    }

    return archived;
  } finally {
    client.release();
  }
};

// ============================================================
// SET FEATURED
// ============================================================

export const setTestimonialFeaturedService = async (id, featured, user) => {
  requireModerator(user, "feature");

  if (typeof featured !== "boolean") {
    throw new AppError("Featured must be true or false.", 400);
  }

  const existing = await getTestimonialById(id);

  if (!existing) {
    throw new AppError("Testimonial not found.", 404);
  }

  const client = await pool.connect();

  try {
    const updated = await setTestimonialFeatured(client, id, featured);

    if (!updated) {
      throw new AppError("Only published testimonials can be featured.", 409);
    }

    return updated;
  } finally {
    client.release();
  }
};

// ============================================================
// DELETE TESTIMONIAL
// ============================================================

export const deleteTestimonialService = async (id, user) => {
  if (!user?.userId) {
    throw new AppError("Authentication is required.", 401);
  }

  // Deleting is stricter than moderating: admin roles only, as with programs.
  if (!["admin", "owner", "super_admin"].includes(getRole(user))) {
    throw new AppError(
      "You do not have permission to delete testimonials.",
      403,
    );
  }

  const existing = await getTestimonialById(id);

  if (!existing) {
    throw new AppError("Testimonial not found.", 404);
  }

  const client = await pool.connect();

  try {
    return await deleteTestimonial(client, id);
  } finally {
    client.release();
  }
};
