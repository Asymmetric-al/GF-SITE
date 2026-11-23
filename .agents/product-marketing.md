# Product Marketing Context Pointer

This repository stores canonical brand, positioning, audience, messaging, voice, offering, and marketing knowledge in its Open Knowledge Format (OKF v0.3) knowledge bundle at [`knowledge/`](../knowledge/index.md).

Do **not** fill this file with competing marketing or brand prose. Keeping a second context file outside `knowledge/` creates drift and bypasses OKF provenance, trust tiers, and validation.

## How Marketing and Copy Skills Should Use This Repository

1. **Read first:** Inspect [`knowledge/index.md`](../knowledge/index.md) or run `bun run okf:scan` using the `okf-consume` skill (`.agents/skills/okf-consume/SKILL.md`).
2. **Check status before writing:** The `knowledge/` bundle contains Global Fellowship's completed **Living Nearness `v15.0` Brand System & OKF Release Candidate** (`55` concepts: `54` `draft`, `1` `deprecated`, `verified: []`, awaiting explicit human leadership approval under `OVR-15`; see `x-gf-approval-state` on each concept to distinguish `locked-foundation`, `delegated-working-guidance`, `source-record`, and `retired-legacy`). Start at [`knowledge/brand/brand-on-a-page.md`](../knowledge/brand/brand-on-a-page.md), [`knowledge/brand/foundations.md`](../knowledge/brand/foundations.md), and [`knowledge/references/source-coverage-and-decisions.md`](../knowledge/references/source-coverage-and-decisions.md), check [`knowledge/references/open-verification-register.md`](../knowledge/references/open-verification-register.md) before quoting metrics or financial scope, and never treat delegated working completion, council scores, or Git merges as human leadership approval.
3. **Write back cleanly:** When the user supplies approved brand, positioning, audience, messaging, or campaign learnings, author or update typed concept documents inside `knowledge/` using the `okf-generate` skill (`.agents/skills/okf-generate/SKILL.md`) and the copy-ready templates in [`docs/okf-templates/`](../docs/okf.md).
4. **Validate every edit:** Run `bun run okf:validate` and `bun run check:links` after modifying `knowledge/`.
5. **Respect repository boundaries:** Keep visual design tokens, layout, and component rules in [`DESIGN.md`](../DESIGN.md), and keep `Asymmetric-al/core` CMS contracts in [`docs/core-integration.md`](../docs/core-integration.md).
