# OKF v0.3 Template: Audience Profile

Copy the fenced Markdown block below into `knowledge/audiences/<slug>.md`, replace every `<placeholder>`, remove lines without a real source, update `knowledge/audiences/index.md` and `knowledge/log.md`, and run `bun run okf:validate`.

```markdown
---
type: Audience
title: <Audience Segment Name>
description: <One sentence defining who this audience is and their primary goal on the website.>
tags: [audience, research]
status: draft
generated: { by: "<tool>/<model>", at: "<YYYY-MM-DDTHH:MM:SSZ>" }
sources:
  - id: <research-source>
    resource: <https://source-url-or-/references/research-file.md>
    title: <Research Study or Discovery Notes Title>
---

<One to two paragraphs summarizing who this audience is, how they arrive, and what decision or action matters most to them.>[^<research-source>]

# Goals and Needs

- <Primary goal or question this audience brings.>
- <Secondary need or evaluation criterion.>

# Friction and Questions

- <Common hesitation, misconception, or barrier.>

# Verbatim Language

- "<Exact phrase used by real audience members, backed by research.>"[^<research-source>]

# Related Concepts

- See [Messaging Pillar](../messaging/<messaging-slug>.md) for approved messaging tailored to this group.

[^<research-source>]: <Research Study or Discovery Notes Title>
```
