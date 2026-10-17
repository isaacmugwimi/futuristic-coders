import { query } from "../../config/config.db.js";

/* ============================================================================
 * USER COLUMNS
 * ========================================================================== */

const USER_COLUMNS = `
  id,
  staff_code,
  full_name,
  email,
  phone,
  profile_picture_url,
  role,
  is_active,
  created_at,
  updated_at
`;

/* ============================================================================
 * TABLE CREATION
 * ========================================================================== */

export const CREATE_USERS_TABLE = `
  CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    staff_code VARCHAR(20) NOT NULL UNIQUE,
    full_name VARCHAR(150) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    phone VARCHAR(30) NOT NULL,
    profile_picture_url TEXT DEFAULT NULL,
    password TEXT NOT NULL,
    role VARCHAR(20) NOT NULL DEFAULT 'admin'
      CHECK (role IN ('admin', 'owner')),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    last_login TIMESTAMPTZ DEFAULT NULL,
    two_factor_enabled BOOLEAN NOT NULL DEFAULT FALSE,
    login_alerts_enabled BOOLEAN NOT NULL DEFAULT TRUE,
    password_reset_token TEXT DEFAULT NULL,
    password_reset_expires TIMESTAMPTZ DEFAULT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  );

  CREATE INDEX IF NOT EXISTS idx_users_email
    ON users(email);

  CREATE INDEX IF NOT EXISTS idx_users_role
    ON users(role);

  CREATE INDEX IF NOT EXISTS idx_users_is_active
    ON users(is_active);

  CREATE INDEX IF NOT EXISTS idx_users_password_reset_token
    ON users(password_reset_token);
`;

export const CREATE_STAFF_CODE_SEQUENCE = `
  CREATE SEQUENCE IF NOT EXISTS staff_code_seq START 1;
`;

export async function createUsersTable() {
  await query(CREATE_USERS_TABLE);
  await query(CREATE_STAFF_CODE_SEQUENCE);
}

/* ============================================================================
 * STAFF CODE
 * ========================================================================== */

export async function generateStaffCode() {
  const { rows } = await query(`SELECT nextval('staff_code_seq') AS n`);

  return `STF-${String(rows[0].n).padStart(4, "0")}`;
}

/* ============================================================================
 * CREATE USER
 * ========================================================================== */

export async function createUser({
  fullName,
  email,
  phone,
  password,
  profilePictureUrl = null,
  role = "admin",
}) {
  const staffCode = await generateStaffCode();

  const { rows } = await query(
    `INSERT INTO users (
       staff_code,
       full_name,
       email,
       phone,
       profile_picture_url,
       password,
       role
     )
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     RETURNING ${USER_COLUMNS}`,
    [
      staffCode,
      fullName?.trim(),
      email?.trim().toLowerCase(),
      phone?.trim(),
      profilePictureUrl,
      password,
      role,
    ],
  );

  return rows[0];
}

/* ============================================================================
 * READ USERS
 * ========================================================================== */

export async function getAllUsers() {
  const { rows } = await query(
    `SELECT ${USER_COLUMNS},
            last_login,
            two_factor_enabled,
            login_alerts_enabled
     FROM users
     ORDER BY created_at DESC`,
  );

  return rows;
}

export async function getUserById(id) {
  const { rows } = await query(
    `SELECT ${USER_COLUMNS},
            last_login,
            two_factor_enabled,
            login_alerts_enabled
     FROM users
     WHERE id = $1`,
    [id],
  );

  return rows[0] ?? null;
}

// Used during login. This query also returns the password hash.
export async function getUserByEmail(email) {
  const { rows } = await query(
    `SELECT ${USER_COLUMNS},
            password,
            last_login,
            two_factor_enabled,
            login_alerts_enabled
     FROM users
     WHERE LOWER(email) = LOWER($1)`,
    [email?.trim()],
  );

  return rows[0] ?? null;
}

export async function getUserByStaffCode(staffCode) {
  const { rows } = await query(
    `SELECT ${USER_COLUMNS}
     FROM users
     WHERE staff_code = $1`,
    [staffCode?.trim()],
  );

  return rows[0] ?? null;
}

export async function emailExists(email, excludeUserId = null) {
  const { rows } = await query(
    `SELECT EXISTS (
       SELECT 1
       FROM users
       WHERE LOWER(email) = LOWER($1)
         AND ($2::uuid IS NULL OR id <> $2)
     ) AS exists`,
    [email?.trim(), excludeUserId],
  );

  return rows[0].exists;
}

/* ============================================================================
 * SEARCH USERS
 * ========================================================================== */

export async function searchUsers(search) {
  const searchTerm = `%${String(search ?? "").trim()}%`;

  const { rows } = await query(
    `SELECT ${USER_COLUMNS},
            last_login,
            two_factor_enabled,
            login_alerts_enabled
     FROM users
     WHERE full_name ILIKE $1
        OR email ILIKE $1
        OR phone ILIKE $1
        OR staff_code ILIKE $1
        OR role ILIKE $1
     ORDER BY full_name ASC
     LIMIT 50`,
    [searchTerm],
  );

  return rows;
}

/* ============================================================================
 * USER STATISTICS
 * ========================================================================== */

export async function getUserStatistics() {
  const { rows } = await query(
    `SELECT
       COUNT(*) AS total_users,
       COUNT(*) FILTER (WHERE is_active = TRUE) AS active_users,
       COUNT(*) FILTER (WHERE is_active = FALSE) AS inactive_users,
       COUNT(*) FILTER (WHERE role = 'owner') AS owners,
       COUNT(*) FILTER (WHERE role = 'admin') AS administrators
     FROM users`,
  );

  return rows[0];
}

/* ============================================================================
 * UPDATE USER
 * ========================================================================== */

// Pass only the fields to update.
// Use profilePictureUrl: "" to clear the profile picture.
export async function updateUser(
  id,
  { fullName, email, phone, profilePictureUrl, role, isActive } = {},
) {
  const { rows } = await query(
    `UPDATE users
        SET full_name = COALESCE($2, full_name),
            email = COALESCE($3, email),
            phone = COALESCE($4, phone),
            profile_picture_url =
              CASE
                WHEN $5::boolean THEN $6
                ELSE profile_picture_url
              END,
            role = COALESCE($7, role),
            is_active = COALESCE($8, is_active),
            updated_at = NOW()
      WHERE id = $1
      RETURNING ${USER_COLUMNS}`,
    [
      id,
      fullName?.trim() ?? null,
      email == null ? null : email.trim().toLowerCase(),
      phone?.trim() ?? null,
      profilePictureUrl !== undefined && profilePictureUrl !== null,
      profilePictureUrl === "" ? null : (profilePictureUrl ?? null),
      role ?? null,
      isActive ?? null,
    ],
  );

  return rows[0] ?? null;
}

/* ============================================================================
 * ACTIVATE / DEACTIVATE
 * ========================================================================== */

export async function activateUser(id) {
  const { rows } = await query(
    `UPDATE users
        SET is_active = TRUE,
            updated_at = NOW()
      WHERE id = $1
      RETURNING ${USER_COLUMNS}`,
    [id],
  );

  return rows[0] ?? null;
}

export async function deactivateUser(id) {
  const { rows } = await query(
    `UPDATE users
        SET is_active = FALSE,
            updated_at = NOW()
      WHERE id = $1
      RETURNING ${USER_COLUMNS}`,
    [id],
  );

  return rows[0] ?? null;
}

/* ============================================================================
 * DELETE USER
 * ========================================================================== */

export async function deleteUser(id) {
  const { rows } = await query(
    `DELETE FROM users
     WHERE id = $1
     RETURNING ${USER_COLUMNS}`,
    [id],
  );

  return rows[0] ?? null;
}

/* ============================================================================
 * AUTHENTICATION HELPERS
 * ========================================================================== */

export async function updateLastLogin(userId) {
  const { rows } = await query(
    `UPDATE users
        SET last_login = NOW(),
            updated_at = NOW()
      WHERE id = $1
      RETURNING id, last_login`,
    [userId],
  );

  return rows[0] ?? null;
}

/* ============================================================================
 * PASSWORD RESET HELPERS
 * ========================================================================== */

export async function setPasswordResetToken(email, tokenHash, expiresAt) {
  const { rows } = await query(
    `UPDATE users
        SET password_reset_token = $1,
            password_reset_expires = $2,
            updated_at = NOW()
      WHERE LOWER(email) = LOWER($3)
      RETURNING id, full_name, email`,
    [tokenHash, expiresAt, email?.trim()],
  );

  return rows[0] ?? null;
}

export async function getUserByPasswordResetTokenHash(tokenHash) {
  const { rows } = await query(
    `SELECT id, full_name, email
     FROM users
     WHERE password_reset_token = $1
       AND password_reset_expires > NOW()`,
    [tokenHash],
  );

  return rows[0] ?? null;
}

export async function resetPasswordWithToken(userId, hashedPassword) {
  const { rows } = await query(
    `UPDATE users
        SET password = $1,
            password_reset_token = NULL,
            password_reset_expires = NULL,
            updated_at = NOW()
      WHERE id = $2
      RETURNING id, updated_at`,
    [hashedPassword, userId],
  );

  return rows[0] ?? null;
}
