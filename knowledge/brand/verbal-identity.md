---
title: Global Fellowship Verbal Identity, Voice, Tone, and Microcopy
description: Three-register voice architecture (Witness, Open Books, Note), seven Agency Grammar rules, tone calibration matrix, microcopy inventory, and Scripture policy.
type: Voice and Tone
status: draft
tags:
  - voice
  - tone
  - verbal-identity
  - microcopy
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
  - id: character
    resource: /brand/character-and-values.md
    title: Brand character traits and seven values in behavior
  - id: editorial
    resource: /policies/editorial-and-ai-hygiene.md
    title: Enforceable Vale ruleset and prose hygiene standards
---

# Global Fellowship Verbal Identity, Voice, Tone, and Microcopy

Global Fellowship sounds like a trusted friend who speaks plainly about Jesus Christ, listens closely to neighbors, tells the truth about cost, and keeps open books. Authority comes through **voice by subtraction**: concrete scenes, named decisions, and dated proof carry the weight instead of self-praising adjectives[^character].

## 1. Three Native Registers

| Register | How It Sounds | Primary Uses |
| --- | --- | --- |
| **Witness** | Specific, vivid, warm without sentimentality, candid about joy and hardship, centered on Jesus Christ | Stories, prayer cards, Bridge Project letters, Faith on the Frontlines invites, worker letters, member care, church outreach |
| **Open Books** | Calm, unadorned, dated, footnoted, direct on money and decision rights, zero hype | Annual reports, stewardship emails, financial disclosures, FAQs, candidate expectations, policies |
| **Note** | Brief, crisp, phone-scannable, paired with an exact plain-text twin, zero jargon | Encrypted mobile prayer cards (`GF-TPL-14`), 9:16 vertical video, 3-slide Q&A carousels, half-letter church inserts |

**Mixing registers cleanly:** On annual reports and donor updates, separate **Open Books** (`Plus Jakarta Sans` tabular figures) cleanly from **Witness** (`Source Serif 4` narrative) so readers see both real ministry and sober accounting without implying a dollar buys spiritual fruit.

## 2. Agency Grammar (Seven Core Rules)

Mechanical bans are enforced automatically across Markdown, templates, and OOXML starters by the nine Vale rules in `styles/GF/` (see [Editorial & AI Hygiene](../policies/editorial-and-ai-hygiene.md)); human editors enforce theology, subject positioning, and dated statistics[^editorial]:

1. **God acts first in spiritual fruit.** Never write `"Your gift saves lives"` or `"Together we transform nations."` Write `"God gathers believers into local churches; your giving frees a church planter to stay present with neighbors."`
2. **Local church planters act first.** Make local elders and church planters the active grammatical subjects (`"Local elders lead three weekly Scripture gatherings"` rather than `"Our donors empowered a local pastor"`).
3. **Match verbs to roles.** GF uses _coordinate, care, connect, equip, send, listen, steward, remove barriers_. Supporters and churches use _pray, write, give, host, visit, listen, learn, encourage_.
4. **Show, never self-praise.** Cut self-congratulatory labels (`"our humble, authentic team"`) and avoid verbal tics (`"quiet"`, `"steady"`, `"unhurried"`, `"walk with"`, `"zero"`). State concrete behavior instead (`"the local church hosting a visit can say no"`).
5. **Name Jesus Christ clearly at every altitude.** Never let warm words like _nearness_ or _fellowship_ crowd out the Gospel, Scripture, discipleship, and the local church[^foundations].
6. **Date and define every figure in the same sentence.** Always state year and scope (`"43 countries served in 2025 (2025 Annual Report)"`; `"584 workers served"`, footnoting source label `"workers mobilized"`).
7. **Zero em dashes, military verbs, or AI-tell clichés.** Never use em dashes (`U+2014`), `"It's not X, it's Y"`, `"Not just X, but Y"`, `"seamless"`, `"impacting lives"`, `"transforming nations"`, `"reaching the unreached"`, `"native missionary"`, or `"target/penetrate/conquer/crusade"`.

## 3. Tone Calibration Across Seven Contexts

| Context | Posture & Rhythm | Sample Opening |
| --- | --- | --- |
| **1. Joyful testimony** | Celebratory, grounded, reverent; ordinary concrete detail | _"Last Sunday morning our neighborhood fellowship gathered by the river to celebrate baptism with new believers reading Luke with local elders."_ |
| **2. Hardship or rest month** | Honest, protective of dignity; short plain sentences; 1-sentence rest option | _"This month has been heavy, and our regional care team encouraged [me / us] to step back for two weeks of rest."_ |
| **3. Sending churches & pastors** | Peer-to-peer, theologically serious, local-host veto upfront | _"Who decides whether a short-term visit would help? In Global Fellowship, the local church hosting it can say no."_ |
| **4. Donor stewardship** | Calm, exact, scoped footnotes, direct questions welcomed | _"Here is what came in, what went out, and what we held at the end of 2025. If anything is unclear, our Finance team will gladly answer your questions."_ |
| **5. Recruitment** | Direct on leadership, funding, conflict, care, and next steps | _"When a cross-cultural missionary arrives, the local leader still leads. Here are six questions people ask before applying."_ |
| **6. Bridge Project & Notes** | Neighborly, crisp, explicitly zero financial pressure | _"Exchange letters and pray with a local church planter across ordinary weeks. No financial gift is expected."_ |
| **7. Internal member care** | Confidential, spacious, explicitly inclusive of singles and families | _"You never need to reach crisis before asking for a conversation, a slower month, or a specialist counseling referral."_ |

## 4. Functional Microcopy Inventory

- **Draft nav labels:** `Our Mission`, `How We Work`, `Local Leadership`, `Ways to Join`, `The Bridge Project`, `Pray`, `Give`, `Serve`, `Financial Transparency`, `Statement of Faith`, `Contact`.
- **Approved CTAs (retiring `"Send Me"` boilerplate):** `Pray with a church planter`, `Send your first letter`, `Request a Bridge Project match`, `Explore serving with us`, `Partner financially`, `Request 2025 statements`, `Ask Finance a question`, `Schedule a pastor conversation`.
- **Planned canonical URLs (pending `OVR-21`; use verified email desks on print until live):** `/bridge-project`, `/financials`, `/give`, `/serve`, `/statement-of-faith`.
- **Tier-neutral dateline (cards & mobile):** `WEEKLY PRAYER · 2026` (Thai: `คำอธิษฐานประจำสัปดาห์ · 2026`). Keep explicit granularity labels (`LOCAL CONGREGATION`, `Location withheld`) strictly on internal records and consent forms.
- **Security notices (verbatim synced with templates):**
  - _Restricted card back (`GF-TPL-01`):_ `"Protect their household: God knows them by name. Pray at home and in small groups; do not photograph or post this card online."`
  - _Livestream Slide 5 footer (`GF-TPL-10`, zero internal tier labels on projected slides):_ `"Anonymous collective prayer · No restricted names, cities, or photos on screen"`
  - _Photo caption cue:_ `"Shared with permission · [Year]. Local elders lead weekly Scripture study."`
- **Donor & email microcopy:**
  - _Tax entity line:_ `"Global Fellowship, Inc. is a 501(c)(3) nonprofit organization (EIN 68-0214543). Mailing address: P.O. Box 1, Meadow Vista, CA 95722."`
  - _Fee-coverage label:_ `"Add an optional gift toward card processing and Home Office operations"`
  - _ECFA FAQ heading (single FAQ on `/give/help` only):_ `"Is Global Fellowship accredited by ECFA?"`
  - _Routine email subject:_ `[Initiative]: [One concrete fact or prayer need]`
  - _Lock-screen-safe hard-news subject:_ `Praying this week with our friends in Christ`
  - _Validation error:_ `"Please enter an email address where we can reply to you."`

## 5. Scripture Quotation Policy

1. Quote Scripture accurately in context rather than as commercial taglines.
2. Name the Bible translation beside every quotation (e.g., `Ephesians 2:13, ESV`), using true small caps (`Lord`) where the ESV renders the covenant divine name.
3. `ESV` is used provisionally in English templates pending leadership confirmation (`OVR-09`). Regional leaders select the trusted vernacular Scripture translation for non-English work.
