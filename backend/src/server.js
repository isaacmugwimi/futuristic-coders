import "dotenv/config";
import app from "./app.js";
import { initDb } from "./database/config/config.db.js";


const PORT = process.env.PORT || 5000;

// Initialize DB then start server
const server =
  initDb()
    .then(() => {
      app.listen(PORT, () => {
        console.log(`🚀 Server running on port: ${PORT}`);
      });
    })
    .catch((err) => {
      console.error("❌ Failed to initialize DB:", err);
      process.exit(1);
    });

process.on("SIGINT", () => {
  console.log("\nShutting down the server...");
  server.close(() => {
    process.exit(0);
  });
});

process.on("SIGTERM", () => {
  server.close(() => {
    process.exit(0);
  });
});
