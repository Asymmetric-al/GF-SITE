---
title: Source Coverage Record and Delegated Completion Decision Log
description: Complete provenance accounting of all supplied Global Fellowship source archives, brand-council artifacts, and paused exploratory prototypes, paired with the consolidated log of delegated completion decisions, closed gaps, external human dependencies, and website-phase deferrals.
type: Reference
status: draft
tags:
  - sources
  - provenance
  - decisions
  - governance
  - handoff
x-gf-kind: decision-record
x-gf-approval-state: source-record
x-gf-disclosure: public
generated:
  by: antigravity/gemini-4-neon
  at: "2026-11-23T03:05:00Z"
verified: []
sources:
  - id: source-synthesis
    resource: /references/source-synthesis.md
    title: Detailed archive accounting of Identity and Website Context, Content Master (670 records), Content Inventory CSV (1,808 rows), and supplied Logo PNG / Legacy Brand Kit PDF
  - id: foundations
    resource: /brand/foundations.md
    title: Permanently locked Mission Statement, Vision Statement, Three Pillars, and 8-article public Statement of Faith
  - id: open-verification
    resource: /references/open-verification-register.md
    title: Open human-only verification dependencies OVR-01 through OVR-24
  - id: governance
    resource: /policies/brand-governance-and-maintenance.md
    title: Authority separation, single-source update rules, and OKF v0.3 maintenance cadence
  - id: website-handoff
    resource: /references/website-builder-handoff.md
    title: Website construction handoff defining the strict phase boundary for globalfellowship.org
---

# Source Coverage Record and Delegated Completion Decision Log

This document provides a single audit trail accounting for **every supplied Global Fellowship source, prior work stream artifact, and consequential delegated completion decision** made to consolidate and verify the brand and OKF knowledge system prior to website construction[^source-synthesis][^governance].

---

## Part A: Complete Source Coverage Table

| Source / Prior Work Stream | Scope & Contents | Disposition | Where Represented / Reason for Status |
| --- | --- | --- | --- |
| **`Global_Fellowship_Identity_and_Website_Context.md`** (supplied archive, 445 lines, `S1`–`S17`) | VVR Orientation Deck v10, Whitepaper Rev 10-24, Core Values Master List, 2024–2026 role descriptions, Bridge Project, Exposure Trips, Faith on the Frontlines, Member Care, 2024/2025 metrics, and private Drive index (`S1`–`S9`, `S15`–`S16`). | **Incorporated** (private Drive URLs & unavailable originals **Intentionally excluded** from public Git) | Core convictions and locked wording in [Protected Foundations](../brand/foundations.md), [Source Synthesis](source-synthesis.md), [Strategy & Positioning](../brand/strategy-and-positioning.md), [Character & Values](../brand/character-and-values.md), `audiences/`, and `offerings/`. Private Drive URLs omitted from public repo for safety. |
| **`Global_Fellowship_Content_Master.md`** (supplied archive, 49,846 lines, 670 records: `S001`–`S010`, `P001`–`P173`, `D001`–`D043`, `I001`–`I024`, `E001`, `N001`) | Full text and audited transcriptions of live `globalfellowship.org` pages, 52 missionary profiles (12 protected), 58 project designations, 8 field articles, 43 linked PDFs/DOCX files (including 2024/2025 Annual Reports `D001`/`D002` and Statements of Activity `D042`/`D043`), 24 reviewed image audits, and source-issue audit. | **Incorporated** (restricted worker names, un-reconsented field stories/photos, and retired claims **Intentionally excluded / Held**) | Facts and financial boundaries in [2025 Proof Ledger](../messaging/proof-ledger-2025.md), [2024 Historical Context](../messaging/proof-ledger-2024.md), [Retired Claims](../messaging/retired-claims.md), [Inbound Triage & Legacy Migration](../policies/inbound-triage-and-content-ops.md), and [Website Construction Handoff](website-builder-handoff.md). Restricted worker identifiers omitted from public Git (`OVR-14`); archived articles/profiles held for fresh re-consent (`OVR-06`). |
| **`Global_Fellowship_Content_Inventory.csv`** (supplied archive, 1,808 rows, 25 columns) | Complete URL, media, document, and asset catalog of `globalfellowship.org` reconciled against `Content_Master.md` (199 sitemap URLs, 266 URL records, 184 uncurated stock files). | **Incorporated** (184 legacy stock files **Superseded / Retired**) | Reconciled in [Source Synthesis](source-synthesis.md) and summarized for future website routing/redirects in [Inbound Triage & Legacy Migration](../policies/inbound-triage-and-content-ops.md) and [Website Construction Handoff](website-builder-handoff.md). Legacy stock files retired per documentary street-photography direction. |
| **Supplied Official Logo PNG** (`Global Fellowship Logo - color (no padding) (5).png`, `1795x792`) | Established `140:101` Cross-in-Oval silhouette with interlocking `G`/`F` and negative-space cross. | **Incorporated (Silhouette preserved verbatim)** | Mathematically vectorized into 15 SVGO-clean SVG masters (`brand-kit/logos/svg/`) and 19 PNGs (`brand-kit/logos/png/`), documented in [Visual Identity](../brand/visual-identity.md) and `brand-kit/logos/mark-spec-sheet.html`; trademark archive confirmation tracked in `OVR-12`. |
| **Supplied Legacy Brand Kit PDF** (`Fonts, Colors, Picture Examples - GF Brand Kit.pdf`) | Legacy colors (`#007AC3`, `#FFE11D`, `#231F20`), legacy fonts (`Gilam Bold`, `Aileron`, `Montserrat`), and 5 real documentary field photo examples. | **Superseded (colors/fonts); Referenced (photo instinct; reuse held under `OVR-06`)** | Colors and fonts retired under explicit 2026-11-22 stakeholder color-freedom direction in favor of Living Nearness `v15.0` (`Harbor Teal`, `Kiln Clay`, `Candle Apricot`, `Source Serif 4`, `Plus Jakarta Sans`, SIL OFL 1.1). Visual realism informs the Three-Path Photography Sourcing Rule; archived PDF photos are never republished without fresh `GF-TPL-15` consent (`OVR-06`). |
| **External Missions Research & Branding Frameworks** (Joshua Project, Gordon-Conwell CSGC, Lausanne _State of the Great Commission_, 11 peer ministries, StoryBrand 2.0, _The Brand IDEA_, _Brandraising_, _Made to Stick_) | Contemporary Gospel access definitions (UPG/UUPG), peer-sector positioning, and ethical nonprofit brand frameworks. | **Linked reference / Incorporated** | Documented in [Contemporary Missions Context](missions-context-and-competitors.md) and [Branding Frameworks](branding-frameworks.md). Live Joshua Project export date and exact CSGC edition/table remain explicitly pinned as human pre-publication checks under `OVR-19`. |
| **Curated Public Street Photography Vault (`brand-kit/photography/`, `GF-PHO-01`–`06`)** | 6 cohesive `1600x1067` (`3:2`) sRGB-normalized, EXIF/COM-stripped, zero-ShareAlike (`4 CC0 1.0` + `2 CC BY 2.0`) documentary street photographs replacing generic vector illustrations and superseded `v14.0` ShareAlike frames. | **Incorporated (v14.0 frames Superseded & logged)** | Stored in `brand-kit/photography/`, audited in `brand-kit/photography/PHOTO-LICENSES.md` and `brand-kit/manifest.json`, and verified by `bun run verify:brand`. Regional accept/swap review tracked under `OVR-11`. |
| **Brand Council Evaluation History (`docs/brand-council/`)** | 15 completed scored council rounds across Rubric v1.0 (`N=35`) and Rubric v2.0 (`N=38`), plus independent completion review record. | **Retained as history** | Preserved transparently in `docs/brand-council/evaluation-rubric.md`, `docs/brand-council/council-review-record.md`, and `docs/brand-council/completion-review-record.md`. Scores are evaluation evidence only and never constitute leadership approval (`OVR-15`). |
| **Earlier Exploratory Website Prototype (`web-v1` / `web-v2`, pre-pause local commits)** | Premature Next.js pages in `src/`, 6 rejected unconsented `public/photos/*.jpg` files, Windows-only visual snapshots, and `docs/website-council/` built before the 2026-11-22 branding-only pause. | **Intentionally excluded from `main` (preserved only on local archival branch `archive/paused-web-v2-preview`)** | Excluded cleanly from the brand/OKF merge so `main` remains strictly at the brand-completion phase boundary with zero premature website implementation and zero rejected unconsented photographs in public Git. Relevant verified lessons (Core CMS v4 contract notes, photo rejection log) are preserved in `docs/core-integration.md`, `PHOTO-LICENSES.md`, and [Website Construction Handoff](website-builder-handoff.md). |
| **Upstream Open Knowledge Format Specification & Reference Tooling (`open-knowledge-format/open-knowledge-format`)** | OKF v0.3 normative `SPEC.md`, official `okf-consume` / `okf-generate` skills, and reference Python `validate.py` & `scan.py` (checked live at commit `527e81aff55992be21507e97004286789126f88c`, `2026-11-18`). | **Linked reference / Verified parity** | Documented in `docs/okf.md`; local skills verified byte-equivalent (EOL-only), and `knowledge/` verified 0 errors / 0 warnings against BOTH `bun run okf:validate` and official upstream Python `validate.py --strict`. |

---

## Part B: Delegated Completion Decisions & Gap-Closure Log (`2026-11-23`)

Under the explicit delegated completion authority granted for this consolidation pass (within the established Living Nearness `v15.0` direction and strictly respecting permanently locked Foundations[^foundations]), every open loose end was triaged into one of five honest categories:

### 1. Resolved Through Recovered Source Evidence or Upstream Standards

- **Omitted invented `stale_after` dates across `knowledge/`:** Removed placeholder 6-month `stale_after: "2027-05-21"` / `"2027-05-22"` dates that had no confirmed organizational review schedule, aligning strictly with OKF v0.3 `SPEC.md` §5.5 (`"Omit stale_after when no review date is known. Do not invent one."`). Owners add real review dates once governance cadences are set under `OVR-15`.
- **Reconciled `GF-TPL-19B` English Translator Notes verbatim with pure-local `GF-TPL-19`:** Replaced the stale outsider-justification quote in `arabic-first-local-brief-translator-notes.html` with the exact English back-translation of `arabic-first-local-brief-twin.txt` line 8 so translators and native reviewers inspect accurate text.
- **Reconciled `evaluation-rubric.md` Gate 6 wording with verified non-ShareAlike street photography:** Updated `G6` written wording to reflect the stakeholder street-photography directive (`CC0 1.0` and `CC BY 2.0` frames logged in `PHOTO-LICENSES.md` with full license URLs and non-congregation disclaimers) alongside SIL OFL 1.1 fonts and original Global Fellowship works.
- **Reconciled unpinned CSGC figures (`missions-context-and-competitors.md`):** Separated qualitative Global South shift (usable in public copy) from unpinned CSGC series estimates (`~8.2B`, `~2.67B`, `~32%`, kept as research-only context until exact edition/table pinning under `OVR-19`).

### 2. Resolved Through Authorized Delegated Completion Decisions

- **Strict phase separation on `main` (excluding premature `web-v2` prototype & 6 rejected photos):** Branched cleanly from `origin/main` so the merged PR delivers ONLY the completed brand system, `brand-kit/`, `knowledge/` OKF bundle, `styles/GF/`, brand verification tooling, and handoff docs while preserving `src/` and `public/` on the clean Next.js starter scaffold (and archiving local pre-pause `web-v2` history outside `main` on local branch `archive/paused-web-v2-preview`).
- **Explicit authority vocabulary in OKF frontmatter (`x-gf-approval-state`):** Preserved honest `status: draft` (`deprecated` on `retired-claims.md`) and `verified: []` across the bundle while using GF extension key `x-gf-approval-state` (`locked-foundation`, `delegated-working-guidance`, `source-record`, `retired-legacy`) so future agents and humans immediately distinguish locked wording, completed working guidance, source records, and retired history from human-approved `status: stable` release.
- **Honest action wording on finance, social, and Bridge templates:** Updated `"Read both 2025 statements before you give"` to `"Request both 2025 [financial] statements before you give"` across `GF-TPL-09`, `GF-TPL-10`/`.pptx` Slide 7, and `GF-TPL-11` Portrait (matching actual email-request flow while web portals remain open under `OVR-21`); replaced `"Check my approved format"` `mailto:` links on `GF-TPL-08` with `"Ask which format to use"`; added `"OUR PRAYERFUL VISION"` cue on `GF-TPL-11` Square; sharpened Christian church-planting prominence on `GF-TPL-11` OG; named `MissionStream and BOLK` in `GF-TPL-11` Portrait's footnote; scrubbed `"ships in the companion"` file-system leak from `GF-TPL-11` Carousel 3 (and added a Vale `TemplateMetaLeak` rule); removed the unsupported `"90% of weekly work"` ratio from `brand-kit/README.md`; replaced stale `"merge-ready"` with `"manual fill-in"` in `FONT-LICENSES.md` and `copy-donor-lifecycle-and-receipts.md`; fixed `"Slide 1"` -> `"Slide 4"` `<a:r>` font note in `FONT-LICENSES.md`; added `[church-planting / support-staff]` + encrypted regional-hub handoff prompt to `GF-SCR-01` and `GF-SCR-05`; added explicit `Funding Status` field and inclusive `[I / our family]` wording in `copy-support-raising-and-onboarding.md`; added regional-vs.-local stop-authority speaker note on Deck Slide 4; aligned `.two-col` on `GF-TPL-25`; and fixed the Tier 1 imagery wording sync across `GF-GDE-03` and `visual-identity.md`.

### 3. Closed Through Production Fixes & Automated Regression Guards

- **Fixed Page 2 TrimBox clipping on `prayer-card-public-variant-bleed.pdf` (`G2`/`G5`):** Tightened Page 2 vertical spacing in `prayer-card-public-variant.html` (and shortened front micro-text wrap on `prayer-card-restricted-master.html`) so `.card-specimen-micro` sits cleanly inside the `441pt` finished TrimBox on BOTH front and back faces, and added an automated **TrimBox safe-area bounding-box check** in `scripts/verify-brand.ts`.
- **Fixed critical private prayer-note asset ID routing (`GF-SCR-01` -> `GF-TPL-14`):** Replaced every erroneous reference citing `GF-SCR-01` (public `candidate-first-call-message.txt`) for private Tier 3 mobile prayer notes across `brand-on-one-sheet.html`, `channel-playbooks.md`, `strategy-and-positioning.md`, `visual-identity.md`, `field-security-and-disclosure.md`, `asset-index.md`, `PHOTO-LICENSES.md`, `build-brand-video.ts`, and `living-nearness-prayer-vertical-transcript.txt` with `GF-TPL-14` (`exports/mobile-prayer-note-twin.txt`, `-thai-twin.txt`, `-arabic-twin.txt`), and added an automated guard in `scripts/verify-brand.ts` and `scripts/okf.test.ts`.
- **Closed `SYNTH-VETO-001` withdrawal coverage on `GF-SCR-05`:** Attached `"SYNTH-VETO-001"` to `GF-SCR-05` (`social-photo-credits.txt`) in `brand-kit/manifest.json` and expanded the reverse withdrawal drill in `scripts/verify-brand.ts` to catch `"Not this spring"` across all templates and `.txt`/`.vtt` exports.
- **Added CI & Vitest regression protection:** Extended `.github/workflows/ci.yml` Lychee check to include `brand-kit/**/*.md` and added fast deterministic brand/OKF/manifest/Foundations regression tests to `scripts/okf.test.ts`.
- **Closed Wave 2 clean-checkout consumption defects (`Claude Opus 5.5` Retrieval Suite 1 + `GPT 6.2 Astra` Creation Suite 2):** Eliminated unsafe `"Tier 3 livestream"` shorthand (`brand-on-a-page.md`, `visual-identity.md`, `PHOTO-LICENSES.md`), replaced unbuilt `/api/cms/revalidate` instructions with a single unified 4-stage withdrawal runbook covering both today's live host and planned future Core CMS (`consent-withdrawal-runbook.md` + 4 linked policies), scrubbed internal `OVR-*` IDs from outward copy blocks (`proof-ledger-2025.md`, `copy-boilerplate-and-media.md`, `copy-church-vetting-and-host-agreement.md`), aligned `"584 workers served"` and `"2030 strategic goal"` labels across boilerplate/deck/report, reconciled non-reconciliation finance framing (`source-synthesis.md`, `OVR-03`), added `/serve` to `OVR-21` and independent `OVR-15A/B/C` sub-gates, fixed broken inline-code file paths (`participation-and-ctas.md`, `OFL-1.1.txt`, `src/app/page.tsx`) and `foundations.md` line citations (`62-64`, `76-83`), synced glossary pillar glosses, clarified deliberate absence of a restricted `.pptx`, and locked automated regression checks into `scripts/okf.test.ts`.

### 4. Genuinely Dependent on External Human Owners (Kept Open Honestly)

All 24 human-owned dependencies remain tracked explicitly with responsible roles and safe interim handling in [Open Verification Register](open-verification-register.md) (`OVR-01` through `OVR-24`)[^open-verification]: Finance scope/audit/entity definitions (`OVR-01`, `02`, `03`, `16`), operational/metric reconciliations (`OVR-04`, `05`, `19`), fresh written photo/story re-consent (`OVR-06`), address/program/naming confirmations (`OVR-07`, `08`, `09`, `10`), native regional cultural & Arabic review (`OVR-11`), trademark/tool/private-store setup (`OVR-12`, `13`, `14`, `17`, `20`), leadership approval & Statement of Faith reconciliation (`OVR-15`), physical press/copier proof (`OVR-18`), live web routes & counsel review (`OVR-21`, `22`, `23`), and website construction kickoff (`OVR-24`).

### 5. Intentionally Deferred to Website Construction Phase

All public website routes, sitemap/navigation design, interactive `@ui-sdk/react` components, responsive layout choreography, Core Payload CMS v4 runtime integration, SEO/canonical launch activation, and `src/app/globals.css` token application belong strictly to the upcoming website-construction phase governed by [Website Construction Handoff](website-builder-handoff.md) and `DESIGN.md`[^website-handoff].
