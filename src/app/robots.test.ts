// @vitest-environment node
import { describe, expect, it } from "vitest";

import robots from "./robots";

describe("robots metadata route", () => {
  it("disallows crawling while provisional search indexing is disabled", () => {
    const result = robots();

    expect(result).toStrictEqual({
      rules: {
        disallow: "/",
        userAgent: "*",
      },
    });
  });
});
