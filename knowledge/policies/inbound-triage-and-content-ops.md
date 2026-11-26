---
title: Inbound Triage, Worker Giving-Link Safety, and Web Content Ops Policy
description: Operational governance for public inbox/phone triage routing, tier-by-tier worker giving-link and QR safety, and annual ledger/web content maintenance.
type: Policy
status: draft
tags:
  - operations
  - triage
  - qr-codes
  - cms-ops
x-gf-approval-state: delegated-working-guidance
x-gf-disclosure: public
generated:
  by: antigravity/gemini-4-neon
  at: "2026-11-23T06:55:00Z"
verified: []
sources:
  - id: source-synthesis
    resource: /references/source-synthesis.md
    title: Verified Home Office email addresses, phone line, and operating scope
  - id: security
    resource: /policies/field-security-and-disclosure.md
    title: Two-axis disclosure tiers and anti-mosaic constraints
  - id: withdrawal
    resource: /policies/consent-withdrawal-runbook.md
    title: Single canonical 4-stage emergency removal runbook
  - id: proof-2025
    resource: /messaging/proof-ledger-2025.md
    title: Single-owner annual proof ledger update discipline
  - id: open-verification
    resource: /references/open-verification-register.md
    title: Open operational gates OVR-06, OVR-14, OVR-17, OVR-21, and OVR-24
---

# Inbound Triage, Worker Giving-Link Safety, and Web Content Ops Policy

Operational rules keeping Home Office, regional teams, and web maintainers aligned on daily inbox routing, safe giving links, and annual content maintenance[^source-synthesis][^security]. For the audited legacy `globalfellowship.org` URL migration table, see [Website Construction Handoff](../references/website-builder-handoff.md).

---

## 1. Public Inbox & Phone Triage Routing Table

Standardize public surfaces on these four verified email desks and one phone line without inventing unconfirmed addresses (`OVR-17`)[^open-verification]:

| Public Channel | Primary Owner Role | Inquiries Routed Here | Target First Reply | Escalation Path |
| --- | --- | --- | --- | --- |
| `info@globalfellowship.org` | Global Engagement & Office Coordinator | General inquiries, Bridge Project matches & letters, church partnerships, Exposure Trips, Faith on the Frontlines, Serve calls, statement requests | 2 business days (same-day urgent triage) | Finance questions -> `finance@`; safety/safeguarding -> `executivedirectors@` |
| `finance@globalfellowship.org` | Finance & Donor Care Lead | Receipts, recurring updates, check/stock/DAF/IRA gifts, 2025 Statements of Activity & Financial Position, re-designations, accounting questions | 2 business days | Board/audit or disputes -> `executivedirectors@` |
| `prayer@globalfellowship.org` | Prayer Coordinator | Monthly prayer email digest, vetted prayer alerts, prayer-card requests, prayer team questions | 3 business days | Any worker safety concern -> Regional Director immediately |
| `executivedirectors@globalfellowship.org` | Co-Executive Directors (Jeremy Beaumont & Conrad O'Brien) | Safeguarding/accountability concerns, media/press inquiries, crisis escalations, elder/board referrals | Same day (urgent) / 2 business days (routine) | Executive-level safeguarding -> Board Chair (Eric Bergen) via confidential mail |
| `1 866 984 5622` (`1-866-98GLOBAL`) | Meadow Vista Home Office | Live phone support (including PCI-safe card updates), pastors, urgent office calls | Pacific business hours (voicemail returned within 1 business day) | Urgent field safety -> Co-Executive Directors & Regional Director |

_(Internal/legacy functional aliases `development@globalfellowship.org` and `support@globalfellowship.org` remain monitored internally where active, but public surfaces standardize on the four addresses above.)_

---

## 2. Worker Giving-Link & QR Code Sharing Guide (By Security Tier)

Match how giving links and QR codes are shared strictly to the worker's cleared disclosure tier[^security]:

| Security Tier | Permitted Giving URL / QR Code | Strictly Prohibited |
| --- | --- | --- |
| **Tier 1 (Open Public)** | Cleared worker/project page (once live under `OVR-21`) and static `#000000` QR code with 4-module quiet zone on church bulletins/newsletters. | Third-party redirect shortening tools (`bit.ly`, `tinyurl`), UTM ad trackers, or dynamic redirect QR services. |
| **Tier 2 (Partial / Alias)** | Cleared Tier 2 alias/code link ONLY in **vetted direct emails, printed church cards, or private small groups**; QR codes point to cleared code or general `/give` with enclosed check instructions. | Posting the worker's giving link, QR code, real surname, or city on social media, YouTube descriptions, or church livestreams. |
| **Tier 3 (Restricted / Withheld)** | **No individual identifying URL.** Direct vetted givers to general `/give` (or checks mailed to `P.O. Box 1, Meadow Vista, CA 95722`) with the **approved ministry code on a separate enclosed slip**. | QR codes containing a restricted worker's name, city, or country; restricted worker slugs in public GitHub redirect maps (`OVR-14`). |
| **Level 4 (Zero-Attribution Local)** | **Zero Global Fellowship links, QR codes, EIN, or California address.** Local congregations handle stewardship entirely in their own name. | Any reference to Global Fellowship, `globalfellowship.org`, or U.S. 501(c)(3) mechanics. |

---

## 3. Annual Ledger & Web Content Ops Cadence

1. **Annual Proof Ledger Refresh (Q1 after Board/Finance release of prior-year statements):** Create `knowledge/messaging/proof-ledger-[YYYY].md` (archiving prior years separately without blending changed definitions[^proof-2025]), update `brand-kit/` templates and future web pages, and run `bun run okf:validate`, `bun run verify:brand`, `bun run check`, `bun run typecheck`, `bun run test:run`, and `bun run test:smoke`.
2. **Routine CMS Publishing (`Asymmetric-al/core`, once live under `OVR-24`):** Verify signed `GF-TPL-15` consent outside Git (`OVR-14`), strip EXIF/GPS, write visible-only alt text manually, and publish per [CMS Editor Field Guide](../marketing/cms-editor-field-guide.md) and `docs/core-integration.md`.
3. **Emergency Removal / Consent Withdrawal:** Execute the single canonical 4-stage procedure in [On-Call Consent Withdrawal Runbook](consent-withdrawal-runbook.md)[^withdrawal].
