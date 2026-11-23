---
title: Plain-English Staff Publishing and CMS Editor Field Guide
description: Practical non-technical handbook for Global Fellowship staff authoring pages, project designations, cleared worker profiles, and field updates in Core Payload CMS v4, covering consent and voice checks, rich text limits, the 7 allowed content blocks, alt text and EXIF stripping, Tier 1-3 clearance checks, translation handoffs, and immediate consent-withdrawal removal.
type: Playbook
status: draft
tags:
  - cms
  - publishing
  - editors
  - payload
  - workflow
  - security
  - accessibility
x-gf-approval-state: delegated-working-guidance
x-gf-disclosure: public
generated:
  by: antigravity/gemini-4-neon
  at: "2026-11-23T03:05:00Z"
verified: []
sources:
  - id: security
    resource: /policies/field-security-and-disclosure.md
    title: Two-axis security tiers, anti-mosaic rules, and EXIF stripping requirements
  - id: consent
    resource: /policies/ethical-storytelling-and-consent.md
    title: Signed GF-TPL-15 revocable consent requirement and Local Edit authority
  - id: editorial
    resource: /policies/editorial-and-ai-hygiene.md
    title: Voice guardrails, Agency Grammar, zero em dashes, and banned-phrase rules
  - id: proof-2025
    resource: /messaging/proof-ledger-2025.md
    title: Mandatory 4-digit year dating for impact stats and zero retired claims
  - id: triage
    resource: /policies/inbound-triage-and-content-ops.md
    title: Annual ledger updates, worker giving-link rules, and withdrawal revalidation
  - id: open-verification
    resource: /references/open-verification-register.md
    title: Open gates OVR-06, OVR-14, OVR-15, OVR-17, and OVR-21
---

# Plain-English Staff Publishing and CMS Editor Field Guide

**Planned Target Workflow (Not Yet Built; Confirm Against `Asymmetric-al/core` During Website Construction `OVR-24`):** `GF-SITE` currently ships the clean Next.js starter scaffold (`src/`), not the public website or live Core CMS runtime. Section 1 (editorial, security, consent, and voice checks) and Section 5 (current live host emergency removal) apply **today**. Sections 2 through 4 document **planned target editorial guidance** derived from the inspected Core schema snapshot in `docs/core-integration.md` (not a mandatory sitemap, fixed route table, or built-in runtime contract); assume **no automatic CMS guardrail exists** until wired and verified during `OVR-24`.

This guide prepares **Global Fellowship staff, regional coordinators, and content editors** for authoring pages, ministry projects, cleared worker support profiles, and field updates through Global Fellowship's planned content management integration (Payload CMS v4 in `Asymmetric-al/core`, documented in `docs/core-integration.md` and [Website Construction Handoff](../references/website-builder-handoff.md))[^triage]. Live CMS routes, block renderers, and withdrawal mechanisms will be confirmed and built during the upcoming website-construction phase (`OVR-21`, `OVR-24`). Everyday editorial steps are separated cleanly below from technical handoff details so non-technical staff never have to guess developer syntax.

---

## 1. Before You Click "Publish" (6 Non-Negotiable Staff Checks, Actionable Today)

Never move a draft to **Published** until all six items are confirmed manually:

1. **Signed Revocable Consent on File (`GF-TPL-15`):** Every identifiable field story, quote, voice clip, or photograph of a person requires current signed consent stored strictly in the private non-Git archive (`OVR-06`, `OVR-14`). Any identifiable minor also requires a parent or guardian co-signature[^consent].
2. **Local Edit Approved:** The local elder or field worker has reviewed the exact final wording, headline, photo, and caption (translated back into their working language when needed) and holds unconditional authority to edit or decline publication[^consent].
3. **Security Tier Checked on Both Axes (Stricter Tier Always Governs):**
   - **Tier 1 (Open Public):** Cleared full public name, cleared city and/or country, and consented photo allowed[^security].
   - **Tier 2 (Partial / Alias):** Approved alias ONLY; opaque worker ID (never a real-name URL slug); broad region only; **no** identifiable faces, city names, or landmarks; share link privately rather than posting on social media[^security].
   - **Tier 3 (Restricted) & Level 4 (Zero-Attribution):** **Never publish an individual public webpage or public update.** Use private offline channels only.
4. **Media Scrubbed, Renamed Neutrally & Alt Text Written Manually:** Rename every photo neutrally (never `PastorName_TownName.jpg`) and strip all EXIF/GPS camera metadata before uploading. Write concise, plain, factual alt text and a consent-dated caption (`"Shared with permission · [Year]. [Local action]."`). Always verify alt text manually before publishing (do not assume any CMS enforces non-empty alt text automatically).
5. **Voice, Agency Grammar & Banned-Phrase Manual Check (CMS Does Not Run Vale):** Because Payload CMS does not run Global Fellowship's automated prose checker, scan your draft manually before publishing against [Verbal Identity](../brand/verbal-identity.md), [Editorial & AI Hygiene](../policies/editorial-and-ai-hygiene.md), [Terminology & Glossary](../messaging/terminology-and-glossary.md), and [2025 Proof Ledger](../messaging/proof-ledger-2025.md)[^editorial]:
   - Keep **God** as the actor in spiritual fruit and **local church planters** as active grammatical subjects (never `"your gift saves/rescues/transforms"` or `"native missionary"`).
   - **Zero em dashes:** Word and Google Docs automatically turn double hyphens (`--`) into a long em dash (`U+2014`). Search your draft for long em dashes and replace them with a colon, comma, parentheses, or period. Normal hyphens inside compound words (`church-planting`) and URL slugs are completely fine.
   - **Zero banned phrases or internal jargon:** Never publish `"0% overhead"`, `"target villages"`, `"behind enemy lines"`, `"infiltrate"`, `"covert workers"`, `"seamless"`, `"Living Nearness"`, `"Agency Grammar"`, or internal `OVR-*` codes.
6. **Protected Foundations & Dated Statistics Respected:** Never alter the verbatim Mission Statement, Vision Statement, or Three Pillars ([Protected Foundations](../brand/foundations.md)), and always date and source every operational or financial figure in the same sentence[^proof-2025].

---

## 2. Planned Core Schema Block Guidance (Verify During Website Phase `OVR-24`)

In the inspected `Asymmetric-al/core` snapshot (`docs/core-integration.md`), Core defines seven serialized public layout blocks. Final block rendering, layout placement, and automated validation will be confirmed during website construction (`OVR-24`); treat every guardrail below as a **manual editor check** (assume no automatic filtering or silent dropping exists until verified in the built site):

| Planned Core Block | Intended Editorial Use | Manual Pre-Publish Editor Checklist |
| --- | --- | --- |
| **Hero** (`hero`) | Top opener of a page (eyebrow, headline, short summary, optional cleared photo, optional button). | Keep one clear page `H1` per page and verify photo framing, contrast scrim, and mobile crop once built. |
| **Rich Text** (`rich-text`) | Everyday prose, subheadings (`H2`–`H4`), bulleted or numbered lists, block quotes, and explicit links. | Keep inline images in dedicated media blocks, avoid pasted raw tables or custom colors, and verify explicit URLs on every link. |
| **Media Feature** (`media-feature`) | Pairing one cleared, EXIF-stripped photo beside a short heading, context paragraph, and caption. | Upload photos directly into the CMS Media Library rather than external drive links; keep side prose concise and write visible-only alt text and captions manually. |
| **Impact Stats** (`impact-stats`) | Up to 3 dated operational or stewardship figures (e.g., `43`, `584`, `$5.73M`). | **Manual dating check:** Include a 4-digit year (such as `2025`) and source scope inside **each stat item's own label or description** (never rely only on a section heading). |
| **FAQ** (`faq`) | Practical recurring questions and concise plain-text answers. | Keep answers plain and accessible; never place payment-card instructions or sensitive field locations inside FAQ answers. |
| **Testimonial** (`testimonial`) | A cleared quote from a local pastor, church planter, or partner. | **Manual attribution check:** Always fill in a cleared attribution line (`GF-TPL-15` signed) and verify quotation formatting once built rather than assuming automatic quoting. |
| **Call to Action** (`call-to-action`) | Calm closing invitation pointing to confirmed routes (planned slugs in `OVR-21` such as `/financials` or `/bridge-project`, or verified email desks until live). | Always pair giving pages with a no-cost next step (prayer, open financial records, or The Bridge Project). Never use countdowns or guilt language. |

---

## 3. Planned Ministry Project Page Checklist (Illustrative Route Pattern, Pending `OVR-21`/`OVR-24`)

Final route paths (such as a planned `/give/projects/[slug]` pattern) and giving-checkout handoffs will be finalized during website construction (`OVR-21`, `OVR-24`). Follow these operational steps when preparing project copy:

1. **Confirm active Finance Fund ID first:** Email `finance@globalfellowship.org` for the exact verified Fund ID (letters, numbers, hyphens, or underscores only). Never guess a Fund ID or leave a giving designation unverified.
2. **Choose a clean, future-safe slug:** Use plain lowercase words separated by hyphens (for example, `regional-leaders-gathering`), never personal names or specific town names that could become a lingering clue if regional safety tightens.
3. **Recommended content flow (adapt freely to final website design):** Clear title and 1 to 2 sentence summary; 2 to 4 paragraphs explaining how local elders lead the work and what practical needs the fund serves; optional cleared EXIF-stripped photo with manual alt text and `"Shared with permission · [Year]"` caption; optional consented local quote with cleared attribution; optional dated stats (each carrying its 4-digit year and source); 2 to 3 FAQ items covering U.S. 501(c)(3) tax-deductibility (`EIN 68-0214543`), 2025 financial transparency, and `finance@globalfellowship.org`; and a calm closing invitation to open financial statements or The Bridge Project.
4. **Review, Publish & Share Deliberately:** Finish Local Edit and editorial review in a proof document before publishing. Immediately inspect the live page on desktop and mobile, verify every block, photo, quote, and giving link, share without third-party redirect shortening tools or ad trackers, and log the live URL in the private non-Git consent distribution record (`OVR-14`).

---

## 4. Planned Worker Support Page Checklist (Illustrative Route Pattern, Pending `OVR-21`/`OVR-24`)

Final worker-page routes (such as an opaque `/give/workers/[id]` pattern) are confirmed during website construction (`OVR-21`, `OVR-24`), subject to these non-negotiable safety rules:

1. **Use opaque worker IDs ONLY:** Never create public vanity name URLs for Tier 2 workers. Confirm the worker ID matches Finance's exact active designation code.
2. **Keep layout tier-neutral:** Use the same calm typographic header for Tier 1 and Tier 2 pages alike; never write `"Restricted Worker"`, `"Tier 2"`, `"Sensitive Region"`, or `"Photo Withheld for Security"` in public copy (that creates a visual security tell).
3. **Share privately according to tier:** Follow the [Worker Giving-Link & QR Code Safety Table](../policies/inbound-triage-and-content-ops.md#2-worker-giving-link--qr-code-sharing-guide-by-security-tier) so Tier 2 URLs stay strictly in vetted direct emails and printed church cards.

---

## 5. Emergency Removal & Consent Withdrawal

When a worker, local elder, or guardian withdraws consent - or when a Regional Director calls a security step-down - follow the single canonical 4-stage procedure in [On-Call Consent Withdrawal Runbook](../policies/consent-withdrawal-runbook.md) immediately without waiting for normal cache expiration or Monday office hours[^triage].

### Part A: Non-Technical Staff Action (Today & Future CMS)

1. **Escalate immediately:** Notify the **Regional Director** (encrypted channel), **Co-Executive Directors** (`executivedirectors@globalfellowship.org`), and **Global Engagement / Web Ops** (`info@globalfellowship.org`) with a lock-screen-safe subject containing zero names, cities, or attached photos.
2. **Trigger immediate web & media removal:**
   - **Today (current live `globalfellowship.org` host, prior to Core CMS launch under `OVR-24`):** Have Web Operations unpublish or delete the live page and remove the underlying photograph binary directly from the active web host.
   - **Once Core Payload CMS v4 is live (`OVR-24`):** Switch the page or update from **Published** back to **Draft / Unpublished** (or redact identifying blocks), **permanently delete the uploaded photograph file** from the CMS Media Library, and ask Technical Ops to run the authoritative Core release-withdrawal and cache purge (Part B below).
3. **Verify live removal yourself:** Open a fresh private/incognito browser window and confirm the withdrawn URL returns **"Page not found"** (or the cleared redacted version) and the direct photo URL no longer loads.
4. **Complete Stages 2–4 of [On-Call Consent Withdrawal Runbook](../policies/consent-withdrawal-runbook.md):** Check `brand-kit/manifest.json` (`storyRefs` array), log revocation strictly in the private non-Git archive (`OVR-14`), send calm partner retirement requests (`COPY-RETIRE-01`), and send honest confirmation (`COPY-WITHDRAW-01`) within 24 hours.

### Part B: Technical / Web Ops Requirements (Implemented During Website Phase `OVR-24`)

No CMS revalidation route or CMS environment variables exist in `GF-SITE`'s current starter scaffold (`src/`); `docs/core-integration.md` governs the live integration contract built during website construction:

1. **Permanent media deletion & CDN/image cache purge:** Remove the photograph asset (original + derived sizes) from Core object storage and purge CDN and Next.js `/_next/image` caches so direct media URLs fail immediately.
2. **Authoritative Core release-admission withdrawal (never rely solely on cache invalidation):** Wire `GF-SITE`'s server-only reader (`src/lib/content/`) to `Asymmetric-al/core`'s verified release-backed serving admission contract (`docs/core-integration.md`) alongside immediate zero-expiry cache invalidation for affected document and listing collections (such as stories/updates), then verify HTTP `404` / redacted state directly on the live production URL.

---

## 6. Requesting a Non-English Translation Update

1. Never paste machine-translated prose directly into Core CMS for protected foundations, theological articles, or field updates.
2. Coordinate with the Regional Director to commission mother-tongue drafting or back-translation per [Cross-Cultural Adaptation and Translation Governance](cross-cultural-and-translation.md).
3. For Level 4 Zero-Attribution local congregations, **do not publish on `globalfellowship.org` at all** - distribute via the standalone Arabic or English zero-attribution local sheets (`GF-TPL-16`, `GF-TPL-19`, and editable `.docx` starters in `brand-kit/office/`).
