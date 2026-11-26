# GF-SITE Agent Toolkit Architecture

This is the sanitized repository guide for the AI agent toolkit configured in `GF-SITE`. It contains **no secrets, tokens, passwords, or private account dumps** (only environment variable names and official public endpoints).

## 1. Scope and Ownership Map

| Layer | Location | Owner / Restoration Mechanism |
| --- | --- | --- |
| Canonical agent instructions | [AGENTS.md](../AGENTS.md), [CLAUDE.md](../CLAUDE.md), [DESIGN.md](../DESIGN.md) | Git-tracked in `GF-SITE` |
| OKF v0.3 knowledge bundle and templates | [`knowledge/`](../knowledge/index.md), [`docs/okf.md`](./okf.md), `docs/okf-templates/`, [`.agents/product-marketing.md`](../.agents/product-marketing.md) (pointer bridge) | Git-tracked OKF v0.3 knowledge bundle (`51` concepts); validated via `bun run okf:validate` and scanned via `bun run okf:scan` |
| Project-scoped skills (124 total) | `.agents/skills/` (Codex, Cursor, Antigravity) and `.claude/skills/` (Claude Code); `.cursor/skills/impeccable` | Managed via [skills-lock.json](../skills-lock.json) (`skills@1.9.0`) plus tracked specialist skills (`playwright-cli`, `impeccable`, `ui-ux-pro-max`, `react-bits-pro`, `shadcnuikit`, `reui`, and 7 Chrome DevTools skills); parity verified by `bun run check:foundation` |
| Generated specialist subagent specs | `.claude/agents/`, `.codex/agents/`, `.cursor/agents/`, `specs/` | Generated via `playwright init-agents` (`claude`, `codex`) and `impeccable install --no-hooks` |
| Project-scoped MCP configurations | `.mcp.json` (Claude), `.cursor/mcp.json` (Cursor), `.codex/config.toml` (Codex), `.agents/plugins/{next-devtools,gf-site-ui-registries}/mcp_config.json` (Antigravity) | Git-tracked; credentials referenced strictly via env vars (`scripts/shadcn-studio-mcp.ts` maps `SHADCN_STUDIO_EMAIL` / `SHADCN_STUDIO_LICENSE_KEY` to child `EMAIL` / `API_KEY` without logging or argv exposure) |
| Single edit-time hook path per provider | `.claude/settings.json`, `.codex/hooks.json`, `.cursor/hooks.json` (`bunx --no-install ultracite fix --hook`); `.agents/hooks.json` (`bun ../scripts/antigravity-post-edit-hook.ts`) | Git-tracked; runs changed-files-only Ultracite fixes without recursive loops |
| UI registries | [components.json](../components.json) | 14 external registries merged alongside `@shadcn`, preserving `base-maia`, Hugeicons, and **zero Radix** |
| Application & test packages | [package.json](../package.json) & [bun.lock](../bun.lock) | Restored via `bun install --frozen-lockfile` |
| Host CLIs, Chrome, and Playwright browsers | Workstation OS / user PATH (Windows 11) | Installed outside Git; recorded in [agent-toolkit-manifest.json](../agent-toolkit-manifest.json) |
| Private credentials | Windows User-scope environment variables (outside Git) | Loaded locally from private store; never committed to `.env*`, docs, or artifacts |

---

## 2. Installed Skill Collections (Project-Local)

All project skills are copied into `.agents/skills/` (discovered by Codex, Cursor, and Antigravity) and `.claude/skills/` (discovered by Claude Code), with exact commits recorded in [skills-lock.json](../skills-lock.json) and [agent-toolkit-manifest.json](../agent-toolkit-manifest.json):

- **Official stack (28 skills):** `shadcn`, `ui-sdk`, `ultracite`, `next-dev-loop`, `next-bundle-optimizer`, `next-cache-components-optimizer`, `next-partial-prefetching-optimizer`, `payload`, `cms-migration`, `vercel-cli`, `vercel-react-best-practices`, `vercel-composition-patterns`, `web-design-guidelines`, `writing-guidelines`, `vercel-react-view-transitions`, `vercel-optimize`, `deploy-to-vercel`, plus 11 Vercel platform skills (`access-protected-vercel-deployment`, `cdn-caching`, `client-side-security`, `deployments-cicd`, `domains`, `env-vars`, `routing-middleware`, `vercel-firewall`, `vercel-functions`, `vercel-storage`, `verification`).
- **Art direction, design, color, and animation (22 skills):** `frontend-design` (Anthropic; `brand-guidelines` excluded), `impeccable` (`4.10.0`, local-only, `--no-hooks`), `ui-ux-pro-max` (`2.15.0`; 6 unrequested side-skills bundled by its CLI — including Radix-referencing `ui-styling` — were removed to enforce the strict NO Radix boundary), `leonardo-colors` (Adobe), and 18 Emil Kowalski skills (`emil-design-eng`, `animate`, `review-animations`, `animation-performance`, `remove-animations`, `choreograph`, `mobile-native`, `break-ui`, `improve-animations`, `find-animation-opportunities`, `animation-vocabulary`, `apple-design`, `gestures`, `prototype`, `learn-taste`, `ask-emil`, `ask-sonner`, `pick-ui-library`; `animate-expo` and `write-swift` intentionally excluded).
- **Marketing, information architecture, copy, and SEO (29 skills):** `coreyhaines31/marketingskills` website core (`product-marketing`, `customer-research`, `site-architecture`, `copywriting`, `copy-editing`, `content-strategy`, `seo-audit`, `schema`, `cro`, `analytics`) plus 19 occasional skills (`ai-seo`, `programmatic-seo`, `ab-testing`, `conversion-tracking`, `signup`, `onboarding`, `popups`, `competitors`, `competitor-profiling`, `launch`, `emails`, `social`, `image`, `video`, `lead-magnets`, `free-tools`, `public-relations`, `co-marketing`, `events`). Business-dependent sales/ads remainder is cataloged in the manifest without installation.
- **Testing, browser automation, and diagnostics (11 skills):** `vitest`, `vite` (`antfu/skills`), `playwright-cli`, `agent-browser`, and 7 Chrome DevTools skills (`chrome-devtools`, `chrome-devtools-cli`, `a11y-debugging`, `cookie-debugging`, `debug-optimize-lcp`, `memory-leak-debugging`, `troubleshooting`).
- **Component catalog integration (3 skills):** `react-bits-pro` (v3.3 from `@reactbits-starter/skill`), `shadcnuikit` (general integration skill; 8 paid design packs kept unactivated), `reui` (`v68f0e6fa91`, 16 files extracted cleanly without modifying `~/.codex/config.toml`).
- **Theo Browne's Tstack (9 skills):** `full-send`, `full-stop`, `council`, `sol-loop`, `file-pr`, `takeover`, `babysit-pr`, `modernize`, `leaving-pr-comments` (retaining `scripts/pr-wait` and references).
- **Additional official service and maintenance skills (22 skills):** Google Open Knowledge Format (`okf-consume`, `okf-generate` from `open-knowledge-format/open-knowledge-format`), Resend (`resend`, `resend-cli`, `react-email`, `email-best-practices`, `agent-email-inbox`), Firecrawl (`firecrawl`, `firecrawl-map`, `firecrawl-crawl`, `firecrawl-scrape`, `firecrawl-search`, `firecrawl-parse`, `firecrawl-download`), Supabase (`supabase`, `supabase-postgres-best-practices`), Stripe (`stripe-best-practices`, `stripe-docs`), Remotion (`remotion-best-practices`), Knip (`configure-knip`), Sentry (`code-simplifier`, `agents-md`). _(`Nia` was explicitly removed because it is no longer used. Total: 28 + 22 + 29 + 11 + 3 + 9 + 22 = 124 project-scoped skills.)_

---

## 3. Provider MCP Scopes and Global Reuse

To avoid duplicate MCP registrations across T3 Code providers:

- **Project-scoped MCPs in `GF-SITE`:**
  - `next-devtools` (`bunx next-devtools-mcp@0.4.0`) — Claude, Cursor, Codex, Antigravity (`.agents/plugins/next-devtools/`).
  - `shadcn` (`bunx --no-install shadcn mcp`, workspace cwd = `GF-SITE`) — Claude, Cursor, Codex, Antigravity (`.agents/plugins/gf-site-ui-registries/` via `scripts/shadcn-mcp.ts` as `gf-site-shadcn`).
  - `reactbits-pro` (`https://mcp.reactbits.dev/mcp`, Bearer `REACTBITS_LICENSE_KEY`) — Claude, Cursor, Codex, Antigravity plugin.
  - `shadcnuikit` (`https://shadcnuikit.com/api/mcp`, Bearer `SHADCNUIKIT_API_KEY`) — Claude, Cursor, Codex, Antigravity plugin.
  - `reui` (`https://mcp.reui.io`, OAuth / separate `REUI_MCP_TOKEN`) — Claude, Cursor, Codex, Antigravity plugin.
  - `shadcn-studio` (`bun scripts/shadcn-studio-mcp.ts` wrapping `shadcn-studio-mcp@1.0.7`) — Claude, Cursor, Codex (Antigravity already loads global `shadcn-studio`).
  - `shadcn-space` (`https://mcp.shadcnspace.com/mcp`, free tier) — Claude, Cursor, Codex (Antigravity already loads global `shadcn-space`).
  - `playwright-test` (`bunx --no-install playwright run-test-mcp-server`) — Claude (`.mcp.json`, used by Playwright test agents).
  - `vercel` (`https://mcp.vercel.com`, OAuth) — Codex (`.codex/config.toml`; Cursor and Codex global configs also register it).
- **Host / global provider MCPs already present outside `GF-SITE` (not duplicated):** Antigravity global T3 config already provides `motion`, `playwright`, `chrome-devtools`, `shadcn-space`, and `shadcn-studio`. Claude and Codex user configs already provide `github`, `context7`, `sentry`, `stripe`, `cloudinary-assets`, and `inngest-cloud` (note: global `core_*` servers belong to `Asymmetric-al/core` and must not be used for `GF-SITE` registry lookups).

---

## 4. Credential Environment Variable Roles (Names Only)

Never commit credential values into Git, `components.json`, `.mcp.json`, or logs. Load required values in the host's private user environment before starting or restarting T3 Code provider sessions.

| Env Var Name | Role | Expected Setup State |
| --- | --- | --- |
| `REACTBITS_LICENSE_KEY` | `@reactbits-starter`, `@reactbits-pro` registries and `reactbits-pro` HTTP MCP | Set in developer's private environment; verified Pro entitlement |
| `REUI_LICENSE_KEY` | `@reui` shadcn registry only (**not** ReUI MCP OAuth) | Set in developer's private environment; verified registry search/view |
| `REUI_MCP_TOKEN` _(optional)_ | Dedicated ReUI MCP PAT (alternative to OAuth sign-in) | Optional; ReUI MCP uses OAuth sign-in otherwise |
| `SHADCNBLOCKS_API_KEY` | `@shadcnblocks` registry (`sk_live_` prefix is Shadcnblocks, **not** Stripe) | Set in developer's private environment; verified direct item view (`base-maia`) |
| `SHADCNUIKIT_API_KEY` | `@shadcnuikit` registry and `shadcnuikit` HTTP MCP (vendor docs alias: `REGISTRY_TOKEN`) | Set in developer's private environment; verified registry + MCP |
| `SHADCN_STUDIO_EMAIL`, `SHADCN_STUDIO_LICENSE_KEY` | `@ss-*` registries and isolated child `EMAIL`/`API_KEY` via `scripts/shadcn-studio-mcp.ts` | Set in developer's private environment; verified registry + isolated stdio MCP |
| `EFFERD_REGISTRY_TOKEN` | `@efferd` registry (free + licensed items) | Set in developer's private environment; verified registry search/view |
| `SHADCN_SPACE_EMAIL`, `SHADCN_SPACE_LICENSE_KEY` | Future Shadcn Space Pro tier | Optional; free catalog verified without auth |
| `CONTEXT7_API_KEY` | Context7 HTTP MCP and `ctx7` CLI | Set in developer's private environment; verified HTTP MCP |
| `VERCEL_TOKEN` | Vercel CLI/API (separate from `https://mcp.vercel.com` OAuth) | Set in developer's private environment when deploying/inspecting via CLI |
| `RESEND_API_KEY` | Resend CLI & HTTP MCP (`https://mcp.resend.com/mcp`) | Set in developer's private environment; optional until email features exist |
| `CLOUDINARY_API_KEY` | Incomplete alone for key-based admin API (requires cloud name/secret or `cld login` OAuth) | Optional; run `cld login` when Cloudinary is needed |
| `SUPABASE_ACCESS_TOKEN`, `STRIPE_SECRET_KEY`, `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`, `INNGEST_SIGNING_KEY`, `INNGEST_EVENT_KEY` | Conditional service credentials (inactive in frontend-only `GF-SITE`; Inngest app keys are **not** Cloud MCP auth) | Optional; unused in `GF-SITE` runtime |
| `PAGESPEED_API_KEY`, `CRUX_API_KEY`, `GSC_*`, `AHREFS_API_KEY`, `WEBPAGETEST_API_KEY`, `AXE_API_KEY` | Optional external SEO/perf/a11y services | Not configured |

---

## 5. Global Skill Shadow Audit

Developer workstations may also carry personal global skills outside `GF-SITE`. Do not delete unrelated personal skills; keep exact-name precedence in mind when diagnosing provider skill resolution (Claude user/config directories can shadow project `.claude/skills` on name collisions):

- `~/.claude/skills`: `0` overlaps with `GF-SITE`.
- T3 Antigravity user `config/skills`: `0` exact-name overlaps (`emil-design-engineering` coexists under a distinct name from project `emil-design-eng`).
- `~/.codex/skills`: `1` overlap (`vitest`).
- `~/.cursor/skills`: `8` overlaps (`animate`, `animation-performance`, `animation-vocabulary`, `find-animation-opportunities`, `improve-animations`, `pick-ui-library`, `prototype`, `review-animations`).
- `~/.agents/skills`: `16` overlaps (`agent-browser`, `emil-design-eng`, `frontend-design`, `remotion-best-practices`, `resend`, `resend-cli`, `shadcn`, `stripe-best-practices`, `supabase`, `supabase-postgres-best-practices`, `ui-ux-pro-max`, `ultracite`, `vercel-composition-patterns`, `vercel-react-best-practices`, `vercel-react-view-transitions`, `web-design-guidelines`).

---

## 6. Restore and Update Commands

```bash
# 1. Restore exact JS/TS packages and verify lockfile integrity
bun install --frozen-lockfile

# 2. Restore Playwright browser binaries matching pinned @playwright/test@1.65.1
bunx --no-install playwright install chromium firefox webkit

# 3. Check or refresh lockfile-managed skills (pins live in skills-lock.json)
bunx skills@1.9.0 list
bunx skills@1.9.0 check

# 4. Sync Vale styles and verify local quality/test gates
vale sync
bun run check
bun run check:foundation
bun run knip
bun run typecheck
bun run test:run
bun run build
bun run test:smoke
```

After updating skills, MCP configs, or User-scope environment variables, use T3 Code's **Restart agent session** action so active provider sessions load the refreshed setup.
