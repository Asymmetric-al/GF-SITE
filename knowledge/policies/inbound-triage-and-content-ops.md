---
title: Inbound Triage, Worker Giving-Link Safety, Web Content Ops, and Legacy Migration Policy
description: Operational governance covering inbound email/phone triage routing, tier-by-tier worker giving-link and QR code sharing rules, annual ledger and web content maintenance runbook, and the legacy globalfellowship.org content migration decision table (58 projects, 52 profiles, 8 archived field articles, and retired routes).
type: Policy
status: draft
tags:
  - operations
  - triage
  - qr-codes
  - cms-ops
  - migration
  - redirects
x-gf-approval-state: delegated-working-guidance
x-gf-disclosure: public
generated:
  by: antigravity/gemini-4-neon
  at: "2026-11-23T03:05:00Z"
verified: []
sources:
  - id: source-synthesis
    resource: /references/source-synthesis.md
    title: Audited inventory of 52 missionary profiles, 58 project designations, 8 field stories, and verified Home Office email addresses
  - id: security
    resource: /policies/field-security-and-disclosure.md
    title: Two-axis disclosure tiers, zero public worker slug mapping in Git, and anti-mosaic constraints
  - id: proof-2025
    resource: /messaging/proof-ledger-2025.md
    title: Single-owner annual proof ledger update discipline
  - id: open-verification
    resource: /references/open-verification-register.md
    title: Open operational gates OVR-06, OVR-14, OVR-17, and OVR-21
---

# Inbound Triage, Worker Giving-Link Safety, Web Content Ops, and Legacy Migration Policy

This operational policy keeps Global Fellowship's lean Home Office, regional teams, and web/CMS maintainers aligned on day-to-day inbox triage, safe giving-link sharing, annual site updates, and legacy URL transitions[^source-synthesis][^security].

---

## 1. Public Inbox & Phone Triage Routing Table

All verified public channels route to real Home Office staff without inventing unconfirmed addresses (`OVR-17`)[^open-verification]:

| Public Channel | Primary Owner Role | Inquiry Categories Routed Here | Target First Human Reply | Escalation Path |
| --- | --- | --- | --- | --- |
| `info@globalfellowship.org` | Global Engagement & Office Coordinator | General questions, Bridge Project sign-ups & letters, Church partnerships, Exposure Trips, Faith on the Frontlines, Serve / first calls, statement requests | 2 business days (same-day urgent triage) | Forward financial inquiries to `finance@`; sensitive security/safeguarding to `executivedirectors@` |
| `finance@globalfellowship.org` | Finance & Donor Care Lead | Receipts, recurring gift updates, check/stock/DAF/IRA gifts, 2025 Statements of Activity, fund re-designations, accounting questions | 2 business days | Escalate board/audit or dispute questions to `executivedirectors@` |
| `prayer@globalfellowship.org` | Prayer Coordinator | Monthly prayer email digest, urgent vetted prayer alerts, printed prayer-card requests, prayer team questions (households pray weekly using the printed card or monthly digest) | 3 business days | Escalate any worker safety concern in prayer replies immediately to Regional Director |
| `executivedirectors@globalfellowship.org` | Co-Executive Directors (Jeremy Beaumont & Conrad O'Brien) | Safeguarding or accountability concerns, media/press inquiries, crisis escalations, elder/board referrals | Same day (urgent) / 2 business days (routine) | Route executive-level safeguarding concerns to Board Chair (Eric Bergen) via confidential mail |
| `1 866 984 5622` (`1-866-98GLOBAL`) | Meadow Vista Home Office | Live phone support for donors (including PCI-safe phone card updates), pastors, and urgent Home Office calls | Pacific business hours (voicemail returned within 1 business day) | Urgent field safety messages escalated immediately to Co-Executive Directors & Regional Director |

_(Internal/legacy functional aliases documented in sources: `development@globalfellowship.org` and `support@globalfellowship.org` remain monitored internally where active, while public website surfaces standardize on `info@`, `finance@`, `prayer@`, and `executivedirectors@` so visitors never face inbox confusion.)_

---

## 2. Worker Giving-Link & QR Code Sharing Guide (By Security Tier)

Workers, sending churches, and regional hubs must match how they share online giving links and QR codes to the worker's cleared security tier[^security]:

| Security Tier | Permitted Public Giving URL / QR Code | Strictly Prohibited |
| --- | --- | --- |
| **Tier 1 (Open Public)** | May share cleared public worker or project page (`globalfellowship.org/give/workers/[cleared-id]` or `/give/projects/[slug]` once live under `OVR-21`) and a static `#000000` QR code with 4-module quiet zone on church bulletins or newsletters. | **Never** use third-party URL redirect shortening tools (`bit.ly`, `tinyurl`), UTM ad trackers, or dynamic redirect QR services that log donor IP addresses or hijack links later. |
| **Tier 2 (Partial / Alias)** | Share the cleared Tier 2 alias/code link ONLY in **vetted direct emails, printed church cards, or private small groups**. QR codes may point to the cleared Tier 2 code or general `/give` page with written check/memo instructions. | **Never** post the worker's giving link, QR code, real surname, or city on public social media, YouTube descriptions, or public church livestreams. |
| **Tier 3 (Restricted / Withheld)** | **Do not publish or print an individual identifying URL.** Direct vetted givers to `globalfellowship.org/give` (or mail checks to `P.O. Box 1, Meadow Vista, CA 95722`) with the **approved ministry code on a separate enclosed slip** (never written with a real name or country in a public post). | **Never** generate a QR code containing a restricted worker's name, city, or country; **never** embed restricted worker slugs inside public GitHub redirect maps. |
| **Level 4 (Zero-Attribution Local)** | **Zero Global Fellowship links, zero QR codes, zero EIN, zero California address.** Local congregations handle local stewardship entirely in their own name and language. | Any reference to Global Fellowship, `globalfellowship.org`, or US 501(c)(3) giving mechanics. |

---

## 3. Web Content Operations & Annual Ledger Update Runbook (Target Website-Phase Workflow)

1. **Annual Proof Ledger Refresh (Every Q1 after Board/Finance release of prior-year Statements of Activity):**
   - Create `knowledge/messaging/proof-ledger-[YYYY].md` (keeping prior year archived separately; never overwrite historical definitions or compare changed counting methodologies side by side without Finance confirmation)[^proof-2025].
   - Regenerate `brand-kit` templates referencing the active annual report, and sync website proof data and downloadable packets once the public website is implemented (`OVR-24`).
   - Run full automated verification (`bun run okf:validate`, `bun run verify:brand`, `bun run check`, `bun run typecheck`, `bun run test:run`, `bun run test:smoke`).
2. **Routine CMS Story / Project / Worker Publishing (`Asymmetric-al/core`, wired during website implementation):**
   - Verify signed `GF-TPL-15` Revocable Consent is filed in private storage (`OVR-14`) before setting any Core CMS document to `published`.
   - Confirm EXIF/GPS stripping on all uploaded media and alt text written cleanly without hidden location leaks.
   - Publish in Core Payload CMS and refresh cached `GF-SITE` pages per the active Core admission and revalidation contract (`docs/core-integration.md`).
3. **Emergency Removal / Consent Withdrawal:**
   - Unpublish or redact in Core Payload CMS and invoke immediate withdrawal cache purge (`mode: "withdraw"` / `expire: 0` or the active Core release-withdrawal mechanism), then verify the live route no longer serves the removed content.

---

## 4. Legacy `globalfellowship.org` Content Migration Policy (Inputs for Website Construction)

Audited inventory of the legacy website (`Global_Fellowship_Content_Master.md` & `Content_Inventory.csv`, 670 records) mapped to migration policies and safety constraints for the upcoming website-construction phase (`OVR-21`, `OVR-24`; final route map and layout design belong to website construction, see [Website Construction Handoff](../references/website-builder-handoff.md))[^source-synthesis][^open-verification]:

| Legacy Inventory Class | Audited Count | Recommended Migration Policy | Security & Consent Condition |
| --- | --- | --- | --- |
| **Core institutional pages** (`/about`, `/how-we-work`, `/statement-of-faith`, `/financials`, `/contact`, `/donor-privacy`) | 10+ core routes | **Preserve core institutional content** in the future Next.js site with permanent `308` redirects from legacy paths (`/our-mission`, `/our-three-pillars`, `/our-values`, `/100-model`, etc.) to their chosen destinations. | All Protected Foundations byte-exact; zero retired claims (`0% overhead`, `no written policies`, `10-25%` comparisons). |
| **Six Regional Pages** (`/central-asia`, `/east-asia`, `/south-asia`, `/europe`, `/middle-east`, `/north-africa`, plus `/southeast-asia`) | 6 regional routes | **Preserve broad regional ministry context** and configure permanent `308` redirects from legacy regional URLs to the chosen website regional routes. | Zero map pins, zero restricted town names, zero per-country worker counts. |
| **Legacy Project Designations** (`/project/:slug`) | 58 designations | **Migrate active cleared funds into `Asymmetric-al/core` CMS** during website/CMS integration; redirect unknown/retired `/project/:slug` paths cleanly (`308`) to the chosen projects index or Finance help desk. | Finance audits active vs. closed funds prior to Core import; closed funds trigger donor re-designation notice (`COPY-DONOR-REDESIG-01`). |
| **Legacy Missionary Profiles** (`/user/:slug`, 52 profiles incl. 12 protected) | 52 profiles | **Migrate ONLY actively cleared, re-consented profiles into `Asymmetric-al/core` CMS** using opaque worker IDs (never public slug-to-name maps in Git); redirect legacy `/user/:slug` cleanly to donor help / safe lookup. | **Hard rule (`OVR-06` & `OVR-14`):** Zero per-worker slug redirect table in public Git; every migrated profile requires current tier clearance and fresh consent. |
| **Legacy Field Stories / Articles** (`/article/:slug`) | 8 articles (`P162-P169`) | **Hold archived articles pending fresh re-consent (`OVR-06`)** before importing into Core CMS; redirect legacy `/article/:slug` paths cleanly (`308`) to the chosen stories destination. | Never auto-republish archived identifiable field stories or photos without signed `GF-TPL-15` re-consent. |
| **Legacy Giving / Support / Login URLs** (`/how-to-make-a-donation`, `/how-to-edit-existing-donation-or-pledge`, `/how-to-update-payment-method`, `/stock-donations`, `/checkout`, `/login`) | 12+ routes | **Configure permanent `308` redirects** during website implementation to the chosen giving, non-cash giving, and donor-help routes. | Preserves donor bookmarks and printed mailers without dead 404s. |
| **Accounting App Legal Routes** (`/eula`, `/privacypolicy`) | 2 routes | **Retain verbatim** as standalone minimal routes (`noindex`, clean separation from public donor privacy policy). | Preserves QuickBooks / Accounting App compliance links intact. |
| **Retired Work-in-Progress & Uncurated Stock Assets** (`/checkout-test`, `/home-draft`, `/ytd-statement-admin`, 184 uncurated stock files) | 3 retired routes + 184 stock assets | **Retire (`410 Gone`)** with `X-Robots-Tag: noindex, nofollow` during website implementation; **184 legacy uncurated stock files permanently retired** and excluded from migration. | Replaced with vetted zero-ShareAlike documentary street photography (`brand-kit/photography/`) and future consented field photography (`OVR-06`). |
