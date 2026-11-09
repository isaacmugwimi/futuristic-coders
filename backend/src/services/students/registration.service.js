import {
  createStudent,
  createEnrollment,
  getStudentById,
} from "../../database/models/students/student.model.js";

import {
  createRegistrationRequest,
  findPendingRegistration,
  getAllRegistrationRequests,
  getRegistrationCounts,
  rejectRegistrationRequest,
} from "../../database/models/students/registration.model.js";

import {
  EMAIL_REGEX,
  field,
  normalizeFilter,
  requireUser,
  assertUuid,
  cleanText,
  normalizePhone,
  withTransaction,
  assertProgramAcceptsEnrollment,
  assertNoOpenEnrollment,
  parseEnrollmentInput,
} from "./students.service.js";

import AppError from "../../middleware/error/AppError.js";
import { pool } from "../../database/config/config.db.js";

const REGISTRATION_STATUSES = ["pending", "approved", "rejected"];

// ============================================================
// SUBMIT (PUBLIC, no login)
// ============================================================

export const submitRegistrationService = async (data = {}) => {
  // Honeypot: real visitors never see or fill this hidden field.
  if (data.website) return { received: true };

  const full_name = cleanText(
    field(data, "fullName", "full_name"),
    "Full name",
    { required: true, max: 150 },
  );

  const email = cleanText(data.email, "Email", { max: 255 }) ?? null;
  if (email && !EMAIL_REGEX.test(email)) {
    throw new AppError("Email address is not valid.", 400);
  }

  const phone = normalizePhone(data.phone, "Phone") ?? null;
  const guardian_phone =
    normalizePhone(
      field(data, "guardianPhone", "guardian_phone"),
      "Guardian phone",
    ) ?? null;

  if (!phone && !guardian_phone && !email) {
    throw new AppError(
      "Please give a phone number or email we can reach you on.",
      400,
    );
  }

  const program_id = field(data, "programId", "program_id");
  if (!program_id) throw new AppError("Please choose a program.", 400);
  assertUuid(program_id, "program ID");

  const program = await pool.query(
    `SELECT status FROM programs WHERE id = $1`,
    [program_id],
  );
  if (program.rows[0]?.status !== "published") {
    throw new AppError("This program is not open for registration.", 400);
  }

  const request = {
    full_name,
    email,
    phone,
    guardian_phone,
    program_id,
    guardian_name:
      cleanText(field(data, "guardianName", "guardian_name"), "Guardian name", {
        max: 150,
      }) ?? null,
    age_group:
      cleanText(field(data, "ageGroup", "age_group"), "Age group", {
        max: 30,
      }) ?? null,
    county: cleanText(data.county, "County", { max: 100 }) ?? null,
    notes: cleanText(data.notes, "Notes", { max: 1000 }) ?? null,
  };

  if (await findPendingRegistration(request)) {
    throw new AppError(
      "We already received this registration. We will contact you soon.",
      409,
    );
  }

  await createRegistrationRequest(request);
  return { received: true };
};

// ============================================================
// LIST (ADMIN)
// ============================================================

export const getRegistrationRequestsService = async (filters = {}) => {
  const status = normalizeFilter(filters.status);

  if (status && !REGISTRATION_STATUSES.includes(status)) {
    throw new AppError("Invalid status filter.", 400);
  }

  const [requests, counts] = await Promise.all([
    getAllRegistrationRequests({
      status,
      search: typeof filters.search === "string" ? filters.search : undefined,
    }),
    getRegistrationCounts(),
  ]);

  return { requests, counts };
};

// ============================================================
// APPROVE (ADMIN): create the student, enroll, mark approved
// ============================================================

export const approveRegistrationService = async (id, data = {}, user) => {
  requireUser(user);
  assertUuid(id, "registration ID");

  const studentId = await withTransaction(async (client) => {
    const locked = await client.query(
      `SELECT * FROM registration_requests WHERE id = $1 FOR UPDATE`,
      [id],
    );
    const request = locked.rows[0];

    if (!request) throw new AppError("Registration request not found.", 404);
    if (request.status !== "pending") {
      throw new AppError(`This request was already ${request.status}.`, 409);
    }

    // Optional overrides from the admin: fee and start date.
    const input = parseEnrollmentInput({
      programId: request.program_id,
      agreedFee: data.agreedFee,
      enrolledOn: data.enrolledOn,
    });

    // Same name + phone already registered? Enroll that student instead.
    const duplicate = await client.query(
      `SELECT id FROM students
       WHERE LOWER(full_name) = LOWER($1)
         AND ((phone IS NOT NULL AND phone = $2)
           OR (guardian_phone IS NOT NULL AND guardian_phone = $3))
       LIMIT 1`,
      [request.full_name, request.phone, request.guardian_phone],
    );

    const studentIdToUse =
      duplicate.rows[0]?.id ??
      (
        await createStudent(client, {
          full_name: request.full_name,
          email: request.email,
          phone: request.phone,
          guardian_phone: request.guardian_phone,
          guardian_name: request.guardian_name,
          age_group: request.age_group,
          county: request.county,
          notes: request.notes,
        })
      ).id;

    await assertProgramAcceptsEnrollment(client, request.program_id);
    await assertNoOpenEnrollment(client, studentIdToUse, request.program_id);

    await createEnrollment(client, {
      student_id: studentIdToUse,
      program_id: request.program_id,
      enrolled_on: input.enrolledOn,
      agreed_fee: input.agreedFee,
      notes: null,
    });

    await client.query(
      `UPDATE registration_requests
       SET status = 'approved', student_id = $2,
           reviewed_by = $3, reviewed_at = NOW()
       WHERE id = $1`,
      [id, studentIdToUse, user.userId],
    );

    return studentIdToUse;
  });

  return await getStudentById(studentId);
};

// ============================================================
// REJECT (ADMIN)
// ============================================================

export const rejectRegistrationService = async (id, data = {}, user) => {
  requireUser(user);
  assertUuid(id, "registration ID");

  const reason = cleanText(data.reason, "Reason", { max: 500 }) ?? null;
  const rejected = await rejectRegistrationRequest(id, reason, user.userId);

  if (!rejected) {
    throw new AppError("Pending registration request not found.", 404);
  }
  return rejected;
};
