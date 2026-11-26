import { afterEach, describe, expect, it, vi } from "vitest";

import sitemap, { buildSitemapEntries } from "./sitemap";

describe("sitemap route and URL normalization", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("stays empty during Vercel preview noindex mode and when origin is unset", () => {
    vi.stubEnv("VERCEL_ENV", "preview");
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "https://globalfellowship.org");

    expect(sitemap()).toStrictEqual([]);
    expect(
      buildSitemapEntries(new URL("https://globalfellowship.org"), false)
    ).toStrictEqual([]);

    vi.stubEnv("VERCEL_ENV", "production");
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "");

    expect(sitemap()).toStrictEqual([]);
  });

  it("returns empty list when origin is null even if indexing were enabled", () => {
    expect(buildSitemapEntries(null, true)).toStrictEqual([]);
  });

  it("emits normalized absolute URLs with zero double slashes when enabled with a valid origin", () => {
    const entries = buildSitemapEntries(
      new URL("https://globalfellowship.org/"),
      true
    );

    const urls = new Set(entries.map((entry) => entry.url));

    const requiredUrls = [
      "https://globalfellowship.org/",
      "https://globalfellowship.org/mission-and-values",
      "https://globalfellowship.org/how-we-work",
      "https://globalfellowship.org/our-people",
      "https://globalfellowship.org/missionaries",
      "https://globalfellowship.org/opportunities",
      "https://globalfellowship.org/serve-across-cultures",
      "https://globalfellowship.org/churches",
      "https://globalfellowship.org/projects/leadership-summit",
      "https://globalfellowship.org/local-leaders",
      "https://globalfellowship.org/where-we-serve/americas",
    ];

    const retiredUrls = [
      "https://globalfellowship.org/join",
      "https://globalfellowship.org/serve",
      "https://globalfellowship.org/training",
      "https://globalfellowship.org/exposure-trips",
    ];

    expect({
      hasDoubleSlash: entries.some((entry) =>
        entry.url.slice("https://".length).includes("//")
      ),
      missingRequired: requiredUrls.filter((url) => !urls.has(url)),
      presentRetired: retiredUrls.filter((url) => urls.has(url)),
    }).toStrictEqual({
      hasDoubleSlash: false,
      missingRequired: [],
      presentRetired: [],
    });
  });
});
