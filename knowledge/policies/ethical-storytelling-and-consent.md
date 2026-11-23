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
- **How to withdraw (printed directly on `GF-TPL-15`):** Contact the Regional Director listed on Page 1, email `info@globalfellowship.org` (or `executivedirectors@globalfellowship.org` for urgent safety escalations), or call `1 866 984 5622` (dedicated 24/7 off-hours security escalation alias tracked under `OVR-17`) to trigger immediate safety retirement or a 24-hour routine update.

## 3. Withdrawal Propagation Workflow (End-to-End Trace)

When a worker or regional leader withdraws or steps down consent for a photo, name, video, or story, staff execute this 5-step trace **immediately in urgent safety cases** and within **24 hours for routine consent updates** (full scripts `COPY-WITHDRAW-01` and `COPY-RETIRE-01` live in [Crisis & Safeguarding Playbook](crisis-and-safeguarding-comms.md); CMS purge mechanics live in [CMS Editor Field Guide](../marketing/cms-editor-field-guide.md) and [Inbound Triage & Content Ops](inbound-triage-and-content-ops.md))[^security]:

1. **Log withdrawal** in the private consent and recipient distribution log (kept strictly outside Git, `OVR-14`) and notify the Regional Director, Global Engagement lead (`info@globalfellowship.org`), and Co-Executive Directors (`executivedirectors@globalfellowship.org`) for urgent safety cases.
2. **Update public web & CMS** (`Asymmetric-al/core` Payload CMS once live): unpublish or step down the profile/story, delete any uploaded media binary, and purge live caches immediately via `mode: "withdraw"`.
3. **Retire derived templates & active distributions:** Use `brand-kit/manifest.json` (`storyRefs` plural array) to locate every affected master template in the repository, AND check the private recipient distribution log (`OVR-14`) to trace every active printed prayer card, slide deck, email campaign, mobile Note graphic, or annual report copy sent externally.
4. **Issue calm partner & digital-copy deletion notice (with 24-hour non-acknowledgment escalation):** For printed cards, slides, OR already-sent digital copies (vetted emails, PDFs, and encrypted chat graphics), the **Regional Director or Global Engagement lead** notifies active recipients logged in the private archive calmly (`COPY-RETIRE-01`) to stop sharing and delete archived copies. If any logged partner church or recipient does not acknowledge a Tier 2/3 withdrawal notice within **24 hours**, the Regional Director places a direct phone or encrypted follow-up; if still unconfirmed, escalate immediately to `executivedirectors@globalfellowship.org` (`OVR-17`) and record `partner-removal-pending` strictly inside the private offline log (never writing real recipient lists to Git). On a **full withdrawal**, default to the **No-Send Option** (complete silence); supply a stepped-down replacement ONLY when the household and Regional Director explicitly request a tier downgrade.
5. **Verify no residue:** Confirm filenames, PDF properties, image descriptions, and social preview caches carry zero retired identifying details, then send honest confirmation (`COPY-WITHDRAW-01`).
