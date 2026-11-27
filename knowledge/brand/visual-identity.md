---
title: Global Fellowship Visual Identity and Design Direction
description: Living Nearness v15.0 visual system covering the preserved Cross-in-Oval mark, WCAG-verified color tokens, SIL OFL multilingual typography, composition modes, and Three-Path Photography Sourcing Rule.
type: Brand Identity
status: draft
tags:
  - visual-identity
  - logo
  - color
  - typography
  - art-direction
x-gf-approval-state: delegated-working-guidance
x-gf-disclosure: public
generated:
  by: antigravity/gemini-4-neon
  at: "2026-11-27T15:40:00Z"
verified: []
sources:
  - id: foundations
    resource: /brand/foundations.md
    title: Permanent verbatim Mission, Vision, and Three Pillars requiring reserved visual lockup
  - id: asset-index
    resource: /references/asset-index.md
    title: Stable IDs and paths for brand-kit assets, tokens, fonts, photography, and templates
  - id: security
    resource: /policies/field-security-and-disclosure.md
    title: Security-tier photo and non-identifying visual constraints
  - id: source-synthesis
    resource: /references/source-synthesis.md
    title: Supplied official logo master, legacy brand kit audit, and stakeholder visual directives
---

# Global Fellowship Visual Identity and Design Direction

Global Fellowship's **Living Nearness (`v15.0`)** visual system preserves the established **Cross-in-Oval mark silhouette (`140:101`)** while pairing it with a calm editorial palette (proposed pending regional review `OVR-11`), SIL OFL 1.1 multilingual typography, vetted non-ShareAlike documentary street photography on public surfaces, and photo-free parity across restricted contexts[^source-synthesis].

_Machine-readable sources of truth:_ `brand-kit/tokens/tokens.json` -> `scripts/generate-brand-tokens.ts` -> `brand-kit/tokens/brand-tokens.css` & `contrast-report.json`. Complete file paths and checksums live in [Asset Index](../references/asset-index.md) and `brand-kit/manifest.json`[^asset-index].

## 1. Preserved Mark & Lockup Rules

Traced onto a `140 x 101` (`1.386:1`) vector grid from Global Fellowship's official logo master, the mark combines an enclosing oval, chamfered `G`/`F` initials, and a central negative-space cross keeping Jesus Christ central. Per stakeholder direction (2026-11-26), all public website `"Global Fellowship"` logos (`GF-SITE`) set the wordmark in **Rector Medium** (designed by `Hrvoje Živčić`, published by `Production Type`), converted to vector-outlined SVG paths (`src/lib/brand/rector-wordmark.ts`, zero font-binary redistribution in public Git, with author attribution tucked away at `/credits` and commercial `Production Type` logo licensing tracked under `OVR-12`). Existing print and Office lockups in `brand-kit/logos/` retain vector-outlined `Plus Jakarta Sans` Bold paths until leadership harmonizes print and web channels (`OVR-12`, `OVR-15`).

- **Permitted mark variants (`brand-kit/logos/`):**
  - **Daylight primary (`gf-mark-color.svg`, `gf-lockup-horizontal.svg`):** Harbor Teal (`#0C525C`) frame + Kiln Clay (`#7E3119`) right arc on light paper.
  - **Dark-ground reversed (`gf-mark-reversed.svg`, `gf-lockup-horizontal-reversed.svg`):** Warm Paper (`#FAF7F2`) frame + Candle Apricot (`#F2B488`) right arc on Harbor Night (`#0B272E`).
  - **Candle Apricot hospitality surfaces (`gf-lockup-horizontal-mono.svg`):** **Mandatory** Charcoal Ink (`#16191C`, `9.8:1` AAA); never place a warm-arc lockup on Candle Apricot.
  - **B&W church copiers (`gf-lockup-horizontal-black.svg`, `gf-mark-mono-black.svg`):** Pure `#000000` ink on white.
  - **Architecture lockups:** Regional Hub (`gf-lockup-regional-hub.svg`), The Bridge Project (`gf-lockup-bridge-project.svg`), Level 3 Local-Ministry Endorsement (`gf-lockup-endorsement.svg`), adaptive `16px` optical favicons (`gf-mark-favicon-16.svg`), and 2-color `512px` circular avatars.
- **Clear space & minimums:** Maintain `0.5H` clear space on all four sides and never stretch the `140:101` aspect ratio. Minimum widths: `24px` digital / `8mm` print for standalone mark (`16px` favicon tile); `120px` digital / `32mm` (`1.25in`) print for horizontal lockups.
- **Hard restrictions:** Never set Candle Apricot text on light paper, never place Signal Crimson beside the mark, never add drop shadows or gradients, and **never place the mark on Tier 3 prayer-card fronts, restricted worker-letter covers, restricted travel cards, or Level 4 zero-attribution sheets**[^security].

## 2. Color System (`40/40` WCAG 2.2 AA/AAA Light, Dark & Deuteranopia Pairs)

Anchored in **2 Corinthians 4:7** ("treasure in jars of clay"), the palette is designed to avoid common corporate and regional flag combinations; actual regional associations remain subject to native review (`OVR-11`), backed by an **Ink-Neutral Fallback** (`#16191C` on `#FAF7F2`, `16.51:1` AAA). The table below is auto-synced from `brand-kit/tokens/tokens.json`:

<!-- BEGIN:GENERATED-PALETTE-TABLE -->

| Token | CSS Variable | HEX | OKLCH | Permitted Role & Verified Contrast |
| --- | --- | --- | --- | --- |
| **Warm Paper** | `--gf-paper` | `#FAF7F2` | `oklch(0.9771 0.0074 80.7)` | Primary warm editorial paper canvas (zero cold gray glare) |
| **Pure White** | `--gf-surface-card` | `#FFFFFF` | `oklch(1 0 89.9)` | Elevated surfaces, email containers, and monochrome copier print stock |
| **Warm Linen** | `--gf-paper-subtle` | `#F1ECE3` | `oklch(0.9445 0.0132 82.4)` | Reserved Locked Foundations ground, unboxed rails, and table striping |
| **Charcoal Ink** | `--gf-ink` | `#16191C` | `oklch(0.2115 0.0075 248.2)` | Primary reading ink, headlines, wordmark, and text on Candle Apricot (**16.51:1 AAA** on Paper; **9.8:1 AAA** on Apricot) |
| **Harbor Teal** | `--gf-harbor` | `#0C525C` | `oklch(0.4035 0.0655 209.8)` | Signature brand primary, mark G/F frame, Open Books data, buttons, links (**8.27:1 AAA** on Paper; deuteranopia **11.72:1**) |
| **Harbor Night** | `--gf-harbor-deep` | `#0B272E` | `oklch(0.255 0.0357 217)` | Unified dark ground for covers, dark mode, video, and dark emails (**14.62:1 AAA** reversed) |
| **Harbor Elevated** | `--gf-harbor-card` | `#12353E` | `oklch(0.3078 0.0429 217.5)` | Dark-surface card, email container, and popover ground (AAA) |
| **Harbor Surface** | `--gf-harbor-mid` | `#19434E` | `oklch(0.3585 0.0498 217.8)` | Dark-surface muted, secondary, and accent container (AAA with Mist Text) |
| **Kiln Clay** | `--gf-clay` | `#7E3119` | `oklch(0.4183 0.1131 37.5)` | **Daylight mark right arc, Local Edit annotations & Witness warmth** (**8.4:1 AAA** Paper / **7.63:1** Linen; deuteranopia **5.16:1** / **4.74:1**; zero ochre shift) |
| **Candle Apricot** | `--gf-apricot` | `#F2B488` | `oklch(0.8172 0.0929 56.4)` | **Dark-ground mark right arc, dark focus ring (8.68:1 AAA on Harbor Night) & warm hospitality bands (9.8:1 AAA with Charcoal Ink)** |
| **Sea Mist** | `--gf-sea-mist` | `#8CE0E5` | `oklch(0.855 0.0819 200.6)` | Dark-mode structural highlight & link accent (**10.35:1 AAA** on Harbor Night) |
| **Mist Text** | `--gf-mist-text` | `#CDE2E6` | `oklch(0.8984 0.023 210.4)` | Dark-surface secondary prose & `--muted-foreground` (**11.62:1 AAA** Harbor Night; **7.99:1 AAA** Harbor Surface) |
| **Harbor Mist** | `--gf-notice-surface` | `#E9F2F3` | `oklch(0.9547 0.0097 204.9)` | Calm security notices & light `--accent` surface (**15.51:1 AAA** Ink; **7.77:1 AAA** Harbor Teal) |
| **Warm Slate** | `--gf-slate` | `#4B5357` | `oklch(0.4366 0.0122 229.1)` | Footnotes, captions & light `--muted-foreground` (**7.35:1 AAA** on Paper) |
| **Warm Rule** | `--gf-rule` | `#DBD4C9` | `oklch(0.8725 0.0168 79.3)` | Editorial horizontal hairlines and ledger row dividers |
| **Control Border** | `--gf-border-ui` | `#636B6E` | `oklch(0.5219 0.0109 222.2)` | Light-mode interactive input & checkbox borders (**5.09:1**) |
| **Dark Structural Rule** | `--gf-border-dark` | `#6EAAB2` | `oklch(0.7 0.0631 206.5)` | Dark-mode structural dividers & `--border` (**5.99:1** Night / **4.12:1** Surface) |
| **Dark Control Border** | `--gf-input-dark` | `#85BEC6` | `oklch(0.765 0.06 206.9)` | Dark-mode interactive `--input` outlines (**7.57:1** on Harbor Night) |
| **Signal Crimson** | `--gf-crimson` | `#821818` | `oklch(0.3965 0.141 26.5)` | Light-mode validation errors & safety stop alerts only (**9.39:1 AAA**; **5.1:1** deuteranopia) |
| **Coral Alert** | `--gf-crimson-dark` | `#FF9B93` | `oklch(0.7903 0.121 25.1)` | Dark-mode `--destructive` alerts only (**7.71:1 AAA** on Harbor Night; **8.71:1 AAA** with Ink) |
| **Forest Confirm** | `--gf-forest` | `#1B5E3A` | `oklch(0.43 0.0897 155.7)` | Small semantic pass/confirmation badges only (**7.25:1 AAA**; never primary) |

<!-- END:GENERATED-PALETTE-TABLE -->

- **Grayscale & CMYK print rule:** Harbor Teal (`oklch(0.4035 ...)`) and Kiln Clay (`oklch(0.4183 ...)`) share similar luminance; never rely on hue alone to encode separate meaning on monochrome printers. Derive commercial CMYK separations from the printer's ICC profile with physical proofs (`OVR-18`).
- **November 2026 Marketing Brand Kit web palette adaptation (`GF-SITE`, pending `OVR-15`):** Following direct stakeholder adoption of the November 2026 Marketing Brand Kit and contemporary web refinement (`DESIGN.md`), `GF-SITE` adapts the daylight and nocturnal surface palette to luminous Alabaster Ivory (`#FCFAF6`), Gallery White (`#FFFFFF`), Warm Cream (`#F3EDE3`), Deep Navy (`#122A3B`), Petrol Blue (`#08354D`), Muted Gold (`#B28B61`), Dark Bronze (`#614D29`), Warm Deep Bronze (`#47361D`) Member Care plates, unified `#0A1822` dark mode with a subtle footer Light / System / Dark theme switcher (preserving B&W `@media print`), and a prominent centered `Source Serif 4` Three Pillars band (`Church Planting · Local Leadership · Unreached People`) in the footer while preserving Living Nearness tokens in the print/Office brand-kit bundle until leadership harmonizes both channels under `OVR-15`.

## 3. Multilingual Typography (100% SIL OFL 1.1)

All bundled fonts are 100% SIL OFL 1.1 (`76` vendored WOFF2s in `brand-kit/tokens/fonts/`; zero proprietary fallback names in `tokens.json`). Email CSS stacks fall back cleanly to client-resident `Georgia` and `Helvetica Neue / Arial` when email clients block `@font-face`.

- **Witness Display & Reading (`Source Serif 4`):** Optical serif (`opsz` 8-60, SemiBold/Regular/Italic, including `96px` monument scale) leading stories, covers, prayer cards, Scripture, local elders' words, and Locked Foundations.
- **Wordmark (`Rector Medium` on public web build; `Plus Jakarta Sans` Bold in print/Office bundle):** All `"Global Fellowship"` website logos (`SiteHeader`, `SiteFooter`, mobile drawer, error/standalone routes, and OG preview card) render vector-outlined **Rector Medium** (`Hrvoje Živčić` / `Production Type`, author credit tucked away at `/credits`, commercial logo license verification tracked in `OVR-12`) without redistributing commercial font binaries.
- **Open Books, Labels & UI (`Plus Jakarta Sans` in print/Office bundle; `Nunito` `400..700` in public web build):** Bold/SemiBold/Regular with `font-variant-numeric: tabular-nums` on financial tables, forms, labels, and Note cards. Following the November 2026 Marketing Brand Kit web adaptation (`DESIGN.md`), the public website (`GF-SITE`) adopts locally vendored SIL OFL 1.1 `Nunito` (`400..700`) alongside `Source Serif 4` while preserving `Plus Jakarta Sans` in the existing print/Office brand-kit bundle pending unified leadership approval (`OVR-15`).
- **Global Script Siblings:** `Noto Sans` / `Noto Serif` (extended fallback, Cyrillic, and Level 4 zero-attribution sheets), `Noto Sans Arabic` (primary MENA RTL with `Noto Naskh Arabic` secondary), `Noto Serif/Sans Bengali`, `Noto Sans Thai`, `Noto Sans Devanagari`, and static `Noto Sans SC`. See [Cross-Cultural & Translation](../marketing/cross-cultural-and-translation.md) for script line-heights and RTL rules.
- **Hard typography rules:** Never use monospace on public cards/letters (avoids intelligence-dossier feel). Reserve the **Locked Foundation** Warm Linen + stepped Harbor Teal/Kiln Clay double-rule treatment exclusively for verbatim Mission and Vision quotations[^foundations].

## 4. Composition Modes, Local Edit & Iconography

- **Three Composition Modes:**
  1. **Monumental Local Voice:** Editorial cover, Slide 1, OG card, Photo Story, and Carousel 1 pairing `Source Serif 4` display with street photography.
  2. **Quiet Letter:** Uncrowded Warm Paper, hairlines, and stillness for long-form stories, confidential Member Care (`GF-TPL-18`), Arabic-First Brief (`GF-TPL-19`), and Bridge Kids (`GF-TPL-20`).
  3. **Open Books Field Note:** Daylight Warm Linen headers, tabular financial comparisons, maximum one tinted callout per page, and consolidated bottom proof notes.
- **The Local Edit:** Local elders' accepted wording leads first in `Source Serif 4`; when demonstrating editorial veto externally, strike only the quoted outsider draft calmly in Kiln Clay (light) or Candle Apricot (dark). On peer local-welcome documents (`GF-TPL-03`), invite **Local Elders Write First** co-authoring without strikethrough pedagogy.
- **Decorative & icon discipline:** Keep Living Aperture curves (`living-aperture-split.svg`) in open margins (`>= 16px` from live text). Use the cross-free `architectural-frame-dark.svg` header for prayer cards and photo-free pre-consent fallback plates only where photography is excluded. Brand-kit UI icons use GF's original `1.65px` line set (`scripts/brand-icons.ts`); future Next.js UI uses Hugeicons per `DESIGN.md`.

## 5. Art Direction: Three-Path Photography Sourcing & Photo-Optional Parity

Every Global Fellowship surface selects strictly from three photography paths (never uncurated stock faces, never AI-generated people, never generic vector illustrations on public storytelling surfaces)[^source-synthesis]:

1. **Path 1 (Consented Local Photography, Primary Long-Term Standard, `OVR-06`):** Hire local photographers first; shoot eye-level in natural daylight with local elders leading; strip EXIF/GPS metadata; store signed `GF-TPL-15` consent strictly outside Git before publishing real portraits or archived Brand Kit PDF photos.
2. **Path 2 (Vetted Zero-ShareAlike Street Photography Vault, `brand-kit/photography/`, `GF-PHO-01..06`):** For Tier 1 public surfaces prior to Path 1 commissions (`GF-GDE-01`, `GF-TPL-05`, `GF-TPL-10`/`.pptx`, `GF-TPL-11`, `GF-VID-01`), use only the 6 EXIF-stripped, sRGB-normalized, zero-ShareAlike (`4 CC0 1.0` + `2 CC BY 2.0`) documentary frames audited in `brand-kit/photography/PHOTO-LICENSES.md`, always preserving attribution, license URL, and an explicit disclaimer that the street scene does not depict a Global Fellowship congregation.
3. **Path 3 (Photo-Free Typographic Parity, Default for Tier 2/3 & Level 4):** Restricted prayer cards (`GF-TPL-01`), separately cleared Tier 1 anonymous collective livestream prayer (`GF-TPL-10` Slide 5), encrypted mobile prayer twins (`GF-TPL-14`), zero-`<img>` emails (`GF-TPL-08`/`09`), Level 4 handouts (`GF-TPL-16`/`19`), and B&W church bulletins (`GF-TPL-17`/`20`).

- **Photo scrim contrast rule:** Keep natural warm-neutral grading (no desaturated pity grading). On print and Office templates, place overlaid text inside an opaque Harbor Night panel (`rgba(11, 39, 46, 0.96)`, `>= 0.94` opacity) preserving `8.68:1` solid Candle Apricot and `14.62:1` solid Warm Paper (`contrast-report.json`), keeping both colors above WCAG 2.2 AAA (`>= 7:1`) even over worst-case white photo pixels. On the public website (`GF-SITE`, November 2026 web adaptation), full-bleed foreground-masked editorial scenes place a calibrated Deep Navy atmospheric veil (`z-10`) strictly behind pixel-aligned foreground subject cutouts (`z-30`) so subjects remain sunlit while rendered text-over-backdrop contrast is verified automatically against WCAG 2.2 AA pixel luminance thresholds (`>= 4.5:1` eyebrows and portrait canopy headers, `>= 3.5:1` large display headlines).
- **Warm photo-optional card parity:** Public (`GF-TPL-02`) and restricted (`GF-TPL-01`) 4x6 duplex prayer cards share the exact same cross-free Harbor Night architectural header, tier-neutral `WEEKLY PRAYER · 2026` front header, and matching back rule so restricted cards never stand out at arm's length. On restricted cards, place the Cross-in-Oval mark strictly on the back.
- **Banned visual tropes:** Gray silhouettes, blurred faces on portraits or cards, black redaction bars, `"REDACTED"` stamps, padlocks, map pins, and region-coded restricted colors[^security]. _(Narrow stakeholder exception, 2026-11-27: on the `/our-people` hero banner `GF-LIVE-27`, an irreversible whole-frame Gaussian blur paired with an opaque Deep Navy atmospheric veil was explicitly requested to protect sensitive faces in that archival group gathering photograph while retaining warm scene context.)_
