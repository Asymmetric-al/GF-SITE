---
title: Field Security and Safe Disclosure Policy
description: Two-axis Identity by Location disclosure governance, adversarial-reader security review, unified livestream vs. recorded service rules, metadata stripping, warm photo-optional parity, standalone confidential member-care separation, self-contained Level 4 zero-attribution master, and external deny-list enforcement.
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
  at: "2026-11-23T03:05:00Z"
verified: []
sources:
  - id: source-synthesis
    resource: /references/source-synthesis.md
    title: Observed protective redaction reality across 12 of 52 archived public profiles
  - id: visual
    resource: /brand/visual-identity.md
    title: Shared photo-optional card skeleton and Architectural Frame graphic system
---

# Field Security and Safe Disclosure Policy

Roughly a quarter of Global Fellowship's archived public missionary profiles (`12 of 52`) already require protective redactions, initials, or ministry codes, and regional security conditions can tighten overnight[^source-synthesis]. Field security is therefore built natively into Global Fellowship's brand architecture, never treated as a last-minute black marker over a finished design.

## 1. Two-Axis Disclosure Matrix (Identity x Location + Media)

Real field risk varies independently by **identity** and **geography**. Every worker profile, card, slide, mobile Note, video, and letter is cleared on both axes before publication:

| Axis | Tier 1: Open / Public | Tier 2: Partial / Pseudonym | Tier 3: Restricted / Withheld |
| --- | --- | --- | --- |
| **Identity Axis** | Cleared full public name (e.g., `[Cleared Full Public Name]`) | Cleared first names only, initials, or approved alias (e.g., `Family R.`) | Approved ministry code or collective description (`Church Planters`) |
| **Location Axis** | Cleared city and/or country (`[Cleared City, Country]`) | Broad region only (`Central Asia`, `Southeast Asia`) | Location withheld (tier-neutral `WEEKLY PRAYER · 2026` on displayed card fronts; zero country, city, ethnic group, or dialect clues) |
| **Image & Video Rule** | Cleared documentary photo/video OR vetted contextual street photo (`GF-PHO-01..06`, `GF-VID-01`) OR photo-free layout | Metadata-stripped non-identifying tabletop detail photo OR photo-free layout | **Photo-free layout ONLY** (Harbor Night + cross-free `architectural-frame-dark.svg` card `GF-TPL-01`, livestream Slide 5 `GF-TPL-10`, or encrypted text Note `GF-TPL-14` EN/TH/AR plain-text twins; **NEVER `GF-VID-01` or any photo, face, voice, or place**) |
| **Channel Eligibility** | Print, email, public website, consented social, recorded/livestreamed church services (with explicit opt-in) | Vetted print, private email, public website at Tier 2; **NEVER public social**; **NEVER personal details on public livestreams** | Private encrypted prayer distribution & vetted print only; **NEVER social media, NEVER Annual Report PDF, NEVER Tier 3 personal details on church recordings or livestreams** |

### Unified Livestream vs. Recorded Church Service Rule

Church services are cleared under **two independent opt-ins** on the standalone Revocable Consent Form (`GF-TPL-15`):

1. **Recorded Church Service (Offline Archive Only):** Permitted for Tier 1 and Tier 2 only with explicit consent; never Tier 3.
2. **Livestreamed Public Church Service (YouTube / Facebook / Public Archive):** Permitted **ONLY** for Tier 1 explicit personal opt-ins OR **Tier 1 anonymous collective congregation-wide prayer** containing zero worker names, cities, photos, or regional clues (modeled cleanly on Slide 5 of `GF-TPL-10` and the pulpit script of `GF-TPL-06`). Never project Tier 2 or Tier 3 personal details onto any public livestream.

## 2. Six Hard Anti-Mosaic Rules

Hostile officials and automated scrapers combine small clues across separate files ("mosaic effect"). Enforce all six rules without exception:

1. **Stricter applicable tier governs every channel.** Never add a city name, child's name, local season/weather clue, or denominational tie on a printed card, mobile message, or church slide that was withheld on the web.
2. **Never aggregate restricted identifiers in a public repository.** Public docs record only aggregate counts (`12 of 52`). Maintain any active redaction deny-list **strictly outside Git** (in GF's private store and injected via local gitignored file or CI secret during publication scans, `OVR-14`).
3. **Never encode geography in color, texture, or iconography on restricted materials.** All restricted cards use the exact same Living Nearness v15.0 palette (`Harbor Night #0B272E`, `Candle Apricot #F2B488`, `Warm Paper #FAF7F2`, `Harbor Teal #0C525C`) and non-geographic, cross-free `architectural-frame-dark.svg` geometry[^visual] (or Ink-Neutral Charcoal Ink `#16191C` on Warm Paper `#FAF7F2` where regional leaders invoke the `OVR-11` monochrome fallback).
4. **Design photo-free first so restricted cards never stand out at arm's length.** Public (`GF-TPL-02`) and restricted (`GF-TPL-01`) 4x6 duplex prayer cards share the exact same warm `178px` cross-free architectural header over ~70% Warm Paper + `Source Serif 4` Scripture, tier-neutral `WEEKLY PRAYER · 2026` front header, and identical Harbor Teal `5px` top rule on the unboxed back (with tier-neutral `Pray in fellowship` footer on restricted `GF-TPL-01` vs. Level 3 endorsement lockup `gf-lockup-endorsement.svg` on consented public `GF-TPL-02`). Ban silhouettes, blurred faces, black redaction bars, `"REDACTED"` stamps, and padlocks permanently.
5. **Strip hidden metadata on every export:** Audit filenames (never `Name_Country_Restricted.pdf`), EXIF/GPS tags, PDF author/title/subject properties, SVG `<title>`/`<desc>` nodes, image `alt` text, and OpenGraph social previews.
6. **Home-side vs. Field-side Logo Rule, Confidential Care Separation & Zero-Attribution Right:** On **Home-side / donor-facing** Tier 3 prayer cards printed for vetted churches abroad (`GF-TPL-01`), place the Global Fellowship Cross-in-Oval mark on the **back** (never the front cover) and omit all organizational marks on restricted worker-letter covers (`GF-TPL-04` Page 2). Keep confidential pastoral care (`GF-TPL-18`, standalone file) strictly separated from public stationery specs (`GF-TPL-12`). On **Field-side** materials carried across borders or printed inside sensitive nations, omit all Global Fellowship identifiers and brand typography completely using the Restricted Travel Card (`GF-TPL-12`), the 100% self-contained **Level 4 Zero-Attribution Local-Only Sheet (`GF-TPL-16`)**, **Arabic-First Local Brief (`GF-TPL-19`)**, and editable `office/local-only-meeting-sheet-starter.docx` and `office/local-fellowship-brief-arabic-rtl-starter.docx`.

## 3. 60-Second Security Step-Down Protocol & Urgent Escalation

When local political or safety conditions tighten suddenly:

1. **Step down BOTH axes immediately:** Switch the worker's profile to the **Tier 3 Photo-Free Master** (`brand-kit/templates/prayer-card-restricted-master.html`, `GF-TPL-01`). Replace personal names or initials with a collective description (`Local Church Planters`), keep the tier-neutral `WEEKLY PRAYER · [YEAR]` front header, remove all photos, cities, seasons, and landmarks, and include the calm privacy notice on the back (`"Protect their household: God knows them by name. Pray at home and in small groups; do not photograph or post this card online."`). Where even back-side organizational branding carries travel or postal risk, omit the GF lockup and EIN for a zero-org back.
2. **Distribute only over authorized private channels:** Route Tier 3 replacements exclusively through encrypted church-partner groups (`GF-TPL-14` standalone PNG + plain-text Note twin), password-gated partner portals, or vetted physical print, never social media or public church livestreams.
3. **Escalate and trace retirement:** Notify the Regional Director immediately and contact Global Fellowship Home Office (`executivedirectors@globalfellowship.org` for urgent escalations, `info@globalfellowship.org`, and `1 866 984 5622`; dedicated 24/7 off-hours security route tracked under `OVR-17`), then execute the 5-step withdrawal trace in [Ethical Storytelling and Consent Policy](ethical-storytelling-and-consent.md), [Crisis & Safeguarding Playbook](crisis-and-safeguarding-comms.md), and [CMS Editor Field Guide](../marketing/cms-editor-field-guide.md).
