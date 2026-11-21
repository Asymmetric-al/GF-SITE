import { expect, test } from "@playwright/test";

test.describe("Visual regression baseline @visual", () => {
  test("matches reviewed desktop Chromium baseline for starter route @visual", async ({
    browserName,
    page,
  }) => {
    test.skip(
      browserName !== "chromium" || process.platform !== "win32",
      "Visual baseline is tracked deterministically against Desktop Chromium on Windows (win32) until Linux baselines are added."
    );

    await page.setViewportSize({ height: 900, width: 1280 });
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/");

    await expect(
      page.getByRole("heading", {
        level: 1,
        name: "Global Fellowship Website Foundation",
      })
    ).toBeVisible();

    await page.evaluate(async () => {
      await document.fonts.ready;
    });

    await expect(page).toHaveScreenshot("starter-home-desktop.png", {
      animations: "disabled",
      fullPage: true,
    });
  });
});
