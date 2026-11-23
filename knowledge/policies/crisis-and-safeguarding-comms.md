---
title: Crisis, Security Incident, Consent Withdrawal, and Safeguarding Communications Playbook
description: Operational crisis-communication playbook covering detention or evacuation incidents, sudden medical or bereavement care, consent-withdrawal propagation with honest non-recallable copy limits, data or security breach notification, safeguarding and financial concern reporting, and public/media non-comment holding statements without inventing unconfirmed hotlines.
type: Policy
status: draft
tags:
  - crisis
  - security
  - safeguarding
  - consent-withdrawal
  - breach
  - media
x-gf-approval-state: delegated-working-guidance
x-gf-disclosure: public
generated:
  by: antigravity/gemini-4-neon
  at: "2026-11-22T17:10:00Z"
verified: []
sources:
  - id: security
    resource: /policies/field-security-and-disclosure.md
    title: Two-axis disclosure matrix, anti-mosaic rules, and 60-second step-down protocol
  - id: consent
    resource: /policies/ethical-storytelling-and-consent.md
    title: Revocable consent standards, local editorial veto, and 5-step withdrawal workflow
  - id: open-verification
    resource: /references/open-verification-register.md
    title: Open gates OVR-14 (private deny-list), OVR-17 (no invented 24/7 hotline), OVR-20 (member care), and OVR-22 (legal SLA review)
  - id: source-synthesis
    resource: /references/source-synthesis.md
    title: Verified Home Office contact lines and Co-Executive Director leadership structure
---

# Crisis, Security Incident, Consent Withdrawal, and Safeguarding Communications Playbook

Global Fellowship communicates in crisis with **quiet speed, truthfulness, zero speculation, and primary allegiance to household safety and human dignity**[^security][^consent]. This policy governs how staff, regional directors, and leadership speak (and deliberately stay silent) across six high-stakes scenarios.

**Hard Operational Boundary (`OVR-17`):** Global Fellowship does **not** publish an invented `security@` email address or unmonitored 24/7 hotline[^open-verification]. Until Operations formally activates and tests a dedicated off-hours security route, urgent escalations move through:

1. **Field-side primary:** The worker's **Regional Director** (via private encrypted internal directory, stored strictly outside Git per `OVR-14` and `OVR-20`).
2. **Home Office escalation:** **Co-Executive Directors** (`executivedirectors@globalfellowship.org`) and Home Office phone (`1 866 984 5622`, backed by `info@globalfellowship.org`).

---

## 1. Detention, Interrogation, or Emergency Evacuation (Security Silence Protocol)

**Governing rule:** **Zero public posting. Zero mass email. Zero fundraising.** Speculation on social media, church prayer chains, or newsletters can endanger detained believers, local hosts, and families still in-country[^security].

### Immediate Communications Sequence

1. **Freeze external channels within 30 minutes:** Suspend scheduled newsletters, social posts, and worker webpage updates tied to the region. If the worker has a public page on `globalfellowship.org`, trigger immediate CMS withdrawal (`POST /api/cms/revalidate` with `mode: "withdraw"` so cache expires at `expire: 0` immediately).
2. **Confirm one single spokesperson:** Only the Co-Executive Directors (in coordination with the Regional Director and security counsel) authorize every written word.
3. **Notify vetted inner circle privately (encrypted/phone only):** Inform immediate family and sending-church elders first, with explicit instructions: _"Please pray privately at home; do not mention names, cities, or circumstances on livestreams, church bulletins, or social media."_
4. **Lock-screen-safe private prayer message (if cleared by family & Regional Director):**

> **Subject:** `Quiet prayer request for our fellowship`  
> **Body:** `Friends, we are asking a small circle to pray steadily today for wisdom, protection, and calm endurance for members of our fellowship navigating a sudden disruption. Out of care for everyone involved, we are keeping details private and offline. Please pray in your home, do not forward this note, and do not share names or regions online or in public services. We will write again once it is safe to share more.`

---

## 2. Sudden Medical Emergency or Bereavement

Model all written updates on `GF-TPL-09` Template B (`COPY-CRISIS-01`):

- **Lock-screen-safe subject line:** Never put a diagnosis, death notice, or hospital location in the email subject or preview text (`"Quiet prayer request for a household in our fellowship"`).
- **Family consent before sending:** Never publish medical details, bereavement news, or financial-need asks without explicit consent from the household (or designated next of kin) and the Regional Director.
- **Prayer-first default:** The initial pastoral note carries **zero donate button** and **zero appeal**. If the family later approves a practical care fund, send a separate calm follow-up only after clearance.

---

## 3. Consent Withdrawal & Propagation Protocol (Honest Removal Limits)

Any individual, parent/guardian, local elder, or field worker may withdraw consent for a story, name, quote, audio clip, or photograph at any time with zero explanation required (`GF-TPL-15`)[^consent].

### Roles & Response Targets (Pending Legal Review under `OVR-22`)

- **Primary Owner:** Global Engagement / Web Content Lead (`info@globalfellowship.org`).
- **Backup Owner:** Co-Executive Directors (`executivedirectors@globalfellowship.org`) and Regional Director.
- **Urgent safety withdrawal:** Begin removal immediately upon notice (same-day purge of web pages, CMS records, uploaded media files, social posts, and active email drafts).
- **Routine withdrawal:** Complete direct GF channel removal within 24 hours (aligned with `GF-TPL-15` so weekend notices never wait until Monday; exact SLA subject to legal confirmation under `OVR-22`)[^open-verification].
- **Off-hours & weekend staffing candor (`OVR-17`):** Because Meadow Vista phone lines (`1 866 984 5622`) are staffed Pacific business hours only until `OVR-17` closes, route Friday-evening or weekend withdrawal requests immediately through the Regional Director's encrypted channel plus `executivedirectors@globalfellowship.org` and `info@globalfellowship.org` rather than leaving voicemail for Monday.

### 5-Step Propagation Checklist

1. **Unpublish in Core Payload CMS, delete media binary & purge live web cache immediately:** Remove or redact the record in `Asymmetric-al/core`, permanently delete any uploaded photograph binary from Core Media storage, run immediate cache invalidation (`POST /api/cms/revalidate` with `mode: "withdraw"`, including `collection:updates` and/or tenant tag for `/stories`), and confirm the live URL returns a not-found state or the cleared redacted state.
2. **Check `brand-kit/manifest.json` `storyRefs` (plural array) and active queues:** Locate every linked slide deck, PDF, email template, video, and social post referencing that story ID; delete or supersede active copies and pause scheduled emails.
3. **Update private non-Git consent ledger and deny-list (`OVR-14`):** Log the withdrawal date and confirm the subject's name/identifier is excluded from future exports.
4. **Send partner retirement requests (`COPY-RETIRE-01`) where third parties hold copies:** Contact sending churches or partner platforms logged in the private archive calmly to request immediate deletion and cessation of printing/livestreaming. On a **full withdrawal**, default to the **No-Send Option** (complete silence) rather than pushing a replacement story unless the family and Regional Director explicitly approve a Tier 3 collective prompt later.
5. **Confirm completion honestly (`COPY-WITHDRAW-01`: never promise the impossible):** Send written confirmation to the requester distinguishing clearly between:
   - **Direct Global Fellowship channels removed** (website, CMS, media library, official social accounts, active print masters, scheduled emails), and
   - **Non-recallable copies already distributed** (printed bulletins/cards already in homes, forwarded personal emails, or third-party search/web archives outside GF's technical control, for which GF submits removal requests where available).

### Withdrawal Confirmation Script (`COPY-WITHDRAW-01`)

- **Completed-removal confirmation (after live purge is verified):**

> `We received your request on [Date] to withdraw permission for [Story / Photo / Name Reference]. We have removed it from Global Fellowship's website, media archive, official social channels, and upcoming print/email templates, and recorded the withdrawal in our private consent log. We have also asked partner churches holding digital files to retire their copies. While we cannot physically retrieve paper copies already handed out in homes or control independent copies outside our systems, Global Fellowship will not publish or distribute this material again. Please reply if you see any remaining instance we missed so we can address it immediately.`

- **Immediate off-hours intake acknowledgment (when freezing publication pending Technical Ops purge verification):**

> `We received your request on [Date] to withdraw permission for [Story / Photo / Name Reference]. We have immediately frozen outbound emails, print queues, and publication, and escalated to our leadership and web operations team to complete permanent removal from our publishing system and media library. We will send a follow-up confirmation as soon as deletion is verified, and we are already contacting partner churches on our private distribution list to ask them to retire any earlier copies. No explanation is ever needed, and complete silence is always respected.`

### Calm Partner-Church & Supporter Retirement Script (`COPY-RETIRE-01`)

> **Subject (lock-screen-safe):** `Please retire an earlier prayer update for our fellowship`  
> **Body:** `Dear [Pastor / Partner First Name], out of care for household privacy and updated preferences from the people involved, we are asking partner churches and supporters to retire the earlier [story / photograph / prayer card] shared on [Approximate Date]. Please delete any saved digital copy or photograph from church computers, slide decks, emails, or chat groups, discard any remaining printed copies, and ensure nothing from it appears on church livestreams or social media. Thank you for guarding our brothers and sisters with calm care and continued prayer at home.`

---

## 4. Data, Email, or Security Breach Notification

If donor contact records, restricted worker details, or internal communication channels are exposed or suspected compromised:

1. **Contain first (Technical & Security Lead):** Revoke compromised credentials, preserve logs, verify whether restricted field identifiers (Tier 2/3) or payment data were involved (note: GF does not store raw payment card numbers on `GF-SITE`; payment processing stays with the external PCI-compliant processor).
2. **Assess legal notification obligations with counsel (`OVR-22`):** Determine applicable state/federal breach-notification timelines (including California residency rules given GF's Meadow Vista, CA registration) before issuing public statements.
3. **Notify affected people directly in plain English:** State what happened, what specific data was and was not exposed, what concrete steps GF has already taken, what protective steps recipients should take (including field security step-down if any Tier 2/3 link was exposed), and a direct human contact (`executivedirectors@globalfellowship.org` / `1 866 984 5622`). Never bury a breach in legal jargon or minimize field risk.

---

## 5. Safeguarding, Abuse, Harassment, or Financial Integrity Concerns

Global Fellowship affirms accountability across local leadership, cross-cultural workers, Home Office staff, and donors[^source-synthesis].

- **How concerns are received publicly (without inventing an unmonitored third-party hotline):** Anyone with a safeguarding, ethical, or financial-stewardship concern may contact the **Co-Executive Directors** (`executivedirectors@globalfellowship.org` or `1 866 984 5622`), or if the concern involves executive leadership, request direct routing to the **Board Chair** (documented in public governance records: Eric Bergen) via `P.O. Box 1, Meadow Vista, CA 95722` (Attn: Board Chair, Confidential).
- **Immediate safety priority:** Where imminent physical danger or child harm is suspected, prioritize local emergency and mandatory civil reporting obligations alongside pastoral care; never handle abuse allegations informally or ask a vulnerable reporter to mediate directly with an alleged perpetrator.
- **Zero retaliation & confidential handling:** Acknowledge receipt promptly, protect the reporter's identity to the fullest extent consistent with safety and legal duty, and keep sensitive investigation records strictly outside public repositories and general staff channels.

---

## 6. Public & Media Non-Comment Holding Statements

Staff, regional teams, and partner churches must **never** speak to journalists on the record about field incidents, sensitive regions, or personnel crises without Co-Executive Director approval.

### Standard Media / Public Holding Statement (`COPY-MEDIA-HOLD-01`)

> _"Global Fellowship cares deeply about the safety and well-being of the communities and coworkers we serve alongside. Out of respect for the privacy and security of individuals and local congregations, we do not comment publicly on specific personnel, regional locations, or security matters. Media inquiries may be directed to our Meadow Vista office at `executivedirectors@globalfellowship.org` or `1 866 984 5622`."_

### Public Question on Sensitive Regions (Church / Social Comment Script)

> _"Thank you for asking and caring about local believers in that region. Because public details can create real risk for households serving there, we do not share specific cities, worker names, or local security details publicly. If you would like to pray faithfully offline, write to `info@globalfellowship.org` and our team will gladly share how our prayer fellowship works."_
