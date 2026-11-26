import { afterEach, describe, expect, it, vi } from "vitest";

import {
  getCanonicalUrl,
  getConfiguredSiteOrigin,
  getMetadataBase,
  isPreviewDeployment,
  isSearchIndexingEnabled,
  SITE_DEFAULTS,
  SITE_OPEN_GRAPH,
} from "./site";

describe("site origin and metadata helpers", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("omits metadataBase on deployed production without NEXT_PUBLIC_SITE_URL or VERCEL_URL, and falls back locally", () => {
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "");
    vi.stubEnv("VERCEL_ENV", "production");
    vi.stubEnv("VERCEL_URL", "");
    vi.stubEnv("NODE_ENV", "production");

    expect(getConfiguredSiteOrigin()).toBeNull();
    expect(getMetadataBase()).toBeUndefined();
    expect(getCanonicalUrl("/")).toBeUndefined();

    vi.stubEnv("VERCEL_ENV", "");
    expect(getMetadataBase()?.toString()).toBe("http://localhost:3000/");
  });

  it("falls back to localhost metadataBase in development when NEXT_PUBLIC_SITE_URL is unset", () => {
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "");
    vi.stubEnv("VERCEL_ENV", "");
    vi.stubEnv("VERCEL_URL", "");
    vi.stubEnv("NODE_ENV", "development");

    expect(getConfiguredSiteOrigin()).toBeNull();
    expect(getMetadataBase()?.toString()).toBe("http://localhost:3000/");
    expect(getCanonicalUrl("/")).toBeUndefined();
  });

  it("suppresses canonicals in Vercel preview deployments while resolving VERCEL_URL for social image assets only", () => {
    vi.stubEnv("VERCEL_ENV", "preview");
    vi.stubEnv("VERCEL_URL", "gf-site-git-preview.vercel.app");
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv(
      "NEXT_PUBLIC_SITE_URL",
      "https://branch-preview.example.invalid"
    );

    expect(isPreviewDeployment()).toBeTruthy();
    expect(getConfiguredSiteOrigin()).toBeNull();
    expect(getMetadataBase()?.toString()).toBe(
      "https://gf-site-git-preview.vercel.app/"
    );
    expect(getCanonicalUrl("/")).toBeUndefined();
  });

  it("normalizes valid http and https origins and builds canonical URLs outside previews", () => {
    vi.stubEnv("VERCEL_ENV", "production");
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "https://globalfellowship.example/sub");

    expect(isPreviewDeployment()).toBeFalsy();
    expect(getConfiguredSiteOrigin()?.toString()).toBe(
      "https://globalfellowship.example/"
    );
    expect(getMetadataBase()?.toString()).toBe(
      "https://globalfellowship.example/"
    );
    expect(getCanonicalUrl("/about")).toBe(
      "https://globalfellowship.example/about"
    );
  });

  it("rejects malformed URLs and non-http protocols", () => {
    vi.stubEnv("VERCEL_ENV", "");
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "ftp://globalfellowship.example");

    expect(getConfiguredSiteOrigin()).toBeNull();
    expect(getCanonicalUrl("/")).toBeUndefined();

    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "not-a-valid-url");

    expect(getConfiguredSiteOrigin()).toBeNull();
  });

  it("enables search indexing outside Vercel previews, disables it in previews, and exposes shared Open Graph defaults", () => {
    vi.stubEnv("VERCEL_ENV", "production");
    const prodEnabled = isSearchIndexingEnabled();

    vi.stubEnv("VERCEL_ENV", "");
    const localEnabled = isSearchIndexingEnabled();

    vi.stubEnv("VERCEL_ENV", "preview");
    const previewEnabled = isSearchIndexingEnabled();

    expect({ localEnabled, previewEnabled, prodEnabled }).toStrictEqual({
      localEnabled: true,
      previewEnabled: false,
      prodEnabled: true,
    });
    expect(SITE_DEFAULTS.name).toBe("Global Fellowship");
    expect(SITE_DEFAULTS.description.length).toBeGreaterThan(0);
    expect(SITE_OPEN_GRAPH).toStrictEqual({
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
    });
  });
});
