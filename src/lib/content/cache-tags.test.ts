import { describe, expect, it } from "vitest";

import {
  buildCoreCacheTags,
  isValidPublicCacheTag,
  sanitizeCacheTagSegment,
} from "./cache-tags";

describe("Core CMS cache tag compatibility", () => {
  it("normalizes segments matching Core cache-tags.ts (including underscores and 64-char cap)", () => {
    expect(sanitizeCacheTagSegment("GF_Tenant:01")).toBe("gf_tenant-01");
    expect(sanitizeCacheTagSegment("a".repeat(90))).toHaveLength(64);
    expect(
      buildCoreCacheTags("gf_prod", "project-pages", ["doc_123", "doc_123"])
    ).toStrictEqual([
      "public-cms:tenant:gf_prod",
      "public-cms:tenant:gf_prod:collection:project-pages",
      "public-cms:tenant:gf_prod:collection:project-pages:doc:doc_123",
    ]);
  });

  it("validates Core tenant, collection, document, site, and locale tags and rejects malformed tags", () => {
    expect(
      isValidPublicCacheTag(
        "public-cms:tenant:gf_main:collection:project-pages:doc:doc_1"
      )
    ).toBeTruthy();
    expect(isValidPublicCacheTag("public-cms:site:main_site")).toBeTruthy();
    expect(isValidPublicCacheTag("public-cms:locale:en-us")).toBeTruthy();
    expect(isValidPublicCacheTag("public-cms:tenant:gf:extra:bad")).toBeFalsy();
    expect(
      isValidPublicCacheTag(`public-cms:tenant:${"a".repeat(260)}`)
    ).toBeFalsy();
  });
});
