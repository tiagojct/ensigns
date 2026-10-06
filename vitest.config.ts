import { defineConfig } from "vitest/config";

// Current model, generators, environment and production-site tests run here.
// Legacy sources and frozen migration fixtures are not executable tests.
export default defineConfig({
  test: {
    include: ["tests/**/*.test.ts"],
    exclude: [
      "**/node_modules/**",
      "site/**",
      "legacy/**",
      "tests/parity/**",
      "tests/fixtures/**",
    ],
    environment: "node",
  },
});
