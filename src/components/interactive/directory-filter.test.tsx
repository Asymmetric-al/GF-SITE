import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import type { DirectoryCardItem } from "@/components/directory/directory-card";

import { DirectoryFilter } from "./directory-filter";

const SAMPLE_ITEMS: readonly DirectoryCardItem[] = [
  {
    category: "Leadership",
    ctaLabel: "Learn more",
    giving: {
      sourceCode: "card-missionary-oates",
      target: {
        kind: "missionary",
        missionaryId: "oates",
        workerId: "oates",
      },
    },
    href: "/missionaries/oates",
    id: "oates",
    media: null,
    monogram: "DO",
    prefetchDetail: "intent",
    region: "Global",
    subtitle: "Founders",
    summary: "Serving local church leaders since 1989.",
    title: "Don & Kathy Oates",
    titleViewTransitionName: "missionary-title-oates",
  },
  {
    category: "Leadership",
    ctaLabel: "Learn more",
    giving: {
      sourceCode: "card-missionary-beaumont",
      target: {
        kind: "missionary",
        missionaryId: "beaumont",
        workerId: "beaumont",
      },
    },
    href: "/missionaries/beaumont",
    id: "beaumont",
    media: null,
    monogram: "JB",
    prefetchDetail: "intent",
    region: "Global",
    subtitle: "Co-Executive Director",
    summary: "Walking with regional teams and pastors.",
    title: "Jeremy & Anne Beaumont",
    titleViewTransitionName: "missionary-title-beaumont",
  },
  {
    category: "Field",
    ctaLabel: "Learn more",
    href: "/missionaries/obrien",
    id: "obrien",
    media: null,
    monogram: "OF",
    region: "Europe",
    subtitle: "Regional Director",
    summary: "Supporting church planters across Europe.",
    title: "The O'Brien Family",
    titleViewTransitionName: "missionary-title-obrien",
  },
  {
    category: "Field",
    ctaLabel: "Learn more",
    href: "/missionaries/kuzhivila",
    id: "kuzhivila",
    media: null,
    monogram: "CK",
    region: "South Asia",
    subtitle: "Co-Executive Director",
    summary: "Equipping national church-planting leaders.",
    title: "Carolyn Pappy Kuzhivila",
    titleViewTransitionName: "missionary-title-kuzhivila",
  },
];

const renderDirectory = () =>
  render(
    <DirectoryFilter
      categories={["Leadership", "Field"]}
      items={SAMPLE_ITEMS}
      nounPlural="missionaries"
      nounSingular="missionary"
      searchLabel="Search missionaries"
      searchPlaceholder="Search by name or region..."
    />
  );

describe(DirectoryFilter, () => {
  it("renders a 3-column desktop grid for 4 items and isolates card vs QuickGive hover groups", () => {
    const { container } = renderDirectory();
    const grid = container.querySelector('[data-slot="directory-grid"]');
    const firstCard = container.querySelector('[data-slot="directory-card"]');

    expect(grid).toHaveClass("grid-cols-1", "sm:grid-cols-2", "lg:grid-cols-3");
    expect(
      container.querySelectorAll('[data-slot="directory-card"]')
    ).toHaveLength(4);
    expect(firstCard).toHaveClass("group/card");
    expect(firstCard).not.toHaveClass("group");
    expect(
      screen.getByRole("button", { name: "Give to Don & Kathy Oates" })
    ).toHaveClass("group/give");
  });

  it("keeps lg:grid-cols-3 when filtering to 2 items by category and displays a removable chip", async () => {
    const { container } = renderDirectory();

    fireEvent.click(screen.getByRole("radio", { name: /Leadership/u }));

    await waitFor(() => {
      expect(
        container.querySelectorAll('[data-slot="directory-card"]')
      ).toHaveLength(2);
    });

    expect(container.querySelector('[data-slot="directory-grid"]')).toHaveClass(
      "lg:grid-cols-3"
    );
    expect(
      screen.getByRole("button", { name: "Remove Leadership filter" })
    ).toBeVisible();
  });

  it("preserves lg:grid-cols-3 during search, clears on Escape, and resets empty states", async () => {
    const { container } = renderDirectory();

    const searchInput = screen.getByRole("searchbox", {
      name: "Search missionaries",
    });

    fireEvent.change(searchInput, { target: { value: "Oates" } });

    await waitFor(() => {
      expect(
        container.querySelectorAll('[data-slot="directory-card"]')
      ).toHaveLength(1);
    });

    expect(container.querySelector('[data-slot="directory-grid"]')).toHaveClass(
      "lg:grid-cols-3"
    );

    fireEvent.keyDown(searchInput, { key: "Escape" });

    await waitFor(() => {
      expect(
        container.querySelectorAll('[data-slot="directory-card"]')
      ).toHaveLength(4);
    });

    fireEvent.change(searchInput, { target: { value: "zzzz-no-match" } });

    await waitFor(() => {
      expect(screen.getByText("No matching missionaries found.")).toBeVisible();
    });

    fireEvent.click(screen.getByRole("button", { name: "Reset filters" }));

    await waitFor(() => {
      expect(
        container.querySelectorAll('[data-slot="directory-card"]')
      ).toHaveLength(4);
    });
  });
});
