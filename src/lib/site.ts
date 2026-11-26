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
    "A Christian fellowship helping local believers plant churches where Jesus is little known, alongside cross-cultural missionaries who serve under their leadership.",
  name: "Global Fellowship",
  ogImageAlt:
    "Global Fellowship: Helping local believers plant churches where Jesus is little known.",
  ogImagePath: "/brand/og-link-preview-1200x630.png",
} as const;

export const SITE_OPEN_GRAPH = {
  description: SITE_DEFAULTS.description,
  images: [
    {
      alt: SITE_DEFAULTS.ogImageAlt,
      height: 630,
      url: SITE_DEFAULTS.ogImagePath,
      width: 1200,
    },
  ],
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

const resolvePreviewAssetOrigin = (): URL | null => {
  const rawVercelUrl = process.env.VERCEL_URL?.trim();

  if (rawVercelUrl === undefined || rawVercelUrl.length === 0) {
    return null;
  }

  const withProtocol =
    rawVercelUrl.startsWith("https://") || rawVercelUrl.startsWith("http://")
      ? rawVercelUrl
      : `https://${rawVercelUrl}`;

  return parseOrigin(withProtocol);
};

/**
 * Resolves `metadataBase` strictly for social-image asset URL resolution
 * (separate from `getCanonicalUrl()`). Uses:
 * 1. Confirmed production `NEXT_PUBLIC_SITE_URL` outside previews.
 * 2. Preview deployment `VERCEL_URL` on Vercel previews so OG images resolve
 *    without emitting a production canonical.
 * 3. `http://localhost:3000` only when running locally (non-Vercel builds/dev)
 *    so local production builds never emit a Next.js missing-`metadataBase`
 *    warning while deployed production builds without a configured origin stay
 *    honestly unset.
 */
export const getMetadataBase = (): URL | undefined => {
  const configured = getConfiguredSiteOrigin();

  if (configured !== null) {
    return configured;
  }

  const previewAssetOrigin = resolvePreviewAssetOrigin();

  if (previewAssetOrigin !== null) {
    return previewAssetOrigin;
  }

  if (
    process.env.NODE_ENV === "development" ||
    process.env.VERCEL_ENV === undefined ||
    process.env.VERCEL_ENV.length === 0
  ) {
    return new URL(LOCAL_FALLBACK_ORIGIN);
  }

  return undefined;
};

/**
 * Builds a canonical URL only when a confirmed non-preview site origin is
 * explicitly set. Returns `undefined` while running as an unconfigured preview
 * or staging deployment.
 */
export const getCanonicalUrl = (pathname: string): string | undefined => {
  const origin = getConfiguredSiteOrigin();

  if (!origin) {
    return undefined;
  }

  return new URL(pathname, origin).toString();
};

/**
 * Builds page metadata without conditional empty-object spreads so canonical
 * URLs are emitted only when an explicit non-preview site origin is set.
 */
export const buildPageMetadata = (input: {
  readonly title: string;
  readonly description?: string | null;
  readonly pathname: string;
}): Metadata => {
  const resolvedDescription = input.description ?? SITE_DEFAULTS.description;
  const fullTitle = `${input.title} | ${SITE_DEFAULTS.name}`;

  const metadata: Metadata = {
    description: resolvedDescription,
    openGraph: {
      ...SITE_OPEN_GRAPH,
      description: resolvedDescription,
      title: fullTitle,
    },
    title: input.title,
    twitter: {
      card: "summary_large_image",
      description: resolvedDescription,
      images: [SITE_DEFAULTS.ogImagePath],
      title: fullTitle,
    },
  };

  const canonical = getCanonicalUrl(input.pathname);

  if (canonical !== undefined) {
    metadata.alternates = { canonical };
    metadata.openGraph = {
      ...metadata.openGraph,
      url: canonical,
    };
  }

  return metadata;
};

/**
 * Enables search-engine crawlability on production and local builds while
 * keeping Vercel preview deployments (`VERCEL_ENV === "preview"`) strictly
 * non-indexable (`noindex, nofollow`, `Disallow: /`, empty sitemap).
 * Standalone legal/error/outage/checkout routes enforce explicit `noindex`
 * independently.
 */
export const isSearchIndexingEnabled = (): boolean => !isPreviewDeployment();
