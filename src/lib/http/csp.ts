const LOOPBACK_HOSTS = new Set(["localhost", "127.0.0.1", "[::1]", "::1"]);

const parseAllowedOrigin = (raw: string | undefined): string | null => {
  const trimmed = raw?.trim();

  if (trimmed === undefined || trimmed.length === 0) {
    return null;
  }

  try {
    const parsed = new URL(trimmed);

    if (
      parsed.protocol === "https:" ||
      (parsed.protocol === "http:" && LOOPBACK_HOSTS.has(parsed.hostname))
    ) {
      return parsed.origin;
    }

    return null;
  } catch {
    return null;
  }
};

/**
 * Builds the strict Content-Security-Policy response header, permitting remote
 * CMS media origins (`CMS_MEDIA_ORIGIN` / `CMS_BASE_URL`) and configured Core
 * Donor Application form-action origins (`DONOR_APP_BASE_URL` /
 * `NEXT_PUBLIC_DONOR_APP_BASE_URL` / `CHECKOUT_BASE_URL`), HTTPS-only outside
 * loopback.
 */
export const buildContentSecurityPolicy = (
  env: Readonly<Record<string, string | undefined>> = process.env
): string => {
  const extraImgOrigins: string[] = [];

  for (const raw of [env.CMS_MEDIA_ORIGIN, env.CMS_BASE_URL]) {
    const origin = parseAllowedOrigin(raw);

    if (origin !== null) {
      extraImgOrigins.push(origin);
    }
  }

  const donorOrigin = parseAllowedOrigin(
    env.DONOR_APP_BASE_URL ??
      env.NEXT_PUBLIC_DONOR_APP_BASE_URL ??
      env.CHECKOUT_BASE_URL
  );

  const imgSrc = ["'self'", "data:", ...new Set(extraImgOrigins)].join(" ");

  const formAction = donorOrigin === null ? "'self'" : `'self' ${donorOrigin}`;

  return [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline'",
    "style-src 'self' 'unsafe-inline'",
    `img-src ${imgSrc}`,
    "font-src 'self'",
    "connect-src 'self'",
    "media-src 'self'",
    "frame-src 'none'",
    "object-src 'none'",
    "base-uri 'self'",
    `form-action ${formAction}`,
    "frame-ancestors 'none'",
  ].join("; ");
};
