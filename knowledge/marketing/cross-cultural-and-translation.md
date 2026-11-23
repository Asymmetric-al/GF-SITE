---
title: Cross-Cultural Adaptation, Localization, and Translation Governance
description: Practical rules enabling regional teams across Asia, Europe, MENA, and the Americas to author, translate, typeset, culturally review colors, and locally govern Global Fellowship materials without Western idioms or broken scripts.
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
  at: "2026-11-22T06:00:00Z"
verified: []
sources:
  - id: foundations
    resource: /brand/foundations.md
    title: Official translation and back-translation requirement for Protected Foundations
  - id: visual
    resource: /brand/visual-identity.md
    title: Locally vendored SIL OFL Noto multilingual script family and non-Latin line-height standards
  - id: open-verification
    resource: /references/open-verification-register.md
    title: Native regional leader review gate (OVR-11)
---

# Cross-Cultural Adaptation, Localization, and Translation Governance

A polycentric fellowship (`Global coordinates. Regional contextualizes. Local leads.`) cannot treat English as the only serious language of the brand. This guide equips regional teams to author locally first and adapt faithfully across languages and visual contexts.

## 1. Official Translation Protocol for Protected Foundations

Global Fellowship's verbatim guarantee governs the official English text of the Mission Statement, Vision Statement, and Three Pillars[^foundations]. For every non-English working language (for example, Bengali, Thai, Arabic, Spanish, Russian, Serbian, Albanian, Mandarin):

1. **Regional authorship:** A regional leader and fluent local believers draft the translation into natural, dignified vernacular Christian speech (never literal word-for-word machine translation).
2. **Independent back-translation:** A second fluent reader translates the draft back into English independently to confirm zero doctrinal or substantive drift (preserving all 3 pillars, the exact 30-minute prayerful vision framing, and both local leadership and cross-cultural sending).
3. **Explicit labeling:** Publish the regionally approved version labeled `Official [Language] Translation of Global Fellowship's Mission / Vision / Pillars`, dated and recorded by the regional team.

## 2. Regional-First Authorship Workflow (Reversing Headquarters Gravity)

When a regional team publishes a prayer card, local ministry welcome brief, or field story:

- **Author in the working language first** whenever natural, rather than forcing local leaders to write in English first.
- When Home Office adapts a regional piece into English for North American churches, **the originating regional leader retains final approval** over the English adaptation, including the authority to soften wording, remove details, or decline release.

## 3. Multilingual Layout, Script & Expansion Engineering

All **76** required SIL OFL 1.1 font files (including `Noto Serif` for standalone Level 4 local sheets) are locally vendored inside `brand-kit/tokens/fonts/` so offline regional print and PDF rendering never drifts from web previews[^visual]:

- **Text expansion headroom (`+15%` to `+40%`):** Languages such as Spanish, French, Russian, and Bengali frequently run 15% to 40% longer than concise English (especially on short UI buttons and labels). Never lock buttons, datelines, prayer card headers, or slide titles into tight fixed-width boxes that clip when translated (verified across a faithful English vs. Spanish `+15%` overall / `+30%` CTA expansion stress test in `four-environment-survival-proof.html`).
- **Script-specific vertical clearance & PDF accessibility tags:**
  - **Thai (`Noto Sans Thai`, Chiang Mai hub):** Set body line-height to `1.82` minimum so stacked tone marks and above/below vowels never collide; keep regional hub lockups crisp on one line.
  - **Bengali (`Noto Serif Bengali` / `Noto Sans Bengali`, South Asia):** Set line-height to `1.78` minimum so _matra_ headlines and conjunct vowels render cleanly.
  - **Arabic (`Noto Naskh Arabic` / `Noto Sans Arabic`, MENA):** Use full logical RTL mirroring (`dir="rtl"`, logical CSS `margin-inline-start` / `border-inline-start` so left rules flip automatically to the right edge), isolate embedded Western numerals (`1989`, `2026`, `121:8`) with `<bdi dir="ltr">`, set line-height `1.78` (verified end-to-end in the Arabic RTL prayer-reply workflow on Page 2 of `four-environment-survival-proof.html`), and never apply positive `letter-spacing` to connected Arabic glyphs. Every Arabic-bearing PDF (`GF-GDE-01`, `GF-GDE-04`, `GF-TPL-10`, `GF-TPL-14`, `GF-TPL-19`) receives UTF-16BE logical `/ActualText` tags via `scripts/pdf-postprocess.ts`; for copy-paste encrypted chat distribution or multi-reader fidelity, always supply the exact logical-order UTF-8 plain-text twins (`exports/mobile-prayer-note-arabic-twin.txt` and `exports/arabic-first-local-brief-twin.txt`) alongside printable PDFs.
  - **Devanagari (`Noto Sans Devanagari`, South Asia) & Simplified Chinese (static `Noto Sans SC` weights `400` and `700`, East Asia; pinned upstream `notofonts/noto-cjk` full-set authoring path in `FONT-LICENSES.md`):** Set line-height to `1.80` for Devanagari vowel stacks and `1.72` for Simplified Chinese paragraphs (matched identically in `four-environment-survival-proof.html`).
  - **Cyrillic (`Source Serif 4` / `Noto Serif` reading & display, `Noto Sans` UI, Russian `Евангелие`):** Uses native SIL OFL Cyrillic glyphs cleanly across `Source Serif 4`, `Noto Serif`, and `Noto Sans`, with explicit `Noto Serif` `<a:r>` font runs wired into Slide 4 of `global-fellowship-deck-starter.pptx`.
  - **Multilingual PDF `/Lang` tagging:** Verify every non-English PDF passage carries its exact BCP 47 `/Lang` tag (`th`, `ar`, `bn`, `ru`, `hi`, `zh`, `es`) for screen-reader fidelity.
- **Idiom & Pronoun Audit:**
  - Replace U.S.-specific idioms (`"pull up a chair"` where floor seating is normal, `"keep your wallet closed"`, sports metaphors) with locally natural hospitality phrasing.
  - Audit every `"we"` and `"they"`: ensure `"we"` means the whole worldwide fellowship rather than a California office speaking about Asia or Africa.

## 4. Global Cultural Color Safety & Ink-and-Paper Fallback (`OVR-11`)

Living Nearness v15.0 retired legacy blue-and-yellow completely in favor of **Harbor Teal (`#0C525C`)**, **Harbor Night (`#0B272E`)**, **Kiln Clay (`#7E3119`)**, **Candle Apricot (`#F2B488`)**, **Warm Paper (`#FAF7F2`)**, and **Charcoal Ink (`#16191C`)**, designed to avoid specified corporate and regional flag combinations (green primary, saffron orange, blue-plus-yellow, royal purple, and red-beside-cross); actual local associations are assessed by regional reviewers under `OVR-11`[^open-verification]. Wherever a regional team prefers zero color accent, they switch immediately to the **Ink-Neutral Fallback** (`#16191C` Charcoal Ink or `#000000` pure black on `#FAF7F2` / `#FFFFFF` paper), or Level 4 Zero-Attribution `GF-TPL-16`, `GF-TPL-19` (`arabic-first-local-brief.html`), `office/local-only-meeting-sheet-starter.docx`, and `office/local-fellowship-brief-arabic-rtl-starter.docx` where foreign organizational association itself creates risk.

## 5. Honest Transparency on Untested Assumptions

All non-English layout proofs rendered inside `brand-kit/guide/four-environment-survival-proof.html` (faithful Spanish `+15%` overall / `+30%` CTA stress test, Thai, Arabic RTL with `<bdi dir="ltr">` numerals and full RTL-mirrored Locked Foundation block, Bengali, Devanagari, static Simplified Chinese, and Russian Cyrillic in `Source Serif 4`) are **technical typographic and layout proofs only** until fluent native readers and Global Fellowship regional leaders review phrasing, tone, cultural color resonance, and official back-translations (`OVR-11` in [Open Verification Register](../references/open-verification-register.md))[^open-verification].
