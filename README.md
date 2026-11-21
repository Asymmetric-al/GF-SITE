# GF-SITE — Global Fellowship Website Frontend

Standalone Next.js frontend foundation for the new Global Fellowship website.

This repository is intentionally frontend-only and runs independently without `Asymmetric-al/core`, Payload CMS, database access, or CMS credentials. Editorial management, content persistence, uploads, and publication rules remain owned by Core and will be integrated in a later phase (see [docs/core-integration.md](./docs/core-integration.md)).

## Selected Stack & Exact Versions

| Layer | Package / Tool | Version |
| --- | --- | --- |
| Framework | `next` | `16.4.6` |
| UI Runtime | `react` / `react-dom` | `19.3.1` |
| TypeScript | `typescript` | `7.1.0-beta` |
| Styling | `tailwindcss` / `@tailwindcss/turbopack` | `4.3.5` |
| Design System Shell | `shadcn` (`base-maia` preset, `@base-ui/react`, Hugeicons, Figtree — no Radix) | `4.23.0` / `1.9.0` |
| Interactive Primitives | `@ui-sdk/core` / `@ui-sdk/react` | `0.1.0-beta.13` |
| React Compiler | `babel-plugin-react-compiler` | `1.0.0` |
| Linting & Formatting | `ultracite` / `oxlint` / `oxfmt` | `8.3.1` / `1.94.0` / `0.79.0` |
| Type-Aware Lint Backend | `tsrs` (`tsrs-lint` via Oxlint) | `7.1.0-beta.tsrs4` |
| Browser Verification | `@playwright/test` / `@axe-core/playwright` | `1.65.1` / `4.14.0` |

## Runtime & Package Manager Requirements

- **Package manager & script orchestration:** **Bun `1.4.3`** (`packageManager: "bun@1.4.3"`). Commit `bun.lock` as the single lockfile.
- **Application runtime:** **Node.js `24.x` LTS** (`engines.node: "24.x"`, verified locally on `v24.22.3`).
- Running `bun run dev`, `bun run build`, and `bun run start` invokes Next.js's `#!/usr/bin/env node` binary under **Node.js** (not Bun's JavaScript runtime). Do not pass `--bun` or opt into Vercel's Bun Functions runtime solely because Bun manages dependencies.

## Getting Started

```bash
bun install --frozen-lockfile
bun run dev
```

Open [http://localhost:3000](http://localhost:3000). No external services, Core instance, or environment variables are required.

## Commands

| Command | Purpose |
| --- | --- |
| `bun run dev` | Start Next.js development server (Turbopack + `/_next/mcp`) on Node.js |
| `bun run build` | Production build (generates route types and runs full-project `tsc`) |
| `bun run start` | Start the built production server on Node.js |
| `bun run typegen` | Generate Next.js route types in `.next/types` |
| `bun run typecheck` | Run `next typegen && tsc --noEmit` across the full `tsconfig.json` |
| `bun run check` | Run Ultracite checks (`oxlint` with `tsrs` type-aware rules + `oxfmt --check`) |
| `bun run fix` | Apply safe Ultracite auto-fixes and Oxfmt formatting |
| `bun run lint` | Run `oxlint` directly (with `tsrs` backend) |
| `bun run format:check` | Run `oxfmt --check` directly |
| `bun run test:smoke` | Run Playwright + axe-core smoke checks against the built production app |

## Environment Variables

See [.env.example](./.env.example). The scaffold uses only one optional variable:

- `NEXT_PUBLIC_SITE_URL` _(optional)_ — Set only once the confirmed production domain is ready for canonical URLs. Never set this to an arbitrary preview URL or derive canonicals from request host headers.

Provisional builds and previews remain non-indexable (`noindex, nofollow` and `Disallow: /` in `/robots.txt`) until launch readiness is explicitly enabled.

## UI Architecture Boundary

- **No Radix** (`radix-ui` / `@radix-ui/*`) is installed or permitted.
- **shadcn (`base-maia`)** supplies Tailwind v4 semantic tokens (`src/app/globals.css`), `cn()`, and static/display UI primitives (`src/components/ui/`).
- **Vercel UI SDK (`@ui-sdk/core`, `@ui-sdk/react`)** owns all stateful interactive primitives behind small `"use client"` boundaries, styled with the same shadcn semantic tokens under `@layer ui-sdk;`.

## Verification & Browser Checks

Playwright tests (`tests/smoke.spec.ts`) run against `bun run start` on `http://127.0.0.1:3147` (overridable via `PLAYWRIGHT_PORT`, after `bun run build`) and verify:

1. Desktop (`1280x800`) and mobile (`390x844`) rendering with zero console errors, page errors, hydration errors, or horizontal overflow.
2. Non-indexable metadata (`noindex, nofollow`) and `/robots.txt` (`Disallow: /`).
3. Interactive Vercel UI SDK `Tabs` keyboard navigation (`ArrowRight`, `Home`), focus state, accessible roles/names, and pointer clicks.
4. Automated WCAG 2.1 A/AA accessibility checks via `@axe-core/playwright`.
5. Custom 404 route handling and typed navigation back to `/`.

If Chromium is not yet installed for the pinned Playwright version:

```bash
bunx playwright install chromium
```

## AI Agent Tooling

- Concise repo instructions live in [AGENTS.md](./AGENTS.md), preserving Next.js's managed documentation block (`node_modules/next/dist/docs/`).
- Repository-local skills are committed under `.agents/skills/` and `.claude/skills/`: `shadcn`, `ui-sdk`, `ultracite`, and `next-dev-loop`.
- Changed-file edit-time hooks are configured for Claude Code (`.claude/settings.json`), Cursor (`.cursor/hooks.json`), Codex (`.codex/hooks.json`), and Antigravity (`.agents/hooks.json`).
- Next.js MCP diagnostics (`next-devtools-mcp@0.4.0` bridging `/_next/mcp`) are configured in `.mcp.json`, `.cursor/mcp.json`, `.codex/config.toml`, and `.agents/plugins/next-devtools/mcp_config.json`.
- Note on `next-dev-loop`: the skill expects the optional `agent-browser` CLI (`>= 0.31.1`) on `PATH` (`npm i -g agent-browser@latest`). When `agent-browser` is not installed locally, use `/_next/mcp` together with Playwright (`bun run test:smoke`) or T3 Code's preview browser.

## Vercel Deployment Preparation

This repository is structured for Vercel's standard Git integration:

- Framework preset: **Next.js** (auto-detected).
- Package manager: **Bun** (auto-detected via `bun.lock` and `packageManager`).
- Node.js runtime: **24.x** (declared via `engines.node`; Bun Functions runtime is intentionally not enabled).
- Quality gates run in GitHub Actions (`.github/workflows/ci.yml`), leaving deployment to Vercel's native Git integration without creating a second deploy pipeline.

**Remaining connection steps (when ready):**

1. Confirm the target Vercel team and project name before connecting `Asymmetric-al/GF-SITE`.
2. Connect the repository via Vercel Git integration (keeping preview/scaffold deployments non-indexable).
3. Configure `NEXT_PUBLIC_SITE_URL` and update indexing policy in `src/lib/site.ts` only when the production website and domain are ready for launch.

## Updating Dependencies

All direct dependencies in `package.json` are pinned to exact versions. When upgrading:

1. Check prerelease tracks deliberately (`typescript@7.1.0-beta`, `tsrs@7.1.0-beta.tsrs4`, `@ui-sdk/*@0.1.0-beta.13`) so `tsrs` stays aligned with the installed TypeScript release and `oxlint` stays aligned with `ultracite`.
2. Keep `oxlint-tsgolint` and any `radix-ui` / `@radix-ui/*` packages out of the dependency graph.
3. After updating `package.json`, run `bun install`, `bun run check`, `bun run typecheck`, `bun run build`, and `bun run test:smoke` before committing the updated `bun.lock`.
