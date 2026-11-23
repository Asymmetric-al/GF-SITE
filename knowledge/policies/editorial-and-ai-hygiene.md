---
title: Editorial Standards, Agency Grammar, and Executable AI-Hygiene Policy
description: Mandatory editorial policy governing Global Fellowship prose across docs, copy, emails, print templates, and future web pages, enforced automatically via the styles/GF/ Vale package.
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
  at: "2026-11-22T02:00:00Z"
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

Brand standards fail six months after launch if they live only in advice prose. Global Fellowship turns its core editorial ethics into **executable checks** enforced across repository Markdown, OKF knowledge files, and text extracted from every HTML/SVG template in `brand-kit/` (`bun run check:prose` and `bun run verify:brand`).

## 1. Executable Rules in `styles/GF/` (Wired in `.vale.ini`)

| Vale Rule | File | Severity | What It Catches Automatically |
| --- | --- | --- | --- |
| `GF.EmDash` | `styles/GF/EmDash.yml` | Error | Any em dash (`—`) anywhere in public copy, templates, or brand docs. Rewrite with a colon, comma, parentheses, or period. |
| `GF.Saviorism` | `styles/GF/Saviorism.yml` | Error | Donor or GF placed as actor of transformation (`"your gift (will/can) save/transform/rescue/change lives"`, `"you can save/transform/rescue"`), plus `"native missionary"`. |
| `GF.RetiredClaims` | `styles/GF/RetiredClaims.yml` | Error | Retired or unverified legacy claims: `"0% overhead"`, `"zero overhead"`, `"no written policies"`, `"10-25% fee"`, `"3% of missionaries"`, `"1% of giving"`, live `"24/7 prayer"` promises[^retired]. |
| `GF.AITells` | `styles/GF/AITells.yml` | Error | Cliché AI cadence and interchangeable nonprofit wallpaper: `"it's not X, it's Y"`, `"not just X, but Y"`, `"seamless"`, `"seamlessly"`, `"impacting lives"`, `"transforming nations"`, `"making an eternal difference"`, `"reaching the unreached"`. |
| `GF.Militarism` | `styles/GF/Militarism.yml` | Error | Adversarial-risk military verbs: `penetrate`, `conquer`, `crusade`, `target unreached/people/villages`, `spiritual army`. |
| `GF.FoundationsNearMiss` | `styles/GF/FoundationsNearMiss.yml` | Error | Accidental paraphrases of protected statements (`"within thirty minutes"`, `"every person"`, `"four pillars"`, `"Unreached Regions"` used as a formal pillar name)[^foundations]. |
| `GF.MetaBrandLeak` | `styles/GF/MetaBrandLeak.yml` | Error | Internal self-praising or placeholder branding scaffolding across all docs and templates (exact 7-token sync enforced automatically by `verify-brand.ts` `G4`): `"typographic hush"`, `"coverage boast"`, `"NEVER EDIT A SINGLE WORD"`, `"ENCODE BRIDGE URL QR"`, `"distinctive signature"`, `"ownable"`, `"placeholder specimen"`. |
| `GF.TemplateMetaLeak` | `styles/GF/TemplateMetaLeak.yml` | Error | Outward-scoped ban (active on `knowledge/marketing/copy-*.md` and all outward HTML templates & OOXML starters; disabled on internal strategy/guide/council docs) catching `"Living Nearness"`, `"Orbit 1–4"`, `"agency grammar"`, `"brand candidate"`, `"voice by subtraction"`, and `"Note Register"`. |
| `GF.DivinePronouns` | `styles/GF/DivinePronouns.yml` | Error | Catches stray capitalized divine pronouns (`He/His/Him/Himself`) in original Global Fellowship prose so original brand copy stays consistent in lowercase (`he/his/him`), while exempting verbatim protected Statement of Faith quotations (`knowledge/brand/foundations.md` and `GF-TPL-22`). |

## 2. Internal-Governance Leakage & Open-OVR Contradiction Ban

Never embed internal Open Verification Register codes (`OVR-01` through `OVR-24`) inside outward-facing donor, church, candidate, or public body copy, and **never assert that an open OVR item is confirmed** anywhere in a template or footer (`scripts/verify-brand.ts` runs an automated Open-OVR Contradiction Guard in `G2` that parses `open-verification-register.md` and fails any template claiming confirmation of an `Open` OVR). Keep `OVR-*` gate markers strictly inside pre-publication specimen bars (`.gf-specimen-bar`), print-surviving specimen status slugs (`.gf-print-status`, `.slide-status`), and internal OKF governance files.

## 3. Human Editorial Review Checklist (Beyond Automation)

Before publishing any letter, story, slide deck, email, or web page, confirm five human judgments:

1. **Read-aloud rhythm:** Does it sound like a real church planter or thoughtful friend speaking at a table, with varied sentence lengths, concrete nouns, and without overusing `"quiet"`, `"steady"`, or `"zero"` as verbal tics?
2. **Swap-the-logo test:** If you replaced `"Global Fellowship"` with another agency's name on the headline, would the line still read identically? If yes, sharpen with specific substance.
3. **Christ and the local church visible:** Could a newcomer tell within 30 seconds that this fellowship exists for Jesus Christ and living local churches, not general charity?
4. **Every number dated and scoped:** Does every statistic state its reporting year and source in the same sentence, respecting [Open Verification Register](../references/open-verification-register.md)?
5. **Proportionality:** Is this document concise enough for a busy pastor, regional leader, or small Home Office staff member to read and apply in five minutes?
