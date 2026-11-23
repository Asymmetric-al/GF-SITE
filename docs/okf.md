# Open Knowledge Format (OKF v0.3) Guide

`GF-SITE` maintains a populated (`55` authored concepts across `7` domains: `54` `draft`, `1` `deprecated`, `0` `human-reviewed`, awaiting human leadership approval) [Open Knowledge Format (OKF) v0.3](https://github.com/open-knowledge-format/open-knowledge-format/blob/main/SPEC.md) knowledge bundle at [`knowledge/`](../knowledge/index.md). It gives AI agents and humans a single, Git-native, vendor-neutral source of truth for brand identity, voice and tone, audiences, messaging, offerings, marketing playbooks, editorial/security policies, source records, and the website-builder handoff.

The bundle contains Global Fellowship's completed and verified **Living Nearness `v15.0` Brand System and Knowledge Release Candidate** (`55` authored concepts: `54` `draft`, `1` `deprecated`, `verified: []` / `unverified` pending human approval under `OVR-15`). Always inspect `status`, `x-gf-approval-state` (`locked-foundation`, `delegated-working-guidance`, `source-record`, or `retired-legacy`), optional `stale_after` (omitted when no real organizational review date is known per OKF v0.3 §5.5), and [Open Verification Register](../knowledge/references/open-verification-register.md) before quoting claims publicly, and never fabricate `human:` verification records. Binary brand assets, editable SVGs, design tokens, curated zero-ShareAlike street photographs, Office starters, and rendered HTML/PDF/PNG templates live outside the OKF bundle in [`brand-kit/`](../brand-kit/README.md) (indexed via [`knowledge/references/asset-index.md`](../knowledge/references/asset-index.md)), provenance and delegated decisions live in [`knowledge/references/source-coverage-and-decisions.md`](../knowledge/references/source-coverage-and-decisions.md), website-phase preparation lives in [`knowledge/references/website-builder-handoff.md`](../knowledge/references/website-builder-handoff.md), and evaluation history lives in [`docs/brand-council/`](./brand-council/council-review-record.md).

**Upstream OKF Specification & Reference Tooling Provenance:** Verified live against `https://github.com/open-knowledge-format/open-knowledge-format` **OKF v0.3** (`SPEC.md`, upstream tooling revision `527e81aff55992be21507e97004286789126f88c`, `2026-11-18`). Local skills (`.agents/skills/okf-consume/` and `.agents/skills/okf-generate/`) match upstream byte-for-byte (EOL-only), and `knowledge/` is verified conformant (`0` errors, `0` warnings) against **both** local TypeScript (`bun run okf:validate` / `bun run okf:scan`) and upstream reference Python (`validate.py --strict` / `scan.py`).

---

## 1. Repository Ownership Boundaries

Keep each documentation surface focused on one responsibility so agents never face conflicting sources of truth:

| Surface | Owns | Do Not Store Here |
| --- | --- | --- |
| [`knowledge/`](../knowledge/index.md) (OKF v0.3 bundle) | Brand identity, mission, positioning, voice and tone, audiences, messaging pillars, proof points, glossary, offerings, marketing playbooks, campaign learnings, and editorial policies | Next.js code, UI component props, CSS tokens, or unpopulated template stubs |
| [`DESIGN.md`](../DESIGN.md) | Visual design direction, semantic CSS tokens (`src/app/globals.css`), typography, layout, interaction/UI SDK boundaries, accessibility, and design verification | Full messaging trees, campaign briefs, or audience research libraries |
| [`AGENTS.md`](../AGENTS.md) & [`CLAUDE.md`](../CLAUDE.md) | Repository operating rules, stack boundaries, skill routing, and verification commands | Long-form brand prose or duplicating content from `knowledge/` |
| [`.agents/product-marketing.md`](../.agents/product-marketing.md) | Thin pointer routing installed marketing/copy skills (`copywriting`, `content-strategy`, `seo-audit`, `emails`, `social`, `product-marketing`) to `knowledge/` | Competing brand or positioning prose |
| [`docs/core-integration.md`](./core-integration.md) | `Asymmetric-al/core` Payload CMS v4 content delivery boundary and future CMS contract | Brand positioning or copy rules |
| [`docs/okf-templates/`](#5-copy-ready-okf-v03-templates) | Copy-ready blank OKF v0.3 templates kept outside `knowledge/` so they never pollute `okf:scan` or trigger `W120` validator warnings | Filled-in production brand concepts |

---

## 2. OKF v0.3 Bundle Layout

A single bundle root at `knowledge/` keeps every brand, audience, messaging, and marketing domain in one traversable graph (OKF v0.3 §6.4). Under OKF §6, paths resolving outside a bundle root are external and consumers must not read them from disk; keeping all brand and marketing domains under `knowledge/` allows direct relative links between messaging, voice, audiences, offerings, and policies.

```text
knowledge/
├── index.md              # Bundle-root metadata (okf_version: "0.3", title, description) and domain index
├── log.md                # Chronological update history (no frontmatter; newest YYYY-MM-DD first)
├── brand/
│   └── index.md          # Brand Identity, Voice and Tone
├── audiences/
│   └── index.md          # Audience segments, personas, visitor journeys, verbatim language
├── messaging/
│   └── index.md          # Messaging pillars, value propositions, proof points, glossary
├── offerings/
│   └── index.md          # Products, programs, services, initiatives
├── marketing/
│   └── index.md          # Channel playbooks, campaign briefs, SEO/content pillars, learnings
├── policies/
│   └── index.md          # Editorial standards, compliance rules, restricted terms, approvals
└── references/
    └── index.md          # Supporting source references, research summaries, non-Markdown assets
```

### Key OKF v0.3 Spec Rules (What Changed From v0.1 / v0.2)

Earlier online articles often show v0.1 or v0.2 conventions (`timestamp`, `# Citations` lists, frontmatter in `log.md`, or bare root-relative path fields). Follow **OKF v0.3** (`SPEC.md`):

1. **Bundle-root `index.md` only:** Put `okf_version: "0.3"`, `title`, `description`, and optional `license` only in `knowledge/index.md`. Subdirectory `index.md` files and `log.md` **must not** contain frontmatter.
2. **YAML 1.2 core schema:** Every concept starts and ends its frontmatter with `---`, uses unique keys (no duplicate keys), avoids custom YAML tags, and quotes values that look like numbers or booleans (for example `okf_version: "0.3"`).
3. **`type` marks a concept:** `type` is the only strictly required frontmatter field on a concept. Markdown files inside `knowledge/` without frontmatter or without a non-empty `type` are skipped by consumers and flagged with warning `W120` by validators. Keep guides and templates outside `knowledge/`.
4. **Paths vs body links (§6):** Write Markdown body links **relative to the file** (for example `../brand/voice-and-tone.md`) so they render on GitHub. Write frontmatter path fields (`resource`, `sources[].resource`, `superseded_by`, `computation`, `executor.resource`, `attester.resource`) with a **leading `/`** from the bundle root (for example `/policies/editorial-standards.md`), or as absolute URLs.
5. **Current-only trust tiers (§5.3):** Consumers calculate trust tiers from **current** `verified` events only (`verified[].at >= generated.at`, or when `generated` is absent):
   - No current verification event -> `unverified`
   - Current event from non-`human:` actor (`team:`, `process:`, or `<tool>/<model>`) -> `machine-confirmed`
   - Current event from `human:<id>` actor -> `human-reviewed`
   - If an agent later changes meaning and bumps `generated.at`, prior `verified` entries remain as history but the concept automatically drops back to `unverified` until re-confirmed.
6. **Provenance via `sources` + footnotes (§5.1):** Replace v0.1 `# Citations` sections with `sources` frontmatter entries (`id`, required `resource`, optional `title`, `author`, `usage_count` + `usage_window`, `last_modified`) and attribute body claims using `[^<source-id>]` footnotes matching `sources[].id`.
7. **Lifecycle and freshness (§5.4, §5.5):** Omit `status` for normal `stable` concepts; use `status: draft` for unreviewed work and `status: deprecated` with `superseded_by: /path/to/replacement.md` when retiring or renaming a concept. Set `stale_after` (RFC 3339 timestamp or `YYYY-MM-DD`) only when a real review date is known.
8. **Extensions (§4.1):** Custom domain keys are permitted at any level; prefix repo-specific keys with `x-<org>-<name>` so future OKF versions never collide with them.

---

## 3. Recommended Generic Concept `type` Conventions

OKF v0.3 intentionally has no central type registry (consumers accept any non-empty `type` string). For consistency across branding, messaging, and marketing tasks, reuse these domain `type` values when adding concepts:

| Directory | Recommended `type` Values | Typical Contents |
| --- | --- | --- |
| `knowledge/brand/` | `Brand Identity`, `Voice and Tone` | Mission, vision, values, positioning, personality, verbal rules, visual pointers to `DESIGN.md` |
| `knowledge/audiences/` | `Audience` | Target segments, visitor personas, goals, objections, verbatim language |
| `knowledge/messaging/` | `Messaging`, `Proof Point`, `Glossary` | Narrative hierarchy, value propositions, verifiable claims, approved and restricted terminology |
| `knowledge/offerings/` | `Offering` | Individual programs, products, services, or initiatives |
| `knowledge/marketing/` | `Playbook`, `Campaign` | Channel guides, SEO topic clusters, launch checklists, tested messaging learnings |
| `knowledge/policies/` | `Policy` | Editorial policy, compliance/legal review rules, attribution and brand safety standards |
| `knowledge/references/` | `Reference` (or non-Markdown assets) | Summaries of external research, source decks, style specs, diagrams |

If verifiable quantitative impact or analytics figures are added later with a sanctioned query or script, author them as standalone `type: Attested Computation` concepts under `knowledge/computations/` per OKF §10 and link to them from `Proof Point` or `Messaging` concepts.

---

## 4. How AI Agents Use This Bundle

Both official Google OKF skills are installed in `.agents/skills/` and `.claude/skills/`:

- **`okf-consume`** — Read-only consumption workflow for answering brand, audience, messaging, and marketing questions with progressive disclosure (`knowledge/index.md` or `bun run okf:scan`), trust-tier reporting, freshness warnings, and conflict resolution.
- **`okf-generate`** — Authoring, updating, migration, verification recording, and validation workflow.

### Reading Before Writing Copy, Brand, or Marketing Work

1. Run `bun run okf:scan` (or read `knowledge/index.md` and only the relevant subdirectory `index.md` files) rather than loading every file upfront.
2. Filter as needed, for example:
   - `bun run okf:scan -- --current --type Messaging`
   - `bun run okf:scan -- --tag voice`
   - `bun run okf:scan -- --grep "terminology"`
   - `bun run okf:scan -- --stale` or `bun run okf:scan -- --unverified`
3. Open only the relevant concepts, follow related links, and check trust tier (`human-reviewed`, `machine-confirmed`, `unverified`), `status` (`stable`, `draft`, `deprecated`), and `stale_after`.
4. If the bundle has no concept covering a topic, say so clearly and ask the user or label general guidance honestly. Never fabricate approved claims, testimonials, metrics, or brand guidelines.

### Authoring or Updating Concepts

1. Copy the matching template from [`docs/okf-templates/`](#5-copy-ready-okf-v03-templates) into the target directory under `knowledge/`.
2. Write only facts supported by real sources; record each source in `sources` and cite specific claims with `[^<source-id>]`.
3. Set `generated: { by: "<tool>/<model>", at: "<UTC RFC 3339>" }` when creating or changing meaning (do not bump `generated.at` for formatting or link fixes).
4. Never fabricate a `verified` entry; add `human:<id>` only when that person confirmed the concept, asked to record it, and provided their identifier.
5. Update the parent directory's `index.md` (no frontmatter) and append a dated entry at the top of `knowledge/log.md` (no frontmatter, `## YYYY-MM-DD`).
6. Validate with `bun run okf:validate` and `bun run check:links`.

---

## 5. Copy-Ready OKF v0.3 Templates

Templates live outside `knowledge/` so they never pollute `bun run okf:scan` or trigger `W120` non-concept warnings:

- [Brand Guideline (`Brand Identity` / `Voice and Tone`)](./okf-templates/brand-guideline.md)
- [Audience Profile (`Audience`)](./okf-templates/audience-profile.md)
- [Messaging Pillar (`Messaging` / `Proof Point`)](./okf-templates/messaging-pillar.md)
- [Offering (`Offering`)](./okf-templates/offering.md)
- [Marketing Playbook (`Playbook` / `Campaign`)](./okf-templates/marketing-playbook.md)
- [Editorial Policy (`Policy`)](./okf-templates/editorial-policy.md)
- [Deprecated Concept (`status: deprecated` + `superseded_by`)](./okf-templates/deprecated-concept.md)

---

## 6. Validation Commands and CI

Because Google's upstream Python scripts (`scripts/validate.py` and `scripts/scan.py` inside the vendored skills) require `PyYAML`, `GF-SITE` also ships zero-setup TypeScript equivalents powered by Bun and `yaml` (YAML 1.2 core schema) that run identically locally and in GitHub Actions CI:

- `bun run okf:validate` — Strict OKF v0.3 conformance and field-shape validator (`--strict`, supports `--json` and `--now <RFC3339>`). Runs in PR and `main` CI.
- `bun run okf:scan` — Progressive-disclosure concept scanner reporting trust tiers, statuses, freshness, and replacements (supports `--type`, `--tag`, `--grep`, `--current`, `--stale`, `--deprecated`, `--unverified`, `--now`, `--json`).
- `bun run check:foundation` — Verifies installed `okf-consume` and `okf-generate` skill parity plus public-repository privacy hygiene across `knowledge/` and `docs/`.

---

## 7. Future Optional Public Web Publishing (Not Active)

This bundle is currently a **repository-internal knowledge base** for humans and AI coding/marketing agents. If the organization later chooses to expose an agent-readable public knowledge bundle on the live website (for example at `/okf/` alongside `/llms.txt` once public launch content exists):

- Export only explicitly approved, `status: stable`, public-safe concepts (`human-reviewed` where required).
- Never publish internal campaign briefs, draft concepts, unpublished research, or internal operational policies directly from `knowledge/`.
