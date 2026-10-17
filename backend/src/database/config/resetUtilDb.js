// RESET ENTIRE DATABASE

import { query } from "./config.db.js";

// import { query } from "../Config/config.db.js";

export const resetDb = async () => {
  try {
    console.log("⚠️ Resetting database...");

    await query(`
      DROP SCHEMA public CASCADE;
      CREATE SCHEMA public;
    `);

    console.log("✅ Database reset successfully");
  } catch (error) {
    console.error("❌ Error resetting database:", error);

    throw error;
  }
};
