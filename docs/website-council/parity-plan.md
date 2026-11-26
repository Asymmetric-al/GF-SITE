# Website Council Parity & Zero-Filler Architecture Plan (`globalfellowship.org` -> `GF-SITE` + `Core CMS`)

**Date:** `2026-11-24`  
**Mandate:** Bring full functional and content parity with real `https://globalfellowship.org` ministry catalogs and processes (Missionaries, Projects, Opportunities, Exposure Trips, Our People & Board, 9-Step Strategy, 9-Step Onboarding, Leadership Essays, and real Global Fellowship photography pulled directly from `globalfellowship.org`), while ruthlessly removing filler from both the legacy SiteStacker site and our earlier `GF-SITE` rounds.  
**Participating Council Seats:** Seat 3 (`Gemini 4 Neon xHigh`), Seat 4 (`Orchestrator Neon xHigh`), and Seat 5 (`Claude Opus 5.5 xHigh`; weighted first as the primary non-Gemini bar). Seats 1 (`GPT 6.2 Sol xHigh`) and 2 (`GPT 6.2 Astra High`) were rate/quota-limited on `ChatGPT - Personal` and recorded candidly without substitution.

---

## 1. Ruthless Filler Cuts Adopted Across `GF-SITE`

All three seats independently converged on removing over-defensive policy prose and UI clutter from `GF-SITE`:

1. **Delete `/join` (`src/app/(site)/join/page.tsx`)** -> `308` redirect to `/opportunities`. Removes the invented middleman router page.
2. **Unify `/serve` into `/opportunities`** (`308` redirect `/serve` -> `/opportunities`). Replaces 477 lines of vague zero-opening prose (`SERVE_SAMPLE_NOTE`, duplicate jump rail, repeated "honest conversation") with concrete Field and Home Office openings, 9-step onboarding, Why Us, and candidate FAQs.
3. **Replace `/projects` placeholder** (`PROJECT_PRINCIPLES`, duplicate `finance@` CTAs, old-mailer card) with a filterable Projects Directory (Core CMS live + verified flagship institutional funds catalog) and `GivingHandoffWidget` on `/projects/[slug]`.
4. **Replace `/missionaries` redirect** (and delete the false _"does not publish a public searchable directory"_ line in `/give/help`) with live `/missionaries` and `/missionaries/[id]` routes backed by `Asymmetric-al/core` (`missionary-giving-pages` + fail-closed `proxy.ts` admission + runtime CSP + unified photo-optional card geometry for Tier 1 and Tier 2), showing verified public U.S. leadership profiles only when Core is disconnected (zero restricted field workers in Git per `OVR-14`).
5. **Rebuild `/give` & `/give/help`:** Lead `/give` directly with the **3 real giving paths** (`Give to a Missionary`, `Give to a Project`, `Give Where Most Needed`) above Giving Methods Tabs and byte-exact `PROOF_LEDGER_2025` stewardship wording; cut duplicate hero aside, printed-letter bar, redundant paraphrase, and bottom no-cost twin. Cut the copy-pasted 4-desk `/contact` table from `/give/help` and add crisp Donor Self-Service guides and `#questions` FAQs.
6. **Rebuild `/stories` + add `/stories/[slug]`:** Cut the 300-line apologetic holding box, 3-column `STORY_CLEARANCE_STEPS` repeat, and random `STORYTELLER_PRAYER`. Render live Core `updates` first, followed by cleared U.S. leadership essays (including Don Oates' firsthand Liberia account), with a single crisp consent and removal line.
7. **Streamline Home (`/`), `/bridge-project`, `/local-leaders`, `/churches`, `/pray`, `/contact`, and `/financials`:**
   - Home: Cut duplicate `ORIGIN_MILESTONES` card, abstract `operatingOrder` triad, and `HomePathwaysSection` filler; merge 2025 Field Fruit + Open Books into one crisp `"2025 at a glance"` proof band; feature real Projects, Opportunities, and GF photography directly on Home.
   - `/bridge-project`: Cut fabricated `SAMPLE_PLANTER_REPLY` and duplicate `BridgePrayerSanctuary`; place practical letter habits beside `BridgeStarterNoteComposer`.
   - `/local-leaders`: Collapse 4x repeated promises into one crisp commitments + standards section and replace the pre-written email template with a concise 3-line email safety checklist.
   - `/churches`: Extract full Exposure Trips logistics to dedicated `/exposure-trips`; cut the 3rd duplicate CTA banner at the bottom.
   - `/contact`: Replace the duplicate above-the-fold safeguarding banner with a single-line jump strip (`#safeguarding`) and cut the generic welcome paragraph.
   - Site-wide controls: Keep `"Within N business days"` strictly on `/contact`; keep `PrintButton` strictly on genuinely printable artifacts (`/financials`, `/statement-of-faith`, `/donor-privacy`, `/give` check slip, `/pray`, Tier 1 prayer cards); cut gratuitous `CopyNoteButton` sprawl.

## 2. Legacy `globalfellowship.org` Bloat Explicitly Rejected

- `Lorem ipsum` bio under Garrett & Elizabeth Woodroof on `/board-members`.
- Duplicate desktop/mobile DOM blocks, embedded login modals on every page, dead `/events` login wall, and repeated 3-card `"Send Me / Find Out More / Missions Coach"` footer spam.
- Copy-paste errors on legacy job descriptions (`Director of Member Care` reading `"As Director of Development"`) and mis-pasted FAQ answers.
- 5 duplicate Leadership Summit project slugs (consolidated cleanly into `/projects/leadership-summit`).
- Unqualified `"100%"` / `"0% overhead"` headlines (`OVR-01`), retired `"only 3%"` heuristic (`retired-claims.md`), named personal medical campaigns, worker-named standalone funds, and sensitive restrictive-country fund titles.
- All 42 previously unhandled live sitemap URLs mapped cleanly via `308` redirects or `410 Gone` (`RETIRED_GONE_PATHS`) so zero live legacy paths fall into dead `404`s.

## 3. Revised Navigation & Page Architecture

- **Primary Header (5 Items + `Give` Pill):** `About` (`/how-we-work`) · `Missionaries` (`/missionaries`) · `Projects` (`/projects`) · `Opportunities` (`/opportunities`) · `Pray` (`/pray`) · **`[Give]`** (`/give`)
- **Contextual Zero-JS Sub-Navigation Bars:**
  - About family: `How We Work & Strategy` · `Our People & Board` · `Where We Serve` · `2025 Financials` · `Statement of Faith` · `Stories` · `Contact`
  - Give family: `Ways to Give` · `Missionaries` · `Projects` · `2025 Financials` · `Donor Help & FAQs`
  - Opportunities family: `Open Roles & Process` · `Exposure Trips` · `For Local Leaders` · `For Sending Churches` · `The Bridge Project`
- **Real Global Fellowship Photography:** Pull genuine, EXIF-stripped, Sharp-optimized Global Fellowship photographs directly from `https://globalfellowship.org` into `public/photos/gf/` (Board & Executive portraits, field Bible study, baptism, ministry gatherings, flagship projects, and field opportunities) per explicit stakeholder authorization, while keeping Tier 2 / protected missionary cards photo-free inside a unified photo-optional card skeleton (zero silhouettes, zero padlocks).

## 4. Phased Implementation Waves

- **Wave 1 (Photos, Core Boundary & Giving Parity):** Pull and EXIF-strip live `globalfellowship.org` photos into `public/photos/gf/`; generalize `admission-handoff.ts` and `src/proxy.ts` + `next.config.ts` CSP + `revalidate/route.ts` for `/missionaries/[id]` alongside `/projects/[slug]`; build `src/lib/giving/checkout-handoff.ts` mirroring Core's `checkout-handoff.ts`; ship `/missionaries`, `/missionaries/[id]`, rebuilt `/projects` & `/projects/[slug]` (including unified `/projects/leadership-summit`), rebuilt 3-path `/give`, and self-service `/give/help#questions`.
- **Wave 2 (Opportunities, Exposure Trips, Our People, Strategy & Stories):** Ship unified `/opportunities` + `/opportunities/[slug]` (deleting `/serve` and `/join`), dedicated `/exposure-trips`, `/our-people` (real leadership & Board portraits/bios, zero `Lorem ipsum`), `/how-we-work#strategy` (9-step church-planting lifecycle), and rebuilt `/stories` + `/stories/[slug]` (live Core updates + Don Oates' Liberia essay & Anne Beaumont's family essay).
- **Wave 3 (Navigation, Home, Filler Purge, 199-URL Redirects & Verification):** Apply the 5-item + `Give` nav, contextual sub-navs, lean 3-column footer, rebuilt Home with Featured Projects/Opportunities/GF photos, Section 1 trims across `/bridge-project`, `/local-leaders`, `/churches`, `/pray`, `/contact`, `/where-we-serve/[region]`, complete 199-URL redirect & `410 Gone` parity, updated Vitest + Playwright + live Core CMS v4 drill (covering both `/projects/[slug]` and `/missionaries/[id]`!), and updated docs/OKF.
