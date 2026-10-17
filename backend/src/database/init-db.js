import { createProgramTables } from "./models/programs/program.model.js";
import { createUsersTable } from "./queries/users/user.queries.js";

export const initDb = async () => {
  try {
    await createUsersTable();

    await createProgramTables();

    console.log("✅ Users table and staff-code sequence initialized");
  } catch (error) {
    console.error("❌ Error initializing database:", error);
    throw error;
  }
};
