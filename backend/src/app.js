import express from "express";
import cors from "cors";

import healthRoutes from "./routes/health.routes/health.route.js";
import usersRoutes from "./routes/users/users.routes.js";

import AppError from "./middleware/error/AppError.js";

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
        new AppError(
          "This origin is not allowed to access the API.",
          403,
        ),
      );
    },
    credentials: true,
  }),
);

// ============================================================================
// BODY PARSERS
// ============================================================================

app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true }));

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
app.use("/api/users", usersRoutes);

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

  // Log the full error internally.
  console.error(err);

  // Use AppError's statusCode, with status as a fallback.
  const statusCode = err.statusCode || err.status || 500;

  // Only expose expected operational errors.
  const isOperational = err.isOperational === true;

  const isClientError =
    Number.isInteger(statusCode) &&
    statusCode >= 400 &&
    statusCode < 500;

  const safeStatusCode =
    isOperational && isClientError ? statusCode : 500;

  const message =
    isOperational && isClientError
      ? err.message
      : "Internal server error";

  return res.status(safeStatusCode).json({
    success: false,
    message,
  });
});

export default app;
