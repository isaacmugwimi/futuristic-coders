import asyncHandler from "../../middleware/error/asyncHandler.js";
import * as registrationService from "../../services/students/registration.service.js";

// Same helper as the student controller: services read user.userId.
const getUser = (req) => ({
  ...req.user,
  id: req.user?.id ?? req.user?.userId,
  userId: req.user?.userId ?? req.user?.id,
});

// ============================================================
// SUBMIT REGISTRATION (public, no login)
// POST /api/registrations/submit-registration
// ============================================================

export const submitRegistration = asyncHandler(async (req, res) => {
  await registrationService.submitRegistrationService(req.body);

  return res.status(201).json({
    success: true,
    message:
      "Registration received. We will contact you once it has been confirmed.",
  });
});

// ============================================================
// GET ALL REGISTRATION REQUESTS
// GET /api/registrations/get-all-registrations?status=&search=
// ============================================================

export const getAllRegistrations = asyncHandler(async (req, res) => {
  const { requests, counts } =
    await registrationService.getRegistrationRequestsService(req.query);

  return res.status(200).json({
    success: true,
    count: requests.length,
    counts,
    data: requests,
  });
});

// ============================================================
// APPROVE REGISTRATION
// PATCH /api/registrations/approve-registration/:id
// Body (optional): { "agreedFee": 5000, "enrolledOn": "2026-11-10" }
// Creates the student (or reuses a match) and enrolls them.
// ============================================================

export const approveRegistration = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const student = await registrationService.approveRegistrationService(
    id,
    req.body ?? {},
    getUser(req),
  );

  return res.status(200).json({
    success: true,
    message: "Registration approved. The student has been enrolled.",
    data: student,
  });
});

// ============================================================
// REJECT REGISTRATION
// PATCH /api/registrations/reject-registration/:id
// Body (optional): { "reason": "Program is full" }
// ============================================================

export const rejectRegistration = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const registration = await registrationService.rejectRegistrationService(
    id,
    req.body ?? {},
    getUser(req),
  );

  return res.status(200).json({
    success: true,
    message: "Registration rejected.",
    data: registration,
  });
});