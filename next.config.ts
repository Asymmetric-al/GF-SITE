import type { NextConfig } from "next";

import { isSearchIndexingEnabled } from "./src/lib/site";

const BASELINE_SECURITY_HEADERS = [
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
    value: "camera=(), microphone=(), geolocation=(), browsing-topics=()",
  },
  {
    key: "X-Frame-Options",
    value: "DENY",
  },
];

const nextConfig: NextConfig = {
  cacheComponents: true,
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
    ];
  },
  partialPrefetching: true,
  poweredByHeader: false,
  reactCompiler: true,
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
