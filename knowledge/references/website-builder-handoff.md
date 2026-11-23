---
title: Website Construction Handoff (For Next Website-Builder Agent and Council)
description: Self-contained operational handoff preparing the next website-building agent and evaluation council to build Global Fellowship's public Next.js website from the completed brand system, OKF v0.3 knowledge bundle, brand-kit assets, legacy globalfellowship.org inventory, DESIGN.md constraints, and Asymmetric-al/core Payload CMS v4 contract without preempting page layouts or site architecture.
type: Reference
status: draft
tags:
  - website-handoff
  - handoff
  - architecture
  - legacy-inventory
  - start-here
x-gf-kind: website-handoff
x-gf-approval-state: delegated-working-guidance
x-gf-disclosure: public
generated:
  by: antigravity/gemini-4-neon
  at: "2026-11-23T03:05:00Z"
verified: []
sources:
  - id: foundations
    resource: /brand/foundations.md
    title: Permanently locked Mission Statement, Prayerful Vision Statement, Three Pillars, and canonical 8-article Statement of Faith
  - id: brand-on-a-page
    resource: /brand/brand-on-a-page.md
    title: Two-minute brand summary, Living Nearness v15.0 visual and verbal identity
  - id: proof-2025
    resource: /messaging/proof-ledger-2025.md
    title: Verified 2025 operational and financial facts, entity scopes, and candid ECFA posture
  - id: retired-claims
    resource: /messaging/retired-claims.md
    title: Deprecated legacy claims and mandatory replacements
  - id: security
    resource: /policies/field-security-and-disclosure.md
    title: Two-axis field security disclosure rules, Tier 1-3 boundaries, and zero-mosaic constraints
  - id: source-synthesis
    resource: /references/source-synthesis.md
    title: Audited legacy globalfellowship.org inventory (670 Content Master records and 1,808 CSV rows)
  - id: asset-index
    resource: /references/asset-index.md
    title: Complete brand-kit asset, token, font, icon, and documentary street-photo provenance catalog
  - id: open-verification
    resource: /references/open-verification-register.md
    title: Open human-owned pre-launch dependencies OVR-01 through OVR-24
  - id: triage
    resource: /policies/inbound-triage-and-content-ops.md
    title: Legacy URL migration policies, worker giving-link safety, and Accounting App route isolation
---

# Website Construction Handoff

This handoff equips the next website-building agent and website evaluation council to begin designing and constructing `globalfellowship.org` in `Asymmetric-al/GF-SITE` cleanly, truthfully, and without guessing brand foundations or contradicting field-security boundaries.

**Strict Phase Boundary:** The repository's `main` branch intentionally preserves the clean Next.js `16.4.6` starter scaffold in `src/` and `public/`. **Do not treat anything in this handoff as a mandatory page layout, visual wireframe, or fixed sitemap:** site architecture, page design, responsive layout, component choreography, and CMS integration belong properly to the website-construction phase.

---

## 1. Knowledge Entry Point & Initial Reading Sequence

Read in this exact progressive-disclosure order before proposing site architecture or writing page copy:

1. **Repository rules & engineering boundaries:** `AGENTS.md`, `DESIGN.md`, and `docs/core-integration.md`.
2. **OKF v0.3 quick scan:** Run `bun run okf:scan` (using `.agents/skills/okf-consume/SKILL.md`) or open [Knowledge Index](../index.md).
3. **Two-minute brand summary:** [Brand on a Page](../brand/brand-on-a-page.md)[^brand-on-a-page].
4. **Immutable wording (never alter):** [Protected Foundations](../brand/foundations.md)[^foundations].
5. **Claims, proof, and open human gates:** [2025 Proof Ledger](../messaging/proof-ledger-2025.md)[^proof-2025], [Retired Legacy Claims](../messaging/retired-claims.md)[^retired-claims], and [Open Verification Register](open-verification-register.md)[^open-verification].
6. **Security, storytelling, and editorial rules:** [Field Security Policy](../policies/field-security-and-disclosure.md)[^security], [Ethical Storytelling](../policies/ethical-storytelling-and-consent.md), and [Editorial & AI Hygiene](../policies/editorial-and-ai-hygiene.md).
7. **Audiences, narrative, offerings, and copy libraries:** Open only the relevant domain indexes (`knowledge/audiences/index.md`, `knowledge/messaging/index.md`, `knowledge/offerings/index.md`, `knowledge/marketing/index.md`) and [Organizational Communication Coverage Record](organizational-coverage-record.md).
8. **Brand assets, tokens, fonts, and street photography:** `brand-kit/README.md`, [Asset Index](asset-index.md)[^asset-index], `brand-kit/tokens/tokens.json`, and `brand-kit/photography/PHOTO-LICENSES.md`.

---

## 2. Permanently Protected Statements (Zero Tolerance for Alteration)

Source of truth: [Protected Foundations](../brand/foundations.md)[^foundations]. Copy verbatim; never rewrite, paraphrase as formal statements, compress, or drop the third pillar:

- **Mission Statement (Declarative):** `"We make disciples and plant new churches by empowering local leaders and sending cross-cultural missionaries to pioneer church-planting work among unreached people."`
- **Mission Statement (Infinitive public website form):** `"To make disciples and plant new churches by empowering local leaders and sending cross-cultural missionaries to pioneer church-planting work among unreached people."`
- **Vision Statement (Always framed as a prayerful longing, never a coverage metric):** `"It is our vision to plant a Gospel witness within 30 minutes of everyone."`
- **Three Pillars (Always all 3 together):** **Church Planting**, **Local Leadership**, **Unreached People** (canonical one-line glosses in `foundations.md:62-64`).
- **Public Statement of Faith (8 articles):** Canonical straight-ASCII reading copy in `foundations.md:76-83` (matching `P008` word for word with one legacy `cross..` typo normalized; internal 10-point staff reconciliation tracked in `OVR-15B`).

---

## 3. Governing Brand, Identity, Messaging, Voice, and Editorial Material

- **Core Strategy & Operating Order:** [Strategy & Positioning](../brand/strategy-and-positioning.md): `"Brought Near, Led Locally"` (Ephesians 2:13–22 & 4:16), `"Global coordinates. Regional contextualizes. Local leads."`, `"When a cross-cultural missionary arrives, the local leader still leads"`, integration without assimilation, and 15 operational `"Choose X Over Y"` decision rules + 5-level tie-break precedence (Life Safety > Doctrinal Integrity > Local Stop Authority & Whole-Life Health > Factual Honesty > Craft/Schedule).
- **Character & Values:** [Character & Values](../brand/character-and-values.md): 7 core values (Gospel First, Relationships, Local Leadership, Humility, Health Above Results inclusive of singles & families, Biblical Principle, Trust & Transparency).
- **Brand Architecture:** [Brand Architecture](../brand/brand-architecture.md): Four Partner Levels (Level 1 Master Brand, Level 2 Regional Hubs e.g. Chiang Mai, Level 3 Endorsed Local Ministries, Level 4 Zero-Attribution) cleanly separated from Three Security Disclosure Tiers (Tiers 1–3), plus MissionStream and BOLK entity separation.
- **Voice, Registers & Editorial Hygiene:** [Verbal Identity](../brand/verbal-identity.md), [Editorial & AI Hygiene](../policies/editorial-and-ai-hygiene.md), [Terminology & Glossary](../messaging/terminology-and-glossary.md), and executable Vale rules in `styles/GF/` (Agency Grammar: God acts in spiritual fruit, local elders are active subjects; three native registers **Witness**, **Open Books**, **Note**; zero em dashes; zero military/saviorism/AI-tell phrasing; zero internal meta-jargon like `"Living Nearness"` or `OVR-*` in public copy).
- **Authority Honesty:** Active concepts carry `status: draft`, `verified: []`, and `x-gf-approval-state: delegated-working-guidance` (or `locked-foundation` / `source-record` / `retired-legacy`). Do not present unapproved draft direction as formally approved by Global Fellowship leadership until `OVR-15` closes.

---

## 4. Available Brand Assets, Tokens, Fonts, Photography & Exports (`brand-kit/`)

All machine-verified assets are indexed with SHA-256 checksums in `brand-kit/manifest.json` (`schemaVersion: "15.0"`) and [Asset Index](asset-index.md)[^asset-index]:

- **Design Tokens (`brand-kit/tokens/`):** Canonical W3C DTCG 2025.10 `tokens.json` (`Harbor Teal #0C525C`, `Harbor Night #0B272E`, `Kiln Clay #7E3119`, `Candle Apricot #F2B488`, `Warm Paper #FAF7F2`, `Warm Linen #F1ECE3`, `Charcoal Ink #16191C`, `40/40` WCAG 2.2 AA/AAA + linear deuteranopia pairs in `contrast-report.json`), generated `brand-tokens.css` (light + unified Harbor Night `.dark` scope), and Ink-Neutral Fallback (`#16191C` on `#FAF7F2`). Bridge into `src/app/globals.css` only during website construction.
- **Typography (`brand-kit/tokens/fonts/`):** 76 locally vendored 100% SIL OFL 1.1 WOFF2 binaries (`Source Serif 4`, `Plus Jakarta Sans`, `Noto Sans` / `Noto Serif` + Arabic, Thai, Bengali, Devanagari, Simplified Chinese) with `OFL-1.1.txt`, `font-checksums.json`, and `FONT-LICENSES.md`. Self-host via `next/font/local` or vendored WOFF2s; zero proprietary font licenses.
- **Marks & Lockups (`brand-kit/logos/`):** 15 SVGO-clean vector-outlined SVGs (`140:101` Cross-in-Oval, horizontal/stacked/reversed/mono/black/regional-hub/Bridge/endorsement lockups, plus integer-pixel-snapped `16px` adaptive optical favicons `gf-mark-favicon-16.svg` & dark variant) and 19 exact-dimension PNGs (`gf-favicon-*`, `gf-apple-touch-180.png`, `gf-avatar-*`).
- **Zero-ShareAlike Documentary Street Photography Vault (`brand-kit/photography/`):** **6 vetted, `1600x1067` (`3:2`), sRGB-normalized, EXIF/COM-stripped, zero-ShareAlike (`4 CC0 1.0` + `2 CC BY 2.0`) documentary street photographs** (`GF-PHO-01`..`06`: `gf-street-tea-table.jpg`, `gf-street-shared-bread.jpg`, `gf-street-vendor-hands.jpg`, `gf-street-neighborhood-dusk.jpg`, `gf-street-urban-balconies.jpg`, `gf-street-terracotta-alley.jpg`) governed by the **Three-Path Photography Sourcing Rule** and `brand-kit/photography/PHOTO-LICENSES.md`. Every public use MUST preserve visible-only alt text, photographer attribution + CC license URL, opaque Harbor Night AAA scrim (`>= 0.94` opacity) behind overlaid text, and the honest disclaimer (`"contextual street photography, not a Global Fellowship congregation"`). **Never** reuse the 6 rejected prototype photos listed in `PHOTO-LICENSES.md` §3.
- **Downloadable Public Packets & Visual Reference Exports (`brand-kit/exports/`):** Ready PDFs (`church-elders-vetting-packet.pdf`, `exposure-trip-host-agreement.pdf`, `bridge-kids-drawing-and-prayer-sheet.pdf`, `bridge-matched-household-welcome-guide.pdf`, `annual-report-2025-spread.pdf`, `sunday-bulletin-insert-half-letter.pdf`, etc.) and OG/social PNGs. Note: **never** expose internal/confidential files (`GF-TPL-18`, `GF-TPL-19B`, `GF-TPL-24B`) or Level 4 zero-attribution local sheets as public GF-branded website downloads.

---

## 5. Current Reusable Copy & Fixed-vs.-Adaptable Rules

Ready-to-adapt copy lives in `knowledge/marketing/copy-*.md` and `knowledge/messaging/`:

- **Core & overview:** `copy-core-and-overview.md`, `message-hierarchy.md` (5s / 30s / 2m / deep altitudes), `audience-messaging-matrix.md`, `participation-and-ctas.md`.
- **Churches, elders & events:** `copy-churches-and-events.md`, `copy-church-vetting-and-host-agreement.md`.
- **Donors, stewardship & Bridge Project:** `copy-donors-and-bridge.md`, `copy-donor-lifecycle-and-receipts.md`.
- **Workers, candidates, boilerplate & press:** `copy-workers-and-local-leaders.md`, `copy-support-raising-and-onboarding.md`, `copy-boilerplate-and-media.md`.
- **Three-level editorial flexibility rule (never confuse):**
  1. **Permanently Locked (Zero Edits):** Protected Foundations (`foundations.md`), verified legal/contact identity (`Global Fellowship, Inc.`, 501(c)(3), `EIN 68-0214543`, `Candid ID 8043461`, `P.O. Box 1, Meadow Vista, CA 95722`, `1 866 984 5622`, verified emails `info@`, `finance@`, `prayer@`, `executivedirectors@`), dated financial scope distinctions, candid ECFA wording, Agency Grammar, zero em dashes, zero internal `OVR-*` codes in public copy, and security disclosure ceilings.
  2. **Strong Channel Default (Prefer Unless IA Demands Adaptation):** The flagship headline (`"When a cross-cultural missionary arrives, the local leader still leads"`) and companion descriptor on cold primary surfaces (`message-hierarchy.md`).
  3. **Freely Adaptable During Website Design:** Supporting headlines, page introductions, section sequencing, UI labels, form microcopy, empty/error states, and progressive disclosure tailored to the final website information architecture (never presenting supporting prose as a replacement formal Mission or Vision statement).

---

## 6. Verified Facts, Disclosure Tiers, Security Limits & Time-Sensitive Claims

- **Verified 2025 facts (always date and scope in the same sentence):** `43` countries served and `584` workers served (source wording `"workers mobilized"`, 2025 Annual Report `D002`; `47` countries in undated orientation deck tracked in `OVR-04`); 2025 Consolidated Statement of Activity `$5.82M` received / `$5.73M` disbursed across Global Fellowship (`$2.08M` / `$2.13M`), MissionStream (`$3.08M` / `$2.92M`), and BOLK (`$660k` / `$683k`); Home Office operating expenses `$251.6k` (including `$52.7k` merchant fees), separately reported operating revenue lines (`$192.5k` `Admin Fees - 8%`, `$40.2k` Home Office & fee-coverage gifts, `$33k` rent, `$14.5k` WMN Inc.), explicitly **not** a reconciliation while Finance clarifies `OVR-01`/`OVR-03`/`OVR-16`. Global Fellowship is not currently an ECFA member (explain candidly).
- **Strictly prohibited on any web page:** Unqualified `"100%"` or `"0% overhead"` headlines, `"$5.9M"` presented as Global Fellowship standalone total, side-by-side 2024 (`1,254`) vs. 2025 (`230`) church-plant trend charts (`OVR-05`), `"no written policies"`, `"10-25% agencies"` comparisons, unqualified `"3% / 1%"` missions tropes, continuous `"24/7 prayer"` promises (`OVR-08`), or fabricated quotes/photos[^retired-claims].
- **Field Security & Anti-Mosaic Web Constraints (`G3`):**
  - Never create individual web pages or public updates for **Tier 3 (Restricted)** or **Level 4 (Zero-Attribution)** workers/ministries.
  - Never commit restricted worker slug-to-name redirect maps, worker lists, or signed consent PDFs into this public repository (`OVR-14`).
  - Use opaque IDs (never real-name slugs) for Tier 2 worker pages, keep Tier 1 and Tier 2 page headers visually identical (zero `"Restricted"` labels, silhouettes, blurred faces, padlocks, or map pins), strip EXIF from all photos, and enforce fresh `GF-TPL-15` re-consent (`OVR-06`) before publishing archived stories or real worker photos.

---

## 7. Legacy `globalfellowship.org` Content Inventory & Visitor Purposes (Not a Fixed Sitemap)

Audited from `Global_Fellowship_Content_Master.md` (670 records) and `Global_Fellowship_Content_Inventory.csv` (1,808 rows)[^source-synthesis][^triage]. Use this strictly as **factual migration context**, not as an obligation to copy the legacy site's structure:

- **Legacy URL & record footprint (`670` unique records):** `32` shared interface/chrome records (`S001`–`S032`), `266` audited URL records (`P001`–`P266`, `199` sitemap URLs) spanning core institutional pages (`Home`, `Our Mission`, `Our Three Pillars`, `Our Values`, `Statement of Faith`, `Who We Are`, `How We Work`, `100% Model`, `Financials`, `Contact`, `FAQ`, `Get Involved`, `Bridge Project`, `Exposure Trips`, `Pray`, `Training`, `Board`), `6` regional pages (`Central Asia`, `East Asia`, `South Asia`, `Europe`, `Middle East`, `North Africa`), `52` missionary profiles (including `12` with protective initials/aliases/codes), `58` project designations, `8` archived field articles (held for `OVR-06` re-consent), `43` linked documents (`D001`–`D043`, including 2024/2025 Statements of Financial Position, Statements of Activity, and Annual Reports), `294` captured form & external giving-handoff structures (`F001`–`F294`, carried forward only as reference patterns for live checkout/form design under `OVR-21`/`OVR-24`) plus `1` rendered contact form (`B001`), `24` reviewed image transcriptions (`I001`–`I024`), `9` HTTP/route error captures (`E001`–`E009`, retired/redirected), `1` March 2026 newsletter authentication boundary (`N001`: HubSpot preview link redirecting to login with no newsletter body recovered; requires private access if ever inspected), and `184` legacy uncurated stock files (permanently retired).
- **Standalone Accounting App legal routes to preserve cleanly:** `/eula` and `/privacypolicy` serve Global Fellowship's QuickBooks / Accounting App compliance links; keep them minimal, `noindex`, and clearly distinct from any public website donor-privacy policy.
- **Retired test/draft routes to return `410 Gone` (`noindex`):** `/checkout-test`, `/home-draft`, `/ytd-statement-admin`.
- **Known legacy site defects not to carry forward:** Desktop-vs.-mobile homepage copy divergence (legacy FAQ mismatch), broken `/training` link (`404`), placeholder `"Lorem ipsum"` on the legacy Board page, login-gated newsletter preview link (`N001`, no public newsletter body recovered), retired `"0% overhead"` / `"no written policies"` phrasing, and uncurated stock photography.
- **Core visitor purposes documented in research:** (1) Understand GF's Christian identity, local-leadership posture, and Statement of Faith (pastors, elders, curious Christians); (2) Pray and join reciprocal friendship via The Bridge Project / Bridge Kids without financial pressure; (3) Inspect 2025 Open Books financial statements and give responsibly to cleared workers, projects, or Home Office; (4) Explore cross-cultural church-planting or support-staff service through a low-pressure first call; (5) Inquire about church partnerships, Exposure Trips, or Faith on the Frontlines; (6) Existing supporters managing recurring gifts, non-cash gifts (check/stock/DAF/IRA QCD), or PCI-safe payment updates.

---

## 8. Digital Application Guidance & Repository UI Rules (`DESIGN.md`)

- **Established technical stack:** Next.js `16.4.6` (`App Router`, `cacheComponents`, `partialPrefetching`, `reactCompiler`, `typedRoutes`), React `19.3.1`, TypeScript `7.1.0-beta`, Tailwind CSS `4.3.5`, Bun `1.4.3` package/script management running Next.js & Vitest on **Node.js 24 LTS**.
- **Strict UI & Rich-Text Boundary (non-negotiable):**
  - **ZERO Radix** (`radix-ui` / `@radix-ui/*`) anywhere directly or transitively (`bun run check:foundation` enforces this).
  - **shadcn (`base-maia` / `@base-ui/react` + Hugeicons)** owns Tailwind v4 semantic tokens (`src/app/globals.css`), `cn()`, and **static/display UI only** (`src/components/ui/`).
  - **Vercel UI SDK (`@ui-sdk/core` + `@ui-sdk/react`)** owns **all stateful interactive primitives** inside small `"use client"` leaf modules under `@layer ui-sdk;` (line 1 of `src/app/globals.css`). Never stack Base UI/shadcn and UI SDK interaction behaviors onto one control.
  - **Tiptap `3.35.0`** is pre-installed for any frontend rich-text needs; Core's Payload CMS Lexical JSON contract stays cleanly separated.
- **Pre-launch non-indexable safeguard:** Keep `isSearchIndexingEnabled()` disabled (`noindex, nofollow`, `X-Robots-Tag`, `Disallow: /` in `/robots.txt`, no production canonicals) until confirmed production domain and explicit launch authorization (`OVR-15`, `OVR-21`).
- **Accessibility & performance bar:** Full WCAG 2.2 AA (`>= 4.5:1` text, `>= 3:1` UI, targeting AAA body ink), keyboard & focus-return parity, `prefers-reduced-motion`, zero CLS, zero-JS graceful degradation where sensible, plus `bun run check`, `bun run check:foundation`, `bun run typecheck`, `bun run knip`, `bun run test:run`, `bun run build`, `bun run test:smoke`, `bun run test:a11y`, `bun run test:seo`, and isolated `bun run perf:lhci`.

---

## 9. Next.js & `Asymmetric-al/core` Payload CMS v4 Integration Context

Read `docs/core-integration.md` in full before designing the CMS reader layer:

- **Ownership separation:** `Asymmetric-al/core` owns Payload CMS v4 (`apps/admin`), Postgres persistence, Vercel Blob uploads, editorial workflows, and publication admission. `GF-SITE` stays strictly frontend-only (never install Payload runtime, DB clients, or `@asym/*` packages here; isolate reads behind server-only `src/lib/content/`).
- **Inspected snapshot (`develop` `cc230b7df312a5b5b328bac90e81278d8af410f6`):** Core currently exposes serialized public shapes (`SerializedPublicPage`, `SerializedPublicMedia`, `SerializedPublicNavigation`, `SerializedPublicUpdate`, and 7 layout blocks) and `/api/cms/public/*` endpoints (`/pages/:slug*`, `/missionary-pages/:id`, `/project-pages/:slug`, `/navigation`, `/updates`), while adopted ADR-0027 / Phase 22 / Phase 24 target contracts move to immutable **release-backed reads**, **per-request serving admission**, Site/locale binding, and fail-closed semantic catalogs.
- **Re-verify live `Asymmetric-al/core` `develop` before coding integration:** Never copy `apps/donor`'s legacy prototype client blindly; preserve clean `found` / `not-found` / `unavailable` error semantics and audit every cache layer (`"use cache"`, Next.js caches, CDN) against immediate consent-withdrawal removal (`mode: "withdraw"` / release admission). Editorial staff guidance lives in [CMS Editor Field Guide](../marketing/cms-editor-field-guide.md).

---

## 10. Decisions Properly Belonging to Website Construction & Remaining External Dependencies

- **Website-phase decisions (intentionally left open for the website builder & council):** Final information architecture and navigation model; page templates, visual layouts, responsive grids, breakpoints, and art-directed street-photo placement; light/dark theme-toggle behavior; interactive `@ui-sdk/react` controls and motion choreography; exact redirect map in `next.config.ts`; live `Asymmetric-al/core` transport/admission integration; giving checkout/portal handoff UX; and launch SEO/structured-data activation.
- **Human-owned external dependencies (`OVR-01`–`OVR-24`):** Check [Open Verification Register](open-verification-register.md)[^open-verification] before treating any financial scope (`OVR-01`–`03`, `16`), country/church-plant reconciliation (`OVR-04`, `05`), archived story/photo reuse (`OVR-06`), address/program/translation/regional review (`OVR-07`–`11`), private security/consent archive (`OVR-14`, `17`, `20`), leadership brand sign-off (`OVR-15`), live URLs/giving portal (`OVR-21`), legal/CPA wording (`OVR-22`), or Mobilization norms (`OVR-23`) as confirmed.
