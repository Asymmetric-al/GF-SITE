---
title: Cross-Cultural Adaptation, Localization, and Translation Governance
description: Rules for regional-first authorship, Foundation back-translation, multilingual script typography, text expansion headroom, and cultural color fallbacks.
type: Playbook
status: draft
tags:
  - cross-cultural
  - translation
  - localization
  - multilingual
  - regional
x-gf-approval-state: delegated-working-guidance
x-gf-disclosure: public
generated:
  by: antigravity/gemini-4-neon
  at: "2026-11-23T06:55:00Z"
verified: []
sources:
  - id: foundations
    resource: /brand/foundations.md
    title: Official translation and back-translation requirement for Protected Foundations
  - id: visual
    resource: /brand/visual-identity.md
    title: Locally vendored SIL OFL Noto multilingual script family
  - id: open-verification
    resource: /references/open-verification-register.md
    title: Native regional leader review gate (OVR-11)
---

# Cross-Cultural Adaptation, Localization, and Translation Governance

A polycentric fellowship (`Global coordinates. Regional contextualizes. Local leads.`) cannot treat English as the only serious language of the brand. Regional teams author in their working language first and adapt faithfully across scripts and cultural contexts.

## 1. Official Translation Protocol for Protected Foundations

The verbatim lock in [Protected Foundations](../brand/foundations.md) governs English text[^foundations]. For every non-English working language (e.g., Bengali, Thai, Arabic, Spanish, Russian, Serbian, Albanian, Mandarin):

1. **Regional authorship:** A regional leader and fluent local believers draft natural vernacular Christian speech (never raw machine translation).
2. **Independent back-translation:** A second fluent reader back-translates independently into English to verify zero doctrinal or substantive drift (preserving all 3 pillars, the 30-minute prayerful vision framing, and both local leadership and cross-cultural sending).
3. **Explicit labeling:** Label the approved wording `Official [Language] Translation of Global Fellowship's Mission / Vision / Pillars`, dated and recorded regionally.

## 2. Regional-First Authorship Workflow

- **Draft in the working language first** whenever natural rather than forcing local leaders into English first.
- When Home Office adapts a regional piece into English for North American churches, **the originating regional leader holds final approval** to edit, soften, or decline publication.

## 3. Multilingual Layout, Script & Expansion Standards

All bundled multilingual fonts are SIL OFL 1.1 and locally vendored in `brand-kit/tokens/fonts/` (`FONT-LICENSES.md`)[^visual]:

- **Text expansion (`+15%` to `+40%`):** Never lock buttons, datelines, headers, or slide titles into fixed-width boxes that clip in Spanish, French, Russian, or Bengali.
- **Script line-heights & engineering:**
  - **Thai (`Noto Sans Thai`):** Minimum `1.82` body line-height so stacked tone marks and vowels never clip.
  - **Devanagari (`Noto Sans Devanagari`):** Minimum `1.80` line-height.
  - **Bengali (`Noto Serif/Sans Bengali`) & Arabic (`Noto Sans Arabic` primary, `Noto Naskh Arabic` secondary):** Minimum `1.78` line-height. For Arabic, apply logical RTL mirroring (`dir="rtl"`, `margin-inline-start` / `border-inline-start`), wrap embedded Western numerals (`1989`, `2026`, `121:8`) in `<bdi dir="ltr">`, never apply positive `letter-spacing` to connected glyphs, preserve UTF-16BE logical `/ActualText` tags on Arabic PDFs, and ship logical-order UTF-8 plain-text twins (`exports/mobile-prayer-note-arabic-twin.txt`, `exports/arabic-first-local-brief-twin.txt`).
  - **Simplified Chinese (`Noto Sans SC`):** Minimum `1.72` line-height (full upstream `notofonts/noto-cjk` authoring path documented in `FONT-LICENSES.md`).
  - **Cyrillic (`Source Serif 4` / `Noto Serif` / `Noto Sans`):** Native SIL OFL Cyrillic support across print and slides.
  - **PDF `/Lang` tags:** Tag every non-English passage with its BCP 47 language code (`th`, `ar`, `bn`, `ru`, `hi`, `zh`, `es`).
- **Idiom & pronoun audit:** Replace U.S.-specific idioms (`"pull up a chair"` in floor-seating cultures, sports metaphors) with locally natural hospitality, and ensure `"we"` means the whole worldwide fellowship rather than California speaking about Asia or Africa.

## 4. Cultural Color Safety & Honest Proof Status (`OVR-11`)

Living Nearness v15.0 palette choices remain proposed pending native regional leader review (`OVR-11`)[^open-verification]. Wherever a regional team prefers zero chromatic accent, switch immediately to **Ink-Neutral Fallback** (`#16191C` or `#000000` on Warm Paper/White), or use Level 4 Zero-Attribution masters (`GF-TPL-16`, `GF-TPL-19`, and Level 4 `.docx` starters) where foreign association creates risk.

All non-English cards rendered in `brand-kit/` (including `GF-GDE-04`, `GF-TPL-14`, and `GF-TPL-19`) are **technical typography and layout proofs only** until native regional leaders review phrasing, Arabic congregation/elder vocabulary (`الجماعة المحلية` / `الشيوخ`), cultural color fit, and official back-translations (`OVR-11`).
