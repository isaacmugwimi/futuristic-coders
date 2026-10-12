
import "dotenv/config";
import pkg from "pg";

const { Pool } = pkg;

const {
  PGHOST,
  PGUSER,
  PGPASSWORD,
  PGDATABASE,
  PGPORT,
} = process.env;

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

pool.on("error", (err) => {
  console.error("❌ Unexpected PG Pool Error:", err.message);
});

export const query = async (text, params = []) => {
  try {
    return await pool.query(text, params);
  } catch (error) {
    console.error("❌ Database Query Error:", error.message);
    throw error;
  }
};

export { pool };
export default pool;

