import { defineConfig } from "vitest/config";

// The site, the legacy sources and the golden fixtures have their own
// lifecycle. Only the tests written for the monorepo run here.
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
