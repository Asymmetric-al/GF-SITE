import type { MetadataRoute } from "next";

import { isSearchIndexingEnabled } from "@/lib/site";

const robots = (): MetadataRoute.Robots => {
  if (!isSearchIndexingEnabled()) {
    return {
      rules: {
        disallow: "/",
        userAgent: "*",
      },
    };
  }

  return {
    rules: {
      allow: "/",
      userAgent: "*",
    },
  };
};

export default robots;
