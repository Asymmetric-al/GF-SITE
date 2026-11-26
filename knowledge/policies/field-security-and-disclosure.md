---
title: Field Security and Safe Disclosure Policy
description: Two-axis Identity x Location disclosure governance, livestream vs. recording rules, six anti-mosaic rules, and 60-second step-down protocol.
type: Policy
status: draft
tags:
  - policy
  - security
  - disclosure
  - redaction
  - safety
x-gf-approval-state: delegated-working-guidance
x-gf-disclosure: public
generated:
  by: antigravity/gemini-4-neon
  at: "2026-11-23T06:55:00Z"
verified: []
sources:
  - id: source-synthesis
    resource: /references/source-synthesis.md
    title: Observed protective redaction reality across 12 of 52 archived public profiles
  - id: visual
    resource: /brand/visual-identity.md
    title: Shared photo-optional card skeleton and Architectural Frame graphic system
  - id: withdrawal
    resource: /policies/consent-withdrawal-runbook.md
    title: Single canonical 4-stage emergency removal runbook
---

# Field Security and Safe Disclosure Policy

Nearly a quarter of Global Fellowship's archived public missionary profiles (`12 of 52`) already require protective redactions, aliases, or ministry codes, and regional risk can tighten overnight[^source-synthesis]. Field security is therefore built natively into every template, workflow, and publication rule.

## 1. Two-Axis Disclosure Matrix (Identity x Location + Media)

Clear every profile, card, slide, mobile Note, video, and letter on both axes before publication; **the stricter tier always governs**:

| Axis | Tier 1: Open / Public | Tier 2: Partial / Pseudonym | Tier 3: Restricted / Withheld |
| --- | --- | --- | --- |
| **Identity** | Cleared full public name | First names only, initials, or approved alias (`Family R.`) | Approved ministry code or collective description (`Church Planters`) |
| **Location** | Cleared city and/or country | Broad region only (`Central Asia`, `Southeast Asia`) | Location withheld (tier-neutral `WEEKLY PRAYER · 2026` on card fronts; zero country, city, ethnic, or dialect clues) |
| **Image & Video** | Consented documentary photo/video, vetted street photo (`GF-PHO-01..06`, `GF-VID-01`), or photo-free layout (incl. separately cleared anonymous collective livestream Slide 5) | Metadata-stripped non-identifying detail photo OR photo-free layout | **Photo-free layout ONLY** (`GF-TPL-01` print or `GF-TPL-14` EN/TH/AR plain-text twins in vetted private groups; **NEVER `GF-VID-01`, NEVER recorded or livestreamed, NEVER any photo, face, voice, or place**) |
| **Channels** | Print, email, public website, consented social, recorded/livestreamed church services (with explicit opt-in) | Vetted print, private email, public website at Tier 2 (opaque ID); **NEVER public social**; **NEVER personal details on livestreams** | Private encrypted prayer distribution & vetted print only; **NEVER social media, NEVER Annual Report PDF, NEVER Tier 3 personal details on church recordings or livestreams** |

### Unified Livestream vs. Recorded Church Service Rule

Church services require **two independent opt-ins** on the standalone Revocable Consent Form (`GF-TPL-15`):

1. **Recorded Church Service (Offline Archive Only):** Permitted for Tier 1 and Tier 2 ONLY with separate written opt-in on `GF-TPL-15` (**never Tier 3**). In live Q&A gatherings (`COPY-FOTF-RUN-01`), default to all recording devices off whenever any Tier 2/3 speaker or story is present unless a Regional Director explicitly confirms an offline-only Tier 2 exception in advance.
2. **Livestreamed Public Church Service (YouTube / Facebook / Public Archive):** Permitted **ONLY** for Tier 1 explicit personal opt-ins OR separately cleared **Tier 1 anonymous collective congregation-wide prayer** containing zero worker names, cities, photos, or regional clues (`GF-TPL-10` Slide 5, `GF-TPL-06` pulpit script). Never project Tier 2 or Tier 3 personal details onto any public livestream.

## 2. Six Hard Anti-Mosaic Rules

Hostile officials and scrapers combine minor clues across files ("mosaic effect"). Enforce all six rules without exception:

1. **Stricter tier governs every channel:** Never add a city, child's name, weather/season clue, or denominational tie on a card, chat, or slide that was withheld on the web.
2. **Never aggregate restricted identifiers in public Git:** Public docs record aggregate counts only (`12 of 52`). Store active deny-lists and signed consents **strictly outside Git** (`OVR-14`).
3. **Never encode geography in color or graphics:** Restricted cards use the exact same Living Nearness v15.0 palette and cross-free `architectural-frame-dark.svg` header (or Ink-Neutral fallback under `OVR-11`)[^visual].
4. **Preserve photo-free parity so restricted cards never stand out:** Public (`GF-TPL-02`) and restricted (`GF-TPL-01`) prayer cards share identical tier-neutral front/back geometry (`WEEKLY PRAYER · 2026`). Ban silhouettes, blurred faces, black redaction bars, `"REDACTED"` stamps, padlocks, and map pins permanently.
5. **Strip hidden metadata on every export:** Audit filenames (never `Name_Country_Restricted.pdf`), EXIF/GPS tags, PDF author/title/subject properties, SVG `<title>`/`<desc>`, image `alt` text, and OpenGraph previews.
6. **Home-side vs. Field-side logo isolation:** On Home-side Tier 3 prayer cards (`GF-TPL-01`), keep the Cross-in-Oval mark strictly on the **back**; omit all logos on restricted worker letters (`worker-prayer-letter-restricted-starter.docx`). Keep confidential Member Care (`GF-TPL-18`) strictly separate from stationery (`GF-TPL-12`). On Field-side materials carried across borders or printed inside sensitive nations, use only the unbranded Restricted Travel Card (`GF-TPL-12`) or Level 4 Zero-Attribution masters (`GF-TPL-16`, `GF-TPL-19`, and Level 4 `.docx` starters).

## 3. 60-Second Security Step-Down Protocol

When local safety conditions tighten suddenly:

1. **Step down both axes immediately:** Switch to `GF-TPL-01` (collective description `Local Church Planters`, tier-neutral `WEEKLY PRAYER · [YEAR]` front, zero photos/cities/clues, calm privacy notice on back; omit back-side GF lockup/EIN too if postal/travel risk exists).
2. **Restrict distribution channels:** Send replacements strictly over authorized encrypted groups (`GF-TPL-14` plain-text twins), password-gated portals, or vetted physical print; never social media or livestreams.
3. **Escalate and execute removal:** Alert the Regional Director (encrypted channel) and `executivedirectors@globalfellowship.org` immediately (Meadow Vista phone `1 866 984 5622` is Pacific business hours only; `OVR-17`), then execute the canonical 4-stage procedure in [On-Call Consent Withdrawal Runbook](consent-withdrawal-runbook.md)[^withdrawal].
