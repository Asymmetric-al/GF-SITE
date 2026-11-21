import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import { LOCAL_STARTER_PAGE } from "@/lib/content/local-content";

import { FoundationTabs } from "./foundation-tabs";

describe(FoundationTabs, () => {
  it("renders accessible tabs and switches panels on pointer click", async () => {
    const user = userEvent.setup();

    render(<FoundationTabs pillars={LOCAL_STARTER_PAGE.pillars} />);

    expect(
      screen.getByRole("tablist", { name: "Architecture areas" })
    ).toBeInTheDocument();

    const frontendTab = screen.getByRole("tab", { name: "Frontend Runtime" });
    const uiTab = screen.getByRole("tab", { name: "UI Architecture" });

    expect(frontendTab).toHaveAttribute("aria-selected", "true");

    await user.click(uiTab);

    expect(uiTab).toHaveAttribute("aria-selected", "true");
    await expect(
      screen.findByRole("heading", {
        level: 3,
        name: "shadcn Tokens + Vercel UI SDK Primitives",
      })
    ).resolves.toBeVisible();
  });

  it("supports keyboard navigation across tabs with ArrowRight and Home", async () => {
    const user = userEvent.setup();

    render(<FoundationTabs pillars={LOCAL_STARTER_PAGE.pillars} />);

    const frontendTab = screen.getByRole("tab", { name: "Frontend Runtime" });
    const uiTab = screen.getByRole("tab", { name: "UI Architecture" });
    const contentTab = screen.getByRole("tab", { name: "Content Boundary" });

    frontendTab.focus();
    await user.keyboard("{ArrowRight}");

    expect(uiTab).toHaveFocus();
    expect(uiTab).toHaveAttribute("aria-selected", "true");

    await user.keyboard("{ArrowRight}");

    expect(contentTab).toHaveFocus();
    await expect(
      screen.findByRole("heading", {
        level: 3,
        name: "Server-Only Reader Prepared for Core",
      })
    ).resolves.toBeVisible();

    await user.keyboard("{Home}");

    expect(frontendTab).toHaveFocus();
  });

  it("renders nothing when given an empty pillar list", () => {
    const { container } = render(<FoundationTabs pillars={[]} />);

    expect(container).toBeEmptyDOMElement();
  });
});
