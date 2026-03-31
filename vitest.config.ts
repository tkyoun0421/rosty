import path from "node:path";
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "#app": path.resolve(__dirname, "src/app"),
      "#flows": path.resolve(__dirname, "src/flows"),
      "#mutations": path.resolve(__dirname, "src/mutations"),
      "#queries": path.resolve(__dirname, "src/queries"),
      "#shared": path.resolve(__dirname, "src/shared"),
    },
  },
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./vitest.setup.ts"],
    include: ["src/**/*.test.ts", "src/**/*.test.tsx", "tests/**/*.test.ts", "tests/**/*.test.tsx"],
  },
});
