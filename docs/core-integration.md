# Core CMS Integration Note

`GF-SITE` is the standalone public website frontend for Global Fellowship. `Asymmetric-al/core` remains the future owner of Payload CMS administration, content persistence, uploads, editorial workflows, and publication rules.

This repository **does not** install Payload CMS, a database client, an upload backend, authentication, or a rich-text editor. It installs, runs, typechecks, builds, and passes checks completely independently of Core.

## Inspected Core Reference Snapshot

- **Repository:** `https://github.com/Asymmetric-al/core`
- **Branch:** `develop`
- **Commit inspected:** `cc230b7df312a5b5b328bac90e81278d8af410f6` (`2026-11-21T02:59:14Z`)
- **Files inspected (read-only):**
  - `apps/admin/package.json`
  - `docs/ai/web-studio-handoff.md`
  - `docs/guides/architecture/cms-runtime.md`
  - `docs/adr/0027-transport-agnostic-public-content-reader.md`
  - `packages/api/src/cms/public/serialized.ts`
  - `apps/donor/lib/cms/client.ts`

## Verified Current Behavior in Core

As of commit `cc230b7df312a5b5b328bac90e81278d8af410f6`:

- **Single Payload runtime:** Payload CMS v4 beta (`4.0.0-beta.9`) runs only in `apps/admin` (`next@16.4.5`, `react@19.3.1`, `typescript@7.0.2`), storing CMS tables in the Postgres `cms` schema and authenticating staff via Supabase (`supabase-strategy`).
- **Editorial & media surface:** Admin UI is served at `/web-studio`, with staff REST endpoints at `/web-studio/api/*`. Rich text uses Lexical JSON (`@payloadcms/richtext-lexical@4.0.0-beta.9`). Media uploads use Vercel Blob and Sharp; public media paths are transitioning to `/web-studio/api/media/file/` (with a temporary redirect from `/api/media/file/`).
- **Serialized public boundary:** `packages/api/src/cms/public/serialized.ts` defines allowlist-serialized public shapes (`SerializedPublicPage`, `SerializedPublicMedia`, `SerializedPublicNavigation`, `SerializedPublicUpdate`, and typed layout blocks) so raw Payload documents and internal database schemas never leak to public consumers.
- **Current public HTTP endpoints & donor reference:** `apps/admin` exposes `/api/cms/public/*` routes (`/pages/:slug*`, `/missionary-pages/:id`, `/project-pages/:slug`, `/navigation`, `/updates?limit=5`) behind `PublishedContentReader`. `apps/donor/lib/cms/client.ts` is the existing HTTP consumer reference: it calls `CMS_BASE_URL`, forwards `x-forwarded-host`, applies fetch caching, and explicitly distinguishes missing content (`not-found` / `tenant-not-found`) from upstream outages (`unavailable`).

## Adopted Future Contracts (Not Yet Proven Implemented)

Core's architecture records explicitly separate current prototype/Phase-5 implementation from adopted target contracts. Do **not** assume the current `apps/donor` HTTP client or `apps/admin` endpoints represent the final contract for `GF-SITE`:

- **Release-backed reader (ADR-0027 amendment, 2026-11-17 / AL-2688 / ADR-0229):** Publishing will freeze serialized pages into immutable release rows so the public site does not query Payload or depend on `apps/admin` availability on the read path.
- **Per-request serving admission (ADR-0027 amendment, Phase 22 D18 / ADR-0135, D21 / ADR-0138):** An uncached admission check keyed by verified host and path decides what may be served (tenant, Site, locale, live head/reach, live navigation release, subject safety) **before** reading immutable release bodies cached under their release ID.
- **Site, domain-binding, and locale contracts (Phase 24 D66):** Public reads will bind trusted Tenant, environment, Site, stable Site Locale, and exact public generation with CMS fallback disabled, rather than relying on the current Tenant-only host resolver and dev `?tenant=` fallback.
- **Semantic catalogs & fail-closed rendering (Phase 22 D20 / ADR-0137):** Releases are treated as untrusted at render time—validated against certified block/role registries, dropping unknown blocks and never rendering unescaped stored markup.
- **Hybrid authoring (Phase 42):** Asym-owned editor/composer surfaces remain internal to Core and do not change GF-SITE's frontend-only public scope.

## Current Content Boundary in GF-SITE

To keep provisional UI decoupled without inventing a speculative CMS client:

- `src/lib/content/types.ts` — small display-focused TypeScript types, preserving media metadata (`url`, `alt`, `width`, `height`, `caption`) and a discriminated `ContentReadResult<T>` (`found` | `not-found` | `unavailable`).
- `src/lib/content/local-content.ts` — clearly labeled provisional development data kept separate from JSX.
- `src/lib/content/reader.ts` — a `server-only` module (`readStarterPageContent`) that feeds presentation components via ordinary props and allows static prerendering today.

No Core workspace packages (`@asym/*`), guessed endpoints, tenant identifiers, preview tokens, webhooks, or CMS environment variables are present.

## Decisions to Revisit When Integration Begins

Re-verify Core's latest `develop` commit before designing the live integration:

1. **Transport & deployment topology:** Confirm whether `GF-SITE` consumes an approved Core public-serving HTTP API, an edge/release reader service, or a published contract package—never import Core's private workspace packages as published dependencies.
2. **Tenant, Site, domain, and locale handling:** Adopt Core's verified Site/domain/locale resolution rules rather than copying `apps/donor`'s legacy `x-forwarded-host` + Tenant-only behavior.
3. **Public media origins & Lexical rendering:** Configure `images.remotePatterns` in `next.config.ts` only for verified public media origins, and implement safe server-side Lexical JSON rendering with URL sanitization against Core's exact public rich-text contract.
4. **Error vs. missing-content semantics:** Preserve the distinction between absent/withdrawn content (`notFound()`) and upstream service failures (error boundary / 503), so outages are never misreported as 404s.
5. **Publication, withdrawal, caching, and preview:** Audit the **entire** serving path—including Next.js Cache Components (`"use cache"`), full-page caches, and Vercel CDN/edge caches—against Core's current per-request admission rules. Never treat a cache TTL or webhook invalidation as an authorization check.
6. **Design freedom & shared contract compatibility:** Treat Core's existing block catalogue as implementation context, not a design constraint; confirm versioning and compatibility expectations for any shared public schema before coupling deployments.
