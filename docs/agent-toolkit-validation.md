# GF-SITE Agent Toolkit Validation Log

**Validation date:** 2026-11-21 (UTC+07:00)  
**Repository:** `https://github.com/Asymmetric-al/GF-SITE`  
**Reference environment:** Windows 11 & Linux (`ubuntu-latest` CI), Node.js `v24.22.3`, Bun `1.4.3`, Google Chrome `158.0.8127.36`, Python `3.14.7`

All validation checks below were **harmless local checks and non-mutating vendor probes** — local build, bundle-analysis, test, and post-edit hook verification wrote only local build/diagnostic artifacts or exercised clean/no-op targets without mutating production or vendor data. No emails were sent, no cards were charged, no URLs were submitted to search engines, no production deployments or CMS mutations occurred, and no bulk paid catalog downloads were performed. Personal workstation paths, account handles, and credential expiry metadata are deliberately omitted from this public document.

---

## 1. Core Quality, Typecheck, Build, and Security Checks

| Check | Exact Command | Observed Result |
| --- | --- | --- |
| Foundation invariants | `bun run check:foundation` | **Pass** — `122` synced skills (`.agents/skills` & `.claude/skills`, zero symlinks, matching frontmatter), `0` Radix references (including nested lockfile/node_modules checks), `0` `oxlint-tsgolint`, `0` removed `Nia` entries, Next.js managed markers intact, `@layer ui-sdk;` on line 1, public-doc privacy guard clean |
| Ultracite doctor | `bunx --no-install ultracite doctor` | **Pass** — `10 passed, 0 warnings, 0 failed` (`oxlint@1.94.0`, `oxfmt@0.79.0`, `3` lint plugins satisfied) |
| Ultracite check | `bun run check` | **Pass** — `0 warnings, 0 errors` across `1,126` rules (`core`, `react`, `next`, `playwright`, `anti-slop`, `@shadcn/lint`, `oxlint-plugin-react-doctor`, `next/js-plugins`, scoped `vitest`, scoped `@interfere/landmines/testing`, `no-restricted-imports` for Radix) + Oxfmt clean |
| Knip unused audit | `bun run knip` | **Pass** (`exit 0`, zero hints) — zero unused files, exports, or active dependencies |
| TypeScript 7.1 beta | `bun run typecheck` | **Pass** — `next typegen` + `tsc --noEmit` succeeded (`target: ES2022`) |
| Production build | `bun run build` | **Pass** — Next.js `16.4.6` (Turbopack, Cache Components, Partial Prefetching, React Compiler, security headers, `poweredByHeader: false`), `5/5` static pages prerendered |
| Next bundle analyzer | `bun run analyze` & `bun run analyze:export` | **Pass** — wrote `.next/diagnostics/analyze`; `next analyze export` emitted schema v1 JSON Lines (`5` routes) |
| Post-edit hooks | `ultracite fix --hook` + `scripts/antigravity-post-edit-hook.ts` | **Pass** — empty JSON, failed-tool input, deleted-file input, and clean-file probes verified; non-zero fixer exits surface stderr diagnostics |

---

## 2. Testing, Accessibility, Visual Regression, and Performance

| Suite | Exact Command | Observed Result |
| --- | --- | --- |
| Vitest unit & component tests | `bun run test:run` | **Pass** — `8` test files (`src/**/*.test.{ts,tsx}` + `scripts/foundation-invariants.test.ts`), covering site origin/preview canonicals, Open Graph preservation, `robots.ts`, `reader.ts`, `error.tsx`/`global-error.tsx` (including non-Error throws), `FoundationTabs`, and nested Radix lockfile guards |
| Playwright cross-engine matrix | `bun run test:e2e` | **Pass** — `56 passed, 0 failed` across `chromium`, `firefox`, `webkit`, and `mobile-webkit` iPhone 13 (14 tests per project, excluding platform-specific `@visual`) |
| Visual baseline review | `bun run test:visual` | **Pass & visually reviewed** — `tests/visual.spec.ts-snapshots/starter-home-desktop-chromium-win32.png` inspected directly and verified deterministic on Windows Desktop Chromium |
| Live `next-dev-loop` | `next dev` + `POST /_next/mcp` + `agent-browser` (`0.43.0`) | **Pass** — `/_next/mcp` returned HTTP `200`; `agent-browser` opened `http://127.0.0.1:3199/`, read title `Global Fellowship (Development Scaffold)`, and closed cleanly |
| Lighthouse CI desktop (3 runs) | `bun run perf:lhci:desktop` | **Pass** — Medians: Performance `100`, Accessibility `100`, Best Practices `100`, SEO `66` (expected provisional `noindex`), LCP `220ms`, FCP `220ms`, TBT `9ms`, CLS `0`, Transfer `266.5 KB` |
| Lighthouse CI mobile (3 runs) | `bun run perf:lhci:mobile` | **Pass with diagnostic timing warnings** — Medians: Performance `90` (78, 90, 91), Accessibility `100`, Best Practices `100`, SEO `66` (expected provisional `noindex`), LCP `2840ms`, FCP `766ms`, TBT `271ms`, CLS `0`, Transfer `266.5 KB` |

---

## 3. Host CLIs, Content, Media, and Diagnostics

| Tool | Version / Command | Observed Result |
| --- | --- | --- |
| `lychee` | `0.24.2` (`bun run check:links`) | **Pass** — `0` broken links across repository Markdown files |
| `vale` | `3.28.1` (`bun run check:prose`) | **Pass** — `0 errors, 0 warnings, 0 suggestions` with custom `Website` vocabulary |
| `svgo` | `4.1.0` (temp output on `public/starter-preview.svg`) | **Pass** — optimized `1.59 KiB -> 1.507 KiB (-5.2%)` (temp file deleted) |
| `fonttools` | `4.68.0` (`fonttools subset --help`) | **Pass** — OpenType/WOFF subsetter ready on PATH |
| `ffmpeg` / `ffprobe` | `9.1` (`ffprobe -version`) | **Pass** — available on PATH |
| `gh` | GitHub CLI (`gh auth status`) | **Authenticated** (account details omitted in public docs) |
| `vercel` | `64.5.0` (`vercel whoami`) | **Authenticated** (separate from Vercel MCP OAuth) |
| `sentry` | `0.47.0` (`sentry auth status`) | **Authenticated** (auto-refresh enabled; no Sentry SDK mounted yet) |
| `resend` | `v2.26.0` (`resend whoami`) | **Authenticated** via secure storage (no emails sent) |
| `@shadscan/cli` | `0.17.0` (`--json --no-interactive`) | **Pass (diagnostic)** — reported 3 expected starter-scaffold warnings deferred until design work begins |
| `react-doctor` | `0.9.23` (`oxlint-plugin-react-doctor@0.9.23` active in `bun run check`; CLI `--no-telemetry`) | **Static rules active in Oxlint** (`ultracite/oxlint/js-plugins` + `next/js-plugins`); standalone CLI requires interactive TTY |
| `cld` (Cloudinary) | `1.17.0` (`cld config`) | **Configured, authentication pending** — saved OAuth session requires `cld login`; `CLOUDINARY_API_KEY` alone lacks cloud name/API secret |
| `gitleaks` | `8.30.1` (`gitleaks dir --redact .`) | **Pass (`0` real leaks)** — verified locally and enforced in PR CI; `.gitleaks.toml` allowlists gitignored build directories and the intentional dummy prompt string in vendored `video/evals/evals.json` |

---

## 4. Live MCP Handshakes and UI Registry Entitlement Checks

### MCP Servers

| Server | Transport / Endpoint | Observed Result |
| --- | --- | --- |
| `shadcn` | Stdio (`bunx --no-install shadcn mcp`, `4.23.0`) | **Verified** — `initialize` + `tools/list` returned **7 tools** |
| `shadcn-studio` | Stdio (`bun scripts/shadcn-studio-mcp.ts` -> `shadcn-studio-mcp@1.0.7`, allowlisted child env) | **Verified** — `initialize` + `tools/list` returned **15 tools** (`EMAIL`/`API_KEY` mapped with unrelated parent secrets stripped) |
| `reactbits-pro` | HTTP (`https://mcp.reactbits.dev/mcp`, Bearer `REACTBITS_LICENSE_KEY`) | **Verified** — HTTP `200`, **9 tools**; `react-bits-pro@0.1.0 whoami` confirmed **Pro** tier |
| `shadcnuikit` | HTTP (`https://shadcnuikit.com/api/mcp`, Bearer `SHADCNUIKIT_API_KEY`) | **Verified** — HTTP `200`, **6 tools** |
| `shadcn-space` | HTTP (`https://mcp.shadcnspace.com/mcp`, free tier) | **Verified** — HTTP `200`, **14 tools** (Pro tier not configured) |
| `context7` | HTTP (`https://mcp.context7.com/mcp`, `CONTEXT7_API_KEY`) | **Verified** — HTTP `200` (`text/event-stream`), **2 tools** |
| `resend` | HTTP (`https://mcp.resend.com/mcp`, Bearer `RESEND_API_KEY`) | **Verified** — HTTP `200`, **142 tools** |
| `next-devtools` | Stdio (`bunx next-devtools-mcp@0.4.0`) | **Verified** — `initialize` + `tools/list` operational; `/_next/mcp` returned HTTP `200` on running `next dev` |
| `reui` | HTTP (`https://mcp.reui.io`) | **Configured, authentication pending** — HTTP `401`; requires OAuth or separate `REUI_MCP_TOKEN` |
| `vercel` | HTTP (`https://mcp.vercel.com`) | **Configured, authentication pending** — HTTP `401`; requires OAuth sign-in separately from `VERCEL_TOKEN` CLI |

### UI Registries (`shadcn search` + read-only `shadcn view` source import audit)

| Registry | Search Count | Sample Item Viewed | Radix Imports? | Base UI Imports? | UI SDK Imports? | Notes |
| --- | --- | --- | --- | --- | --- | --- |
| `@shadcn` | 221 | `@shadcn/badge` | No | Yes | No | Official `base-maia` |
| `@react-bits` | 1,278 | `@react-bits/SplitText-TS-TW` | No | No | No | Free; depends on `gsap`, `@gsap/react` (MIT + Commons Clause) |
| `@reactbits-starter` | 513 | `@reactbits-starter/staggered-text-tw` + `skill` | No | No | No | Authenticated (`REACTBITS_LICENSE_KEY`); depends on `motion` |
| `@reactbits-pro` | 734 | `@reactbits-pro/hero-1` | No | No | No | Authenticated Pro tier; depends on `motion`, `lucide-react` |
| `@reui` | 82 | `@reui/badge` | No | Yes | No | Authenticated (`REUI_LICENSE_KEY`); Personal 1-seat license |
| `@shadcnblocks` | N/A (`/registry` 404) | `@shadcnblocks/hero1` (`base-maia` HTTP 200) | No | No | No | Authenticated (`SHADCNBLOCKS_API_KEY`); direct item view works across styles, no `/registry` search index |
| `@shadcnuikit` | 1,228 | `@shadcnuikit/button5` | No | No | No | Authenticated (`SHADCNUIKIT_API_KEY`); inspect complex blocks before adoption (no `{style}` URL param) |
| `@efferd` | 249 | `@efferd/logo` | No | No | No | Authenticated (`EFFERD_REGISTRY_TOKEN`) |
| `@shadcn-studio` | 1,009 | `@shadcn-studio/accordion-01` | No | No | No | Public free namespace |
| `@ss-components` | 902 | `@ss-components/accordion-01` | No | No | No | Authenticated via `SHADCN_STUDIO_EMAIL` + `SHADCN_STUDIO_LICENSE_KEY` |
| `@shadcn-space` | 1,312 | `@shadcn-space/hero-01` | No | No | No | Free tier; depends on `lucide-react`, `motion`, `@iconify/react` |

_None of the third-party catalogs ship Vercel UI SDK native interactive primitives. Always inspect recursive dependencies for zero Radix and adapt stateful controls to `@ui-sdk/react`._

---

## 5. Independent Cross-Provider Reviews

- **Initial setup reviews (pre-hardening snapshot, `123` skills prior to `Nia` removal):** Fresh Claude Code (`claude-sonnet-5-5`) and Codex sessions audited provider discovery, `AGENTS.md`, `DESIGN.md`, and `agent-toolkit-manifest.json`; all review findings were resolved and merged in PR #1 (`63144af`).
- **3-member `$council` Round 1 review (`f950258`):** Independently reviewed by Codex (`gpt-6.2-sol`, High — `8/10`), Antigravity (`gemini-4-neon`, `xhigh` — `8/10`), and Claude (`claude-opus-5-5`, High — `8/10`). All material findings were adjudicated and resolved prior to merge: preserved shared `SITE_OPEN_GRAPH` fields when setting homepage canonical URL, suppressed preview canonicals/localhost `metadataBase` outside dev, isolated `scripts/shadcn-studio-mcp.ts` subprocess env, scrubbed personal paths/account handles from public docs, expanded `scripts/check-foundation.ts` for nested/aliased Radix lockfile & `node_modules` checks + `.claude/skills` frontmatter parity + public-doc privacy guard, hardened `error.tsx`/`global-error.tsx` against non-Error throws + font fallback stack, replaced Windows-only `cmd /c npx` in `.codex/agents/playwright_test_*.toml`, made `playwright.config.ts` skip local `webServer` for external `E2E_BASE_URL`, split portable `test:e2e` from Windows-only `@visual`, added `gitleaks` to PR CI, and updated `shadcn` MCP configs to `bunx --no-install shadcn mcp`.
- **Codex CLI MCP trust boundary:** Project-scoped `.codex/config.toml` activates automatically once the developer trusts the repository checkout in Codex.

---

## 6. Remaining Human Actions (Optional / Account-Bound)

1. **T3 Code session reload:** Click **Restart agent session** in T3 Code so running provider processes inherit the updated private environment variables, skills, and project MCP definitions.
2. **OAuth sign-ins (when needed):** ReUI MCP (`https://mcp.reui.io`), Vercel MCP (`https://mcp.vercel.com`), Cloudinary CLI (`cld login`), and optional Figma / PostHog / Firecrawl / Deque / Google Search Console OAuth when those services are actively used.
3. **Optional credentials not supplied:** Shadcn Space Pro, Motion+, Google Cloud keys (`PAGESPEED_API_KEY`, `CRUX_API_KEY`), Screaming Frog license/install, Ahrefs, WebPageTest, and Grafana `k6` OS install.
4. **Core CMS & Vercel project linkage:** Connect `Asymmetric-al/GF-SITE` to the confirmed Vercel project and integrate `Asymmetric-al/core` Payload CMS v4 when design and launch planning begin.
