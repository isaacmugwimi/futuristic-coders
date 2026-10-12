
import "dotenv/config";
import app from "./app.js";
import { initDb, pool } from "./database/config/config.db.js";

const PORT = process.env.PORT || 5000;

let server;
let isShuttingDown = false;

// Graceful shutdown
const shutdown = async (signal) => {
  if (isShuttingDown) return;
  isShuttingDown = true;

  console.log(`\n🛑 Received ${signal}. Shutting down...`);

  try {
    // Stop accepting new HTTP requests
    if (server) {
      await new Promise((resolve, reject) => {
        server.close((err) => {
          if (err) reject(err);
          else resolve();
        });
      });
    }

    // Close PostgreSQL connections
    await pool.end();

    console.log("✅ HTTP server and database pool closed.");
    process.exitCode = 0;
  } catch (error) {
    console.error("❌ Error during shutdown:", error);
    process.exitCode = 1;
  }
};

// Initialize DB, then start Express
const startServer = async () => {
  try {
    await initDb();

    server = app.listen(PORT, () => {
      console.log(`🚀 Server running on port: ${PORT}`);
    });
  } catch (error) {
    console.error("❌ Failed to initialize DB:", error.message);

    try {
      await pool.end();
    } catch (closeError) {
      console.error("❌ Failed to close DB pool:", closeError.message);
    }

    process.exitCode = 1;
  }
};

process.once("SIGINT", () => shutdown("SIGINT"));
process.once("SIGTERM", () => shutdown("SIGTERM"));

startServer();
