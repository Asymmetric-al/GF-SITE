# Product Marketing Context Pointer

This repository stores canonical brand, positioning, audience, messaging, voice, offering, and marketing knowledge in its Open Knowledge Format (OKF v0.3) knowledge bundle at [`knowledge/`](../knowledge/index.md).

Do **not** fill this file with competing marketing or brand prose. Keeping a second context file outside `knowledge/` creates drift and bypasses OKF provenance, trust tiers, and validation.

## How Marketing and Copy Skills Should Use This Repository

1. **Read first:** Inspect [`knowledge/index.md`](../knowledge/index.md) or run `bun run okf:scan` using the `okf-consume` skill (`.agents/skills/okf-consume/SKILL.md`).
2. **Check status before writing:** The `knowledge/` bundle is currently an initialized generic OKF v0.3 scaffold with zero authored domain concepts. Do not invent unapproved positioning, audience claims, metrics, or brand voice rules when a concept does not yet exist; ask the user or cite confirmed sources.
3. **Write back cleanly:** When the user supplies approved brand, positioning, audience, messaging, or campaign learnings, author or update typed concept documents inside `knowledge/` using the `okf-generate` skill (`.agents/skills/okf-generate/SKILL.md`) and the copy-ready templates in [`docs/okf-templates/`](../docs/okf.md).
4. **Validate every edit:** Run `bun run okf:validate` and `bun run check:links` after modifying `knowledge/`.
5. **Respect repository boundaries:** Keep visual design tokens, layout, and component rules in [`DESIGN.md`](../DESIGN.md), and keep `Asymmetric-al/core` CMS contracts in [`docs/core-integration.md`](../docs/core-integration.md).
