---
title: Plain-English Staff Publishing and CMS Editor Field Guide
description: Pre-publish editorial checks actionable today plus planned Core Payload CMS v4 staff publishing checklists pending website construction (OVR-24).
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
  at: "2026-11-23T06:55:00Z"
verified: []
sources:
  - id: security
    resource: /policies/field-security-and-disclosure.md
    title: Two-axis security tiers, anti-mosaic rules, and EXIF stripping requirements
  - id: consent
    resource: /policies/ethical-storytelling-and-consent.md
    title: Signed GF-TPL-15 revocable consent requirement and Local Edit authority
  - id: withdrawal
    resource: /policies/consent-withdrawal-runbook.md
    title: Single canonical 4-stage emergency removal and consent-withdrawal runbook
  - id: editorial
    resource: /policies/editorial-and-ai-hygiene.md
    title: Voice guardrails, Agency Grammar, zero em dashes, and banned-phrase rules
  - id: proof-2025
    resource: /messaging/proof-ledger-2025.md
    title: Mandatory 4-digit year dating for impact stats and zero retired claims
  - id: open-verification
    resource: /references/open-verification-register.md
    title: Open gates OVR-06, OVR-14, OVR-15, OVR-21, and OVR-24
---

# Plain-English Staff Publishing and CMS Editor Field Guide

**Planned Target Workflow (Not Yet Built; Confirm Against `Asymmetric-al/core` During Website Construction `OVR-24`):** `GF-SITE` currently ships the clean Next.js starter scaffold (`src/`), not the live website or Core CMS runtime. **Section 1** (pre-publish editorial/security checks) and **Section 5** (emergency removal pointer) apply **today**. **Sections 2 through 4** capture planned editorial checklists derived from the inspected Core snapshot in `docs/core-integration.md` (not a fixed sitemap or built-in runtime contract); assume **no automatic CMS guardrail exists** until wired and verified during `OVR-24`[^open-verification].

---

## 1. Before You Publish Anything (6 Manual Staff Checks, Actionable Today)

Confirm all six items manually before publishing any page, story, project, or update:

1. **Signed Revocable Consent on file (`GF-TPL-15`):** Every identifiable field story, quote, voice clip, or photo requires current signed consent stored outside Git (`OVR-06`, `OVR-14`), with parent/guardian co-signature for identifiable minors[^consent].
2. **Local Edit approved:** The local elder or field worker has reviewed final wording, headline, photo, and caption in their working language and holds unconditional veto[^consent].
3. **Security tier verified on both axes:** Tier 1 = cleared name, city/country, consented photo; Tier 2 = approved alias, opaque ID (never a real-name slug), broad region, zero identifiable faces/cities, share link privately; Tier 3 & Level 4 = **never publish an individual public webpage or public update**[^security].
4. **Media scrubbed & alt text written manually:** Rename files neutrally (never `PastorName_Town.jpg`), strip all EXIF/GPS metadata, and manually write factual visible-only alt text plus `"Shared with permission · [Year]. [Local action]."` caption.
5. **Voice, Agency Grammar & banned-phrase check (CMS does not run Vale):** Check manually against [Verbal Identity](../brand/verbal-identity.md) and [Editorial & AI Hygiene](../policies/editorial-and-ai-hygiene.md): God acts first, local leaders are subjects, **zero em dashes** (replace auto-converted `--`), zero banned/retired phrases (`"0% overhead"`, military verbs, `"seamless"`), and zero internal meta-terms (`"Living Nearness"`, `OVR-*`)[^editorial].
6. **Protected Foundations & dated figures:** Never alter [Protected Foundations](../brand/foundations.md), and date/source every statistic in the same sentence[^proof-2025].

---

## 2. Planned Core Schema Block Checklists (Verify During `OVR-24`)

In the inspected `Asymmetric-al/core` snapshot (`docs/core-integration.md`), Core defines seven public blocks. Treat every check below as a **manual editor step** until runtime validation is built:

| Planned Core Block | Intended Use | Manual Pre-Publish Check |
| --- | --- | --- |
| **Hero** (`hero`) | Page opener (eyebrow, headline, summary, optional cleared photo/CTA) | Keep one `H1` per page; verify photo crop and AAA scrim contrast once built. |
| **Rich Text** (`rich-text`) | Prose, `H2`-`H4`, lists, block quotes, explicit links | Keep inline images in dedicated media blocks; avoid pasted raw tables/colors; verify explicit link URLs. |
| **Media Feature** (`media-feature`) | Cleared photo beside heading, context, and caption | Upload directly to CMS Media Library; write visible-only alt text and consent caption manually. |
| **Impact Stats** (`impact-stats`) | Up to 3 dated metrics (`43`, `584`, `$5.73M`) | Include a 4-digit year and source scope inside **each stat item's own label/description**. |
| **FAQ** (`faq`) | Recurring questions and plain-text answers | Keep answers plain; never include card-update instructions or sensitive field locations. |
| **Testimonial** (`testimonial`) | Cleared quote from local leader or partner | Require signed `GF-TPL-15` and fill in a cleared attribution line manually. |
| **Call to Action** (`call-to-action`) | Calm closing invitation to verified routes or email desks (`OVR-21`) | Pair every giving CTA with a no-cost next step (prayer, statements, or Bridge Project); zero countdowns. |

---

## 3. Planned Ministry Project Page Checklist (Pending `OVR-21`/`OVR-24`)

1. **Confirm active Finance Fund ID first** via `finance@globalfellowship.org` (never guess a Fund ID).
2. **Use a future-safe slug:** Plain lowercase hyphenated words (`regional-leaders-gathering`), never personal or town names.
3. **Recommended content flow:** Clear title and summary; 2-4 paragraphs showing local elder leadership and practical fund purpose; optional cleared EXIF-stripped photo/quote; optional dated stats; 2-3 FAQs covering 501(c)(3) status (`EIN 68-0214543`), 2025 statements, and `finance@globalfellowship.org`; calm closing link to open statements or Bridge Project.
4. **Post-publish check:** Inspect desktop and mobile immediately, share without redirect link-shortening tools or ad trackers, and log the live URL in the private non-Git consent record (`OVR-14`).

---

## 4. Planned Worker Support Page Checklist (Pending `OVR-21`/`OVR-24`)

1. **Use opaque worker IDs only:** Never create real-name slugs for Tier 2 workers; match Finance's active code.
2. **Keep layout tier-neutral:** Use identical calm headers across Tier 1 and Tier 2 pages; never print `"Restricted Worker"`, `"Tier 2"`, or `"Photo Withheld for Security"` publicly.
3. **Follow tier link-sharing limits:** See [Inbound Triage & Worker Giving-Link Safety](../policies/inbound-triage-and-content-ops.md#2-worker-giving-link--qr-code-sharing-guide-by-security-tier).

---

## 5. Emergency Removal, Consent Withdrawal & Translation Updates

- **Consent withdrawal or security step-down:** Execute the single canonical 4-stage procedure in [On-Call Consent Withdrawal Runbook](../policies/consent-withdrawal-runbook.md) immediately (unpublishing on the active `globalfellowship.org` host today, or executing authoritative Core CMS release-admission withdrawal + permanent media deletion + CDN/Next.js image cache purge once wired under `OVR-24` per `docs/core-integration.md`)[^withdrawal]. Never assume an unbuilt webhook exists.
- **Non-English translation updates:** Never paste raw machine translations for Protected Foundations, doctrinal articles, or field stories; follow [Cross-Cultural Adaptation & Translation Governance](cross-cultural-and-translation.md). Never publish Level 4 Zero-Attribution local congregations on `globalfellowship.org`.
