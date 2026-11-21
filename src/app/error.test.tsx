import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import ErrorPage from "./error";

describe(ErrorPage, () => {
  it("renders error guidance, optional digest reference, and invokes reset on retry", async () => {
    const user = userEvent.setup();
    const reset = vi.fn<() => void>();

    const errorWithDigest = Object.assign(new Error("Upstream failure"), {
      digest: "err-digest-123",
    });

    render(<ErrorPage error={errorWithDigest} reset={reset} />);

    expect(
      screen.getByRole("heading", { level: 1, name: "Something went wrong" })
    ).toBeVisible();
    expect(screen.getByText("Reference: err-digest-123")).toBeVisible();

    await user.click(screen.getByRole("button", { name: "Try again" }));

    expect(reset).toHaveBeenCalledOnce();
  });

  it("omits the reference line when no digest is present", () => {
    const reset = vi.fn<() => void>();

    render(<ErrorPage error={new Error("Transient failure")} reset={reset} />);

    expect(screen.queryByText(/Reference:/u)).not.toBeInTheDocument();
  });
});
