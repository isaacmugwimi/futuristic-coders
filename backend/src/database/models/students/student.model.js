import { query } from "../../config/config.db.js";

// ─────────────────────────────────────────────
// CREATE TABLES
// ─────────────────────────────────────────────

export const CREATE_STUDENT_CODE_COUNTERS_TABLE = `
  CREATE TABLE IF NOT EXISTS student_code_counters (
    entity_type VARCHAR(20) NOT NULL
      CHECK (entity_type IN ('student', 'certificate')),
    prefix VARCHAR(20) NOT NULL,
    last_number INTEGER NOT NULL DEFAULT 0,
    PRIMARY KEY (entity_type, prefix)
  );
`;

export const CREATE_STUDENTS_TABLE = `
  CREATE TABLE IF NOT EXISTS students (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    student_no VARCHAR(30) NOT NULL UNIQUE,
    full_name VARCHAR(150) NOT NULL,
    email VARCHAR(255),
    phone VARCHAR(20),
    age_group VARCHAR(30),
    county VARCHAR(100),

    guardian_name VARCHAR(150),
    guardian_phone VARCHAR(20),

    notes TEXT,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  );
`;

export const CREATE_STUDENT_ENROLLMENTS_TABLE = `
  CREATE TABLE IF NOT EXISTS student_enrollments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    student_id UUID NOT NULL REFERENCES students(id)
      ON UPDATE CASCADE ON DELETE CASCADE,

    -- RESTRICT: a program with enrolled students cannot be deleted.
    program_id UUID NOT NULL REFERENCES programs(id)
      ON UPDATE CASCADE ON DELETE RESTRICT,

    enrolled_on DATE NOT NULL DEFAULT CURRENT_DATE,

    status VARCHAR(20) NOT NULL DEFAULT 'active'
      CHECK (status IN ('active', 'on_hold', 'dropped', 'completed')),

    progress SMALLINT NOT NULL DEFAULT 0
      CHECK (progress BETWEEN 0 AND 100),

    agreed_fee NUMERIC(12,2) NOT NULL DEFAULT 0
      CHECK (agreed_fee >= 0),

    completed_on DATE,

    final_score NUMERIC(5,2)
      CHECK (final_score IS NULL OR final_score BETWEEN 0 AND 100),

    notes TEXT,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  );
`;

export const CREATE_STUDENT_PAYMENTS_TABLE = `
  CREATE TABLE IF NOT EXISTS student_payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    enrollment_id UUID NOT NULL REFERENCES student_enrollments(id)
      ON UPDATE CASCADE ON DELETE CASCADE,

    amount NUMERIC(12,2) NOT NULL CHECK (amount > 0),
    payment_method VARCHAR(30) NOT NULL,
    reference VARCHAR(100),
    paid_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    status VARCHAR(20) NOT NULL DEFAULT 'successful'
      CHECK (status IN ('pending', 'successful', 'failed', 'refunded')),

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  );
`;

export const CREATE_STUDENT_ATTENDANCE_TABLE = `
  CREATE TABLE IF NOT EXISTS student_attendance (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    enrollment_id UUID NOT NULL REFERENCES student_enrollments(id)
      ON UPDATE CASCADE ON DELETE CASCADE,

    session_date DATE NOT NULL,

    status VARCHAR(20) NOT NULL
      CHECK (status IN ('present', 'absent', 'late', 'excused')),

    remarks TEXT,

    recorded_by UUID REFERENCES users(id) ON DELETE SET NULL,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    UNIQUE (enrollment_id, session_date)
  );
`;

export const CREATE_STUDENT_CERTIFICATES_TABLE = `
  CREATE TABLE IF NOT EXISTS student_certificates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    enrollment_id UUID NOT NULL REFERENCES student_enrollments(id)
      ON UPDATE CASCADE ON DELETE CASCADE,

    certificate_no VARCHAR(100) NOT NULL UNIQUE,

    certificate_type VARCHAR(30) NOT NULL DEFAULT 'completion'
      CHECK (certificate_type IN ('completion', 'participation')),

    issued_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    status VARCHAR(20) NOT NULL DEFAULT 'issued'
      CHECK (status IN ('issued', 'revoked')),

    revoked_at TIMESTAMPTZ,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  );
`;

export const CREATE_STUDENT_ASSESSMENTS_TABLE = `
  CREATE TABLE IF NOT EXISTS student_assessments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    enrollment_id UUID NOT NULL REFERENCES student_enrollments(id)
      ON UPDATE CASCADE ON DELETE CASCADE,

    title VARCHAR(150) NOT NULL,
    score NUMERIC(5,2) NOT NULL CHECK (score >= 0),
    max_score NUMERIC(5,2) NOT NULL DEFAULT 100 CHECK (max_score > 0),
    assessed_at DATE NOT NULL DEFAULT CURRENT_DATE,
    remarks TEXT,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CHECK (score <= max_score)
  );
`;

export const CREATE_STUDENT_INDEXES = `
  CREATE INDEX IF NOT EXISTS idx_students_full_name
    ON students(full_name);

  CREATE INDEX IF NOT EXISTS idx_students_created_at
    ON students(created_at);

  CREATE INDEX IF NOT EXISTS idx_enrollments_student_id
    ON student_enrollments(student_id);

  CREATE INDEX IF NOT EXISTS idx_enrollments_program_id
    ON student_enrollments(program_id);

  CREATE INDEX IF NOT EXISTS idx_enrollments_status
    ON student_enrollments(status);

  -- A student cannot hold two open enrollments in the same program.
  CREATE UNIQUE INDEX IF NOT EXISTS idx_enrollments_one_open_per_program
    ON student_enrollments(student_id, program_id)
    WHERE status IN ('active', 'on_hold');

  CREATE INDEX IF NOT EXISTS idx_payments_enrollment_id
    ON student_payments(enrollment_id);

  CREATE INDEX IF NOT EXISTS idx_attendance_enrollment_id
    ON student_attendance(enrollment_id);

  CREATE INDEX IF NOT EXISTS idx_certificates_enrollment_id
    ON student_certificates(enrollment_id);

  -- Only one currently-issued certificate per enrollment (revoked ones are kept).
  CREATE UNIQUE INDEX IF NOT EXISTS idx_certificates_one_issued_per_enrollment
    ON student_certificates(enrollment_id)
    WHERE status = 'issued';

  CREATE INDEX IF NOT EXISTS idx_assessments_enrollment_id
    ON student_assessments(enrollment_id);
`;

// ─────────────────────────────────────────────
// INITIALIZE TABLES
// ─────────────────────────────────────────────

// Must run after createProgramTables() and the users table exist.
export const createStudentTables = async () => {
  await query(CREATE_STUDENT_CODE_COUNTERS_TABLE);
  await query(CREATE_STUDENTS_TABLE);
  await query(CREATE_STUDENT_ENROLLMENTS_TABLE);
  await query(CREATE_STUDENT_PAYMENTS_TABLE);
  await query(CREATE_STUDENT_ATTENDANCE_TABLE);
  await query(CREATE_STUDENT_CERTIFICATES_TABLE);
  await query(CREATE_STUDENT_ASSESSMENTS_TABLE);
  await query(CREATE_STUDENT_INDEXES);
};

// ─────────────────────────────────────────────
// CODE GENERATORS
// ─────────────────────────────────────────────

// Examples:
// Student     -> FCA-2026-0001
// Certificate -> CERT-2026-0001
// The counter resets every year because the year is part of the prefix.

// Atomically increments the counter for a given prefix.
const generateEntityCode = async (client, entityType, prefix) => {
  const result = await client.query(
    `INSERT INTO student_code_counters (
      entity_type,
      prefix,
      last_number
    )
    VALUES ($1, $2, 1)
    ON CONFLICT (entity_type, prefix)
    DO UPDATE SET
      last_number = student_code_counters.last_number + 1
    RETURNING last_number`,
    [entityType, prefix],
  );

  const number = result.rows[0].last_number;

  return `${prefix}-${String(number).padStart(4, "0")}`;
};

export const generateStudentNo = async (client) => {
  const year = new Date().getFullYear();
  return generateEntityCode(client, "student", `FCA-${year}`);
};

export const generateCertificateNo = async (client) => {
  const year = new Date().getFullYear();
  return generateEntityCode(client, "certificate", `CERT-${year}`);
};

// ─────────────────────────────────────────────
// SHARED ENROLLMENT SELECT
// ─────────────────────────────────────────────

// One enrollment + its program + calculated money, attendance and
// certificate info. Append a WHERE clause to use it.
//
// Policies (change here if your rules differ):
// - amount_paid  = sum of payments with status 'successful'
// - balance      = agreed_fee - amount_paid (never below 0)
// - attendance % = (present + late) / (all sessions except excused)
//
// Note: pg returns NUMERIC columns as strings (e.g. "1500.00").
const ENROLLMENT_SELECT = `
  SELECT
    e.*,
    p.title AS program_title,
    p.code AS program_code,
    p.price AS program_price,
    p.instructor,
    COALESCE(pay.amount_paid, 0) AS amount_paid,
    GREATEST(e.agreed_fee - COALESCE(pay.amount_paid, 0), 0) AS balance,
    CASE
      WHEN e.agreed_fee <= COALESCE(pay.amount_paid, 0) THEN 'paid'
      WHEN COALESCE(pay.amount_paid, 0) > 0 THEN 'partial'
      ELSE 'unpaid'
    END AS payment_status,
    COALESCE(att.total_sessions, 0) AS total_sessions,
    COALESCE(att.attended_sessions, 0) AS attended_sessions,
    COALESCE(att.attendance_percentage, 0) AS attendance_percentage,
    cert.certificate_id,
    cert.certificate_no,
    cert.certificate_status
  FROM student_enrollments e
  JOIN programs p ON p.id = e.program_id
  LEFT JOIN LATERAL (
    SELECT SUM(sp.amount) AS amount_paid
    FROM student_payments sp
    WHERE sp.enrollment_id = e.id
      AND sp.status = 'successful'
  ) pay ON TRUE
  LEFT JOIN LATERAL (
    SELECT
      (COUNT(*) FILTER (WHERE sa.status <> 'excused'))::int AS total_sessions,
      (COUNT(*) FILTER (WHERE sa.status IN ('present', 'late')))::int
        AS attended_sessions,
      ROUND(
        100.0 * COUNT(*) FILTER (WHERE sa.status IN ('present', 'late'))
        / NULLIF(COUNT(*) FILTER (WHERE sa.status <> 'excused'), 0),
        1
      ) AS attendance_percentage
    FROM student_attendance sa
    WHERE sa.enrollment_id = e.id
  ) att ON TRUE
  LEFT JOIN LATERAL (
    SELECT
      sc.id AS certificate_id,
      sc.certificate_no,
      sc.status AS certificate_status
    FROM student_certificates sc
    WHERE sc.enrollment_id = e.id
    ORDER BY sc.issued_at DESC
    LIMIT 1
  ) cert ON TRUE
`;

// ─────────────────────────────────────────────
// CREATE STUDENT
// ─────────────────────────────────────────────

export const createStudent = async (client, studentData) => {
  const {
    full_name,
    email,
    phone,
    age_group,
    county,
    guardian_name,
    guardian_phone,
    notes,
  } = studentData;

  // The backend generates the student number.
  const studentNo = await generateStudentNo(client);

  const result = await client.query(
    `INSERT INTO students (
      student_no,
      full_name,
      email,
      phone,
      age_group,
      county,
      guardian_name,
      guardian_phone,
      notes
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
    RETURNING *`,
    [
      studentNo,
      full_name.trim(),
      email ?? null,
      phone ?? null,
      age_group ?? null,
      county ?? null,
      guardian_name ?? null,
      guardian_phone ?? null,
      notes ?? null,
    ],
  );

  return result.rows[0];
};

// ─────────────────────────────────────────────
// READ ALL STUDENTS (search, filter, sort, paginate)
// ─────────────────────────────────────────────

// Each student appears once, together with their LATEST enrollment.
// The status / program / payment filters apply to that latest enrollment.
const STUDENT_SORT_COLUMNS = {
  full_name: "s.full_name",
  student_no: "s.student_no",
  created_at: "s.created_at",
  enrolled_on: "le.enrolled_on",
  progress: "le.progress",
  balance: "le.balance",
  attendance: "le.attendance_percentage",
  status: "le.status",
};

export const getAllStudents = async (filters = {}) => {
  const {
    search,
    status,
    program_id,
    payment_status,
    age_group,
    county,
    sort_by = "created_at",
    sort_order = "desc",
  } = filters;

  const page = Math.max(1, parseInt(filters.page, 10) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(filters.limit, 10) || 10));
  const offset = (page - 1) * limit;

  const params = [];
  const where = [];

  const addParam = (value) => {
    params.push(value);
    return `$${params.length}`;
  };

  if (search && search.trim()) {
    const p = addParam(`%${search.trim()}%`);
    where.push(
      `(s.full_name ILIKE ${p}
        OR s.student_no ILIKE ${p}
        OR s.email ILIKE ${p}
        OR s.phone ILIKE ${p}
        OR s.guardian_name ILIKE ${p}
        OR le.program_title ILIKE ${p})`,
    );
  }

  if (status) where.push(`le.status = ${addParam(status)}`);
  if (program_id) where.push(`le.program_id = ${addParam(program_id)}`);
  if (payment_status) {
    where.push(`le.payment_status = ${addParam(payment_status)}`);
  }
  if (age_group) where.push(`s.age_group = ${addParam(age_group)}`);
  if (county) where.push(`s.county ILIKE ${addParam(county)}`);

  const whereSql = where.length ? `WHERE ${where.join(" AND ")}` : "";

  // Whitelist the sort column and direction: never interpolate user input.
  const sortColumn =
    STUDENT_SORT_COLUMNS[sort_by] ?? STUDENT_SORT_COLUMNS.created_at;
  const direction = String(sort_order).toLowerCase() === "asc" ? "ASC" : "DESC";

  const fromSql = `
    FROM students s
    LEFT JOIN LATERAL (
      ${ENROLLMENT_SELECT}
      WHERE e.student_id = s.id
      ORDER BY e.enrolled_on DESC, e.created_at DESC
      LIMIT 1
    ) le ON TRUE
  `;

  const countResult = await query(
    `SELECT COUNT(*)::int AS total ${fromSql} ${whereSql}`,
    params,
  );

  const total = countResult.rows[0].total;

  const limitParam = addParam(limit);
  const offsetParam = addParam(offset);

  const result = await query(
    `SELECT
      s.*,
      le.id AS enrollment_id,
      le.program_id,
      le.program_title,
      le.program_code,
      le.status,
      le.progress,
      le.enrolled_on,
      le.completed_on,
      le.agreed_fee,
      le.amount_paid,
      le.balance,
      le.payment_status,
      le.attendance_percentage,
      le.final_score,
      le.certificate_no,
      le.certificate_status
    ${fromSql}
    ${whereSql}
    ORDER BY ${sortColumn} ${direction} NULLS LAST, s.id
    LIMIT ${limitParam} OFFSET ${offsetParam}`,
    params,
  );

  return {
    students: result.rows,
    total,
    page,
    limit,
    total_pages: Math.max(1, Math.ceil(total / limit)),
  };
};

// ─────────────────────────────────────────────
// READ STUDENT BY ID (with all enrollments)
// ─────────────────────────────────────────────

export const getStudentById = async (id) => {
  const studentResult = await query(`SELECT * FROM students WHERE id = $1`, [
    id,
  ]);

  const student = studentResult.rows[0];
  if (!student) return null;

  const enrollmentsResult = await query(
    `${ENROLLMENT_SELECT}
    WHERE e.student_id = $1
    ORDER BY e.enrolled_on DESC, e.created_at DESC`,
    [id],
  );

  return { ...student, enrollments: enrollmentsResult.rows };
};

// ─────────────────────────────────────────────
// READ STUDENT BY STUDENT NUMBER
// ─────────────────────────────────────────────

export const getStudentByStudentNo = async (studentNo) => {
  const result = await query(`SELECT * FROM students WHERE student_no = $1`, [
    studentNo,
  ]);

  return result.rows[0] ?? null;
};

// ─────────────────────────────────────────────
// UPDATE STUDENT
// ─────────────────────────────────────────────

export const updateStudent = async (id, studentData) => {
  const {
    full_name,
    email,
    phone,
    age_group,
    county,
    guardian_name,
    guardian_phone,
    notes,
  } = studentData;

  // The student number is intentionally not editable.
  const result = await query(
    `UPDATE students
    SET
      full_name = COALESCE($2, full_name),
      email = COALESCE($3, email),
      phone = COALESCE($4, phone),
      age_group = COALESCE($5, age_group),
      county = COALESCE($6, county),
      guardian_name = COALESCE($7, guardian_name),
      guardian_phone = COALESCE($8, guardian_phone),
      notes = COALESCE($9, notes),
      updated_at = NOW()
    WHERE id = $1
    RETURNING *`,
    [
      id,
      full_name?.trim() ?? null,
      email ?? null,
      phone ?? null,
      age_group ?? null,
      county ?? null,
      guardian_name ?? null,
      guardian_phone ?? null,
      notes ?? null,
    ],
  );

  return result.rows[0] ?? null;
};

// ─────────────────────────────────────────────
// DELETE STUDENT
// ─────────────────────────────────────────────

// Cascades to the student's enrollments, payments, attendance,
// certificates and assessments.
export const deleteStudent = async (client, id) => {
  const result = await client.query(
    `DELETE FROM students
    WHERE id = $1
    RETURNING id, student_no, full_name`,
    [id],
  );

  return result.rows[0] ?? null;
};

// ─────────────────────────────────────────────
// STUDENT STATS (summary cards)
// ─────────────────────────────────────────────

export const getStudentStats = async () => {
  const result = await query(
    `SELECT
      (SELECT COUNT(*)::int FROM students) AS total_students,
      COUNT(*) FILTER (WHERE x.status = 'active')::int AS active,
      COUNT(*) FILTER (WHERE x.status = 'on_hold')::int AS on_hold,
      COUNT(*) FILTER (WHERE x.status = 'dropped')::int AS dropped,
      COUNT(*) FILTER (WHERE x.status = 'completed')::int AS completed,
      COALESCE(SUM(x.agreed_fee), 0) AS total_fees,
      COALESCE(SUM(x.amount_paid), 0) AS total_collected,
      COALESCE(SUM(x.balance), 0) AS total_outstanding
    FROM (${ENROLLMENT_SELECT}) x`,
  );

  return result.rows[0];
};

// ─────────────────────────────────────────────
// CREATE ENROLLMENT
// ─────────────────────────────────────────────

export const createEnrollment = async (client, enrollmentData) => {
  const { student_id, program_id, enrolled_on, agreed_fee, notes } =
    enrollmentData;

  // If no fee is supplied, snapshot the program's current price.
  // Later price changes on the Programs page will not affect this student.
  const result = await client.query(
    `INSERT INTO student_enrollments (
      student_id,
      program_id,
      enrolled_on,
      agreed_fee,
      notes
    )
    VALUES (
      $1,
      $2,
      COALESCE($3::date, CURRENT_DATE),
      COALESCE($4::numeric, (SELECT price FROM programs WHERE id = $2)),
      $5
    )
    RETURNING *`,
    [
      student_id,
      program_id,
      enrolled_on ?? null,
      agreed_fee ?? null,
      notes ?? null,
    ],
  );

  return result.rows[0];
};

// ─────────────────────────────────────────────
// READ ENROLLMENT BY ID
// ─────────────────────────────────────────────

export const getEnrollmentById = async (id) => {
  const result = await query(`${ENROLLMENT_SELECT} WHERE e.id = $1`, [id]);

  return result.rows[0] ?? null;
};

// ─────────────────────────────────────────────
// READ ENROLLMENTS BY STUDENT
// ─────────────────────────────────────────────

export const getEnrollmentsByStudent = async (studentId) => {
  const result = await query(
    `${ENROLLMENT_SELECT}
    WHERE e.student_id = $1
    ORDER BY e.enrolled_on DESC, e.created_at DESC`,
    [studentId],
  );

  return result.rows;
};

// ─────────────────────────────────────────────
// READ ENROLLMENTS BY PROGRAM
// ─────────────────────────────────────────────

export const getEnrollmentsByProgram = async (programId) => {
  const result = await query(
    `SELECT
      x.*,
      s.student_no,
      s.full_name,
      s.phone,
      s.guardian_name,
      s.guardian_phone
    FROM (${ENROLLMENT_SELECT}) x
    JOIN students s ON s.id = x.student_id
    WHERE x.program_id = $1
    ORDER BY s.full_name ASC`,
    [programId],
  );

  return result.rows;
};

// ─────────────────────────────────────────────
// UPDATE ENROLLMENT
// ─────────────────────────────────────────────

// Status changes go through updateEnrollmentStatus so completed_on stays correct.
export const updateEnrollment = async (id, enrollmentData) => {
  const { enrolled_on, agreed_fee, progress, final_score, notes } =
    enrollmentData;

  const result = await query(
    `UPDATE student_enrollments
    SET
      enrolled_on = COALESCE($2, enrolled_on),
      agreed_fee = COALESCE($3, agreed_fee),
      progress = COALESCE($4, progress),
      final_score = COALESCE($5, final_score),
      notes = COALESCE($6, notes),
      updated_at = NOW()
    WHERE id = $1
    RETURNING *`,
    [
      id,
      enrolled_on ?? null,
      agreed_fee ?? null,
      progress ?? null,
      final_score ?? null,
      notes ?? null,
    ],
  );

  return result.rows[0] ?? null;
};

// ─────────────────────────────────────────────
// UPDATE ENROLLMENT STATUS
// ─────────────────────────────────────────────

// status: 'active' | 'on_hold' | 'dropped' | 'completed'
export const updateEnrollmentStatus = async (client, id, status) => {
  const result = await client.query(
    `UPDATE student_enrollments
    SET
      status = $2::varchar,
      completed_on = CASE
        WHEN $2::varchar = 'completed' THEN COALESCE(completed_on, CURRENT_DATE)
        ELSE NULL
      END,
      updated_at = NOW()
    WHERE id = $1
    RETURNING *`,
    [id, status],
  );

  return result.rows[0] ?? null;
};

// ─────────────────────────────────────────────
// DELETE ENROLLMENT
// ─────────────────────────────────────────────

export const deleteEnrollment = async (client, id) => {
  const result = await client.query(
    `DELETE FROM student_enrollments
    WHERE id = $1
    RETURNING id, student_id, program_id`,
    [id],
  );

  return result.rows[0] ?? null;
};

// ─────────────────────────────────────────────
// CREATE PAYMENT
// ─────────────────────────────────────────────

export const createPayment = async (client, paymentData) => {
  const { enrollment_id, amount, payment_method, reference, paid_at, status } =
    paymentData;

  const result = await client.query(
    `INSERT INTO student_payments (
      enrollment_id,
      amount,
      payment_method,
      reference,
      paid_at,
      status
    )
    VALUES (
      $1, $2, $3, $4,
      COALESCE($5::timestamptz, NOW()),
      $6
    )
    RETURNING *`,
    [
      enrollment_id,
      amount,
      payment_method,
      reference ?? null,
      paid_at ?? null,
      status ?? "successful",
    ],
  );

  return result.rows[0];
};

// ─────────────────────────────────────────────
// READ PAYMENTS BY ENROLLMENT
// ─────────────────────────────────────────────

export const getPaymentsByEnrollment = async (enrollmentId) => {
  const result = await query(
    `SELECT *
    FROM student_payments
    WHERE enrollment_id = $1
    ORDER BY paid_at DESC`,
    [enrollmentId],
  );

  return result.rows;
};

// ─────────────────────────────────────────────
// READ PAYMENT BY ID
// ─────────────────────────────────────────────

export const getPaymentById = async (id) => {
  const result = await query(`SELECT * FROM student_payments WHERE id = $1`, [
    id,
  ]);

  return result.rows[0] ?? null;
};

// ─────────────────────────────────────────────
// UPDATE PAYMENT STATUS
// ─────────────────────────────────────────────

// status: 'pending' | 'successful' | 'failed' | 'refunded'
export const updatePaymentStatus = async (client, id, status) => {
  const result = await client.query(
    `UPDATE student_payments
    SET status = $2
    WHERE id = $1
    RETURNING *`,
    [id, status],
  );

  return result.rows[0] ?? null;
};

// ─────────────────────────────────────────────
// DELETE PAYMENT
// ─────────────────────────────────────────────

export const deletePayment = async (client, id) => {
  const result = await client.query(
    `DELETE FROM student_payments
    WHERE id = $1
    RETURNING id, enrollment_id, amount`,
    [id],
  );

  return result.rows[0] ?? null;
};

// ─────────────────────────────────────────────
// READ ENROLLMENT FINANCIALS
// ─────────────────────────────────────────────

export const getEnrollmentFinancials = async (enrollmentId) => {
  const result = await query(
    `SELECT
      x.id AS enrollment_id,
      x.agreed_fee AS total_fee,
      x.amount_paid,
      x.balance,
      x.payment_status
    FROM (${ENROLLMENT_SELECT}) x
    WHERE x.id = $1`,
    [enrollmentId],
  );

  return result.rows[0] ?? null;
};

// ─────────────────────────────────────────────
// RECORD ATTENDANCE (insert or update for that day)
// ─────────────────────────────────────────────

export const recordAttendance = async (client, attendanceData) => {
  const { enrollment_id, session_date, status, remarks, recorded_by } =
    attendanceData;

  const result = await client.query(
    `INSERT INTO student_attendance (
      enrollment_id,
      session_date,
      status,
      remarks,
      recorded_by
    )
    VALUES ($1, $2, $3, $4, $5)
    ON CONFLICT (enrollment_id, session_date)
    DO UPDATE SET
      status = EXCLUDED.status,
      remarks = EXCLUDED.remarks,
      recorded_by = EXCLUDED.recorded_by
    RETURNING *`,
    [enrollment_id, session_date, status, remarks ?? null, recorded_by ?? null],
  );

  return result.rows[0];
};

// ─────────────────────────────────────────────
// READ ATTENDANCE BY ENROLLMENT
// ─────────────────────────────────────────────

export const getAttendanceByEnrollment = async (enrollmentId) => {
  const result = await query(
    `SELECT *
    FROM student_attendance
    WHERE enrollment_id = $1
    ORDER BY session_date DESC`,
    [enrollmentId],
  );

  return result.rows;
};

// ─────────────────────────────────────────────
// READ ATTENDANCE SUMMARY
// ─────────────────────────────────────────────

export const getAttendanceSummary = async (enrollmentId) => {
  const result = await query(
    `SELECT
      COUNT(*)::int AS total_recorded,
      COUNT(*) FILTER (WHERE status = 'present')::int AS present,
      COUNT(*) FILTER (WHERE status = 'late')::int AS late,
      COUNT(*) FILTER (WHERE status = 'absent')::int AS absent,
      COUNT(*) FILTER (WHERE status = 'excused')::int AS excused,
      COALESCE(
        ROUND(
          100.0 * COUNT(*) FILTER (WHERE status IN ('present', 'late'))
          / NULLIF(COUNT(*) FILTER (WHERE status <> 'excused'), 0),
          1
        ),
        0
      ) AS attendance_percentage
    FROM student_attendance
    WHERE enrollment_id = $1`,
    [enrollmentId],
  );

  return result.rows[0];
};

// ─────────────────────────────────────────────
// DELETE ATTENDANCE RECORD
// ─────────────────────────────────────────────

export const deleteAttendance = async (client, id) => {
  const result = await client.query(
    `DELETE FROM student_attendance
    WHERE id = $1
    RETURNING id, enrollment_id, session_date`,
    [id],
  );

  return result.rows[0] ?? null;
};

// ─────────────────────────────────────────────
// CERTIFICATE ELIGIBILITY
// ─────────────────────────────────────────────

// Rules (adjust to your academy's policy):
// - enrollment status is 'completed' and progress is 100
// - attendance is at least minAttendance %
// - balance is fully cleared
// - no certificate is currently issued
export const getCertificateEligibility = async (
  enrollmentId,
  { minAttendance = 75 } = {},
) => {
  const enrollment = await getEnrollmentById(enrollmentId);
  if (!enrollment) return null;

  const reasons = [];

  if (enrollment.status !== "completed") {
    reasons.push("Enrollment is not marked as completed");
  }
  if (Number(enrollment.progress) < 100) {
    reasons.push("Course progress is below 100%");
  }
  if (Number(enrollment.attendance_percentage) < minAttendance) {
    reasons.push(`Attendance is below ${minAttendance}%`);
  }
  if (Number(enrollment.balance) > 0) {
    reasons.push("There is an outstanding fee balance");
  }
  if (enrollment.certificate_status === "issued") {
    reasons.push("A certificate has already been issued");
  }

  return { eligible: reasons.length === 0, reasons, enrollment };
};

// ─────────────────────────────────────────────
// ISSUE CERTIFICATE
// ─────────────────────────────────────────────

// Call getCertificateEligibility first in the controller/service.
// The partial unique index blocks a second 'issued' certificate.
export const issueCertificate = async (client, enrollmentId, type) => {
  const certificateNo = await generateCertificateNo(client);

  const result = await client.query(
    `INSERT INTO student_certificates (
      enrollment_id,
      certificate_no,
      certificate_type
    )
    VALUES ($1, $2, $3)
    RETURNING *`,
    [enrollmentId, certificateNo, type ?? "completion"],
  );

  return result.rows[0];
};

// ─────────────────────────────────────────────
// READ CERTIFICATES BY ENROLLMENT
// ─────────────────────────────────────────────

export const getCertificatesByEnrollment = async (enrollmentId) => {
  const result = await query(
    `SELECT *
    FROM student_certificates
    WHERE enrollment_id = $1
    ORDER BY issued_at DESC`,
    [enrollmentId],
  );

  return result.rows;
};

// ─────────────────────────────────────────────
// REVOKE CERTIFICATE
// ─────────────────────────────────────────────

export const revokeCertificate = async (client, id) => {
  const result = await client.query(
    `UPDATE student_certificates
    SET
      status = 'revoked',
      revoked_at = NOW()
    WHERE id = $1
      AND status = 'issued'
    RETURNING *`,
    [id],
  );

  return result.rows[0] ?? null;
};

// ─────────────────────────────────────────────
// VERIFY CERTIFICATE (public)
// ─────────────────────────────────────────────

// Returns only non-sensitive fields: no phone, email or guardian details.
export const verifyCertificate = async (certificateNo) => {
  const result = await query(
    `SELECT
      sc.certificate_no,
      sc.certificate_type,
      sc.issued_at,
      sc.status,
      sc.revoked_at,
      s.full_name,
      p.title AS program_title,
      e.completed_on
    FROM student_certificates sc
    JOIN student_enrollments e ON e.id = sc.enrollment_id
    JOIN students s ON s.id = e.student_id
    JOIN programs p ON p.id = e.program_id
    WHERE sc.certificate_no = $1`,
    [certificateNo],
  );

  return result.rows[0] ?? null;
};

// ─────────────────────────────────────────────
// CREATE ASSESSMENT
// ─────────────────────────────────────────────

export const createAssessment = async (client, assessmentData) => {
  const { enrollment_id, title, score, max_score, assessed_at, remarks } =
    assessmentData;

  const result = await client.query(
    `INSERT INTO student_assessments (
      enrollment_id,
      title,
      score,
      max_score,
      assessed_at,
      remarks
    )
    VALUES (
      $1, $2, $3,
      COALESCE($4::numeric, 100),
      COALESCE($5::date, CURRENT_DATE),
      $6
    )
    RETURNING *`,
    [
      enrollment_id,
      title,
      score,
      max_score ?? null,
      assessed_at ?? null,
      remarks ?? null,
    ],
  );

  return result.rows[0];
};

// ─────────────────────────────────────────────
// READ ASSESSMENTS BY ENROLLMENT
// ─────────────────────────────────────────────

export const getAssessmentsByEnrollment = async (enrollmentId) => {
  const result = await query(
    `SELECT
      *,
      ROUND(100.0 * score / max_score, 1) AS percentage
    FROM student_assessments
    WHERE enrollment_id = $1
    ORDER BY assessed_at DESC, created_at DESC`,
    [enrollmentId],
  );

  return result.rows;
};

// ─────────────────────────────────────────────
// UPDATE ASSESSMENT
// ─────────────────────────────────────────────

export const updateAssessment = async (id, assessmentData) => {
  const { title, score, max_score, assessed_at, remarks } = assessmentData;

  const result = await query(
    `UPDATE student_assessments
    SET
      title = COALESCE($2, title),
      score = COALESCE($3, score),
      max_score = COALESCE($4, max_score),
      assessed_at = COALESCE($5, assessed_at),
      remarks = COALESCE($6, remarks)
    WHERE id = $1
    RETURNING *`,
    [
      id,
      title ?? null,
      score ?? null,
      max_score ?? null,
      assessed_at ?? null,
      remarks ?? null,
    ],
  );

  return result.rows[0] ?? null;
};

// ─────────────────────────────────────────────
// DELETE ASSESSMENT
// ─────────────────────────────────────────────

export const deleteAssessment = async (client, id) => {
  const result = await client.query(
    `DELETE FROM student_assessments
    WHERE id = $1
    RETURNING id, enrollment_id, title`,
    [id],
  );

  return result.rows[0] ?? null;
};
