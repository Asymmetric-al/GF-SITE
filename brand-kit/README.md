# Global Fellowship Brand Kit (`brand-kit/`)

**Approval Status:** Completed Brand System & Knowledge Release Candidate (`v15.0`, Living Nearness; delegated organizational completion ready for human leadership approval under `OVR-15`). Public website construction remains strictly separated into the next phase (see [Website Construction Handoff](../knowledge/references/website-builder-handoff.md) and `OVR-24`).  
**Canonical Brand Rules:** Read [knowledge/brand/brand-on-a-page.md](../knowledge/brand/brand-on-a-page.md), [knowledge/brand/foundations.md](../knowledge/brand/foundations.md), and [knowledge/references/source-coverage-and-decisions.md](../knowledge/references/source-coverage-and-decisions.md) (or run `bun run okf:scan`).

## 5 Common Everyday Tasks (Default Starter + Safety Rule)

Global Fellowship's complete kit covers 27 templates and 6 Office starters; most lean-staff daily requests start from one of five core tools:

1. **Daily Reference:** `guide/brand-on-one-sheet.html` (1-page rules, colors, fonts & Tier 1–3 routing)
2. **Safety Gate:** `guide/field-safe-checklist.html` + `templates/revocable-consent-form.html` (sign & store outside Git before publishing)
3. **Worker Letters:** `office/worker-prayer-letter-public-starter.docx` (Tier 1) OR `office/worker-prayer-letter-restricted-starter.docx` (Tier 2/3 zero-logo)
4. **Church & Partner Slides (Tier 1 Public Only):** `office/global-fellowship-deck-starter.pptx` (8 slides synced with `GF-TPL-10` + embedded street photo; no restricted Tier 2/3 `.pptx` exists by design because Tier 2/3 household details are never projected on slides; use Slide 5 strictly for Tier 1 anonymous collective prayer, and use `worker-prayer-letter-restricted-starter.docx` / `GF-TPL-01` / `GF-TPL-14` for vetted offline Tier 2/3 sharing)
5. **Donor Care & Receipts:** `office/donor-receipt-and-redesignation-starter.docx` (manual fill-in Finance letters)

Everything else in `brand-kit/` (Arab/Thai localized sheets, social PNGs, video, press-bleed prayer cards, elders' vetting packet) stays organized below when a specific need arises.

## 60-Second Staff Quick-Start (Pick Security Tier First · No Design Software Needed)

**Worked 1-Step Example (Tier 2/3 Quarterly Update):**

- **Audience & Tier:** Vetted prayer partners + Tier 3 Withheld.
- **Starter File:** `office/worker-prayer-letter-restricted-starter.docx` (zero logo, zero GF name/EIN).
- **Approval Owner:** Field household + Regional Director (`GF-TPL-15` consent).
- **Stop Rule:** Remove specimen text only after consented words replace placeholders; if strained, send a 1-sentence rest note or skip this month.

1. **Pick the Security Tier FIRST (before opening any file or adding any logo):**
   - **Tier 1 (Open Public Region ONLY):** Open `office/worker-prayer-letter-public-starter.docx` for letters or `office/global-fellowship-deck-starter.pptx` for church/partner slides in Word, PowerPoint, LibreOffice, or Google Workspace.
   - **Tier 2 (Partial / Alias) or Tier 3 (Withheld):** Open `office/worker-prayer-letter-restricted-starter.docx` (zero Global Fellowship logo, name, California address, or EIN; collective-only safe default). Never add the Cross-in-Oval mark to Tier 2/3 letter covers, restricted prayer-card fronts (`GF-TPL-01`), or travel cards.
   - **Level 4 (Local-Only Zero-Attribution Ministry):** Print from `templates/local-only-zero-attribution-sheet.html` (`GF-TPL-16`) or `templates/arabic-first-local-brief.html` (`GF-TPL-19`), or edit `office/local-only-meeting-sheet-starter.docx` or native RTL Arabic `office/local-fellowship-brief-arabic-rtl-starter.docx` (zero GF name, mark, EIN, media, or hidden author metadata).
2. **Pick the Right Logo File (Tier 1 & Public Back-of-Card Only):**
   - **Black-and-white church copier:** `logos/png/gf-lockup-horizontal-black-2x.png` (pure `#000000`; vector master: `logos/svg/gf-lockup-horizontal-black.svg`).
   - **Light Warm Paper / Google Docs:** `logos/png/gf-lockup-horizontal-2x.png` (Harbor Teal + Kiln Clay; light square avatar: `logos/png/gf-avatar-light-512.png`).
   - **Harbor Night (`#0B272E`) slide/cover:** `logos/png/gf-lockup-horizontal-reversed-2x.png` (Warm Paper + Candle Apricot).
   - **Candle Apricot (`#F2B488`) hospitality band:** `logos/png/gf-lockup-horizontal-mono-2x.png` (Charcoal Ink `#16191C` at `9.80:1` AAA; never place a warm-arc lockup on Candle Apricot).
3. **Fonts & Core HEX Palette (Pending Regional Review `OVR-11` · `40/40` WCAG 2.2 AA/AAA):**
   - **Fonts:** Enable free **Source Serif 4** (optical editorial display including `96px` monument scale, stories, prayer cards, Scripture, local elders' words) and **Plus Jakarta Sans** (Open Books tabular data, wordmark, UI labels) via Google Docs/Slides `More fonts` (100% SIL OFL 1.1), or keep the built-in `Georgia` and `Calibri` offline Office fallbacks (non-Latin Workspace fonts: `Noto Sans Arabic`, `Noto Sans Thai`, `Noto Serif Bengali`, `Noto Sans Devanagari`, `Noto Sans SC`).
   - **Core HEX:** **Harbor Teal `#0C525C`** (`8.27:1` AAA), **Harbor Night `#0B272E`** (unified dark ground for covers, video, dark web & dark emails, `14.62:1` AAA), **Kiln Clay `#7E3119`** (2 Cor 4:7 earthenware warmth, right mark arc on daylight paper & Local Edit mark, `8.40:1` AAA), **Candle Apricot `#F2B488`** (dark-ground right mark arc & hospitality bands strictly with Charcoal Ink at `9.80:1` AAA), **Charcoal Ink `#16191C`** (`16.51:1` AAA), **Warm Paper `#FAF7F2`** (`#FFFFFF` on copiers), and **Warm Linen `#F1ECE3`**. Where local leaders prefer zero chromatic accent, switch to **Ink-Neutral Fallback** (`#16191C` on `#FAF7F2`, `OVR-11`).
4. **Before Printing or Sharing:**
   - Complete the 1-page [Before You Publish Checklist](guide/field-safe-checklist.html).
   - Store signed [Revocable Consent Forms](templates/revocable-consent-form.html) strictly outside Git (`OVR-14`).
   - Derive commercial CMYK separations from the printer's ICC profile with physical press/copier proofs (`OVR-18`).

## Directory Map (Full File & SHA-256 Inventory in [manifest.json](manifest.json) & [Asset Index](../knowledge/references/asset-index.md))

| Directory | What Lives Here |
| --- | --- |
| [guide/](guide/brand-guide-book.html) | 4 printable guides: **7-page `brand-guide-book.html`** (street-photo Cover, Foundations + timeline, neutral `[Local Congregation Name]` + Thai Level 3 lockup, `96px` monument type spec, **Page 5 Complete 6-Photo Vault Contact Sheet & Pixel-Verified AAA Scrim Proof**, unboxed multi-register Local Edit + photo-free parity, and V15 release directory), task-first 1-page `brand-on-one-sheet.html`, 1-page `field-safe-checklist.html`, and 2-page `four-environment-survival-proof.html`. |
| [photography/](photography/PHOTO-LICENSES.md) | **6 cohesive, sRGB-normalized, EXIF/COM-stripped, zero-ShareAlike (`4 CC0 1.0` + `2 CC BY 2.0`) documentary street photographs (`GF-PHO-01..06`)** replacing generic vector illustrations on flagship brand surfaces (`brand-guide-book.html`, `annual-report-2025-spread.html`, `presentation-deck.html` & `.pptx` Slide 1, `social-and-og-kit.html` OG & `#card-photo-story`, `mark-spec-sheet.html`, and Tier 1 `GF-VID-01` Beat 2), with SHA-256 verification, zero-metadata binary audit, CC license URLs, Three-Path Sourcing Rule, and Editorial Rejection Log in `PHOTO-LICENSES.md`. |
| [templates/](templates/prayer-card-restricted-master.html) | 27 editable templates (`GF-TPL-01` to `GF-TPL-25`, including split `19`/`19B` and `24A`/`24B`): warm `178px` cross-free architectural 4x6 duplex prayer cards (trim + `0.125in` bleed, tier-neutral PDF `/Title`), local ministry welcome brief, joyful & rest-month worker prayer letters, 2025 Annual Report spread (with `gf-street-shared-bread.jpg`), church partnership & Sunday kit, Faith on the Frontlines & candidate brief, pure live-text zero-`<img>` emails, 16:9 8-slide deck (`brand-deck-data.ts` -> `build-presentation-deck.ts`), 8 exact-dimension social/OG/Photo-Story/Q&A Carousel PNGs + `social-photo-credits.txt`, public stationery (`GF-TPL-12`), confidential Member Care Journal (`GF-TPL-18`), support staff & supporter reference, 3-page EN/TH/AR mobile prayer notes + rendered 30s Audio-First Waveform Spec, 2-page consent form, Level 4 zero-attribution sheet, pure-black Sunday bulletin, **1-page 100% pure-local Arabic Level 4 Brief (`GF-TPL-19`)** + **separate English Translator Reference (`GF-TPL-19B`)**, Bridge Kids sheet (`GF-TPL-20`), daylight-header Donor Lifecycle Kit (`GF-TPL-21`), daylight-header Elders' Vetting Packet (`GF-TPL-22`, strict byte-exact ASCII 8-article Statement of Faith), daylight-header Host Agreement (`GF-TPL-23`), daylight-header Candidate & Ethical Support-Raising Kit (`GF-TPL-24A`), daylight-header Internal Onboarding & Signatures (`GF-TPL-24B`), and Warm Linen Bridge Welcome Guide (`GF-TPL-25`). |
| [office/](office/worker-prayer-letter-public-starter.docx) | 6 ready-to-edit OOXML starters (`v15.0`, hydrated dynamically from `tokens.json`): Tier 1 public `.docx`, Tier 2/3 zero-logo `.docx`, Level 4 zero-attribution `local-only-meeting-sheet-starter.docx`, **pure-Arabic RTL `local-fellowship-brief-arabic-rtl-starter.docx`** (pure Arabic `docProps/core.xml` & pure-local prose matching `GF-TPL-19`), **Finance manual fill-in `donor-receipt-and-redesignation-starter.docx`**, and 8-slide 5-layout `.pptx` synced 100% with `scripts/brand-deck-data.ts` (**including embedded Slide 1 street photo `GF-PHO-01`**). |
| [logos/](logos/mark-spec-sheet.html) & [patterns/](patterns/editorial-aperture-script-plate.svg) | 15 vector-outlined SVGs (`140:101` Cross-in-Oval + integer-pixel-snapped `16px` adaptive optical favicons preserving `@media (prefers-color-scheme: dark)`), 19 exact PNGs (`gf-mark-reversed-512.png`, `gf-mark-harbor-512.png`, unified 2-color avatars), 9 pure-vector photo-free fallback/pattern/scrim SVGs, plus `mark-spec-sheet.png` (`1.65px` GF icons & `GF-PHO-01` attribution). |
| [tokens/](tokens/FONT-LICENSES.md) | Canonical strict W3C DTCG 2025.10 `tokens.json` (`v15.0-draft`, 100% SIL OFL with zero proprietary fonts), generated `brand-tokens.css`, `contrast-report.json` (`40/40` WCAG 2.2 light+dark+deuteranopia pairs PASS), 76 locally vendored SIL OFL 1.1 WOFF2 fonts, `OFL-1.1.txt`, `font-checksums.json`, and 100% original icon & font licensing provenance in `FONT-LICENSES.md`. |
| [exports/](exports/video/living-nearness-prayer-vertical.mp4) | All rendered PDFs (`30/30` tagged SIL OFL 1.1 with repaired ASCII & UTF-16BE outline titles, tier-neutral `/Info` `/Title` metadata, & per-block logical Arabic `/ActualText`), high-DPI PNGs, unwrapped 1-to-1 EN/TH/AR plain-text mobile twins, 5 plain-text operational scripts/twins (including `social-photo-credits.txt`), and playable **Tier 1 Public** `25.00s` (`750f @ 30fps`, full BT.709 + 48kHz stereo AAC warm ambient harmonic bed) vertical MP4 integrating Beat 2 documentary street photography (`GF-PHO-01`) & Host Stop-Authority consequence + 10-cue WebVTT captions + full-text transcript. |

## Rebuild & Verification Commands

- Tokens, contrast audit & `visual-identity.md` sync: `bun scripts/generate-brand-tokens.ts`
- Vector marks, bespoke editorial plates, patterns, PNGs & mark spec sheet: `bun scripts/build-brand-marks.ts`
- HTML presentation deck (`GF-TPL-10` from `brand-deck-data.ts`): `bun scripts/build-presentation-deck.ts`
- Office `.docx` (Public, Restricted, Level 4 English, Level 4 Arabic RTL) & `.pptx` starters: `bun scripts/build-office-starters.ts`
- 25.00s 30fps full BT.709 Local-Voice-First vertical motion MP4, 10-cue WebVTT captions, transcript & poster: `bun scripts/build-brand-video.ts`
- Full export & 6-gate verification (`G1`–`G6` + `manifest.json` SHA-256 sync): `bun run verify:brand`
