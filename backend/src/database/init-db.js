
// import { createUsersTable } from "../queries/users/user.queries.js";

import { createUsersTable } from "./queries/users/user.queries.js";

export const initDb = async () => {
  try {
    await createUsersTable();

    console.log("✅ Users table and staff-code sequence initialized");
  } catch (error) {
    console.error("❌ Error initializing database:", error);
    throw error;
  }
};
