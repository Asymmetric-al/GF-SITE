# OKF v0.3 Template: Marketing Playbook

Copy the fenced Markdown block below into `knowledge/marketing/<slug>.md`, replace every `<placeholder>`, remove lines without a real source, update `knowledge/marketing/index.md` and `knowledge/log.md`, and run `bun run okf:validate`.

```markdown
---
type: Playbook
title: "<Channel or Workflow>: <Goal>"
description: <One sentence stating when an agent or team member should follow this marketing playbook.>
tags: [marketing, playbook]
status: draft
generated: { by: "<tool>/<model>", at: "<YYYY-MM-DDTHH:MM:SSZ>" }
sources:
  - id: <playbook-source>
    resource: <https://source-url-or-/references/channel-plan.md>
    title: <Source Strategy Document Title>
---

# Trigger

<The campaign event, content task, or channel request that starts this playbook.>[^<playbook-source>]

# Steps

1. Review relevant brand voice and messaging in [Brand](../brand/index.md) and [Messaging](../messaging/index.md).
2. <Channel-specific execution step.>
3. Verify claims against [Policies](../policies/index.md) before publishing.

# Recorded Learnings

- <Date and concise evidence from completed experiments or campaigns. Leave empty until observed.>

[^<playbook-source>]: <Source Strategy Document Title>
```
