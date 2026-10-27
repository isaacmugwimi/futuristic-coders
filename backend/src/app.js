import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

import healthRoutes from "./routes/health.routes/health.route.js";
import authRoutes from "./routes/auth/auth.routes.js";
import userRoutes from "./routes/users/user.routes.js";
import programRoutes from "./routes/programs/program.routes.js";
import studentRoutes from "./routes/students/students.routes.js";
import testimonialRoutes from "./routes/testimonial/testimonial.routes.js";

import AppError from "./middleware/error/AppError.js";
import { resetDb } from "./database/config/resetUtilDb.js";

const app = express();

// ============================================================================
// CORS CONFIGURATION
// ============================================================================

const allowedOrigins = [
  "http://localhost:3000",
  "http://localhost:3001",
  process.env.FRONTEND_URL,
  process.env.ADMIN_URL,
 
].filter(Boolean);

app.use(
  cors({
    origin(origin, callback) {
      // Allow requests without an Origin header, e.g. local tools.
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(
        new AppError("This origin is not allowed to access the API.", 403),
      );
    },
    credentials: true,
  }),
);

// ============================================================================
// BODY PARSERS & COOKIE PARSER
// ============================================================================

app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// ============================================================================
// ROOT ROUTE
// ============================================================================

app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Welcome to the Futuristic Coders API 🚀",
  });
});

// ============================================================================
// API ROUTES
// ============================================================================

app.use("/api/health", healthRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/programs", programRoutes);
app.use("/api/students", studentRoutes);
app.use("/api/testimonials", testimonialRoutes);
// resetDb();
// ============================================================================
// NOT FOUND HANDLER
// ============================================================================

app.use((req, res, next) => {
  next(
    new AppError(
      `Cannot find ${req.method} ${req.originalUrl} on this server.`,
      404,
    ),
  );
});

// ============================================================================
// GLOBAL ERROR HANDLER
// ============================================================================

app.use((err, req, res, next) => {
  if (res.headersSent) {
    return next(err);
  }

  console.error(err);

  const statusCode = err.statusCode || err.status || 500;
  const isOperational = err.isOperational === true;

  const isClientError =
    Number.isInteger(statusCode) && statusCode >= 400 && statusCode < 500;

  const safeStatusCode = isOperational && isClientError ? statusCode : 500;

  const message =
    isOperational && isClientError ? err.message : "Internal server error";

  return res.status(safeStatusCode).json({
    success: false,
    message,
  });
});

export default app;
