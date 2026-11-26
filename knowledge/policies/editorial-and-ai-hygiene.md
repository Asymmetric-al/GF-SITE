---
title: Editorial Standards, Agency Grammar, and Executable AI-Hygiene Policy
description: Mandatory prose standards enforced automatically via the styles/GF/ Vale package alongside human editorial checks.
type: Policy
status: draft
tags:
  - policy
  - editorial
  - vale
  - ai-hygiene
  - agency-grammar
x-gf-approval-state: delegated-working-guidance
x-gf-disclosure: public
generated:
  by: antigravity/gemini-4-neon
  at: "2026-11-23T06:55:00Z"
verified: []
sources:
  - id: foundations
    resource: /brand/foundations.md
    title: Permanent verbatim Mission, Vision, and Three Pillars
  - id: verbal
    resource: /brand/verbal-identity.md
    title: Witness, Open Books, and Note registers and Agency Grammar rules
  - id: retired
    resource: /messaging/retired-claims.md
    title: Retired legacy phrases blocked from publication
---

# Editorial Standards, Agency Grammar, and Executable AI-Hygiene Policy

Global Fellowship turns core editorial ethics into **executable checks** enforced across repository Markdown, OKF concepts, HTML templates, and OOXML starters via `bun run check:prose` and `bun run verify:brand`[^verbal].

## 1. Executable Vale Rules (`styles/GF/`, Wired in `.vale.ini`)

| Vale Rule | File | Severity | What It Catches Automatically |
| --- | --- | --- | --- |
| `GF.EmDash` | `styles/GF/EmDash.yml` | Error | Any em dash (`—`) anywhere in public copy, templates, or brand docs. Rewrite with a colon, comma, parentheses, or period. |
| `GF.Saviorism` | `styles/GF/Saviorism.yml` | Error | Donor or GF placed as actor of transformation (`"your gift (will/can) save/transform/rescue/change lives"`, `"you can save/transform/rescue"`), plus `"native missionary"`. |
| `GF.RetiredClaims` | `styles/GF/RetiredClaims.yml` | Error | Retired legacy claims: `"0% overhead"`, `"zero overhead"`, `"no written policies"`, `"10-25% fee"`, `"3% of missionaries"`, `"1% of giving"`, live `"24/7 prayer"` promises[^retired]. |
| `GF.AITells` | `styles/GF/AITells.yml` | Error | AI cadence and interchangeable clichés: `"it's not X, it's Y"`, `"not just X, but Y"`, `"seamless"`, `"seamlessly"`, `"impacting lives"`, `"transforming nations"`, `"making an eternal difference"`, `"reaching the unreached"`. |
| `GF.Militarism` | `styles/GF/Militarism.yml` | Error | Adversarial-risk military verbs: `penetrate`, `conquer`, `crusade`, `target unreached/people/villages`, `spiritual army`. |
| `GF.FoundationsNearMiss` | `styles/GF/FoundationsNearMiss.yml` | Error | Accidental paraphrases of protected statements (`"within thirty minutes"`, `"every person"`, `"four pillars"`, `"Unreached Regions"` as a formal pillar name)[^foundations]. |
| `GF.MetaBrandLeak` | `styles/GF/MetaBrandLeak.yml` | Error | Internal self-praising or placeholder scaffolding (exact 7-token sync enforced by `verify-brand.ts`): `"typographic hush"`, `"coverage boast"`, `"NEVER EDIT A SINGLE WORD"`, `"ENCODE BRIDGE URL QR"`, `"distinctive signature"`, `"ownable"`, `"placeholder specimen"`. |
| `GF.TemplateMetaLeak` | `styles/GF/TemplateMetaLeak.yml` | Error | Outward-scoped ban (active on `knowledge/marketing/copy-*.md`, outward HTML templates, and OOXML starters) catching `"Living Nearness"`, `"Orbit 1-4"`, `"agency grammar"`, `"brand candidate"`, `"voice by subtraction"`, and `"Note Register"`. |
| `GF.DivinePronouns` | `styles/GF/DivinePronouns.yml` | Error | Stray capitalized divine pronouns (`He/His/Him/Himself`) in original prose (keep lowercase `he/his/him`; verbatim Statement of Faith quotations in `foundations.md` and `GF-TPL-22` exempted). |

## 2. Internal-Governance Leakage & Open-OVR Contradiction Ban

Never place internal `OVR-01` through `OVR-24` codes inside outward-facing donor, church, candidate, or public body copy, and **never assert that an open OVR item is confirmed** (`verify-brand.ts` enforces this automatically against `open-verification-register.md`). Keep `OVR-*` codes strictly inside pre-publication specimen bars, print status slugs, and internal governance files.

## 3. Five Human Editorial Checks (Beyond Automation)

1. **Read-aloud naturalness:** Sounds like a grounded friend speaking plainly, avoiding repetitive verbal tics (`"quiet"`, `"steady"`, `"zero"`).
2. **Swap-the-logo test:** Headlines remain distinctly Global Fellowship rather than interchangeable agency copy.
3. **Christ and the local church visible:** A newcomer recognizes historic Christian church planting within 30 seconds.
4. **Every figure dated and scoped:** Every number states its reporting year and source in the same sentence, respecting [Open Verification Register](../references/open-verification-register.md).
5. **Proportionality:** Concise enough for a busy pastor, regional leader, or lean Home Office staffer to apply quickly.
