# GF-SITE — Global Fellowship Website Frontend

Standalone Next.js frontend foundation for the Global Fellowship website.

This repository is intentionally frontend-only and runs independently without `Asymmetric-al/core`, Payload CMS, database access, or CMS credentials. Editorial management, content persistence, uploads, and publication rules remain owned by Core and will be integrated in a later phase (see [docs/core-integration.md](./docs/core-integration.md)).

## Selected Stack & Exact Versions

| Layer | Package / Tool | Version |
| --- | --- | --- |
| Framework | `next` | `16.4.6` |
| UI Runtime | `react` / `react-dom` | `19.3.1` |
| TypeScript | `typescript` | `7.1.0-beta` |
| Styling | `tailwindcss` / `@tailwindcss/turbopack` | `4.3.5` |
| Design System Shell | `shadcn` (`base-maia` preset, `@base-ui/react`, Hugeicons — **no Radix**) | `4.23.0` / `1.9.0` |
| Interactive Primitives | `@ui-sdk/core` / `@ui-sdk/react` | `0.1.0-beta.13` |
| Rich Text | `@tiptap/core`, `@tiptap/pm`, `@tiptap/react`, `@tiptap/starter-kit`, `@tiptap/static-renderer` | `3.35.0` |
| React Compiler | `babel-plugin-react-compiler` | `1.0.0` |
| Linting & Formatting | `ultracite` / `oxlint` / `oxfmt` + `@shadcn/lint` + `@interfere/landmines` | `8.3.1` / `1.94.0` / `0.79.0` / `0.2.5` / `0.1.1` |
| Type-Aware Lint Backend | `tsrs` (`tsrs-lint` via Oxlint — no `oxlint-tsgolint`) | `7.1.0-beta.tsrs4` |
| Unit & Component Testing | `vitest` / `vite` / `@vitejs/plugin-react` / `@testing-library/react` / `jsdom` | `5.1.1` / `8.3.8` / `6.3.0` / `16.3.3` / `31.0.1` |
| Browser, A11y & SEO Checks | `@playwright/test` / `@axe-core/playwright` | `1.65.1` / `4.14.0` |
| Performance & Hygiene | `lighthouse` / `@lhci/cli` / `knip` / `svgo` | `13.6.0` / `0.16.1` / `6.47.0` / `4.1.0` |

## Runtime & Package Manager Requirements

- **Package manager & script orchestration:** **Bun `1.4.3`** (`packageManager: "bun@1.4.3"`). Commit `bun.lock` as the single lockfile.
- **Application & test runtime:** **Node.js `24.x` LTS** (`engines.node: "24.x"`, verified locally on `v24.22.3`).
- Running `bun run dev`, `bun run build`, `bun run start`, and `bun run test:run` executes Next.js and Vitest under **Node.js** (not Bun's JavaScript runtime). Do not run `bun test`, do not pass `--bun` to Vitest, and do not opt into Vercel's Bun Functions runtime solely because Bun manages dependencies.

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
| `bun run check` | Run Ultracite checks (`oxlint` with `tsrs`, `anti-slop`, `@shadcn/lint`, `@interfere/landmines/testing` + `oxfmt --check`) |
| `bun run fix` | Apply safe Ultracite auto-fixes and Oxfmt formatting |
| `bun run knip` | Detect unused files, exports, and dependencies |
| `bun run test` / `bun run test:run` | Run Vitest unit and component tests (watch mode / bounded run) |
| `bun run test:coverage` | Run Vitest with V8 coverage across `src/**/*.{ts,tsx}` |
| `bun run test:smoke` | Run Playwright Chromium smoke, `@seo`, and `@a11y` checks against built app |
| `bun run test:a11y` | Run Playwright Chromium `@a11y` accessibility checks |
| `bun run test:seo` | Run Playwright Chromium `@seo` technical SEO route checks |
| `bun run test:visual` | Run Desktop Chromium `@visual` screenshot baseline comparison |
| `bun run test:e2e` | Run full 4-project Playwright matrix (`chromium`, `firefox`, `webkit`, `mobile-webkit`) |
| `bun run perf:lhci` | Run separate mobile and desktop Lighthouse CI collections (3 runs each, median aggregation) |
| `bun run analyze` / `bun run analyze:export` | Run native Next.js Turbopack bundle analysis and export JSON Lines |
| `bun run check:links` | Run offline Lychee link check on repository Markdown documentation |
| `bun run check:prose` | Run Vale prose/vocabulary lint on repository Markdown documentation |

## Environment Variables

See [.env.example](./.env.example). The website runtime uses only one optional variable:

- `NEXT_PUBLIC_SITE_URL` _(optional)_ — Set only once the confirmed production domain is ready for canonical URLs. Never set this to an arbitrary preview URL or derive canonicals from request host headers.

Provisional builds and previews remain non-indexable (`noindex, nofollow` and `Disallow: /` in `/robots.txt`) until launch readiness is explicitly enabled.

Private developer credentials for licensed UI catalogs and external service CLIs/MCPs are loaded outside Git in user environment storage (variable names documented in [docs/agent-toolkit.md](./docs/agent-toolkit.md)).

## UI & Rich-Text Architecture Boundary

- **No Radix** (`radix-ui` / `@radix-ui/*`) is installed or permitted anywhere.
- **shadcn (`base-maia`)** supplies Tailwind v4 semantic tokens (`src/app/globals.css`), `cn()`, and static/display UI primitives (`src/components/ui/`).
- **Vercel UI SDK (`@ui-sdk/core`, `@ui-sdk/react`)** owns all stateful interactive primitives behind small `"use client"` boundaries, styled with the same shadcn semantic tokens under `@layer ui-sdk;`.
- **Tiptap (`3.35.0`)** (`@tiptap/core`, `@tiptap/pm`, `@tiptap/react`, `@tiptap/starter-kit`, `@tiptap/static-renderer`) is installed for any frontend rich-text editing or static rendering needs; Core's Payload CMS v4 Lexical boundary remains separate.

## Documentation Map

- [AGENTS.md](./AGENTS.md) (and [CLAUDE.md](./CLAUDE.md) bridge) — Concise repository rules and task routing for coding agents.
- [DESIGN.md](./DESIGN.md) — Canonical design setup reference (established constraints, implementation observations, undecided creative areas, and review process).
- [docs/testing.md](./docs/testing.md) — Unit, E2E, accessibility, visual regression, Lighthouse CI baselines, bundle analysis, technical SEO, and CI cadence.
- [docs/agent-toolkit.md](./docs/agent-toolkit.md) — Sanitized agent toolkit architecture, skill/MCP scopes, credential roles, and restore commands.
- [docs/agent-toolkit-validation.md](./docs/agent-toolkit-validation.md) — Recorded validation runs, measured baselines, live MCP/registry checks, and remaining human actions.
- [agent-toolkit-manifest.json](./agent-toolkit-manifest.json) — Machine-readable inventory of every installed, on-demand, auth-pending, evaluated, and excluded toolkit item.
- [docs/core-integration.md](./docs/core-integration.md) — Core CMS reference snapshot and future integration decisions.

## Updating Dependencies

All direct dependencies in `package.json` are pinned to exact versions. When upgrading:

1. Check prerelease tracks deliberately (`typescript@7.1.0-beta`, `tsrs@7.1.0-beta.tsrs4`, `@ui-sdk/*@0.1.0-beta.13`) so `tsrs` stays aligned with TypeScript and `oxlint` stays aligned with `ultracite`.
2. Keep `oxlint-tsgolint` and any `radix-ui` / `@radix-ui/*` packages out of the dependency graph.
3. After updating `package.json`, run `bun install`, `bun run check`, `bun run knip`, `bun run typecheck`, `bun run test:run`, `bun run build`, and `bun run test:smoke` before committing the updated `bun.lock`.
