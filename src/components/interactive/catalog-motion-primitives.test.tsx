import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { ReadingProgressBar } from "./reading-progress-bar";
import { RollingUsdCounter } from "./rolling-usd-counter";
import { ScrollExpandFrame } from "./scroll-expand-frame";
import { SpotlightSurface } from "./spotlight-surface";

describe("Catalog motion primitives", () => {
  it("renders RollingUsdCounter with exact screen-reader currency text and digit strips", () => {
    const { container } = render(<RollingUsdCounter amount={1250.5} />);

    expect(screen.getByText("$1,250.50")).toBeInTheDocument();
    expect(
      container.querySelectorAll('.gf-counter-strip[data-digit="5"]')
    ).toHaveLength(2);
  });

  it("updates isolated SpotlightSurface glow coordinates on mouse move and skips touch", async () => {
    const { container } = render(
      <SpotlightSurface>
        <span>Stewardship card</span>
      </SpotlightSurface>
    );

    const surface = container.firstElementChild;
    const glow = container.querySelector<HTMLSpanElement>(".gf-spotlight-glow");

    expect(surface).toBeInstanceOf(HTMLDivElement);
    expect(glow).toBeInstanceOf(HTMLSpanElement);

    if (!(surface instanceof HTMLDivElement) || glow === null) {
      return;
    }

    fireEvent.pointerMove(surface, {
      clientX: 48,
      clientY: 24,
      pointerType: "mouse",
    });

    await waitFor(() => {
      expect({
        glowX: glow.style.getPropertyValue("--gf-spot-x"),
        glowY: glow.style.getPropertyValue("--gf-spot-y"),
        surfaceX: surface.style.getPropertyValue("--gf-spot-x"),
      }).toStrictEqual({
        glowX: "48px",
        glowY: "24px",
        surfaceX: "",
      });
    });

    fireEvent.pointerMove(surface, {
      clientX: 90,
      clientY: 90,
      pointerType: "touch",
    });

    expect(glow.style.getPropertyValue("--gf-spot-x")).toBe("48px");
  });

  it("keeps ScrollExpandFrame unclipped and ReadingProgressBar inert when reduced motion applies", () => {
    const { container } = render(
      <div>
        <ReadingProgressBar />
        <ScrollExpandFrame>
          <p>Baptism scene</p>
        </ScrollExpandFrame>
      </div>
    );

    const frame = container.querySelector<HTMLDivElement>(".gf-scroll-expand");

    const bar = container.querySelector<HTMLDivElement>(
      ".gf-reading-progress-fill"
    );

    expect(frame?.style.clipPath).toBe("none");
    expect(bar?.style.transform).toBe("scaleX(0)");
    expect(screen.getByText("Baptism scene")).toBeVisible();
  });
});
