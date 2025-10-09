import { execSync } from "node:child_process";

console.log("Running Vite build safely...");
try {
  execSync("npm install vite --no-save", { stdio: "inherit" });
  execSync("node ./node_modules/vite/bin/vite.js build", { stdio: "inherit" });
  console.log("✅ Vite build completed successfully!");
} catch (err) {
  console.error("❌ Build failed:", err);
  process.exit(1);
}
