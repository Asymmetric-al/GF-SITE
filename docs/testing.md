# Testing, Performance, and Technical SEO Guide

This document describes the automated testing, accessibility, visual regression, performance benchmarking, bundle analysis, link/prose checking, and technical SEO setup in `GF-SITE`.

## 1. Route, Browser, and Performance Profile Inventory

### Tested Routes (Current Website Inventory)

| Route | Expected Status | Coverage |
| --- | --- | --- |
| `/`, `/how-we-work`, `/our-people`, `/where-we-serve`, `/where-we-serve/[region]`, `/missionaries`, `/missionaries/beaumont`, `/missionaries/oates`, `/projects`, `/projects/leadership-summit`, `/opportunities`, `/opportunities/[slug]`, `/serve-across-cultures`, `/bridge-project`, `/churches`, `/local-leaders`, `/pray`, `/give`, `/give/help`, `/financials`, `/statement-of-faith`, `/stories`, `/stories/[slug]`, `/contact`, `/donor-privacy` | `200` | Smoke rendering, zero console/page errors, responsive overflow (`320px`, `390px`, desktop), `@ui-sdk/react` `SegmentedControl` / `Tabs` / `Accordion` / `Collapsible` / `Timeline` / `Drawer` + 7-catalog interactive craft (`StewardshipWaffle`, `SearchableFaq`, `EditorialTimeline`, `EditorialPhotoAccordion`, `StrategyPhaseExplorer`, `SectionScrollspy`), WCAG 2.2 A/AA axe-core scans (light & dark), technical SEO metadata & CSP, JS-disabled progressive enhancement, print expansion, Desktop & Mobile visual baselines, and 4-route Lighthouse CI mobile & desktop |
| Legacy permanent redirects (`/about`, `/join`, `/serve`, `/training`, `/exposure-trips`, `/board-members`, `/global-fellowship-leadership-summit`, `/central-asia`, `/missionary/*`, `/user/*`, `/StatementofActivity-2025-updated.pdf`, etc.) | `308` | Verified redirect integrity (`legacy.test.ts` & Playwright) with zero chains and zero per-worker slug echoing |
| Retired WIP/event routes (`/checkout-test`, `/opportunities-copy`, `/church-plantertemplate`, `/field-supporttemplate`, `/year-to-date-statement-wip`, `/campaign`, `/customize`, `/promote`, `/review`, `/confirmation`, `/home-draft`, `/ytd-statement-admin`, `/annualfundraiser`, `/silent-auction`, `/christmas22`) | `410` | True HTTP `410 Gone` with HTML escaping and `X-Robots-Tag: noindex, nofollow` |
| `/eula`, `/privacypolicy` | `200` | Standalone isolated Accounting App legal notices (`noindex, nofollow`) |
| `/robots.txt` | `200` (`text/plain`) | Search crawlability policy (`Allow: /` on non-preview builds; `Disallow: /` on `VERCEL_ENV=preview`) |
| `/non-existent-route-*`, unknown `/projects/*`, unknown `/missionaries/*` | `404` | Custom 404 status, single `<h1>`, zero slug/ID echo, WCAG 2.2 A/AA scan, Finance & home recovery links |

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

- **Packages (exact pinned versions):** `vitest@5.1.1`, `vite@8.3.8` (test runner infrastructure only; Next.js/Turbopack remains the application build system), `@vitejs/plugin-react@6.3.0`, `jsdom@31.0.1`, `@testing-library/react@16.3.3`, `@testing-library/dom@10.4.2`, `@testing-library/jest-dom@8.0.0`, `@testing-library/user-event@14.6.13`, `@vitest/coverage-v8@5.1.1`.
- **Runtime rule:** Always invoke Vitest through Node.js via `bun run test:run` (or `bun run test` for local watch mode). Do **not** run `bun test` (which invokes Bun's own runner) and do **not** force `--bun` on Vitest.
- **Configuration (`vitest.config.mts` and `vitest.setup.ts`):**
  - Uses Vite 8's native `resolve.tsconfigPaths: true` (no `vite-tsconfig-paths` plugin required).
  - Explicit imports (`globals: false`), `clearMocks: true`, `restoreMocks: true`.
  - Split into two projects:
    - `server` (`src/**/*.test.ts`, `scripts/**/*.test.ts`, `environment: "node"`): maps `"server-only"` to `node_modules/server-only/empty.js` so pure server modules (`src/lib/content/reader.ts`, `src/lib/site.ts`, `src/app/robots.ts`, `src/app/page.tsx`) and repository invariant helpers (`scripts/foundation-invariants.ts`) execute directly without module mocking.
    - `dom` (`src/**/*.test.tsx`, `environment: "jsdom"`): loads `vitest.setup.ts` (`@testing-library/jest-dom/vitest`, explicit `afterEach(cleanup)`, and a minimal `Element.prototype.getAnimations` polyfill required by `@ui-sdk/core` motion presence under jsdom 31).
  - Excludes `tests/**`, `**/e2e/**`, `**/*.browser.test.*`, `.agents/**`, `.claude/**`, `.codex/**`, and `.cursor/**`.
- **Next.js Server Component boundary:** Async React Server Components are **not** unit-tested in jsdom. Route rendering, metadata streaming, hydration, and full server/client integration are verified against the real production Next.js server in Playwright.
- **Coverage scope (`bun run test:coverage`):**
  - `coverage.include` explicitly tracks all `src/**/*.{ts,tsx}` (excluding only `*.test.{ts,tsx}` and `*.d.ts`) so unimported Server Components stay honestly visible in the denominator. Threshold gates will be introduced once feature routes and components mature.
- **Optional upgrades (not yet needed):** Vitest Browser Mode (`@vitest/browser-playwright`) and MSW 3 (`msw/http`) are documented for future browser-fidelity component tests or shared HTTP fixtures when needed.

---

## 3. End-to-End, Accessibility, and Visual Regression (Playwright + axe-core)

- **Packages:** `@playwright/test@1.65.1`, `@axe-core/playwright@4.14.0`.
- **Production test server:** `playwright.config.ts` starts the built app via `bun run start -- --hostname 127.0.0.1 --port 3147` (`PLAYWRIGHT_PORT` / `E2E_START_COMMAND` configurable) with `reuseExistingServer: false`. When `E2E_BASE_URL` is set without `E2E_START_COMMAND`, Playwright skips launching a local `webServer` so it can test external preview deployments directly. Build first (`bun run build`) before running local Playwright suites.
- **Suite organization (`tests/`):**
  - `tests/smoke.spec.ts`: Core route rendering, console/page error checks, UI SDK tab interaction, mobile overflow, 404 navigation.
  - `tests/seo.spec.ts` (`@seo`): Metadata, OpenGraph/Twitter tags, non-preview crawlability (`index, follow`, `Allow: /`) paired with strict `noindex` on `/eula`, `/privacypolicy`, and Vercel preview builds, baseline HTTP security headers (`X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy`, `X-Frame-Options`, no `X-Powered-By`), canonical and `/sitemap.xml` omission while `NEXT_PUBLIC_SITE_URL` is unset, `/robots.txt`, single `<h1>`, image dimensions, and 404 semantics.
  - `tests/accessibility.spec.ts` (`@a11y`): Full WCAG 2.2 A/AA suite covering `@axe-core/playwright` light/dark/HTTP `400`/`404`/`410`/`503` scans, keyboard skip-link activation into `#main-content`, sticky-header scroll `elementFromPoint` hit-tests, mobile `SectionSubnavRail` auto-centering, `44px` tap targets, and full-rail `320px` `Tab` traversal, mobile `SectionScrollspy` `@ui-sdk/react/collapsible` Escape focus return and destination heading focus handoff, `/opportunities` above-the-fold role visibility on desktop (`1440x900`) and mobile (`390x844`), rendered-pixel `>= 4.5:1` contrast behind `/our-people` `"One family."`, 28-point worst-case photo-eyebrow pixel contrast, Layer 2 foreground overlap bounds `[0.2%, 30%]` at `1280px` and `1440px`, 12-width (`1024px` to `1920px`) continuous zero-stem-occlusion verification on Home, `prefers-reduced-motion: reduce`, and `320px` narrow-viewport overflow.
  - `tests/visual.spec.ts` (`@visual`): Deterministic Desktop Chromium (`1280x900`, `reducedMotion: "reduce"`, `animations: "disabled"`, fonts awaited) full-page visual regression baseline.
  - `tests/seed.spec.ts`: Seed baseline for Playwright test agents (`planner`, `generator`, `healer`) configured under `specs/`, `.claude/agents/`, and `.codex/agents/`.
- **Visual baseline policy:**
  - Reviewed baseline snapshots live in `tests/visual.spec.ts-snapshots/` (desktop, dark, and `390px`/`320px` mobile captures covering Home, How We Work, `/financials`, Give, Missionaries, Projects, Opportunities, Serve Across Cultures, Our People, Churches, Local Leaders, Where We Serve, Stories, Contact, and Bridge Project).
  - Never blindly overwrite failing visual snapshots or widen pixel tolerances to mask regressions. Inspect visual diffs manually, confirm intentional design changes, and keep Linux CI vs Windows snapshot platform suffixes aligned if visual diffing is added to Linux CI.
- **Failure artifacts and privacy:** Traces (`retain-on-failure`), failure screenshots (`only-on-failure`), `playwright-report/`, `test-results/`, and any browser auth state remain gitignored.
- **Accessibility review boundary:** Passing automated axe-core scans does **not** prove full WCAG compliance; manual keyboard navigation, focus order, contrast under zoom, and screen-reader testing remain required for real features.

---

## 4. Performance Baselines and Bundle Analysis

### Lighthouse CI (`bun run perf:lhci`)

- **Runner:** `scripts/run-lhci.ts` wipes stale reports inside `artifacts/lighthouse/<profile>/`, resolves Chrome (`CHROME_PATH` or standard OS paths), and executes `bunx --no-install lhci autorun --config=./lighthouserc.<profile>.json` against a dedicated loopback production server on port `3200`.
- **Initial assertions:** Deterministic accessibility (`>= 0.90`) and CLS (`<= 0.1`) assertions are enforced at `error` level (`aggregationMethod: "median"`); noisy simulated-CPU timing metrics (LCP <= 2500ms, TBT <= 200ms, Performance/Best Practices >= 0.90) start at `warn` level until real page templates and CI runner baselines exist.
- **Historical Initial Scaffold Baseline (2026-11-21, Lighthouse `13.6.0`, LHCI `0.16.1`, Chrome `158.0.8127.36`, Windows 11 local workstation, Next.js `16.4.6` production build, route `/`; current 4-route mobile & desktop production measurements are recorded per frozen round in [docs/website-council/round-record.md](./website-council/round-record.md)):**

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

- **Core Web Vitals field targets:** 75th percentile separately for mobile and desktop: LCP <= 2.5s, INP <= 200ms, CLS <= 0.1. Lab TBT does not establish field INP.
- **Vercel Speed Insights / `web-vitals`:** Not yet mounted (no deployed production traffic). Reuse a single RUM collector when deployed.
- **PageSpeed Insights API (`PAGESPEED_API_KEY`), CrUX API (`CRUX_API_KEY`), WebPageTest (`WEBPAGETEST_API_KEY`), Grafana k6:** Documented optional capabilities; no keys or live public URL traffic are configured yet.

---

## 5. Technical SEO, Links, Prose, and External Crawlers

- **Route-level technical SEO:** Enforced in `tests/seo.spec.ts` using native Next.js App Router conventions (`metadata`, `metadataBase`, `src/app/robots.ts`, pre-launch empty `src/app/sitemap.ts`, and `Organization` / `NGO` JSON-LD in `src/app/(site)/layout.tsx`).
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
  2. `bun run check` (Ultracite: Oxlint + `tsrs` + `@shadcn/lint` + `anti-slop` + `oxlint-plugin-react-doctor` + Oxfmt)
  3. `bun run check:foundation` (zero Radix, zero `oxlint-tsgolint`, skill parity, managed markers, CSS layer order, manifest sync)
  4. `bun run okf:validate` (strict OKF v0.3 conformance validation across `knowledge/`)
  5. `bun run knip`
  6. Offline Lychee Markdown link check (`lycheeverse/lychee-action@v2`), pinned Vale `3.28.1` editorial/prose check (`styles/GF/`), and `gitleaks` (`8.30.1`) secret scan
  7. `bun run test:run` (Vitest unit & component suite, including OKF and brand-kit safety regression guards)
  8. `bun run build` (Next.js production build + route typegen + full TypeScript 7.1 beta check)
  9. Playwright Chromium smoke + `@seo` + `@a11y` (`bun run test:smoke`), uploading `playwright-report/` and `test-results/` on failure.
- **Scheduled / Manual Deep Audit (`.github/workflows/nightly-audit.yml`):**
  - Full 4-project Playwright cross-engine matrix (`chromium`, `firefox`, `webkit`, `mobile-webkit`, excluding Windows-specific visual snapshots on Linux runners).
  - Isolated Lighthouse CI mobile & desktop job uploading private `artifacts/lighthouse/` reports.
  - Offline Lychee Markdown link check.
