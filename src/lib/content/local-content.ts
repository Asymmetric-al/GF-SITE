import type { StarterPageContent } from "./types";

/**
 * Provisional local development content for the starter foundation.
 * Replace this module's backing source in `reader.ts` when Core's public
 * content contract is approved and integrated.
 */
export const LOCAL_STARTER_PAGE: StarterPageContent = {
  slug: "/",
  statusLabel: "Development Foundation: Provisional Scaffold",
  title: "Global Fellowship Website Foundation",
  summary:
    "Frontend application workspace prepared for Global Fellowship website development. Content on this screen is local development data; editorial management and publication will integrate with Core's Payload CMS v4 boundary in a later phase.",
  media: {
    url: "/starter-preview.svg",
    alt: "Provisional architectural wireframe placeholder representing future media assets",
    width: 960,
    height: 540,
    caption:
      "Provisional local SVG placeholder verifying responsive sizing, aspect ratio stability, and media metadata flow.",
  },
  checklistHeading: "Architecture Overview",
  checklistSummary:
    "Inspect each area below to verify the interactive Vercel UI SDK tabs styled with shadcn Base UI + Maia tokens.",
  pillars: [
    {
      id: "frontend",
      label: "Frontend Runtime",
      title: "Next.js App Router on Node.js 24",
      summary:
        "Server Components by default with typed routes, Cache Components, Partial Prefetching, and React Compiler enabled.",
      details: [
        "Bun manages packages and scripts while Next.js executes on Node.js 24 LTS.",
        "TypeScript 7.1 beta runs strict full-project checks alongside Next.js route type generation.",
        "Provisional deployments remain non-indexable until launch readiness and canonical domain confirmation.",
      ],
    },
    {
      id: "ui-system",
      label: "UI Architecture",
      title: "shadcn Tokens + Vercel UI SDK Primitives",
      summary:
        "One intentional interaction owner per control: shadcn (Base UI + Maia) supplies Tailwind v4 semantic tokens and static display components, while Vercel UI SDK owns stateful interactive primitives.",
      details: [
        "No Radix packages are installed anywhere in the dependency graph.",
        "Interactive UI SDK modules stay inside small client boundaries beneath @layer ui-sdk;.",
        "Keyboard navigation, focus management, ARIA names, and reduced motion are verified in Chromium.",
      ],
    },
    {
      id: "content-boundary",
      label: "Content Boundary",
      title: "Server-Only Reader Prepared for Core",
      summary:
        "Provisional content is isolated behind a small server-only module and passed to presentation components as typed props.",
      details: [
        "Runs, typechecks, and builds with zero CMS credentials, database connections, or Core runtime.",
        "Preserves media metadata (URL, alt text, dimensions, caption) without importing Core workspace packages.",
        "Transport, admission rules, caching, and Lexical rendering will be verified against Core's contract at integration time.",
      ],
    },
  ],
};
