import { fileURLToPath } from "node:url";

import react from "@vitejs/plugin-react";
import { configDefaults, defineConfig } from "vitest/config";

const sharedExclude = [
  ...configDefaults.exclude,
  "tests/**",
  "**/e2e/**",
  "**/*.browser.test.{ts,tsx,js,jsx}",
  ".agents/**",
  ".claude/**",
  ".codex/**",
  ".cursor/**",
];

const serverOnlyEmptyPath = fileURLToPath(
  new URL("node_modules/server-only/empty.js", import.meta.url)
);

export default defineConfig({
  plugins: [react()],
  resolve: {
    tsconfigPaths: true,
  },
  test: {
    clearMocks: true,
    coverage: {
      exclude: ["src/**/*.test.{ts,tsx}", "src/**/*.d.ts"],
      include: ["src/**/*.{ts,tsx}"],
      provider: "v8",
      reporter: ["text", "json-summary", "html"],
      reportsDirectory: "./coverage",
    },
    globals: false,
    projects: [
      {
        extends: true,
        resolve: {
          alias: {
            "server-only": serverOnlyEmptyPath,
          },
          tsconfigPaths: true,
        },
        test: {
          environment: "node",
          exclude: sharedExclude,
          include: ["src/**/*.test.ts", "scripts/**/*.test.ts"],
          name: "server",
        },
      },
      {
        extends: true,
        resolve: {
          tsconfigPaths: true,
        },
        test: {
          environment: "jsdom",
          exclude: sharedExclude,
          include: ["src/**/*.test.tsx"],
          name: "dom",
          setupFiles: ["./vitest.setup.ts"],
        },
      },
    ],
    restoreMocks: true,
  },
});
