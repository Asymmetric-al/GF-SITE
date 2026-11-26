import { AxeBuilder } from "@axe-core/playwright";
import { expect, test } from "@playwright/test";
import type { Page } from "@playwright/test";

const WCAG_TAGS = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"];

const LIGHT_AUDITED_ROUTES = [
  "/",
  "/mission-and-values",
  "/how-we-work",
  "/our-people",
  "/where-we-serve",
  "/where-we-serve/central-asia",
  "/missionaries",
  "/missionaries/beaumont",
  "/projects",
  "/projects/leadership-summit",
  "/opportunities",
  "/opportunities/slovenia-church-planter",
  "/serve-across-cultures",
  "/bridge-project",
  "/pray",
  "/churches",
  "/local-leaders",
  "/give",
  "/give/help",
  "/financials",
  "/statement-of-faith",
  "/stories",
  "/stories/you-can-land-but-taking-off-is-gods-work",
  "/where-we-serve/americas",
  "/contact",
  "/donor-privacy",
  "/credits",
  "/eula",
  "/privacypolicy",
] as const;

const DARK_AUDITED_ROUTES = [
  "/",
  "/mission-and-values",
  "/how-we-work",
  "/our-people",
  "/where-we-serve",
  "/missionaries",
  "/missionaries/beaumont",
  "/projects",
  "/projects/leadership-summit",
  "/opportunities",
  "/serve-across-cultures",
  "/bridge-project",
  "/pray",
  "/churches",
  "/local-leaders",
  "/give",
  "/financials",
  "/statement-of-faith",
  "/stories",
  "/contact",
  "/credits",
] as const;

const STATUS_ERROR_ROUTES = [
  { expectedStatus: 404, path: "/non-existent-route-a11y-check" },
  { expectedStatus: 404, path: "/projects/unavailable/not-found" },
  { expectedStatus: 503, path: "/projects/unavailable/outage" },
  { expectedStatus: 404, path: "/missionaries/unavailable/not-found" },
  { expectedStatus: 503, path: "/missionaries/unavailable/outage" },
  { expectedStatus: 410, path: "/checkout-test" },
  {
    expectedStatus: 400,
    path: "/checkout?via=form&fund_id=leadership-summit&amount=0.50",
  },
  {
    expectedStatus: 200,
    path: "/give/checkout?fund_id=leadership-summit&amount=125.50",
  },
] as const;

const NARROW_VIEWPORT_ROUTES = [
  "/",
  "/mission-and-values",
  "/how-we-work",
  "/our-people",
  "/missionaries",
  "/projects",
  "/opportunities",
  "/serve-across-cultures",
  "/churches",
  "/bridge-project",
  "/pray",
  "/local-leaders",
  "/give",
  "/give/help",
  "/financials",
  "/statement-of-faith",
  "/contact",
  "/credits",
] as const;

const BANNER_CONTRAST_SAMPLES = [
  { height: 900, label: "Home desktop", route: "/", width: 1280 },
  { height: 844, label: "Home mobile 390px", route: "/", width: 390 },
  { height: 900, label: "Pray desktop", route: "/pray", width: 1280 },
  { height: 844, label: "Pray mobile 390px", route: "/pray", width: 390 },
] as const;

const LAYERED_OVERLAP_ROUTES = [
  { expectedMinFrames: 2, label: "Home", route: "/" },
  { expectedMinFrames: 1, label: "How We Work", route: "/how-we-work" },
] as const;

const RGB_PATTERN = /rgba?\((?<r>\d+),\s*(?<g>\d+),\s*(?<b>\d+)/u;

const relativeLuminance = (r: number, g: number, b: number): number => {
  const linear = [r, g, b].map((channel) => {
    const srgb = channel / 255;

    return srgb <= 0.03928 ? srgb / 12.92 : ((srgb + 0.055) / 1.055) ** 2.4;
  });

  return (
    0.2126 * (linear[0] ?? 0) +
    0.7152 * (linear[1] ?? 0) +
    0.0722 * (linear[2] ?? 0)
  );
};

const parseRgb = (cssColor: string): readonly [number, number, number] => {
  const groups = RGB_PATTERN.exec(cssColor)?.groups;

  if (
    groups?.r === undefined ||
    groups.g === undefined ||
    groups.b === undefined
  ) {
    throw new Error(`Unable to parse RGB color string: ${cssColor}`);
  }

  return [Number(groups.r), Number(groups.g), Number(groups.b)];
};

const measurePixelContrast = async (
  page: Page,
  fgColor: string,
  png: Buffer,
  mode: "interior" | "perimeter" = "perimeter"
): Promise<number> => {
  const base64 = png.toString("base64");

  const samples = await page.evaluate(
    async ({
      dataUri,
      sampleMode,
    }: {
      readonly dataUri: string;
      readonly sampleMode: "interior" | "perimeter";
    }) => {
      const img = new Image();

      img.src = dataUri;
      await img.decode();

      const canvas = document.createElement("canvas");

      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;

      const ctx = canvas.getContext("2d", { willReadFrequently: true });

      if (ctx === null) {
        return [];
      }

      ctx.drawImage(img, 0, 0);

      const maxX = Math.max(0, img.naturalWidth - 1);
      const maxY = Math.max(0, img.naturalHeight - 1);
      const result: (readonly [number, number, number])[] = [];

      if (sampleMode === "interior") {
        // 25-point interior glyph-band grid (5x5 across 12%..88% width & 15%..85% height)
        const xs = [0.12, 0.31, 0.5, 0.69, 0.88].map((ratio) =>
          Math.floor(maxX * ratio)
        );

        const ys = [0.15, 0.32, 0.5, 0.68, 0.85].map((ratio) =>
          Math.floor(maxY * ratio)
        );

        for (const y of ys) {
          for (const x of xs) {
            const pixel = ctx.getImageData(
              Math.min(x, maxX),
              Math.min(y, maxY),
              1,
              1
            ).data;

            result.push([pixel[0] ?? 0, pixel[1] ?? 0, pixel[2] ?? 0] as const);
          }
        }

        return result;
      }

      // 28-point perimeter grid inside the flat top/bottom rails so worst-case bright spots are measured without clipping rounded corners
      const insetX = Math.min(8, Math.floor(maxX * 0.1));

      const xs = [
        insetX,
        Math.floor(maxX * 0.2),
        Math.floor(maxX * 0.35),
        Math.floor(maxX * 0.5),
        Math.floor(maxX * 0.65),
        Math.floor(maxX * 0.8),
        Math.max(0, maxX - insetX),
      ];

      const ys = [2, 3, Math.max(0, maxY - 3), Math.max(0, maxY - 2)];

      for (const y of ys) {
        for (const x of xs) {
          const pixel = ctx.getImageData(
            Math.min(x, maxX),
            Math.min(y, maxY),
            1,
            1
          ).data;

          result.push([pixel[0] ?? 0, pixel[1] ?? 0, pixel[2] ?? 0] as const);
        }
      }

      return result;
    },
    { dataUri: `data:image/png;base64,${base64}`, sampleMode: mode }
  );

  if (samples.length === 0) {
    throw new Error("Pixel contrast sampling returned zero pixels.");
  }

  const [fgR, fgG, fgB] = parseRgb(fgColor);
  const fgLum = relativeLuminance(fgR, fgG, fgB);

  const worstBgLum = Math.max(
    ...samples.map(([r, g, b]) => relativeLuminance(r, g, b))
  );

  const lighter = Math.max(fgLum, worstBgLum);
  const darker = Math.min(fgLum, worstBgLum);

  return (lighter + 0.05) / (darker + 0.05);
};

const parseCssDurationMs = (raw: string): number => {
  const trimmed = raw.trim();

  if (trimmed.endsWith("ms")) {
    return Number(trimmed.slice(0, -2));
  }

  if (trimmed.endsWith("s")) {
    return Number(trimmed.slice(0, -1)) * 1000;
  }

  return Number(trimmed);
};

test.describe("Accessibility verification @a11y", () => {
  for (const route of LIGHT_AUDITED_ROUTES) {
    test(`passes WCAG 2.2 A/AA checks on ${route} in light mode @a11y`, async ({
      page,
    }) => {
      await page.emulateMedia({ colorScheme: "light" });
      const response = await page.goto(route);

      expect(response?.status()).toBe(200);

      const results = await new AxeBuilder({ page })
        .withTags(WCAG_TAGS)
        .analyze();

      expect(results.violations).toEqual([]);
    });
  }

  for (const route of DARK_AUDITED_ROUTES) {
    test(`passes WCAG 2.2 A/AA checks on ${route} in OS dark mode @a11y`, async ({
      page,
    }) => {
      await page.emulateMedia({ colorScheme: "dark" });
      await page.goto(route);

      const results = await new AxeBuilder({ page })
        .withTags(WCAG_TAGS)
        .analyze();

      expect(results.violations).toEqual([]);
    });
  }

  for (const colorScheme of ["light", "dark"] as const) {
    for (const check of STATUS_ERROR_ROUTES) {
      test(`passes WCAG 2.2 A/AA checks on HTTP ${String(check.expectedStatus)} route ${check.path} in ${colorScheme} mode @a11y`, async ({
        page,
      }) => {
        await page.emulateMedia({ colorScheme });
        const response = await page.goto(check.path);

        expect(response?.status()).toBe(check.expectedStatus);

        const audit = await new AxeBuilder({ page })
          .withTags(WCAG_TAGS)
          .analyze();

        expect(audit.violations).toEqual([]);
      });
    }
  }

  test("passes WCAG 2.2 A/AA checks on switched Give tabs @a11y", async ({
    page,
  }) => {
    await page.emulateMedia({ colorScheme: "light" });
    await page.goto("/give");
    await page.getByRole("tab", { name: "By Check" }).click();

    const checkTabResults = await new AxeBuilder({ page })
      .withTags(WCAG_TAGS)
      .analyze();

    expect(checkTabResults.violations).toEqual([]);

    await page.getByRole("tab", { name: "Stock, DAF & Wire" }).click();

    const stockTabResults = await new AxeBuilder({ page })
      .withTags(WCAG_TAGS)
      .analyze();

    expect(stockTabResults.violations).toEqual([]);
  });

  test("passes WCAG 2.2 A/AA checks on open MobileNavDrawer @a11y", async ({
    page,
  }) => {
    await page.emulateMedia({ colorScheme: "light" });
    await page.setViewportSize({ height: 844, width: 390 });
    await page.goto("/");
    await page.getByRole("button", { name: "Menu" }).click();
    await expect(page.getByRole("button", { name: "Close" })).toBeVisible();

    const drawerResults = await new AxeBuilder({ page })
      .withTags(WCAG_TAGS)
      .analyze();

    expect(drawerResults.violations).toEqual([]);
  });

  test("supports keyboard skip-link focus and enforces computed reduced motion durations @a11y", async ({
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

    const reducedMotionStyles = await page.evaluate(() => {
      const htmlStyle = window.getComputedStyle(document.documentElement);

      const skipStyle = window.getComputedStyle(
        document.querySelector(".skip-link") ?? document.body
      );

      const chevronEl = document.querySelector(".gf-disclosure-chevron");

      const chevronStyle = chevronEl
        ? window.getComputedStyle(chevronEl)
        : null;

      return {
        chevronTransition: chevronStyle?.transitionDuration ?? "0s",
        scrollBehavior: htmlStyle.scrollBehavior,
        skipTransition: skipStyle.transitionDuration,
      };
    });

    expect(reducedMotionStyles.scrollBehavior).toBe("auto");
    expect(
      parseCssDurationMs(reducedMotionStyles.skipTransition)
    ).toBeLessThanOrEqual(1);
    expect(
      parseCssDurationMs(reducedMotionStyles.chevronTransition)
    ).toBeLessThanOrEqual(1);

    await page.goto("/give");

    const panelAnimationDuration = await page.evaluate(() => {
      const panel = document.querySelector(".gf-tab-panel:not([hidden])");

      return panel ? window.getComputedStyle(panel).animationDuration : "0s";
    });

    expect(parseCssDurationMs(panelAnimationDuration)).toBeLessThanOrEqual(1);
  });

  test("preserves visible keyboard focus outlines, pure B&W print ink under dark OS, and equal desktop column baselines @a11y", async ({
    page,
  }) => {
    await page.setViewportSize({ height: 900, width: 1280 });
    await page.goto("/");

    const primaryCta = page
      .getByRole("link", { name: "Give to Global Fellowship" })
      .first();

    await primaryCta.focus();

    const outlineInfo = await primaryCta.evaluate((el) => {
      const style = window.getComputedStyle(el);

      return {
        outlineStyle: style.outlineStyle,
        outlineWidth: Number(style.outlineWidth.replace("px", "")),
      };
    });

    expect(outlineInfo.outlineStyle).not.toBe("none");
    expect(outlineInfo.outlineWidth).toBeGreaterThanOrEqual(2);

    const homePillarTops = await page
      .locator("#three-pillars h3")
      .evaluateAll((els) => els.map((el) => el.getBoundingClientRect().top));

    expect(homePillarTops).toHaveLength(3);
    const homeFirstTop = homePillarTops[0] ?? 0;

    for (const top of homePillarTops) {
      expect(Math.abs(top - homeFirstTop)).toBeLessThanOrEqual(1);
    }

    await page.goto("/mission-and-values");

    const missionPillarTops = await page
      .locator("#three-pillars h3")
      .evaluateAll((els) => els.map((el) => el.getBoundingClientRect().top));

    expect(missionPillarTops).toHaveLength(3);
    const missionFirstTop = missionPillarTops[0] ?? 0;

    for (const top of missionPillarTops) {
      expect(Math.abs(top - missionFirstTop)).toBeLessThanOrEqual(1);
    }

    await page.goto("/");
    await page.emulateMedia({ colorScheme: "dark", media: "screen" });

    const darkRoles = await page.evaluate(() => {
      const style = window.getComputedStyle(document.documentElement);

      return {
        clay: style.getPropertyValue("--gf-clay-token").trim(),
        primary: style.getPropertyValue("--primary").trim(),
      };
    });

    expect(darkRoles.primary.length).toBeGreaterThan(0);
    expect(darkRoles.clay.length).toBeGreaterThan(0);
    expect(darkRoles.primary).not.toBe(darkRoles.clay);

    await page.goto("/pray");
    await page.emulateMedia({ colorScheme: "dark", media: "print" });

    const printTokens = await page.evaluate(() => {
      const style = window.getComputedStyle(document.documentElement);

      return {
        apricot: style.getPropertyValue("--gf-apricot-token").trim(),
        background: style.getPropertyValue("--background").trim(),
        foreground: style.getPropertyValue("--foreground").trim(),
        primaryFg: style.getPropertyValue("--primary-foreground").trim(),
      };
    });

    expect(["#fff", "#ffffff", "rgb(255, 255, 255)"]).toContain(
      printTokens.background
    );
    expect(["#000", "#000000", "rgb(0, 0, 0)"]).toContain(
      printTokens.foreground
    );
    expect(["#000", "#000000", "rgb(0, 0, 0)"]).toContain(printTokens.apricot);
    expect(["#fff", "#ffffff", "rgb(255, 255, 255)"]).toContain(
      printTokens.primaryFg
    );
  });

  for (const sample of BANNER_CONTRAST_SAMPLES) {
    test(`enforces >= 4.5:1 rendered-pixel contrast behind photo-banner eyebrows on ${sample.label} @a11y`, async ({
      page,
    }) => {
      await page.setViewportSize({
        height: sample.height,
        width: sample.width,
      });
      await page.emulateMedia({ colorScheme: "light" });
      await page.goto(sample.route, { waitUntil: "networkidle" });

      const eyebrows = page.locator(
        ".gf-cinema-frame .gf-eyebrow, .gf-cinema-frame [data-gf-banner-label='true']"
      );

      const count = await eyebrows.count();

      if (sample.route !== "/") {
        expect(count).toBeGreaterThan(0);
      }

      const indices = Array.from({ length: count }, (_unused, index) => index);

      const fgColors = await Promise.all(
        indices.map(
          async (index) =>
            await eyebrows
              .nth(index)
              .evaluate((el) => window.getComputedStyle(el).color)
        )
      );

      // Hide kicker ink while sampling so unboxed kickers measure the true rendered
      // photo/scrim backdrop directly behind the glyphs (matching interior checks below).
      await page.evaluate(() => {
        for (const el of document.querySelectorAll<HTMLElement>(
          ".gf-cinema-frame .gf-eyebrow, .gf-cinema-frame [data-gf-banner-label='true']"
        )) {
          el.style.color = "transparent";
          el.style.textShadow = "none";
        }
      });

      const pngs = await Promise.all(
        indices.map(
          async (index) =>
            await eyebrows.nth(index).screenshot({ animations: "disabled" })
        )
      );

      await page.evaluate(() => {
        for (const el of document.querySelectorAll<HTMLElement>(
          ".gf-cinema-frame .gf-eyebrow, .gf-cinema-frame [data-gf-banner-label='true']"
        )) {
          el.style.color = "";
          el.style.textShadow = "";
        }
      });

      const ratios = await Promise.all(
        indices.map(
          async (index) =>
            await measurePixelContrast(
              page,
              fgColors[index] ?? "rgb(213, 176, 130)",
              pngs[index],
              "interior"
            )
        )
      );

      for (const ratio of ratios) {
        expect(ratio).toBeGreaterThanOrEqual(4.5);
      }

      if (sample.route === "/") {
        const headline = page.locator("#home-hero-heading");

        const headlineFg = await headline.evaluate(
          (el) => window.getComputedStyle(el).color
        );

        await headline.evaluate((el) => {
          if (el instanceof HTMLElement) {
            el.style.color = "transparent";
            el.style.textShadow = "none";
          }
        });

        const headlinePng = await headline.screenshot({
          animations: "disabled",
        });

        await headline.evaluate((el) => {
          if (el instanceof HTMLElement) {
            el.style.color = "";
            el.style.textShadow = "";
          }
        });

        const headlineRatio = await measurePixelContrast(
          page,
          headlineFg,
          headlinePng
        );

        expect(headlineRatio).toBeGreaterThanOrEqual(3.5);
      }
    });
  }

  for (const viewport of [
    { height: 900, label: "1440px desktop", width: 1440 },
    { height: 900, label: "1280px desktop", width: 1280 },
    { height: 844, label: "390px mobile", width: 390 },
  ]) {
    test(`enforces >= 4.5:1 rendered-pixel contrast behind Our People 'One family.' title at ${viewport.label} @a11y`, async ({
      page,
    }) => {
      await page.setViewportSize({
        height: viewport.height,
        width: viewport.width,
      });
      await page.emulateMedia({ colorScheme: "light" });
      await page.goto("/our-people", { waitUntil: "networkidle" });

      const title = page.locator('[data-gf-depth-title="true"] p').first();

      const fgColor = await title.evaluate(
        (el) => window.getComputedStyle(el).color
      );

      // Measure the exact rendered Layer 0 + Layer 0.5 backdrop directly behind the centered glyphs
      // (without sampling the ivory letter ink itself or the foreground Layer 2 people cutout).
      await page.evaluate(() => {
        const el = document.querySelector<HTMLElement>(
          '[data-gf-depth-title="true"] p'
        );

        const cutout = document.querySelector<HTMLElement>(
          '[data-gf-layered-hero] img[data-gf-cutout="true"]'
        );

        if (el !== null) {
          el.style.color = "transparent";
          el.style.textShadow = "none";
        }

        if (cutout !== null) {
          cutout.style.visibility = "hidden";
        }
      });

      const png = await title.screenshot({ animations: "disabled" });

      await page.evaluate(() => {
        const el = document.querySelector<HTMLElement>(
          '[data-gf-depth-title="true"] p'
        );

        const cutout = document.querySelector<HTMLElement>(
          '[data-gf-layered-hero] img[data-gf-cutout="true"]'
        );

        if (el !== null) {
          el.style.color = "";
          el.style.textShadow = "";
        }

        if (cutout !== null) {
          cutout.style.visibility = "";
        }
      });

      const ratio = await measurePixelContrast(page, fgColor, png, "interior");

      expect(ratio).toBeGreaterThanOrEqual(4.5);
    });
  }

  test("surfaces Open roles filters and first role card immediately above the fold on desktop and 390px mobile @a11y", async ({
    page,
  }) => {
    await page.setViewportSize({ height: 900, width: 1440 });
    await page.emulateMedia({ colorScheme: "light" });
    await page.goto("/opportunities", { waitUntil: "networkidle" });

    const heading = page.getByRole("heading", {
      level: 1,
      name: "Open roles",
    });

    const firstRole = page.getByRole("heading", {
      name: "Church Planter in Slovenia",
    });

    const [headingBox, firstRoleBox] = await Promise.all([
      heading.boundingBox(),
      firstRole.boundingBox(),
    ]);

    expect(headingBox).not.toBeNull();
    expect(firstRoleBox).not.toBeNull();
    expect(
      (firstRoleBox?.y ?? 9999) + (firstRoleBox?.height ?? 0)
    ).toBeLessThanOrEqual(900);

    // Verify 390x844 mobile keeps the filter rail on one crisp row and surfaces the first role title above the fold
    await page.setViewportSize({ height: 844, width: 390 });
    await page.goto("/opportunities", { waitUntil: "networkidle" });

    const [mobileFilterBox, mobileFirstRoleBox] = await Promise.all([
      page
        .getByRole("radiogroup", { name: "Filter open roles by category" })
        .boundingBox(),
      page
        .getByRole("heading", { name: "Church Planter in Slovenia" })
        .boundingBox(),
    ]);

    expect(mobileFilterBox).not.toBeNull();
    expect(mobileFilterBox?.height ?? 999).toBeLessThanOrEqual(64);
    expect(mobileFirstRoleBox).not.toBeNull();
    expect(
      (mobileFirstRoleBox?.y ?? 9999) + (mobileFirstRoleBox?.height ?? 0)
    ).toBeLessThanOrEqual(844);
  });

  test("operates mobile SectionScrollspy via @ui-sdk/react/collapsible with Escape focus return and destination heading focus handoff @a11y", async ({
    page,
  }) => {
    await page.setViewportSize({ height: 844, width: 390 });
    await page.emulateMedia({ colorScheme: "light" });
    await page.goto("/churches", { waitUntil: "networkidle" });

    const trigger = page.getByRole("button", { name: /On this page/iu });

    await expect(trigger).toBeVisible();
    await expect(trigger).toHaveAttribute("aria-expanded", "false");
    await expect(trigger).toContainText("Jump to a section");

    await trigger.click();
    await expect(trigger).toHaveAttribute("aria-expanded", "true");

    const tripsLink = page.getByRole("link", { name: "Exposure Trips" });

    await expect(tripsLink).toBeVisible();
    await tripsLink.focus();
    await page.keyboard.press("Escape");
    await expect(trigger).toHaveAttribute("aria-expanded", "false");
    await expect(trigger).toBeFocused();

    await trigger.click();
    await page.getByRole("link", { name: "Exposure Trips" }).click();
    await expect(trigger).toHaveAttribute("aria-expanded", "false");
    await expect(page.locator("#exposure-trips-heading")).toBeFocused();
  });

  for (const subnavRoute of [
    "/mission-and-values",
    "/how-we-work",
    "/our-people",
    "/stories",
    "/contact",
    "/opportunities",
    "/serve-across-cultures",
    "/churches",
  ]) {
    test(`keeps mobile SectionSubnav single-row and centers active item in view on ${subnavRoute} @a11y`, async ({
      browserName,
      page,
    }) => {
      await page.setViewportSize({ height: 844, width: 390 });
      await page.goto(subnavRoute, { waitUntil: "networkidle" });

      const metrics = await page.evaluate(() => {
        const wrap = document.querySelector<HTMLElement>(".gf-subnav-wrap");
        const nav = document.querySelector<HTMLElement>("nav.gf-subnav-rail");

        const active = nav?.querySelector<HTMLElement>('[aria-current="page"]');

        if (!(wrap && nav && active)) {
          return {
            activeHeight: 0,
            activeInViewport: false,
            centerDeltaPx: 999,
            hasFadeCue: false,
            navHeight: 999,
            windowScrollY: window.scrollY,
          };
        }

        const navRect = nav.getBoundingClientRect();
        const activeRect = active.getBoundingClientRect();
        const maxScroll = Math.max(0, nav.scrollWidth - nav.clientWidth);

        const desiredScrollLeft = Math.max(
          0,
          Math.min(
            active.offsetLeft - (nav.clientWidth - active.clientWidth) / 2,
            maxScroll
          )
        );

        const fadeLeft = wrap.dataset.fadeLeft === "true";
        const fadeRight = wrap.dataset.fadeRight === "true";

        return {
          activeHeight: activeRect.height,
          activeInViewport:
            activeRect.left >= navRect.left - 2 &&
            activeRect.right <= navRect.right + 2,
          centerDeltaPx: Math.abs(nav.scrollLeft - desiredScrollLeft),
          hasFadeCue: maxScroll <= 2 || fadeLeft || fadeRight,
          navHeight: navRect.height,
          windowScrollY: window.scrollY,
        };
      });

      expect(metrics.navHeight).toBeLessThanOrEqual(68);
      expect(metrics.activeHeight).toBeGreaterThanOrEqual(44);
      expect(metrics.activeInViewport).toBe(true);
      expect(metrics.centerDeltaPx).toBeLessThanOrEqual(2);
      expect(metrics.hasFadeCue).toBe(true);
      expect(metrics.windowScrollY).toBe(0);

      // Verify full keyboard Tab traversal across every link in the rail at 320px narrow mobile
      await page.setViewportSize({ height: 844, width: 320 });

      const railLinks = page.locator("nav.gf-subnav-rail a");
      const linkCount = await railLinks.count();

      expect(linkCount).toBeGreaterThanOrEqual(3);
      await railLinks.first().focus();

      // Safari/WebKit requires Option+Tab (Alt+Tab) to move focus across <a href> links
      const tabKey = browserName === "webkit" ? "Alt+Tab" : "Tab";

      const verifyRailTabStep = async (remaining: number): Promise<boolean> => {
        if (remaining <= 0) {
          return true;
        }

        await page.keyboard.press(tabKey);

        const focusedVisible = await page.evaluate(() => {
          const nav = document.querySelector<HTMLElement>("nav.gf-subnav-rail");
          const focused = document.activeElement;

          if (
            !(nav && focused instanceof HTMLElement && nav.contains(focused))
          ) {
            return false;
          }

          const navRect = nav.getBoundingClientRect();
          const focusRect = focused.getBoundingClientRect();

          return (
            focusRect.left >= navRect.left - 2 &&
            focusRect.right <= navRect.right + 2
          );
        });

        if (!focusedVisible) {
          return false;
        }

        return await verifyRailTabStep(remaining - 1);
      };

      const allFocusedVisible = await verifyRailTabStep(linkCount - 1);

      expect(allFocusedVisible).toBe(true);
    });
  }

  for (const check of [
    {
      height: 900,
      label: "Home 1440px",
      route: "/",
      scrollY: 650,
      width: 1440,
    },
    { height: 844, label: "Home 390px", route: "/", scrollY: 450, width: 390 },
    {
      height: 844,
      label: "Opportunities 390px",
      route: "/opportunities",
      scrollY: 405,
      width: 390,
    },
  ] as const) {
    test(`keeps sticky header on top of layered heroes and pills during scroll on ${check.label} @a11y`, async ({
      page,
    }) => {
      await page.setViewportSize({ height: check.height, width: check.width });
      await page.goto(check.route, { waitUntil: "networkidle" });
      await page.evaluate((y) => {
        window.scrollTo({ behavior: "instant", top: y });
      }, check.scrollY);
      await expect
        .poll(async () => await page.evaluate(() => window.scrollY))
        .toBeGreaterThanOrEqual(check.scrollY - 2);

      const headerWinsAllControls = await page.evaluate(() => {
        const header = document.querySelector("header");

        if (header === null) {
          return false;
        }

        const targets = [
          ...header.querySelectorAll<HTMLElement>("a, button"),
        ].filter((el) => {
          const rect = el.getBoundingClientRect();

          return rect.width > 4 && rect.height > 4;
        });

        if (targets.length === 0) {
          return false;
        }

        return targets.every((el) => {
          const rect = el.getBoundingClientRect();
          const cx = rect.left + rect.width / 2;
          const cy = rect.top + rect.height / 2;
          const topEl = document.elementFromPoint(cx, cy);

          return topEl !== null && header.contains(topEl);
        });
      });

      expect(
        headerWinsAllControls,
        `Sticky header unobstructed on ${check.route} at ${String(check.width)}px`
      ).toBe(true);
    });
  }

  for (const viewport of [
    { height: 900, label: "1280px", width: 1280 },
    { height: 900, label: "1440px", width: 1440 },
  ]) {
    for (const target of LAYERED_OVERLAP_ROUTES) {
      test(`verifies real Layer 2 foreground cutout overlap and legibility on ${target.label} at ${viewport.label} @a11y`, async ({
        page,
      }) => {
        await page.setViewportSize({
          height: viewport.height,
          width: viewport.width,
        });
        await page.emulateMedia({ colorScheme: "light" });
        await page.goto(target.route, { waitUntil: "networkidle" });

        const frameCount = await page.locator("[data-gf-layered-hero]").count();

        expect(frameCount).toBeGreaterThanOrEqual(target.expectedMinFrames);

        const measurements = await page
          .locator("[data-gf-layered-hero]")
          .evaluateAll(async (elements) => {
            const frames = elements.filter(
              (el): el is HTMLElement => el instanceof HTMLElement
            );

            return await Promise.all(
              frames.map(async (frame) => {
                const id = frame.dataset.gfLayeredHero ?? "unknown";

                const cutout = frame.querySelector<HTMLImageElement>(
                  'img[data-gf-cutout="true"]'
                );

                const titleWrap = frame.querySelector<HTMLElement>(
                  '[data-gf-depth-title="true"]'
                );

                const textTarget =
                  titleWrap?.querySelector<HTMLElement>("h1") ??
                  titleWrap?.querySelector<HTMLElement>("p:last-of-type") ??
                  titleWrap;

                if (!(cutout && textTarget)) {
                  return { id, loaded: false, overlapRatio: 0 };
                }

                cutout.loading = "eager";

                try {
                  await cutout.decode();
                } catch {
                  // Measure naturalWidth below cleanly
                }

                if (!cutout.complete || cutout.naturalWidth === 0) {
                  return { id, loaded: false, overlapRatio: 0 };
                }

                const frameRect = frame.getBoundingClientRect();

                const childSpans = [
                  ...textTarget.querySelectorAll<HTMLElement>(":scope > span"),
                ];

                const measureTargets = textTarget.classList.contains(
                  "justify-between"
                )
                  ? childSpans
                  : [textTarget];

                const canvas = document.createElement("canvas");

                canvas.width = Math.max(1, Math.round(frameRect.width));
                canvas.height = Math.max(1, Math.round(frameRect.height));

                const ctx = canvas.getContext("2d", {
                  willReadFrequently: true,
                });

                if (ctx === null) {
                  return { id, loaded: false, overlapRatio: 0 };
                }

                const scale = Math.max(
                  canvas.width / cutout.naturalWidth,
                  canvas.height / cutout.naturalHeight
                );

                const drawW = cutout.naturalWidth * scale;
                const drawH = cutout.naturalHeight * scale;

                const [rawX = "50%", rawY = "50%"] = window
                  .getComputedStyle(cutout)
                  .objectPosition.trim()
                  .split(/\s+/u);

                const posX = Number(rawX.replace("%", "")) / 100;
                const posY = Number(rawY.replace("%", "")) / 100;

                ctx.drawImage(
                  cutout,
                  (canvas.width - drawW) * posX,
                  (canvas.height - drawH) * posY,
                  drawW,
                  drawH
                );

                let opaque = 0;
                let total = 0;

                for (const boxEl of measureTargets) {
                  const textRect = boxEl.getBoundingClientRect();

                  const rx = Math.max(
                    0,
                    Math.floor(textRect.left - frameRect.left)
                  );

                  const ry = Math.max(
                    0,
                    Math.floor(textRect.top - frameRect.top)
                  );

                  const rw = Math.max(
                    1,
                    Math.min(canvas.width - rx, Math.ceil(textRect.width))
                  );

                  const rh = Math.max(
                    1,
                    Math.min(canvas.height - ry, Math.ceil(textRect.height))
                  );

                  const pixels = ctx.getImageData(rx, ry, rw, rh).data;

                  total += rw * rh;

                  for (let i = 3; i < pixels.length; i += 4) {
                    opaque += Number(pixels[i] >= 180);
                  }
                }

                return {
                  id,
                  loaded: true,
                  overlapRatio: opaque / Math.max(1, total),
                };
              })
            );
          });

        for (const measurement of measurements) {
          expect(
            measurement.loaded,
            `Cutout loaded for ${measurement.id}`
          ).toBe(true);
          const minOverlap = measurement.id === "GF-LIVE-23" ? -1 : 0.002;
          const maxOverlap = measurement.id === "GF-LIVE-23" ? 0.002 : 0.3;

          expect(
            measurement.overlapRatio,
            `Foreground overlap > ${String(minOverlap * 100)}% on ${measurement.id}`
          ).toBeGreaterThan(minOverlap);
          expect(
            measurement.overlapRatio,
            `Foreground overlap < ${String(maxOverlap * 100)}% for legibility on ${measurement.id}`
          ).toBeLessThan(maxOverlap);
        }
      });
    }
  }

  test("keeps Home Himalayan gable strictly clear of H1 letter stems across 12 continuous desktop widths (1024px to 1920px) @a11y", async ({
    page,
  }) => {
    const widths = [
      1024, 1100, 1150, 1180, 1194, 1220, 1280, 1366, 1440, 1536, 1600, 1920,
    ] as const;

    await page.emulateMedia({ colorScheme: "light" });
    await page.setViewportSize({ height: 900, width: 1280 });
    await page.goto("/", { waitUntil: "networkidle" });

    const checkWidthAtIndex = async (
      idx: number
    ): Promise<
      readonly {
        readonly loaded: boolean;
        readonly stemOverlapRatio: number;
        readonly totalOverlapRatio: number;
        readonly width: number;
      }[]
    > => {
      const width = widths[idx];

      if (width === undefined) {
        return [];
      }

      await page.setViewportSize({ height: 900, width });

      const result = await page.evaluate(async () => {
        const frame = document.querySelector<HTMLElement>(
          '[data-gf-layered-hero="GF-LIVE-20"]'
        );

        const cutout = frame?.querySelector<HTMLImageElement>(
          'img[data-gf-cutout="true"]'
        );

        const h1 = document.querySelector<HTMLElement>("#home-hero-heading");

        if (!(frame && cutout && h1)) {
          return { loaded: false, stemOverlapRatio: 1, totalOverlapRatio: 1 };
        }

        cutout.loading = "eager";

        try {
          await cutout.decode();
        } catch {
          // Checked via naturalWidth below
        }

        if (!cutout.complete || cutout.naturalWidth === 0) {
          return { loaded: false, stemOverlapRatio: 1, totalOverlapRatio: 1 };
        }

        const frameRect = frame.getBoundingClientRect();
        const h1Rect = h1.getBoundingClientRect();
        const canvas = document.createElement("canvas");

        canvas.width = Math.max(1, Math.round(frameRect.width));
        canvas.height = Math.max(1, Math.round(frameRect.height));

        const ctx = canvas.getContext("2d", { willReadFrequently: true });

        if (ctx === null) {
          return { loaded: false, stemOverlapRatio: 1, totalOverlapRatio: 1 };
        }

        const scale = Math.max(
          canvas.width / cutout.naturalWidth,
          canvas.height / cutout.naturalHeight
        );

        const drawW = cutout.naturalWidth * scale;
        const drawH = cutout.naturalHeight * scale;

        const [rawX = "50%", rawY = "0%"] = window
          .getComputedStyle(cutout)
          .objectPosition.trim()
          .split(/\s+/u);

        const posX = Number(rawX.replace("%", "")) / 100;
        const posY = Number(rawY.replace("%", "")) / 100;

        ctx.drawImage(
          cutout,
          (canvas.width - drawW) * posX,
          (canvas.height - drawH) * posY,
          drawW,
          drawH
        );

        const rx = Math.max(0, Math.floor(h1Rect.left - frameRect.left));
        const ry = Math.max(0, Math.floor(h1Rect.top - frameRect.top));

        const rw = Math.max(
          1,
          Math.min(canvas.width - rx, Math.ceil(h1Rect.width))
        );

        const rh = Math.max(
          1,
          Math.min(canvas.height - ry, Math.ceil(h1Rect.height))
        );

        // Upper 88% covers all ascenders, x-heights, and foot serifs above the empty descender band
        const stemHeight = Math.max(1, Math.floor(rh * 0.88));
        const pixels = ctx.getImageData(rx, ry, rw, rh).data;
        let stemOpaque = 0;
        let totalOpaque = 0;

        for (let row = 0; row < rh; row += 1) {
          for (let col = 0; col < rw; col += 1) {
            const alpha = pixels[(row * rw + col) * 4 + 3] ?? 0;

            if (alpha >= 180) {
              totalOpaque += 1;

              if (row < stemHeight) {
                stemOpaque += 1;
              }
            }
          }
        }

        return {
          loaded: true,
          stemOverlapRatio: stemOpaque / Math.max(1, rw * stemHeight),
          totalOverlapRatio: totalOpaque / Math.max(1, rw * rh),
        };
      });

      const rest = await checkWidthAtIndex(idx + 1);

      return [{ ...result, width }, ...rest];
    };

    const results = await checkWidthAtIndex(0);

    for (const result of results) {
      expect(result.loaded, `Cutout loaded at ${String(result.width)}px`).toBe(
        true
      );
      expect(
        result.stemOverlapRatio,
        `Zero glyph stem occlusion at ${String(result.width)}px (got ${(result.stemOverlapRatio * 100).toFixed(3)}%)`
      ).toBeLessThanOrEqual(0.0005);
      expect(
        result.totalOverlapRatio,
        `Total H1 overlap restrained at ${String(result.width)}px`
      ).toBeLessThan(0.01);
    }
  });

  for (const route of NARROW_VIEWPORT_ROUTES) {
    test(`avoids horizontal overflow at 320px viewport on ${route} @a11y`, async ({
      page,
    }) => {
      await page.setViewportSize({ height: 640, width: 320 });
      await page.goto(route);

      const hasOverflow = await page.evaluate(
        () => document.documentElement.scrollWidth > window.innerWidth
      );

      expect(hasOverflow).toBe(false);

      if (route === "/give") {
        const tabBounds = await page
          .locator('[role="tab"]')
          .evaluateAll((els) =>
            els.map((el) => {
              const rect = el.getBoundingClientRect();

              return { left: rect.left, right: rect.right };
            })
          );

        expect(tabBounds).toHaveLength(4);

        for (const box of tabBounds) {
          expect(box.left).toBeGreaterThanOrEqual(0);
          expect(box.right).toBeLessThanOrEqual(320);
        }
      }
    });
  }
});
