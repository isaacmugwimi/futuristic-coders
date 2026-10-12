import pkg from "pg";

const { Pool } = pkg;

// ========================================
// 🔹 Environment Variables
// ========================================
const { PGHOST, PGUSER, PGPASSWORD, PGDATABASE, PGPORT } = process.env;

// ========================================
// 🔹 PostgreSQL Pool
// ========================================

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

// Prevent crashes on idle client errors
pool.on("error", (err) => {
  console.error("❌ Unexpected PG Pool Error:", err);
});

// ========================================
// 🔹 Query Helper
// ========================================

export const query = async (text, params = []) => {
  try {
    const result = await pool.query(text, params);
    return result;
  } catch (error) {
    console.error("❌ Database Query Error:", error.message);
    throw error;
  }
};

// ========================================
// 🔹 Initialize Database & Tables
// ========================================

export const initDb = async () => {
  try {
    // call tables here

    // await query(CREATE_USERS_TABLE);

    console.log("✅ tables will be initialized here");
  } catch (error) {
    console.error("❌ Error initializing DB:", error);
    throw error;
  }
};

// ========================================
// 🔹 Graceful Shutdown
// ========================================

process.on("SIGINT", async () => {
  await pool.end();
  console.log("🛑 PostgreSQL Pool Closed");
  process.exit(0);
});

export default pool;
