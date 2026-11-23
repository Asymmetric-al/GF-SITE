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

This guide prepares **Global Fellowship staff, regional coordinators, and content editors** for authoring pages, ministry projects, cleared worker support profiles, and field updates through Global Fellowship's planned content management integration (Payload CMS v4 in `Asymmetric-al/core`, documented in `docs/core-integration.md` and [Website Construction Handoff](../references/website-builder-handoff.md))[^triage]. Live CMS routes and revalidation endpoints will be implemented during the upcoming website-construction phase (`OVR-21`, `OVR-24`). Everyday editorial steps are separated cleanly below from technical handoff details so non-technical staff never have to guess developer syntax.

---

## 1. Before You Click "Publish" (6 Non-Negotiable Staff Checks)

Never move a draft to **Published** until all six items are confirmed:

1. **Signed Revocable Consent on File (`GF-TPL-15`):** Every identifiable field story, quote, voice clip, or photograph of a person requires current signed consent stored strictly in the private non-Git archive (`OVR-06`, `OVR-14`). Any identifiable minor also requires a parent or guardian co-signature[^consent].
2. **Local Edit Approved:** The local elder or field worker has reviewed the exact final wording, headline, photo, and caption (translated back into their working language when needed) and holds unconditional authority to edit or decline publication[^consent].
3. **Security Tier Checked on Both Axes (Stricter Tier Always Governs):**
   - **Tier 1 (Open Public):** Real name, cleared broad region, and consented photo allowed.
   - **Tier 2 (Partial / Alias):** Approved alias ONLY; opaque worker ID (never a real-name URL slug); **no** identifiable faces, city names, or landmarks; share link privately rather than posting on social media[^security].
   - **Tier 3 (Restricted) & Level 4 (Zero-Attribution):** **Never publish an individual public webpage or public update.** Use private offline channels only.
4. **Media Scrubbed, Renamed Neutrally & Alt Text Written Manually:** Rename every photo neutrally (never `PastorName_TownName.jpg`) and strip all EXIF/GPS camera metadata before uploading. Write concise, plain, factual alt text and a consent-dated caption (`"Shared with permission · [Year]. [Local action]."`). **Important:** the website does **not** automatically reject a blank alt-text field, so editors must verify alt text manually before publishing.
5. **Voice, Agency Grammar & Banned-Phrase Manual Check (CMS Does Not Run Vale):** Because Payload CMS does not run Global Fellowship's automated prose checker, scan your draft manually before publishing against [Verbal Identity](../brand/verbal-identity.md), [Editorial & AI Hygiene](../policies/editorial-and-ai-hygiene.md), [Terminology & Glossary](../messaging/terminology-and-glossary.md), and [2025 Proof Ledger](../messaging/proof-ledger-2025.md)[^editorial]:
   - Keep **God** as the actor in spiritual fruit and **local church planters** as active grammatical subjects (never `"your gift saves/rescues/transforms"` or `"native missionary"`).
   - **Zero em dashes:** Word and Google Docs automatically turn double hyphens (`--`) into a long em dash (`U+2014`). Search your draft for long em dashes and replace them with a colon, comma, parentheses, or period. Normal hyphens inside compound words (`church-planting`) and URL slugs are completely fine.
   - **Zero banned phrases or internal jargon:** Never publish `"0% overhead"`, `"target villages"`, `"behind enemy lines"`, `"infiltrate"`, `"covert workers"`, `"seamless"`, `"Living Nearness"`, `"Agency Grammar"`, or internal `OVR-*` codes.
6. **Protected Foundations & Dated Statistics Respected:** Never alter the verbatim Mission Statement, Vision Statement, or Three Pillars ([Protected Foundations](../brand/foundations.md)), and always date and source every operational or financial figure in the same sentence[^proof-2025].

---

## 2. The 7 Allowed Page Blocks & Rich-Text Limits

Global Fellowship's public website renders **exactly seven approved content blocks** from the CMS (experimental blocks fail closed safely so broken layouts never publish):

| Block Name (CMS Label) | When to Use It | Practical Rules & Built-In Guardrails |
| --- | --- | --- |
| **Hero** (`hero`) | Top opener of a page (eyebrow, headline, short summary, optional cleared photo, optional button). | Only the first Hero becomes the main page heading (`H1`); extra Hero blocks step down automatically. **Layout note:** an image attached to the Hero displays as a framed photo _below_ the intro text, not behind text. |
| **Rich Text** (`rich-text`) | Everyday prose, subheadings (`H2`–`H4`), bulleted or numbered lists, block quotes, and safe links. | **Rich-text limits:** Do **not** paste inline images, tables, checklists, video embeds, custom text colors, or code blocks inside Rich Text (unsupported formatting is stripped or flattened to plain text; use **Media Feature** for photos). Always use explicit URLs on links. |
| **Media Feature** (`media-feature`) | Pairing one cleared, EXIF-stripped photo beside a short heading, context paragraph, and caption. | Side text is **plain text only** (no bold, bullets, or links; put formatted prose in a Rich Text block). Upload photos directly into the CMS Media Library rather than external drive links, and write alt text and captions manually. |
| **Impact Stats** (`impact-stats`) | Up to 3 dated operational or stewardship figures (e.g., `43`, `584`, `$5.73M`). | **Hard automatic guardrail:** Every individual stat item MUST include a `20xx` 4-digit year (such as `2025` or `2026`) inside **that stat item's own label or description** (putting the year only in the section heading is not enough; items without a `20xx` year inside their own text are dropped silently before rendering). |
| **FAQ** (`faq`) | Practical recurring questions and concise plain-text answers (rendered automatically as a keyboard-accessible accordion). | Never place payment-card instructions or sensitive field locations inside FAQ answers. |
| **Testimonial** (`testimonial`) | A cleared quote from a local pastor, church planter, or partner. | **Two practical rules:** (1) Always fill in the **attribution line** (blank attribution drops the entire block silently). (2) Do **not** type outer quotation marks around the quote text; the website adds curved quotation marks automatically. |
| **Call to Action** (`call-to-action`) | Calm dark-ground closing invitation pointing to `/financials`, `/bridge-project`, `/pray`, or `/contact`. | Always pair giving pages with a no-cost next step (prayer, open financial records, or The Bridge Project). Never use countdowns or guilt language. |

---

## 3. Publishing a Ministry Project Page (`/give/projects/[slug]`)

1. **Confirm active Finance Fund ID first:** Email `finance@globalfellowship.org` for the exact verified Fund ID (letters, numbers, hyphens, or underscores only). **Never leave the Fund ID blank or guess a code** - every project page displays a Designated Giving panel at the bottom and intentionally refuses checkout rather than redirecting silently if the Fund ID is invalid.
2. **Choose a clean, future-safe web address (slug):** Use plain lowercase words separated by hyphens (for example, `regional-leaders-gathering`), never personal names or specific town names that could become a lingering clue if regional safety tightens.
3. **Recommended block order for a project page:**
   - **Hero:** Clear title and 1 to 2 sentence summary.
   - **Rich Text:** 2 to 4 paragraphs explaining how local elders lead the work and what practical needs the fund serves.
   - **Media Feature** _(optional)_: One cleared, EXIF-stripped field photo with manual alt text and `"Shared with permission · [Year]"` caption.
   - **Testimonial** _(optional)_: Short consented quote from a local pastor (no outer quotation marks; cleared attribution filled in).
   - **Impact Stats** _(optional)_: Only verified, dated figures with `20xx` inside every item's own label or description.
   - **FAQ:** 2 to 3 answers covering U.S. 501(c)(3) tax-deductibility (`EIN 68-0214543`), 2025 financial transparency, and direct Finance contact (`finance@globalfellowship.org`).
   - **Call to Action:** Calm closing link to `/financials`, `/bridge-project`, or `/pray`.
4. **Review, Publish & Share Deliberately:** Because external draft preview is not yet available before publication, finish Local Edit and editorial review in a proof document before setting status to **Published**. Immediately open the live page on desktop and mobile to check every block, photo, quote, and the bottom Designated Giving button. Share the direct project link deliberately (without third-party link-shortening services or ad trackers) and log the live URL in the private non-Git consent distribution record (`OVR-14`).

---

## 4. Publishing a Cleared Worker Support Page (`/give/workers/[id]`)

1. **Use opaque worker IDs ONLY:** Never create public vanity name URLs for Tier 2 workers. Confirm the worker ID matches Finance's exact active designation code.
2. **Keep layout tier-neutral:** Global Fellowship uses the same calm Harbor Night typographic header for Tier 1 and Tier 2 pages alike - never write `"Restricted Worker"`, `"Tier 2"`, `"Sensitive Region"`, or `"Photo Withheld for Security"` in public copy (that creates a visual security tell).
3. **Share privately according to tier:** Follow the [Worker Giving-Link & QR Code Safety Table](../policies/inbound-triage-and-content-ops.md#2-worker-giving-link--qr-code-sharing-guide-by-security-tier) so Tier 2 URLs stay strictly in vetted direct emails and printed church cards.

---

## 5. Emergency Removal & Consent Withdrawal

When a worker, local elder, or guardian withdraws consent - or when a Regional Director calls a security step-down - **do not wait for normal cache expiration or Monday office hours**[^triage].

### Part A: Non-Technical Staff Action (Do This Immediately)

1. **Escalate immediately:** Notify the **Regional Director** (encrypted channel), **Co-Executive Directors** (`executivedirectors@globalfellowship.org`), and **Global Engagement / Web Ops** (`info@globalfellowship.org`) with a lock-screen-safe subject containing zero names, cities, or attached photos.
2. **Unpublish in the CMS AND delete the uploaded photograph file:** Switch the page or update from **Published** back to **Draft / Unpublished** (or redact identifying blocks), AND **permanently delete the uploaded photograph file** from the CMS Media Library so direct media URLs cannot remain live.
3. **Request immediate cache purge from Technical Ops:** Send the page URL, collection name (Page, Project Page, Worker Page, or Story Update), and CMS entry ID to your Technical / Web Ops maintainer so they clear the site cache immediately (Part B below).
4. **Verify live removal yourself:** Open a fresh private/incognito browser window and confirm the withdrawn URL returns **"Page not found"** (or the cleared redacted version) and the photo URL no longer loads.
5. **Complete Steps 2–5 of the [Consent Withdrawal Propagation Checklist](../policies/crisis-and-safeguarding-comms.md#3-consent-withdrawal--propagation-protocol-honest-removal-limits):** Have your maintainer check `brand-kit/manifest.json` (`storyRefs` array), log the withdrawal in the private non-Git archive (`OVR-14`), send calm partner retirement requests (`COPY-RETIRE-01`), and send honest confirmation (`COPY-WITHDRAW-01`) within 24 hours.

### Part B: Technical / Web Ops Cache-Purge Handoff (Authorized Maintainer Only)

1. **Delete media binary & purge image caches:** Permanently remove the photograph asset (original + generated thumbnail/card sizes) from Core object storage and purge `CMS_MEDIA_ORIGIN` CDN and Next.js `/_next/image` caches.
2. **Send immediate zero-expiry revalidation (`mode: "withdraw"`):** Call `POST https://<gf-site-host>/api/cms/revalidate` authenticated with either `x-cms-revalidate-secret: <CMS_REVALIDATE_SECRET>` or `Authorization: Bearer <CMS_REVALIDATE_SECRET>`:
   ```json
   {
     "mode": "withdraw",
     "tags": [
       "public-cms:tenant:<tenant>",
       "public-cms:tenant:<tenant>:collection:updates",
       "public-cms:tenant:<tenant>:collection:<collection>:doc:<documentId>"
     ]
   }
   ```
   - **Exact tag rules:** `<tenant>` resolves from `CMS_TENANT_ID` first (falling back to sanitized `tenant.slug`, then `"default"`). Because `/stories` reads `collection:updates` without per-document tags, **always include `public-cms:tenant:<tenant>:collection:updates` (and the tenant tag for urgent Tier 3 certainty)** when removing a field update. Confirm HTTP `200` returns `"mode": "withdraw"` and `"revalidated": true` (using `"mode": "withdraw"` triggers `revalidateTag(tag, { expire: 0 })` immediately).

---

## 6. Requesting a Non-English Translation Update

1. Never paste machine-translated prose directly into Core CMS for protected foundations, theological articles, or field updates.
2. Coordinate with the Regional Director to commission mother-tongue drafting or back-translation per [Cross-Cultural Adaptation and Translation Governance](cross-cultural-and-translation.md).
3. For Level 4 Zero-Attribution local congregations, **do not publish on `globalfellowship.org` at all** - distribute via the standalone Arabic or English zero-attribution local sheets (`GF-TPL-16`, `GF-TPL-19`, and editable `.docx` starters in `brand-kit/office/`).
