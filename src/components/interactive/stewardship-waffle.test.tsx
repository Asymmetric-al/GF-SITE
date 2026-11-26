import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import { StewardshipWaffle } from "./stewardship-waffle";
import { computeWaffleTileCounts } from "./waffle-math";
import type { StewardshipWaffleSegment } from "./waffle-math";

const SAMPLE_SEGMENTS: readonly StewardshipWaffleSegment[] = [
  {
    amount: "$52,738.13",
    amountCents: 5_273_813,
    id: "card-processing-fees",
    label: "Card processing fees",
    note: "Merchant fees on online card gifts.",
    tone: "primary",
  },
  {
    amount: "$28,221.00",
    amountCents: 2_822_100,
    id: "office-lease",
    label: "Office lease",
    note: "Home Office space.",
    tone: "clay",
  },
  {
    amount: "$59,839.23",
    amountCents: 5_983_923,
    id: "other-office-operations",
    label: "Other office operating costs",
    note: "Software, postage, and office administration.",
    tone: "muted",
  },
];

describe(StewardshipWaffle, () => {
  it("distributes exactly 100 waffle tiles using largest-remainder rounding", () => {
    const counts = computeWaffleTileCounts(SAMPLE_SEGMENTS);

    expect(counts).toStrictEqual([37, 20, 43]);
    expect(counts.reduce((sum, count) => sum + count, 0)).toBe(100);
    expect(computeWaffleTileCounts([])).toStrictEqual([]);
  });

  it("renders 100 chart tiles with an accessible cost summary", () => {
    const { container } = render(
      <StewardshipWaffle
        caption="Shows $140,798.36 in Office Operations Costs."
        categoryTotal="$140,798.36"
        heading="2025 Office Operations Costs"
        segments={SAMPLE_SEGMENTS}
      />
    );

    const chart = screen.getByRole("figure", {
      name: /100-square cost breakdown chart.*Card processing fees.*Office lease/u,
    });

    expect(chart).toBeVisible();
    expect(container.querySelectorAll(".gf-waffle-tile")).toHaveLength(100);
  });

  it("pins a cost line on click, dims non-selected tiles, and clears cleanly", async () => {
    const user = userEvent.setup();

    const { container } = render(
      <StewardshipWaffle
        caption="Shows $140,798.36 in Office Operations Costs."
        categoryTotal="$140,798.36"
        heading="2025 Office Operations Costs"
        segments={SAMPLE_SEGMENTS}
      />
    );

    const leaseButton = screen.getByRole("button", {
      name: /Office lease/u,
    });

    await user.click(leaseButton);

    expect(leaseButton).toHaveAttribute("aria-pressed", "true");
    expect(container.querySelectorAll('[data-dimmed="true"]')).toHaveLength(80);

    await user.click(screen.getByRole("button", { name: "Clear selection" }));

    expect(leaseButton).toHaveAttribute("aria-pressed", "false");
    expect(container.querySelectorAll('[data-dimmed="true"]')).toHaveLength(0);
  });
});
