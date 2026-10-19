import { Router } from "express";
import rateLimit from "express-rate-limit";

import {
  createTestimonial,
  getPublishedTestimonials,
  getFeaturedTestimonials,
  getAllTestimonials,
  getTestimonialCounts,
  getTestimonialById,
  updateTestimonial,
  approveTestimonial,
  publishTestimonial,
  rejectTestimonial,
  archiveTestimonial,
  setTestimonialFeatured,
  deleteTestimonial,
} from "../../controller/testimonial/testimonial.controller.js";

import {
  authenticateUser,
  authorizeRoles,
} from "../../middleware/auth/auth.middleware.js";

import { validate } from "../../middleware/validate.middleware.js";

import {
  createTestimonialSchema,
  updateTestimonialSchema,
  rejectTestimonialSchema,
  setTestimonialFeaturedSchema,
  testimonialIdParamsSchema,
  publishedTestimonialsQuerySchema,
  featuredTestimonialsQuerySchema,
  adminTestimonialsQuerySchema,
} from "../../middleware/validators/testimonial/testimonial.validation.js";

const router = Router();

// ======================================
// RATE LIMITER (public submissions)
// 5 reviews per hour per IP. The service also caps 3 per email per day.
// If the API sits behind a proxy (Render, Railway, Nginx), set
// app.set("trust proxy", 1) so the limiter sees the real visitor IP.
// ======================================

const submitTestimonialLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many reviews submitted. Please try again later.",
  },
});

// ======================================
// PUBLIC TESTIMONIAL ROUTES
// ======================================

// Submit a review from the website form (saved as pending)
router.post(
  "/submit-testimonial",
  submitTestimonialLimiter,
  validate(createTestimonialSchema),
  createTestimonial,
);

// Get published testimonials (paged, filterable, with stats)
router.get(
  "/get-published-testimonials",
  validate(publishedTestimonialsQuerySchema, "query"),
  getPublishedTestimonials,
);

// Get featured testimonials
router.get(
  "/get-featured-testimonials",
  validate(featuredTestimonialsQuerySchema, "query"),
  getFeaturedTestimonials,
);

// ======================================
// TESTIMONIAL ADMIN ROUTES
// ======================================

// Get all testimonials (filter by status, rating, search) — admin only
router.get(
  "/get-all-testimonials",
  authenticateUser,
  authorizeRoles("admin"),
  validate(adminTestimonialsQuerySchema, "query"),
  getAllTestimonials,
);

// Get testimonial counts per status (tab badges) — admin only
router.get(
  "/get-testimonial-counts",
  authenticateUser,
  authorizeRoles("admin"),
  getTestimonialCounts,
);

// Get testimonial by ID — admin only
router.get(
  "/get-testimonial-by-id/:id",
  authenticateUser,
  authorizeRoles("admin"),
  validate(testimonialIdParamsSchema, "params"),
  getTestimonialById,
);

// ======================================
// TESTIMONIAL MODERATION
// ======================================

// Update testimonial (fix typos, notes) — admin only
router.patch(
  "/update-testimonial/:id",
  authenticateUser,
  authorizeRoles("admin"),
  validate(testimonialIdParamsSchema, "params"),
  validate(updateTestimonialSchema),
  updateTestimonial,
);

// Approve testimonial — admin only
router.patch(
  "/approve-testimonial/:id",
  authenticateUser,
  authorizeRoles("admin"),
  validate(testimonialIdParamsSchema, "params"),
  approveTestimonial,
);

// Publish testimonial — admin only
router.patch(
  "/publish-testimonial/:id",
  authenticateUser,
  authorizeRoles("admin"),
  validate(testimonialIdParamsSchema, "params"),
  publishTestimonial,
);

// Reject testimonial — admin only
router.patch(
  "/reject-testimonial/:id",
  authenticateUser,
  authorizeRoles("admin"),
  validate(testimonialIdParamsSchema, "params"),
  validate(rejectTestimonialSchema),
  rejectTestimonial,
);

// Archive testimonial — admin only
router.patch(
  "/archive-testimonial/:id",
  authenticateUser,
  authorizeRoles("admin"),
  validate(testimonialIdParamsSchema, "params"),
  archiveTestimonial,
);

// Feature or unfeature testimonial — admin only
router.patch(
  "/feature-testimonial/:id",
  authenticateUser,
  authorizeRoles("admin"),
  validate(testimonialIdParamsSchema, "params"),
  validate(setTestimonialFeaturedSchema),
  setTestimonialFeatured,
);

// Delete testimonial — admin only
router.delete(
  "/delete-testimonial/:id",
  authenticateUser,
  authorizeRoles("admin"),
  validate(testimonialIdParamsSchema, "params"),
  deleteTestimonial,
);

export default router;