<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# GF-SITE Agent Guide

## Canonical References (Read Before Acting)

- **Design, UI, layout, interaction, content presentation, or motion work:** Read [DESIGN.md](./DESIGN.md) first. It separates explicitly established constraints from provisional scaffold observations and undecided design questions. Do not invent or assume unapproved visual themes, palettes, typography, or layouts.
- **Core CMS boundary:** Read [docs/core-integration.md](./docs/core-integration.md). `Asymmetric-al/core` owns Payload CMS v4, database persistence, uploads, and editorial publishing. Keep `GF-SITE` content isolated behind the server-only reader in `src/lib/content/` and never install Payload runtime or import `@asym/*` packages here.
- **Testing, performance, and technical SEO:** Read [docs/testing.md](./docs/testing.md) for Vitest, Playwright, axe-core, visual baselines, Lighthouse CI, bundle analysis, and CI cadence.
- **Toolkit inventory and provider status:** Read [docs/agent-toolkit.md](./docs/agent-toolkit.md), [docs/agent-toolkit-validation.md](./docs/agent-toolkit-validation.md), and [agent-toolkit-manifest.json](./agent-toolkit-manifest.json).

## Established Stack and Boundaries

- **Framework and runtimes:** Next.js `16.4.6` (`App Router`, `cacheComponents`, `partialPrefetching`, `reactCompiler`, `typedRoutes`), React `19.3.1`, TypeScript `7.1.0-beta`. Bun (`1.4.3`) manages packages and scripts; Next.js and Vitest run on **Node.js 24 LTS** (use `bun run test:run`, never `bun test` and never `--bun` for Vitest; do not opt into Vercel's Bun runtime).
- **Server-first architecture:** Keep routes and layouts as Server Components by default; place interactive UI inside small `"use client"` leaf modules.
- **Strict UI boundary (NO Radix):**
  - **NO Radix (`radix-ui` / `@radix-ui/*`)** may be installed or imported anywhere directly or transitively.
  - **shadcn (`base-maia` / `@base-ui/react` + Hugeicons)** owns Tailwind v4 semantic tokens (`src/app/globals.css`), `cn()`, and **static/display UI only** (`src/components/ui/`).
  - **Vercel UI SDK (`@ui-sdk/core` + `@ui-sdk/react`)** owns **all stateful interactive primitives** (single interaction engine). Never stack Base UI/shadcn and UI SDK interaction behaviors onto the same control.
  - Before writing interactive UI, load the `ui-sdk` skill (`.agents/skills/ui-sdk/SKILL.md`) and read `node_modules/@ui-sdk/react/docs/llms.txt` (plus `core.md` and `rendering.md` when authoring custom primitives). Keep `@layer ui-sdk;` at line 1 of `src/app/globals.css`.
- **Rich text:** Latest **Tiptap (`3.35.0`)** packages (`@tiptap/core`, `@tiptap/pm`, `@tiptap/react`, `@tiptap/starter-kit`, `@tiptap/static-renderer`) are installed for any frontend rich-text needs. Keep styling bound to semantic tokens in `src/app/globals.css` and keep Core Payload CMS Lexical contracts cleanly separated.
- **Linting and formatting:** Ultracite `8.3.1` with Oxlint `1.94.0` (`tsrs` type-aware backend + `anti-slop` + `@shadcn/lint` + `oxlint-plugin-react-doctor` via Ultracite `js-plugins` & `next/js-plugins` + scoped `@interfere/landmines/testing` + scoped `vitest` + `playwright`) and Oxfmt `0.79.0`. Do not add ESLint, Prettier, or `oxlint-tsgolint`.
- **Editorial hygiene:** Plain, direct, source-backed language; no em dashes in public copy; no fabricated statistics, quotes, or claims.

## Task Routing (Skill, Tool, and Verification)

Use task-specific routing. Choose **one lead skill** per task and invoke secondary skills only for targeted review questions. Installed skill defaults never override user instructions, `DESIGN.md`, or established architecture constraints.

| Task | Lead Skill / Tool / Reference | Expected Verification |
| --- | --- | --- |
| Design discovery, IA, user needs | [DESIGN.md](./DESIGN.md), `site-architecture`, `customer-research`, `product-marketing`, GOV.UK content-design refs | Distinguish facts from assumptions; record open choices in `DESIGN.md` without guessing unapproved direction. |
| Visual direction and layout | [DESIGN.md](./DESIGN.md); pick one lead (`frontend-design` or `impeccable`), optional `ui-ux-pro-max` / `leonardo-colors` research | Targeted review with `web-design-guidelines` or `emil-design-eng`; responsive screenshots, `bun run check` (`@shadcn/lint`), and `bun run test:a11y`. |
| Interactive UI components | `ui-sdk`, `node_modules/@ui-sdk/react/docs/llms.txt`, `shadcn`, `components.json` (if a component requires unapproved visual treatment, pause and confirm per [DESIGN.md](./DESIGN.md) §6) | Keyboard, focus entry/return, ARIA names, touch targets, reduced motion, Vitest component test + Playwright browser check. |
| External UI catalog source | Shared `shadcn` MCP + relevant provider MCP (`reactbits-pro`, `shadcnuikit`, `shadcn-studio`, `shadcn-space`, `reui` after OAuth); general skills `react-bits-pro`, `shadcnuikit`, `reui` | Verify entitlement, inspect returned imports for **zero Radix**, check dependency impact, adapt stateful controls to `@ui-sdk/react`. |
| Animation and micro-interactions | `emil-design-eng`, `animate`, `choreograph`, `animation-performance`, `remove-animations`, `mobile-native`; Motion MCP/guidance when Motion is used | Review with `review-animations` / `break-ui`; verify interruption, pointer/keyboard parity, `prefers-reduced-motion`, and zero CLS. |
| Frontend rich text (Tiptap) | Installed `@tiptap/*` (`3.35.0`) types/docs, `Context7`, [DESIGN.md](./DESIGN.md), [docs/core-integration.md](./docs/core-integration.md) | Unit tests for serialization/rendering, keyboard and accessibility check, zero Radix or raw color leaks. |
| Server utilities, routes, and config | `node_modules/next/dist/docs/`, `src/lib/`, `src/app/` (keep Core CMS boundary isolated in `src/lib/content/`) | `bun run check`, `bun run typecheck`, `bun run knip`, `bun run test:run` (Node `server` project), plus Playwright for full App Router routes. |
| Copywriting, copyediting, UX writing | Lead by task: `copywriting` (new public copy), `copy-editing` (revising copy), or `writing-guidelines` (technical docs); plus `content-strategy` and Vale (`.vale.ini`) | Source-backed facts, no em dashes, clear labels/errors, `bun run check:prose` (Markdown docs; `src/` and future CMS copy need explicit review/export), `bun run check:links`. |
| Technical SEO and marketing | `seo-audit`, `schema`, `ai-seo`, `cro`, `analytics`; native Next metadata/robots/sitemap; Lychee; Search Console / Rich Results Test (when live) | `bun run test:seo`, `bun run check:links`, verified non-indexable/canonical policy, structured-data validation when applicable. |
| Next.js / React performance | `node_modules/next/dist/docs/`, `vercel-react-best-practices`, `vercel-composition-patterns`, `next-bundle-optimizer`, `next-cache-components-optimizer`, `next-partial-prefetching-optimizer` | `bun run build`, `bun run analyze`, repeated isolated `bun run perf:lhci` (mobile + desktop), DevTools trace when needed. |
| Unit and component testing | `vitest`, `vite` (`antfu/skills`), local `vitest.config.mts`, Testing Library | `bun run test:run`, `bun run test:coverage` (preserve honest `src/**` denominator; never test async RSCs only in jsdom). |
| E2E, accessibility, visual regression | Playwright Test (`playwright.config.ts`), `@axe-core/playwright`, `playwright-cli`, Playwright test agents (`specs/`, `.claude/agents/`, `.codex/agents/`) | `bun run test:smoke`, `bun run test:a11y`, `bun run test:seo`, `bun run test:e2e`, reviewed `bun run test:visual` baseline diffs. |
| Browser debugging and dev loop | `playwright-cli` by default; `next-dev-loop` + `agent-browser` + `/_next/mcp` (`next-devtools`) during `next dev`; Chrome DevTools skills (`debug-optimize-lcp`, `a11y-debugging`, etc.) for traces/memory/a11y | Live console/network/trace evidence against the actual running app. |
| Code quality and hygiene | `ultracite`, `configure-knip`, `code-simplifier`; on-demand `@shadscan/cli` and interactive `react-doctor` | `bun run check`, `bun run check:foundation`, `bunx --no-install ultracite doctor`, `bun run typecheck`, `bun run knip`. |
| Payload CMS / future migration | `payload`, `cms-migration`, [docs/core-integration.md](./docs/core-integration.md) | Guidance only until Core integration is selected; never add Payload runtime or DB clients to `GF-SITE`. |
| Planning, reviews, PRs, coordination | Tstack (`full-send`, `full-stop`, `council`, `sol-loop`, `file-pr`, `takeover`, `babysit-pr`, `modernize`, `leaving-pr-comments`) + `gh` CLI | Use only when requested; discover real providers via `orchestrator_capabilities`; never merge/push/comment without authorization. |
| Vercel deployment and platform | `vercel-cli`, `deployments-cicd`, `env-vars`, `domains`, `cdn-caching`, `routing-middleware`, `client-side-security`, `verification`, `vercel-firewall`, `vercel-functions`, `vercel-storage` | Preview verification, `vercel` CLI read checks; Vercel MCP requires separate OAuth. |
| Specialist assets and services | `svgo`, `fonttools`, `ffmpeg`/`ffprobe`, `leonardo-colors`, `remotion-best-practices`, `resend`/`react-email`, `firecrawl`, `supabase`, `stripe-best-practices` | Artifact check on real files (e.g., `svgo`, `ffprobe`) or read-only service check; never add unused runtime SDKs. |

## AI Capability Truthfulness

This guide governs AI-assisted development tooling; it does **not** authorize adding chatbots, AI agents, or AI APIs to the public website. When reporting tool status, keep five states strictly separate:

1. **Skill installed on disk** (`.agents/skills/` and `.claude/skills/`).
2. **Skill discovered by the active provider session** (verify after T3 session restart; note any global skill shadow collisions in [docs/agent-toolkit-validation.md](./docs/agent-toolkit-validation.md)).
3. **CLI or MCP configured** (`.mcp.json`, `.cursor/mcp.json`, `.codex/config.toml`, `.agents/plugins/`).
4. **Authenticated with confirmed entitlement** (for example, ReUI MCP and Vercel MCP require separate OAuth; Shadcn Space Pro has no supplied key; Search Console/CrUX/PSI/Screaming Frog/Ahrefs/WebPageTest have no supplied credentials).
5. **Verified with a real harmless check** (check [docs/agent-toolkit-validation.md](./docs/agent-toolkit-validation.md) rather than assuming availability).

## Key Commands

- `bun run dev` — start Next.js dev server (Turbopack + `/_next/mcp`) on Node.js 24
- `bun run check` / `bun run fix` — Ultracite lint (`oxlint` + `tsrs` + `@shadcn/lint` + `anti-slop` + `react-doctor`) and format (`oxfmt`)
- `bun run check:foundation` — repository invariants check (zero Radix, zero `oxlint-tsgolint`, zero removed skills, `.agents`/`.claude` skill parity, manifest sync, CSS layer & Next.js managed markers)
- `bun run typecheck` — Next.js route typegen + full-project `tsc --noEmit` (TypeScript 7.1 beta)
- `bun run knip` — unused files, exports, and dependencies audit
- `bun run test:run` / `bun run test:coverage` — bounded Vitest unit/component tests and V8 coverage
- `bun run build` / `bun run start` — production build and production server
- `bun run test:smoke` / `bun run test:a11y` / `bun run test:seo` / `bun run test:visual` / `bun run test:e2e` — Playwright suites against production server
- `bun run perf:lhci` (`perf:lhci:mobile`, `perf:lhci:desktop`) — isolated 3-run Lighthouse CI baselines
- `bun run analyze` / `bun run analyze:export` — native Next.js Turbopack bundle analysis
- `bun run check:links` / `bun run check:prose` — offline Lychee link check and Vale prose check

## Edit-Time Hooks and Reporting

- **Single post-edit fixer per provider (changed files only):** Claude (`.claude/settings.json`), Codex (`.codex/hooks.json`), and Cursor (`.cursor/hooks.json`) invoke `bunx --no-install ultracite fix --hook`; Antigravity (`.agents/hooks.json`) invokes `bun ../scripts/antigravity-post-edit-hook.ts`.
- **Verification discipline:** Fix root causes rather than weakening checks or bypassing conflicts. Report exact commands run, pass/fail outcomes, and any checks blocked or skipped. Keep secrets, `.env*`, auth states, private companions, and generated audit reports outside Git.
