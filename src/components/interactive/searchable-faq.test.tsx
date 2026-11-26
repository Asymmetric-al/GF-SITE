import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import { SearchableFaq } from "./searchable-faq";
import type { SearchableFaqItem } from "./searchable-faq";

const SAMPLE_FAQS: readonly SearchableFaqItem[] = [
  {
    answer:
      "Global Fellowship, Inc. is a U.S. 501(c)(3) nonprofit with EIN 68-0214543.",
    id: "tax-receipts",
    question: "Are my donations tax-deductible?",
  },
  {
    answer: "Mail checks payable to Global Fellowship, Inc. in Meadow Vista.",
    id: "checks",
    question: "How do I give by check?",
  },
  {
    answer: "We never sell or rent donor contact information.",
    id: "privacy",
    question: "Does Global Fellowship share donor information?",
  },
];

describe(SearchableFaq, () => {
  it("filters questions live, highlights matched text, and clears on Escape", async () => {
    const user = userEvent.setup();

    const { container } = render(
      <SearchableFaq
        defaultOpenId="tax-receipts"
        emptyContactEmail="finance@globalfellowship.org"
        emptyContactLabel="Write Finance"
        emptyContactSubject="Donor Help"
        items={SAMPLE_FAQS}
        searchLabel="Search donor questions"
        searchPlaceholder="Search receipts, checks..."
      />
    );

    const input = screen.getByRole("searchbox", {
      name: "Search donor questions",
    });

    await user.type(input, "Meadow");

    expect(screen.getByText("1 of 3 questions")).toBeVisible();
    expect(container.querySelector("mark")?.textContent).toBe("Meadow");

    await user.keyboard("{Escape}");

    expect(input).toHaveValue("");
    expect(screen.getByText("3 of 3 questions")).toBeVisible();
  });

  it("shows a direct-desk mailto fallback when no questions match", async () => {
    const user = userEvent.setup();

    render(
      <SearchableFaq
        emptyContactEmail="finance@globalfellowship.org"
        emptyContactLabel="Write Finance"
        emptyContactSubject="Donor Help"
        items={SAMPLE_FAQS}
        searchLabel="Search donor questions"
        searchPlaceholder="Search..."
      />
    );

    await user.type(
      screen.getByRole("searchbox", { name: "Search donor questions" }),
      "cryptocurrency"
    );

    expect(screen.getByText("0 of 3 questions")).toBeVisible();
    expect(
      screen.getByRole("link", {
        name: "Write Finance (finance@globalfellowship.org)",
      })
    ).toHaveAttribute(
      "href",
      "mailto:finance@globalfellowship.org?subject=Donor%20Help"
    );
  });

  it("expands and collapses all panels through the UI SDK Accordion controller", async () => {
    const user = userEvent.setup();

    render(
      <SearchableFaq
        emptyContactEmail="finance@globalfellowship.org"
        emptyContactLabel="Write Finance"
        emptyContactSubject="Donor Help"
        items={SAMPLE_FAQS}
        searchLabel="Search donor questions"
        searchPlaceholder="Search..."
      />
    );

    await user.click(screen.getByRole("button", { name: "Expand all" }));

    const triggers = screen.getAllByRole("button", { expanded: true });

    expect(triggers).toHaveLength(3);

    await user.click(screen.getByRole("button", { name: "Collapse all" }));

    expect(screen.queryAllByRole("button", { expanded: true })).toHaveLength(0);
  });
});
