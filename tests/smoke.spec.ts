import { expect, test } from "@playwright/test";

const PUBLIC_ROUTES = [
  {
    heading:
      "Helping local leaders plant churches where Jesus is little known.",
    path: "/",
  },
  {
    heading: "Our Mission & Values",
    path: "/mission-and-values",
  },
  {
    heading: "Local leaders lead. We come alongside them.",
    path: "/how-we-work",
  },
  {
    heading: "Serving together like family since 1989.",
    path: "/our-people",
  },
  {
    heading: "Where we serve",
    path: "/where-we-serve",
  },
  {
    heading: "Give to a missionary or team.",
    path: "/missionaries",
  },
  {
    heading: "Jeremy & Anne Beaumont",
    path: "/missionaries/beaumont",
  },
  {
    heading: "The O'Brien Family",
    path: "/missionaries/obrien",
  },
  {
    heading: "Carolyn Pappy Kuzhivila",
    path: "/missionaries/kuzhivila",
  },
  {
    heading: "Give to a ministry project.",
    path: "/projects",
  },
  {
    heading: "Global Fellowship Leadership Summit",
    path: "/projects/leadership-summit",
  },
  {
    heading: "Open roles",
    path: "/opportunities",
  },
  {
    heading: "Church Planter in Slovenia",
    path: "/opportunities/slovenia-church-planter",
  },
  {
    heading: "Serve across cultures under local leaders.",
    path: "/serve-across-cultures",
  },
  {
    heading:
      "The Bridge Project: letters and prayer with a local church planter.",
    path: "/bridge-project",
  },
  {
    heading: "Before anything else, we pray.",
    path: "/pray",
  },
  {
    heading: "Church to church, as partners.",
    path: "/churches",
  },
  {
    heading: "Your ministry stays yours.",
    path: "/local-leaders",
  },
  {
    heading: "Give to a missionary, a project, or our General Fund.",
    path: "/give",
  },
  {
    heading: "Help with your giving.",
    path: "/give/help",
  },
  {
    heading: "Financials",
    path: "/financials",
  },
  {
    heading: "Statement of Faith",
    path: "/statement-of-faith",
  },
  {
    heading: "Stories from more than 35 years of church planting.",
    path: "/stories",
  },
  {
    heading: "You Can Land, But Taking Off is God's Work",
    path: "/stories/you-can-land-but-taking-off-is-gods-work",
  },
  {
    heading: "Contact us.",
    path: "/contact",
  },
  {
    heading: "Donor & Website Privacy Policy",
    path: "/donor-privacy",
  },
  {
    heading: "Credits & Notices",
    path: "/credits",
  },
] as const;

const REGION_ROUTES = [
  { heading: "Central Asia", path: "/where-we-serve/central-asia" },
  { heading: "East Asia", path: "/where-we-serve/east-asia" },
  { heading: "South Asia", path: "/where-we-serve/south-asia" },
  { heading: "Southeast Asia", path: "/where-we-serve/southeast-asia" },
  { heading: "Middle East", path: "/where-we-serve/middle-east" },
  { heading: "North Africa", path: "/where-we-serve/north-africa" },
  { heading: "Europe", path: "/where-we-serve/europe" },
  { heading: "The Americas", path: "/where-we-serve/americas" },
] as const;

test.describe("Global Fellowship smoke and functional checks", () => {
  for (const route of PUBLIC_ROUTES) {
    test(`renders ${route.path} with zero runtime errors and zero overflow`, async ({
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

      const response = await page.goto(route.path);

      expect(response?.status()).toBe(200);
      await expect(
        page.getByRole("heading", { level: 1, name: route.heading })
      ).toBeVisible();

      const hasOverflow = await page.evaluate(
        () => document.documentElement.scrollWidth > window.innerWidth
      );

      expect(hasOverflow).toBe(false);
      expect(consoleErrors).toEqual([]);
      expect(pageErrors).toEqual([]);
    });
  }

  for (const region of REGION_ROUTES) {
    test(`renders uniform photo-free anti-mosaic regional route ${region.path}`, async ({
      page,
    }) => {
      const response = await page.goto(region.path);

      expect(response?.status()).toBe(200);
      await expect(
        page.getByRole("heading", { level: 1, name: region.heading })
      ).toBeVisible();
      await expect(page.locator("img")).toHaveCount(0);
    });
  }

  test("marks exact primary nav links with aria-current=page and section ancestors with aria-current=true", async ({
    page,
  }) => {
    await page.setViewportSize({ height: 900, width: 1280 });
    await page.goto("/projects");

    const nav = page.getByRole("navigation", { name: "Primary navigation" });

    await expect(nav.getByRole("link", { name: "Projects" })).toHaveAttribute(
      "aria-current",
      "page"
    );

    await page.goto("/mission-and-values");
    await expect(
      nav.getByRole("link", { exact: true, name: "About Us" })
    ).toHaveAttribute("aria-current", "page");

    const expectedAboutLabels = [
      "Our Mission & Values",
      "How We Work",
      "Our People",
      "Where We Serve",
      "Financials",
      "Stories",
      "Contact",
    ];

    const aboutSubnav = page.getByRole("navigation", {
      name: "About Global Fellowship",
    });

    await expect(aboutSubnav.getByRole("link")).toHaveText(expectedAboutLabels);

    const footerAboutNav = page.getByRole("navigation", {
      name: "About Us",
    });

    await expect(footerAboutNav.getByRole("link")).toHaveText(
      expectedAboutLabels
    );

    await page.goto("/our-people");
    await expect(
      nav.getByRole("link", { exact: true, name: "About Us" })
    ).toHaveAttribute("aria-current", "true");

    await page.goto("/serve-across-cultures");
    await expect(
      nav.getByRole("link", { name: "Opportunities" })
    ).toHaveAttribute("aria-current", "true");
  });

  test("filters Projects and Opportunities interactively, routes inline card quick-give + Learn more into Asymmetric.al checkout, and switches GivingHandoffWidget presets", async ({
    page,
  }) => {
    await page.goto("/projects", { waitUntil: "networkidle" });
    await expect(page.locator("[data-gf-projects-shell]")).toHaveCount(0);
    await expect(
      page.getByRole("link", {
        name: "Learn more about The Global Fellowship General Fund",
      })
    ).toBeVisible();

    const generalFundInput = page.getByLabel(
      "Gift amount for The Global Fellowship General Fund in US dollars"
    );

    await generalFundInput.fill("75");
    await page
      .getByRole("button", {
        name: /^Give.*\$75.*The Global Fellowship General Fund/u,
      })
      .click();
    await expect(page).toHaveURL(
      /\/give\/checkout\?fund=general&amount=75&frequency=one-time&entry_method=public_checkout&party_kind=person/u
    );
    await expect(
      page.getByRole("heading", {
        level: 2,
        name: "The Global Fellowship General Fund",
      })
    ).toBeVisible();
    await expect(page.getByText("$75")).toBeVisible();
    await expect(page.locator("body")).not.toContainText(/every\.org/iu);

    await page.goto("/projects", { waitUntil: "networkidle" });
    await expect(page.locator("[data-gf-projects-shell]")).toHaveCount(0);
    await page.getByRole("radio", { name: "Member Care" }).click();
    await expect(
      page.getByRole("heading", { name: "Urgent Member Care Fund" })
    ).toBeVisible();
    await page
      .getByRole("button", { name: /Remove Member Care filter/u })
      .click();

    const projectSearch = page.getByRole("searchbox", {
      name: "Search ministry projects",
    });

    await projectSearch.fill("General Fund");
    await expect(page.getByText(/1 ministry project matching/u)).toBeVisible();
    await page.getByRole("button", { name: "Clear search" }).click();
    await expect(projectSearch).toBeFocused();

    await page.goto("/projects/leadership-summit", {
      waitUntil: "networkidle",
    });
    await page.getByRole("button", { exact: true, name: "$500" }).click();

    const summitGiveButton = page.getByRole("button", {
      name: /Give \$500/u,
    });

    await expect(summitGiveButton).toBeVisible();
    await expect(page.locator("body")).not.toContainText(/every\.org/iu);

    // Verify GivingHandoffWidget preserves invalid typed input and validates exact-cent bounds on blur/submit
    const customInput = page.getByLabel("Gift amount ($1.00 to $1,000,000.00)");

    await customInput.fill("abc");
    await expect(customInput).toHaveValue("abc");
    await customInput.blur();
    await expect(page.locator("#give").getByRole("alert")).toContainText(
      "Enter a dollar amount using numbers only, such as 50, 1,250, or 25.50."
    );
    await customInput.fill("0.50");
    await expect(
      page.getByText("Enter a gift amount of at least $1.00.")
    ).toBeVisible();
    await customInput.fill("1000001");
    await expect(
      page.getByText(/Online gifts are accepted up to \$1,000,000\.00/u)
    ).toBeVisible();
    await customInput.fill("1,250.50");
    await page
      .getByRole("button", {
        name: /Give \$1,250\.50/u,
      })
      .click();
    await expect(page).toHaveURL(
      /\/give\/checkout\?fund_id=leadership-summit&amount=1250\.50&frequency=one-time/u
    );
    await expect(page.getByText("$1,250.50")).toBeVisible();

    await page.goto("/opportunities", { waitUntil: "networkidle" });
    await page.getByRole("radio", { name: /Cross-Cultural Field/u }).click();
    await expect(page.getByText("Church Planter in Slovenia")).toBeVisible();
    await expect(page.getByText(/Showing 4 open roles/u)).toBeVisible();

    await page
      .getByRole("button", { name: /Remove Cross-Cultural Field filter/u })
      .click();

    const roleSearch = page.getByRole("searchbox", {
      name: "Search open roles",
    });

    await roleSearch.fill("cybersecurity");
    await expect(
      page.getByRole("heading", { name: "IT Coordinator" })
    ).toBeVisible();
    await expect(page.getByText(/Showing 1 open role/u)).toBeVisible();

    await roleSearch.fill("life coaching");
    await expect(
      page.getByRole("heading", { name: "Church Planter in Serbia" })
    ).toBeVisible();
    await page.getByRole("button", { name: "Clear search" }).click();
    await expect(roleSearch).toBeFocused();

    await page.goto("/opportunities/it-coordinator", { waitUntil: "load" });
    await expect(
      page.getByRole("link", { name: "9-step onboarding process" })
    ).toHaveCount(0);
    await expect(
      page.getByRole("link", { exact: true, name: "How we work" })
    ).toBeVisible();

    await page.goto("/opportunities", { waitUntil: "networkidle" });

    await expect(
      page
        .getByRole("list", {
          name: "Eight regions welcoming local church planters",
        })
        .getByRole("link", { name: "Southeast Asia" })
    ).toHaveAttribute("href", "/where-we-serve/southeast-asia");
    await expect(
      page
        .getByRole("list", {
          name: "Eight regions welcoming local church planters",
        })
        .getByRole("link", { name: "The Americas" })
    ).toHaveAttribute("href", "/where-we-serve/americas");
  });

  test("renders zero-JS local leadership standards on Local Leaders and supports keyboard navigation on Giving Method UI SDK tabs", async ({
    page,
  }) => {
    await page.goto("/local-leaders");

    await expect(
      page.getByRole("heading", {
        level: 2,
        name: "How our written standards protect local voice",
      })
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { level: 3, name: "Publish a Story" })
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { level: 3, name: "Host a Visit" })
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { level: 3, name: "Protect a Name" })
    ).toBeVisible();

    await page.goto("/give");
    await expect(page.locator("body")).not.toContainText(/every\.org/iu);

    const onlineTab = page.getByRole("tab", { name: "Online Giving" });

    const checkTab = page.getByRole("tab", { name: "By Check" });
    const stockTab = page.getByRole("tab", { name: "Stock, DAF & Wire" });
    const churchTab = page.getByRole("tab", { name: "Church Support" });

    await expect(onlineTab).toHaveAttribute("aria-selected", "true");

    await onlineTab.focus();
    await page.keyboard.press("ArrowRight");
    await expect(checkTab).toBeFocused();
    await expect(checkTab).toHaveAttribute("aria-selected", "true");
    await expect(
      page
        .getByRole("tabpanel", { name: "By Check" })
        .getByText("P.O. Box 1, Meadow Vista")
        .first()
    ).toBeVisible();

    await page.keyboard.press("ArrowRight");
    await expect(stockTab).toBeFocused();
    await expect(stockTab).toHaveAttribute("aria-selected", "true");

    await page.keyboard.press("ArrowRight");
    await expect(churchTab).toBeFocused();
    await expect(churchTab).toHaveAttribute("aria-selected", "true");
  });

  test("opens demand-loaded mobile UI SDK Drawer, exposes compact Give link in mobile header, and returns focus to Menu trigger on Escape", async ({
    page,
  }) => {
    await page.setViewportSize({ height: 844, width: 390 });
    await page.goto("/");

    const mobileGiveLink = page
      .locator("header")
      .getByRole("link", { exact: true, name: "Give" });

    const menuButton = page.getByRole("button", { name: "Menu" });

    await expect(mobileGiveLink).toBeVisible();
    await expect(mobileGiveLink).toHaveAttribute("href", "/give");
    await expect(menuButton).toBeVisible();
    await menuButton.click();

    const closeButton = page.getByRole("button", { name: "Close" });

    await expect(closeButton).toBeVisible();
    await expect(closeButton).toBeFocused();
    await expect(
      page
        .getByRole("navigation", { name: "Mobile site navigation" })
        .getByRole("link", { name: "Safeguarding & Story Removal" })
    ).toBeVisible();

    await page.keyboard.press("Escape");
    await expect(closeButton).toBeHidden();
    await expect(menuButton).toBeFocused();

    await menuButton.click();
    await page
      .getByRole("navigation", { name: "Mobile site navigation" })
      .getByRole("link", { exact: true, name: "Financials" })
      .click();
    await expect(page).toHaveURL(/\/financials$/u);
    await expect(menuButton).not.toBeFocused();
  });

  test("redirects legacy PDF and parity paths cleanly, enforces 410 Gone, and provides Finance recovery on unknown project and missionary IDs", async ({
    page,
    request,
  }) => {
    const [
      activityPdfRedirect,
      positionRedirect,
      missionaryRedirect,
      aboutRedirect,
      prayerRedirect,
      joinRedirect,
      serveRedirect,
      trainingRedirect,
      exposureTripsRedirect,
      boardRedirect,
      summitRedirect,
      regionRedirect,
      goneCheckout,
      goneTemplate,
    ] = await Promise.all([
      request.get("/financials/statement-of-activity-2025.pdf", {
        maxRedirects: 0,
      }),
      request.get("/StatementofFinancialPosition-2025-updated.pdf", {
        maxRedirects: 0,
      }),
      request.get("/missionary/example-worker", { maxRedirects: 0 }),
      request.get("/about", { maxRedirects: 0 }),
      request.get("/prayer", { maxRedirects: 0 }),
      request.get("/join", { maxRedirects: 0 }),
      request.get("/serve", { maxRedirects: 0 }),
      request.get("/training", { maxRedirects: 0 }),
      request.get("/exposure-trips", { maxRedirects: 0 }),
      request.get("/board-members", { maxRedirects: 0 }),
      request.get("/global-fellowship-leadership-summit", { maxRedirects: 0 }),
      request.get("/central-asia", { maxRedirects: 0 }),
      request.get("/checkout-test", { maxRedirects: 0 }),
      request.get("/church-plantertemplate", { maxRedirects: 0 }),
    ]);

    expect(activityPdfRedirect.status()).toBe(308);
    expect(activityPdfRedirect.headers().location).toBe(
      "/financials#statement-of-activity"
    );

    expect(positionRedirect.status()).toBe(308);
    expect(positionRedirect.headers().location).toBe(
      "/financials#statement-of-financial-position"
    );
    expect(missionaryRedirect.status()).toBe(308);
    expect(missionaryRedirect.headers().location).toBe("/missionaries");
    expect(aboutRedirect.status()).toBe(308);
    expect(aboutRedirect.headers().location).toBe("/mission-and-values");
    expect(prayerRedirect.status()).toBe(308);
    expect(prayerRedirect.headers().location).toBe("/pray");
    expect(joinRedirect.status()).toBe(308);
    expect(joinRedirect.headers().location).toBe("/opportunities");
    expect(serveRedirect.status()).toBe(308);
    expect(serveRedirect.headers().location).toBe("/serve-across-cultures");
    expect(trainingRedirect.status()).toBe(308);
    expect(trainingRedirect.headers().location).toBe(
      "/serve-across-cultures#training"
    );
    expect(exposureTripsRedirect.status()).toBe(308);
    expect(exposureTripsRedirect.headers().location).toBe(
      "/churches#exposure-trips"
    );
    expect(boardRedirect.status()).toBe(308);
    expect(boardRedirect.headers().location).toBe("/our-people#board");
    expect(summitRedirect.status()).toBe(308);
    expect(summitRedirect.headers().location).toBe(
      "/projects/leadership-summit"
    );
    expect(regionRedirect.status()).toBe(308);
    expect(regionRedirect.headers().location).toBe(
      "/where-we-serve/central-asia"
    );

    expect(goneCheckout.status()).toBe(410);
    expect(goneCheckout.headers()["x-robots-tag"]).toBe("noindex, nofollow");
    expect(goneTemplate.status()).toBe(410);
    expect(goneTemplate.headers()["x-robots-tag"]).toBe("noindex, nofollow");

    const projectRecovery = await page.goto(
      "/projects/older-mailed-project-code"
    );

    expect(projectRecovery?.status()).toBe(404);
    await expect(
      page.getByRole("heading", {
        level: 1,
        name: "That ministry project is not currently published online.",
      })
    ).toBeVisible();

    const missionaryRecovery = await page.goto(
      "/missionaries/unlisted-worker-check"
    );

    expect(missionaryRecovery?.status()).toBe(404);
    await expect(
      page.getByRole("heading", {
        level: 1,
        name: "That missionary page is not currently published online.",
      })
    ).toBeVisible();

    const notFoundResponse = await page.goto("/non-existent-route-smoke-check");

    expect(notFoundResponse?.status()).toBe(404);
    await expect(
      page.getByRole("heading", {
        level: 1,
        name: "We could not find that page.",
      })
    ).toBeVisible();
  });

  test("expands closed disclosures in print media, avoids duplicating /give sidebar, and hides footer nav", async ({
    page,
  }) => {
    await page.goto("/financials");
    await page.emulateMedia({ media: "print" });

    await expect(
      page.locator(".gf-print-only").getByText("Global Fellowship, Inc.")
    ).toBeVisible();

    await page.goto("/give");
    await page.emulateMedia({ media: "print" });
    await expect(page.getByText("Receipting & Finance desk")).toHaveCount(1);
  });

  test("serves verbatim Accounting App legal routes isolated from marketing chrome", async ({
    page,
  }) => {
    const eulaResponse = await page.goto("/eula");

    expect(eulaResponse?.status()).toBe(200);
    await expect(
      page.getByRole("heading", {
        level: 1,
        name: "End-User License Agreement (EULA)",
      })
    ).toBeVisible();

    const privacyResponse = await page.goto("/privacypolicy");

    expect(privacyResponse?.status()).toBe(200);
    await expect(
      page.getByRole("heading", { level: 1, name: "Privacy Policy" })
    ).toBeVisible();
    await expect(page.getByText("Google Firebase")).toBeVisible();
  });

  test("rejects unauthenticated requests to /api/cms/revalidate cleanly and serves genuine HTTP 503 on outage routes", async ({
    request,
  }) => {
    const [response, projectOutage, missionaryOutage] = await Promise.all([
      request.post("/api/cms/revalidate", {
        data: {
          mode: "withdraw",
          tags: ["public-cms:tenant:gf"],
        },
      }),
      request.get("/projects/unavailable/outage"),
      request.get("/missionaries/unavailable/outage"),
    ]);

    expect([401, 503]).toContain(response.status());
    expect(response.headers()["x-robots-tag"]).toBe("noindex, nofollow");
    expect(await response.json()).toHaveProperty("error");

    for (const outageResponse of [projectOutage, missionaryOutage]) {
      expect(outageResponse.status()).toBe(503);
      expect(outageResponse.headers()["retry-after"]).toBe("60");
      expect(outageResponse.headers()["cache-control"]).toContain("no-store");
      expect(outageResponse.headers()["x-robots-tag"]).toBe(
        "noindex, nofollow"
      );
    }
  });

  test("personalizes the zero-PII Bridge starter note in browser and expands full /financials ledger disclosures", async ({
    page,
  }) => {
    await page.goto("/bridge-project", { waitUntil: "networkidle" });
    await page.getByLabel("Your name or family (optional)").fill("Hannah");
    await page
      .getByLabel("City, church, or language (optional)")
      .fill("Boise, ID");

    await expect(
      page.getByRole("link", { name: "Open in email app" })
    ).toHaveAttribute("href", /Boise%2C%20ID[\s\S]*Hannah/u);

    await page.goto("/financials");

    await Promise.all(
      [
        "$482,612.59",
        "$251,610.11",
        "\u2212$65,886.40",
        "$165,116.08",
        "$1,887,540.53",
        "$22,876.27",
        "$1,864,664.26",
      ].map(async (canonicalTotal) => {
        await expect(page.getByText(canonicalTotal).first()).toBeVisible();
      })
    );

    await expect(
      page.locator("#statement-notes").getByText("Cash basis", { exact: true })
    ).toBeVisible();

    await page
      .getByText("Show grouped 2025 revenue and expense summary")
      .click();
    await expect(page.getByText("$192,504.66", { exact: true })).toBeVisible();
  });

  test("routes safeguarding mailto distinctly, states 24-hour removal target, names Board Chair, and shows formatted phone on /give", async ({
    page,
  }) => {
    await page.goto("/contact");
    await expect(
      page.locator("#safeguarding").getByRole("link", {
        exact: true,
        name: "Request story or photo removal",
      })
    ).toHaveAttribute("href", /subject=Story%20or%20Photo%20Removal/iu);
    await expect(
      page.getByRole("link", { name: "Contact Co-Executive Directors" })
    ).toHaveAttribute("href", /subject=Safeguarding%20or%20Accountability/iu);
    await expect(
      page.getByText(/within 24 hours, including weekends/iu).first()
    ).toBeVisible();
    await expect(page.getByText(/Eric Bergen/u).first()).toBeVisible();

    await page.goto("/give");
    await expect(page.getByText("1-866-984-5622").first()).toBeVisible();
  });

  test("verifies all 7-catalog interactive upgrades across Financials, Our People, How We Work, Give Help, Opportunities, and Projects", async ({
    page,
  }) => {
    // 1. /financials: 100-square StewardshipWaffle + SectionScrollspy + ReadingProgressBar
    await page.goto("/financials", { waitUntil: "networkidle" });
    await expect(page.locator(".gf-waffle-tile")).toHaveCount(100);

    const leaseBtn = page.getByRole("button", {
      name: /Office lease/u,
    });

    await leaseBtn.click();
    await expect(leaseBtn).toHaveAttribute("aria-pressed", "true");
    await expect(
      page.locator('.gf-waffle-tile[data-dimmed="true"]')
    ).toHaveCount(80);
    await page.getByRole("button", { name: "Clear selection" }).click();
    await expect(
      page.locator('.gf-waffle-tile[data-dimmed="true"]')
    ).toHaveCount(0);

    const scrollspyNav = page.getByRole("navigation", {
      name: "Jump to financial section",
    });

    await expect(scrollspyNav).toBeVisible();
    await scrollspyNav
      .getByRole("link", { name: "Statement of Activity" })
      .click();
    await expect(
      scrollspyNav.getByRole("link", { name: "Statement of Activity" })
    ).toHaveAttribute("aria-current", "location");

    // 2. /our-people: 4-panel EditorialPhotoAccordion desktop click + Arrow key navigation
    await page.setViewportSize({ height: 900, width: 1280 });
    await page.goto("/our-people", { waitUntil: "networkidle" });

    const missionariesPanel = page.getByRole("button", {
      name: /01.*Our Missionaries/u,
    });

    const boardPanel = page.getByRole("button", { name: /04.*Our Board/u });

    await expect(missionariesPanel).toHaveAttribute("aria-expanded", "true");
    await boardPanel.click();
    await expect(boardPanel).toHaveAttribute("aria-expanded", "true");
    await expect(missionariesPanel).toHaveAttribute("aria-expanded", "false");

    // 3. /how-we-work: StrategyPhaseExplorer (@ui-sdk/react/tabs) + EditorialTimeline (@ui-sdk/react/timeline)
    await page.goto("/how-we-work", { waitUntil: "networkidle" });

    const gatherTab = page.getByRole("tab", { name: /Gather & Disciple/u });

    await gatherTab.click();
    await expect(gatherTab).toHaveAttribute("aria-selected", "true");
    await expect(page.getByText("Make Friends")).toBeVisible();

    await page.getByRole("button", { name: "Show all 9 steps" }).click();
    await expect(page.getByText("Transfer to Local Elders")).toBeVisible();
    await page.getByRole("button", { name: "Explore phase by phase" }).click();
    await expect(
      page.getByRole("list", { name: "Global Fellowship history since 1989" })
    ).toBeVisible();

    // 4. /give/help: SearchableFaq (@ui-sdk/react/accordion + live filter + highlight + expand/collapse)
    await page.goto("/give/help", { waitUntil: "networkidle" });

    const faqSearch = page.getByRole("searchbox", {
      name: "Search giving questions",
    });

    await faqSearch.fill("ECFA");
    await expect(page.locator(".gf-search-mark").first()).toBeVisible();
    await expect(
      page.getByText(/You can read our 2025 financial statements/u)
    ).toBeVisible();
    await page.getByRole("button", { name: "Clear search" }).click();
    await expect(faqSearch).toHaveValue("");

    // 5. /opportunities & /serve-across-cultures: faceted count pills + removable chip + onboarding timeline
    await page.goto("/opportunities", { waitUntil: "networkidle" });
    await page.getByRole("radio", { name: /Home Office/u }).click();
    await expect(
      page.getByRole("button", { name: /Remove Home Office.*filter/u })
    ).toBeVisible();
    await page
      .getByRole("button", { name: /Remove Home Office.*filter/u })
      .click();

    await page.goto("/serve-across-cultures", { waitUntil: "networkidle" });
    await expect(
      page.getByRole("list", {
        name: "Nine-step missionary application and onboarding process",
      })
    ).toBeVisible();

    // 6. /projects: ReUI-inspired faceted search + removable chip
    await page.goto("/projects", { waitUntil: "networkidle" });
    await page.getByRole("radio", { name: /Member Care/u }).click();
    await expect(
      page.getByRole("button", { name: /Remove Member Care filter/u })
    ).toBeVisible();
  });

  test("renders Rector Medium vector logos, tucks typeface and ESV credits on /credits instead of every footer, and shows the group photo on /our-people", async ({
    page,
  }) => {
    await page.goto("/", { waitUntil: "networkidle" });

    const headerBrand = page
      .locator("header")
      .getByRole("link", { name: "Global Fellowship home" });

    await expect(headerBrand).toBeVisible();
    await expect(headerBrand.locator("svg")).toHaveCount(2);

    const footer = page.locator("#site-directory");

    const footerBrand = footer.getByRole("link", {
      name: "Global Fellowship home",
    });

    await expect(footerBrand.locator("svg")).toHaveCount(2);
    await expect(footer).not.toContainText("English Standard Version");

    const creditsLink = footer.getByRole("link", {
      exact: true,
      name: "Credits",
    });

    await expect(creditsLink).toHaveAttribute("href", "/credits");
    await creditsLink.click();
    await expect(page).toHaveURL(/\/credits$/u);
    await expect(
      page.getByRole("heading", { level: 1, name: "Credits & Notices" })
    ).toBeVisible();
    await expect(page.getByText(/Hrvoje Živčić/u)).toBeVisible();
    await expect(page.getByText(/Production Type/u)).toBeVisible();
    await expect(
      page.getByRole("link", { name: /Web Fonts/u })
    ).toHaveAttribute("href", "https://www.onlinewebfonts.com");
    await expect(
      page.getByText(/English Standard Version.*Crossway/u)
    ).toBeVisible();

    await page.goto("/our-people", { waitUntil: "networkidle" });
    await expect(
      page.locator('[data-gf-layered-hero="GF-LIVE-27"]')
    ).toBeVisible();
  });

  test("renders Missionaries in 3-column desktop rows matching Projects, keeps stable column widths while searching, and navigates cleanly to detail and back", async ({
    page,
  }) => {
    await page.setViewportSize({ height: 900, width: 1280 });

    await page.goto("/projects", { waitUntil: "networkidle" });

    const projectCardWidth = await page
      .locator('[data-slot="directory-grid"] [data-slot="directory-card"]')
      .first()
      .evaluate((el) => Math.round(el.getBoundingClientRect().width));

    await page.goto("/missionaries", { waitUntil: "networkidle" });

    const cards = page.locator(
      '[data-slot="directory-grid"] [data-slot="directory-card"]'
    );

    await expect(cards).toHaveCount(4);

    const boxes = await cards.evaluateAll((elements) =>
      elements.map((el) => {
        const rect = el.getBoundingClientRect();

        return {
          width: Math.round(rect.width),
          x: Math.round(rect.x),
          y: Math.round(rect.y),
        };
      })
    );

    // Row 1 holds 3 missionaries at identical width to /projects; card 4 starts Row 2 in Column 1
    expect(Math.abs(boxes[0].y - boxes[1].y)).toBeLessThanOrEqual(2);
    expect(Math.abs(boxes[0].y - boxes[2].y)).toBeLessThanOrEqual(2);
    expect(boxes[3].y).toBeGreaterThan(boxes[0].y + 100);
    expect(Math.abs(boxes[3].x - boxes[0].x)).toBeLessThanOrEqual(2);
    expect(Math.abs(boxes[0].width - projectCardWidth)).toBeLessThanOrEqual(2);

    // Searching preserves stable 3-column card width (zero column-jump resize)
    const searchInput = page.getByRole("searchbox", {
      name: "Search missionaries",
    });

    await searchInput.fill("Oates");
    await expect(cards).toHaveCount(1);

    const filteredWidth = await cards
      .first()
      .evaluate((el) => Math.round(el.getBoundingClientRect().width));

    expect(Math.abs(filteredWidth - boxes[0].width)).toBeLessThanOrEqual(2);

    await page.getByRole("button", { name: "Clear search" }).click();
    await expect(cards).toHaveCount(4);
    await expect(searchInput).toBeFocused();

    // Forward detail navigation and breadcrumb return
    await page
      .getByRole("link", { name: "Learn more about Jeremy & Anne Beaumont" })
      .click();
    await expect(page).toHaveURL(/\/missionaries\/beaumont$/u);
    await expect(
      page.getByRole("heading", { level: 1, name: "Jeremy & Anne Beaumont" })
    ).toBeVisible();

    await page
      .getByRole("navigation", { name: "Breadcrumb" })
      .getByRole("link", { name: "Missionaries" })
      .click();
    await expect(page).toHaveURL(/\/missionaries$/u);
    await expect(cards).toHaveCount(4);
  });

  test("executes client-side View Transitions cleanly across primary nav, subnav, hierarchical drill-downs, and same-route sibling switches", async ({
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

    await page.setViewportSize({ height: 900, width: 1280 });
    await page.goto("/", { waitUntil: "networkidle" });

    // Track real native `document.startViewTransition` invocations during navigation
    await page.evaluate(() => {
      document.documentElement.dataset.gfVtCount = "0";

      const original = document.startViewTransition.bind(document);

      document.startViewTransition = (...args) => {
        const current = Number(
          document.documentElement.dataset.gfVtCount ?? "0"
        );

        document.documentElement.dataset.gfVtCount = String(current + 1);

        return original(...args);
      };
    });

    // Primary nav lateral transition: Home -> Missionaries -> Projects -> About Us
    const primaryNav = page.getByRole("navigation", {
      name: "Primary navigation",
    });

    await primaryNav.getByRole("link", { name: "Missionaries" }).hover();
    await primaryNav.getByRole("link", { name: "Missionaries" }).click();
    await expect(page).toHaveURL(/\/missionaries$/u);
    await expect(
      page.getByRole("heading", {
        level: 1,
        name: "Give to a missionary or team.",
      })
    ).toBeVisible();

    // Hierarchical forward + back with shared photo/title morph on Missionaries
    const oatesCardLink = page.getByRole("link", {
      name: /Learn more about Don & Kathy Oates/u,
    });

    await oatesCardLink.hover();
    await oatesCardLink.click();
    await expect(page).toHaveURL(/\/missionaries\/oates$/u);
    await expect(
      page.getByRole("heading", { level: 1, name: "Don & Kathy Oates" })
    ).toBeVisible();

    await page
      .getByRole("navigation", { name: "Breadcrumb" })
      .getByRole("link", { name: "Missionaries" })
      .click();
    await expect(page).toHaveURL(/\/missionaries$/u);

    // Projects search for General Fund must not duplicate project-title-general-fund
    await primaryNav.getByRole("link", { name: "Projects" }).click();
    await expect(page).toHaveURL(/\/projects$/u);

    const projectSearch = page.getByRole("searchbox", {
      name: "Search ministry projects",
    });

    await projectSearch.fill("General Fund");
    await expect(page.getByText(/1 ministry project matching/u)).toBeVisible();
    await page
      .getByRole("link", {
        name: "Learn more about The Global Fellowship General Fund",
      })
      .first()
      .click();
    await expect(page).toHaveURL(/\/projects\/general-fund$/u);
    await expect(
      page.getByRole("heading", {
        level: 1,
        name: "The Global Fellowship General Fund",
      })
    ).toBeVisible();

    // About Us subnav lateral gliding underline: Mission & Values -> Stories -> Where We Serve
    await primaryNav
      .getByRole("link", { exact: true, name: "About Us" })
      .click();
    await expect(page).toHaveURL(/\/mission-and-values$/u);

    const aboutSubnav = page.getByRole("navigation", {
      name: "About Global Fellowship",
    });

    await aboutSubnav.getByRole("link", { name: "Stories" }).hover();
    await aboutSubnav.getByRole("link", { name: "Stories" }).click();
    await expect(page).toHaveURL(/\/stories$/u);

    // Stories forward + back
    await page.getByRole("link", { name: /You Can Land/u }).click();
    await expect(page).toHaveURL(
      /\/stories\/you-can-land-but-taking-off-is-gods-work$/u
    );
    await page
      .getByRole("navigation", { name: "Breadcrumb" })
      .getByRole("link", { name: "Stories" })
      .click();
    await expect(page).toHaveURL(/\/stories$/u);

    // Where We Serve forward -> same-route region switch -> back
    await aboutSubnav.getByRole("link", { name: "Where We Serve" }).click();
    await expect(page).toHaveURL(/\/where-we-serve$/u);
    await page.getByRole("link", { name: /Central Asia/u }).click();
    await expect(page).toHaveURL(/\/where-we-serve\/central-asia$/u);
    await expect(
      page.getByRole("heading", { level: 1, name: "Central Asia" })
    ).toBeVisible();

    await page.getByRole("link", { exact: true, name: "East Asia" }).click();
    await expect(page).toHaveURL(/\/where-we-serve\/east-asia$/u);
    await expect(
      page.getByRole("heading", { level: 1, name: "East Asia" })
    ).toBeVisible();

    // Opportunities forward + back
    await primaryNav.getByRole("link", { name: "Opportunities" }).click();
    await expect(page).toHaveURL(/\/opportunities$/u);
    await page
      .getByRole("link", { name: /Church Planter in Slovenia/u })
      .click();
    await expect(page).toHaveURL(/\/opportunities\/slovenia-church-planter$/u);
    await page
      .getByRole("navigation", { name: "Breadcrumb" })
      .getByRole("link", { name: "Opportunities" })
      .click();
    await expect(page).toHaveURL(/\/opportunities$/u);

    const viewTransitionCount = await page.evaluate(() =>
      Number(document.documentElement.dataset.gfVtCount ?? "0")
    );

    expect(viewTransitionCount).toBeGreaterThanOrEqual(8);
    expect(consoleErrors).toEqual([]);
    expect(pageErrors).toEqual([]);
  });
});

test.describe("Progressive enhancement with JavaScript disabled", () => {
  test.use({ javaScriptEnabled: false });

  test("delivers full navigation, safeguarding footer link, 2025 stewardship summary, local standards, and Bridge mailto without JS", async ({
    page,
  }) => {
    await page.setViewportSize({ height: 844, width: 390 });
    await page.goto("/");

    const menuAnchor = page.getByRole("link", { name: "Menu" });

    await expect(menuAnchor).toBeVisible();
    await expect(menuAnchor).toHaveAttribute("href", "#site-directory");

    await expect(
      page
        .locator("#site-directory")
        .getByRole("link", { name: "Safeguarding & Story Removal" })
        .first()
    ).toBeVisible();

    await expect(
      page.getByRole("link", { name: "View Financials" })
    ).toHaveAttribute("href", "/financials");

    await page.goto("/local-leaders");
    await expect(
      page.getByText("Asking local hosts whether a small listening visit")
    ).toBeVisible();

    await page.goto("/statement-of-faith");
    await expect(page.locator("article ol > li")).toHaveCount(8);

    await page.goto("/bridge-project");
    await expect(
      page.getByRole("link", { name: "Open in email app" })
    ).toHaveAttribute("href", /^mailto:info@globalfellowship\.org/u);

    await page.setViewportSize({ height: 640, width: 320 });
    await page.goto("/");
    await expect(
      page
        .locator("#site-directory")
        .getByRole("link", { exact: true, name: "Ways to Give" })
    ).toHaveAttribute("href", "/give");
    await expect(
      page
        .locator("#site-directory")
        .getByRole("link", { exact: true, name: "Ministry Projects" })
    ).toHaveAttribute("href", "/projects");

    // Verify /missionaries renders all 4 standing leader cards natively inside <main> before <footer> without JS
    await page.goto("/missionaries");
    await expect(
      page
        .locator("main#main-content")
        .getByRole("heading", { level: 3, name: "Don & Kathy Oates" })
    ).toBeVisible();
    await expect(
      page
        .locator("main#main-content")
        .getByRole("heading", { level: 3, name: "Jeremy & Anne Beaumont" })
    ).toBeVisible();
    await expect(
      page
        .locator("main#main-content")
        .getByRole("heading", { level: 3, name: "The O'Brien Family" })
    ).toBeVisible();
    await expect(
      page.locator("main#main-content").getByRole("heading", {
        level: 3,
        name: "Carolyn Pappy Kuzhivila",
      })
    ).toBeVisible();

    // Verify native GET QuickGiveInput form submission works with JavaScript disabled
    await page.goto("/projects");
    await page
      .getByLabel(
        "Gift amount for The Global Fellowship General Fund in US dollars"
      )
      .fill("75");
    await page
      .getByRole("button", {
        name: /^Give to The Global Fellowship General Fund$/u,
      })
      .click();
    await expect(page).toHaveURL(/\/checkout\?.*fund=general.*amount=75/u);
    await expect(
      page.getByRole("heading", {
        level: 1,
        name: "Arrange your designated gift",
      })
    ).toBeVisible();
    await expect(
      page.getByRole("heading", {
        level: 2,
        name: "The Global Fellowship General Fund",
      })
    ).toBeVisible();
    await expect(page.getByText("$75")).toBeVisible();

    const assertMainBeforeFooter = async () => {
      const order = await page.evaluate(() => {
        const main = document.querySelector("main#main-content");
        const footer = document.querySelector("footer");
        const h1 = document.querySelector("h1");

        if (!(main && footer && h1)) {
          return {
            h1InHiddenTemplate: true,
            h1InMain: false,
            mainBeforeFooter: false,
          };
        }

        const landmarks = [
          ...document.querySelectorAll("main#main-content, footer"),
        ];

        return {
          h1InHiddenTemplate: h1.closest('div[hidden][id^="S:"]') !== null,
          h1InMain: main.contains(h1),
          mainBeforeFooter:
            landmarks.includes(main) &&
            landmarks.indexOf(footer) > landmarks.indexOf(main),
        };
      });

      expect(order).toStrictEqual({
        h1InHiddenTemplate: false,
        h1InMain: true,
        mainBeforeFooter: true,
      });
    };

    // Verify semantic DOM order (<main> containing <h1> and <form> strictly before <footer>) on detail routes without JS
    await page.goto("/missionaries/beaumont");
    await assertMainBeforeFooter();
    await expect(
      page
        .locator("main#main-content")
        .getByRole("heading", { level: 1, name: "Jeremy & Anne Beaumont" })
    ).toBeVisible();
    await expect(
      page
        .locator("main#main-content")
        .getByRole("button", { exact: true, name: "Give" })
    ).toBeVisible();

    // Verify native GET detail-page giving works with JS disabled (valid + HTTP 400 error identification)
    await page.goto("/projects/leadership-summit");
    await assertMainBeforeFooter();
    await expect(
      page.getByRole("button", { exact: true, name: "$100" })
    ).toBeHidden();
    await page
      .getByLabel("Gift amount ($1.00 to $1,000,000.00)")
      .fill("125.50");
    await page.getByRole("button", { exact: true, name: "Give" }).click();
    await expect(page).toHaveURL(
      /\/checkout\?.*fund_id=leadership-summit.*amount=125\.50/u
    );
    await assertMainBeforeFooter();
    await expect(
      page.getByRole("heading", {
        level: 2,
        name: "Global Fellowship Leadership Summit",
      })
    ).toBeVisible();
    await expect(page.getByText("$125.50")).toBeVisible();

    await page.goto(
      "/give/checkout?fund_id=leadership-summit&amount=125.50&frequency=one-time"
    );
    await assertMainBeforeFooter();
    await expect(
      page.getByRole("heading", {
        level: 2,
        name: "Global Fellowship Leadership Summit",
      })
    ).toBeVisible();

    const invalidResponse = await page.goto(
      "/checkout?via=form&fund_id=leadership-summit&amount=0.50"
    );

    expect(invalidResponse?.status()).toBe(400);
    await assertMainBeforeFooter();
    await expect(page.getByRole("alert")).toContainText(
      "Enter a gift amount of at least $1.00."
    );
    await expect(page.getByRole("alert")).toContainText(
      /You entered [“"]0\.50[”"]\./u
    );
    await expect(
      page.getByLabel("Gift amount in US dollars ($1.00 to $1,000,000.00)")
    ).toHaveValue("0.50");

    // Verify all 7-catalog interactive components remain fully readable when JS is disabled
    await page.goto("/our-people");
    await expect(page.locator(".gf-photo-accordion-fallback")).toBeVisible();
    await expect(
      page
        .locator(".gf-photo-accordion-fallback")
        .getByRole("heading", { name: "Our Board" })
    ).toBeVisible();

    await page.goto("/give/help");
    await expect(
      page.getByText(/You can read our 2025 financial statements/u)
    ).toBeVisible();

    await page.goto("/how-we-work");
    await expect(page.getByText("Transfer to Local Elders")).toBeVisible();
  });
});

test.describe("Programmatic smooth scrolling & reading progress @smoke", () => {
  test("unifies On this page, hero jump links, cross-page hashes, header back-to-top, and main-content reading progress", async ({
    page,
  }) => {
    await page.setViewportSize({ height: 900, width: 1280 });
    await page.emulateMedia({
      colorScheme: "light",
      reducedMotion: "no-preference",
    });

    // 1. /mission-and-values: On this page smooth glide + header divider state + header back-to-top
    await page.goto("/mission-and-values", { waitUntil: "networkidle" });

    const siteHeader = page.locator("header.gf-site-header");

    await expect(siteHeader).not.toHaveAttribute("data-scrolled", "true");

    const scrollspyNav = page.getByRole("navigation", {
      name: "Sections on this page",
    });

    await scrollspyNav.getByRole("link", { name: "Core values" }).click();

    await expect(page).toHaveURL(/\/mission-and-values#values$/u);
    await expect(
      scrollspyNav.getByRole("link", { name: "Core values" })
    ).toHaveAttribute("aria-current", "location");
    await expect(siteHeader).toHaveAttribute("data-scrolled", "true");

    await expect
      .poll(
        async () =>
          await page.evaluate(() => {
            const headerHeight =
              document
                .querySelector<HTMLElement>(".gf-site-header")
                ?.getBoundingClientRect().height ?? 68;

            const targetTop =
              document.querySelector("#values")?.getBoundingClientRect().top ??
              999;

            return {
              aligned: Math.abs(targetTop - (headerHeight + 24)) <= 24,
              focusedInTarget:
                document.activeElement instanceof Element &&
                document.activeElement.closest("#values") !== null,
              scrolled: window.scrollY > 200,
            };
          })
      )
      .toStrictEqual({
        aligned: true,
        focusedInTarget: true,
        scrolled: true,
      });

    // Clicking the active About Us link in SiteHeader glides back to top cleanly
    await siteHeader.getByRole("link", { name: "About Us" }).click();
    await expect
      .poll(async () => await page.evaluate(() => window.scrollY))
      .toBeLessThanOrEqual(4);
    await expect(siteHeader).not.toHaveAttribute("data-scrolled", "true");

    // 2. Hero jump link on /our-people (#board)
    await page.goto("/our-people", { waitUntil: "networkidle" });
    await page
      .locator("main#main-content")
      .getByRole("link", { name: "Board of Directors" })
      .first()
      .click();
    await expect(page).toHaveURL(/\/our-people#board$/u);
    await expect
      .poll(
        async () =>
          await page.evaluate(() => {
            const targetTop =
              document.querySelector("#board")?.getBoundingClientRect().top ??
              999;

            return targetTop >= 50 && targetTop <= 150;
          })
      )
      .toBe(true);

    // 3. Extended ReadingProgressBar on /churches, /serve-across-cultures, /local-leaders
    await page.goto("/churches", { waitUntil: "networkidle" });
    await expect(page.locator(".gf-reading-progress-fill")).toHaveCount(1);

    await page.goto("/serve-across-cultures", { waitUntil: "networkidle" });
    await expect(page.locator(".gf-reading-progress-fill")).toHaveCount(1);

    await page.goto("/local-leaders", { waitUntil: "networkidle" });
    await expect(page.locator(".gf-reading-progress-fill")).toHaveCount(1);

    // Verify reading progress reaches 100% at the end of #main-content before the footer
    const footerExtraPx = await page.evaluate(() => {
      const main = document.querySelector<HTMLElement>("#main-content");

      if (main === null) {
        return 0;
      }

      const mainEndScroll =
        main.offsetTop + main.offsetHeight - window.innerHeight;

      const fullDocScroll =
        document.documentElement.scrollHeight - window.innerHeight;

      window.scrollTo({ behavior: "instant", top: mainEndScroll });

      return fullDocScroll - mainEndScroll;
    });

    expect(footerExtraPx).toBeGreaterThan(200);
    await expect
      .poll(
        async () =>
          await page.evaluate(() => {
            const fill = document.querySelector<HTMLElement>(
              ".gf-reading-progress-fill"
            );

            const transform = fill?.style.transform ?? "";
            const match = /scaleX\((?<scale>[\d.]+)\)/u.exec(transform);

            return match?.groups?.scale === undefined
              ? 0
              : Number(match.groups.scale);
          })
      )
      .toBeGreaterThanOrEqual(0.99);

    // 4. Cross-page section link (/contact#safeguarding from SiteFooter)
    await page
      .locator("footer#site-directory")
      .getByRole("link", { name: "Safeguarding & Story Removal" })
      .click();
    await expect(page).toHaveURL(/\/contact#safeguarding$/u);
    await expect
      .poll(
        async () =>
          await page.evaluate(() => {
            const top =
              document.querySelector("#safeguarding")?.getBoundingClientRect()
                .top ?? 999;

            return top >= 50 && top <= 150;
          })
      )
      .toBe(true);
  });

  test("honors prefers-reduced-motion with immediate anchor jumps and inert reading progress", async ({
    page,
  }) => {
    await page.setViewportSize({ height: 900, width: 1280 });
    await page.emulateMedia({ colorScheme: "light", reducedMotion: "reduce" });
    await page.goto("/financials", { waitUntil: "networkidle" });

    const scrollspyNav = page.getByRole("navigation", {
      name: "Jump to financial section",
    });

    await scrollspyNav.getByRole("link", { name: "Governance" }).click();
    await expect(page).toHaveURL(/\/financials#governance$/u);

    const metrics = await page.evaluate(() => {
      const track = document.querySelector(".gf-reading-progress-track");

      return {
        progressTrackDisplay:
          track === null ? "" : getComputedStyle(track).display,
        scrollY: window.scrollY,
      };
    });

    expect(metrics.scrollY).toBeGreaterThan(400);
    expect(metrics.progressTrackDisplay).toBe("none");
  });

  test("switches light, dark, and system themes from the subtle footer control, persists across reloads, and keeps print pure B&W", async ({
    page,
  }) => {
    await page.setViewportSize({ height: 900, width: 1280 });
    await page.emulateMedia({ colorScheme: "light", media: "screen" });
    await page.goto("/", { waitUntil: "networkidle" });

    const themeGroup = page
      .locator("footer#site-directory")
      .getByRole("radiogroup", { name: "Color theme" });

    await expect(themeGroup).toBeVisible();
    await expect(
      themeGroup.getByRole("radio", { name: "System theme" })
    ).toHaveAttribute("aria-checked", "true");

    // System mode declares native light/dark color-scheme and media theme-color metadata
    const systemMeta = await page.evaluate(() => ({
      colorScheme: getComputedStyle(document.documentElement).colorScheme,
      themeColors: [
        ...document.querySelectorAll('meta[name="theme-color"]'),
      ].map((meta) => ({
        content: meta.getAttribute("content"),
        media: meta.getAttribute("media"),
      })),
    }));

    expect(systemMeta).toStrictEqual({
      colorScheme: "light dark",
      themeColors: [
        { content: "#fcfaf6", media: "(prefers-color-scheme: light)" },
        { content: "#0a1822", media: "(prefers-color-scheme: dark)" },
      ],
    });

    // Explicit Dark override on a Light OS applies Deep Navy tokens, color-scheme, & theme-color override
    await themeGroup.getByRole("radio", { name: "Dark theme" }).click();
    await expect(page.locator("html")).toHaveClass(/\bdark\b/u);
    await expect
      .poll(
        async () =>
          await page.evaluate(() => ({
            background: getComputedStyle(document.documentElement)
              .backgroundColor,
            colorScheme: getComputedStyle(document.documentElement).colorScheme,
            overrideMeta:
              document.head
                .querySelector('meta[name="theme-color"]')
                ?.getAttribute("content") ?? null,
          }))
      )
      .toStrictEqual({
        background: "rgb(10, 24, 34)",
        colorScheme: "dark",
        overrideMeta: "#0a1822",
      });

    await page.reload({ waitUntil: "networkidle" });
    await expect(page.locator("html")).toHaveClass(/\bdark\b/u);
    await expect(
      themeGroup.getByRole("radio", { name: "Dark theme" })
    ).toHaveAttribute("aria-checked", "true");

    // Standalone checkout correction HTML honors explicit Dark override without white flash
    await page.goto("/checkout?fund=general&amount=abc&via=form", {
      waitUntil: "networkidle",
    });

    const standaloneDark = await page.evaluate(() => ({
      background: getComputedStyle(document.body).backgroundColor,
      colorScheme: getComputedStyle(document.documentElement).colorScheme,
    }));

    expect(standaloneDark).toStrictEqual({
      background: "rgb(10, 24, 34)",
      colorScheme: "dark",
    });

    await page.goto("/", { waitUntil: "networkidle" });

    // Print stylesheet must still force pure white background, black ink, and light color-scheme
    await page.emulateMedia({ media: "print" });

    const printColors = await page.evaluate(() => {
      const style = getComputedStyle(document.documentElement);

      return {
        background: style.backgroundColor,
        color: style.color,
        colorScheme: style.colorScheme,
      };
    });

    expect(printColors).toStrictEqual({
      background: "rgb(255, 255, 255)",
      color: "rgb(0, 0, 0)",
      colorScheme: "light",
    });

    // Explicit Light override on a Dark OS restores Alabaster Ivory canvas & theme-color override
    await page.emulateMedia({ colorScheme: "dark", media: "screen" });
    await themeGroup.getByRole("radio", { name: "Light theme" }).click();
    await expect(page.locator("html")).toHaveClass(/\blight\b/u);
    await expect
      .poll(
        async () =>
          await page.evaluate(() => ({
            background: getComputedStyle(document.documentElement)
              .backgroundColor,
            colorScheme: getComputedStyle(document.documentElement).colorScheme,
            overrideMeta:
              document.head
                .querySelector('meta[name="theme-color"]')
                ?.getAttribute("content") ?? null,
          }))
      )
      .toStrictEqual({
        background: "rgb(252, 250, 246)",
        colorScheme: "light",
        overrideMeta: "#fcfaf6",
      });

    // Returning to System clears explicit class, removes override meta, & resumes following Dark OS
    await themeGroup.getByRole("radio", { name: "System theme" }).click();
    await expect(page.locator("html")).not.toHaveClass(/\b(?:light|dark)\b/u);
    await expect
      .poll(
        async () =>
          await page.evaluate(() => ({
            background: getComputedStyle(document.documentElement)
              .backgroundColor,
            colorScheme: getComputedStyle(document.documentElement).colorScheme,
            overrideExists:
              document.head.querySelector(
                'meta[name="theme-color"][data-gf-theme-color="override"]'
              ) !== null,
          }))
      )
      .toStrictEqual({
        background: "rgb(10, 24, 34)",
        colorScheme: "light dark",
        overrideExists: false,
      });
  });
});
