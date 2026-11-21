<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# GF-SITE Agent Guide

## Scope & Architecture

- **Purpose:** Standalone public website frontend for Global Fellowship.
- **Current phase:** Frontend-only foundation. Do **not** install Payload CMS, a database, authentication, an upload backend, or a rich-text editor here.
- **Future CMS ownership:** `Asymmetric-al/core` owns Payload CMS v4, persistence, uploads, editorial workflows, and publication/serving rules. Keep provisional content isolated behind the server-only reader in `src/lib/content/` (`reader.ts`, `types.ts`, `local-content.ts`) and pass typed data to components via normal props. Never import `@asym/*` workspace packages or add speculative CMS endpoints/env vars.
- **Detailed notes:** See [README.md](./README.md) for setup/runtime details and [docs/core-integration.md](./docs/core-integration.md) for the Core reference snapshot and future integration decisions.

## Stack & Component Rules

- **Framework & runtimes:** Next.js 16.4 (`App Router`, `cacheComponents`, `partialPrefetching`, `reactCompiler`, `typedRoutes`), React 19.3, TypeScript 7.1 beta. Bun (`1.4.3`) manages packages and scripts; Next.js runs on **Node.js 24 LTS** (do not opt into Vercel's Bun runtime).
- **Server-first:** Keep routes and layout components as Server Components by default; place interactive UI inside small `"use client"` leaf modules.
- **UI component boundary (strict — NO Radix):**
  - **NO Radix (`radix-ui` / `@radix-ui/*`)** may be installed or used anywhere.
  - **shadcn (`base-maia` / Base UI + Hugeicons + Figtree)** owns Tailwind v4 semantic styling tokens (`src/app/globals.css`), `cn()`, and **static/display UI only** (`src/components/ui/`).
  - **Vercel UI SDK (`@ui-sdk/core` + `@ui-sdk/react`)** owns **all stateful interactive primitives** (single interaction engine). Never stack Base UI/shadcn and UI SDK behaviors onto the same control.
  - Before using UI SDK, follow the `ui-sdk` skill (`.agents/skills/ui-sdk/SKILL.md`) and read `node_modules/@ui-sdk/react/docs/llms.txt` (plus `core.md` and `rendering.md` next to it when building custom primitives). Keep `@layer ui-sdk;` at the top of `src/app/globals.css` above `@import "tailwindcss";`.
- **Linting & formatting:** Ultracite with Oxlint (`tsrs` type-aware backend + `anti-slop`) and Oxfmt. Do not add ESLint, Prettier, or `oxlint-tsgolint`.

## Commands

- `bun run dev` — start Next.js dev server (Turbopack + `/_next/mcp`) on Node.js
- `bun run check` — run Ultracite lint (`oxlint` + `tsrs`) and format (`oxfmt --check`)
- `bun run fix` — run safe Ultracite auto-fixes and formatting
- `bun run typecheck` — generate route types (`next typegen`) and run full-project `tsc --noEmit`
- `bun run build` — production build (includes route typegen and full-project `tsc` check)
- `bun run start` — start the built production app on Node.js
- `bun run test:smoke` — run Playwright + axe-core smoke checks against the built app

## Agent Skills, Hooks & Runtime Feedback

- **Repository-local skills** (`.agents/skills/` and `.claude/skills/`): `shadcn`, `ui-sdk`, `ultracite`, `next-dev-loop`.
- **Edit-time hooks (changed files only):** Configured for Claude Code (`.claude/settings.json`), Cursor (`.cursor/hooks.json`), Codex (`.codex/hooks.json`), and Antigravity (`.agents/hooks.json` via `scripts/antigravity-post-edit-hook.mjs`).
- **Next.js runtime MCP:** `next dev` exposes `/_next/mcp`; `next-devtools-mcp` is configured in `.mcp.json`, `.cursor/mcp.json`, `.codex/config.toml`, and `.agents/plugins/next-devtools/mcp_config.json`.
- **Browser inspection:** Use Playwright (`bun run test:smoke`), the T3 Code preview browser when browser work is requested, or `agent-browser` (optional global CLI required by `next-dev-loop`, installable with `npm i -g agent-browser@latest`).

## Verification & Reporting Expectations

- Fix root causes instead of suppressing errors, bypassing dependency conflicts, or weakening checks.
- Keep `AGENTS.md` concise and preserve the Next.js managed rules markers above.
- Report exact commands executed, their pass/fail status, and any checks skipped or blocked by environment constraints.
