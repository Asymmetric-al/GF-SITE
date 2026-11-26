---
title: Brand Kit Asset Index and Provenance Catalog
description: Canonical catalog mapping Living Nearness v15.0 brand-kit asset IDs to editable sources, disclosure tiers, licensing, and single-source build scripts.
type: Reference
status: draft
tags:
  - assets
  - tokens
  - templates
  - provenance
  - licensing
x-gf-kind: asset-index
x-gf-approval-state: delegated-working-guidance
x-gf-disclosure: public
generated:
  by: antigravity/gemini-4-neon
  at: "2026-11-23T06:55:00Z"
verified: []
sources:
  - id: visual-identity
    resource: /brand/visual-identity.md
    title: Living Nearness v15.0 mark, palette, typography, and photography rules
  - id: foundations
    resource: /brand/foundations.md
    title: Permanent verbatim Mission, Vision, and Three Pillars governing all templates
---

# Brand Kit Asset Index and Provenance Catalog

To keep `knowledge/` portable under OKF v0.3 §6, all binary assets, SVGs, street photography, vendored fonts, motion video, design tokens, OOXML starters, and HTML/PDF/PNG templates live in top-level `brand-kit/`. Every item's exact SHA-256 digest, `disclosureTier`, `eligibleChannels`, `sourcePhotoIds`, `storyRefs`, and `thirdPartyContent` metadata lives in `brand-kit/manifest.json` (`schemaVersion: "15.0"`). For the staff 60-second quick-start, open `brand-kit/README.md`.

## 1. Single-Source Build & Licensing Boundaries

- **Design Tokens:** `brand-kit/tokens/tokens.json` (W3C DTCG 2025.10, zero proprietary fonts) -> `bun scripts/generate-brand-tokens.ts` -> emits `brand-tokens.css`, `contrast-report.json` (`40/40` WCAG 2.2 AA/AAA pairs), and auto-syncs [Visual Identity](../brand/visual-identity.md).
- **Presentation Deck:** `scripts/brand-deck-data.ts` generates BOTH `templates/presentation-deck.html` (`GF-TPL-10`) and `office/global-fellowship-deck-starter.pptx` (8 slides synced verbatim).
- **Original Works & Licensing:** All marks, fallback patterns, 12 `1.65px` UI icons (`scripts/brand-icons.ts`), templates, Office starters, and `GF-VID-01` video/audio are original works created for Global Fellowship. All `76` locally vendored WOFF2 fonts are **100% SIL OFL 1.1** (`brand-kit/tokens/FONT-LICENSES.md`). All `6` street photographs in `brand-kit/photography/` are **zero-ShareAlike (`4 CC0 1.0` + `2 CC BY 2.0`)**, EXIF/COM-stripped, sRGB-normalized, and audited in `brand-kit/photography/PHOTO-LICENSES.md`. Provisional ESV Scripture provenance is tracked in `manifest.json` (`OVR-09`).
- **Verification:** `bun run verify:brand` re-exports all PDFs/PNGs and enforces 6 release gates (`G1`-`G6`) plus full SHA-256 manifest parity.

## 2. Asset Lookup Directory (`brand-kit/...`)

| Manifest ID | Path (`brand-kit/...`) | Purpose & Outputs | Disclosure Tier / Critical Usage Rule |
| --- | --- | --- | --- |
| `GF-GDE-01` | `guide/brand-guide-book.html` | 7-page Brand Guide Book (PDF + PNG) | Internal/Partner guide; Page 5 shows all 6 vault photos & AAA scrim proof. |
| `GF-GDE-02` | `guide/brand-on-one-sheet.html` | 1-page Staff Quick-Start (PDF + PNG) | Everyday onboarding cheat sheet; Tier 1-3 starter routing. |
| `GF-GDE-03` | `guide/field-safe-checklist.html` | 1-page Pre-Publish Security Checklist (PDF + PNG) | Mandatory pre-publish gate; prints Pacific business hours & off-hours routing. |
| `GF-GDE-04` | `guide/four-environment-survival-proof.html` | 2-page Print/Copier/Multilingual Proof (PDF + PNG) | Proves B&W copier, Ink-Neutral fallback, 6 scripts, and Spanish text expansion. |
| `GF-TPL-01` | `templates/prayer-card-restricted-master.html` | 4x6 duplex restricted prayer card (trim + bleed PDF) | **Tier 2/3 photo-free master**; cross-free front, GF mark on back only, tier-neutral PDF title. |
| `GF-TPL-02` | `templates/prayer-card-public-variant.html` | 4x6 duplex public prayer card (trim + bleed PDF) | **Tier 1 public**; shares identical front skeleton with `GF-TPL-01`. |
| `GF-TPL-03` | `templates/local-ministry-welcome-and-endorsement.html` | 2-page Autonomous Local Ministry Welcome (PDF) | Peer local-leader welcome; **Local Elders Write First** co-authoring card (`SYNTH-VETO-002`). |
| `GF-TPL-04` | `templates/worker-prayer-letter-kit.html` | 2-page Joyful & Rest-Month Worker Letters (PDF) | Proves Health Above Results rest-month & No-Send options. |
| `GF-TPL-05` | `templates/annual-report-2025-spread.html` | 2-page 2025 Open Books & Witness Spread (PDF) | Separates `$251.6k` ops from funding lines; embeds `GF-PHO-02` (CC0 1.0). |
| `GF-TPL-06` | `templates/church-partnership-and-sunday-kit.html` | 2-page Church Brief & Sunday Kit (PDF) | Page 1 Church Brief; Page 2 livestream-safe pulpit script & Sunday tools. |
| `GF-TPL-07` | `templates/faith-on-the-frontlines-and-candidate-kit.html` | 2-page Gathering Invite & Candidate Brief (PDF) | Living-room invite + 6-Question Candidate Decision Brief & readiness worksheet. |
| `GF-TPL-08` | `templates/bridge-project-letter-and-email.html` | Responsive Bridge Project Welcome Email (HTML + 6 PNGs) | Zero-`<img>` live-text email (desktop, `320px`, `375px`, images-off, dark mode). |
| `GF-TPL-09` | `templates/donor-stewardship-and-hard-news-email.html` | Stewardship & Pastoral Hard-News Emails (HTML + 6 PNGs) | Zero-`<img>` emails; Template B lock-screen-safe with zero fundraising ask. |
| `GF-TPL-10` | `templates/presentation-deck.html` | 8-slide 16:9 Church/Partner Deck (PDF + `.txt`) | **Tier 1 Public only**; Slide 1 embeds `GF-PHO-01`; Slide 5 is collective livestream prayer only. |
| `GF-TPL-11` | `templates/social-and-og-kit.html` | 8 Social/OG/Photo-Story/Q&A Carousel PNGs | **Tier 1 Public only**; pair with `GF-SCR-05` photo credits; never post Tier 2/3 details. |
| `GF-TPL-12` | `templates/member-care-and-stationery.html` | 1-page Public Stationery & Dual Travel Cards (PDF) | Includes zero-GF-brand Restricted Travel Card; confidential care moved to `GF-TPL-18`. |
| `GF-TPL-13` | `templates/support-staff-and-consent-kit.html` | 2-page Support Staff Brief & Supporter Reference (PDF) | Page 1 support-staff funding pathways; Page 2 existing supporter quick reference. |
| `GF-TPL-14` | `templates/mobile-note-and-video-kit.html` | 3-page Mobile Prayer Notes + Video Spec (PDF + 3 PNGs + 3 `.txt`) | **DUAL-TIER WARNING:** Pages 1 & 3 = **Tier 2/3 encrypted chat cards & EN/TH/AR `.txt` twins**; Page 2 = **Tier 1 Public** video storyboard (`GF-VID-01`). Never send Page 2 to Tier 3 channels. |
| `GF-TPL-15` | `templates/revocable-consent-form.html` | 2-page Standalone Revocable Consent Form (PDF) | Store signed copies **strictly outside Git** (`OVR-14`); split recorded vs. livestream checkboxes. |
| `GF-TPL-16` | `templates/local-only-zero-attribution-sheet.html` | 1-page English Level 4 Local-Only Sheet (PDF) | **Level 4 Zero-Attribution:** 100% self-contained, zero GF branding/fonts/metadata. |
| `GF-TPL-17` | `templates/sunday-bulletin-insert-half-letter.html` | 1-page Half-Letter B&W Bulletin (`5.5x8.5in` PDF) | Pure `#000000` black church copier master. |
| `GF-TPL-18` | `templates/member-care-journal-confidential.html` | 1-page Confidential Member Care Journal (PDF) | **Internal Confidential Only:** Never publish on public website or bundle with stationery. |
| `GF-TPL-19` / `19B` | `templates/arabic-first-local-brief.html` & `-translator-notes.html` | 1-page pure-Arabic RTL Level 4 Brief + separate English Translator Reference | **Level 4 (`19`)** has zero English/GF branding + `GF-SCR-04` twin; **`19B`** is internal-only (`OVR-11`). |
| `GF-TPL-20` | `templates/bridge-kids-drawing-and-prayer-sheet.html` | 1-page Pure-Black Bridge Kids Sheet (PDF) | Family drawing & prayer copier sheet; first-name-only child safety rule. |
| `GF-TPL-21` | `templates/donor-lifecycle-and-receipt-kit.html` | 2-page Donor Lifecycle & Receipt Kit (PDF) | Paired with Finance `.docx` starter (`OVR-22`). |
| `GF-TPL-22` | `templates/church-elders-vetting-packet.html` | 2-page Elders' Vetting Packet (PDF) | Byte-exact 8-article Statement of Faith (`foundations.md:76-83`) + 2025 open books. |
| `GF-TPL-23` | `templates/exposure-trip-host-agreement.html` | 2-page Exposure Trip Host Agreement (PDF) | Side A / Side B sign-off with unconditional local-host veto & safeguarding row. |
| `GF-TPL-24A` / `24B` | `templates/candidate-and-support-raising-kit.html` & `staff-onboarding-and-dual-tier-signatures.html` | Public Candidate Kit (`24A`, 2p) + Internal Onboarding & Signatures (`24B`, 1p) | Keep **`24B`** strictly internal (never expose as a public download). |
| `GF-TPL-25` | `templates/bridge-matched-household-welcome-guide.html` | 1-page Bridge Welcome Guide (PDF) | Matched-household onboarding, privacy habits, and equal right to pause. |
| `GF-PHO-01`..`06` | `photography/gf-street-*.jpg` & `PHOTO-LICENSES.md` | 6 `1600x1067` sRGB zero-ShareAlike street photos | **Tier 1 Public only:** Always preserve CC credit URL + non-congregation disclaimer[^visual-identity]. |
| `GF-VID-01` | `exports/video/living-nearness-prayer-vertical.mp4` (+ `.vtt`, `.txt`, poster) | `25.00s` `1080x1920` BT.709 H.264/AAC vertical video + 10-cue WebVTT | **Tier 1 Public Social & Lobby ONLY** (embeds `GF-PHO-01` & GF mark; NEVER Tier 3). |
| `GF-SCR-01`..`05` | `exports/{candidate-first-call-message,bridge-voice-note-script,presentation-deck-multilingual-text,arabic-first-local-brief-twin,social-photo-credits}.txt` | 5 plain UTF-8 operational scripts & twins | `GF-SCR-01` is public candidate inquiry ONLY (NEVER use for Tier 3 mobile notes; use `GF-TPL-14` twins). |
| `GF-AST-OFFICE-*` (6) | `office/{worker-prayer-letter-public-starter,worker-prayer-letter-restricted-starter,local-only-meeting-sheet-starter,local-fellowship-brief-arabic-rtl-starter,donor-receipt-and-redesignation-starter}.docx` & `global-fellowship-deck-starter.pptx` | 6 editable Word/PowerPoint/Google Workspace starters | Pick tier FIRST: public `.docx` & `.pptx` = Tier 1 ONLY (no restricted `.pptx` by design); restricted `.docx` = Tier 2/3 zero-logo; Level 4 EN/AR `.docx` = zero-attribution; Finance `.docx` = manual fill-in. |
| `GF-AST-LOGOS-*` & `PATTERNS-*` | `logos/svg/` (15), `logos/png/` (19), `logos/mark-spec-sheet.html`, `patterns/` (9) | SVGO-clean marks, lockups, favicons, avatars, fallback plates | See [Visual Identity](../brand/visual-identity.md) for clear space, monochrome Apricot rule, and Tier 3 mark bans[^foundations]. |
| `GF-AST-TOKENS-*` | `tokens/{tokens.json,brand-tokens.css,contrast-report.json,FONT-LICENSES.md}` & `tokens/fonts/` (76 WOFF2s + `OFL-1.1.txt`) | W3C DTCG tokens, WCAG report, locally vendored SIL OFL fonts | Single visual source of truth; bridge into `src/app/globals.css` only during website construction (`OVR-24`). |
