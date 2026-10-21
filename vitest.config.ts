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
    coverage: {
      provider: "v8",
      include: ["lib/**/*.ts"],
      exclude: ["lib/colour/apca-w3.d.ts"],
      reporter: ["text", "json-summary"],
      // The measured floor at 1.0.0: 95.8 statements, 87.8 branches, 98.7 functions,
      // 98.6 lines. Keep a margin for Node and V8 differences without hiding a regression.
      thresholds: { statements: 94, branches: 85, functions: 97, lines: 97 },
    },
  },
});
