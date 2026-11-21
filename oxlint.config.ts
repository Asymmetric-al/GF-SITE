import { defineConfig } from "oxlint";
import antiSlop from "ultracite/oxlint/anti-slop";
import core from "ultracite/oxlint/core";
import next from "ultracite/oxlint/next";
import playwright from "ultracite/oxlint/playwright";
import react from "ultracite/oxlint/react";

export default defineConfig({
  env: core.env,
  extends: [core, react, next, playwright, antiSlop],
  ignorePatterns: [
    ...core.ignorePatterns,
    // Upstream agent skill packages managed via `skills-lock.json`
    ".agents/skills/**",
    ".claude/skills/**",
    // Playwright output artifacts
    "playwright-report/**",
    "test-results/**",
  ],
  options: { typeAware: true },
  overrides: [
    {
      // Narrow exception for shadcn CLI-generated static/display primitives so
      // `shadcn add` / `shadcn diff` stays aligned with upstream output while
      // preserving type-aware, accessibility, and safety rules.
      files: ["src/components/ui/**/*.tsx"],
      rules: {
        "func-style": "off",
      },
    },
  ],
});
