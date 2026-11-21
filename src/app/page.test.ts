import { afterEach, describe, expect, it, vi } from "vitest";

import { generateMetadata } from "./page";

describe(generateMetadata, () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("omits canonical metadata when NEXT_PUBLIC_SITE_URL is unset", () => {
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "");

    expect(generateMetadata()).toStrictEqual({});
  });

  it("scopes homepage canonical and Open Graph URL when NEXT_PUBLIC_SITE_URL is configured", () => {
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "https://globalfellowship.example");

    expect(generateMetadata()).toStrictEqual({
      alternates: {
        canonical: "https://globalfellowship.example/",
      },
      openGraph: {
        url: "https://globalfellowship.example/",
      },
    });
  });
});
