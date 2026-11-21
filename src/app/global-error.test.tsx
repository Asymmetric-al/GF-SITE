import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import GlobalErrorPage from "./global-error";

describe(GlobalErrorPage, () => {
  it("renders root-layout fallback guidance, optional digest, and invokes retry", async () => {
    const user = userEvent.setup();
    const retry = vi.fn<() => void>();

    const errorWithDigest = Object.assign(new Error("Root layout failure"), {
      digest: "global-digest-456",
    });

    render(<GlobalErrorPage error={errorWithDigest} retry={retry} />, {
      container: document,
    });

    expect(
      screen.getByRole("heading", { level: 1, name: "Something went wrong" })
    ).toBeVisible();
    expect(screen.getByText("Reference: global-digest-456")).toBeVisible();

    await user.click(screen.getByRole("button", { name: "Try again" }));

    expect(retry).toHaveBeenCalledOnce();
  });

  it("renders safely when a non-Error value is thrown", () => {
    const retry = vi.fn<() => void>();

    render(<GlobalErrorPage error={null} retry={retry} />, {
      container: document,
    });

    expect(
      screen.getByRole("heading", { level: 1, name: "Something went wrong" })
    ).toBeVisible();
    expect(screen.queryByText(/Reference:/u)).not.toBeInTheDocument();
  });
});
