import { afterEach, describe, expect, it, vi } from "vitest";

import {
  getCanonicalUrl,
  getConfiguredSiteOrigin,
  getMetadataBase,
  isSearchIndexingEnabled,
  SITE_DEFAULTS,
} from "./site";

describe("site origin and metadata helpers", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("returns null origin and local fallback metadataBase when NEXT_PUBLIC_SITE_URL is unset", () => {
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "");

    expect(getConfiguredSiteOrigin()).toBeNull();
    expect(getMetadataBase().toString()).toBe("http://localhost:3000/");
    expect(getCanonicalUrl("/")).toBeUndefined();
  });

  it("normalizes valid http and https origins and builds canonical URLs", () => {
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "https://globalfellowship.example/sub");

    expect(getConfiguredSiteOrigin()?.toString()).toBe(
      "https://globalfellowship.example/"
    );
    expect(getMetadataBase().toString()).toBe(
      "https://globalfellowship.example/"
    );
    expect(getCanonicalUrl("/about")).toBe(
      "https://globalfellowship.example/about"
    );
  });

  it("rejects malformed URLs and non-http protocols", () => {
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "ftp://globalfellowship.example");

    expect(getConfiguredSiteOrigin()).toBeNull();
    expect(getCanonicalUrl("/")).toBeUndefined();

    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "not-a-valid-url");

    expect(getConfiguredSiteOrigin()).toBeNull();
  });

  it("keeps search indexing disabled for the provisional scaffold", () => {
    expect(isSearchIndexingEnabled()).toBeFalsy();
    expect(SITE_DEFAULTS.name).toContain("Development Scaffold");
    expect(SITE_DEFAULTS.description.length).toBeGreaterThan(0);
  });
});
