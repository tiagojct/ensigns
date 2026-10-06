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
    // Some tests start child Node processes or build the site. Alone they take about a second,
    // but the suite runs in parallel workers, and a busy or two-core machine needs several times
    // as long. A test that hangs still fails, after 30 seconds.
    testTimeout: 30000,
  },
});
