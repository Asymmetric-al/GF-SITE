# OKF v0.3 Template: Editorial Policy

Copy the fenced Markdown block below into `knowledge/policies/<slug>.md`, replace every `<placeholder>`, remove lines without a real source, update `knowledge/policies/index.md` and `knowledge/log.md`, and run `bun run okf:validate`.

```markdown
---
type: Policy
title: <Policy Name>
description: <One sentence stating the rule this policy enforces and which content it governs.>
tags: [policy, editorial]
status: draft
generated: { by: "<tool>/<model>", at: "<YYYY-MM-DDTHH:MM:SSZ>" }
sources:
  - id: <policy-source>
    resource: <https://source-url-or-/references/policy-source.md>
    title: <Approved Governance Document Title>
---

<One to two paragraphs defining the scope, authority, and exceptions of this policy.>[^<policy-source>]

# Required Standards

1. <Mandatory editorial, legal, or brand-safety requirement.>
2. <Attribution, verification, or review gate requirement.>

# Prohibited Patterns

- <Disallowed claim, phrasing, or formatting rule.>

[^<policy-source>]: <Approved Governance Document Title>
```
