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
      screen.getByRole("heading", { level: 1, name: "Something went wrong" })
    ).toBeVisible();
    expect(screen.getByText("Reference: err-digest-123")).toBeVisible();

    await user.click(screen.getByRole("button", { name: "Try again" }));

    expect(retry).toHaveBeenCalledOnce();
  });

  it("omits the reference line when no digest is present", () => {
    const retry = vi.fn<() => void>();

    render(<ErrorPage error={new Error("Transient failure")} retry={retry} />);

    expect(screen.queryByText(/Reference:/u)).not.toBeInTheDocument();
  });
});
