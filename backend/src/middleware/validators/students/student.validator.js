import Joi from "joi";

// =====================================================
// ALLOWED VALUES
// =====================================================

const ENROLLMENT_STATUSES = ["active", "on_hold", "dropped", "completed"];
const PAYMENT_STATUSES = ["pending", "successful", "failed", "refunded"];
const PAYMENT_FILTERS = ["unpaid", "partial", "paid"];
const ATTENDANCE_STATUSES = ["present", "absent", "late", "excused"];
const CERTIFICATE_TYPES = ["completion", "participation"];

// Must match the sort whitelist in the student model.
const STUDENT_SORT_FIELDS = [
  "full_name",
  "student_no",
  "created_at",
  "enrolled_on",
  "progress",
  "balance",
  "attendance",
  "status",
];

// =====================================================
// REUSABLE VALIDATION RULES
// =====================================================

const uuidSchema = Joi.string().guid({ version: ["uuidv4"] });

const dateSchema = Joi.string()
  .pattern(/^\d{4}-\d{2}-\d{2}$/)
  .messages({ "string.pattern.base": "Date must be in YYYY-MM-DD format." });

const phoneSchema = Joi.string()
  .trim()
  .pattern(/^[+\d\s\-().]{7,30}$/)
  .allow("", null)
  .messages({ "string.pattern.base": "Phone number is not valid." });

const emailSchema = Joi.string()
  .trim()
  .email({ tlds: { allow: false } })
  .max(255)
  .allow("", null);

const optionalText = (max) => Joi.string().trim().max(max).allow("", null);

const feeSchema = Joi.number().min(0).precision(2);

const scoreSchema = Joi.number().min(0).max(100).precision(2);

const idParams = (key = "id") =>
  Joi.object({
    [key]: uuidSchema.required(),
  }).unknown(false);

// =====================================================
// ID PARAMS
// =====================================================

// Route: /:id  (students)
export const studentIdParamsSchema = idParams();

// Route: /:id  (enrollments)
export const enrollmentIdParamsSchema = idParams();

// Route: /program/:programId
export const enrollmentProgramParamsSchema = idParams("programId");

// Route: /:id  (payments)
export const paymentIdParamsSchema = idParams();

// Route: /:id  (attendance records)
export const attendanceIdParamsSchema = idParams();

// Route: /:id  (certificates)
export const certificateIdParamsSchema = idParams();

// Route: /:id  (assessments)
export const assessmentIdParamsSchema = idParams();

// =====================================================
// CERTIFICATE NUMBER PARAMS
// Route: /verify/:certificateNo
// =====================================================

export const certificateNoParamsSchema = Joi.object({
  certificateNo: Joi.string()
    .trim()
    .min(1)
    .max(100)
    .pattern(/^[A-Za-z0-9-]+$/)
    .required(),
}).unknown(false);

// =====================================================
// GET STUDENTS QUERY
// Route: /students?search=amina&status=active&page=1&limit=10
// "all" and "" mean "no filter" (the service handles them).
// =====================================================

export const getStudentsQuerySchema = Joi.object({
  search: Joi.string().trim().max(100).allow(""),

  status: Joi.string().valid(...ENROLLMENT_STATUSES, "all", ""),

  programId: uuidSchema.allow("", "all"),

  program_id: uuidSchema.allow("", "all"),

  paymentStatus: Joi.string().valid(...PAYMENT_FILTERS, "all", ""),

  payment_status: Joi.string().valid(...PAYMENT_FILTERS, "all", ""),

  ageGroup: Joi.string().trim().max(30).allow(""),

  age_group: Joi.string().trim().max(30).allow(""),

  county: Joi.string().trim().max(100).allow(""),

  sortBy: Joi.string().valid(...STUDENT_SORT_FIELDS),

  sort_by: Joi.string().valid(...STUDENT_SORT_FIELDS),

  sortOrder: Joi.string().lowercase().valid("asc", "desc"),

  sort_order: Joi.string().lowercase().valid("asc", "desc"),

  page: Joi.number().integer().min(1),

  limit: Joi.number().integer().min(1).max(100),
}).unknown(false);

// =====================================================
// FORCE DELETE QUERY
// Route: DELETE /students/:id?force=true
// Kept as a string because the controller checks === "true".
// =====================================================

export const forceDeleteQuerySchema = Joi.object({
  force: Joi.string().valid("true", "false"),
}).unknown(false);

// =====================================================
// CREATE STUDENT
// Optionally enrols the student in a program and records a
// first payment (deposit) in the same request.
// =====================================================

const paymentFields = {
  amount: Joi.number().greater(0).precision(2).required(),

  paymentMethod: Joi.string().trim().min(1).max(30),

  payment_method: Joi.string().trim().min(1).max(30),

  reference: optionalText(100),

  paidAt: Joi.string().trim().isoDate(),

  paid_at: Joi.string().trim().isoDate(),
};

const initialPaymentSchema = Joi.object(paymentFields)
  .or("paymentMethod", "payment_method")
  .unknown(false);

export const createStudentSchema = Joi.object({
  // Identity
  fullName: Joi.string().trim().min(2).max(150),

  full_name: Joi.string().trim().min(2).max(150),

  // Contact
  email: emailSchema,

  phone: phoneSchema,

  ageGroup: optionalText(30),

  age_group: optionalText(30),

  county: optionalText(100),

  // Guardian
  guardianName: optionalText(150),

  guardian_name: optionalText(150),

  guardianPhone: phoneSchema,

  guardian_phone: phoneSchema,

  notes: optionalText(5000),

  // Optional enrollment
  programId: uuidSchema,

  program_id: uuidSchema,

  agreedFee: feeSchema.allow(null),

  agreed_fee: feeSchema.allow(null),

  enrolledOn: dateSchema.allow(null),

  enrolled_on: dateSchema.allow(null),

  // Optional first payment
  initialPayment: initialPaymentSchema,
})
  .or("fullName", "full_name")
  .custom((value, helpers) => {
    const hasContact = [
      value.phone,
      value.guardianPhone,
      value.guardian_phone,
      value.email,
    ].some((contact) => typeof contact === "string" && contact.trim());

    if (!hasContact) {
      return helpers.message({
        custom:
          "Provide at least one contact: phone, guardian phone, or email.",
      });
    }

    const hasProgram = Boolean(value.programId || value.program_id);

    const hasEnrollmentDetails =
      value.agreedFee !== undefined ||
      value.agreed_fee !== undefined ||
      Boolean(value.enrolledOn || value.enrolled_on);

    if (value.initialPayment && !hasProgram) {
      return helpers.message({
        custom: "An initial payment requires a program.",
      });
    }

    if (hasEnrollmentDetails && !hasProgram) {
      return helpers.message({
        custom: "Enrollment fee and date require a program.",
      });
    }

    return value;
  })
  .unknown(false);

// =====================================================
// UPDATE STUDENT
// The student number is generated and cannot be edited.
// =====================================================

export const updateStudentSchema = Joi.object({
  fullName: Joi.string().trim().min(2).max(150),

  full_name: Joi.string().trim().min(2).max(150),

  email: emailSchema,

  phone: phoneSchema,

  ageGroup: optionalText(30),

  age_group: optionalText(30),

  county: optionalText(100),

  guardianName: optionalText(150),

  guardian_name: optionalText(150),

  guardianPhone: phoneSchema,

  guardian_phone: phoneSchema,

  notes: optionalText(5000),
})
  .min(1)
  .unknown(false);

// =====================================================
// ENROL STUDENT IN A PROGRAM
// Route: POST /students/:id/enrollments
// =====================================================

export const enrollStudentSchema = Joi.object({
  programId: uuidSchema,

  program_id: uuidSchema,

  // Leave out to use the program's current price.
  agreedFee: feeSchema.allow(null),

  agreed_fee: feeSchema.allow(null),

  enrolledOn: dateSchema.allow(null),

  enrolled_on: dateSchema.allow(null),

  notes: optionalText(5000),
})
  .or("programId", "program_id")
  .unknown(false);

// =====================================================
// UPDATE ENROLLMENT
// Status has its own endpoint (updateEnrollmentStatusSchema).
// =====================================================

export const updateEnrollmentSchema = Joi.object({
  enrolledOn: dateSchema,

  enrolled_on: dateSchema,

  agreedFee: feeSchema,

  agreed_fee: feeSchema,

  progress: Joi.number().integer().min(0).max(100),

  finalScore: scoreSchema,

  final_score: scoreSchema,

  notes: optionalText(5000),
})
  .min(1)
  .unknown(false);

// =====================================================
// UPDATE ENROLLMENT STATUS
// =====================================================

export const updateEnrollmentStatusSchema = Joi.object({
  status: Joi.string()
    .valid(...ENROLLMENT_STATUSES)
    .required(),
}).unknown(false);

// =====================================================
// RECORD PAYMENT
// Route: POST /enrollments/:id/payments
// =====================================================

export const recordPaymentSchema = Joi.object({
  ...paymentFields,

  status: Joi.string().valid(...PAYMENT_STATUSES),
})
  .or("paymentMethod", "payment_method")
  .unknown(false);

// =====================================================
// UPDATE PAYMENT STATUS
// =====================================================

export const updatePaymentStatusSchema = Joi.object({
  status: Joi.string()
    .valid(...PAYMENT_STATUSES)
    .required(),
}).unknown(false);

// =====================================================
// RECORD ATTENDANCE (single student)
// Route: POST /enrollments/:id/attendance
// =====================================================

export const recordAttendanceSchema = Joi.object({
  sessionDate: dateSchema,

  session_date: dateSchema,

  status: Joi.string()
    .valid(...ATTENDANCE_STATUSES)
    .required(),

  remarks: optionalText(1000),
})
  .or("sessionDate", "session_date")
  .unknown(false);

// =====================================================
// RECORD CLASS ATTENDANCE (whole register for one session)
// Route: POST /attendance/class
// =====================================================

const attendanceRecordSchema = Joi.object({
  enrollmentId: uuidSchema,

  enrollment_id: uuidSchema,

  status: Joi.string()
    .valid(...ATTENDANCE_STATUSES)
    .required(),

  remarks: optionalText(1000),
})
  .or("enrollmentId", "enrollment_id")
  .unknown(false);

export const recordClassAttendanceSchema = Joi.object({
  sessionDate: dateSchema,

  session_date: dateSchema,

  records: Joi.array().items(attendanceRecordSchema).min(1).max(200).required(),
})
  .or("sessionDate", "session_date")
  .unknown(false);

// =====================================================
// CERTIFICATE ELIGIBILITY QUERY
// Route: /enrollments/:id/certificate-eligibility?minAttendance=75
// =====================================================

export const certificateEligibilityQuerySchema = Joi.object({
  minAttendance: Joi.number().min(0).max(100),
}).unknown(false);

// =====================================================
// ISSUE CERTIFICATE
// Route: POST /enrollments/:id/certificates
// The body is optional; the type defaults to "completion".
// =====================================================

export const issueCertificateSchema = Joi.object({
  certificateType: Joi.string().valid(...CERTIFICATE_TYPES),

  certificate_type: Joi.string().valid(...CERTIFICATE_TYPES),

  type: Joi.string().valid(...CERTIFICATE_TYPES),
}).unknown(false);

// =====================================================
// CREATE ASSESSMENT
// Route: POST /enrollments/:id/assessments
// =====================================================

export const createAssessmentSchema = Joi.object({
  title: Joi.string().trim().min(1).max(150).required(),

  score: Joi.number().min(0).precision(2).required(),

  // Defaults to 100 when left out.
  maxScore: Joi.number().greater(0).precision(2),

  max_score: Joi.number().greater(0).precision(2),

  assessedAt: dateSchema.allow(null),

  assessed_at: dateSchema.allow(null),

  remarks: optionalText(2000),
})
  .custom((value, helpers) => {
    const maxScore = value.maxScore ?? value.max_score ?? 100;

    if (value.score > maxScore) {
      return helpers.message({
        custom: "Score cannot be higher than the maximum score.",
      });
    }

    return value;
  })
  .unknown(false);

// =====================================================
// UPDATE ASSESSMENT
// =====================================================

export const updateAssessmentSchema = Joi.object({
  title: Joi.string().trim().min(1).max(150),

  score: Joi.number().min(0).precision(2),

  maxScore: Joi.number().greater(0).precision(2),

  max_score: Joi.number().greater(0).precision(2),

  assessedAt: dateSchema,

  assessed_at: dateSchema,

  remarks: optionalText(2000),
})
  .min(1)
  .custom((value, helpers) => {
    const maxScore = value.maxScore ?? value.max_score;

    // When only one of the two is sent, the service checks it
    // against the saved value.
    if (
      value.score !== undefined &&
      maxScore !== undefined &&
      value.score > maxScore
    ) {
      return helpers.message({
        custom: "Score cannot be higher than the maximum score.",
      });
    }

    return value;
  })
  .unknown(false);
