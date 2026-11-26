import { expect, test } from "@playwright/test";
import type { Page } from "@playwright/test";

const prepareSnapshotPage = async (
  page: Page,
  route: string
): Promise<void> => {
  await page.goto(route, { waitUntil: "networkidle" });
  await page.evaluate(() => {
    for (const img of document.images) {
      if (!img.complete) {
        img.loading = "eager";
      }
    }
  });
  await page.waitForLoadState("networkidle");
  await page.evaluate(async () => {
    await document.fonts.ready;

    await Promise.all(
      [...document.images].map(async (img) => {
        try {
          await img.decode();
        } catch {
          // Ignore non-decodable fallback images cleanly
        }
      })
    );
  });
};

test.describe("Visual regression baselines @visual", () => {
  test.beforeEach(({ browserName }) => {
    test.skip(
      browserName !== "chromium" || process.platform !== "win32",
      "Visual baselines are tracked deterministically against Chromium on Windows (win32) until Linux baselines are added."
    );
  });

  test("matches reviewed desktop light baseline for Home @visual", async ({
    page,
  }) => {
    await page.setViewportSize({ height: 900, width: 1280 });
    await page.emulateMedia({ colorScheme: "light", reducedMotion: "reduce" });
    await prepareSnapshotPage(page, "/");

    await expect(page).toHaveScreenshot("gf-home-desktop.png", {
      animations: "disabled",
      fullPage: true,
    });
  });

  test("matches reviewed desktop dark baseline for Home @visual", async ({
    page,
  }) => {
    await page.setViewportSize({ height: 900, width: 1280 });
    await page.emulateMedia({ colorScheme: "dark", reducedMotion: "reduce" });
    await prepareSnapshotPage(page, "/");

    await expect(page).toHaveScreenshot("gf-home-desktop-dark.png", {
      animations: "disabled",
      fullPage: true,
    });
  });

  test("matches reviewed mobile light baseline for Home @visual", async ({
    page,
  }) => {
    await page.setViewportSize({ height: 844, width: 390 });
    await page.emulateMedia({ colorScheme: "light", reducedMotion: "reduce" });
    await prepareSnapshotPage(page, "/");

    await expect(page).toHaveScreenshot("gf-home-mobile.png", {
      animations: "disabled",
      fullPage: true,
    });
  });

  test("matches reviewed 320px narrow mobile baseline for Home @visual", async ({
    page,
  }) => {
    await page.setViewportSize({ height: 640, width: 320 });
    await page.emulateMedia({ colorScheme: "light", reducedMotion: "reduce" });
    await prepareSnapshotPage(page, "/");

    await expect(page).toHaveScreenshot("gf-home-mobile-320.png", {
      animations: "disabled",
      fullPage: true,
    });
  });

  for (const entry of [
    { name: "gf-missionaries-desktop.png", route: "/missionaries" },
    { name: "gf-projects-desktop.png", route: "/projects" },
    { name: "gf-opportunities-desktop.png", route: "/opportunities" },
    {
      name: "gf-serve-across-cultures-desktop.png",
      route: "/serve-across-cultures",
    },
    { name: "gf-our-people-desktop.png", route: "/our-people" },
    { name: "gf-financials-desktop.png", route: "/financials" },
    { name: "gf-give-desktop.png", route: "/give" },
    { name: "gf-contact-desktop.png", route: "/contact" },
    { name: "gf-local-leaders-desktop.png", route: "/local-leaders" },
    { name: "gf-where-we-serve-desktop.png", route: "/where-we-serve" },
    { name: "gf-churches-desktop.png", route: "/churches" },
    { name: "gf-stories-desktop.png", route: "/stories" },
    {
      name: "gf-mission-and-values-desktop.png",
      route: "/mission-and-values",
    },
    { name: "gf-how-we-work-desktop.png", route: "/how-we-work" },
    { name: "gf-bridge-project-desktop.png", route: "/bridge-project" },
  ] as const) {
    test(`matches reviewed desktop light baseline for ${entry.route} @visual`, async ({
      page,
    }) => {
      await page.setViewportSize({ height: 900, width: 1280 });
      await page.emulateMedia({
        colorScheme: "light",
        reducedMotion: "reduce",
      });
      await prepareSnapshotPage(page, entry.route);

      await expect(page).toHaveScreenshot(entry.name, {
        animations: "disabled",
        fullPage: true,
        timeout: 20_000,
      });
    });
  }
});
