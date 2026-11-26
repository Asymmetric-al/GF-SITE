import { afterEach, describe, expect, it, vi } from "vitest";

import robots from "./robots";

describe("robots metadata route", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("allows crawling on non-preview builds and emits sitemap when NEXT_PUBLIC_SITE_URL is set", () => {
    vi.stubEnv("VERCEL_ENV", "production");
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "");

    expect(robots()).toStrictEqual({
      rules: {
        allow: "/",
        userAgent: "*",
      },
    });

    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "https://globalfellowship.org");

    expect(robots()).toStrictEqual({
      rules: {
        allow: "/",
        userAgent: "*",
      },
      sitemap: "https://globalfellowship.org/sitemap.xml",
    });
  });

  it("disallows crawling on Vercel preview deployments", () => {
    vi.stubEnv("VERCEL_ENV", "preview");
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "https://globalfellowship.org");

    expect(robots()).toStrictEqual({
      rules: {
        disallow: "/",
        userAgent: "*",
      },
    });
  });
});
