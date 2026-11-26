---
title: Brand Governance, Adoption, Maintenance, and Approval Policy
description: Authority vs. human-approval states, single-source update propagation rules, accountable operational roles, lean-staff Office adoption, and OKF maintenance cadence.
type: Policy
status: draft
tags:
  - policy
  - governance
  - maintenance
  - okf
  - approval
x-gf-approval-state: delegated-working-guidance
x-gf-disclosure: public
generated:
  by: antigravity/gemini-4-neon
  at: "2026-11-23T06:55:00Z"
verified: []
sources:
  - id: foundations
    resource: /brand/foundations.md
    title: Immutable protected statements requiring zero drift
  - id: open-verification
    resource: /references/open-verification-register.md
    title: Human-only pre-publication gates and owners
  - id: source-synthesis
    resource: /references/source-synthesis.md
    title: Verified leadership names and lean Home Office operating reality
---

# Brand Governance, Adoption, Maintenance, and Approval Policy

Global Fellowship operates with a lean Home Office (`$251.6k` operating expenses in 2025) and distributed regional teams. Governance must stay lightweight, honest about authority, and usable without design software[^source-synthesis].

## 1. Authority, Verification, and Human Approval States

Never conflate automated checks, independent reviews, or Git merges with human leadership approval. Every active concept stays `status: draft` (except `messaging/retired-claims.md`, which is `status: deprecated`) and `verified: []` until leadership approves and records human verification (`OVR-15A/B/C`)[^open-verification]:

| `x-gf-approval-state` | OKF `status` / `verified` | Meaning & Usage Rule |
| --- | --- | --- |
| `locked-foundation` (`x-gf-locked: true`) | `draft` / `[]` (until `OVR-15C`) | Permanently verbatim Mission, Vision, Three Pillars, and 8-article Statement of Faith in [Protected Foundations](../brand/foundations.md). Never alter. |
| `delegated-working-guidance` | `draft` / `[]` (until `OVR-15A`) | Completed brand strategy, identity, audiences, messaging, offerings, copy, policies, and website handoff awaiting human leadership approval. |
| `source-record` | `draft` / `[]` | Factual archive synthesis, dated 2024/2025 proof ledgers, sector research, and `OVR-01` to `OVR-24`. |
| `retired-legacy` | `deprecated` / `[]` | Superseded legacy claims kept discoverable with `superseded_by` links (`messaging/retired-claims.md`). |
| `approved` _(future)_ | Omit `status` (`stable`) / `human:<id>` | Assigned **only** after explicit written leadership approval and closure of relevant gates in [Open Verification Register](../references/open-verification-register.md). |

_Machine checks vs. approval:_ Passing `okf:validate`, `verify:brand`, Vale, Lychee, Playwright, or multi-model reviews (`docs/brand-council/`) confirms technical and editorial hygiene only, never leadership sign-off.

## 2. Accountable Operational Roles

Verified leadership names (Don Oates, Jeremy Beaumont, Conrad O'Brien, Eric Bergen) are cited only where documented in [Source Synthesis](../references/source-synthesis.md); operational role titles below await named custodian assignments under `OVR-15`:

- **Co-Executive Directors (Jeremy Beaumont & Conrad O'Brien) & Board Chair (Eric Bergen):** Overall brand approval (`OVR-15`), press/crisis single spokesperson, safeguarding escalation, and Board governance.
- **Finance & Donor Care Lead (`finance@globalfellowship.org`):** Annual proof ledgers, financial statement footnotes (`OVR-01`..`03`, `16`), tax receipts, and gift re-designations (`OVR-22`).
- **Global Engagement Lead (`info@globalfellowship.org`):** Church partnerships, elders' vetting, Exposure Trips, Faith on the Frontlines (`OVR-08`, `10`), social/video, and CMS publishing.
- **Prayer Coordinator (`prayer@globalfellowship.org`):** Prayer cards, Bridge Project / Bridge Kids, and vetted prayer alerts.
- **Regional Directors & Security Lead:** Two-axis tier clearances, local editorial veto, native regional/cultural review (`OVR-11`), non-Git deny-list & consent archive (`OVR-14`), urgent step-downs (`OVR-17`), and regional member care (`OVR-20`).
- **Mobilization & Operations / Web Lead:** Candidate discernment (`OVR-23`), Office/print adoption (`OVR-13`, `18`), live URL slugs (`OVR-21`), and future website construction (`OVR-24`).

## 3. Single-Source Update & Propagation Rules

| What Changed | Single Canonical Source | Downstream Propagation Required |
| --- | --- | --- |
| Annual impact or financial figures | New `knowledge/messaging/proof-ledger-YYYY.md` (archive prior year separately) | Update Guides (`GF-GDE-01`/`04`), Annual Report (`GF-TPL-05`), Stewardship Email (`GF-TPL-09`), Deck & `.pptx` (`GF-TPL-10`), Social/Mobile (`GF-TPL-11`/`14`), Church Kits (`GF-TPL-06`/`17`), and OKF copy/hierarchy docs. |
| Visual color, type, or spacing tokens | `brand-kit/tokens/tokens.json` (W3C DTCG 2025.10) | Run `bun scripts/generate-brand-tokens.ts` (syncs `brand-tokens.css`, `contrast-report.json`, and `visual-identity.md`), rebuild marks/deck/Office/video scripts, and run `bun run verify:brand`. |
| Vocabulary or banned phrases | `knowledge/messaging/terminology-and-glossary.md` & `styles/GF/` Vale rules | Run `bun run check:prose` and `bun run verify:brand`. |
| Retired legacy claims | `knowledge/messaging/retired-claims.md` & `styles/GF/RetiredClaims.yml` | Verify zero occurrences across `knowledge/` and `brand-kit/`. |
| Protected Foundations | **LOCKED. NEVER MODIFY.**[^foundations] | `bun run verify:brand` and `scripts/okf.test.ts` fail automatically on any drift. |

## 4. Lean-Staff Adoption & OKF Maintenance Cadence

- **Zero-Figma everyday adoption:** Staff work directly from the 6 editable OOXML starters in `brand-kit/office/`, 1-page quick-start sheets (`GF-GDE-02`, `GF-GDE-03`), free Google Workspace fonts (`Source Serif 4`, `Plus Jakarta Sans`, Noto scripts), transparent PNG lockups (`brand-kit/logos/png/`), and pure-black copier masters (`GF-TPL-17`, `GF-TPL-20`). See `brand-kit/README.md` for the 60-second quick-start.
- **After any edit to `knowledge/`, `brand-kit/`, or `styles/GF/`:**
  1. Prepend a concise `## YYYY-MM-DD` entry to `knowledge/log.md` (newest first, no frontmatter).
  2. Keep valid `type:` values (`docs/okf.md`), non-future UTC `generated.at` (bump only when meaning changes), honest `status`/`verified`, relative body links, leading `/` frontmatter paths, and omit `stale_after` unless a real owner review date is confirmed (OKF v0.3 §5.5).
  3. Run `bun run okf:validate`, `bun run okf:scan`, `bun run check:foundation`, `bun run check:links`, `bun run check:prose`, `bun run test:run`, and (when assets/tokens change) `bun run verify:brand`.
