---
title: On-Call Consent Withdrawal and Emergency Removal Runbook
description: One-hop operational runbook for executing an urgent or routine Tier 1 through Tier 3 consent withdrawal across Global Fellowship print kits, encrypted mobile groups, CMS routes, and external partners within 24 hours.
type: Policy
status: draft
tags:
  - runbook
  - withdrawal
  - consent
  - emergency
  - security
x-gf-approval-state: delegated-working-guidance
x-gf-disclosure: public
generated:
  by: antigravity/gemini-4-neon
  at: "2026-11-22T19:30:00Z"
verified: []
sources:
  - id: ethical-storytelling
    resource: /policies/ethical-storytelling-and-consent.md
    title: Governing dignity, consent, and 5-step withdrawal trace policy
  - id: crisis-playbook
    resource: /policies/crisis-and-safeguarding-comms.md
    title: Crisis silence protocol, safeguarding reporting, and withdrawal communications
  - id: field-security
    resource: /policies/field-security-and-disclosure.md
    title: Two-axis disclosure matrix and 60-second security step-down protocol
---

# On-Call Consent Withdrawal and Emergency Removal Runbook

Use this one-hop runbook whenever a local leader, field worker, family member, or Regional Director withdraws consent or triggers an urgent security step-down. **Life safety and household privacy override every print, email, social, or website deadline**[^field-security][^ethical-storytelling].

## 1. Immediate Triage (First 15 Minutes)

1. **Acknowledge directly without debate:** Thank the requester calmly, confirm no explanation is required, and state clearly whether this is **Urgent (Life Safety / Step-Down)** or **Routine (24-Hour Retirement Target)**[^crisis-playbook].
2. **Escalate immediately on urgent requests:** Notify the **Regional Director** (encrypted channel) and **Co-Executive Directors** (`executivedirectors@globalfellowship.org`, plus `info@globalfellowship.org`; Meadow Vista phone `1 866 984 5622` is staffed Pacific business hours only, so route off-hours/weekend notices directly via encrypted Regional Director channel and `executivedirectors@` while a dedicated 24/7 route remains pending under `OVR-17`). Do not repeat sensitive personal names, cities, or incident specifics over unencrypted email or public channels.
3. **Locate the `storyRefs` or asset ID:** Pull the item's tracking identifier from the private regional consent record (stored outside Git, `OVR-14`) and cross-check every derivative in `brand-kit/manifest.json` (`storyRefs`) and any live web page.

## 2. Direct Global Fellowship Removal (Immediate for Urgent / Within 24 Hours Routine)

1. **Public website (distinguish current host today vs. planned future CMS):**
   - **Today (current live `globalfellowship.org`, prior to website/CMS launch under `OVR-24`):** Escalate immediately to Web Operations and the Co-Executive Directors (`executivedirectors@globalfellowship.org`, using private ops credentials stored outside Git under `OVR-14`) to unpublish or delete the live webpage AND remove the underlying media file directly from the active web host, then verify in a fresh private/incognito browser window that both the page URL and direct image URL no longer load.
   - **Planned future website (`Asymmetric-al/core` Payload CMS v4 once wired under `OVR-24`):** Unpublish or redact the entry in Core Payload CMS, permanently delete the underlying media binary (original + derived sizes) from Core object storage, and execute Core's authoritative release-admission / withdrawal removal and CDN/Next.js cache purge per `docs/core-integration.md` (never treat an unverified cache webhook as authoritative without live URL verification)[^crisis-playbook].
2. **Email, social, and video channels:** Cancel scheduled ESP sends, delete social posts and stories, remove public video uploads, and archive captions/transcripts out of active distribution folders.
3. **Brand kit and printable files:** Remove or replace the retired passage/asset across HTML templates, exported PDFs, PNGs, `.docx`/`.pptx` starters, and `.txt`/`.vtt` exports, then re-run `bun run verify:brand` (which verifies both forward and reverse `storyRefs` retirement across templates and text exports).
4. **No-Send default:** On a full withdrawal, **send nothing** rather than rushing a stepped-down replacement unless the household and Regional Director explicitly request a neutral collective prayer note (`GF-TPL-01` or `GF-TPL-14` encrypted twin).

## 3. Honest External Partner & Print Limits

Never promise instant erasure of copies outside Global Fellowship's direct control[^ethical-storytelling]:

- **Partner churches and coordinators:** Contact every church or small-group lead who received the print card, PDF, or slide deck using `COPY-RETIRE-01` (in [Crisis & Safeguarding Playbook](crisis-and-safeguarding-comms.md)) asking them to stop sharing, delete local copies, and recycle unused printed cards.
- **Cached search engines and third-party downloads:** Submit search-engine removal requests for deleted public URLs where applicable, and state honestly to the household what Global Fellowship deleted directly versus what external copies were asked to be retired.

## 4. Written Closure & Private Audit Log

1. Send a concise plain-language confirmation to the household and Regional Director listing: (a) every Global Fellowship asset removed directly with UTC timestamp, (b) every partner retirement notice sent, and (c) confirmation that no replacement story will be published without fresh signed consent (`GF-TPL-15`).
2. Record the revocation timestamp on the private signed consent file outside Git (`OVR-14`). Never store personal names, redaction mappings, or withdrawal details in this public repository.
