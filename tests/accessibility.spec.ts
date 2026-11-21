import { AxeBuilder } from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

const WCAG_TAGS = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"];

test.describe("Accessibility verification @a11y", () => {
  test("passes WCAG 2.1 A/AA checks on default starter tab state @a11y", async ({
    page,
  }) => {
    await page.goto("/");

    const results = await new AxeBuilder({ page })
      .withTags(WCAG_TAGS)
      .analyze();

    expect(results.violations).toEqual([]);
  });

  test("passes WCAG 2.1 A/AA checks after switching to UI Architecture tab @a11y", async ({
    page,
  }) => {
    await page.goto("/");

    await page.getByRole("tab", { name: "UI Architecture" }).click();

    await expect(
      page.getByRole("heading", {
        level: 3,
        name: "shadcn Tokens + Vercel UI SDK Primitives",
      })
    ).toBeVisible();

    const results = await new AxeBuilder({ page })
      .withTags(WCAG_TAGS)
      .analyze();

    expect(results.violations).toEqual([]);
  });

  test("passes WCAG 2.1 A/AA checks after switching to Content Boundary tab @a11y", async ({
    page,
  }) => {
    await page.goto("/");

    await page.getByRole("tab", { name: "Content Boundary" }).click();

    await expect(
      page.getByRole("heading", {
        level: 3,
        name: "Server-Only Reader Prepared for Core",
      })
    ).toBeVisible();

    const results = await new AxeBuilder({ page })
      .withTags(WCAG_TAGS)
      .analyze();

    expect(results.violations).toEqual([]);
  });

  test("passes WCAG 2.1 A/AA checks on custom 404 route @a11y", async ({
    page,
  }) => {
    const response = await page.goto("/non-existent-route-a11y-check");

    expect(response?.status()).toBe(404);

    const results = await new AxeBuilder({ page })
      .withTags(WCAG_TAGS)
      .analyze();

    expect(results.violations).toEqual([]);
  });

  test("supports keyboard skip-link focus and respects reduced motion @a11y", async ({
    page,
  }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/");

    const skipLink = page.getByRole("link", { name: "Skip to main content" });

    await skipLink.focus();
    await expect(skipLink).toBeFocused();
    await expect(skipLink).toHaveAttribute("href", "#main-content");

    await page.keyboard.press("Enter");
    await expect(page.locator("#main-content")).toBeFocused();

    const prefersReducedMotion = await page.evaluate(
      () => window.matchMedia("(prefers-reduced-motion: reduce)").matches
    );

    expect(prefersReducedMotion).toBe(true);
  });

  test("avoids horizontal overflow at narrow 320px viewport @a11y", async ({
    page,
  }) => {
    await page.setViewportSize({ height: 640, width: 320 });
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
});
