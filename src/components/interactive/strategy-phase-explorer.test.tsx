import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import { GF_PHOTOS } from "@/lib/brand/gf-photos";

import { StrategyPhaseExplorer } from "./strategy-phase-explorer";
import type { StrategyPhase } from "./strategy-phase-explorer";

const PHASES: readonly StrategyPhase[] = [
  {
    badge: "Phase 1",
    id: "listen",
    photo: GF_PHOTOS.projectSouthAsianBibleAcademy,
    steps: [
      { detail: "Survey existing witness.", number: "01", title: "Survey" },
      { detail: "Study community realities.", number: "02", title: "Research" },
      { detail: "Draft contextual plan.", number: "03", title: "Plan" },
    ],
    summary: "Begin by listening carefully.",
    title: "Listen & Plan",
  },
  {
    badge: "Phase 2",
    id: "gather",
    photo: GF_PHOTOS.bibleStudy,
    steps: [
      { detail: "Build mixed team.", number: "04", title: "Build Team" },
      { detail: "Invest in friendships.", number: "05", title: "Make Friends" },
      {
        detail: "Open Scripture together.",
        number: "06",
        title: "Bible Study",
      },
    ],
    summary: "Gather seeking neighbors.",
    title: "Gather & Disciple",
  },
];

describe(StrategyPhaseExplorer, () => {
  it("switches strategy phases via UI SDK Tabs and toggles the full-list view", async () => {
    const user = userEvent.setup();

    render(<StrategyPhaseExplorer phases={PHASES} />);

    const phase1Tab = screen.getByRole("tab", { name: /Listen & Plan/u });
    const phase2Tab = screen.getByRole("tab", { name: /Gather & Disciple/u });

    expect(phase1Tab).toHaveAttribute("aria-selected", "true");

    await user.click(phase2Tab);

    expect(phase2Tab).toHaveAttribute("aria-selected", "true");
    expect(screen.getByText("Build Team")).toBeVisible();

    await user.click(screen.getByRole("button", { name: "Show all 9 steps" }));

    expect(
      screen.getByRole("button", { name: "Explore phase by phase" })
    ).toBeVisible();
    expect(screen.getByText("Survey")).toBeVisible();
  });
});
