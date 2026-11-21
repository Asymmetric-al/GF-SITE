import { defineConfig } from "oxfmt";
import ultracite from "ultracite/oxfmt";

export default defineConfig({
  ...ultracite,
  ignorePatterns: [
    ...(ultracite.ignorePatterns ?? []),
    ".agents/skills/**",
    ".claude/skills/**",
    ".claude/agents/**",
    ".codex/agents/**",
    ".cursor/skills/**",
    ".cursor/agents/**",
    "artifacts/**",
    "coverage/**",
    "playwright-report/**",
    "styles/**",
    "test-results/**",
    ".lighthouseci/**",
    ".playwright-cli/**",
    "skills-lock.json",
  ],
});
