import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import { GF_PHOTOS } from "@/lib/brand/gf-photos";

import { EditorialPhotoAccordion } from "./editorial-photo-accordion";
import type { EditorialPhotoPanel } from "./editorial-photo-accordion";

const SAMPLE_PANELS: readonly EditorialPhotoPanel[] = [
  {
    detail: "Serving as one cross-cultural family across 43 countries.",
    id: "missionaries",
    index: "01",
    label: "Our Missionaries",
    photo: GF_PHOTOS.fallFellowship,
  },
  {
    detail: "Standing behind local church planters through prayer and giving.",
    id: "donors",
    index: "02",
    label: "Our Donors & Churches",
    photo: GF_PHOTOS.bibleStudy,
  },
  {
    detail: "Meadow Vista Home Office staff advocating for field workers.",
    id: "staff",
    index: "03",
    label: "Our Home Office Staff",
    photo: GF_PHOTOS.leaderDonKathyOates,
  },
  {
    detail: "Accountable governance and faithful prayer since 1989.",
    id: "board",
    index: "04",
    label: "Our Board",
    photo: GF_PHOTOS.boardGroup,
  },
];

describe(EditorialPhotoAccordion, () => {
  it("switches expanded panels by click and keyboard arrow keys", async () => {
    const user = userEvent.setup();

    render(
      <EditorialPhotoAccordion
        ariaLabel="Four circles of Global Fellowship"
        panels={SAMPLE_PANELS}
      />
    );

    const first = screen.getByRole("button", { name: /01.*Our Missionaries/u });

    const second = screen.getByRole("button", {
      name: /02.*Our Donors & Churches/u,
    });

    const fourth = screen.getByRole("button", { name: /04.*Our Board/u });

    expect(first).toHaveAttribute("aria-expanded", "true");

    await user.click(second);

    expect(second).toHaveAttribute("aria-expanded", "true");
    expect(first).toHaveAttribute("aria-expanded", "false");

    await user.keyboard("{End}");

    expect(fourth).toHaveFocus();
    expect(fourth).toHaveAttribute("aria-expanded", "true");
  });
});
