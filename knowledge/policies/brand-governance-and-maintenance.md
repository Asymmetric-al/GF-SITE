---
title: Brand Governance, Adoption, Maintenance, and Approval Policy
description: Clear lifecycle distinguishing AI council evaluation under Rubric v2.0 (38 areas) from human approval, canonical token and ledger-ID propagation rules, zero-Figma Office starter adoption, and OKF maintenance cadence.
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
  at: "2026-11-23T03:05:00Z"
verified: []
sources:
  - id: foundations
    resource: /brand/foundations.md
    title: Immutable protected statements requiring zero drift
  - id: open-verification
    resource: /references/open-verification-register.md
    title: Human-only pre-publication gates and owners
---

# Brand Governance, Adoption, Maintenance, and Approval Policy

Global Fellowship operates with a lean Home Office (`$251.6k` operating expenses in 2025) and distributed regional teams. Brand governance must therefore be **lightweight, honest, and genuinely usable without a full-time agency** (_Brand Democracy_ and _Brand Integrity_).

## 1. Strict Separation of Authority, Verification, Council Review, and Human Approval

Never blur these distinct states in OKF metadata or public documentation. Every active concept stays `status: draft` (except `messaging/retired-claims.md`, which is `status: deprecated` with `superseded_by`) and `verified: []` (`unverified`) until human leadership formally approves and verifies it; GF-specific `x-gf-approval-state` distinguishes internal authority clearly:

1. **Permanently Locked Foundation (`x-gf-approval-state: locked-foundation`, `x-gf-locked: true`):** Verbatim Mission Statement, Prayerful Vision Statement, Three Pillars, and canonical 8-article public Statement of Faith in [Protected Foundations](../brand/foundations.md). Never rewrite or paraphrase as formal statements.
2. **Delegated Working Guidance (`status: draft`, `verified: []`, `x-gf-approval-state: delegated-working-guidance`):** Completed brand strategy, voice, visual identity, audiences, messaging, offerings, copy playbooks, policies, and website-builder handoff finalized under delegated completion authority within the established Living Nearness `v15.0` direction, ready for human review and leadership approval (`OVR-15`).
3. **Source & Governance Record (`status: draft`, `verified: []`, `x-gf-approval-state: source-record`):** Factual source syntheses, dated 2024/2025 proof ledgers, missions sector research, coverage records, delegated decision log, and open verification gates (`OVR-01`–`OVR-24`).
4. **Retired Legacy Record (`status: deprecated`, `x-gf-approval-state: retired-legacy`):** Superseded historical claims kept discoverable with `superseded_by` links (`messaging/retired-claims.md`).
5. **Machine-Confirmed & Council-Evaluated Evidence (Never Equals Approval):** Automated checks (`okf:validate --strict`, upstream Python `validate.py --strict`, `verify:brand`, WCAG 2.2 `40/40` contrast, Vale, Lychee, SVGO, Playwright PDF/TrimBox/axe checks) and independent multi-model reviews (`docs/brand-council/council-review-record.md`, `docs/brand-council/completion-review-record.md`) verify quality and hygiene only; they **never** constitute human leadership approval, nor does merging into `main`.
6. **Human-Approved Release (omit `status` for OKF `stable` per `docs/okf.md` §2.7, `verified: [{ by: "human:<id>", at: "..." }]`, `x-gf-approval-state: approved`):** Assigned **only** after explicit approval by Global Fellowship leadership and closure of relevant items in [Open Verification Register](../references/open-verification-register.md)[^open-verification].

## 2. Single-Source-of-Truth Update Rules & Ledger-ID Propagation Checklist

| What Changed | Single Canonical File to Update First | Downstream Propagation Required |
| --- | --- | --- |
| Annual impact or financial figures | Create new `knowledge/messaging/proof-ledger-YYYY.md` and mark prior year historical | Propagate updated ledger IDs & dates across **all 7 channels**: (1) Brand Guide Book & Survival Proof (`GF-GDE-01`, `GF-GDE-04`), (2) Annual Report (`GF-TPL-05`), (3) Stewardship Email (`GF-TPL-09`), (4) Presentation Deck & `.pptx` (`GF-TPL-10`), (5) Social/OG, Mobile Note & Video Kits (`GF-TPL-11`, `GF-TPL-14`), (6) Sunday Bulletin Insert & Church Kit (`GF-TPL-06`, `GF-TPL-17`), and (7) OKF copy/hierarchy docs (omit `stale_after` unless an owner sets a confirmed review date). |
| Visual color, type, or spacing tokens | `brand-kit/tokens/tokens.json` (canonical W3C DTCG 2025.10 input) | Re-run `bun scripts/generate-brand-tokens.ts` (reads `tokens.json`, emits `brand-tokens.css`, `contrast-report.json`, and syncs `visual-identity.md`), `bun scripts/build-brand-marks.ts`, `bun scripts/build-presentation-deck.ts`, `bun scripts/build-office-starters.ts`, `bun scripts/build-brand-video.ts`, and `bun run verify:brand`. Update `src/app/globals.css` only after human approval. |
| Vocabulary or banned phrases | `knowledge/messaging/terminology-and-glossary.md` & `styles/GF/` Vale rules | Run `bun run check:prose` and `bun run verify:brand` (includes live positive-control Vale verification across Markdown, templates, OOXML, and text/caption exports). |
| Retired legacy claims | Add row to `knowledge/messaging/retired-claims.md` and `styles/GF/RetiredClaims.yml` | Verify zero occurrences across `knowledge/` and `brand-kit/`. |
| Protected Mission, Vision, or 3 Pillars | **LOCKED. NEVER MODIFY.**[^foundations] | `bun run verify:brand` fails automatically on any wording drift or 2-pillar truncation across all docs and rendered templates. |

## 3. Lean-Staff Adoption Standard (No Figma Required)

Every Home Office coordinator, regional director, and church planter must be able to stay on-brand using free everyday tools (Microsoft Word, PowerPoint, LibreOffice, Google Docs/Slides, and ordinary office printers):

- Open all six upgraded editable OOXML starters directly in `brand-kit/office/worker-prayer-letter-public-starter.docx` (Tier 1 named Word/Docs styles + header/footer), `brand-kit/office/worker-prayer-letter-restricted-starter.docx` (Tier 2/3 zero-logo safe default), `brand-kit/office/local-only-meeting-sheet-starter.docx` (Level 4 zero-attribution editable meeting sheet), `brand-kit/office/local-fellowship-brief-arabic-rtl-starter.docx` (native RTL Arabic zero-attribution brief), `brand-kit/office/donor-receipt-and-redesignation-starter.docx` (Finance manual fill-in receipts, PCI care & re-designation), and `brand-kit/office/global-fellowship-deck-starter.pptx` (full 8-slide, 5-layout deck with embedded Slide 1 street photo `GF-PHO-01`, embedded logos, per-script fonts on Slide 4, clickable `mailto:` links, and speaker notes).
- Use `brand-kit/exports/pdf/brand-on-one-sheet.pdf` (`GF-GDE-02`, 1 page), `field-safe-checklist.pdf` (`GF-GDE-03`, 1 page), `revocable-consent-form.pdf` (`GF-TPL-15`, 2 spacious printable pages), standalone confidential `member-care-journal-confidential.pdf` (`GF-TPL-18`, 1 page), and separate internal `staff-onboarding-and-dual-tier-signatures.pdf` (`GF-TPL-24B`, 1 page) as day-one onboarding tools.
- Select free SIL OFL 1.1 **Source Serif 4** and **Plus Jakarta Sans** natively in Google Workspace (`More fonts`) or install locally from `brand-kit/tokens/fonts/`, apply core Living Nearness v15.0 HEX values (`#0C525C` Harbor Teal, `#0B272E` Harbor Night, `#7E3119` Kiln Clay, `#F2B488` Candle Apricot strictly with Charcoal Ink `#16191C`, `#16191C` Charcoal Ink, `#FAF7F2` Warm Paper, `#F1ECE3` Warm Linen), and drop in transparent PNG lockups from `brand-kit/logos/png/`.
- Print pure `#000000` monochrome Sunday bulletins (`GF-TPL-17`) and Bridge Kids Drawing & Prayer Sheets (`GF-TPL-20`) directly with zero dark-ink waste (`OVR-18`).

## 4. OKF Maintenance Cadence

After any update to `knowledge/`, `brand-kit/`, or `styles/GF/`:

1. Prepend a dated entry (newest first, `## YYYY-MM-DD`) to `knowledge/log.md`.
2. Ensure every concept uses an allowed `type:` from `docs/okf.md`, valid non-future UTC `generated.at` (bumped only when meaning changes), honest `status` and `x-gf-approval-state`, accurate `x-gf-disclosure: public`, synchronized version tags (`v15.0`), and relative bundle links. Per OKF v0.3 §5.5, omit `stale_after` unless a real organizational review date is confirmed by an owner (never invent placeholder dates).
3. Run `bun run okf:validate`, `bun run okf:scan`, `bun run check:foundation`, `bun run check:links`, `bun run check:prose`, and `bun run verify:brand`.
