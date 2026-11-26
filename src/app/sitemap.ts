import type { MetadataRoute } from "next";

import { REGIONAL_CONTEXTS } from "@/lib/brand/foundations";
import { LEADERSHIP_ESSAYS } from "@/lib/content/leadership-essays";
import { OPPORTUNITIES_CATALOG } from "@/lib/content/opportunities-catalog";
import { STANDING_PROJECTS } from "@/lib/content/standing-projects";
import { getConfiguredSiteOrigin, isSearchIndexingEnabled } from "@/lib/site";

const STATIC_PUBLIC_PATHS = [
  "/",
  "/mission-and-values",
  "/how-we-work",
  "/our-people",
  "/where-we-serve",
  "/missionaries",
  "/projects",
  "/opportunities",
  "/local-leaders",
  "/serve-across-cultures",
  "/churches",
  "/bridge-project",
  "/pray",
  "/give",
  "/give/help",
  "/financials",
  "/statement-of-faith",
  "/stories",
  "/contact",
  "/donor-privacy",
  "/credits",
] as const;

/**
 * Search-engine sitemap gated strictly behind `isSearchIndexingEnabled()`.
 * Returns an empty list during pre-launch preview (`noindex`) and emits all
 * canonical public routes (excluding standalone noindex app legal pages and
 * restricted field worker IDs) once leadership authorizes public indexing.
 */
export const buildSitemapEntries = (
  origin: URL | null,
  indexingEnabled: boolean
): MetadataRoute.Sitemap => {
  if (!indexingEnabled || origin === null) {
    return [];
  }

  const regionPaths = REGIONAL_CONTEXTS.map(
    (region) => `/where-we-serve/${region.slug}`
  );

  const projectPaths = STANDING_PROJECTS.map(
    (project) => `/projects/${project.slug}`
  );

  const opportunityPaths = OPPORTUNITIES_CATALOG.map(
    (role) => `/opportunities/${role.slug}`
  );

  const essayPaths = LEADERSHIP_ESSAYS.map((essay) => `/stories/${essay.slug}`);

  return [
    ...STATIC_PUBLIC_PATHS,
    ...regionPaths,
    ...projectPaths,
    ...opportunityPaths,
    ...essayPaths,
  ].map((pathname) => ({
    url: new URL(pathname, origin).toString(),
  }));
};

const sitemap = (): MetadataRoute.Sitemap =>
  buildSitemapEntries(getConfiguredSiteOrigin(), isSearchIndexingEnabled());

export default sitemap;
