import {
  createStudent,
  getAllStudents,
  getStudentById,
  updateStudent,
  deleteStudent,
  getStudentStats,
  createEnrollment,
  getEnrollmentById,
  getEnrollmentsByStudent,
  getEnrollmentsByProgram,
  updateEnrollment,
  updateEnrollmentStatus,
  deleteEnrollment,
  createPayment,
  getPaymentsByEnrollment,
  getPaymentById,
  updatePaymentStatus,
  deletePayment,
  getEnrollmentFinancials,
  recordAttendance,
  getAttendanceByEnrollment,
  getAttendanceSummary,
  deleteAttendance,
  getCertificateEligibility,
  issueCertificate,
  getCertificatesByEnrollment,
  revokeCertificate,
  verifyCertificate,
  createAssessment,
  getAssessmentsByEnrollment,
  updateAssessment,
  deleteAssessment,
} from "../../database/models/students/student.model.js";

import { getProgramById } from "../../database/models/programs/program.model.js";

import AppError from "../../middleware/error/AppError.js";
import { pool } from "../../database/config/config.db.js";

// ============================================================
// CONSTANTS
// ============================================================

const ADMIN_ROLES = ["admin", "owner", "super_admin"];

const ENROLLMENT_STATUSES = ["active", "on_hold", "dropped", "completed"];
const OPEN_STATUSES = ["active", "on_hold"]; // these hold a seat in the program
const PAYMENT_STATUSES = ["pending", "successful", "failed", "refunded"];
const PAYMENT_FILTERS = ["unpaid", "partial", "paid"];
const ATTENDANCE_STATUSES = ["present", "absent", "late", "excused"];
const CERTIFICATE_TYPES = ["completion", "participation"];

const MIN_ATTENDANCE = 75; // % required for a certificate

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// ============================================================
// HELPERS
// ============================================================

const getRole = (user) =>
  typeof user?.role === "string"
    ? user.role.toLowerCase()
    : user?.role?.name?.toLowerCase();

const requireUser = (user, message = "Authentication is required.") => {
  if (!user?.userId) {
    throw new AppError(message, 401);
  }
};

// Admins always pass; everyone else needs the specific permission.
const requireAccess = (user, permission, message) => {
  requireUser(user);

  const allowed =
    ADMIN_ROLES.includes(getRole(user)) ||
    user.permissions?.includes(permission) === true;

  if (!allowed) {
    throw new AppError(message, 403);
  }
};

const assertUuid = (value, label) => {
  if (typeof value !== "string" || !UUID_REGEX.test(value)) {
    throw new AppError(`Invalid ${label}.`, 400);
  }
};

// Accepts camelCase (frontend) or snake_case (database) input.
const field = (data, camel, snake) =>
  data[camel] !== undefined ? data[camel] : data[snake];

// Treats "", null and "all" (dropdown default) as "no filter".
const normalizeFilter = (value) =>
  value === undefined || value === null || value === "" || value === "all"
    ? undefined
    : value;

// Today's date (YYYY-MM-DD) in Kenya time.
const today = () =>
  new Intl.DateTimeFormat("en-CA", { timeZone: "Africa/Nairobi" }).format(
    new Date(),
  );

// pg returns DATE columns as JS Dates at local midnight.
const toDateString = (value) => {
  if (value instanceof Date) {
    const month = String(value.getMonth() + 1).padStart(2, "0");
    const day = String(value.getDate()).padStart(2, "0");
    return `${value.getFullYear()}-${month}-${day}`;
  }

  return String(value).slice(0, 10);
};

const parseDate = (value, label) => {
  const valid =
    typeof value === "string" &&
    DATE_REGEX.test(value) &&
    !Number.isNaN(Date.parse(value)) &&
    new Date(value).toISOString().slice(0, 10) === value;

  if (!valid) {
    throw new AppError(`${label} must be a valid date (YYYY-MM-DD).`, 400);
  }

  return value;
};

const parsePaidAt = (value) => {
  if (value === undefined || value === null || value === "") return null;

  const time = Date.parse(value);

  if (Number.isNaN(time)) {
    throw new AppError("Payment date is invalid.", 400);
  }

  // Small allowance for clock differences between devices.
  if (time > Date.now() + 5 * 60 * 1000) {
    throw new AppError("Payment date cannot be in the future.", 400);
  }

  return new Date(time).toISOString();
};

const parseAmount = (value, label, { allowZero = false } = {}) => {
  const amount = Number(value);

  if (
    value === undefined ||
    value === null ||
    value === "" ||
    !Number.isFinite(amount)
  ) {
    throw new AppError(`${label} must be a valid number.`, 400);
  }

  if (allowZero ? amount < 0 : amount <= 0) {
    throw new AppError(
      allowZero
        ? `${label} cannot be negative.`
        : `${label} must be greater than zero.`,
      400,
    );
  }

  return Math.round(amount * 100) / 100;
};

const parseScore = (value, label) => {
  const score = Number(value);

  if (
    value === null ||
    value === "" ||
    !Number.isFinite(score) ||
    score < 0 ||
    score > 100
  ) {
    throw new AppError(`${label} must be between 0 and 100.`, 400);
  }

  return Math.round(score * 100) / 100;
};

// Returns undefined (not provided), null (empty) or the trimmed text.
const cleanText = (value, label, { required = false, max = 255 } = {}) => {
  if (value === undefined) {
    if (required) throw new AppError(`${label} is required.`, 400);
    return undefined;
  }

  if (value === null || (typeof value === "string" && !value.trim())) {
    if (required) throw new AppError(`${label} is required.`, 400);
    return null;
  }

  if (typeof value !== "string") {
    throw new AppError(`${label} must be text.`, 400);
  }

  const trimmed = value.trim();

  if (trimmed.length > max) {
    throw new AppError(`${label} must be ${max} characters or fewer.`, 400);
  }

  return trimmed;
};

// Stores Kenyan numbers consistently: 0712 345 678 -> +254712345678
const normalizePhone = (value, label) => {
  const cleaned = cleanText(value, label, { max: 30 });

  if (!cleaned) return cleaned; // undefined or null

  let phone = cleaned.replace(/[\s\-().]/g, "");

  if (/^0\d{9}$/.test(phone)) {
    phone = `+254${phone.slice(1)}`;
  } else if (/^254\d{9}$/.test(phone)) {
    phone = `+${phone}`;
  }

  if (!/^\+?\d{9,15}$/.test(phone)) {
    throw new AppError(`${label} is not a valid phone number.`, 400);
  }

  return phone;
};

const formatMoney = (value) => `KSh ${Number(value).toFixed(2)}`;

// Turns common database errors into clear API errors.
const translateDbError = (error) => {
  if (error instanceof AppError) return error;

  switch (error?.code) {
    case "23505":
      return new AppError("This record already exists.", 409);
    case "23503":
      return new AppError(
        "A related record was not found, or this record is still in use.",
        409,
      );
    case "23514":
      return new AppError("A value is outside the allowed range.", 400);
    case "22P02":
      return new AppError("A value has an invalid format.", 400);
    default:
      return error;
  }
};

// Runs the callback inside BEGIN / COMMIT, rolling back on any error.
const withTransaction = async (callback) => {
  const client = await pool.connect();
  let transactionStarted = false;

  try {
    await client.query("BEGIN");
    transactionStarted = true;

    const result = await callback(client);

    await client.query("COMMIT");
    transactionStarted = false;

    return result;
  } catch (error) {
    if (transactionStarted) {
      try {
        await client.query("ROLLBACK");
      } catch {
        // Preserve the original error if rollback also fails.
      }
    }

    throw translateDbError(error);
  } finally {
    client.release();
  }
};

// Locks the enrollment row so two payments / certificates can't race.
const lockEnrollment = async (client, enrollmentId) => {
  const result = await client.query(
    `SELECT id
     FROM student_enrollments
     WHERE id = $1
     FOR UPDATE`,
    [enrollmentId],
  );

  if (result.rows.length === 0) {
    throw new AppError("Enrollment not found.", 404);
  }
};

const assertEnrollmentExists = async (enrollmentId) => {
  assertUuid(enrollmentId, "enrollment ID");

  const enrollment = await getEnrollmentById(enrollmentId);

  if (!enrollment) {
    throw new AppError("Enrollment not found.", 404);
  }

  return enrollment;
};

const assertStudentExists = async (studentId) => {
  assertUuid(studentId, "student ID");

  const result = await pool.query(`SELECT id FROM students WHERE id = $1`, [
    studentId,
  ]);

  if (result.rows.length === 0) {
    throw new AppError("Student not found.", 404);
  }
};

// The program must be published and have a free seat.
// Active and on-hold students both hold a seat.
const assertProgramAcceptsEnrollment = async (client, programId) => {
  const programResult = await client.query(
    `SELECT id, title, status, capacity
     FROM programs
     WHERE id = $1
     FOR UPDATE`,
    [programId],
  );

  const program = programResult.rows[0];

  if (!program) {
    throw new AppError("Program not found.", 404);
  }

  if (program.status !== "published") {
    throw new AppError(
      "Students can only be enrolled in published programs.",
      400,
    );
  }

  const seatResult = await client.query(
    `SELECT COUNT(*)::int AS taken
     FROM student_enrollments
     WHERE program_id = $1
       AND status IN ('active', 'on_hold')`,
    [programId],
  );

  if (seatResult.rows[0].taken >= program.capacity) {
    throw new AppError(
      `"${program.title}" is full (${program.capacity} seats).`,
      409,
    );
  }

  return program;
};

const assertNoOpenEnrollment = async (client, studentId, programId) => {
  const result = await client.query(
    `SELECT id
     FROM student_enrollments
     WHERE student_id = $1
       AND program_id = $2
       AND status IN ('active', 'on_hold')
     LIMIT 1`,
    [studentId, programId],
  );

  if (result.rows.length > 0) {
    throw new AppError(
      "This student already has an active or on-hold enrollment in this program.",
      409,
    );
  }
};

// Blocks overpayment: a successful payment cannot exceed the balance.
const assertWithinBalance = async (enrollmentId, amount) => {
  const financials = await getEnrollmentFinancials(enrollmentId);

  if (!financials) {
    throw new AppError("Enrollment not found.", 404);
  }

  const balance = Number(financials.balance);

  if (amount > balance + 0.001) {
    throw new AppError(
      `Payment of ${formatMoney(amount)} exceeds the outstanding balance of ${formatMoney(balance)}.`,
      400,
    );
  }
};

// Every transaction reference (e.g. M-Pesa code) can only be used once.
const assertReferenceUnused = async (client, reference) => {
  if (!reference) return;

  const result = await client.query(
    `SELECT id
     FROM student_payments
     WHERE LOWER(reference) = LOWER($1)
       AND status <> 'failed'
     LIMIT 1`,
    [reference],
  );

  if (result.rows.length > 0) {
    throw new AppError(
      "A payment with this reference has already been recorded.",
      409,
    );
  }
};

// ------------------------------------------------------------
// Input parsers shared by several services
// ------------------------------------------------------------

const parseEnrollmentInput = (data) => {
  const programId = field(data, "programId", "program_id");

  if (!programId) {
    throw new AppError("A program is required.", 400);
  }

  assertUuid(programId, "program ID");

  const rawFee = field(data, "agreedFee", "agreed_fee");
  const rawDate = field(data, "enrolledOn", "enrolled_on");

  return {
    programId,
    // null means "use the program's current price"
    agreedFee:
      rawFee === undefined || rawFee === null || rawFee === ""
        ? null
        : parseAmount(rawFee, "Agreed fee", { allowZero: true }),
    enrolledOn: rawDate ? parseDate(rawDate, "Enrollment date") : null,
    notes: cleanText(data.notes, "Notes", { max: 5000 }) ?? null,
  };
};

const parsePaymentInput = (data) => {
  const amount = parseAmount(data.amount, "Payment amount");

  const rawMethod = cleanText(
    field(data, "paymentMethod", "payment_method"),
    "Payment method",
    { required: true, max: 30 },
  );

  // "M-Pesa", "m pesa", "mpesa" all become "mpesa".
  const methodKey = rawMethod.toLowerCase().replace(/[\s_-]+/g, "");
  const paymentMethod =
    methodKey === "mpesa"
      ? "mpesa"
      : rawMethod.toLowerCase().replace(/\s+/g, "_");

  let reference = cleanText(data.reference, "Reference", { max: 100 }) ?? null;

  const status = data.status ?? "successful";

  if (!PAYMENT_STATUSES.includes(status)) {
    throw new AppError("Invalid payment status.", 400);
  }

  if (paymentMethod === "mpesa") {
    if (!reference && status === "successful") {
      throw new AppError("An M-Pesa transaction code is required.", 400);
    }

    reference = reference ? reference.toUpperCase() : null;
  }

  return {
    amount,
    payment_method: paymentMethod,
    reference,
    paid_at: parsePaidAt(field(data, "paidAt", "paid_at")),
    status,
  };
};

// ============================================================
// CREATE STUDENT (optionally enrol + take a first payment)
// ============================================================

export const createStudentService = async (data, user) => {
  requireUser(user, "Authentication is required to register a student.");

  const full_name = cleanText(
    field(data, "fullName", "full_name"),
    "Full name",
    {
      required: true,
      max: 150,
    },
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
      "At least one contact (phone, guardian phone or email) is required.",
      400,
    );
  }

  const studentData = {
    full_name,
    email,
    phone,
    guardian_phone,
    guardian_name:
      cleanText(field(data, "guardianName", "guardian_name"), "Guardian name", {
        max: 150,
      }) ?? null,
    age_group:
      cleanText(field(data, "ageGroup", "age_group"), "Age group", {
        max: 30,
      }) ?? null,
    county: cleanText(data.county, "County", { max: 100 }) ?? null,
    notes: cleanText(data.notes, "Notes", { max: 5000 }) ?? null,
  };

  // Optional: enrol straight into a program while registering.
  const hasProgram = Boolean(field(data, "programId", "program_id"));
  const enrollmentInput = hasProgram ? parseEnrollmentInput(data) : null;

  // Optional: record a first payment (deposit) for that enrollment.
  const initialPayment = data.initialPayment ?? null;

  if (initialPayment && !hasProgram) {
    throw new AppError("An initial payment requires a program.", 400);
  }

  const paymentInput = initialPayment
    ? parsePaymentInput({ ...initialPayment, status: "successful" })
    : null;

  const studentId = await withTransaction(async (client) => {
    const duplicate = await client.query(
      `SELECT student_no
       FROM students
       WHERE LOWER(full_name) = LOWER($1)
         AND (
           (phone IS NOT NULL AND phone = $2)
           OR (guardian_phone IS NOT NULL AND guardian_phone = $3)
         )
       LIMIT 1`,
      [full_name, phone, guardian_phone],
    );

    if (duplicate.rows.length > 0) {
      throw new AppError(
        `A student with the same name and phone number already exists (${duplicate.rows[0].student_no}).`,
        409,
      );
    }

    const student = await createStudent(client, studentData);

    if (enrollmentInput) {
      await assertProgramAcceptsEnrollment(client, enrollmentInput.programId);

      const enrollment = await createEnrollment(client, {
        student_id: student.id,
        program_id: enrollmentInput.programId,
        enrolled_on: enrollmentInput.enrolledOn,
        agreed_fee: enrollmentInput.agreedFee,
        notes: enrollmentInput.notes,
      });

      if (paymentInput) {
        if (paymentInput.amount > Number(enrollment.agreed_fee) + 0.001) {
          throw new AppError(
            `Initial payment exceeds the agreed fee of ${formatMoney(enrollment.agreed_fee)}.`,
            400,
          );
        }

        await assertReferenceUnused(client, paymentInput.reference);

        await createPayment(client, {
          enrollment_id: enrollment.id,
          ...paymentInput,
        });
      }
    }

    return student.id;
  });

  return await getStudentById(studentId);
};

// ============================================================
// GET ALL STUDENTS (search, filter, sort, paginate)
// ============================================================

export const getAllStudentsService = async (filters = {}) => {
  const status = normalizeFilter(filters.status);

  if (status && !ENROLLMENT_STATUSES.includes(status)) {
    throw new AppError("Invalid status filter.", 400);
  }

  const payment_status = normalizeFilter(
    field(filters, "paymentStatus", "payment_status"),
  );

  if (payment_status && !PAYMENT_FILTERS.includes(payment_status)) {
    throw new AppError("Invalid payment status filter.", 400);
  }

  const program_id = normalizeFilter(field(filters, "programId", "program_id"));

  if (program_id) {
    assertUuid(program_id, "program ID");
  }

  return await getAllStudents({
    search: typeof filters.search === "string" ? filters.search : undefined,
    status,
    program_id,
    payment_status,
    age_group: normalizeFilter(field(filters, "ageGroup", "age_group")),
    county: normalizeFilter(filters.county),
    sort_by: field(filters, "sortBy", "sort_by"),
    sort_order: field(filters, "sortOrder", "sort_order"),
    page: filters.page,
    limit: filters.limit,
  });
};

// ============================================================
// GET STUDENT BY ID
// ============================================================

export const getStudentByIdService = async (id) => {
  assertUuid(id, "student ID");

  const student = await getStudentById(id);

  if (!student) {
    throw new AppError("Student not found.", 404);
  }

  return student;
};

// ============================================================
// GET STUDENT STATS
// ============================================================

export const getStudentStatsService = async () => {
  return await getStudentStats();
};

// ============================================================
// UPDATE STUDENT
// ============================================================

export const updateStudentService = async (id, data, user) => {
  requireUser(user);
  assertUuid(id, "student ID");

  const studentData = {};

  // The student number is generated and never editable.
  const fullName = cleanText(
    field(data, "fullName", "full_name"),
    "Full name",
    {
      max: 150,
    },
  );

  if (fullName !== undefined) {
    if (fullName === null) {
      throw new AppError("Full name cannot be empty.", 400);
    }

    studentData.full_name = fullName;
  }

  const email = cleanText(data.email, "Email", { max: 255 });

  if (email && !EMAIL_REGEX.test(email)) {
    throw new AppError("Email address is not valid.", 400);
  }

  const optionalFields = {
    email,
    phone: normalizePhone(data.phone, "Phone"),
    guardian_phone: normalizePhone(
      field(data, "guardianPhone", "guardian_phone"),
      "Guardian phone",
    ),
    guardian_name: cleanText(
      field(data, "guardianName", "guardian_name"),
      "Guardian name",
      { max: 150 },
    ),
    age_group: cleanText(field(data, "ageGroup", "age_group"), "Age group", {
      max: 30,
    }),
    county: cleanText(data.county, "County", { max: 100 }),
    notes: cleanText(data.notes, "Notes", { max: 5000 }),
  };

  for (const [key, value] of Object.entries(optionalFields)) {
    if (value !== undefined) {
      studentData[key] = value;
    }
  }

  if (Object.keys(studentData).length === 0) {
    throw new AppError("No valid fields were provided to update.", 400);
  }

  const updatedStudent = await updateStudent(id, studentData);

  if (!updatedStudent) {
    throw new AppError("Student not found.", 404);
  }

  return updatedStudent;
};

// ============================================================
// DELETE STUDENT
// ============================================================

// Deleting removes the student's enrollments, payments, attendance and
// certificates. A student with payment history is protected unless
// options.force is true.
export const deleteStudentService = async (
  id,
  user,
  { force = false } = {},
) => {
  requireAccess(
    user,
    "students:delete",
    "You do not have permission to delete students.",
  );
  assertUuid(id, "student ID");

  const student = await getStudentById(id);

  if (!student) {
    throw new AppError("Student not found.", 404);
  }

  const hasPayments = student.enrollments.some(
    (enrollment) => Number(enrollment.amount_paid) > 0,
  );

  if (hasPayments && force !== true) {
    throw new AppError(
      "This student has payment history. Mark the enrollment as dropped instead, or confirm the deletion explicitly.",
      409,
    );
  }

  return await withTransaction((client) => deleteStudent(client, id));
};

// ============================================================
// ENROL STUDENT IN A PROGRAM
// ============================================================

export const enrollStudentService = async (studentId, data, user) => {
  requireUser(user);
  assertUuid(studentId, "student ID");

  const input = parseEnrollmentInput(data);

  const enrollmentId = await withTransaction(async (client) => {
    const studentResult = await client.query(
      `SELECT id FROM students WHERE id = $1`,
      [studentId],
    );

    if (studentResult.rows.length === 0) {
      throw new AppError("Student not found.", 404);
    }

    await assertProgramAcceptsEnrollment(client, input.programId);
    await assertNoOpenEnrollment(client, studentId, input.programId);

    const enrollment = await createEnrollment(client, {
      student_id: studentId,
      program_id: input.programId,
      enrolled_on: input.enrolledOn,
      agreed_fee: input.agreedFee,
      notes: input.notes,
    });

    return enrollment.id;
  });

  return await getEnrollmentById(enrollmentId);
};

// ============================================================
// GET ENROLLMENT BY ID
// ============================================================

export const getEnrollmentByIdService = async (id) => {
  return await assertEnrollmentExists(id);
};

// ============================================================
// GET ENROLLMENTS BY STUDENT
// ============================================================

export const getStudentEnrollmentsService = async (studentId) => {
  await assertStudentExists(studentId);

  return await getEnrollmentsByStudent(studentId);
};

// ============================================================
// GET ENROLLMENTS BY PROGRAM (class list)
// ============================================================

export const getProgramEnrollmentsService = async (programId) => {
  assertUuid(programId, "program ID");

  const program = await getProgramById(programId);

  if (!program) {
    throw new AppError("Program not found.", 404);
  }

  return await getEnrollmentsByProgram(programId);
};

// ============================================================
// UPDATE ENROLLMENT (fee, progress, final score, notes)
// ============================================================

export const updateEnrollmentService = async (id, data, user) => {
  requireUser(user);

  const existing = await assertEnrollmentExists(id);

  const enrollmentData = {};

  const enrolledOn = field(data, "enrolledOn", "enrolled_on");

  if (enrolledOn !== undefined) {
    enrollmentData.enrolled_on = parseDate(enrolledOn, "Enrollment date");
  }

  const agreedFee = field(data, "agreedFee", "agreed_fee");

  if (agreedFee !== undefined) {
    const fee = parseAmount(agreedFee, "Agreed fee", { allowZero: true });

    if (fee < Number(existing.amount_paid)) {
      throw new AppError(
        `Agreed fee cannot be lower than the amount already paid (${formatMoney(existing.amount_paid)}). Refund the difference first.`,
        409,
      );
    }

    enrollmentData.agreed_fee = fee;
  }

  if (data.progress !== undefined) {
    const progress = Number(data.progress);

    if (!Number.isInteger(progress) || progress < 0 || progress > 100) {
      throw new AppError("Progress must be a whole number from 0 to 100.", 400);
    }

    if (existing.status === "completed" && progress < 100) {
      throw new AppError(
        "A completed enrollment must stay at 100% progress. Change its status first.",
        409,
      );
    }

    enrollmentData.progress = progress;
  }

  const finalScore = field(data, "finalScore", "final_score");

  if (finalScore !== undefined) {
    enrollmentData.final_score = parseScore(finalScore, "Final score");
  }

  if (data.notes !== undefined) {
    enrollmentData.notes = cleanText(data.notes, "Notes", { max: 5000 });
  }

  if (Object.keys(enrollmentData).length === 0) {
    throw new AppError("No valid fields were provided to update.", 400);
  }

  await updateEnrollment(id, enrollmentData);

  return await getEnrollmentById(id);
};

// ============================================================
// UPDATE ENROLLMENT STATUS
// ============================================================

export const updateEnrollmentStatusService = async (id, status, user) => {
  requireUser(user);

  if (!ENROLLMENT_STATUSES.includes(status)) {
    throw new AppError("Invalid enrollment status.", 400);
  }

  const existing = await assertEnrollmentExists(id);

  if (existing.status === status) {
    return existing;
  }

  if (
    existing.status === "completed" &&
    existing.certificate_status === "issued"
  ) {
    throw new AppError(
      "Revoke the issued certificate before changing the status of a completed enrollment.",
      409,
    );
  }

  await withTransaction(async (client) => {
    // Reopening a dropped/completed enrollment takes a seat again.
    if (
      OPEN_STATUSES.includes(status) &&
      !OPEN_STATUSES.includes(existing.status)
    ) {
      await assertProgramAcceptsEnrollment(client, existing.program_id);
      await assertNoOpenEnrollment(
        client,
        existing.student_id,
        existing.program_id,
      );
    }

    // A completed course is 100% done.
    if (status === "completed") {
      await client.query(
        `UPDATE student_enrollments
         SET progress = 100
         WHERE id = $1 AND progress < 100`,
        [id],
      );
    }

    const updated = await updateEnrollmentStatus(client, id, status);

    if (!updated) {
      throw new AppError("Enrollment not found.", 404);
    }
  });

  return await getEnrollmentById(id);
};

// ============================================================
// DELETE ENROLLMENT
// ============================================================

export const deleteEnrollmentService = async (
  id,
  user,
  { force = false } = {},
) => {
  requireAccess(
    user,
    "students:delete",
    "You do not have permission to delete enrollments.",
  );

  const existing = await assertEnrollmentExists(id);

  if (Number(existing.amount_paid) > 0 && force !== true) {
    throw new AppError(
      "This enrollment has payment history. Mark it as dropped instead, or confirm the deletion explicitly.",
      409,
    );
  }

  return await withTransaction((client) => deleteEnrollment(client, id));
};

// ============================================================
// RECORD PAYMENT
// ============================================================

export const recordPaymentService = async (enrollmentId, data, user) => {
  requireUser(user);
  assertUuid(enrollmentId, "enrollment ID");

  const input = parsePaymentInput(data);

  return await withTransaction(async (client) => {
    await lockEnrollment(client, enrollmentId);
    await assertReferenceUnused(client, input.reference);

    if (input.status === "successful") {
      await assertWithinBalance(enrollmentId, input.amount);
    }

    return await createPayment(client, {
      enrollment_id: enrollmentId,
      ...input,
    });
  });
};

// ============================================================
// GET PAYMENTS BY ENROLLMENT (with totals)
// ============================================================

export const getEnrollmentPaymentsService = async (enrollmentId) => {
  await assertEnrollmentExists(enrollmentId);

  const [financials, payments] = await Promise.all([
    getEnrollmentFinancials(enrollmentId),
    getPaymentsByEnrollment(enrollmentId),
  ]);

  return { financials, payments };
};

// ============================================================
// UPDATE PAYMENT STATUS
// ============================================================

export const updatePaymentStatusService = async (id, status, user) => {
  requireUser(user);
  assertUuid(id, "payment ID");

  if (!PAYMENT_STATUSES.includes(status)) {
    throw new AppError("Invalid payment status.", 400);
  }

  const existing = await getPaymentById(id);

  if (!existing) {
    throw new AppError("Payment not found.", 404);
  }

  if (existing.status === status) {
    return existing;
  }

  if (existing.status === "refunded") {
    throw new AppError("Refunded payments cannot be changed.", 409);
  }

  // Reversing money that was counted needs finance permission.
  const reversesPayment =
    existing.status === "successful" && status !== "successful";

  if (reversesPayment || status === "refunded") {
    requireAccess(
      user,
      "payments:manage",
      "You do not have permission to reverse or refund payments.",
    );
  }

  return await withTransaction(async (client) => {
    await lockEnrollment(client, existing.enrollment_id);

    if (status === "successful") {
      await assertWithinBalance(
        existing.enrollment_id,
        Number(existing.amount),
      );
    }

    return await updatePaymentStatus(client, id, status);
  });
};

// ============================================================
// DELETE PAYMENT
// ============================================================

export const deletePaymentService = async (id, user) => {
  requireAccess(
    user,
    "payments:manage",
    "You do not have permission to delete payments.",
  );
  assertUuid(id, "payment ID");

  const existing = await getPaymentById(id);

  if (!existing) {
    throw new AppError("Payment not found.", 404);
  }

  return await withTransaction((client) => deletePayment(client, id));
};

// ============================================================
// RECORD ATTENDANCE (single student)
// ============================================================

export const recordAttendanceService = async (enrollmentId, data, user) => {
  requireUser(user);

  const sessionDate = parseDate(
    field(data, "sessionDate", "session_date"),
    "Session date",
  );

  if (sessionDate > today()) {
    throw new AppError(
      "Attendance cannot be recorded for a future session.",
      400,
    );
  }

  if (!ATTENDANCE_STATUSES.includes(data.status)) {
    throw new AppError("Invalid attendance status.", 400);
  }

  const enrollment = await assertEnrollmentExists(enrollmentId);

  if (enrollment.status !== "active") {
    throw new AppError(
      "Attendance can only be recorded for active enrollments.",
      409,
    );
  }

  if (sessionDate < toDateString(enrollment.enrolled_on)) {
    throw new AppError(
      "Session date is before the student's enrollment date.",
      400,
    );
  }

  const record = await withTransaction((client) =>
    recordAttendance(client, {
      enrollment_id: enrollmentId,
      session_date: sessionDate,
      status: data.status,
      remarks: cleanText(data.remarks, "Remarks", { max: 1000 }) ?? null,
      recorded_by: user.userId,
    }),
  );

  return { record, summary: await getAttendanceSummary(enrollmentId) };
};

// ============================================================
// RECORD CLASS ATTENDANCE (whole class register for one session)
// ============================================================

export const recordClassAttendanceService = async (data, user) => {
  requireUser(user);

  const sessionDate = parseDate(
    field(data, "sessionDate", "session_date"),
    "Session date",
  );

  if (sessionDate > today()) {
    throw new AppError(
      "Attendance cannot be recorded for a future session.",
      400,
    );
  }

  const records = data.records;

  if (!Array.isArray(records) || records.length === 0) {
    throw new AppError("At least one attendance record is required.", 400);
  }

  if (records.length > 200) {
    throw new AppError("A register can contain at most 200 records.", 400);
  }

  const entries = records.map((entry) => {
    const enrollmentId = field(entry, "enrollmentId", "enrollment_id");

    assertUuid(enrollmentId, "enrollment ID");

    if (!ATTENDANCE_STATUSES.includes(entry.status)) {
      throw new AppError("Invalid attendance status.", 400);
    }

    return {
      enrollment_id: enrollmentId,
      status: entry.status,
      remarks: cleanText(entry.remarks, "Remarks", { max: 1000 }) ?? null,
    };
  });

  const ids = entries.map((entry) => entry.enrollment_id);

  if (new Set(ids).size !== ids.length) {
    throw new AppError(
      "A student appears more than once in the register.",
      400,
    );
  }

  return await withTransaction(async (client) => {
    const enrollmentResult = await client.query(
      `SELECT id, status, enrolled_on
       FROM student_enrollments
       WHERE id = ANY($1::uuid[])`,
      [ids],
    );

    if (enrollmentResult.rows.length !== ids.length) {
      throw new AppError("One or more enrollments were not found.", 404);
    }

    for (const enrollment of enrollmentResult.rows) {
      if (enrollment.status !== "active") {
        throw new AppError(
          "Attendance can only be recorded for active enrollments.",
          409,
        );
      }

      if (sessionDate < toDateString(enrollment.enrolled_on)) {
        throw new AppError(
          "Session date is before a student's enrollment date.",
          400,
        );
      }
    }

    for (const entry of entries) {
      await recordAttendance(client, {
        ...entry,
        session_date: sessionDate,
        recorded_by: user.userId,
      });
    }

    return { session_date: sessionDate, recorded: entries.length };
  });
};

// ============================================================
// GET ATTENDANCE BY ENROLLMENT
// ============================================================

export const getAttendanceService = async (enrollmentId) => {
  await assertEnrollmentExists(enrollmentId);

  const [summary, records] = await Promise.all([
    getAttendanceSummary(enrollmentId),
    getAttendanceByEnrollment(enrollmentId),
  ]);

  return { summary, records };
};

// ============================================================
// DELETE ATTENDANCE RECORD
// ============================================================

export const deleteAttendanceService = async (id, user) => {
  requireUser(user);
  assertUuid(id, "attendance ID");

  const deleted = await withTransaction((client) =>
    deleteAttendance(client, id),
  );

  if (!deleted) {
    throw new AppError("Attendance record not found.", 404);
  }

  return deleted;
};

// ============================================================
// CERTIFICATE ELIGIBILITY
// ============================================================

export const getCertificateEligibilityService = async (
  enrollmentId,
  { minAttendance = MIN_ATTENDANCE } = {},
) => {
  assertUuid(enrollmentId, "enrollment ID");

  const threshold = Number(minAttendance);

  if (!Number.isFinite(threshold) || threshold < 0 || threshold > 100) {
    throw new AppError("Minimum attendance must be between 0 and 100.", 400);
  }

  const eligibility = await getCertificateEligibility(enrollmentId, {
    minAttendance: threshold,
  });

  if (!eligibility) {
    throw new AppError("Enrollment not found.", 404);
  }

  return eligibility;
};

// ============================================================
// ISSUE CERTIFICATE
// ============================================================

// completion    -> must pass every eligibility rule
// participation -> not dropped, attendance at or above the minimum
export const issueCertificateService = async (enrollmentId, data, user) => {
  requireAccess(
    user,
    "students:certify",
    "You do not have permission to issue certificates.",
  );
  assertUuid(enrollmentId, "enrollment ID");

  const type =
    data?.certificateType ??
    data?.certificate_type ??
    data?.type ??
    "completion";

  if (!CERTIFICATE_TYPES.includes(type)) {
    throw new AppError("Invalid certificate type.", 400);
  }

  return await withTransaction(async (client) => {
    await lockEnrollment(client, enrollmentId);

    const eligibility = await getCertificateEligibility(enrollmentId, {
      minAttendance: MIN_ATTENDANCE,
    });

    const { enrollment, reasons } = eligibility;

    if (type === "completion") {
      if (reasons.length > 0) {
        throw new AppError(
          `This student is not eligible for a certificate: ${reasons.join("; ")}.`,
          409,
        );
      }
    } else {
      const blockers = [];

      if (enrollment.status === "dropped") {
        blockers.push("The enrollment was dropped");
      }
      if (Number(enrollment.attendance_percentage) < MIN_ATTENDANCE) {
        blockers.push(`Attendance is below ${MIN_ATTENDANCE}%`);
      }
      if (enrollment.certificate_status === "issued") {
        blockers.push("A certificate has already been issued");
      }

      if (blockers.length > 0) {
        throw new AppError(
          `This student is not eligible for a certificate: ${blockers.join("; ")}.`,
          409,
        );
      }
    }

    return await issueCertificate(client, enrollmentId, type);
  });
};

// ============================================================
// GET CERTIFICATES BY ENROLLMENT
// ============================================================

export const getCertificatesService = async (enrollmentId) => {
  await assertEnrollmentExists(enrollmentId);

  return await getCertificatesByEnrollment(enrollmentId);
};

// ============================================================
// REVOKE CERTIFICATE
// ============================================================

export const revokeCertificateService = async (id, user) => {
  requireAccess(
    user,
    "students:certify",
    "You do not have permission to revoke certificates.",
  );
  assertUuid(id, "certificate ID");

  const revoked = await withTransaction((client) =>
    revokeCertificate(client, id),
  );

  if (!revoked) {
    throw new AppError(
      "Issued certificate not found. It may not exist or may already be revoked.",
      404,
    );
  }

  return revoked;
};

// ============================================================
// VERIFY CERTIFICATE (public, no login)
// ============================================================

export const verifyCertificateService = async (certificateNo) => {
  if (
    typeof certificateNo !== "string" ||
    !certificateNo.trim() ||
    certificateNo.trim().length > 100
  ) {
    throw new AppError("A valid certificate number is required.", 400);
  }

  const certificate = await verifyCertificate(
    certificateNo.trim().toUpperCase(),
  );

  if (!certificate) {
    throw new AppError("Certificate not found.", 404);
  }

  return { valid: certificate.status === "issued", ...certificate };
};

// ============================================================
// CREATE ASSESSMENT
// ============================================================

export const createAssessmentService = async (enrollmentId, data, user) => {
  requireUser(user);
  await assertEnrollmentExists(enrollmentId);

  const title = cleanText(data.title, "Title", { required: true, max: 150 });

  const score = parseAmount(data.score, "Score", { allowZero: true });

  const rawMax = field(data, "maxScore", "max_score");
  const maxScore =
    rawMax === undefined || rawMax === null || rawMax === ""
      ? 100
      : parseAmount(rawMax, "Maximum score");

  if (score > maxScore) {
    throw new AppError("Score cannot be higher than the maximum score.", 400);
  }

  const rawDate = field(data, "assessedAt", "assessed_at");

  return await withTransaction((client) =>
    createAssessment(client, {
      enrollment_id: enrollmentId,
      title,
      score,
      max_score: maxScore,
      assessed_at: rawDate ? parseDate(rawDate, "Assessment date") : null,
      remarks: cleanText(data.remarks, "Remarks", { max: 2000 }) ?? null,
    }),
  );
};

// ============================================================
// GET ASSESSMENTS BY ENROLLMENT
// ============================================================

export const getAssessmentsService = async (enrollmentId) => {
  await assertEnrollmentExists(enrollmentId);

  const assessments = await getAssessmentsByEnrollment(enrollmentId);

  const average =
    assessments.length > 0
      ? Math.round(
          (assessments.reduce((sum, a) => sum + Number(a.percentage), 0) /
            assessments.length) *
            10,
        ) / 10
      : null;

  return { assessments, average_percentage: average };
};

// ============================================================
// UPDATE ASSESSMENT
// ============================================================

export const updateAssessmentService = async (id, data, user) => {
  requireUser(user);
  assertUuid(id, "assessment ID");

  const existingResult = await pool.query(
    `SELECT * FROM student_assessments WHERE id = $1`,
    [id],
  );

  const existing = existingResult.rows[0];

  if (!existing) {
    throw new AppError("Assessment not found.", 404);
  }

  const assessmentData = {};

  const title = cleanText(data.title, "Title", { max: 150 });

  if (title !== undefined) {
    if (title === null) {
      throw new AppError("Title cannot be empty.", 400);
    }

    assessmentData.title = title;
  }

  if (data.score !== undefined) {
    assessmentData.score = parseAmount(data.score, "Score", {
      allowZero: true,
    });
  }

  const rawMax = field(data, "maxScore", "max_score");

  if (rawMax !== undefined) {
    assessmentData.max_score = parseAmount(rawMax, "Maximum score");
  }

  const rawDate = field(data, "assessedAt", "assessed_at");

  if (rawDate !== undefined) {
    assessmentData.assessed_at = parseDate(rawDate, "Assessment date");
  }

  if (data.remarks !== undefined) {
    assessmentData.remarks = cleanText(data.remarks, "Remarks", { max: 2000 });
  }

  if (Object.keys(assessmentData).length === 0) {
    throw new AppError("No valid fields were provided to update.", 400);
  }

  const finalScore = assessmentData.score ?? Number(existing.score);
  const finalMax = assessmentData.max_score ?? Number(existing.max_score);

  if (finalScore > finalMax) {
    throw new AppError("Score cannot be higher than the maximum score.", 400);
  }

  const updated = await updateAssessment(id, assessmentData);

  if (!updated) {
    throw new AppError("Assessment not found.", 404);
  }

  return updated;
};

// ============================================================
// DELETE ASSESSMENT
// ============================================================

export const deleteAssessmentService = async (id, user) => {
  requireUser(user);
  assertUuid(id, "assessment ID");

  const deleted = await withTransaction((client) =>
    deleteAssessment(client, id),
  );

  if (!deleted) {
    throw new AppError("Assessment not found.", 404);
  }

  return deleted;
};
