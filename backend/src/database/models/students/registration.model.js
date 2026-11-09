import { query } from "../../config/config.db.js";

export const CREATE_REGISTRATION_REQUESTS_TABLE = `
  CREATE TABLE IF NOT EXISTS registration_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    full_name VARCHAR(150) NOT NULL,
    email VARCHAR(255),
    phone VARCHAR(20),
    guardian_name VARCHAR(150),
    guardian_phone VARCHAR(20),
    age_group VARCHAR(30),
    county VARCHAR(100),
    notes TEXT,

    program_id UUID NOT NULL REFERENCES programs(id)
      ON UPDATE CASCADE ON DELETE CASCADE,

    status VARCHAR(20) NOT NULL DEFAULT 'pending'
      CHECK (status IN ('pending', 'approved', 'rejected')),
    rejection_reason TEXT,

    student_id UUID REFERENCES students(id) ON DELETE SET NULL,
    reviewed_by UUID REFERENCES users(id) ON DELETE SET NULL,
    reviewed_at TIMESTAMPTZ,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  );

  CREATE INDEX IF NOT EXISTS idx_registration_requests_status
    ON registration_requests(status, created_at DESC);

  -- The same person can't have two pending requests for the same program.
  CREATE UNIQUE INDEX IF NOT EXISTS idx_registration_one_pending
    ON registration_requests (
      LOWER(full_name),
      COALESCE(phone, guardian_phone, email),
      program_id
    )
    WHERE status = 'pending';
`;

// Must run after createStudentTables() (it references students and programs).
export const createRegistrationTables = async () => {
  await query(CREATE_REGISTRATION_REQUESTS_TABLE);
};

const REGISTRATION_SELECT = `
  SELECT r.*, p.title AS program_title, p.price AS program_price
  FROM registration_requests r
  JOIN programs p ON p.id = r.program_id
`;

export const createRegistrationRequest = async (d) => {
  const result = await query(
    `INSERT INTO registration_requests (
      full_name, email, phone, guardian_name, guardian_phone,
      age_group, county, notes, program_id
    ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
    RETURNING id, created_at`,
    [
      d.full_name,
      d.email,
      d.phone,
      d.guardian_name,
      d.guardian_phone,
      d.age_group,
      d.county,
      d.notes,
      d.program_id,
    ],
  );
  return result.rows[0];
};

export const findPendingRegistration = async (d) => {
  const result = await query(
    `SELECT id FROM registration_requests
     WHERE status = 'pending'
       AND program_id = $1
       AND LOWER(full_name) = LOWER($2)
       AND COALESCE(phone, guardian_phone, email) = $3
     LIMIT 1`,
    [d.program_id, d.full_name, d.phone ?? d.guardian_phone ?? d.email],
  );
  return result.rows[0] ?? null;
};

export const getAllRegistrationRequests = async ({ status, search } = {}) => {
  const params = [];
  const where = [];

  if (status) {
    params.push(status);
    where.push(`r.status = $${params.length}`);
  }
  if (search && search.trim()) {
    params.push(`%${search.trim()}%`);
    where.push(`(r.full_name ILIKE $${params.length}
      OR r.phone ILIKE $${params.length}
      OR r.guardian_name ILIKE $${params.length}
      OR p.title ILIKE $${params.length})`);
  }

  const result = await query(
    `${REGISTRATION_SELECT}
     ${where.length ? `WHERE ${where.join(" AND ")}` : ""}
     ORDER BY r.created_at DESC
     LIMIT 500`,
    params,
  );
  return result.rows;
};

export const getRegistrationRequestById = async (id) => {
  const result = await query(`${REGISTRATION_SELECT} WHERE r.id = $1`, [id]);
  return result.rows[0] ?? null;
};

export const getRegistrationCounts = async () => {
  const result = await query(
    `SELECT
      COUNT(*) FILTER (WHERE status = 'pending')::int AS pending,
      COUNT(*) FILTER (WHERE status = 'approved')::int AS approved,
      COUNT(*) FILTER (WHERE status = 'rejected')::int AS rejected
     FROM registration_requests`,
  );
  return result.rows[0];
};

export const rejectRegistrationRequest = async (id, reason, userId) => {
  const result = await query(
    `UPDATE registration_requests
     SET status = 'rejected', rejection_reason = $2,
         reviewed_by = $3, reviewed_at = NOW()
     WHERE id = $1 AND status = 'pending'
     RETURNING *`,
    [id, reason, userId],
  );
  return result.rows[0] ?? null;
};
