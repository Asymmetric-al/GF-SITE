---
title: Website Construction Handoff
description: Operational handoff for building globalfellowship.org from the completed brand system, OKF bundle, brand-kit assets, legacy migration table, DESIGN.md, and Core CMS v4 contract.
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
  at: "2026-11-23T06:55:00Z"
verified: []
sources:
  - id: foundations
    resource: /brand/foundations.md
    title: Permanently locked Mission, Vision, Three Pillars, and 8-article Statement of Faith
  - id: brand-on-a-page
    resource: /brand/brand-on-a-page.md
    title: Two-minute brand summary and Living Nearness v15.0 identity
  - id: proof-2025
    resource: /messaging/proof-ledger-2025.md
    title: Verified 2025 operational and financial facts and candid ECFA posture
  - id: retired-claims
    resource: /messaging/retired-claims.md
    title: Deprecated legacy claims and mandatory replacements
  - id: security
    resource: /policies/field-security-and-disclosure.md
    title: Two-axis field security disclosure rules and zero-mosaic constraints
  - id: source-synthesis
    resource: /references/source-synthesis.md
    title: Audited legacy globalfellowship.org inventory (670 records, 1,808 CSV rows)
  - id: asset-index
    resource: /references/asset-index.md
    title: Complete brand-kit asset, token, font, and street-photo catalog
  - id: open-verification
    resource: /references/open-verification-register.md
    title: Open human-owned pre-launch dependencies OVR-01 through OVR-24
---

# Website Construction Handoff

**Phase Boundary (`OVR-24`):** `main` intentionally preserves the clean Next.js `16.4.6` starter scaffold in `src/` and `public/`. **Nothing in this handoff prescribes a fixed sitemap, wireframe, or page layout**; information architecture, responsive design, interaction choreography, and live CMS transport belong to the website-construction phase. Do not treat `status: draft` working guidance as formally leadership-approved until `OVR-15` closes[^open-verification].

---

## 1. Progressive Reading Sequence Before Building

1. **Repo rules & UI/CMS boundaries:** `AGENTS.md`, `DESIGN.md`, `docs/core-integration.md`.
2. **OKF quick scan:** Run `bun run okf:scan -- --current` or open [Knowledge Index](../index.md).
3. **Brand core & locked text:** [Brand on a Page](../brand/brand-on-a-page.md)[^brand-on-a-page] and [Protected Foundations](../brand/foundations.md)[^foundations].
4. **Facts, retired claims & open gates:** [2025 Proof Ledger](../messaging/proof-ledger-2025.md)[^proof-2025], [Retired Claims](../messaging/retired-claims.md)[^retired-claims], and [Open Verification Register](open-verification-register.md)[^open-verification].
5. **Security, consent & editorial rules:** [Field Security Policy](../policies/field-security-and-disclosure.md)[^security], [Ethical Storytelling](../policies/ethical-storytelling-and-consent.md), [Editorial & AI Hygiene](../policies/editorial-and-ai-hygiene.md), and [CMS Editor Field Guide](../marketing/cms-editor-field-guide.md).
6. **Assets & reusable copy:** [Asset Index](asset-index.md)[^asset-index], `brand-kit/tokens/tokens.json`, `brand-kit/photography/PHOTO-LICENSES.md`, and relevant playbooks in `knowledge/marketing/`.

---

## 2. Three-Level Editorial Flexibility Rule

1. **Permanently Locked (Zero Edits):** Verbatim declarative/infinitive Mission Statement, Prayerful Vision Statement, unbroken Three Pillars + canonical glosses, and canonical 8-article Statement of Faith reading copy (`foundations.md:62-64`, `76-83`)[^foundations]; verified legal/contact identity (`Global Fellowship, Inc.`, 501(c)(3), `EIN 68-0214543`, `Candid ID 8043461`, `P.O. Box 1, Meadow Vista, CA 95722`, `1 866 984 5622` Pacific business hours, `info@`, `finance@`, `prayer@`, `executivedirectors@`); dated financial scope & candid ECFA wording (`proof-ledger-2025.md`); Agency Grammar, zero em dashes, zero internal `OVR-*` codes in public copy; and field-security ceilings.
2. **Strong Channel Default (Prefer Unless IA Demands Adaptation):** Flagship headline (`"When a cross-cultural missionary arrives, the local leader still leads"`) paired with its 15-word travel descriptor on cold external surfaces ([Message Hierarchy](../messaging/message-hierarchy.md)).
3. **Freely Adaptable During Website Design:** Supporting headlines, page introductions, section sequencing, navigation labels, UI microcopy, empty/error states, and progressive disclosure tailored to the final website IA.

---

## 3. Web-Specific Brand, Asset & Security Guardrails

- **Tokens & Fonts (`brand-kit/tokens/`):** Bridge `brand-kit/tokens/brand-tokens.css` (`tokens.json`, `40/40` WCAG 2.2 light/dark/deuteranopia pairs) into `src/app/globals.css` during website implementation (keeping `@layer ui-sdk;` at line 1). Self-host the `76` locally vendored SIL OFL 1.1 WOFF2 fonts (`Source Serif 4`, `Plus Jakarta Sans`, Noto scripts) via `next/font/local`.
- **Marks & Street Photography (`brand-kit/logos/`, `brand-kit/photography/`):** Use the 15 SVGO-clean SVG marks (incl. adaptive `16px` favicons) and 6 vetted zero-ShareAlike EXIF-free street photos (`GF-PHO-01`..`06`). Every public street-photo use MUST preserve visible-only alt text, photographer credit + CC license URL, opaque Harbor Night AAA scrim (`>= 0.94` opacity) behind overlaid text, and the honest non-congregation disclaimer. **Never** reuse the 6 rejected prototype photos listed in `PHOTO-LICENSES.md` §3.
- **Downloadable Public Packets:** Only expose public PDFs (e.g., `GF-TPL-22` Elders' Vetting Packet, `GF-TPL-23` Host Agreement, `GF-TPL-20` Bridge Kids, `GF-TPL-05` 2025 Spread, `GF-TPL-17` Sunday Insert). **Never** expose internal/confidential files (`GF-TPL-18`, `GF-TPL-19B`, `GF-TPL-24B`) or Level 4 zero-attribution sheets (`GF-TPL-16`, `GF-TPL-19`) as public GF-branded website downloads.
- **Field Security & Anti-Mosaic Web Rules:**
  - Never create individual public web pages or updates for **Tier 3** or **Level 4** workers/ministries.
  - Never commit restricted worker slug-to-name redirect maps, deny-lists, or signed consents to Git (`OVR-14`).
  - Use opaque IDs (never real-name slugs) for Tier 2 worker pages, keep Tier 1 and Tier 2 page headers visually identical (zero `"Restricted"` labels, silhouettes, blurred faces, padlocks, or map pins), strip EXIF from all uploads, and require fresh `GF-TPL-15` re-consent (`OVR-06`) before republishing archived stories or real worker photos.
- **Prohibited Web Claims:** Unqualified `"100%"` or `"0% overhead"`, standalone `"$5.9M"` as GF-only, side-by-side 2024 (`1,254`) vs. 2025 (`230`) church-plant charts (`OVR-05`), `"no written policies"`, `"10-25% agencies"`, `"3% / 1%"` heuristics, continuous `"24/7 prayer"` (`OVR-08`), or fabricated quotes/photos[^retired-claims].

---

## 4. Legacy `globalfellowship.org` Content Migration Table (Single Canonical Owner)

Audited from `Global_Fellowship_Content_Master.md` (`670` unique records: `S001`-`S032`, `P001`-`P266`, `D001`-`D043`, `F001`-`F294`, `B001`, `I001`-`I024`, `E001`-`E009`, `N001`) and `Content_Inventory.csv` (`1,808` rows, `199` sitemap URLs)[^source-synthesis]. Use strictly as migration context, not an obligation to replicate legacy navigation:

| Legacy Inventory Class | Count | Migration Policy | Security & Consent Condition |
| --- | --- | --- | --- |
| **Core institutional pages** (`/about`, `/how-we-work`, `/statement-of-faith`, `/financials`, `/contact`, `/donor-privacy`, `/our-mission`, `/our-three-pillars`, `/our-values`, `/100-model`, etc.) | 10+ core routes | Preserve core substance with permanent `308` redirects from legacy paths to chosen destinations. | Byte-exact Protected Foundations; zero retired claims. |
| **Six regional pages** (`/central-asia`, `/east-asia`, `/south-asia`, `/europe`, `/middle-east`, `/north-africa`, plus Southeast Asia) | 6 routes | Preserve broad regional context with `308` redirects from legacy URLs. | Zero map pins, zero restricted town names, zero per-country worker counts. |
| **Legacy project designations** (`/project/:slug`) | 58 designations | Migrate active cleared funds into `Asymmetric-al/core` CMS; `308` redirect closed/unknown slugs to projects index or Finance help. | Finance audits active vs. closed funds first; closed funds trigger `COPY-DONOR-REDESIG-01`. |
| **Legacy missionary profiles** (`/missionary/:slug`; donor login/account routes lived separately under `/user/*`) | 52 profiles (12 protected) | Migrate ONLY actively cleared, re-consented profiles into Core CMS using opaque worker IDs; redirect legacy `/missionary/:slug*` uniformly to safe lookup/donor help (`/give/help#specific-worker`) and `/user/:path*` to donor account help (`/give/help#donor-account`). | **Hard rule (`OVR-06`, `OVR-14`):** Zero per-worker slug redirect map in public Git; never echo worker slugs in redirects. |
| **Legacy field articles** (`/article/:slug`) | 8 articles (`P162`-`P169`) | Hold pending fresh `GF-TPL-15` re-consent (`OVR-06`) before Core import; `308` redirect legacy paths to stories destination. | Never auto-republish archived identifiable field stories or photos. |
| **Legacy giving/support/login routes & forms** (`/how-to-make-a-donation`, `/stock-donations`, `/checkout`, `/login`, `F001`-`F294`, `B001`) | 12+ routes + 295 form records | Configure permanent `308` redirects to chosen giving, non-cash giving, and donor-help routes (`OVR-21`); use form records only as checkout/field reference. | Preserve donor bookmarks and printed mailer destinations without dead 404s. |
| **Accounting App legal routes** (`/eula`, `/privacypolicy`) | 2 routes | Retain verbatim as standalone minimal `noindex` routes cleanly separate from public donor privacy policy. | Preserves QuickBooks / Accounting App compliance links intact. |
| **Retired WIP/error routes, login-gated newsletter & stock files** (`/checkout-test`, `/home-draft`, `/ytd-statement-admin`, `E001`-`E009`, `N001`, 184 stock files) | 3 WIP + 9 error + 1 auth + 184 stock | Return `410 Gone` (`X-Robots-Tag: noindex, nofollow`) for WIP routes; permanently retire 184 uncurated stock files; `N001` (March 2026 HubSpot login boundary) had no public body recovered. | Do not carry forward legacy desktop/mobile copy divergence, broken `/training` (`404`), or `"Lorem ipsum"` Board placeholder. |

---

## 5. Engineering Stack, Core CMS v4 Boundary & Open Website Decisions

- **Stack & strict UI boundaries (`DESIGN.md`):** Next.js `16.4.6` App Router + React `19.3.1` + TypeScript `7.1.0-beta` + Tailwind `4.3.5` (Node.js 24 LTS, Bun package scripts). **ZERO Radix** anywhere. **shadcn (`base-maia` / `@base-ui/react` + Hugeicons)** owns static/display UI (`src/components/ui/`); **Vercel UI SDK (`@ui-sdk/react`)** owns all stateful interactive controls under `@layer ui-sdk;`. Keep `isSearchIndexingEnabled()` disabled (`noindex, nofollow`, `Disallow: /`) until production launch (`OVR-15`, `OVR-21`).
- **`Asymmetric-al/core` Payload CMS v4 (`docs/core-integration.md`):** Core owns Payload CMS v4, Postgres, Blob uploads, and publication admission; `GF-SITE` stays strictly frontend-only behind server-only `src/lib/content/` (never install Payload runtime or `@asym/*` packages here). Re-verify live Core `develop` release-backed reads and serving admission before coding integration, and ensure immediate consent-withdrawal removal (`mode: "withdraw"` / release admission) invalidates every cache layer.
- **Decisions left open to the website phase:** Sitemap/navigation design, page layouts, responsive grids, art-directed photo placement, light/dark toggle policy, `@ui-sdk/react` interaction and motion choreography, `next.config.ts` redirect map, giving portal UX (`OVR-21`), and launch SEO/structured data.
