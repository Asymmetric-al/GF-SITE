import type { UrlObject } from "node:url";

/**
 * Converts a validated relative path (`/...`) into a Next.js `UrlObject` so
 * dynamic CMS links render via `<Link>` under `typedRoutes: true` without
 * narrowing casts (`as Route`).
 */
export const toInternalUrlObject = (relativeHref: string): UrlObject => {
  const parsed = new URL(relativeHref, "http://internal.invalid");

  return {
    hash: parsed.hash.length > 0 ? parsed.hash : undefined,
    pathname: parsed.pathname,
    search: parsed.search.length > 0 ? parsed.search : undefined,
  };
};
