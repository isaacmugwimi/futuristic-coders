
import { query } from "../../config/config.db.js";

// Columns returned to the app (never the password hash)
const USER_COLUMNS =
  "id, staff_code, full_name, email, phone, role, is_active, created_at, updated_at";

// Use the transaction client when one is passed, otherwise the shared helper
const run = (client, text, params = []) =>
  client ? client.query(text, params) : query(text, params);

// Emails are always stored and searched in lower case
const cleanEmail = (email) =>
  email == null ? null : String(email).trim().toLowerCase();

/* ============================================================================
 * TABLE CREATION
 * ========================================================================== */

export const CREATE_USERS_TABLE = `
  CREATE TABLE IF NOT EXISTS users (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    staff_code  VARCHAR(20)  NOT NULL UNIQUE,
    full_name   VARCHAR(150) NOT NULL,
    email       VARCHAR(255) NOT NULL UNIQUE,
    phone       VARCHAR(30)  NOT NULL,
    password    TEXT         NOT NULL,
    role        VARCHAR(20)  NOT NULL DEFAULT 'admin' CHECK (role IN ('admin', 'owner')),
    is_active   BOOLEAN      NOT NULL DEFAULT TRUE,
    created_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW()
  );
`;

// Staff codes come from a sequence, so two people created at the same time
// can never get the same number.
export const CREATE_STAFF_CODE_SEQUENCE = `CREATE SEQUENCE IF NOT EXISTS staff_code_seq START 1;`;

// Call this from initDb(). Safe to run every time the server starts.
export async function createUsersTable() {
  await query(CREATE_USERS_TABLE);
  await query(CREATE_STAFF_CODE_SEQUENCE);
}

/* ============================================================================
 * STAFF CODE
 * ========================================================================== */

// STF-0001, STF-0002, ...
export async function generateStaffCode(client = null) {
  const { rows } = await run(client, `SELECT nextval('staff_code_seq') AS n`);
  return `STF-${String(rows[0].n).padStart(4, "0")}`;
}

/* ============================================================================
 * CREATE
 * ========================================================================== */

// `password` must already be hashed (bcryptjs) before it gets here.
export async function createUser(
  { fullName, email, phone, password, role = "admin" },
  client = null,
) {
  const staffCode = await generateStaffCode(client);

  const { rows } = await run(
    client,
    `INSERT INTO users (staff_code, full_name, email, phone, password, role)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING ${USER_COLUMNS}`,
    [
      staffCode,
      fullName?.trim(),
      cleanEmail(email),
      phone?.trim(),
      password,
      role,
    ],
  );
  return rows[0];
}

/* ============================================================================
 * READ
 * ========================================================================== */

export async function getAllUsers() {
  const { rows } = await query(
    `SELECT ${USER_COLUMNS} FROM users ORDER BY created_at DESC`,
  );
  return rows;
}

export async function getUserById(id) {
  const { rows } = await query(
    `SELECT ${USER_COLUMNS} FROM users WHERE id = $1`,
    [id],
  );
  return rows[0] ?? null;
}

// Used for login: this is the only query that returns the password hash.
export async function getUserByEmail(email) {
  const { rows } = await query(
    `SELECT ${USER_COLUMNS}, password FROM users WHERE email = $1`,
    [cleanEmail(email)],
  );
  return rows[0] ?? null;
}

/* ============================================================================
 * UPDATE
 * ========================================================================== */

// Only the fields you pass are changed. Returns the updated user, or null.
export async function updateUser(
  id,
  { fullName, email, phone, role, isActive } = {},
) {
  const { rows } = await query(
    `UPDATE users
        SET full_name  = COALESCE($2, full_name),
            email      = COALESCE($3, email),
            phone      = COALESCE($4, phone),
            role       = COALESCE($5, role),
            is_active  = COALESCE($6, is_active),
            updated_at = NOW()
      WHERE id = $1
      RETURNING ${USER_COLUMNS}`,
    [
      id,
      fullName?.trim() ?? null,
      cleanEmail(email),
      phone?.trim() ?? null,
      role ?? null,
      isActive ?? null,
    ],
  );
  return rows[0] ?? null;
}

/* ============================================================================
 * DELETE
 * ========================================================================== */

// Returns the deleted user, or null if it didn't exist.
export async function deleteUser(id) {
  const { rows } = await query(
    `DELETE FROM users WHERE id = $1 RETURNING ${USER_COLUMNS}`,
    [id],
  );
  return rows[0] ?? null;
}
