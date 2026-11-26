---
title: On-Call Consent Withdrawal and Emergency Removal Runbook
description: Single canonical 1-hop runbook for urgent and routine Tier 1-3 consent withdrawals across web, print, encrypted mobile groups, and external partners, including withdrawal scripts.
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
  at: "2026-11-23T06:55:00Z"
verified: []
sources:
  - id: ethical-storytelling
    resource: /policies/ethical-storytelling-and-consent.md
    title: Governing dignity, consent, and 24-month reconfirmation policy
  - id: crisis-playbook
    resource: /policies/crisis-and-safeguarding-comms.md
    title: Crisis silence protocol and urgent escalation boundaries
  - id: field-security
    resource: /policies/field-security-and-disclosure.md
    title: Two-axis disclosure matrix and 60-second security step-down protocol
  - id: open-verification
    resource: /references/open-verification-register.md
    title: Open gates OVR-14, OVR-17, OVR-22, and OVR-24
---

# On-Call Consent Withdrawal and Emergency Removal Runbook

**Single Canonical Withdrawal Procedure:** Use this 1-hop runbook whenever a local leader, field worker, guardian, or Regional Director withdraws consent or triggers an urgent security step-down. **Life safety and household privacy override every print, email, social, or website deadline**[^field-security][^ethical-storytelling].

## Roles & Response Targets (Pending Legal Review under `OVR-22`)

- **Primary Owner:** Global Engagement / Web Content Lead (`info@globalfellowship.org`).
- **Backup & Escalation Owner:** Regional Director (encrypted channel) and Co-Executive Directors (`executivedirectors@globalfellowship.org`).
- **Urgent safety withdrawal:** Begin removal **immediately** upon notice (same-day purge of web pages, media binaries, social posts, and email queues).
- **Routine withdrawal:** Complete direct Global Fellowship removal **within 24 hours** (aligned with `GF-TPL-15`; never hold weekend notices until Monday)[^open-verification].
- **Off-hours staffing candor (`OVR-17`):** Meadow Vista phone (`1 866 984 5622`) is staffed **Pacific business hours only** until `OVR-17` closes; route off-hours/weekend requests immediately via the Regional Director's encrypted channel plus `executivedirectors@globalfellowship.org` and `info@globalfellowship.org`[^crisis-playbook].

---

## Stage 1: Immediate Triage (First 15 Minutes)

1. **Acknowledge calmly without debate:** Confirm no explanation is required and classify as **Urgent (Life Safety / Step-Down)** or **Routine (24-Hour Target)**. If off-hours deletion is pending Web Ops verification, immediately freeze outbound queues and send the off-hours intake note in `COPY-WITHDRAW-01` below.
2. **Escalate urgent requests immediately:** Alert the **Regional Director** (encrypted channel) and **Co-Executive Directors** (`executivedirectors@globalfellowship.org`). Never repeat restricted names, cities, or incident specifics over unencrypted email.
3. **Locate every derivative:** Pull the tracking ID from the private non-Git consent archive (`OVR-14`) and cross-check `brand-kit/manifest.json` (`storyRefs`) plus active web pages.

## Stage 2: Direct Global Fellowship Removal

1. **Public website (Today vs. Planned Future CMS):**
   - **Today (current live `globalfellowship.org`, prior to website/CMS launch under `OVR-24`):** Have Web Operations and `executivedirectors@globalfellowship.org` (using private ops credentials outside Git) unpublish/delete the live webpage AND delete the underlying image binary directly on the active host.
   - **Planned future website (`Asymmetric-al/core` Payload CMS v4 once wired under `OVR-24`):** Unpublish or redact the Core entry, permanently delete the media binary (original + derived sizes) from Core storage, and execute Core's authoritative release-admission withdrawal and CDN/Next.js image cache purge per `docs/core-integration.md`.
   - **Verify live removal yourself:** Open a fresh private/incognito browser window and confirm both the page URL (`404`/redacted) and direct image URL no longer load.
2. **Email, social, and video channels:** Cancel scheduled ESP sends, delete social posts/stories, remove public video uploads, and pull captions/transcripts out of active folders.
3. **Brand kit and printable files:** Remove or replace the retired asset across HTML templates, PDFs, PNGs, `.docx`/`.pptx` starters, and `.txt`/`.vtt` exports, then re-run `bun run verify:brand` (checks forward and reverse `storyRefs` retirement). Confirm filenames, PDF metadata, and alt text retain zero retired identifiers.
4. **No-Send default:** On a full withdrawal, **send nothing** rather than rushing a stepped-down replacement unless the household and Regional Director explicitly request a neutral collective prayer note (`GF-TPL-01` or `GF-TPL-14` encrypted twin).

## Stage 3: Honest External Partner & Print Limits

Never promise instant erasure of copies outside Global Fellowship's direct control:

- **Notify logged partner churches & coordinators (`COPY-RETIRE-01` below):** Ask every recipient recorded in the private archive (`OVR-14`) to delete local digital copies and discard printed cards.
- **24-hour non-acknowledgment escalation (Tier 2/3):** If any logged Tier 2/3 partner has not acknowledged `COPY-RETIRE-01` within **24 hours**, the Regional Director places a direct phone or encrypted follow-up; if still unconfirmed, escalate to `executivedirectors@globalfellowship.org` and log `partner-removal-pending` strictly inside the private offline record (`OVR-14`).
- **Search caches:** Submit search-engine removal requests for deleted public URLs where applicable.

## Stage 4: Written Closure & Private Audit Log

1. Send completed-removal confirmation (`COPY-WITHDRAW-01` below) listing (a) every GF asset deleted directly with UTC timestamp, (b) partner retirement requests sent (honestly distinguishing direct deletion from external requests), and (c) confirmation that nothing will be republished without fresh signed `GF-TPL-15` consent.
2. Record the revocation timestamp on the private consent file strictly outside Git (`OVR-14`). Never store personal names, redaction mappings, or withdrawal details in this public repository.

---

## Operational Withdrawal Scripts

### Withdrawal Confirmation (`COPY-WITHDRAW-01`)

- **Completed removal (send once live deletion is verified):**
  > `We received your request on [Date] to withdraw permission for [Story / Photo / Name Reference]. We have removed it from Global Fellowship's website, media archive, official social channels, and upcoming print/email templates, and recorded the withdrawal in our private consent log. We have also asked partner churches holding digital files to retire their copies. While we cannot physically retrieve paper copies already handed out in homes or control independent copies outside our systems, Global Fellowship will not publish or distribute this material again. Please reply if you see any remaining instance we missed so we can address it immediately.`
- **Immediate off-hours intake acknowledgment (while Web Ops completes live purge):**
  > `We received your request on [Date] to withdraw permission for [Story / Photo / Name Reference]. We have immediately frozen outbound emails, print queues, and publication, and escalated to our leadership and web operations team to complete permanent removal from our publishing system and media library. We will send a follow-up confirmation as soon as deletion is verified, and we are already contacting partner churches on our private distribution list to ask them to retire any earlier copies. No explanation is ever needed, and complete silence is always respected.`

### Calm Partner-Church & Supporter Retirement Notice (`COPY-RETIRE-01`)

> **Subject (lock-screen-safe):** `Please retire an earlier prayer update for our fellowship`  
> **Body:** `Dear [Pastor / Partner First Name], out of care for household privacy and updated preferences from the people involved, we are asking partner churches and supporters to retire the earlier [story / photograph / prayer card] shared on [Approximate Date]. Please delete any saved digital copy or photograph from church computers, slide decks, emails, or chat groups, discard any remaining printed copies, and ensure nothing from it appears on church livestreams or social media. Thank you for guarding our brothers and sisters with calm care and continued prayer at home.`
