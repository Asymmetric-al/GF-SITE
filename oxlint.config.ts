import { defineConfig } from "oxlint";
import antiSlop from "ultracite/oxlint/anti-slop";
import core from "ultracite/oxlint/core";
import next from "ultracite/oxlint/next";
import playwright from "ultracite/oxlint/playwright";
import react from "ultracite/oxlint/react";
import shadcn from "ultracite/oxlint/shadcn";
import vitest from "ultracite/oxlint/vitest";

const vitestScopedOverrides = (vitest.overrides ?? []).map((override) => ({
  ...override,
  files: ["src/**/*.test.{ts,tsx}"],
}));

export default defineConfig({
  env: core.env,
  extends: [core, react, next, playwright, antiSlop, shadcn],
  ignorePatterns: [
    ...core.ignorePatterns,
    // Upstream agent skill and generated agent definitions
    ".agents/skills/**",
    ".claude/skills/**",
    ".claude/agents/**",
    ".codex/agents/**",
    ".cursor/skills/**",
    ".cursor/agents/**",
    // Generated test, coverage, audit, and prose assets
    "artifacts/**",
    "coverage/**",
    "playwright-report/**",
    "styles/**",
    "test-results/**",
    ".lighthouseci/**",
    ".playwright-cli/**",
  ],
  // Re-declared on root config so dependency analyzers (Knip) detect JS plugins
  jsPlugins: [
    ...(shadcn.jsPlugins ?? []),
    {
      name: "landmines-testing",
      specifier: "@interfere/landmines/testing",
    },
  ],
  options: { typeAware: true },
  overrides: [
    ...vitestScopedOverrides,
    {
      // Narrow exception for shadcn CLI-generated static/display primitives so
      // `shadcn add` / `shadcn diff` stays aligned with upstream output while
      // preserving type-aware, accessibility, raw-color, and safety rules.
      files: ["src/components/ui/**/*.tsx"],
      rules: {
        "func-style": "off",
      },
    },
    {
      // Explicit property-scoped CSS transition (`transition-[background-color,color,box-shadow]`)
      // on the Vercel UI SDK tab wrapper avoids `transition-all` while keeping
      // raw colors, inline styles, unknown classes, and restyling enforced.
      files: ["src/components/foundation-tabs.tsx"],
      rules: {
        "shadcn/no-arbitrary-values": "off",
      },
    },
    {
      // High-signal anti-flake testing rules from @interfere/landmines/testing
      // scoped to test suites without overriding `.spec.ts` filenames, prose
      // comments, or explicit return-type conventions.
      files: ["src/**/*.test.{ts,tsx}", "tests/**/*.spec.ts"],
      rules: {
        "landmines-testing/no-fixed-sleep": "error",
        "landmines-testing/no-flake-masking": "error",
        "landmines-testing/no-test-doubles": "error",
        "landmines-testing/no-unsignaled-poll": "error",
        "landmines-testing/strict-msw": "error",
      },
    },
  ],
  rules: {
    // Allow Card and CardContent containers to control internal layout/spacing
    // on the theme spacing scale while keeping colors, typography, and borders locked.
    "shadcn/no-restyle": [
      "error",
      {
        allow: ["layout"],
        contracts: [
          {
            allow: ["layout", "spacing"],
            pattern: "^Card(Content)?$",
          },
        ],
      },
    ],
  },
  settings: {
    shadcn: {
      note: "See DESIGN.md for design system boundaries and approved exceptions.",
      ui: "@/components/ui",
    },
  },
});
