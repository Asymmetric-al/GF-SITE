---
title: Ethical Storytelling, Dignity, and Revocable Consent Policy
description: Dignity-first storytelling standard, standalone 2-page accessible revocable consent form (semantic radios + split private email, encrypted chat, recorded, and livestream opt-ins), local editorial veto rights, and aligned withdrawal propagation workflow across Global Fellowship channels.
type: Policy
status: draft
tags:
  - policy
  - storytelling
  - dignity
  - consent
  - ethics
x-gf-approval-state: delegated-working-guidance
x-gf-disclosure: public
generated:
  by: antigravity/gemini-4-neon
  at: "2026-11-21T18:10:00Z"
verified: []
sources:
  - id: source-synthesis
    resource: /references/source-synthesis.md
    title: Storytelling in church planters' own words and separation of private vs public communication
  - id: security
    resource: /policies/field-security-and-disclosure.md
    title: Security disclosure boundaries and metadata hygiene
---

# Ethical Storytelling, Dignity, and Revocable Consent Policy

Every story Global Fellowship shares belongs first to the people who lived it. Public stories must honor their dignity, protect their safety, preserve their own voice, and remain completely distinct from private pastoral or team communication[^source-synthesis].

## 1. Five Non-Negotiable Storytelling Standards

1. **Local agency and voice first:** Tell stories in church planters' own words whenever safe and consented. Depict local leaders teaching, hosting, praying, and deciding, never as helpless recipients waiting for Western rescue.
2. **No poverty or persecution spectacle:** Never use downward camera angles, desaturated "sadness grading," weeping close-ups of children, or sensationalized persecution headlines to provoke guilt-driven giving.
3. **Honest space for hardship and silence:** Never pressure workers to produce monthly miracle stories. A slower month of language study, grief, waiting, or rest (even a single-sentence rest update) is faithful ministry and deserves dignified telling or complete privacy when preferred.
4. **Never fabricate or present composites as real accounts:** Zero invented quotes, composite characters presented as real people, uncredited stock portraits representing field workers, or AI-generated human faces. Whenever a layout template uses a composite specimen before fresh consent clears (`GF-TPL-05`, `OVR-06`), label it unmistakably as a composite specimen so status survives inside standalone exported PDFs.
5. **Local editorial veto:** The contributing church planter or regional leader retains final review over headline, wording, photo selection, caption, translation, and channel scope, including the right to revise or decline publication without penalty.

## 2. Plain-Language Revocable Consent Checklist & Standalone Form

Use the standalone 2-page accessible **Revocable Consent Form** (`brand-kit/templates/revocable-consent-form.html`, asset `GF-TPL-15`) featuring semantic `<fieldset>` radio groups for mutually exclusive tier selections, an explicit Regional Director name and encrypted contact field on Page 1, and independent checkboxes for every channel on Page 2. Store signed forms or logged verbal consents **strictly outside Git** in Global Fellowship's private authorized archive (`OVR-14`; final jurisdiction-specific legal retention wording tracked under `OVR-22`). Every consent conversation must be plain, translatable, and cover five concrete points:

- **What is being shared:** Exact text, Identity tier (`radio`: full name, alias, initials, or collective description), Location tier (`radio`), and specific visual permission (`radio`: photo-free, detail photo, or eye-level portrait/video).
- **Where it may appear (independent channel opt-ins):** Check each channel separately: printed prayer card / **Authorized encrypted chat or password-gated portal (All tiers; required for Tier 3 electronic updates)** / **Vetted private email (Tier 1-2 only; NEVER Tier 3)** / Annual Report PDF (Tier 1-2 only; **NEVER Tier 3**) / public website (Tier 1-2 only; **NEVER Tier 3**) / **Recorded church service (offline archive only; NEVER Tier 3)** / **Livestreamed public church service (Tier 1 personal opt-in or Tier 1 anonymous collective prayer ONLY; NEVER Tier 2/3 personal details)** / public social media or short-form video (Tier 1 only; **NEVER Tier 2 or Tier 3**).
- **Duration & reconfirmation:** Time-bound permission expiring automatically for fresh review every **24 months** (or whenever local political conditions shift); parental/guardian co-signature required for any identifiable minor.
- **No coercion:** Declining, choosing photo-free, or withdrawing consent never affects membership, care, or financial partnership.
- **How to withdraw (printed directly on `GF-TPL-15`):** Contact the Regional Director listed on Page 1, email `info@globalfellowship.org` (or `executivedirectors@globalfellowship.org` for urgent safety escalations), or call `1 866 984 5622` (Pacific business hours only; for off-hours or weekend urgent withdrawals, message the Regional Director via encrypted channel and email `executivedirectors@globalfellowship.org` while a dedicated 24/7 off-hours security route remains pending under `OVR-17`) to trigger immediate safety retirement or a 24-hour routine update.

## 3. Withdrawal Propagation Workflow (Single Canonical Runbook)

When a worker or regional leader withdraws or steps down consent for a photo, name, video, or story, staff execute the single canonical 4-stage procedure in [On-Call Consent Withdrawal Runbook](consent-withdrawal-runbook.md) **immediately in urgent safety cases** and within **24 hours for routine consent updates** (full scripts `COPY-WITHDRAW-01` and `COPY-RETIRE-01` live in [Crisis & Safeguarding Playbook](crisis-and-safeguarding-comms.md); planned Core CMS editorial guidance lives in [CMS Editor Field Guide](../marketing/cms-editor-field-guide.md) and [Inbound Triage & Content Ops](inbound-triage-and-content-ops.md))[^security]:

- **Direct removal honesty:** Today (before Core CMS launches under `OVR-24`), unpublish pages and delete media binaries directly on the current `globalfellowship.org` web host; once `Asymmetric-al/core` Payload CMS v4 is live, execute Core's authoritative release-admission withdrawal and media deletion per `docs/core-integration.md`, verifying live removal in a private browser window.
- **24-hour non-acknowledgment escalation for Tier 2/3 partners:** If any logged partner church or recipient does not acknowledge a Tier 2/3 retirement notice (`COPY-RETIRE-01`) within **24 hours**, the Regional Director places a direct phone or encrypted follow-up; if still unconfirmed, escalate immediately to `executivedirectors@globalfellowship.org` (`OVR-17`) and record `partner-removal-pending` strictly inside the private offline log (`OVR-14`).
- **Zero residue & No-Send default:** Confirm filenames, PDF metadata, alt text, and social caches carry zero retired identifying details, default to complete silence on a full withdrawal unless a stepped-down collective prompt is explicitly requested, and send honest confirmation (`COPY-WITHDRAW-01`).
