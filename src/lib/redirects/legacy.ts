/**
 * Single canonical registry for public-safe legacy `globalfellowship.org`
 * `308` permanent redirects and `410 Gone` retired routes covering all
 * 199 live sitemap URLs with zero dead 404 gaps and zero redirect chains.
 *
 * SECURITY INVARIANT: Never add per-worker slugs, surnames, aliases, or
 * restricted codes to this file. Legacy `/missionary/*` routes redirect
 * uniformly without echoing the slug.
 */

export interface LegacyRedirectRule {
  readonly source: string;
  readonly destination: string;
  readonly permanent: true;
}

export const LEGACY_REDIRECTS: readonly LegacyRedirectRule[] = [
  // Core institutional, governance & stewardship aliases
  {
    destination: "/mission-and-values",
    permanent: true,
    source: "/about",
  },
  {
    destination: "/mission-and-values",
    permanent: true,
    source: "/our-mission-and-values",
  },
  {
    destination: "/mission-and-values#mission",
    permanent: true,
    source: "/our-mission",
  },
  {
    destination: "/mission-and-values#three-pillars",
    permanent: true,
    source: "/our-three-pillars",
  },
  {
    destination: "/mission-and-values#values",
    permanent: true,
    source: "/our-values",
  },
  {
    destination: "/how-we-work#strategy",
    permanent: true,
    source: "/our-strategy",
  },
  {
    destination: "/our-people#board",
    permanent: true,
    source: "/board-members",
  },
  {
    destination: "/financials#stewardship-model",
    permanent: true,
    source: "/100-model",
  },
  {
    destination: "/donor-privacy",
    permanent: true,
    source: "/donor-and-privacy-policy",
  },
  {
    destination: "/pray",
    permanent: true,
    source: "/prayer",
  },
  // Legacy verified 2025 PDF bookmarks (redirected to clean accessible HTML schedules)
  {
    destination: "/financials#statement-of-activity",
    permanent: true,
    source: "/StatementofActivity-2025-updated.pdf",
  },
  {
    destination: "/financials#statement-of-activity",
    permanent: true,
    source: "/financials/statement-of-activity-2025.pdf",
  },
  {
    destination: "/financials#statement-of-financial-position",
    permanent: true,
    source: "/StatementofFinancialPosition-2025-updated.pdf",
  },
  {
    destination: "/financials#statement-of-financial-position",
    permanent: true,
    source: "/financials/statement-of-financial-position-2025.pdf",
  },
  // Broad regional context pages (anti-mosaic safe)
  {
    destination: "/where-we-serve/central-asia",
    permanent: true,
    source: "/central-asia",
  },
  {
    destination: "/where-we-serve/east-asia",
    permanent: true,
    source: "/east-asia",
  },
  {
    destination: "/where-we-serve/south-asia",
    permanent: true,
    source: "/south-asia",
  },
  {
    destination: "/where-we-serve/southeast-asia",
    permanent: true,
    source: "/southeast-asia",
  },
  {
    destination: "/where-we-serve/middle-east",
    permanent: true,
    source: "/middle-east",
  },
  {
    destination: "/where-we-serve/north-africa",
    permanent: true,
    source: "/north-africa",
  },
  {
    destination: "/where-we-serve/europe",
    permanent: true,
    source: "/europe",
  },
  {
    destination: "/where-we-serve/americas",
    permanent: true,
    source: "/americas",
  },
  // Stories & leadership essays
  {
    destination: "/stories/you-can-land-but-taking-off-is-gods-work",
    permanent: true,
    source: "/article/Article",
  },
  {
    destination: "/stories/suffering-as-a-believer-shouldnt-be-surprising",
    permanent: true,
    source: "/article/Article-1",
  },
  {
    destination: "/stories/the-value-of-family-on-mission",
    permanent: true,
    source: "/article/Article-3",
  },
  {
    destination: "/stories",
    permanent: true,
    source: "/article/:slug*",
  },
  {
    destination: "/stories",
    permanent: true,
    source: "/articles",
  },
  // Unified opportunities, pathways, onboarding, and retired router redirects
  {
    destination: "/opportunities",
    permanent: true,
    source: "/join",
  },
  {
    destination: "/serve-across-cultures",
    permanent: true,
    source: "/serve",
  },
  {
    destination: "/serve-across-cultures#training",
    permanent: true,
    source: "/training",
  },
  {
    destination: "/churches#exposure-trips",
    permanent: true,
    source: "/exposure-trips",
  },
  {
    destination: "/opportunities",
    permanent: true,
    source: "/events",
  },
  {
    destination: "/opportunities?track=support",
    permanent: true,
    source: "/home-office",
  },
  {
    destination: "/serve-across-cultures#process",
    permanent: true,
    source: "/application-process",
  },
  {
    destination: "/serve-across-cultures#why-us",
    permanent: true,
    source: "/why-us",
  },
  {
    destination: "/give/help#questions",
    permanent: true,
    source: "/faqs",
  },
  // All 14 legacy root opportunity slugs
  {
    destination: "/opportunities/slovenia-church-planter",
    permanent: true,
    source: "/slovenia-church-planter",
  },
  {
    destination: "/opportunities/slovenia-youth-outreach",
    permanent: true,
    source: "/slovenia-youth-camp",
  },
  {
    destination: "/opportunities/serbia-church-planter",
    permanent: true,
    source: "/serbia-church-planter",
  },
  {
    destination: "/opportunities/bangladesh-church-planter",
    permanent: true,
    source: "/bangladesh-church-planter",
  },
  {
    destination: "/opportunities/director-of-development",
    permanent: true,
    source: "/director-of-development",
  },
  {
    destination: "/opportunities/director-of-mobilization",
    permanent: true,
    source: "/director-of-mobilization",
  },
  {
    destination: "/opportunities/director-of-operations",
    permanent: true,
    source: "/director-of-operation",
  },
  {
    destination: "/opportunities/director-of-member-care",
    permanent: true,
    source: "/director-of-member-care",
  },
  {
    destination: "/opportunities/business-and-project-developer",
    permanent: true,
    source: "/business-and-project-developer",
  },
  {
    destination: "/opportunities/finance-specialist",
    permanent: true,
    source: "/finance-specialist",
  },
  {
    destination: "/opportunities/administrative-specialist",
    permanent: true,
    source: "/administrative-specialist",
  },
  {
    destination: "/opportunities/social-media-and-pr-specialist",
    permanent: true,
    source: "/social-media-and-pr-specialist",
  },
  {
    destination: "/opportunities/event-and-hospitality-coordinator",
    permanent: true,
    source: "/event-and-hospitality-coordinator",
  },
  {
    destination: "/opportunities/it-coordinator",
    permanent: true,
    source: "/it-coordinator",
  },
  // Legacy giving, donor help, and account guides (`/checkout` and `/login`
  // are handled dynamically by server Route Handlers bridging Core's Donor App)
  {
    destination: "/give",
    permanent: true,
    source: "/checkout/thank-you",
  },
  {
    destination: "/give",
    permanent: true,
    source: "/donate",
  },
  {
    destination: "/give/help",
    permanent: true,
    source: "/how-to-make-a-donation",
  },
  {
    destination: "/give/help#donor-account",
    permanent: true,
    source: "/how-to-edit-existing-donation-or-pledge",
  },
  {
    destination: "/give/help#donor-account",
    permanent: true,
    source: "/how-to-update-payment-method",
  },
  {
    destination: "/give/help#other-ways",
    permanent: true,
    source: "/stock-donations",
  },
  {
    destination: "/donor-dashboard",
    permanent: true,
    source: "/user/:path*",
  },
  // Uniform catch-all for legacy missionary profiles (never echoes slug, zero worker map in Git)
  {
    destination: "/missionaries",
    permanent: true,
    source: "/missionary/:slug*",
  },
  {
    destination: "/missionaries",
    permanent: true,
    source: "/global-search",
  },
  // Flagship project aliases & Leadership Summit consolidation
  {
    destination: "/projects/where-most-needed",
    permanent: true,
    source: "/where-most-needed",
  },
  {
    destination: "/projects/where-most-needed",
    permanent: true,
    source: "/project/place-of-most-need",
  },
  {
    destination: "/projects/leadership-summit",
    permanent: true,
    source: "/global-fellowship-leadership-summit",
  },
  {
    destination: "/projects/leadership-summit",
    permanent: true,
    source: "/project/leadership-summit-main-1",
  },
  {
    destination: "/projects/leadership-summit",
    permanent: true,
    source: "/project/leadership-summit-dollar250",
  },
  {
    destination: "/projects/leadership-summit",
    permanent: true,
    source: "/project/leadership-summit-dollar250-1",
  },
  {
    destination: "/projects/leadership-summit",
    permanent: true,
    source: "/project/leadership-summit-dollar250-2",
  },
  {
    destination: "/projects/leadership-summit",
    permanent: true,
    source: "/project/leadership-summit-dollar250-3",
  },
  {
    destination: "/projects/leadership-summit",
    permanent: true,
    source: "/project/sponsor-church-planter-for-chiang-mai-leadership-summit",
  },
  {
    destination: "/projects/church-planters-training",
    permanent: true,
    source: "/project/church-planterstrainingfund",
  },
  {
    destination: "/projects/leadership-development",
    permanent: true,
    source: "/project/equipleaders",
  },
  {
    destination: "/projects/missions-tech-and-innovation",
    permanent: true,
    source: "/project/missions-tech-and-innovation-fund",
  },
  {
    destination: "/projects/urgent-member-care",
    permanent: true,
    source: "/project/UMCF",
  },
  {
    destination: "/projects/presidents-fund",
    permanent: true,
    source: "/project/the-presidents-fund",
  },
  {
    destination: "/projects/chiang-mai-field-office",
    permanent: true,
    source: "/project/field-office",
  },
  {
    destination: "/projects/gospel-for-fergana-valley",
    permanent: true,
    source: "/project/fergana-valley",
  },
  {
    destination: "/projects/church-construction-fund",
    permanent: true,
    source: "/project/church-buildings",
  },
  // Legacy project route normalization
  {
    destination: "/projects",
    permanent: true,
    source: "/project",
  },
  {
    destination: "/projects/:slug",
    permanent: true,
    source: "/project/:slug",
  },
  // Case-variant legacy Contact paths
  {
    destination: "/contact",
    permanent: true,
    source: "/Contact/contact-us",
  },
  {
    destination: "/contact",
    permanent: true,
    source: "/Contact/contact-form-thank-you",
  },
  {
    destination: "/contact",
    permanent: true,
    source: "/contact/contact-us",
  },
];

export const RETIRED_GONE_PATHS = [
  "/checkout-test",
  "/home-draft",
  "/ytd-statement-admin",
  "/annualfundraiser",
  "/silent-auction",
  "/christmas22",
  "/opportunities-copy",
  "/church-plantertemplate",
  "/field-supporttemplate",
  "/year-to-date-statement-wip",
  "/campaign",
  "/customize",
  "/promote",
  "/review",
  "/confirmation",
] as const;
