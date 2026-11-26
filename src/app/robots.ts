import type { MetadataRoute } from "next";

import { getConfiguredSiteOrigin, isSearchIndexingEnabled } from "@/lib/site";

const robots = (): MetadataRoute.Robots => {
  if (!isSearchIndexingEnabled()) {
    return {
      rules: {
        disallow: "/",
        userAgent: "*",
      },
    };
  }

  const origin = getConfiguredSiteOrigin();

  const config: MetadataRoute.Robots = {
    rules: {
      allow: "/",
      userAgent: "*",
    },
  };

  if (origin !== null) {
    config.sitemap = new URL("/sitemap.xml", origin).toString();
  }

  return config;
};

export default robots;
