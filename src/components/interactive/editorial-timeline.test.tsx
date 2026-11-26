import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import { EditorialTimeline } from "./editorial-timeline";
import type { EditorialTimelineMilestone } from "./editorial-timeline";

const MILESTONES: readonly EditorialTimelineMilestone[] = [
  {
    dateTime: "1989",
    description: "Founded in Auburn after serving in Liberia.",
    id: "liberia-1989",
    label: "1989 · Auburn, California",
    marker: "89",
    status: "complete",
    title: "Founded in Auburn",
  },
  {
    dateTime: "2012",
    description: "Cross-cultural sending begins alongside local leaders.",
    id: "sending-2012",
    label: "2012 · Sending",
    marker: "12",
    status: "complete",
    title: "Cross-cultural sending",
  },
  {
    dateTime: "2026",
    description: "Regional training hubs and Meadow Vista Home Office.",
    id: "hubs-today",
    label: "Today",
    marker: "Now",
    status: "current",
    title: "Regional training hubs",
  },
];

describe(EditorialTimeline, () => {
  it("renders a named list of milestones and supports arrow-key navigation", async () => {
    const user = userEvent.setup();

    render(
      <EditorialTimeline ariaLabel="Fellowship history" items={MILESTONES} />
    );

    expect(
      screen.getByRole("list", { name: "Fellowship history" })
    ).toBeVisible();

    const items = screen.getAllByRole("listitem");

    expect(items).toHaveLength(3);

    await user.tab();

    expect(items[2]).toHaveFocus();

    await user.keyboard("{ArrowUp}");

    expect(items[1]).toHaveFocus();

    await user.keyboard("{Home}");

    expect(items[0]).toHaveFocus();
  });
});
