import { Router } from "express";
// import { pool } from "../config/db.js";

const router = Router();

// Check whether the API is running.
router.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    status: "healthy",
    service: "Futuristic Coders API",
    timestamp: new Date().toISOString(),
  });
});

// // Check whether PostgreSQL is reachable.
// router.get("/db", async (req, res, next) => {
//   try {
//     const result = await pool.query(
//       "SELECT NOW() AS database_time"
//     );

//     res.status(200).json({
//       success: true,
//       message: "Database connection successful",
//       databaseTime: result.rows[0].database_time,
//     });
//   } catch (error) {
//     next(error);
//   }
// });

export default router;