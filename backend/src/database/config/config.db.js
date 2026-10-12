import pkg from "pg";

const { Pool } = pkg;

// Environment variables
const { PGHOST, PGUSER, PGPASSWORD, PGDATABASE, PGPORT } = process.env;

// PostgreSQL connection pool
const pool = new Pool({
  host: PGHOST,
  user: PGUSER,
  password: PGPASSWORD,
  database: PGDATABASE,
  port: Number(PGPORT),

  ssl: {
    rejectUnauthorized: false,
  },
});

console.log("🟢 DB HOST:", PGHOST);

// Handle unexpected idle connection errors
pool.on("error", (err) => {
  console.error("❌ Unexpected PG Pool Error:", err.message);
});

// Query helper
export const query = async (text, params = []) => {
  try {
    return await pool.query(text, params);
  } catch (error) {
    console.error("❌ Database Query Error:", error.message);
    throw error;
  }
};

// Test database connectivity
export const initDb = async () => {
  let client;

  try {
    client = await pool.connect();

    const result = await client.query(`
      SELECT
        NOW() AS database_time,
        current_database() AS database_name,
        current_user AS connected_user,
        version() AS postgres_version
    `);

    const db = result.rows[0];

    console.log("✅ Supabase database connected successfully!");
    console.log("📦 Database:", db.database_name);
    console.log("👤 Connected user:", db.connected_user);
    console.log("🕒 Database time:", db.database_time);
    console.log("🐘 PostgreSQL:", db.postgres_version);
  } catch (error) {
    console.error("❌ Supabase database connection failed!");
    console.error("Error code:", error.code);
    console.error("Error message:", error.message);
    throw error;
  } finally {
    client?.release();
  }
};

export { pool };
export default pool;
