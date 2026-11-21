# GF-SITE Design Reference

> **Setup document. Existing evidence is recorded below; new design direction has not been selected.**

This document is the canonical design reference for `GF-SITE` (Global Fellowship public website frontend). Read it before work that materially affects visual design, layout, interaction, navigation, iconography, imagery, motion, or public content presentation.

## How to Read Evidence in This Document

Every statement in this document is categorized into one of four evidence levels so future agents do not mistake provisional scaffold code or vendor defaults for approved design choices:

- **Explicitly established:** Supported by an identifiable user instruction or accepted architecture decision.
- **Observed in the implementation:** Currently present in repository code, stylesheets, or assets without assuming creative approval.
- **Existing proposal, not approved:** Available option, catalog direction, or prior suggestion that must **not** be treated as approved requirements.
- **Undecided or unknown:** Open creative or product question requiring future design work or user clarification.

---

## 1. Purpose and Scope

- **Governs:** Public-facing web UI, layout, semantic design tokens, component boundaries, interactive behavior, accessibility, responsive layout, motion, imagery/media presentation, and public editorial quality in `GF-SITE`.
- **Does not govern:** `Asymmetric-al/core` administration, Payload CMS v4 schemas, database models, authentication, or backend infrastructure.
- **Related canonical references:**
  - [AGENTS.md](./AGENTS.md) — Concise repository rules, task routing, and verification expectations.
  - [README.md](./README.md) — Runtime environment, scripts, and local setup.
  - [docs/core-integration.md](./docs/core-integration.md) — Inspected Core CMS snapshot and future content-contract boundary.
  - [docs/testing.md](./docs/testing.md) — Automated testing, accessibility, visual regression, performance baselines, and technical SEO verification.
  - [docs/agent-toolkit.md](./docs/agent-toolkit.md) and [agent-toolkit-manifest.json](./agent-toolkit-manifest.json) — Installed skills, catalogs, MCP servers, CLIs, and authentication boundaries.

---

## 2. Confirmed Constraints and Decisions

### Technical and Architectural Constraints (Explicitly Established)

| Decision | Status | Source and Scope |
| --- | --- | --- |
| Standalone frontend workspace (`Asymmetric-al/GF-SITE`) running Next.js App Router (`16.4.6`) + React `19.3.1` on Node.js 24 LTS with Bun `1.4.3` for package/script management | **Explicitly established** | User setup instructions; governs the entire repository. |
| Strict **NO Radix** rule (`radix-ui` and `@radix-ui/*` must never be installed directly or transitively) | **Explicitly established** | Explicit user directive (Base UI or Vercel UI SDK only, zero Radix); applies to all dependencies and imported catalog source. |
| Dual-boundary UI layer: **shadcn (`base-maia` / `@base-ui/react` + Hugeicons)** owns Tailwind v4 semantic styling tokens (`src/app/globals.css`), `cn()`, and static/display UI in `src/components/ui/`; **Vercel UI SDK (`@ui-sdk/core` + `@ui-sdk/react`)** owns all stateful interactive primitives under `@layer ui-sdk;` | **Explicitly established** | Explicit user architecture decision; never stack two focus, keyboard, selection, dismissal, or popup engines onto one control. |
| Latest **Tiptap (`3.35.0`)** packages (`@tiptap/core`, `@tiptap/pm`, `@tiptap/react`, `@tiptap/starter-kit`, `@tiptap/static-renderer`) installed for any frontend rich-text needs | **Explicitly established** | Explicit user directive (2026-11-21); Core's Payload CMS v4 Lexical editorial ownership remains separate until live CMS integration. |
| Future CMS separation: `Asymmetric-al/core` owns Payload CMS v4, persistence, media storage, and editorial publishing; `GF-SITE` consumes content through a server-only reader boundary (`src/lib/content/`) | **Explicitly established** | User architecture decision; documented in [docs/core-integration.md](./docs/core-integration.md). |
| Non-indexable provisional deployment until real domain, content, and launch readiness are confirmed (`noindex, nofollow`, `Disallow: /`, no preview canonical URL) | **Explicitly established** | Initial foundation contract (`src/lib/site.ts`, `src/app/robots.ts`). |
| Server-first rendering with small `"use client"` interactive leaf modules; full WCAG 2.1 A/AA verification plus reduced-motion support | **Explicitly established** | Foundation and testing requirements. |
| Registry and style configuration ([components.json](./components.json): `style: "base-maia"`, `iconLibrary: "hugeicons"`, 14 external registries configured) | **Explicitly established** | Architecture setup; governs all shadcn CLI and MCP discovery. |
| Design-system static lint enforcement ([oxlint.config.ts](./oxlint.config.ts): `@shadcn/lint` via `ultracite/oxlint/shadcn`, allowing `layout` placement and `Card`/`CardContent` spacing scale) | **Explicitly established** | Quality toolchain configuration; enforced via `bun run check`. |

### Editorial Constraints (Explicitly Established)

| Decision | Status | Source and Scope |
| --- | --- | --- |
| Public copy uses plain, natural, direct, source-backed language without invented claims, testimonials, statistics, or SaaS sales pressure | **Explicitly established** | Toolkit editorial guidance for organizational/ministry websites. |
| Avoid em dashes in public website copy | **Explicitly established** | User editorial preference recorded in toolkit companion. |

---

## 3. Current Implementation References (Observed, Not Approved Design Direction)

These files describe what exists in the provisional starter scaffold today. Treat observed visual properties (colors, font choices, layout proportions, spacing, card styling) as **neutral scaffold defaults**, not approved creative direction.

| Concern | Authoritative File | Current Status |
| --- | --- | --- |
| Semantic CSS custom properties, Tailwind v4 `@theme inline`, `@layer ui-sdk;`, and `prefers-reduced-motion` reset | [src/app/globals.css](./src/app/globals.css) | **Observed in the implementation** (shadcn `base-maia` neutral defaults; `--radius: 0.625rem`; light and `.dark` variable blocks exist, no theme switcher mounted) |
| Root HTML structure, `next/font/google` declarations (`Figtree`, `Geist_Mono`), skip-to-content link, and metadata | [src/app/layout.tsx](./src/app/layout.tsx) | **Observed in the implementation** (scaffold font pairing from `base-maia` preset; not an approved brand typography selection) |
| Provisional starter route (`/`) | [src/app/page.tsx](./src/app/page.tsx) | **Observed in the implementation** (single-column `max-w-4xl` placeholder showing scaffold status, wireframe preview, and architecture tabs) |
| Provisional wireframe placeholder asset | [public/starter-preview.svg](./public/starter-preview.svg) | **Observed in the implementation** (temporary `960x540` SVG placeholder) |
| Static/display shadcn primitives | [src/components/ui/badge.tsx](./src/components/ui/badge.tsx), [button.tsx](./src/components/ui/button.tsx), [card.tsx](./src/components/ui/card.tsx), [separator.tsx](./src/components/ui/separator.tsx) | **Observed in the implementation** (`shadcn@4.23.0` `base-maia` components) |
| Interactive Vercel UI SDK reference component | [src/components/foundation-tabs.tsx](./src/components/foundation-tabs.tsx) | **Observed in the implementation** (`@ui-sdk/react/tabs` styled with Tailwind tokens and Hugeicons) |
| Error and not-found route boundaries | [src/app/error.tsx](./src/app/error.tsx), [src/app/not-found.tsx](./src/app/not-found.tsx) | **Observed in the implementation** |
| Server-only provisional content types and data | [src/lib/content/types.ts](./src/lib/content/types.ts), [local-content.ts](./src/lib/content/local-content.ts), [reader.ts](./src/lib/content/reader.ts) | **Observed in the implementation** |

---

## 4. Component and Token Ownership

1. **Semantic tokens (`src/app/globals.css`):** Single source of truth for CSS variables mapped through `@theme inline`. Keep `@layer ui-sdk;` on line 1 above `@import "tailwindcss";`. Never hardcode raw Tailwind palette colors or arbitrary hex values in feature code (`shadcn/no-raw-colors`, `shadcn/no-arbitrary-values`).
2. **Static and display primitives (`src/components/ui/`):** Generated and maintained via `shadcn` (`base-maia`, Hugeicons). Components own their visual variants; page callers control layout placement only (`shadcn/no-restyle`, with narrow `Card`/`CardContent` spacing contract in `oxlint.config.ts`).
3. **Stateful interactive primitives (`src/components/`):** Implemented on `@ui-sdk/react/*` + `@ui-sdk/core` inside small `"use client"` leaf modules. Read `node_modules/@ui-sdk/react/docs/llms.txt` before building or extending any interactive control.
4. **Rich-text surface (future feature work):** Use the installed Tiptap `3.35.0` packages for frontend rich-text editing or static rendering (`@tiptap/static-renderer`). Keep visual styling bound to semantic tokens in `src/app/globals.css`, interactive controls aligned with UI SDK, and Core Payload CMS Lexical contracts cleanly separated until CMS integration is specified.
5. **External UI catalogs (`components.json`):** React Bits / Pro, ReUI, Shadcnblocks, Shadcn UI Kit, Shadcn Studio, Efferd, and Shadcn Space are registered as **discovery and source-adaptation catalogs**, not pre-approved visual systems. Before adopting any item:
   - Inspect returned dependencies and source imports for zero Radix (`radix-ui` / `@radix-ui/*`).
   - Note that none of these third-party catalogs ship Vercel UI SDK native behaviors; adapt interactive primitives onto `@ui-sdk/react` and preserve GF-SITE's semantic tokens and icon system.

---

## 5. Existing Proposals and Available Directions (Not Approved)

The following installed tools and licensed catalogs provide alternative design directions and theme presets. **None of them are approved or active:**

- **React Bits Pro Agent Kit** (16 design directions, 12 page prompts, 6 recipes) — **Existing proposal, not approved**; reference catalog only.
- **Shadcn UI Kit design packs** (Eclipse, Clay, Nebula, Ember, Monolith, Verdant, Stellar, Crayon) — **Existing proposal, not approved**; do not run design-pack theme installers without explicit user approval.
- **Shadcn Studio themes (`@ss-themes`)** — **Existing proposal, not approved**; do not overwrite `src/app/globals.css`.
- **Impeccable design context (`/impeccable init`)** — **Existing proposal, not approved**; invoke only when beginning an explicit design-direction phase.

---

## 6. Areas Awaiting Design Work (Undecided)

All areas below remain **Undecided or unknown** and require dedicated user input or an approved design brief before implementation:

| Area | Status | Notes / Questions to Resolve Later |
| --- | --- | --- |
| Brand identity, positioning, and audiences | **Undecided** | Define primary visitor audiences, goals, and key journeys (understanding Global Fellowship, contacting, participating, giving, partnering). |
| Color palette, contrast system, and dark-mode support | **Undecided** | Choose light palette, semantic roles, accent hierarchy, and whether dark mode will be supported or exposed with a toggle. |
| Typography system and type scale | **Undecided** | Confirm whether `Figtree` / `Geist_Mono` remain or are replaced by brand fonts; define heading, body, caption, and fluid scale rules. |
| Layout grid, spacing rhythm, and breakpoints | **Undecided** | Define container widths, section rhythm, responsive grid patterns, and header/footer structure. |
| Information architecture and navigation model | **Undecided** | Define route hierarchy, primary/secondary navigation, mobile navigation behavior, and footer architecture. |
| Imagery, photography, and illustration direction | **Undecided** | Define real photography standards, aspect ratios, framing, caption style, and decorative vs informative alt-text conventions. |
| Iconography treatment | **Undecided** | Hugeicons (`@hugeicons/react`) is installed as the baseline library; stroke weight, sizing scale, and visual usage rules are undecided. |
| Motion and interaction choreography | **Undecided** | Define motion principles, duration/easing tokens, transition scope, and whether Motion (`motion`) is needed beyond CSS transitions. |
| Brand voice and public copy guidelines | **Undecided** | Plain language, factual accuracy, and no em dashes are established; detailed tone, terminology, and Vale ruleset tuning remain open. |
| Component visual treatment and surface hierarchy | **Undecided** | Define elevation, borders, radii, interactive states, form styling, and rich-text/Tiptap typography (`prose` or semantic styles). |
| Launch domain, canonical URL, and structured data policy | **Undecided** | `NEXT_PUBLIC_SITE_URL`, public indexing activation, sitemap strategy, and Schema.org JSON-LD types await real content and domain confirmation. |

---

## 7. Design Quality and Verification Process

Future design and UI work should be judged by verifiable user outcomes rather than personal aesthetic preferences:

- **Clarity and hierarchy:** Visitors can immediately identify page purpose, reading order, headings, and primary actions without visual clutter.
- **Coherent interaction:** Interactive widgets use a single behavior owner (`@ui-sdk/react`), support pointer, touch (`>= 44px` / comfortable tap targets), keyboard navigation, visible focus states, and clean focus return.
- **Responsive stability:** Layouts work cleanly from narrow mobile (`320px`, `390px`) through desktop viewports with zero unintended horizontal overflow and stable image dimensions (no CLS).
- **Accessibility:** Semantic HTML landmarks, single `<h1>`, meaningful accessible names, WCAG 2.1 A/AA contrast, automated `@axe-core/playwright` scans across default and interactive states, plus manual keyboard and screen-reader review.
- **Purposeful motion:** Motion clarifies state changes or spatial continuity, remains interruptible, avoids layout-thrashing properties, and honors `prefers-reduced-motion: reduce`.
- **Accurate, readable content:** Real source-backed copy, plain language without em dashes, clear labels and error/empty states, checked against Vale vocabulary and content-design principles.
- **Performance:** Production builds stay lean (checked with `bun run analyze` and repeated mobile/desktop Lighthouse CI runs in `docs/testing.md`).

### Right-Sized Verification by Change Type

- **Docs or design-reference changes:** Verify links (`bun run check:links`), prose (`bun run check:prose`), and accuracy against actual files.
- **Component or styling changes:** Run `bun run check` (includes `@shadcn/lint`), `bun run typecheck`, targeted Vitest tests (`bun run test:run`), and Playwright smoke + accessibility (`bun run test:smoke`, `bun run test:a11y`) plus visual review (`bun run test:visual` when visual baselines intentionally change).
- **Layout, route, or asset-heavy changes:** Add production build (`bun run build`), bundle analysis (`bun run analyze`), and isolated mobile/desktop Lighthouse CI (`bun run perf:lhci`).
- **Lead/reviewer skill pairing:** Pick **one** lead skill per task (for example, `frontend-design` or `impeccable` for art direction; `ui-sdk` + `shadcn` for component implementation; `emil-design-eng` / `animate` for motion) and ask a second reviewer skill (`web-design-guidelines`, `impeccable`, `review-animations`, `break-ui`) a concrete review question rather than applying competing design systems at once.

---

## 8. Decision Maintenance

When the user explicitly approves a future design decision:

1. Move the item out of **Section 6 (Areas Awaiting Design Work)** into **Section 2 (Confirmed Constraints and Decisions)** or a dedicated approved subsection.
2. Record **what was decided**, **rationale**, **source** (user instruction, PR, or approved brief), **date**, and **scope**.
3. Link directly to the authoritative implementation file (`src/app/globals.css`, `src/app/layout.tsx`, `src/components/ui/*`) instead of duplicating mutable values in multiple places.
4. Never silently overwrite or delete a superseded decision; mark it as **Superseded** with a pointer to the replacement decision.
5. Keep observations strictly separate from explicit approvals, and keep `AGENTS.md` concise by linking here rather than duplicating design details.
