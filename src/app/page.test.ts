import { afterEach, describe, expect, it, vi } from "vitest";

import { SITE_OPEN_GRAPH } from "@/lib/site";

import { generateMetadata } from "./page";

describe(generateMetadata, () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("omits canonical metadata when NEXT_PUBLIC_SITE_URL is unset", () => {
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "");
    vi.stubEnv("VERCEL_ENV", "");

    expect(generateMetadata()).toStrictEqual({});
  });

  it("omits canonical and openGraph override in preview deployments even if NEXT_PUBLIC_SITE_URL is set", () => {
    vi.stubEnv("VERCEL_ENV", "preview");
    vi.stubEnv(
      "NEXT_PUBLIC_SITE_URL",
      "https://branch-preview.example.invalid"
    );

    expect(generateMetadata()).toStrictEqual({});
  });

  it("scopes homepage canonical while preserving all shared Open Graph fields", () => {
    vi.stubEnv("VERCEL_ENV", "production");
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "https://globalfellowship.example");

    expect(generateMetadata()).toStrictEqual({
      alternates: {
        canonical: "https://globalfellowship.example/",
      },
      openGraph: {
        ...SITE_OPEN_GRAPH,
        url: "https://globalfellowship.example/",
      },
    });
  });
});
