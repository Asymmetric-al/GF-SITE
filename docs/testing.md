# Testing, Performance, and Technical SEO Guide

This document describes the automated testing, accessibility, visual regression, performance benchmarking, bundle analysis, link/prose checking, and technical SEO setup in `GF-SITE`.

## 1. Route, Browser, and Performance Profile Inventory

### Tested Routes (Current Provisional Foundation)

| Route | Expected Status | Coverage |
| --- | --- | --- |
| `/` | `200` | Smoke rendering, zero console/page errors, responsive overflow (`320px`, `390px`, desktop), UI SDK tab pointer/keyboard interaction, WCAG 2.1 A/AA across all 3 tab panels, technical SEO metadata, Desktop Chromium visual baseline, Lighthouse CI mobile & desktop |
| `/robots.txt` | `200` (`text/plain`) | Non-indexable crawl policy (`User-Agent: *`, `Disallow: /`) |
| `/non-existent-route-*` | `404` | Custom 404 status, single `<h1>`, WCAG 2.1 A/AA scan, recovery link back to `/` |

### Browser Matrix (`playwright.config.ts`)

| Project | Device / Engine | Normal PR CI | Scheduled / Full Matrix |
| --- | --- | --- | --- |
| `chromium` | Desktop Chrome (`chromium-1255`) | Required (`test:smoke` covering smoke + `@seo` + `@a11y`) | Included (`test:e2e`) |
| `firefox` | Desktop Firefox (`firefox-1572`) | On-demand | Included (`test:e2e`) |
| `webkit` | Desktop Safari (`webkit-2388`) | On-demand | Included (`test:e2e`) |
| `mobile-webkit` | iPhone 13 (`webkit-2388`) | On-demand | Included (`test:e2e`) |

### Performance Profiles (`lighthouserc.*.json`)

- **Mobile (`lighthouserc.mobile.json`):** Default Lighthouse simulated mobile throttling, 3 runs per URL, `median` aggregation, output to gitignored `artifacts/lighthouse/mobile/`.
- **Desktop (`lighthouserc.desktop.json`):** Lighthouse `preset: "desktop"`, 3 runs per URL, `median` aggregation, output to gitignored `artifacts/lighthouse/desktop/`.
- Mobile and desktop collections are always run and reported separately (never averaged into one median).

---

## 2. Unit and Component Testing (Vitest + Vite + Testing Library)

- **Packages (exact pinned versions):** `vitest@5.1.1`, `vite@8.3.8` (test runner infrastructure only — Next.js/Turbopack remains the application build system), `@vitejs/plugin-react@6.3.0`, `jsdom@31.0.1`, `@testing-library/react@16.3.3`, `@testing-library/dom@10.4.2`, `@testing-library/jest-dom@8.0.0`, `@testing-library/user-event@14.6.13`, `@vitest/coverage-v8@5.1.1`.
- **Runtime rule:** Always invoke Vitest through Node.js via `bun run test:run` (or `bun run test` for local watch mode). Do **not** run `bun test` (which invokes Bun's own runner) and do **not** force `--bun` on Vitest.
- **Configuration (`vitest.config.mts` and `vitest.setup.ts`):**
  - Uses Vite 8's native `resolve.tsconfigPaths: true` (no `vite-tsconfig-paths` plugin required).
  - Explicit imports (`globals: false`), `clearMocks: true`, `restoreMocks: true`.
  - Split into two projects:
    - `server` (`src/**/*.test.ts`, `environment: "node"`): maps `"server-only"` to `node_modules/server-only/empty.js` so pure server modules (`src/lib/content/reader.ts`, `src/lib/site.ts`, `src/app/robots.ts`) execute directly without module mocking.
    - `dom` (`src/**/*.test.tsx`, `environment: "jsdom"`): loads `vitest.setup.ts` (`@testing-library/jest-dom/vitest`, explicit `afterEach(cleanup)`, and a minimal `Element.prototype.getAnimations` polyfill required by `@ui-sdk/core` motion presence under jsdom 31).
  - Excludes `tests/**`, `**/e2e/**`, and `**/*.browser.test.*`.
- **Next.js Server Component boundary:** Async React Server Components are **not** unit-tested in jsdom. Route rendering, metadata streaming, hydration, and full server/client integration are verified against the real production Next.js server in Playwright.
- **Coverage scope and measured baseline (`bun run test:coverage`):**
  - `coverage.include` explicitly tracks all `src/**/*.{ts,tsx}` (excluding only `*.test.{ts,tsx}` and `*.d.ts`) so unimported Server Components stay honestly visible in the denominator.
  - Baseline recorded on 2026-11-21 (5 test files, 12 tests): **68.49% statements, 59.45% branches, 76.00% functions, 68.05% lines** (100% coverage on `src/lib/site.ts`, `src/lib/content/reader.ts`, `src/lib/content/local-content.ts`, `src/components/foundation-tabs.tsx`, `src/app/error.tsx`, and `src/components/ui/button.tsx`). Threshold gates will be introduced only after feature routes and components mature.
- **Optional upgrades (not yet needed):** Vitest Browser Mode (`@vitest/browser-playwright`) and MSW 3 (`msw/http`) are documented for future browser-fidelity component tests or shared HTTP fixtures when needed.

---

## 3. End-to-End, Accessibility, and Visual Regression (Playwright + axe-core)

- **Packages:** `@playwright/test@1.65.1`, `@axe-core/playwright@4.14.0`.
- **Production test server:** `playwright.config.ts` starts the actual built app via `bun run start -- --hostname 127.0.0.1 --port 3147` (`PLAYWRIGHT_PORT` / `E2E_BASE_URL` / `E2E_START_COMMAND` configurable) with `reuseExistingServer: false` so tests never attach accidentally to an unrelated dev server. Build first (`bun run build`) before running Playwright.
- **Suite organization (`tests/`):**
  - `tests/smoke.spec.ts` — Core route rendering, console/page error checks, UI SDK tab interaction, mobile overflow, 404 navigation.
  - `tests/seo.spec.ts` (`@seo`) — Metadata, OpenGraph/Twitter tags, `noindex`/`nofollow`, canonical absence while `NEXT_PUBLIC_SITE_URL` is unset, `/robots.txt`, single `<h1>`, image dimensions, and 404 semantics.
  - `tests/accessibility.spec.ts` (`@a11y`) — WCAG 2.1 A/AA `@axe-core/playwright` scans across all 3 UI SDK tab states and custom 404 route, skip-link keyboard focus, `prefers-reduced-motion: reduce`, and `320px` narrow-viewport overflow.
  - `tests/visual.spec.ts` (`@visual`) — Deterministic Desktop Chromium (`1280x900`, `reducedMotion: "reduce"`, `animations: "disabled"`, fonts awaited) full-page visual regression baseline.
  - `tests/seed.spec.ts` — Seed baseline for Playwright test agents (`planner`, `generator`, `healer`) configured under `specs/`, `.claude/agents/`, and `.codex/agents/`.
- **Visual baseline policy:**
  - Reviewed baseline image: `tests/visual.spec.ts-snapshots/starter-home-desktop-chromium-win32.png` (visually inspected on 2026-11-21).
  - Never blindly overwrite failing visual snapshots or widen pixel tolerances to mask regressions. Inspect visual diffs manually, confirm intentional design changes, and keep Linux CI vs Windows snapshot platform suffixes aligned if visual diffing is added to Linux CI.
- **Failure artifacts and privacy:** Traces (`retain-on-failure`), failure screenshots (`only-on-failure`), `playwright-report/`, `test-results/`, and any browser auth state remain gitignored.
- **Accessibility review boundary:** Passing automated axe-core scans does **not** prove full WCAG compliance; manual keyboard navigation, focus order, contrast under zoom, and screen-reader testing remain required for real features.

---

## 4. Performance Baselines and Bundle Analysis

### Lighthouse CI (`bun run perf:lhci`)

- **Runner:** `scripts/run-lhci.ts` resolves Chrome (`CHROME_PATH` or standard OS paths) and executes `bunx --no-install lhci autorun --config=./lighthouserc.<profile>.json` against a dedicated loopback production server on port `3200`.
- **Initial diagnostic assertions:** Configured at `warn` level with explicit `aggregationMethod: "median"` (LCP <= 2500ms, CLS <= 0.1, TBT <= 200ms, Performance/Accessibility/Best Practices >= 0.90). Assertions will move to strict regression budgets once real page templates and assets exist.
- **Measured Baseline (2026-11-21, Lighthouse `13.6.0`, LHCI `0.16.1`, Chrome `158.0.8127.36`, Windows 11 local workstation, Next.js `16.4.6` production build, route `/`):**

| Profile | Runs | Performance (Med) | A11y (Med) | Best Practices (Med) | SEO (Med) | LCP (Med) | FCP (Med) | TBT (Med) | CLS (Med) | Transfer |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Desktop (`preset: desktop`) | 3 | `100` (100, 100, 100) | `100` | `100` | `66`* | `220 ms` (232, 220, 217) | `220 ms` | `9 ms` (9, 15, 9) | `0` | `266.5 KB` |
| Mobile (default simulated throttling) | 3 | `90` (78, 90, 91) | `100` | `100` | `66`* | `2840 ms` (3122, 2840, 2798) | `766 ms` | `271 ms` (626, 271, 254) | `0` | `266.5 KB` |

\* _SEO score of `66` is expected and intentional while the provisional scaffold sets `noindex, nofollow` and `Disallow: /` (`is-crawlable` audit deducts 34 points until public launch)._ _Note: Mobile run #1 was captured while background host installs were completing on the workstation; isolate performance runs from concurrent CPU-heavy workloads before tightening budgets._

### Native Next.js Turbopack Bundle Analysis

- `bun run analyze` executes `next analyze --output` (writes artifacts under `.next/diagnostics/analyze/` without starting an interactive UI server).
- `bun run analyze:export` streams the saved module graph as JSON Lines (`next analyze export`) for programmatic inspection.
- Use `next analyze` (without `--output`) locally to explore route chunks interactively. Analysis does not replace `bun run build`.

### Field Performance and External Diagnostics (Separate from Lab)

- **Core Web Vitals field targets:** 75th percentile separately for mobile and desktop — LCP <= 2.5s, INP <= 200ms, CLS <= 0.1. Lab TBT does not establish field INP.
- **Vercel Speed Insights / `web-vitals`:** Not yet mounted (no deployed production traffic). Reuse a single RUM collector when deployed.
- **PageSpeed Insights API (`PAGESPEED_API_KEY`), CrUX API (`CRUX_API_KEY`), WebPageTest (`WEBPAGETEST_API_KEY`), Grafana k6:** Documented optional capabilities; no keys or live public URL traffic are configured yet.

---

## 5. Technical SEO, Links, Prose, and External Crawlers

- **Route-level technical SEO:** Enforced in `tests/seo.spec.ts` using native Next.js App Router conventions (`metadata`, `metadataBase`, `src/app/robots.ts`; `sitemap.ts` and JSON-LD to be added when real indexable routes exist).
- **Link checking (`bun run check:links`):** Runs host `lychee` (`0.24.2`) with `lychee.toml` in `--offline` mode across `README.md`, `AGENTS.md`, `DESIGN.md`, and `docs/**/*.md`. For explicit bounded external link audits, run `lychee` without `--offline` and report transient 429/timeout failures separately from confirmed broken links.
- **Prose linting (`bun run check:prose`):** Runs host `vale` (`3.28.1`) with `.vale.ini` and project vocabulary (`styles/config/vocabularies/Website/accept.txt`). When Core Payload CMS integration arrives, add a read-only export step so CMS-managed public copy is linted alongside Markdown docs without mutating CMS records.
- **Pending external SEO accounts/tools (not supplied):**
  - **Google Search Console API:** OAuth read-only (`webmasters.readonly`), `GSC_*` aliases pending verified domain property. Distinguish indexed inspection results from live crawlability.
  - **Rich Results Test / Schema Markup Validator:** Manual/representative public validation (no official public CI automation API).
  - **Screaming Frog SEO Spider:** Not installed on this workstation (free cap 500 URLs; JS rendering/saved crawls require license).
  - **Ahrefs MCP/REST & Bing/IndexNow:** Pending account entitlement and public launch site; never submit URLs as setup smoke tests.

---

## 6. CI Cadence (`.github/workflows/`)

- **Normal PR / Push (`.github/workflows/ci.yml`):**
  1. `bun install --frozen-lockfile`
  2. `bun run check` (Ultracite: Oxlint + `tsrs` + `@shadcn/lint` + `anti-slop` + Oxfmt)
  3. `bun run knip`
  4. `bun run test:run` (Vitest unit & component suite)
  5. `bun run build` (Next.js production build + route typegen + full TypeScript 7.1 beta check)
  6. Playwright Chromium smoke + `@seo` + `@a11y` (`bun run test:smoke`), uploading `playwright-report/` and `test-results/` on failure.
- **Scheduled / Manual Deep Audit (`.github/workflows/nightly-audit.yml`):**
  - Full 4-project Playwright cross-engine matrix (`chromium`, `firefox`, `webkit`, `mobile-webkit`, excluding Windows-specific visual snapshots on Linux runners).
  - Isolated Lighthouse CI mobile & desktop job uploading private `artifacts/lighthouse/` reports.
  - Offline Lychee Markdown link check.
