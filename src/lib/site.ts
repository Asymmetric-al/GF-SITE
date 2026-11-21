import type { Metadata } from "next";

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

export const SITE_DEFAULTS = {
  description:
    "Provisional frontend foundation for the Global Fellowship website.",
  name: "Global Fellowship (Development Scaffold)",
} as const;

export const SITE_OPEN_GRAPH = {
  description: SITE_DEFAULTS.description,
  siteName: SITE_DEFAULTS.name,
  title: SITE_DEFAULTS.name,
  type: "website",
} as const satisfies NonNullable<Metadata["openGraph"]>;

/**
 * Returns true when running in a Vercel preview deployment. Preview deployments
 * must never emit production canonical URLs even if `NEXT_PUBLIC_SITE_URL` is
 * accidentally inherited from project settings.
 */
export const isPreviewDeployment = (): boolean =>
  process.env.VERCEL_ENV === "preview";

/**
 * Returns the explicitly configured production site origin, or `null` until
 * `NEXT_PUBLIC_SITE_URL` is confirmed and set outside preview deployments.
 * Never derived from request hosts or generated preview URLs.
 */
export const getConfiguredSiteOrigin = (): URL | null => {
  if (isPreviewDeployment()) {
    return null;
  }

  return parseOrigin(process.env.NEXT_PUBLIC_SITE_URL);
};

/**
 * Resolves `metadataBase` for Next.js metadata generation. Falls back to the
 * local development origin only in development so preview/production builds
 * never emit `http://localhost:3000` in relative metadata URLs.
 */
export const getMetadataBase = (): URL | undefined => {
  const configured = getConfiguredSiteOrigin();

  if (configured !== null) {
    return configured;
  }

  return process.env.NODE_ENV === "development"
    ? new URL(LOCAL_FALLBACK_ORIGIN)
    : undefined;
};

/**
 * Builds a canonical URL only when a confirmed non-preview site origin is
 * explicitly set. Returns `undefined` while running as an unconfigured scaffold
 * or preview deployment.
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
