import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import ErrorPage from "./error";

describe(ErrorPage, () => {
  it("renders error guidance, optional digest reference, and invokes retry", async () => {
    const user = userEvent.setup();
    const retry = vi.fn<() => void>();

    const errorWithDigest = Object.assign(new Error("Upstream failure"), {
      digest: "err-digest-123",
    });

    render(<ErrorPage error={errorWithDigest} retry={retry} />);

    expect(
      screen.getByRole("heading", {
        level: 1,
        name: "This page could not load right now.",
      })
    ).toBeVisible();
    expect(screen.getByText("Reference: err-digest-123")).toBeVisible();

    await user.click(screen.getByRole("button", { name: "Try again" }));

    expect(retry).toHaveBeenCalledOnce();
  });

  it("handles errors without a digest and non-Error thrown values safely", () => {
    const retry = vi.fn<() => void>();

    const { rerender } = render(
      <ErrorPage error={new Error("Transient failure")} retry={retry} />
    );

    expect(screen.queryByText(/Reference:/u)).not.toBeInTheDocument();

    rerender(<ErrorPage error={null} retry={retry} />);

    expect(
      screen.getByRole("heading", {
        level: 1,
        name: "This page could not load right now.",
      })
    ).toBeVisible();

    rerender(<ErrorPage error="string-thrown-value" retry={retry} />);

    expect(screen.queryByText(/Reference:/u)).not.toBeInTheDocument();
  });
});
