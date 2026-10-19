import asyncHandler from "../../middleware/error/asyncHandler.js";
// import { createTestimonialService } from "../../services/testimonials/testimonial.service.js";
import * as testimonialService from "../../services/testimonials/testimonial.service.js";
// 
// ============================================================
// CREATE TESTIMONIAL (public form submission)
// POST /api/testimonials
// ============================================================

export const createTestimonial = asyncHandler(async (req, res) => {
  // The service returns null when the honeypot caught a bot.
  // We send the same success response either way so bots can't tell.
  await testimonialService.createTestimonialService(req.body);

  return res.status(201).json({
    success: true,
    message: "Thanks! Your review will appear once our team approves it.",
  });
});

// ============================================================
// GET PUBLISHED TESTIMONIALS (public website)
// GET /api/testimonials?page=1&limit=6&rating=0&sort=newest
// Response shape matches the frontend hook: { data, total, stats }
// ============================================================

export const getPublishedTestimonials = asyncHandler(async (req, res) => {
  const { data, total, stats } =
    await testimonialService.getPublishedTestimonialsService(req.query);

  return res.status(200).json({
    success: true,
    count: data.length,
    total,
    stats,
    data,
  });
});

// ============================================================
// GET FEATURED TESTIMONIALS
// GET /api/testimonials/featured?limit=3
// ============================================================

export const getFeaturedTestimonials = asyncHandler(async (req, res) => {
  const testimonials = await testimonialService.getFeaturedTestimonialsService(
    req.query.limit,
  );

  return res.status(200).json({
    success: true,
    count: testimonials.length,
    data: testimonials,
  });
});

// ============================================================
// GET ALL TESTIMONIALS (admin panel)
// GET /api/testimonials/admin?status=pending&rating=5&search=grace
// ============================================================

export const getAllTestimonials = asyncHandler(async (req, res) => {
  const testimonials = await testimonialService.getAllTestimonialsService(
    req.query,
    req.user,
  );

  return res.status(200).json({
    success: true,
    count: testimonials.length,
    data: testimonials,
  });
});

// ============================================================
// GET TESTIMONIAL COUNTS BY STATUS (admin tab badges)
// GET /api/testimonials/admin/counts
// ============================================================

export const getTestimonialCounts = asyncHandler(async (req, res) => {
  const counts = await testimonialService.getTestimonialCountsService(req.user);

  return res.status(200).json({
    success: true,
    data: counts,
  });
});

// ============================================================
// GET TESTIMONIAL BY ID (admin panel)
// GET /api/testimonials/admin/:id
// ============================================================

export const getTestimonialById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const testimonial = await testimonialService.getTestimonialByIdService(
    id,
    req.user,
  );

  return res.status(200).json({
    success: true,
    data: testimonial,
  });
});

// ============================================================
// UPDATE TESTIMONIAL
// PATCH /api/testimonials/:id
// ============================================================

export const updateTestimonial = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const testimonial = await testimonialService.updateTestimonialService(
    id,
    req.body,
    req.user,
  );

  return res.status(200).json({
    success: true,
    message: "Testimonial updated successfully.",
    data: testimonial,
  });
});

// ============================================================
// APPROVE TESTIMONIAL
// PATCH /api/testimonials/:id/approve
// ============================================================

export const approveTestimonial = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const testimonial = await testimonialService.approveTestimonialService(
    id,
    req.user,
  );

  return res.status(200).json({
    success: true,
    message: "Testimonial approved successfully.",
    data: testimonial,
  });
});

// ============================================================
// PUBLISH TESTIMONIAL
// PATCH /api/testimonials/:id/publish
// ============================================================

export const publishTestimonial = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const testimonial = await testimonialService.publishTestimonialService(
    id,
    req.user,
  );

  return res.status(200).json({
    success: true,
    message: "Testimonial published successfully.",
    data: testimonial,
  });
});

// ============================================================
// REJECT TESTIMONIAL
// PATCH /api/testimonials/:id/reject
// Body (optional): { "adminNotes": "Looks like spam" }
// ============================================================

export const rejectTestimonial = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const testimonial = await testimonialService.rejectTestimonialService(
    id,
    req.body,
    req.user,
  );

  return res.status(200).json({
    success: true,
    message: "Testimonial rejected successfully.",
    data: testimonial,
  });
});

// ============================================================
// ARCHIVE TESTIMONIAL
// PATCH /api/testimonials/:id/archive
// ============================================================

export const archiveTestimonial = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const testimonial = await testimonialService.archiveTestimonialService(
    id,
    req.user,
  );

  return res.status(200).json({
    success: true,
    message: "Testimonial archived successfully.",
    data: testimonial,
  });
});

// ============================================================
// SET TESTIMONIAL FEATURED
// PATCH /api/testimonials/:id/featured
// Body: { "featured": true }
// ============================================================

export const setTestimonialFeatured = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const testimonial = await testimonialService.setTestimonialFeaturedService(
    id,
    req.body.featured,
    req.user,
  );

  return res.status(200).json({
    success: true,
    message: testimonial.featured
      ? "Testimonial featured successfully."
      : "Testimonial removed from featured.",
    data: testimonial,
  });
});

// ============================================================
// DELETE TESTIMONIAL
// DELETE /api/testimonials/:id
// ============================================================

export const deleteTestimonial = asyncHandler(async (req, res) => {
  const { id } = req.params;

  await testimonialService.deleteTestimonialService(id, req.user);

  return res.status(200).json({
    success: true,
    message: "Testimonial deleted successfully.",
  });
});