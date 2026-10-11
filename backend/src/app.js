import express from "express";
import cors from "cors";
import healthRoutes from "./routes/health.routes/health.route.js";

const app = express();

// Allow requests from the public website and admin dashboard.
const allowedOrigins = [
  "http://localhost:3000",
  "http://localhost:3001",
  process.env.FRONTEND_URL,
  process.env.ADMIN_URL,
].filter(Boolean);

app.use(
  cors({
    origin(origin, callback) {
      // Allow requests without an Origin header, such as local tools.
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(new Error("Origin not allowed by CORS"));
    },
    credentials: true,
  })
);

// Parse incoming JSON request bodies.
app.use(express.json({ limit: "1mb" }));

// Parse URL-encoded form data.
app.use(express.urlencoded({ extended: true }));

// Basic route.
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Welcome to the Futuristic Coders API 🚀",
  });
});

// API routes.
app.use("/api/health", healthRoutes);

// Handle unknown routes.
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "API endpoint not found",
  });
});

// Central error handler.
app.use((err, req, res, next) => {
  console.error(err);

  if (res.headersSent) {
    return next(err);
  }

  res.status(err.status || 500).json({
    success: false,
    message:
      err.message === "Origin not allowed by CORS"
        ? "This origin is not allowed to access the API"
        : "Internal server error",
  });
});

export default app;