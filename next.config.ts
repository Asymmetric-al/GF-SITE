import type { NextConfig } from "next";

import { buildContentSecurityPolicy } from "./src/lib/http/csp";
import { LEGACY_REDIRECTS } from "./src/lib/redirects/legacy";
import { isSearchIndexingEnabled } from "./src/lib/site";

const BASELINE_SECURITY_HEADERS = [
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains",
  },
  {
    key: "X-Content-Type-Options",
    value: "nosniff",
  },
  {
    key: "Referrer-Policy",
    value: "strict-origin-when-cross-origin",
  },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=()",
  },
  {
    key: "X-Frame-Options",
    value: "DENY",
  },
];

const nextConfig: NextConfig = {
  cacheComponents: true,
  cacheLife: {
    // Mirrors Core's `PUBLIC_CONTENT_CACHE_LIFE_PROFILE = "public-content"`:
    // bounded expiry with short client staleness and immediate webhook purge.
    "public-content": {
      expire: 3600,
      revalidate: 300,
      stale: 30,
    },
  },
  headers() {
    const responseHeaders = isSearchIndexingEnabled()
      ? BASELINE_SECURITY_HEADERS
      : [
          ...BASELINE_SECURITY_HEADERS,
          {
            key: "X-Robots-Tag",
            value: "noindex, nofollow",
          },
        ];

    return [
      {
        headers: responseHeaders,
        source: "/(.*)",
      },
      {
        // `/projects` and `/missionaries` (including detail, internal `/live/`,
        // and `/unavailable/` rewrite targets) set their single authoritative
        // runtime CSP in `src/proxy.ts` so runtime `CMS_BASE_URL` /
        // `CMS_MEDIA_ORIGIN` media loads cleanly without a second build-time
        // CSP header intersecting and blocking Core images.
        headers: [
          {
            key: "Content-Security-Policy",
            value: buildContentSecurityPolicy(),
          },
        ],
        source: "/((?!(?:projects|missionaries)(?:/.*)?$).*)",
      },
    ];
  },
  images: {
    deviceSizes: [480, 640, 750, 828, 1080, 1200, 1280, 1600],
    formats: ["image/avif", "image/webp"],
    qualities: [72, 75],
    // Keep /_next/image strictly local so remote CMS media is never cached by
    // Next's image optimizer if consent is withdrawn on Core.
    localPatterns: [
      {
        pathname: "/photos/**",
      },
      {
        pathname: "/brand/**",
      },
    ],
  },
  partialPrefetching: true,
  poweredByHeader: false,
  reactCompiler: true,
  redirects() {
    return [...LEGACY_REDIRECTS];
  },
  turbopack: {
    rules: {
      "*.css": {
        as: "*.css",
        loaders: ["@tailwindcss/turbopack"],
      },
    },
  },
  typedRoutes: true,
};

export default nextConfig;
