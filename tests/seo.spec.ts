import { expect, test } from "@playwright/test";

test.describe("Technical SEO route checks @seo", () => {
  test("verifies homepage metadata, CSP, font preloads, crawlability policy, and landmarks @seo", async ({
    page,
  }) => {
    const response = await page.goto("/");

    expect(response?.status()).toBe(200);

    const headers = response?.headers() ?? {};

    expect(headers["content-security-policy"]).toContain(
      "frame-ancestors 'none'"
    );
    expect(headers["strict-transport-security"]).toContain("max-age=");
    expect(headers["x-content-type-options"]).toBe("nosniff");
    expect(headers["referrer-policy"]).toBe("strict-origin-when-cross-origin");
    expect(headers["x-frame-options"]).toBe("DENY");
    expect(headers["permissions-policy"]).toContain("camera=()");
    expect(headers["x-robots-tag"]).toBeUndefined();
    expect(headers["x-powered-by"]).toBeUndefined();

    await expect(page.locator("html")).toHaveAttribute("lang", "en");
    await expect(page).toHaveTitle("Global Fellowship");

    const description = page.locator('meta[name="description"]');

    await expect(description).toHaveAttribute(
      "content",
      "A Christian fellowship helping local believers plant churches where Jesus is little known, alongside cross-cultural missionaries who serve under their leadership."
    );

    const robotsMeta = page.locator('meta[name="robots"]');

    await expect(robotsMeta).toHaveAttribute("content", /\bindex\b/iu);
    await expect(robotsMeta).toHaveAttribute("content", /\bfollow\b/iu);
    await expect(robotsMeta).not.toHaveAttribute("content", /noindex/iu);

    const ogTitle = page.locator('meta[property="og:title"]');
    const ogType = page.locator('meta[property="og:type"]');
    const ogImage = page.locator('meta[property="og:image"]');
    const twitterCard = page.locator('meta[name="twitter:card"]');

    await expect(ogTitle).toHaveAttribute("content", "Global Fellowship");
    await expect(ogType).toHaveAttribute("content", "website");
    await expect(ogImage).toHaveAttribute(
      "content",
      /og-link-preview-1200x630\.png$/u
    );
    await expect(twitterCard).toHaveAttribute("content", "summary_large_image");

    // Preload only the two above-the-fold Latin subsets (editorial display serif + Nunito reading sans).
    const preloadedFonts = await page
      .locator('link[rel="preload"][as="font"]')
      .count();

    expect(preloadedFonts).toBeLessThanOrEqual(2);
    expect(preloadedFonts).toBeGreaterThanOrEqual(1);

    await expect(page.locator('link[rel="canonical"]')).toHaveCount(0);
    await expect(page.locator("h1")).toHaveCount(1);
    await expect(page.locator("#main-content")).toHaveCount(1);

    const heroPhoto = page.getByRole("img", {
      name: /Six men sitting together outdoors/iu,
    });

    await expect(heroPhoto).toHaveAttribute("width", "1600");
    await expect(heroPhoto).toHaveAttribute("height", "1599");

    // Verify `/projects*` and `/missionaries*` (indexes, live rewrites, and
    // detail/error routes) emit their single authoritative runtime CSP via
    // `src/proxy.ts` while all other routes receive CSP via `next.config.ts`.
    const [
      projectsIndexRes,
      missingProjectRes,
      missionariesIndexRes,
      missingMissionaryRes,
    ] = await Promise.all([
      page.request.get("/projects"),
      page.request.get("/projects/nonexistent-csp-check"),
      page.request.get("/missionaries"),
      page.request.get("/missionaries/nonexistent-csp-check"),
    ]);

    expect(projectsIndexRes.headers()["content-security-policy"]).toContain(
      "frame-ancestors 'none'"
    );
    expect(missingProjectRes.headers()["content-security-policy"]).toContain(
      "frame-ancestors 'none'"
    );
    expect(missionariesIndexRes.headers()["content-security-policy"]).toContain(
      "frame-ancestors 'none'"
    );
    expect(missingMissionaryRes.headers()["content-security-policy"]).toContain(
      "frame-ancestors 'none'"
    );

    // Verify valid Organization JSON-LD structured data
    const jsonLdRaw = await page
      .locator('script[type="application/ld+json"]')
      .first()
      .textContent();

    expect(jsonLdRaw).not.toBeNull();
    expect(JSON.parse(jsonLdRaw ?? "{}")).toMatchObject({
      "@type": "NGO",
      address: {
        postOfficeBoxNumber: "1",
      },
      foundingDate: "1989",
      legalName: "Global Fellowship, Inc.",
      taxID: "68-0214543",
    });
  });

  test("serves crawlable robots.txt on non-preview builds and clean sitemap @seo", async ({
    request,
  }) => {
    const response = await request.get("/robots.txt");

    expect(response.status()).toBe(200);

    const contentType = response.headers()["content-type"] ?? "";

    expect(contentType).toContain("text/plain");

    const body = await response.text();

    expect(body).toContain("User-Agent: *");
    expect(body).toContain("Allow: /");
    expect(body).not.toContain("Disallow: /");

    const sitemapResponse = await request.get("/sitemap.xml");

    expect(sitemapResponse.status()).toBe(200);
    expect(await sitemapResponse.text()).not.toContain("<loc>");

    const llmsResponse = await request.get("/llms.txt");

    expect(llmsResponse.status()).toBe(200);
    expect(llmsResponse.headers()["content-type"] ?? "").toContain(
      "text/markdown"
    );

    const llmsBody = await llmsResponse.text();

    expect(llmsBody).toMatch(/^# Global Fellowship\n/u);
    expect(llmsBody).toContain("[Give to Global Fellowship](/give)");
    expect(llmsBody).not.toContain("/eula");
  });

  test("returns real HTTP 404 with single H1 and recovery link for missing routes @seo", async ({
    page,
  }) => {
    const response = await page.goto("/non-existent-route-seo-check");

    expect(response?.status()).toBe(404);
    await expect(page.locator("h1")).toHaveCount(1);
    await expect(
      page.getByRole("heading", {
        level: 1,
        name: "We could not find that page.",
      })
    ).toBeVisible();
    await expect(
      page.getByRole("link", { name: "Return to Global Fellowship" })
    ).toHaveAttribute("href", "/");
  });

  for (const legalPath of ["/eula", "/privacypolicy"] as const) {
    test(`enforces single H1 and noindex on Accounting App route ${legalPath} @seo`, async ({
      page,
    }) => {
      const response = await page.goto(legalPath);

      expect(response?.status()).toBe(200);
      await expect(page.locator("h1")).toHaveCount(1);
      await expect(page.locator('meta[name="robots"]')).toHaveAttribute(
        "content",
        /noindex/iu
      );
    });
  }
});
