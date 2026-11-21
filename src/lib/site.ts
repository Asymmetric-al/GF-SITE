const LOCAL_FALLBACK_ORIGIN = "http://localhost:3000";

const parseOrigin = (rawValue: string | undefined): URL | null => {
  if (rawValue === undefined || rawValue.length === 0) {
    return null;
  }

  try {
    const parsed = new URL(rawValue);

    if (parsed.protocol !== "https:" && parsed.protocol !== "http:") {
      return null;
    }

    return new URL(parsed.origin);
  } catch {
    return null;
  }
};

/**
 * Returns the explicitly configured production site origin, or `null` until
 * `NEXT_PUBLIC_SITE_URL` is confirmed and set. Never derived from request hosts
 * or generated preview URLs.
 */
export const getConfiguredSiteOrigin = (): URL | null =>
  parseOrigin(process.env.NEXT_PUBLIC_SITE_URL);

/**
 * Resolves `metadataBase` for Next.js metadata generation. Falls back to the
 * local development origin only so relative metadata paths stay valid locally.
 */
export const getMetadataBase = (): URL =>
  getConfiguredSiteOrigin() ?? new URL(LOCAL_FALLBACK_ORIGIN);

/**
 * Builds a canonical URL only when a confirmed site origin is explicitly set.
 * Returns `undefined` while running as an unconfigured scaffold or preview.
 */
export const getCanonicalUrl = (pathname: string): string | undefined => {
  const origin = getConfiguredSiteOrigin();

  if (!origin) {
    return undefined;
  }

  return new URL(pathname, origin).toString();
};

/**
 * Provisional scaffold and previews must remain non-indexable regardless of
 * deployment environment label. Indexing stays disabled until explicitly
 * enabled for launch once the real domain and content are ready.
 */
export const isSearchIndexingEnabled = (): boolean => false;

export const SITE_DEFAULTS = {
  description:
    "Provisional frontend foundation for the Global Fellowship website.",
  name: "Global Fellowship (Development Scaffold)",
} as const;
