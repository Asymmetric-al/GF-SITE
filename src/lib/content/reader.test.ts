import { describe, expect, it } from "vitest";

import { readStarterPageContent } from "./reader";

describe(readStarterPageContent, () => {
  it("returns found provisional page content with required media metadata", () => {
    const result = readStarterPageContent();

    expect(result.status).toBe("found");

    if (result.status !== "found") {
      return;
    }

    expect(result.data.slug).toBe("/");
    expect(result.data.media.url).toBe("/starter-preview.svg");
    expect(result.data.media.width).toBeGreaterThan(0);
    expect(result.data.media.height).toBeGreaterThan(0);
  });

  it("returns unique architecture pillars with non-empty alt text", () => {
    const result = readStarterPageContent();

    expect(result.status).toBe("found");

    if (result.status !== "found") {
      return;
    }

    const pillarIds = result.data.pillars.map((pillar) => pillar.id);

    expect(result.data.media.alt.length).toBeGreaterThan(0);
    expect(pillarIds).toHaveLength(3);
    expect(new Set(pillarIds).size).toBe(pillarIds.length);
  });
});
