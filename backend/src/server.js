import "dotenv/config";
import app from "./app.js";

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`🚀 Futuristic Coders API running on port ${PORT}`);
  console.log(`Local URL: http://localhost:${PORT}`);
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