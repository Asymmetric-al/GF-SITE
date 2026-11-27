import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import { SectionScrollspy } from "./section-scrollspy";

describe(SectionScrollspy, () => {
  it("renders anchor links with initial aria-current and updates active location on click", async () => {
    const user = userEvent.setup();

    render(
      <SectionScrollspy
        ariaLabel="Jump to section"
        sections={[
          { id: "overview", label: "Overview" },
          { id: "ledger", label: "Ledger" },
          { id: "archive", label: "Archive" },
        ]}
      />
    );

    const overviewLink = screen.getByRole("link", { name: "Overview" });
    const ledgerLink = screen.getByRole("link", { name: "Ledger" });
    const archiveLink = screen.getByRole("link", { name: "Archive" });

    expect(overviewLink).toHaveAttribute("href", "#overview");
    expect(overviewLink).toHaveAttribute("aria-current", "location");

    await user.click(ledgerLink);

    expect(ledgerLink).toHaveAttribute("aria-current", "location");
    expect(overviewLink).not.toHaveAttribute("aria-current");

    await user.click(archiveLink);

    expect(archiveLink).toHaveAttribute("aria-current", "location");
  });

  it("opens the @ui-sdk/react/collapsible mobile disclosure and closes on Escape returning focus to the trigger", async () => {
    const user = userEvent.setup();

    render(
      <SectionScrollspy
        ariaLabel="Jump to section"
        sections={[
          { id: "overview", label: "Overview" },
          { id: "ledger", label: "Ledger" },
        ]}
      />
    );

    const trigger = screen.getByRole("button", { name: /On this page/iu });

    expect(trigger).toHaveAttribute("aria-expanded", "false");

    await user.click(trigger);

    expect(trigger).toHaveAttribute("aria-expanded", "true");

    await user.keyboard("{Escape}");

    expect(trigger).toHaveAttribute("aria-expanded", "false");
    expect(trigger).toHaveFocus();
  });

  it("moves focus to the destination section heading and updates location hash on selection", async () => {
    const user = userEvent.setup();

    render(
      <div>
        <SectionScrollspy
          ariaLabel="Jump to section"
          sections={[
            { id: "overview", label: "Overview" },
            { id: "governance", label: "Governance" },
          ]}
        />
        <section id="governance">
          <h2>Board governance</h2>
        </section>
      </div>
    );

    const governanceLink = screen.getByRole("link", { name: "Governance" });

    await user.click(governanceLink);

    expect(window.location.hash).toBe("#governance");
    expect(
      screen.getByRole("heading", { name: "Board governance" })
    ).toHaveFocus();
  });
});
