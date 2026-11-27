import { afterEach, describe, expect, it, vi } from "vitest";

import { PROTECTED_FOUNDATIONS } from "@/lib/brand/foundations";

import { buildLlmsTxtMarkdown, GET } from "./route";

describe("/llms.txt route", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("produces clean Markdown with H1, verbatim Mission and Vision, Markdown links, and zero em dashes", () => {
    const markdown = buildLlmsTxtMarkdown(
      new URL("https://globalfellowship.org")
    );

    expect({
      containsContactLink: markdown.includes(
        "[Contact & Safeguarding](https://globalfellowship.org/contact)"
      ),
      containsEcfa: markdown.includes("ECFA"),
      containsEmDash: markdown.includes("\u2014"),
      containsEula: markdown.includes("/eula"),
      containsMission: markdown.includes(
        PROTECTED_FOUNDATIONS.missionDeclarative
      ),
      containsMissionLink: markdown.includes(
        "[Our Mission & Values](https://globalfellowship.org/mission-and-values)"
      ),
      containsPrivacyPolicy: markdown.includes("/privacypolicy"),
      containsVision: markdown.includes(PROTECTED_FOUNDATIONS.vision),
      startsWithH1: markdown.startsWith("# Global Fellowship\n"),
    }).toStrictEqual({
      containsContactLink: true,
      containsEcfa: false,
      containsEmDash: false,
      containsEula: false,
      containsMission: true,
      containsMissionLink: true,
      containsPrivacyPolicy: false,
      containsVision: true,
      startsWithH1: true,
    });
  });

  it("falls back to clean root-relative Markdown links when no public origin is configured", () => {
    const markdown = buildLlmsTxtMarkdown(null);

    expect({
      hasFinancials: markdown.includes("[Financials](/financials)"),
      hasGive: markdown.includes("[Give to Global Fellowship](/give)"),
      hasHome: markdown.includes("[Home](/)"),
    }).toStrictEqual({
      hasFinancials: true,
      hasGive: true,
      hasHome: true,
    });
  });

  it("serves text/markdown HTTP 200 and applies X-Robots-Tag on preview deployments", async () => {
    vi.stubEnv("VERCEL_ENV", "preview");
    vi.stubEnv("NEXT_PUBLIC_ENABLE_INDEXING", "");

    const previewRes = GET();
    const previewBody = await previewRes.text();

    vi.stubEnv("VERCEL_ENV", "production");

    const prodRes = GET();

    expect({
      contentType: previewRes.headers.get("content-type"),
      hasH1: previewBody.startsWith("# Global Fellowship\n"),
      prodXRobotsTag: prodRes.headers.get("x-robots-tag"),
      status: previewRes.status,
      xRobotsTag: previewRes.headers.get("x-robots-tag"),
    }).toStrictEqual({
      contentType: "text/markdown; charset=utf-8",
      hasH1: true,
      prodXRobotsTag: null,
      status: 200,
      xRobotsTag: "noindex, nofollow",
    });
  });
});
