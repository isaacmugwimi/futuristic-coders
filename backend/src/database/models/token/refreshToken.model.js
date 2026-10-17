
import { query } from "../../config/config.db.js";

// ====================
// CREATE TABLE
// ====================

export const CREATE_REFRESH_TOKENS_TABLE = `
  CREATE TABLE IF NOT EXISTS refresh_tokens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    user_id UUID NOT NULL
      REFERENCES users(id) ON DELETE CASCADE,

    token_hash TEXT NOT NULL,
    expires_at TIMESTAMPTZ NOT NULL,
    revoked_at TIMESTAMPTZ DEFAULT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    last_used_at TIMESTAMPTZ DEFAULT NULL,
    ip_address TEXT DEFAULT NULL,
    user_agent TEXT DEFAULT NULL
  );

  CREATE INDEX IF NOT EXISTS idx_refresh_tokens_user
    ON refresh_tokens(user_id);

  CREATE INDEX IF NOT EXISTS idx_refresh_tokens_token_hash
    ON refresh_tokens(token_hash);

  CREATE INDEX IF NOT EXISTS idx_refresh_tokens_expires_at
    ON refresh_tokens(expires_at);

  CREATE INDEX IF NOT EXISTS idx_refresh_tokens_revoked_at
    ON refresh_tokens(revoked_at);
`;

export async function createRefreshTokensTable() {
  await query(CREATE_REFRESH_TOKENS_TABLE);
}

// ====================
// CREATE REFRESH TOKEN
// ====================

export const createRefreshToken = async (
  {
    user_id,
    token_hash,
    expires_at,
    ip_address = null,
    user_agent = null,
  },
  client = { query },
) => {
  const sql = `
    INSERT INTO refresh_tokens (
      user_id,
      token_hash,
      expires_at,
      ip_address,
      user_agent
    )
    VALUES ($1, $2, $3, $4, $5)
    RETURNING
      id,
      user_id,
      expires_at,
      revoked_at,
      created_at,
      last_used_at,
      ip_address,
      user_agent;
  `;

  const values = [
    user_id,
    token_hash,
    expires_at,
    ip_address,
    user_agent,
  ];

  const result = await client.query(sql, values);

  return result.rows[0];
};

// ====================
// GET TOKEN BY HASH
// ====================

export const getRefreshTokenByHash = async (tokenHash) => {
  const sql = `
    SELECT
      id,
      user_id,
      token_hash,
      expires_at,
      revoked_at,
      created_at,
      last_used_at,
      ip_address,
      user_agent
    FROM refresh_tokens
    WHERE token_hash = $1
      AND revoked_at IS NULL
      AND expires_at > NOW()
    LIMIT 1;
  `;

  const result = await query(sql, [tokenHash]);

  return result.rows[0] ?? null;
};

// ====================
// GET TOKEN BY ID
// ====================

export const getRefreshTokenById = async (id, userId) => {
  const sql = `
    SELECT
      id,
      user_id,
      expires_at,
      revoked_at,
      created_at,
      last_used_at,
      ip_address,
      user_agent
    FROM refresh_tokens
    WHERE id = $1
      AND user_id = $2;
  `;

  const result = await query(sql, [id, userId]);

  return result.rows[0] ?? null;
};

// ====================
// GET USER ACTIVE SESSIONS
// ====================

export const getUserActiveSessions = async (userId) => {
  const sql = `
    SELECT
      id,
      user_id,
      expires_at,
      created_at,
      last_used_at,
      ip_address,
      user_agent
    FROM refresh_tokens
    WHERE user_id = $1
      AND revoked_at IS NULL
      AND expires_at > NOW()
    ORDER BY
      last_used_at DESC NULLS LAST,
      created_at DESC;
  `;

  const result = await query(sql, [userId]);

  return result.rows;
};

// ====================
// COUNT ACTIVE SESSIONS
// ====================

export const countActiveSessions = async (userId) => {
  const sql = `
    SELECT COUNT(*)::INTEGER AS active_sessions
    FROM refresh_tokens
    WHERE user_id = $1
      AND revoked_at IS NULL
      AND expires_at > NOW();
  `;

  const result = await query(sql, [userId]);

  return result.rows[0];
};

// ====================
// UPDATE LAST USED
// ====================

export const updateRefreshTokenLastUsed = async (
  id,
  { ip_address = null, user_agent = null } = {},
) => {
  const sql = `
    UPDATE refresh_tokens
    SET
      last_used_at = NOW(),
      ip_address = COALESCE($1, ip_address),
      user_agent = COALESCE($2, user_agent)
    WHERE id = $3
      AND revoked_at IS NULL
      AND expires_at > NOW()
    RETURNING
      id,
      last_used_at,
      ip_address,
      user_agent;
  `;

  const result = await query(sql, [ip_address, user_agent, id]);

  return result.rows[0] ?? null;
};

// ====================
// REVOKE ONE TOKEN
// ====================

export const revokeRefreshToken = async (sessionId) => {
  const sql = `
    UPDATE refresh_tokens
    SET revoked_at = NOW()
    WHERE id = $1
      AND revoked_at IS NULL
    RETURNING
      id,
      user_id,
      revoked_at;
  `;

  const result = await query(sql, [sessionId]);

  return result.rows[0] ?? null;
};

// ====================
// REVOKE ALL USER TOKENS
// ====================

export const revokeAllUserRefreshTokens = async (userId) => {
  const sql = `
    UPDATE refresh_tokens
    SET revoked_at = NOW()
    WHERE user_id = $1
      AND revoked_at IS NULL
    RETURNING
      id,
      user_id,
      revoked_at;
  `;

  const result = await query(sql, [userId]);

  return result.rows;
};

// ====================
// REVOKE OTHER TOKENS
// ====================

export const revokeAllOtherRefreshTokens = async (
  currentSessionId,
  userId,
) => {
  const sql = `
    UPDATE refresh_tokens
    SET revoked_at = NOW()
    WHERE user_id = $1
      AND id <> $2
      AND revoked_at IS NULL
    RETURNING
      id,
      user_id,
      revoked_at;
  `;

  const result = await query(sql, [userId, currentSessionId]);

  return result.rows;
};

// ====================
// DELETE EXPIRED TOKENS
// ====================

export const deleteExpiredRefreshTokens = async () => {
  const sql = `
    DELETE FROM refresh_tokens
    WHERE expires_at <= NOW()
    RETURNING id;
  `;

  const result = await query(sql);

  return result.rows;
};

// ====================
// DELETE REVOKED TOKENS
// ====================

export const deleteRevokedRefreshTokens = async () => {
  const sql = `
    DELETE FROM refresh_tokens
    WHERE revoked_at IS NOT NULL
    RETURNING id;
  `;

  const result = await query(sql);

  return result.rows;
};
