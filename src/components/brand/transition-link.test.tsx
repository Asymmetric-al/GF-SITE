import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { TransitionLink } from "@/components/brand/transition-link";
import {
  getTransitionTypes,
  NAV_TRANSITION_TYPES,
} from "@/lib/view-transitions";

describe("View Transition navigation primitives", () => {
  it("maps explicit transition directions to stable transitionTypes arrays", () => {
    expect(getTransitionTypes("forward")).toStrictEqual([
      NAV_TRANSITION_TYPES.navForward,
    ]);
    expect(getTransitionTypes("back")).toStrictEqual([
      NAV_TRANSITION_TYPES.navBack,
    ]);
    expect(getTransitionTypes("lateral")).toStrictEqual([
      NAV_TRANSITION_TYPES.navLateral,
    ]);
    expect(getTransitionTypes("none")).toBeUndefined();
    expect(getTransitionTypes(undefined)).toBeUndefined();
  });

  it("renders a real anchor and forwards focus/pointer handlers without breaking navigation", () => {
    let focused = 0;
    let entered = 0;

    render(
      <TransitionLink
        direction="forward"
        href="/projects/general-fund"
        onFocus={() => {
          focused += 1;
        }}
        onPointerEnter={() => {
          entered += 1;
        }}
        prefetchMode="intent"
      >
        General Fund
      </TransitionLink>
    );

    const link = screen.getByRole("link", { name: "General Fund" });

    expect(link).toHaveAttribute("href", "/projects/general-fund");

    fireEvent.pointerEnter(link);
    fireEvent.focus(link);

    expect(entered).toBe(1);
    expect(focused).toBe(1);
  });
});
