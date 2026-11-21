# OKF v0.3 Template: Messaging Pillar

Copy the fenced Markdown block below into `knowledge/messaging/<slug>.md`, replace every `<placeholder>`, remove lines without a real source, update `knowledge/messaging/index.md` and `knowledge/log.md`, and run `bun run okf:validate`.

```markdown
---
type: Messaging
title: <Messaging Pillar or Value Proposition Title>
description: <One sentence summarizing the core message and where it should be used.>
tags: [messaging, positioning]
status: draft
generated: { by: "<tool>/<model>", at: "<YYYY-MM-DDTHH:MM:SSZ>" }
sources:
  - id: <brief-source>
    resource: <https://source-url-or-/references/messaging-brief.md>
    title: <Approved Messaging Brief Title>
---

<One to two paragraphs stating the core claim, who it serves, and the boundaries of what can and cannot be promised.>[^<brief-source>]

# Key Messages

- **Headline angle:** <Clear, direct statement grounded in evidence.>
- **Supporting points:**
  - <Specific, verifiable point 1.>[^<brief-source>]
  - <Specific, verifiable point 2.>

# Supporting Proof

- <Link to verified evidence, case material, or a Proof Point concept. Omit invented numbers.>

# Related Concepts

- Target audience: [<Audience Name>](../audiences/<audience-slug>.md)
- Voice rules: [<Voice and Tone>](../brand/<voice-slug>.md)

[^<brief-source>]: <Approved Messaging Brief Title>
```
