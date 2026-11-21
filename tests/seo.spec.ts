import { expect, test } from "@playwright/test";

test.describe("Technical SEO route checks @seo", () => {
  test("verifies homepage metadata, non-indexable policy, canonical absence, and landmarks @seo", async ({
    page,
  }) => {
    const response = await page.goto("/");

    expect(response?.status()).toBe(200);

    await expect(page.locator("html")).toHaveAttribute("lang", "en");
    await expect(page).toHaveTitle("Global Fellowship (Development Scaffold)");

    const description = page.locator('meta[name="description"]');

    await expect(description).toHaveAttribute(
      "content",
      "Provisional frontend foundation for the Global Fellowship website."
    );

    const robotsMeta = page.locator('meta[name="robots"]');

    await expect(robotsMeta).toHaveAttribute("content", /noindex/iu);
    await expect(robotsMeta).toHaveAttribute("content", /nofollow/iu);

    const ogTitle = page.locator('meta[property="og:title"]');
    const ogDescription = page.locator('meta[property="og:description"]');
    const ogType = page.locator('meta[property="og:type"]');
    const twitterCard = page.locator('meta[name="twitter:card"]');

    await expect(ogTitle).toHaveAttribute(
      "content",
      "Global Fellowship (Development Scaffold)"
    );
    await expect(ogDescription).toHaveAttribute(
      "content",
      "Provisional frontend foundation for the Global Fellowship website."
    );
    await expect(ogType).toHaveAttribute("content", "website");
    await expect(twitterCard).toHaveAttribute("content", "summary");

    // Until NEXT_PUBLIC_SITE_URL is explicitly configured for production,
    // no localhost or preview canonical link should be emitted.
    await expect(page.locator('link[rel="canonical"]')).toHaveCount(0);

    // Document structure: single H1, skip-link target, and accessible image dimensions.
    await expect(page.locator("h1")).toHaveCount(1);
    await expect(page.locator("#main-content")).toHaveCount(1);

    const previewImage = page.getByRole("img", {
      name: /provisional architectural wireframe placeholder/iu,
    });

    await expect(previewImage).toHaveAttribute("width", "960");
    await expect(previewImage).toHaveAttribute("height", "540");
  });

  test("serves non-indexable robots.txt disallowing crawling @seo", async ({
    request,
  }) => {
    const response = await request.get("/robots.txt");

    expect(response.status()).toBe(200);

    const contentType = response.headers()["content-type"] ?? "";

    expect(contentType).toContain("text/plain");

    const body = await response.text();

    expect(body).toContain("User-Agent: *");
    expect(body).toContain("Disallow: /");
  });

  test("returns real HTTP 404 with single H1 and recovery link for missing routes @seo", async ({
    page,
  }) => {
    const response = await page.goto("/non-existent-route-seo-check");

    expect(response?.status()).toBe(404);
    await expect(page.locator("h1")).toHaveCount(1);
    await expect(
      page.getByRole("heading", { level: 1, name: "Page not found" })
    ).toBeVisible();
    await expect(
      page.getByRole("link", { name: "Back to starter page" })
    ).toHaveAttribute("href", "/");
  });
});
