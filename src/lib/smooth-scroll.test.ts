import { describe, expect, it } from "vitest";

import {
  computeAnchorTargetY,
  computeMainContentProgress,
  computeScrollDuration,
  editorialEaseOut,
  shouldSkipSmoothAnchor,
} from "./smooth-scroll";

const makeAnchor = (classes: readonly string[], instant = false) => ({
  classList: {
    contains: (name: string) => classes.includes(name),
  },
  dataset: instant ? { lenisInstant: "" } : {},
});

describe("smooth-scroll helpers", () => {
  it("clamps distance-scaled glide durations calmly between 0.42s and 0.88s", () => {
    expect({
      longNegative: computeScrollDuration(-9000),
      longPositive: computeScrollDuration(9000),
      tiny: computeScrollDuration(3),
      zero: computeScrollDuration(0),
    }).toStrictEqual({
      longNegative: 0.88,
      longPositive: 0.88,
      tiny: 0,
      zero: 0,
    });
    expect(computeScrollDuration(100)).toBeCloseTo(0.42, 2);
    expect(computeScrollDuration(1500)).toBeGreaterThan(0.65);
    expect(computeScrollDuration(1500)).toBeLessThan(0.8);
  });

  it("evaluates editorialEaseOut monotonically from 0 to 1 without overshoot", () => {
    expect(editorialEaseOut(0)).toBe(0);
    expect(editorialEaseOut(1)).toBe(1);
    expect(editorialEaseOut(0.25)).toBeGreaterThan(0.8);
    expect(editorialEaseOut(0.5)).toBeGreaterThan(editorialEaseOut(0.25));
    expect(editorialEaseOut(0.5)).toBeLessThanOrEqual(1);
  });

  it("reaches 100% reading progress at the end of main content before the footer", () => {
    expect({
      atMainEnd: computeMainContentProgress(2400, 2400, 3100),
      atMidMain: computeMainContentProgress(1200, 2400, 3100),
      atStart: computeMainContentProgress(0, 2400, 3100),
      emptyFallback: computeMainContentProgress(100, 0, 0),
      fallbackMid: computeMainContentProgress(500, 0, 1000),
      inFooter: computeMainContentProgress(2950, 2400, 3100),
    }).toStrictEqual({
      atMainEnd: 1,
      atMidMain: 0.5,
      atStart: 0,
      emptyFallback: 0,
      fallbackMid: 0.5,
      inFooter: 1,
    });
  });

  it("computes sticky-header-cleared anchor targets with optional collapse compensation", () => {
    const target = {
      getBoundingClientRect: () => ({ top: 640 }),
    };

    expect(computeAnchorTargetY(target, 100, 92, 0)).toBe(648);
    expect(computeAnchorTargetY(target, 100, 92, 200)).toBe(448);
    expect(computeAnchorTargetY(target, 0, 92, 700)).toBe(0);
  });

  it("keeps skip links and data-lenis-instant anchors immediate", () => {
    expect(
      shouldSkipSmoothAnchor(makeAnchor(["skip-link"]), "#main-content")
    ).toBeTruthy();
    expect(
      shouldSkipSmoothAnchor(makeAnchor([]), "#main-content")
    ).toBeTruthy();
    expect(shouldSkipSmoothAnchor(makeAnchor([], true), "#board")).toBeTruthy();
    expect(shouldSkipSmoothAnchor(makeAnchor([]), "#board")).toBeFalsy();
  });
});
