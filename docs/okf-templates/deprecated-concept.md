# OKF v0.3 Template: Deprecated Concept

Use this template to retire an outdated concept or leave a redirect stub after renaming or moving a file inside `knowledge/` (OKF v0.3 §5.4). Keep any prior `verified` history intact, update the relevant `index.md` and `knowledge/log.md`, and run `bun run okf:validate`.

```markdown
---
type: <Original Concept Type>
title: <Retired Concept Name>
description: <One sentence stating that this concept is retired and naming its replacement.>
status: deprecated
superseded_by: /<domain>/<replacement-slug>.md
generated: { by: "<tool>/<model>", at: "<YYYY-MM-DDTHH:MM:SSZ>" }
---

This concept is retired. Use [<Replacement Title>](<replacement-slug>.md). <Short explanation of why the older guidance was replaced.>
```
