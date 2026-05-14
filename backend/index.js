// This file serves as the entry point for Azure Web App
// It loads the compiled TypeScript code

// Ensure NODE_ENV is set
process.env.NODE_ENV = process.env.NODE_ENV || "production";

// Check if compiled files exist, if not, compile TypeScript on the fly
try {
  // Try to require the compiled JavaScript
  require("./dist/server.js");
} catch (error) {
  console.log(
    "Compiled JavaScript not found, compiling TypeScript on the fly..."
  );
  // If compilation fails or files don't exist, use ts-node to run directly
  require("ts-node/register");
  require("./src/server.ts");
}
