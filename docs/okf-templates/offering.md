# OKF v0.3 Template: Offering

Copy the fenced Markdown block below into `knowledge/offerings/<slug>.md`, replace every `<placeholder>`, remove lines without a real source, update `knowledge/offerings/index.md` and `knowledge/log.md`, and run `bun run okf:validate`.

```markdown
---
type: Offering
title: <Product, Program, or Service Name>
description: <One sentence describing what this offering provides and who it serves.>
tags: [offering]
status: draft
generated: { by: "<tool>/<model>", at: "<YYYY-MM-DDTHH:MM:SSZ>" }
sources:
  - id: <offering-source>
    resource: <https://source-url-or-/references/offering-overview.md>
    title: <Offering Documentation Title>
---

<One to three paragraphs defining what the offering is, how someone participates or uses it, and any eligibility or scope boundaries.>[^<offering-source>]

# Key Facts

| Attribute              | Value                                              |
| ---------------------- | -------------------------------------------------- |
| Primary audience       | [<Audience Name>](../audiences/<audience-slug>.md) |
| Primary call to action | <Clear next step for visitors>                     |
| Scope or eligibility   | <Confirmed constraints or scope>                   |

# Related Concepts

- Core narrative: [<Messaging Pillar>](../messaging/<messaging-slug>.md)

[^<offering-source>]: <Offering Documentation Title>
```
