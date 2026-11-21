import { expect, test } from "@playwright/test";

test.describe("Starter foundation smoke checks", () => {
  test("renders starter route cleanly at desktop with non-indexable metadata and no runtime errors", async ({
    page,
  }) => {
    const consoleErrors: string[] = [];
    const pageErrors: string[] = [];

    page.on("console", (message) => {
      if (message.type() === "error") {
        consoleErrors.push(message.text());
      }
    });

    page.on("pageerror", (error) => {
      pageErrors.push(error.message);
    });

    const response = await page.goto("/");

    expect(response?.status()).toBe(200);

    await expect(
      page.getByRole("heading", {
        level: 1,
        name: "Global Fellowship Website Foundation",
      })
    ).toBeVisible();

    const robotsMeta = page.locator('meta[name="robots"]');

    await expect(robotsMeta).toHaveAttribute("content", /noindex/iu);
    await expect(robotsMeta).toHaveAttribute("content", /nofollow/iu);

    const previewImage = page.getByRole("img", {
      name: /provisional architectural wireframe placeholder/iu,
    });

    await expect(previewImage).toBeVisible();

    const hasOverflow = await page.evaluate(
      () => document.documentElement.scrollWidth > window.innerWidth
    );

    expect(hasOverflow).toBe(false);

    const robotsResponse = await page.request.get("/robots.txt");

    expect(robotsResponse.status()).toBe(200);

    const robotsBody = await robotsResponse.text();

    expect(robotsBody).toContain("Disallow: /");
    expect(consoleErrors).toEqual([]);
    expect(pageErrors).toEqual([]);
  });

  test("supports keyboard navigation, focus, and pointer interaction on Vercel UI SDK tabs", async ({
    page,
  }) => {
    await page.goto("/");

    const tablist = page.getByRole("tablist", { name: "Architecture areas" });

    await expect(tablist).toBeVisible();

    const frontendTab = page.getByRole("tab", { name: "Frontend Runtime" });
    const uiTab = page.getByRole("tab", { name: "UI Architecture" });
    const contentTab = page.getByRole("tab", { name: "Content Boundary" });

    await expect(frontendTab).toHaveAttribute("aria-selected", "true");
    await expect(
      page.getByRole("heading", {
        level: 3,
        name: "Next.js App Router on Node.js 24",
      })
    ).toBeVisible();

    await frontendTab.focus();
    await expect(frontendTab).toBeFocused();

    await page.keyboard.press("ArrowRight");
    await expect(uiTab).toBeFocused();
    await expect(uiTab).toHaveAttribute("aria-selected", "true");
    await expect(
      page.getByRole("heading", {
        level: 3,
        name: "shadcn Tokens + Vercel UI SDK Primitives",
      })
    ).toBeVisible();

    await page.keyboard.press("ArrowRight");
    await expect(contentTab).toBeFocused();
    await expect(contentTab).toHaveAttribute("aria-selected", "true");
    await expect(
      page.getByRole("heading", {
        level: 3,
        name: "Server-Only Reader Prepared for Core",
      })
    ).toBeVisible();

    await page.keyboard.press("Home");
    await expect(frontendTab).toBeFocused();
    await expect(frontendTab).toHaveAttribute("aria-selected", "true");

    await uiTab.click();
    await expect(uiTab).toHaveAttribute("aria-selected", "true");
  });

  test("renders cleanly at mobile viewport without horizontal overflow", async ({
    page,
  }) => {
    await page.setViewportSize({ height: 844, width: 390 });
    await page.goto("/");

    await expect(
      page.getByRole("heading", {
        level: 1,
        name: "Global Fellowship Website Foundation",
      })
    ).toBeVisible();

    const hasOverflow = await page.evaluate(
      () => document.documentElement.scrollWidth > window.innerWidth
    );

    expect(hasOverflow).toBe(false);
  });

  test("renders custom 404 page with navigation back to starter route", async ({
    page,
  }) => {
    const response = await page.goto("/non-existent-route-smoke-check");

    expect(response?.status()).toBe(404);

    await expect(
      page.getByRole("heading", { level: 1, name: "Page not found" })
    ).toBeVisible();

    await page.getByRole("link", { name: "Back to starter page" }).click();
    await expect(page).toHaveURL("/");
  });
});
