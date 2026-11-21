# GF-SITE Agent Toolkit Validation Log

**Validation date:** 2026-11-21 (UTC+07:00)  
**Repository:** `C:\Users\Conrad\Documents\GitHub\GF-SITE` (`https://github.com/Asymmetric-al/GF-SITE`)  
**Host environment:** Windows 11, Node.js `v24.22.3`, Bun `1.4.3`, Google Chrome `158.0.8127.36`, Python `3.14.7`, `t3 v0.1.12-nightly.20261120.4994`

All validation checks below were **harmless local checks and non-mutating vendor probes** — local build, bundle-analysis, test, and post-edit hook verification wrote only local build/diagnostic artifacts or exercised clean/no-op targets without mutating production or vendor data. No emails were sent, no cards were charged, no URLs were submitted to search engines, no production deployments or CMS mutations occurred, and no bulk paid catalog downloads were performed.

---

## 1. Core Quality, Typecheck, Build, and Security Checks

| Check | Exact Command | Observed Result |
| --- | --- | --- |
| Dependency graph hygiene | Lockfile & manifest audit (`radix`, `oxlint-tsgolint`) | **Pass** — `0` Radix references across `package.json` and `bun.lock` (including after installing Vitest/Vite/LHCI/@shadcn/lint/Tiptap 3.35.0); `node_modules/oxlint-tsgolint` absent (`oxlint@1.94.0` uses `tsrs@7.1.0-beta.tsrs4`) |
| Ultracite doctor | `bunx --no-install ultracite doctor` | **Pass** — `10 passed, 0 warnings, 0 failed` (`oxlint@1.94.0`, `oxfmt@0.79.0`, 2 JS plugins satisfied) |
| Ultracite check | `bun run check` | **Pass** — `0 warnings, 0 errors` across 690 rules (`core`, `react`, `next`, `playwright`, `anti-slop`, `@shadcn/lint`, scoped `vitest`, scoped `@interfere/landmines/testing`) + Oxfmt clean |
| Knip unused audit | `bun run knip` | **Pass** (`exit 0`) — zero unused files, exports, or active dependencies |
| TypeScript 7.1 beta | `bun run typecheck` | **Pass** — `next typegen` + `tsc --noEmit` succeeded |
| Production build | `bun run build` | **Pass** — Next.js `16.4.6` (Turbopack, Cache Components, Partial Prefetching, React Compiler) compiled in `12.2s`, TS in `4.0s`, `5/5` static pages prerendered |
| Next bundle analyzer | `bun run analyze` & `bun run analyze:export` | **Pass** — wrote `.next/diagnostics/analyze` in `9.6s`; `next analyze export` emitted schema v1 JSON Lines (`5` routes) |
| Post-edit hooks | `ultracite fix --hook` (empty JSON, delete event, multi-file `apply_patch`) + `scripts/antigravity-post-edit-hook.ts` | **Pass** — all 4 probes exited `0`; non-edit and delete events were clean no-ops; multi-file patch checked targeted files cleanly |

---

## 2. Testing, Accessibility, Visual Regression, and Performance

| Suite | Exact Command | Observed Result |
| --- | --- | --- |
| Vitest unit & component tests | `bun run test:run` | **Pass** — `5` test files, `12` passed (`0` failed): `site.test.ts` (4), `reader.test.ts` (2), `robots.test.ts` (1), `error.test.tsx` (2), `foundation-tabs.test.tsx` (3) |
| Vitest V8 coverage | `bun run test:coverage` | **Pass** — `68.49%` statements / `59.45%` branches / `76.00%` functions / `68.05%` lines across all `src/**/*.{ts,tsx}` (including unimported RSCs honestly kept in denominator) |
| Playwright cross-engine matrix | `bun run test:e2e` | **Pass** — `61 passed, 3 skipped, 0 failed` (`1.2m`) across `chromium` (16/16), `firefox` (15/15 + 1 visual skip), `webkit` (15/15 + 1 visual skip), `mobile-webkit` iPhone 13 (15/15 + 1 visual skip) |
| Visual baseline review | `tests/visual.spec.ts` | **Pass & visually reviewed** — `tests/visual.spec.ts-snapshots/starter-home-desktop-chromium-win32.png` inspected directly and verified deterministic on rerun |
| Live `next-dev-loop` | `next dev` + `POST /_next/mcp` + `agent-browser` (`0.43.0`) | **Pass** — `/_next/mcp` returned HTTP `200`; `agent-browser` opened `http://127.0.0.1:3199/`, read title `Global Fellowship (Development Scaffold)`, and closed cleanly |
| Lighthouse CI desktop (3 runs) | `bun run perf:lhci:desktop` | **Pass (0 warnings)** — Medians: Performance `100`, Accessibility `100`, Best Practices `100`, SEO `66` (expected provisional `noindex`), LCP `220ms`, FCP `220ms`, TBT `9ms`, CLS `0`, Transfer `266.5 KB` |
| Lighthouse CI mobile (3 runs) | `bun run perf:lhci:mobile` | **Pass with diagnostic warnings** — Medians: Performance `90` (78, 90, 91), Accessibility `100`, Best Practices `100`, SEO `66` (expected provisional `noindex`), LCP `2840ms` (3122, 2840, 2798), FCP `766ms`, TBT `271ms` (626, 271, 254), CLS `0`, Transfer `266.5 KB` |

---

## 3. Host CLIs, Content, Media, and Diagnostics

| Tool | Version / Command | Observed Result |
| --- | --- | --- |
| `lychee` | `0.24.2` (`bun run check:links`) | **Pass** — `0` broken links across repository Markdown files |
| `vale` | `3.28.1` (`vale sync` + `bun run check:prose`) | **Pass** — `0 errors, 0 warnings, 0 suggestions` with custom `Website` vocabulary |
| `svgo` | `4.1.0` (temp output on `public/starter-preview.svg`) | **Pass** — optimized `1.59 KiB -> 1.507 KiB (-5.2%)` in `60ms` (temp file deleted) |
| `fonttools` | `4.68.0` (`fonttools subset --help`) | **Pass** — OpenType/WOFF subsetter ready on PATH |
| `ffmpeg` / `ffprobe` | `9.1` (`ffprobe -version`) | **Pass** — available on PATH |
| `gh` | GitHub CLI (`gh auth status`) | **Authenticated** as `cobmojo` (`gist`, `read:org`, `repo`, `workflow`) |
| `vercel` | `64.5.0` (`vercel whoami`) | **Authenticated** as `conrad-4371` (separate from Vercel MCP OAuth) |
| `sentry` | `0.47.0` (`sentry auth status`) | **Authenticated** (`Asymmetric.al`, token expires `2026-11-28`, auto-refresh enabled) |
| `resend` | `v2.26.0` (`resend whoami`) | **Authenticated** (`full_access` via secure storage) |
| `@shadscan/cli` | `0.17.0` (`--json --no-interactive`) | **Pass (diagnostic)** — reported 3 starter-scaffold warnings (`command-menu-present`, `theme-hotkey-present`, `theme-provider-configured`), deliberately deferred because no theme/command menu has been designed |
| `react-doctor` | `0.9.23` (`--no-telemetry`) | **Blocked in non-TTY shell** — process hung waiting for interactive input under non-TTY PowerShell; recorded as on-demand interactive diagnostic |
| `nia` | `v0.5.2` (`nia auth status`) | **Blocked / auth issue** — env key present, but CLI returned `Could not fetch plan info (API key may be invalid)` |
| `cld` (Cloudinary) | `1.17.0` (`cld config`) | **Configured, authentication pending** — OAuth profile `dvgyndcnu` expired `2026-10-30`; supplied `CLOUDINARY_API_KEY` alone lacks cloud name/API secret |
| `gitleaks` | `8.30.1` (`gitleaks dir --redact .`) | **Pass (`0` real leaks)** — verified across all tracked/candidate files; `.gitleaks.toml` allowlists gitignored build directories and the intentional dummy prompt string in vendored `video/evals/evals.json` |

---

## 4. Live MCP Handshakes and UI Registry Entitlement Checks

### MCP Servers

| Server | Transport / Endpoint | Observed Result |
| --- | --- | --- |
| `shadcn` | Stdio (`bunx --no-install shadcn mcp`, `4.23.0`) | **Verified** — `initialize` + `tools/list` returned **7 tools** |
| `shadcn-studio` | Stdio (`bun scripts/shadcn-studio-mcp.ts` -> `shadcn-studio-mcp@1.0.7`) | **Verified** — `initialize` + `tools/list` returned **15 tools** (`EMAIL`/`API_KEY` mapped privately) |
| `reactbits-pro` | HTTP (`https://mcp.reactbits.dev/mcp`, Bearer `REACTBITS_LICENSE_KEY`) | **Verified** — HTTP `200`, **9 tools**; `react-bits-pro@0.1.0 whoami` confirmed **Pro** tier |
| `shadcnuikit` | HTTP (`https://shadcnuikit.com/api/mcp`, Bearer `SHADCNUIKIT_API_KEY`) | **Verified** — HTTP `200`, **6 tools** |
| `shadcn-space` | HTTP (`https://mcp.shadcnspace.com/mcp`, free tier) | **Verified** — HTTP `200`, **14 tools** (Pro tier not supplied) |
| `context7` | HTTP (`https://mcp.context7.com/mcp`, `CONTEXT7_API_KEY`) | **Verified** — HTTP `200` (`text/event-stream`), **2 tools** |
| `resend` | HTTP (`https://mcp.resend.com/mcp`, Bearer `RESEND_API_KEY`) | **Verified** — HTTP `200`, **142 tools** |
| `next-devtools` | Stdio (`bunx next-devtools-mcp@0.4.0`) | **Verified** — `initialize` + `tools/list` operational; `/_next/mcp` returned HTTP `200` on running `next dev` |
| `reui` | HTTP (`https://mcp.reui.io`) | **Configured, authentication pending** — HTTP `401` (`Authentication required. Sign in with ReUI to use this server.`); requires OAuth or separate `REUI_MCP_TOKEN` |
| `vercel` | HTTP (`https://mcp.vercel.com`) | **Configured, authentication pending** — HTTP `401` (`No authorization provided`); requires OAuth sign-in separately from `VERCEL_TOKEN` CLI |

### UI Registries (`shadcn search` + read-only `shadcn view` source import audit)

| Registry | Search Count | Sample Item Viewed | Radix Imports? | Base UI Imports? | UI SDK Imports? | Notes |
| --- | --- | --- | --- | --- | --- | --- |
| `@shadcn` | 221 | `@shadcn/badge` | No | Yes | No | Official `base-maia` |
| `@react-bits` | 1,278 | `@react-bits/SplitText-TS-TW` | No | No | No | Free; depends on `gsap`, `@gsap/react` (MIT + Commons Clause) |
| `@reactbits-starter` | 513 | `@reactbits-starter/staggered-text-tw` + `skill` | No | No | No | Authenticated (`REACTBITS_LICENSE_KEY`); depends on `motion` |
| `@reactbits-pro` | 734 | `@reactbits-pro/hero-1` | No | No | No | Authenticated Pro tier; depends on `motion`, `lucide-react` |
| `@reui` | 82 | `@reui/badge` | No | Yes | No | Authenticated (`REUI_LICENSE_KEY`); Personal 1-seat license |
| `@shadcnblocks` | N/A (`/registry` 404) | `@shadcnblocks/hero1` (`base-maia` HTTP 200) | No | No | No | Authenticated (`SHADCNBLOCKS_API_KEY`, dated expiry `2026-12-03 07:00`, timezone unspecified); direct item view works across styles, no `/registry` search index |
| `@shadcnuikit` | 1,228 | `@shadcnuikit/button5` | No | No | No | Authenticated (`SHADCNUIKIT_API_KEY`); inspect every complex block/dashboard before adoption (no `{style}` URL param) |
| `@efferd` | 249 | `@efferd/logo` | No | No | No | Authenticated (`EFFERD_REGISTRY_TOKEN`) |
| `@shadcn-studio` | 1,009 | `@shadcn-studio/accordion-01` | No | No | No | Public free namespace |
| `@ss-components` | 902 | `@ss-components/accordion-01` | No | No | No | Authenticated via `SHADCN_STUDIO_EMAIL` + `SHADCN_STUDIO_LICENSE_KEY` |
| `@shadcn-space` | 1,312 | `@shadcn-space/hero-01` | No | No | No | Free tier; depends on `lucide-react`, `motion`, `@iconify/react` |

_None of the third-party catalogs ship Vercel UI SDK native interactive primitives. Always inspect recursive dependencies for zero Radix and adapt stateful controls to `@ui-sdk/react`._

---

## 5. Fresh Cross-Provider Session Verification

- **Claude Code (`claude-sonnet-5-5`, fresh T3 Code session in `GF-SITE`):**
  - Confirmed direct discovery of `CLAUDE.md`, `AGENTS.md`, `DESIGN.md`, `.claude/skills/` (`123` clean skills after removing 6 unrequested side-skills bundled by `ui-ux-pro-max-cli@2.15.0`), `.claude/agents/` (`8` files: 5 Impeccable + 3 Playwright test agents), `.claude/settings.json` hook, `.mcp.json` (`8` servers, placeholders only, zero literal secrets), and PATH binaries (`bun`, `node`, `agent-browser`, `lychee`, `vale`, `gitleaks`).
  - Audited `AGENTS.md` and `DESIGN.md` for preserved Next.js managed markers, NO Radix / Base UI / UI SDK / Tiptap 3.35.0 / Core CMS boundaries, zero unapproved visual choices, and routing walkthroughs for interactive UI, public copy editing, and non-UI server utilities.
  - Review findings resolved before commit: corrected skill counts in `docs/agent-toolkit.md` (`123` exact skills), moved `components.json` and `oxlint.config.ts` out of `DESIGN.md` §3 observed table into §2 established constraints, added an explicit server-utilities routing row and copy-editing lead tie-breaker to `AGENTS.md`, and removed 6 unrequested `ui-ux-pro-max-cli` side-skills (including Radix-referencing `ui-styling`).
- **Codex (fresh T3 Code session in `GF-SITE`):**
  - Confirmed direct discovery of `AGENTS.md`, `DESIGN.md`, `123` project skills, `3` Codex Playwright agents, valid `.codex/config.toml` declaring all `8` expected servers, host CLIs on PATH (`bun`, `node`, `gh`, `vercel`, `agent-browser`, `lychee`, `vale`, `gitleaks`), zero secrets across audited files, exact `package.json` pins (including all five Tiptap `3.35.0` packages), zero Radix hits across `package.json`, `bun.lock`, and `src/`, and valid `agent-toolkit-manifest.json` structure.
  - Review findings resolved before push: corrected unconfigured/uninstalled manifest item states (reserving `Configured, authentication pending` strictly for configured tools awaiting auth), added `cli:resend`, `runtime:node`, and `runtime:bun` to `agent-toolkit-manifest.json` (`204` total entries), and tightened the validation-log disclaimer above so local build/hook outputs are distinguished from non-mutating external vendor probes.
- **Codex CLI MCP trust boundary (`codex mcp list` in `GF-SITE`):**
  - Verified `codex mcp list` reads global `~/.codex/config.toml` servers (`github`, `context7`, `stripe`, `inngest-cloud`, `vercel`, `sentry`, `nia`, and separate `core_*` entries). Project-scoped `.codex/config.toml` activates automatically once the user trusts `C:\Users\Conrad\Documents\GitHub\GF-SITE` in Codex (user trust policy was deliberately not altered during setup).

---

## 6. Remaining Human Actions (Optional / Account-Bound)

1. **T3 Code session reload:** Click **Restart agent session** in T3 Code so running provider processes inherit the newly written Windows User-scope environment variables, skills, and project MCP definitions.
2. **OAuth sign-ins (when needed):** ReUI MCP (`https://mcp.reui.io`), Vercel MCP (`https://mcp.vercel.com`), Cloudinary CLI (`cld login` to refresh expired `dvgyndcnu` token), and optional Figma / PostHog / Firecrawl / Deque / Google Search Console OAuth when those services are actively used.
3. **Optional credentials not supplied:** Shadcn Space Pro, Motion+, Nia API key replacement (current env key returned plan-fetch error), Google Cloud keys (`PAGESPEED_API_KEY`, `CRUX_API_KEY`), Screaming Frog license/install, Ahrefs, WebPageTest, and Grafana `k6` OS install.
4. **Core CMS & Vercel project linkage:** Connect `Asymmetric-al/GF-SITE` to the confirmed Vercel project and integrate `Asymmetric-al/core` Payload CMS v4 when design and launch planning begin.
