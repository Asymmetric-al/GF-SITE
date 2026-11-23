# GF-SITE Design Reference

> **Brand & OKF System Consolidated (`Living Nearness v15.0`); Website Construction Cleanly Separated Into Next Phase.** Per explicit stakeholder direction (_"focus on the branding and worry about the website later"_) and the brand/OKF consolidation boundary, Global Fellowship's organization-wide brand system (`brand-kit/`, `knowledge/`, `styles/GF/`) is complete and verified as a release candidate awaiting human leadership approval (`OVR-15`), while `src/` and `public/` on `main` intentionally remain on the clean Next.js `16.4.6` starter scaffold until website construction begins. Before starting website implementation, read [Website Construction Handoff](./knowledge/references/website-builder-handoff.md) alongside this file and `docs/core-integration.md`.

This document is the canonical design reference for `GF-SITE` (Global Fellowship public website frontend). Read it before work that materially affects visual design, layout, interaction, navigation, iconography, imagery, motion, or public content presentation.

## How to Read Evidence in This Document

Every statement in this document is categorized into one of four evidence levels so future agents do not mistake provisional scaffold code or vendor defaults for approved design choices:

- **Explicitly established:** Supported by an identifiable user instruction or accepted architecture decision.
- **Observed in the implementation:** Currently present in repository code, stylesheets, or assets without assuming creative approval.
- **Existing proposal, not approved:** Available option, completed brand candidate, or prior suggestion that must **not** be treated as formally leadership-approved until `OVR-15` closes.
- **Undecided or unknown:** Open creative or product question requiring future website design work or user clarification.

---

## 1. Purpose and Scope

- **Governs:** Public-facing web UI, layout, semantic design tokens, component boundaries, interactive behavior, accessibility, responsive layout, motion, imagery/media presentation, and public editorial quality in `GF-SITE`.
- **Does not govern:** `Asymmetric-al/core` administration, Payload CMS v4 schemas, database models, authentication, or backend infrastructure.
- **Related canonical references:**
  - [AGENTS.md](./AGENTS.md): Concise repository rules, task routing, and verification expectations.
  - [`knowledge/index.md`](./knowledge/index.md) and [`docs/okf.md`](./docs/okf.md): Populated Open Knowledge Format (OKF v0.3) knowledge bundle (`55` concepts) and authoring guide for brand identity, voice, audiences, messaging, offerings, marketing playbooks, and editorial/security policies.
  - [Website Construction Handoff](./knowledge/references/website-builder-handoff.md): Self-contained handoff preparing the next website-building agent and evaluation council without preempting layouts or sitemap.
  - [Source Coverage and Delegated Decisions](./knowledge/references/source-coverage-and-decisions.md): Complete source disposition table and delegated completion decision log.
  - [README.md](./README.md): Runtime environment, scripts, and local setup.
  - [docs/core-integration.md](./docs/core-integration.md): Inspected Core CMS snapshot and future content-contract boundary.
  - [docs/testing.md](./docs/testing.md): Automated testing, accessibility, visual regression, performance baselines, and technical SEO verification.
  - [docs/agent-toolkit.md](./docs/agent-toolkit.md) and [agent-toolkit-manifest.json](./agent-toolkit-manifest.json): Installed skills, catalogs, MCP servers, CLIs, and authentication boundaries.

---

## 2. Confirmed Constraints and Decisions

### Technical and Architectural Constraints (Explicitly Established)

| Decision | Status | Source and Scope |
| --- | --- | --- |
| Standalone frontend workspace (`Asymmetric-al/GF-SITE`) running Next.js App Router (`16.4.6`) + React `19.3.1` on Node.js 24 LTS with Bun `1.4.3` for package/script management | **Explicitly established** | User setup instructions; governs the entire repository. |
| Strict **NO Radix** rule (`radix-ui` and `@radix-ui/*` must never be installed directly or transitively) | **Explicitly established** | Explicit user directive (Base UI or Vercel UI SDK only, zero Radix); applies to all dependencies and imported catalog source. |
| Dual-boundary UI layer: **shadcn (`base-maia` / `@base-ui/react` + Hugeicons)** owns Tailwind v4 semantic styling tokens (`src/app/globals.css`), `cn()`, and static/display UI in `src/components/ui/`; **Vercel UI SDK (`@ui-sdk/core` + `@ui-sdk/react`)** owns all stateful interactive primitives under `@layer ui-sdk;` | **Explicitly established** | Explicit user architecture decision; never stack two focus, keyboard, selection, dismissal, or popup engines onto one control. |
| Latest **Tiptap (`3.35.0`)** packages (`@tiptap/core`, `@tiptap/pm`, `@tiptap/react`, `@tiptap/starter-kit`, `@tiptap/static-renderer`) installed for any frontend rich-text needs | **Explicitly established** | Explicit user directive (2026-11-21); Core's Payload CMS v4 Lexical editorial ownership remains separate until live CMS integration. |
| Future CMS separation: `Asymmetric-al/core` owns Payload CMS v4, persistence, media storage, and editorial publishing; `GF-SITE` consumes content through a server-only reader boundary (`src/lib/content/`) | **Explicitly established** | User architecture decision; documented in [docs/core-integration.md](./docs/core-integration.md). |
| Non-indexable provisional deployment until real domain, content, and launch readiness are confirmed (`noindex, nofollow`, `X-Robots-Tag`, `Disallow: /`, route-scoped canonicals omitted until configured) | **Explicitly established** | Initial foundation contract (`src/lib/site.ts`, `src/app/robots.ts`, `next.config.ts`). |
| Server-first rendering with small `"use client"` interactive leaf modules; full WCAG 2.1/2.2 A/AA verification plus reduced-motion support | **Explicitly established** | Foundation and testing requirements. |
| Registry and style configuration ([components.json](./components.json): `style: "base-maia"`, `iconLibrary: "hugeicons"`, 14 external registries configured) | **Explicitly established** | Architecture setup; governs all shadcn CLI and MCP discovery. |
| Design-system static lint enforcement ([oxlint.config.ts](./oxlint.config.ts): `@shadcn/lint` via `ultracite/oxlint/shadcn`, allowing `layout` placement and `Card`/`CardContent` spacing scale) | **Explicitly established** | Quality toolchain configuration; enforced via `bun run check`. |

### Brand and Editorial Constraints (Explicitly Established)

| Decision | Status | Source and Scope |
| --- | --- | --- |
| Permanently protected organizational wording: verbatim declarative and infinitive Mission Statement, verbatim Prayerful Vision Statement (`"It is our vision to plant a Gospel witness within 30 minutes of everyone."`), unbroken Three Pillars (`Church Planting`, `Local Leadership`, `Unreached People`), and verbatim 8-article public Statement of Faith | **Explicitly established (Immutable)** | Canonical source in [knowledge/brand/foundations.md](./knowledge/brand/foundations.md); enforced automatically in `scripts/verify-brand.ts` and `scripts/okf.test.ts`. |
| Brand logo silhouette & color freedom: preserve Global Fellowship's established Cross-in-Oval mark silhouette (`140:101`); free to retire legacy blue/yellow/gold and apply Living Nearness colors, typography, lockups, and graphic language | **Explicitly established** | User directives supplying Global Fellowship's official logo and Brand Kit PDF (2026-11-21) and confirming full color freedom (2026-11-22); governs `brand-kit/`. |
| Documentary street photography over generic illustrations: use vetted, sRGB-normalized, EXIF-stripped, zero-ShareAlike (`CC0 1.0` / `CC BY 2.0`) documentary street photography (`brand-kit/photography/`, 6 vetted frames logged in `PHOTO-LICENSES.md`) rather than generic vector illustrations on public brand surfaces, governed by the **Three-Path Photography Sourcing Rule** | **Explicitly established** | Explicit user visual direction (2026-11-22: _"we want to use street photography rather than generic illustrations"_); protects field security (`OVR-06`, zero portraits claiming to depict GF workers or protected congregations without written consent). |
| Clean brand-before-website phase boundary: keep `src/` and `public/` on the clean Next.js starter scaffold until website implementation begins so the next website builder and council can design the site cleanly from [Website Construction Handoff](./knowledge/references/website-builder-handoff.md) | **Explicitly established** | User branding-only directive (2026-11-22) and brand/OKF completion consolidation boundary (2026-11-23; `OVR-24`). |
| Public copy uses plain, natural, direct, source-backed language without em dashes, invented claims, testimonials, statistics, or SaaS sales pressure | **Explicitly established** | Editorial standards enforced via `styles/GF/` Vale rules and [Editorial & AI Hygiene](./knowledge/policies/editorial-and-ai-hygiene.md). |

---

## 3. Observed Implementation in the Current Starter Scaffold (`src/` & `public/`)

These files reflect the clean Next.js starter scaffold currently on `main` (zero unapproved Global Fellowship website pages or prototype layouts have been merged into `src/` or `public/`):

| Concern | Authoritative File | Current Status |
| --- | --- | --- |
| Starter Tailwind v4 semantic tokens, `@theme inline`, `@layer ui-sdk;` on line 1, and `prefers-reduced-motion` baseline | [src/app/globals.css](./src/app/globals.css) | **Observed in starter scaffold** (bridge `brand-kit/tokens/brand-tokens.css` tokens here during website construction). |
| Root HTML structure, starter metadata, robots policy (`Disallow: /`), and non-indexable `isSearchIndexingEnabled()` guard | [src/app/layout.tsx](./src/app/layout.tsx), [src/app/robots.ts](./src/app/robots.ts), [src/lib/site.ts](./src/lib/site.ts) | **Observed in starter scaffold** (keep non-indexable until confirmed launch domain under `OVR-15` & `OVR-21`). |
| Minimal starter page & error boundaries | [src/app/page.tsx](./src/app/page.tsx), [src/app/not-found.tsx](./src/app/not-found.tsx), [src/app/error.tsx](./src/app/error.tsx), [src/app/global-error.tsx](./src/app/global-error.tsx) | **Observed in starter scaffold** (replaced cleanly when website construction begins). |
| Server-only content reader boundary (`ContentReadResult<T>` & provisional local starter data) | [src/lib/content/types.ts](./src/lib/content/types.ts), [src/lib/content/local-content.ts](./src/lib/content/local-content.ts), [src/lib/content/reader.ts](./src/lib/content/reader.ts) | **Observed in starter scaffold** (extend against verified `Asymmetric-al/core` contracts in `docs/core-integration.md` during website phase). |
| Interactive `@ui-sdk/react` reference primitive (tabs boundary proof) | [src/components/foundation-tabs.tsx](./src/components/foundation-tabs.tsx) | **Observed in starter scaffold** (demonstrates `@ui-sdk/react` client leaf architecture with zero Radix). |
| Static/display shadcn primitives (`base-maia`, Hugeicons) | [src/components/ui/badge.tsx](./src/components/ui/badge.tsx), [src/components/ui/button.tsx](./src/components/ui/button.tsx), [src/components/ui/card.tsx](./src/components/ui/card.tsx), [src/components/ui/separator.tsx](./src/components/ui/separator.tsx) | **Observed in starter scaffold** (zero Radix). |

---

## 4. Component and Token Ownership

1. **Semantic tokens (`src/app/globals.css`):** Single source of truth for CSS variables mapped through `@theme inline`. Keep `@layer ui-sdk;` on line 1 above `@import "tailwindcss";`. Never hardcode raw Tailwind palette colors or arbitrary hex values in feature code (`shadcn/no-raw-colors`, `shadcn/no-arbitrary-values`).
2. **Static and display primitives (`src/components/ui/`):** Generated and maintained via `shadcn` (`base-maia`, Hugeicons). Components own their visual variants; page callers control layout placement only (`shadcn/no-restyle`, with narrow `Card`/`CardContent` spacing contract in `oxlint.config.ts`).
3. **Stateful interactive primitives (`src/components/`):** Implemented on `@ui-sdk/react/*` + `@ui-sdk/core` inside small `"use client"` leaf modules. Read `node_modules/@ui-sdk/react/docs/llms.txt` before building or extending any interactive control.
4. **Rich-text surface (future feature work):** Use the installed Tiptap `3.35.0` packages for frontend rich-text editing or static rendering (`@tiptap/static-renderer`). Keep visual styling bound to semantic tokens in `src/app/globals.css`, interactive controls aligned with UI SDK, and Core Payload CMS Lexical contracts cleanly separated until CMS integration is specified.
5. **External UI catalogs (`components.json`):** React Bits / Pro, ReUI, Shadcnblocks, Shadcn UI Kit, Shadcn Studio, Efferd, and Shadcn Space are registered as **discovery and source-adaptation catalogs**, not pre-approved visual systems. Before adopting any item:
   - Inspect returned dependencies and source imports for zero Radix (`radix-ui` / `@radix-ui/*`).
   - Note that none of these third-party catalogs ship Vercel UI SDK native behaviors; adapt interactive primitives onto `@ui-sdk/react` and preserve GF-SITE's semantic tokens and icon system.

---

## 5. Completed Brand System Release Candidate (Awaiting Human Approval, `OVR-15`)

### Primary Direction: Global Fellowship Organization-Wide Brand System ("Brought Near, Led Locally" · Living Nearness v15.0)

- **Status:** **Completed and verified release candidate (`delegated-working-guidance`), awaiting explicit human leadership approval (`OVR-15`)** (`55` OKF concepts: `54` `draft`, `1` `deprecated`, `verified: []` / `unverified` in OKF v0.3). Built under explicit stakeholder color-freedom and documentary street-photography directives (2026-11-22) and consolidated cleanly before website construction (`OVR-24`).
- **Protected Foundations (permanently locked, never alter):** [knowledge/brand/foundations.md](./knowledge/brand/foundations.md) preserves the verbatim Mission Statement, Prayerful Vision Statement, Three Pillars, and canonical 8-article public Statement of Faith (enforced byte-exact across `GF-TPL-22`, `scripts/verify-brand.ts`, and `scripts/okf.test.ts`).
- **Complete Brand & Messaging Knowledge (OKF v0.3):** Start at [knowledge/brand/brand-on-a-page.md](./knowledge/brand/brand-on-a-page.md) or run `bun run okf:scan`. Covers strategy (`Brought Near, Led Locally`), three-register voice (`Witness`, `Open Books`, `Note`) with executable Agency Grammar (`styles/GF/`), 7 audiences, dated proof ledgers, two-axis field security, 1-hop [On-Call Consent Withdrawal Runbook](./knowledge/policies/consent-withdrawal-runbook.md), [Source Coverage and Delegated Decisions](./knowledge/references/source-coverage-and-decisions.md), [Website Construction Handoff](./knowledge/references/website-builder-handoff.md), and open human verification gates (`OVR-01` to `OVR-24`).
- **Visual System & Documentary Photography Vault (`brand-kit/`):**
  - **Mark, Original Iconography & Non-ShareAlike Street Photography Vault:** Global Fellowship's preserved official Cross-in-Oval silhouette (`140:101`) vectorized into 15 SVGO-clean, vector-outlined (`Plus Jakarta Sans` Bold) SVG masters in **Harbor Teal (`#0C525C`) + Kiln Clay (`#7E3119`, daylight)** and **Warm Paper (`#FAF7F2`) + Candle Apricot (`#F2B488`, Harbor Night dark ground)** (including integer-pixel-snapped `16px` optical favicons with `@media (prefers-color-scheme: dark)`), 19 exact-dimension PNGs, **100% original Global Fellowship `1.65px` line icons** via `scripts/brand-icons.ts`, **6 cohesive sRGB-normalized, EXIF/COM-stripped, zero-ShareAlike (`4 CC0 1.0` + `2 CC BY 2.0`) documentary street photographs in `brand-kit/photography/`** (`GF-PHO-01..06`, full SHA-256 & CC license URL audit in `brand-kit/photography/PHOTO-LICENSES.md`), and 9 pure-vector photo-free fallback plates & patterns in [brand-kit/logos/mark-spec-sheet.html](./brand-kit/logos/mark-spec-sheet.html).
  - **Tokens:** Canonical strict W3C DTCG 2025.10 single source of truth at [brand-kit/tokens/tokens.json](./brand-kit/tokens/tokens.json) (`v15.0-draft`, 100% SIL OFL) and generated light + unified Harbor Night `.dark` [brand-kit/tokens/brand-tokens.css](./brand-kit/tokens/brand-tokens.css) mapping **Living Nearness v15.0** (`40/40` full-precision light + dark + deuteranopia pairs verified WCAG 2.2 AA/AAA in `brand-kit/tokens/contrast-report.json`), plus a complete token-mapped Ink-Neutral Regional Fallback (`#16191C` on `#FAF7F2`).
  - **Typography (Zero-Exception 100% SIL OFL 1.1 Across All 30 PDFs):** **Source Serif 4** optical display (including `96px` monument scale) & reading voice, paired with **Plus Jakarta Sans** and official Noto multilingual siblings (`Noto Sans`, `Noto Serif`, `Bengali`, `Noto Sans Arabic` primary + `Noto Naskh Arabic` secondary with per-block UTF-16BE logical `/ActualText` tags across Arabic-bearing PDFs, `Thai`, `Devanagari`, Russian Cyrillic, static `Simplified Chinese`), locally bundled as **76** SHA-256 verified WOFF2 files in `brand-kit/tokens/fonts/`.
  - **Guides, Templates, Documentary Street-Photo Video, Office Starters & Proofs:** [brand-kit/README.md](./brand-kit/README.md) indexes 4 guides (`GF-GDE-01`..`04`), 27 finished templates (`GF-TPL-01`..`25` including split `19`/`19B` and `24A`/`24B`, TrimBox-safe 4x6 bleed prayer cards, 8 social/OG/Photo-Story/Carousel PNGs + `social-photo-credits.txt`, zero-`<img>` live-text emails, 3-page EN/TH/AR mobile note kit), 1 playable **Tier 1 Public** `25.00s` (`750f @ 30fps`, BT.709 + 48kHz stereo AAC ambient bed) vertical video + 10-cue WebVTT + transcript, 5 plain-text scripts/twins, and 6 editable OOXML starters, all verified via `bun run verify:brand`.

### External Reference Catalogs (Not Approved)

The following installed tools and licensed catalogs remain **Existing proposal, not approved** reference catalogs only (zero Radix allowed if any pattern is later adapted):

- **React Bits Pro Agent Kit** (16 design directions, 12 page prompts, 6 recipes): **Existing proposal, not approved**; reference catalog only.
- **Shadcn UI Kit design packs** (Eclipse, Clay, Nebula, Ember, Monolith, Verdant, Stellar, Crayon): **Existing proposal, not approved**; do not run design-pack theme installers without explicit user approval.
- **Shadcn Studio themes (`@ss-themes`)**: **Existing proposal, not approved**; do not overwrite `src/app/globals.css`.
- **Impeccable design context (`/impeccable init`)**: **Existing proposal, not approved**; invoke only when beginning an explicit design-direction phase.

---

## 6. Areas Awaiting Human Approval or Website-Construction Phase Work

Items with a completed brand system release candidate in Section 5 (`brand-kit/` and `knowledge/`) remain **Delegated working guidance awaiting human leadership approval (`OVR-15`)**; website-specific architecture, layouts, and interactions remain **Deferred to Website Construction Phase (`OVR-24`)**:

| Area | Status | Notes / Questions to Resolve |
| --- | --- | --- |
| Brand identity, positioning, and audiences | **Working guidance complete; awaiting human approval (`OVR-15`)** | Authored and verified across `knowledge/` (`55` OKF v0.3 concepts) and `brand-kit/`; awaits explicit leadership sign-off (`OVR-15`). |
| Color palette, contrast system, and dark-mode support | **Working guidance complete; awaiting human approval (`OVR-15`, `OVR-11`)** | Living Nearness `v15.0` palette (`40/40` WCAG 2.2 light + `.dark` + deuteranopia pairs) plus Ink-Neutral Regional Fallback in `brand-kit/tokens/tokens.json`; public website theme-toggle policy remains undecided for the website phase. |
| Typography system and type scale | **Working guidance complete; awaiting human approval (`OVR-15`)** | 100% SIL OFL 1.1 `Source Serif 4` + `Plus Jakarta Sans` + multilingual Noto siblings locally vendored in `brand-kit/tokens/fonts/`; responsive web fluid-scale breakpoints finalized during website construction. |
| Imagery, photography, and illustration direction | **Explicitly established (`brand-kit/photography/`)** | 6 vetted, sRGB-normalized, EXIF/COM-stripped, zero-ShareAlike (`CC0 1.0` & `CC BY 2.0`) documentary street photographs live in `brand-kit/photography/` (`GF-PHO-01..06`, `PHOTO-LICENSES.md`) per explicit 2026-11-22 user directive; fresh written consent for real GF ministry portraits remains tracked under `OVR-06`. |
| Iconography treatment | **Working guidance complete; awaiting human approval (`OVR-15`)** | Original Global Fellowship `1.65px` line icons (`scripts/brand-icons.ts`) across `brand-kit/`, paired with Hugeicons (`@hugeicons/react`) across Next.js web UI. |
| Brand voice and public copy guidelines | **Working guidance complete; awaiting human approval (`OVR-15`)** | Witness / Open Books / Note registers, Agency Grammar, `styles/GF/` Vale ruleset, and complete organizational copy playbooks verified in `knowledge/`. |
| Website information architecture, sitemap, and navigation model | **Deferred to Website Construction Phase (`OVR-24`)** | Design freely from [Website Construction Handoff](./knowledge/references/website-builder-handoff.md) and legacy inventory without preemptive layout lock-in. |
| Website layout grid, spacing rhythm, breakpoints, and components | **Deferred to Website Construction Phase (`OVR-24`)** | Bridge `brand-kit/tokens/brand-tokens.css` into `src/app/globals.css`, build server-first pages + `@ui-sdk/react` interactive controls + shadcn static display primitives (zero Radix). |
| Motion and interaction choreography | **Deferred to Website Construction Phase (`OVR-24`)** | Design purposeful, interruptible, `prefers-reduced-motion`-safe UI interactions during website construction. |
| Live Core Payload CMS v4 integration & redirects | **Deferred to Website Construction Phase (`OVR-24`, `OVR-21`)** | Re-verify live `Asymmetric-al/core` `develop` admission/release contracts (`docs/core-integration.md`) and legacy redirect rules (`inbound-triage-and-content-ops.md`) during website construction. |
| Launch domain, canonical URL, and structured data policy | **Pre-launch gated (`OVR-15`, `OVR-21`)** | `isSearchIndexingEnabled()` stays `false` (`noindex, nofollow`, `Disallow: /`) until confirmed production domain and human approval. |

---

## 7. Design Quality and Verification Process

Future design and UI work should be judged by verifiable user outcomes rather than personal aesthetic preferences:

- **Clarity and hierarchy:** Visitors can immediately identify page purpose, reading order, headings, and primary actions without visual clutter.
- **Coherent interaction:** Interactive widgets use a single behavior owner (`@ui-sdk/react`), support pointer, touch (`>= 44px` / comfortable tap targets), keyboard navigation, visible focus states, and clean focus return.
- **Responsive stability:** Layouts work cleanly from narrow mobile (`320px`, `390px`) through desktop viewports with zero unintended horizontal overflow and stable image dimensions (no CLS).
- **Accessibility:** Semantic HTML landmarks, single `<h1>`, meaningful accessible names, WCAG 2.1/2.2 A/AA contrast, automated `@axe-core/playwright` scans across default and interactive states, plus manual keyboard and screen-reader review.
- **Purposeful motion:** Motion clarifies state changes or spatial continuity, remains interruptible, avoids layout-thrashing properties, and honors `prefers-reduced-motion: reduce`.
- **Accurate, readable content:** Real source-backed copy, plain language without em dashes, clear labels and error/empty states, checked against Vale `styles/GF/` rules and OKF proof ledgers.
- **Performance:** Production builds stay lean (checked with `bun run analyze` and repeated mobile/desktop Lighthouse CI runs in `docs/testing.md`).

### Right-Sized Verification by Change Type

- **Docs, OKF, or design-reference changes:** Verify `bun run okf:validate`, `bun run okf:scan`, `bun run check:links`, `bun run check:prose`, and accuracy against actual files.
- **Brand kit template, token, or asset changes:** Run `bun run verify:brand` plus direct visual inspection of rendered PNGs and TrimBox PDFs.
- **Component or styling changes (website phase):** Run `bun run check` (includes `@shadcn/lint`), `bun run typecheck`, targeted Vitest tests (`bun run test:run`), and Playwright smoke + accessibility (`bun run test:smoke`, `bun run test:a11y`) plus visual review (`bun run test:visual` when baselines intentionally change).
- **Layout, route, or asset-heavy changes (website phase):** Add production build (`bun run build`), bundle analysis (`bun run analyze`), and isolated mobile/desktop Lighthouse CI (`bun run perf:lhci`).
- **Lead/reviewer skill pairing:** Pick **one** lead skill per task (for example, `frontend-design` or `impeccable` for art direction; `ui-sdk` + `shadcn` for component implementation; `emil-design-eng` / `animate` for motion) and ask a second reviewer skill (`web-design-guidelines`, `impeccable`, `review-animations`, `break-ui`) a concrete review question rather than applying competing design systems at once.

---

## 8. Decision Maintenance

When the user explicitly approves a future design or brand decision:

1. Move the item out of **Section 6** into **Section 2 (Confirmed Constraints and Decisions)** or a dedicated approved subsection, and update the corresponding `knowledge/` OKF concept (`status: stable`, `x-gf-approval-state: approved`, and `human:<id>` verification only when explicitly authorized by that reviewer).
2. Record **what was decided**, **rationale**, **source** (user instruction, PR, or approved brief), **date**, and **scope**.
3. Link directly to the authoritative implementation file (`brand-kit/tokens/tokens.json`, `src/app/globals.css`, `src/app/layout.tsx`, `src/components/ui/*`) instead of duplicating mutable values in multiple places.
4. Never silently overwrite or delete a superseded decision; mark it as **Superseded** with a pointer to the replacement decision.
5. Keep observations strictly separate from explicit approvals, and keep `AGENTS.md` concise by linking here and to `knowledge/index.md` rather than duplicating details.
