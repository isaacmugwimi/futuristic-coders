import { Router } from "express";
import rateLimit from "express-rate-limit"; // npm i express-rate-limit

import {
  submitRegistration,
  getAllRegistrations,
  approveRegistration,
  rejectRegistration,
} from "../../controller/students/registration.controller.js";

import {
  authenticateUser,
  authorizeRoles,
} from "../../middleware/auth/auth.middleware.js";

import { validate } from "../../middleware/validate.middleware.js";

import {
  submitRegistrationSchema,
  approveRegistrationSchema,
  rejectRegistrationSchema,
  registrationIdParamsSchema,
  getRegistrationsQuerySchema,
} from "../../middleware/validators/students/registration.validator.js";

const router = Router();

// Mounted at /api/registrations, for example:
//   app.use("/api/registrations", registrationRoutes);

// Public form: limit each IP to 5 submissions per hour.
const registrationLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many attempts. Please try again later.",
  },
});

// ======================================
// PUBLIC ROUTES
// ======================================

// Submit a registration from the public website (no login)
// Saved as "pending" until an admin approves it
router.post(
  "/submit-registration",
  registrationLimiter,
  validate(submitRegistrationSchema),
  submitRegistration,
);

// ======================================
// ADMIN ROUTES
// ======================================

// Get registration requests — admin only
// Example: GET /get-all-registrations?status=pending&search=amina
router.get(
  "/get-all-registrations",
  authenticateUser,
  authorizeRoles("admin"),
  validate(getRegistrationsQuerySchema, "query"),
  getAllRegistrations,
);

// Approve a request (:id = registration ID) — admin only
// Creates the student and enrolls them in the chosen program
router.patch(
  "/approve-registration/:id",
  authenticateUser,
  authorizeRoles("admin"),
  validate(registrationIdParamsSchema, "params"),
  validate(approveRegistrationSchema),
  approveRegistration,
);

// Reject a request (:id = registration ID) — admin only
router.patch(
  "/reject-registration/:id",
  authenticateUser,
  authorizeRoles("admin"),
  validate(registrationIdParamsSchema, "params"),
  validate(rejectRegistrationSchema),
  rejectRegistration,
);

export default router;