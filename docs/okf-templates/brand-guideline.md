# OKF v0.3 Template: Brand Guideline

Copy the fenced Markdown block below into `knowledge/brand/<slug>.md`, replace every `<placeholder>`, remove lines without a real source, update `knowledge/brand/index.md` and `knowledge/log.md`, and run `bun run okf:validate`.

```markdown
---
type: Brand Identity
title: <Brand Guideline Title>
description: <One sentence stating what this brand guideline defines and when agents should apply it.>
tags: [brand, identity]
status: draft
generated: { by: "<tool>/<model>", at: "<YYYY-MM-DDTHH:MM:SSZ>" }
sources:
  - id: <source-id>
    resource: <https://source-url-or-/references/source-file.md>
    title: <Authoritative Source Title>
---

<One to three concise paragraphs explaining the scope of this guideline, who owns it, and how agents should apply it across public website pages and campaigns.>[^<source-id>]

# Core Principles

1. **<Principle 1>**: <Concrete rule and how to apply it.>
2. **<Principle 2>**: <Concrete rule and how to apply it.>

# Do and Do Not

| Do                                     | Do Not                        |
| -------------------------------------- | ----------------------------- |
| <Approved brand behavior or phrasing.> | <Off-brand pattern to avoid.> |

# Related Concepts

- See [Editorial Standards](../policies/<policy-slug>.md) for compliance boundaries.
- See [Core Messaging](../messaging/<messaging-slug>.md) for narrative alignment.

[^<source-id>]: <Authoritative Source Title>
```
