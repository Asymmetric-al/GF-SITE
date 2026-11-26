import { describe, expect, it } from "vitest";

import { createGoneResponse } from "./gone-response";
import { LEGACY_REDIRECTS, RETIRED_GONE_PATHS } from "./legacy";

describe("legacy redirect and 410 gone table", () => {
  it("contains zero redirect chains and zero per-worker slug echo rules", () => {
    const sources = new Set(LEGACY_REDIRECTS.map((rule) => rule.source));

    const chainedRules = LEGACY_REDIRECTS.filter((rule) => {
      const destPath =
        (rule.destination.split("#")[0] ?? rule.destination).split("?")[0] ??
        rule.destination;

      return !rule.permanent || sources.has(destPath);
    });

    const slugEchoRules = LEGACY_REDIRECTS.filter(
      (rule) =>
        rule.source.startsWith("/missionary") &&
        rule.destination.includes(":slug")
    );

    const requiredSources = [
      "/about",
      "/prayer",
      "/donor-and-privacy-policy",
      "/join",
      "/serve",
      "/training",
      "/exposure-trips",
      "/board-members",
      "/global-fellowship-leadership-summit",
      "/central-asia",
      "/StatementofActivity-2025-updated.pdf",
    ];

    expect({
      chainedRules,
      missingSources: requiredSources.filter((path) => !sources.has(path)),
      slugEchoRules,
    }).toStrictEqual({
      chainedRules: [],
      missingSources: [],
      slugEchoRules: [],
    });
  });

  it("emits true HTTP 410 Gone with HTML-escaped path and noindex header", async () => {
    const response = createGoneResponse('/checkout-test?<script>"x"');
    const body = await response.text();

    const retiredPaths = new Set<string>(RETIRED_GONE_PATHS);

    expect({
      escapesScript:
        !body.includes("<script>") && body.includes("&lt;script&gt;"),
      hasRetiredRoutes: [
        "/checkout-test",
        "/opportunities-copy",
        "/church-plantertemplate",
      ].every((path) => retiredPaths.has(path)),
      robotsHeader: response.headers.get("x-robots-tag"),
      status: response.status,
    }).toStrictEqual({
      escapesScript: true,
      hasRetiredRoutes: true,
      robotsHeader: "noindex, nofollow",
      status: 410,
    });
  });
});
