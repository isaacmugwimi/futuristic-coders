import { createProgramTables } from "./models/programs/program.model.js";
import { createStudentTables } from "./models/students/student.model.js";
import { createTestimonialTables } from "./models/testimonial/testimonial.model.js";
import { createRefreshTokensTable } from "./models/token/refreshToken.model.js";
import { createUsersTable } from "./models/users/user.model.js";
// import { createUsersTable } from "./queries/users/user.queries.js";

export const initDb = async () => {
  try {
    await createUsersTable();
    await createProgramTables();
    await createRefreshTokensTable();
    await createStudentTables();
    await createTestimonialTables()

    console.log("✅ Tables initialized");
  } catch (error) {
    console.error("❌ Error initializing database:", error);
    throw error;
  }
};
