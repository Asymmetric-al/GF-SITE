---
title: Global Fellowship Source Synthesis and Decision Log
description: Complete archive coverage and disposition table for all supplied Global Fellowship sources, verified organizational facts, and enduring executive decisions.
type: Reference
status: draft
tags:
  - sources
  - archive
  - provenance
  - decisions
  - financials
  - history
x-gf-kind: source-synthesis
x-gf-approval-state: source-record
x-gf-disclosure: public
generated:
  by: antigravity/gemini-4-neon
  at: "2026-11-23T06:55:00Z"
verified: []
sources:
  - id: identity-context
    resource: "Global_Fellowship_Identity_and_Website_Context.md (supplied archive, 46.9 KB, 445 lines, S1-S17)"
    title: Primary synthesis of VVR Orientation Deck v10, Whitepaper Rev 10-24, Core Values Master List, and 2024-2026 role descriptions
  - id: content-master
    resource: "Global_Fellowship_Content_Master.md (supplied archive, 2.23 MB, 670 unique records: S001-S032, P001-P266, D001-D043, F001-F294, B001, I001-I024, E001-E009, N001)"
    title: Audited transcriptions of globalfellowship.org pages, forms, linked PDFs/DOCX, annual reports, financial statements, and image audits
  - id: content-inventory
    resource: "Global_Fellowship_Content_Inventory.csv (supplied archive, 3.90 MB, 1,808 rows, 25 columns)"
    title: Complete URL, media, document, and asset catalog reconciled against Content Master
  - id: legacy-brand-kit
    resource: "Global Fellowship Logo - color (no padding) (5).png (1795x792) and Fonts, Colors, Picture Examples - GF Brand Kit.pdf (supplied 2026-11-21)"
    title: Official Cross-in-Oval logo silhouette, legacy colors/fonts, and 5 documentary field photo examples
---

# Global Fellowship Source Synthesis and Decision Log

**Purpose & Authority:** Single audit trail covering every supplied Global Fellowship archive, what was incorporated vs. retired or excluded, verified organizational facts, and enduring executive decisions shaping the brand system (`status: draft`, `x-gf-approval-state: source-record`).

---

## 1. Complete Source Coverage & Disposition Table

| Source / Artifact | Scope Examined | Disposition | Where Represented / Exclusion Reason |
| --- | --- | --- | --- |
| `Global_Fellowship_Identity_and_Website_Context.md` (`S1`-`S17`, 445 lines) | VVR Orientation Deck v10, Whitepaper Rev 10-24, Core Values Master List, role descriptions, Bridge Project, Exposure Trips, Faith on the Frontlines, Member Care, 2024/2025 metrics[^identity-context]. | **Incorporated** (private Google Drive URLs & raw originals excluded from public Git) | [Protected Foundations](../brand/foundations.md), [Strategy](../brand/strategy-and-positioning.md), [Character & Values](../brand/character-and-values.md), `audiences/`, `offerings/`. |
| `Global_Fellowship_Content_Master.md` (`670` unique records, 49,846 lines) | Shared chrome (`S001`-`S032`, 32), URL records (`P001`-`P266`, 266: core/regional pages, 52 worker profiles incl. 12 protected, 58 projects, 8 articles), linked PDFs/DOCX (`D001`-`D043`, 43 incl. 2024/2025 Annual Reports & financial statements), forms/handoffs (`F001`-`F294`, 294 + `B001`, 1), image audits (`I001`-`I024`, 24), error captures (`E001`-`E009`, 9), and March 2026 HubSpot login-gated newsletter (`N001`, 1; body not recovered)[^content-master]. | **Incorporated** (raw archive & restricted worker identifiers excluded per `OVR-14`; archived stories/profiles held per `OVR-06`; retired claims logged; `F001`-`F294`/`B001` carried forward as web inputs; `E001`-`E009` retired; `N001` gated behind HubSpot sign-in) | [2025 Proof Ledger](../messaging/proof-ledger-2025.md), [2024 Historical Context](../messaging/proof-ledger-2024.md), [Retired Claims](../messaging/retired-claims.md), [Website Construction Handoff](website-builder-handoff.md). |
| `Global_Fellowship_Content_Inventory.csv` (`1,808` rows, 25 cols) | Complete URL, media, document, and asset catalog reconciled against `Content_Master.md` (199 sitemap URLs, 184 uncurated stock files)[^content-inventory]. | **Incorporated** (184 legacy stock files **Retired**) | Migration rules in [Website Construction Handoff](website-builder-handoff.md). |
| Official Logo PNG (`1795x792`) & Legacy Brand Kit PDF | `140:101` Cross-in-Oval mark; legacy colors (`#007AC3`, `#FFE11D`, `#231F20`) and fonts (`Gilam Bold`, `Aileron`, `Montserrat`); 5 real documentary field photos[^legacy-brand-kit]. | **Logo silhouette preserved verbatim; legacy colors/fonts retired; archived PDF photos held for fresh `GF-TPL-15` consent (`OVR-06`)** | [Visual Identity](../brand/visual-identity.md), `brand-kit/logos/`, Three-Path Photography Sourcing Rule. |
| Curated Street Photography Vault (`brand-kit/photography/`, `GF-PHO-01`-`06`) | 6 sRGB-normalized, EXIF-stripped, zero-ShareAlike (`4 CC0 1.0` + `2 CC BY 2.0`) street photographs replacing generic illustrations and superseded ShareAlike frames. | **Incorporated** (superseded frames & 6 rejected prototype photos logged in `PHOTO-LICENSES.md`) | `brand-kit/photography/PHOTO-LICENSES.md`, `brand-kit/manifest.json`. |
| Earlier Exploratory Website Prototype (`web-v1`/`web-v2`) | Premature Next.js pages in `src/` and 6 rejected unconsented `public/photos/*.jpg` files created before the 2026-11-22 branding-only pause. | **Excluded from `main`** (preserved only on local archival branch `archive/paused-web-v2-preview`) | `src/` and `public/` stay on the clean starter scaffold until `OVR-24`. |
| Brand Council History (`docs/brand-council/`) & Upstream OKF v0.3 Spec | 15 scored council rounds, independent 3-model completion review, and OKF v0.3 `SPEC.md` (`open-knowledge-format/open-knowledge-format` commit `527e81aff55992be21507e97004286789126f88c`, `2026-11-18`). | **Retained outside `knowledge/` as history / verified spec parity** | `docs/brand-council/`, `docs/okf.md`. |

**Public-Git Privacy Boundary (`OVR-14`):** Raw supplied archive files and private Google Drive URLs are intentionally kept outside this public repository because they contain restricted worker names/codes and non-public records.

---

## 2. Verified Organizational Substance

- **Founding & Continuity:** Founded in 1989 in Auburn, California by Don and Kathy Oates after serving in Liberia under a local church leader; expanded into North American cross-cultural sending in 2012; opened the Southeast Asia regional hub in Chiang Mai in 2024[^identity-context][^content-master].
- **Documented Leadership:** Founder & President Don Oates; Co-Executive Directors Jeremy Beaumont and Conrad O'Brien; Board Chair Eric Bergen[^content-master].
- **Legal & Contact Identity:** Global Fellowship, Inc., 501(c)(3) nonprofit, `EIN 68-0214543`, Candid ID `8043461`, mailing address `P.O. Box 1, Meadow Vista, CA 95722` (street address on `P041` tracked in `OVR-07`), toll-free phone `1-866-98GLOBAL` (`1 866 984 5622`, Pacific business hours), standardized public emails `info@`, `finance@`, `prayer@`, and `executivedirectors@globalfellowship.org` (legacy internal aliases `development@`, `support@`)[^content-master].
- **Operating Model & Culture:** `"Global coordinates. Regional contextualizes. Local leads."` Broad definition of missionary encompassing both near-culture (indigenous) and cross-cultural church planters (most workers come from the regions where they serve); **integration without assimilation**; seven core values (Gospel first, Relationships, Local leadership, Humility, Health above results, Biblical principle over policy, Trust and transparency); active polycentric and South-to-South sending[^identity-context][^content-master].
- **Core Ministry Expressions:** Regional church planting (Central/East/South/Southeast Asia, Europe, Middle East, North Africa, Americas), The Bridge Project & Bridge Kids (zero financial expectation), listening-first Exposure Trips, Faith on the Frontlines gatherings (`OVR-08`, `OVR-10`), and regionally led Member Care for singles and families[^identity-context][^content-master].

---

## 3. Dated Impact, Financial & Field-Security Baseline

Canonical public wording rules live in [2025 Proof Ledger](../messaging/proof-ledger-2025.md), [2024 Historical Context](../messaging/proof-ledger-2024.md), [Retired Claims](../messaging/retired-claims.md), and [Open Verification Register](open-verification-register.md):

- **2025 Annual Report (`D002`):** `$5.9M` given to the field, `43` countries served (VVR deck `S1` cites `47`, `OVR-04`), `584` workers mobilized (public label: `workers served`), `25,000+` heard the Gospel, `8,000+` Bibles, `1,000+` baptisms, `230` churches planted, `63 countries by 2030` strategic goal (`S1` adds `1,000 workers by 2030`)[^identity-context][^content-master].
- **2024 Annual Report (`D001`):** `$4,953,368` given to the field, `36` countries, `525` missionaries, `23%` growth, `19,170` heard the Gospel, `9,223` Bibles, `1,700` baptisms, `1,254` churches planted (reporting scope shifted vs. 2025; never chart side by side per `OVR-05`), `$263.2k` operating expenditures (`D042`)[^content-master].
- **2025 Statement of Activity (`D043`) & Statement of Financial Position (`P044`):** Consolidated `$5.82M` received / `$5.73M` disbursed across Global Fellowship (`$2.08M`/`$2.13M`) and affiliated ministries MissionStream (`$3.08M`/`$2.92M`) and BOLK (`$660k`/`$683k`). Home Office operating expenses totaled `$251.6k` (incl. `$52.7k` merchant fees), alongside `$280.2k` in separately reported funding lines (NOT a 1-to-1 reconciliation while Finance confirms scope under `OVR-01`/`OVR-03`): `Admin Fees - 8%` (`$192.5k`), `Home Office` gifts (`$13.6k`), `Processing Donation` (`$26.6k`), `Athena Rental Income` (`$33k`), and `WMN Inc` (`$14.5k`). **No public artifact may headline unqualified `"100%"` or standalone `"$5.9M"` until Finance closes `OVR-01`/`OVR-16`.**
- **Field Security Reality:** `12 of 52` archived public missionary profiles (`23%`) require protective naming, initials, aliases, or ministry codes[^content-master]. All protective protocols live in [Field Security Policy](../policies/field-security-and-disclosure.md).

---

## 4. Enduring Executive & Consolidation Decisions

1. **Strict brand-before-website separation (`OVR-24`):** Keep `src/` and `public/` on the clean Next.js starter scaffold until dedicated website construction starts from [Website Construction Handoff](website-builder-handoff.md) and `DESIGN.md`.
2. **Honest OKF v0.3 authority separation (`OVR-15`):** Keep active concepts `status: draft` and `verified: []`, omit invented `stale_after` dates per OKF v0.3 §5.5, and distinguish authority with `x-gf-approval-state` (`locked-foundation`, `delegated-working-guidance`, `source-record`, `retired-legacy`).
3. **Preserved mark silhouette + color freedom + zero-ShareAlike street photography:** Keep the `140:101` Cross-in-Oval mark, retire legacy blue/yellow in favor of Living Nearness `v15.0` (with Ink-Neutral fallback pending `OVR-11`), and use vetted non-ShareAlike street photography on Tier 1 public surfaces rather than generic illustrations.
4. **Source-faithful financial & ECFA disclosures:** Name the two documented 2025 financial statements accurately (`Statement of Activity` and `Statement of Financial Position`), cite `P044`'s annual audit-cost ECFA rationale, and route donors to `finance@globalfellowship.org` while live web portals remain pending (`OVR-21`).
5. **Human dependencies preserved honestly (`OVR-01`–`OVR-24`):** Every unresolved factual, legal, financial, consent, regional, and operational question remains explicitly tracked in [Open Verification Register](open-verification-register.md).
