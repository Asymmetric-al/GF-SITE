import { NextRequest } from "next/server";
import { afterEach, describe, expect, it, vi } from "vitest";

import { GET as getGiveCheckout } from "@/app/give/checkout/route";

import { GET as getCheckout } from "./route";

const SAMPLE_FUND_UUID = "11111111-1111-4111-8111-111111111111";

describe("GET /checkout Donor Application bridge route", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("normalizes General Fund to fund=general and forwards valid UUIDs directly to Core Donor App", () => {
    vi.stubEnv("DONOR_APP_BASE_URL", "http://127.0.0.1:3005");
    vi.stubEnv("DONOR_APP_CHECKOUT_ENTRY", "login");

    const loginResponse = getCheckout(
      new NextRequest(
        "http://localhost:3000/checkout?fund_id=general-fund&amount=75"
      )
    );

    vi.stubEnv("DONOR_APP_CHECKOUT_ENTRY", "direct");

    const uuidResponse = getCheckout(
      new NextRequest(
        `http://localhost:3000/checkout?fund_id=${SAMPLE_FUND_UUID}&amount=125.50`
      )
    );

    expect({
      loginLocation: loginResponse.headers.get("location"),
      loginStatus: loginResponse.status,
      robotsHeader: loginResponse.headers.get("x-robots-tag"),
      uuidLocation: uuidResponse.headers.get("location"),
      uuidStatus: uuidResponse.status,
    }).toStrictEqual({
      loginLocation:
        "http://127.0.0.1:3005/login?next=%2Fcheckout%3Ffund%3Dgeneral%26amount%3D75%26entry_method%3Dpublic_checkout%26party_kind%3Dperson",
      loginStatus: 307,
      robotsHeader: "noindex, nofollow",
      uuidLocation: `http://127.0.0.1:3005/checkout?fund_id=${SAMPLE_FUND_UUID}&amount=125.50&entry_method=public_checkout&party_kind=person`,
      uuidStatus: 307,
    });
  });

  it("never forwards unmapped non-UUID standing slugs to Core; keeps selected recipient first and labels alternate General Fund option honestly", async () => {
    vi.stubEnv("DONOR_APP_BASE_URL", "http://127.0.0.1:3005");
    vi.stubEnv("DONOR_APP_CHECKOUT_ENTRY", "login");

    const directUnmapped = getCheckout(
      new NextRequest(
        "http://localhost:3000/checkout?fund_id=leadership-summit&amount=125.50"
      )
    );

    const formUnmapped = getCheckout(
      new NextRequest(
        "http://localhost:3000/checkout?via=form&fund_id=leadership-summit&amount=125.50"
      )
    );

    const directWhereMostNeededFundParam = getCheckout(
      new NextRequest(
        "http://localhost:3000/checkout?fund=where-most-needed&amount=25"
      )
    );

    const directBogusFundParam = getCheckout(
      new NextRequest(
        "http://localhost:3000/checkout?fund=bogus-fund&amount=40"
      )
    );

    const bookmarkedWhereMostNeededFundParam = getGiveCheckout(
      new NextRequest(
        "http://localhost:3000/give/checkout?fund=where-most-needed&amount=25"
      )
    );

    const formWhereMostNeededFundParam = getCheckout(
      new NextRequest(
        "http://localhost:3000/checkout?via=form&fund=where-most-needed&amount=25"
      )
    );

    const [formHtml, bookmarkedWmnHtml, formWmnHtml] = await Promise.all([
      formUnmapped.text(),
      bookmarkedWhereMostNeededFundParam.text(),
      formWhereMostNeededFundParam.text(),
    ]);

    const financeIdx = formHtml.indexOf(">Email Finance</a>");

    const alternateIdx = formHtml.indexOf(
      "Alternate: give $125.50 online to the General Fund"
    );

    expect({
      bookmarkedWmnHasHeading: bookmarkedWmnHtml.includes(
        "Arrange your designated gift"
      ),
      bookmarkedWmnOmitsCategorySuffix:
        !bookmarkedWmnHtml.includes("(Global Funds)"),
      bookmarkedWmnPreservesRecipient: bookmarkedWmnHtml.includes(
        '<h2 class="subheading">Where Most Needed</h2>'
      ),
      directBogusLocation: directBogusFundParam.headers.get("location"),
      directLocation: directUnmapped.headers.get("location"),
      directStatus: directUnmapped.status,
      directWmnFundParamLocation:
        directWhereMostNeededFundParam.headers.get("location"),
      financePrimaryBeforeAlternate:
        financeIdx > 0 && alternateIdx > financeIdx,
      formHasAmount: formHtml.includes("$125.50"),
      formHasDistinctHeading: formHtml.includes("Arrange your designated gift"),
      formHasGeneralOnlineOption: alternateIdx > 0,
      formHasMailtoBodyWithAmount:
        formHtml.includes("body=") && formHtml.includes("%24125.50"),
      formHasMainLandmark: formHtml.includes('<main id="main-content"'),
      formHasRecipient: formHtml.includes(
        "Global Fellowship Leadership Summit"
      ),
      formStatus: formUnmapped.status,
      formWmnPreservesRecipient: formWmnHtml.includes(
        '<h2 class="subheading">Where Most Needed</h2>'
      ),
      formZeroInternalJargon:
        !formHtml.includes("Donor Application") &&
        !formHtml.includes("fund code is linked"),
    }).toStrictEqual({
      bookmarkedWmnHasHeading: true,
      bookmarkedWmnOmitsCategorySuffix: true,
      bookmarkedWmnPreservesRecipient: true,
      directBogusLocation:
        "/give/checkout?amount=40&entry_method=public_checkout&party_kind=person&designation_status=unresolved",
      directLocation:
        "/give/checkout?fund_id=leadership-summit&amount=125.50&entry_method=public_checkout&party_kind=person",
      directStatus: 307,
      directWmnFundParamLocation:
        "/give/checkout?fund_id=where-most-needed&amount=25&entry_method=public_checkout&party_kind=person",
      financePrimaryBeforeAlternate: true,
      formHasAmount: true,
      formHasDistinctHeading: true,
      formHasGeneralOnlineOption: true,
      formHasMailtoBodyWithAmount: true,
      formHasMainLandmark: true,
      formHasRecipient: true,
      formStatus: 200,
      formWmnPreservesRecipient: true,
      formZeroInternalJargon: true,
    });
  });

  it("handles bookmarked /give/checkout?fund=general consistently for both one-time and monthly requests when connected", async () => {
    vi.stubEnv("DONOR_APP_BASE_URL", "http://127.0.0.1:3005");
    vi.stubEnv("DONOR_APP_CHECKOUT_ENTRY", "login");

    const bookmarkedOneTime = getGiveCheckout(
      new NextRequest(
        "http://localhost:3000/give/checkout?fund=general&amount=25"
      )
    );

    const bookmarkedMonthly = getGiveCheckout(
      new NextRequest(
        "http://localhost:3000/give/checkout?fund=general&amount=25&frequency=monthly"
      )
    );

    const checkoutMonthly = getCheckout(
      new NextRequest(
        "http://localhost:3000/checkout?fund=general&amount=25&frequency=monthly"
      )
    );

    const [oneTimeHtml, monthlyHtml] = await Promise.all([
      bookmarkedOneTime.text(),
      bookmarkedMonthly.text(),
    ]);

    expect({
      checkoutMonthlyRedirect: checkoutMonthly.headers.get("location"),
      checkoutMonthlyStatus: checkoutMonthly.status,
      monthlyExplainsRecurring: monthlyHtml.includes(
        "Selected gift: $25/month"
      ),
      monthlyHasDistinctHeading: monthlyHtml.includes("Start a monthly gift"),
      monthlyMailtoBodyIncludesCadence:
        monthlyHtml.includes("body=") && monthlyHtml.includes("%2425%2Fmonth"),
      monthlyOneTimeOptionUsesOneTimeParam:
        monthlyHtml.includes("Give $25 one-time online instead") &&
        monthlyHtml.includes("frequency=one-time"),
      monthlyStatus: bookmarkedMonthly.status,
      monthlyZeroContradictoryMonthlyForward:
        !monthlyHtml.includes("frequency=monthly"),
      oneTimeHasContinueOnlineCta: oneTimeHtml.includes(
        "Continue to donor sign-in ($25)"
      ),
      oneTimeHasDistinctHeading: oneTimeHtml.includes(
        ">Continue to online checkout</h1>"
      ),
      oneTimeHasSingleFundNameCount:
        (oneTimeHtml.match(/The Global Fellowship General Fund/gu) ?? [])
          .length === 1,
      oneTimeHasZeroUnattachedClaim: !oneTimeHtml.includes(
        "service is attached"
      ),
      oneTimeStatus: bookmarkedOneTime.status,
    }).toStrictEqual({
      checkoutMonthlyRedirect:
        "/give/checkout?fund=general&amount=25&frequency=monthly&entry_method=public_checkout&party_kind=person",
      checkoutMonthlyStatus: 307,
      monthlyExplainsRecurring: true,
      monthlyHasDistinctHeading: true,
      monthlyMailtoBodyIncludesCadence: true,
      monthlyOneTimeOptionUsesOneTimeParam: true,
      monthlyStatus: 200,
      monthlyZeroContradictoryMonthlyForward: true,
      oneTimeHasContinueOnlineCta: true,
      oneTimeHasDistinctHeading: true,
      oneTimeHasSingleFundNameCount: true,
      oneTimeHasZeroUnattachedClaim: true,
      oneTimeStatus: 200,
    });
  });

  it("returns same-origin HTTP 200 meta-refresh handoff HTML for Core-ready native form submits (via=form)", async () => {
    vi.stubEnv("DONOR_APP_BASE_URL", "http://127.0.0.1:3005");
    vi.stubEnv("DONOR_APP_CHECKOUT_ENTRY", "login");

    const formResponse = getCheckout(
      new NextRequest(
        "http://localhost:3000/checkout?via=form&fund_id=general-fund&amount=75"
      )
    );

    const html = await formResponse.text();

    expect({
      contentType: formResponse.headers.get("content-type"),
      hasBrandFonts: html.includes("/fonts/source-serif-4-latin.woff2"),
      hasEst1989: html.includes("Est. 1989"),
      hasKickerVar: html.includes("--kicker:"),
      hasMetaRefresh: html.includes(
        'http-equiv="refresh" content="0;url=http://127.0.0.1:3005/login?next=%2Fcheckout%3Ffund%3Dgeneral%26amount%3D75%26entry_method%3Dpublic_checkout%26party_kind%3Dperson"'
      ),
      hasSkipLink: html.includes('class="skip-link" href="#main-content"'),
      hasVisibleCta: html.includes("Continue to donor sign-in"),
      location: formResponse.headers.get("location"),
      robotsHeader: formResponse.headers.get("x-robots-tag"),
      status: formResponse.status,
    }).toStrictEqual({
      contentType: "text/html; charset=utf-8",
      hasBrandFonts: true,
      hasEst1989: true,
      hasKickerVar: true,
      hasMetaRefresh: true,
      hasSkipLink: true,
      hasVisibleCta: true,
      location: null,
      robotsHeader: "noindex, nofollow",
      status: 200,
    });
  });

  it("treats non-standing CORE_DONATION_ID_MAP aliases consistently across /checkout, /give/checkout, and HTTP 400 retries, and keeps <= 2 primary action buttons with linked Donor Dashboard on monthly", async () => {
    vi.stubEnv("DONOR_APP_BASE_URL", "http://127.0.0.1:3005");
    vi.stubEnv("DONOR_APP_CHECKOUT_ENTRY", "direct");
    vi.stubEnv(
      "CORE_DONATION_ID_MAP",
      JSON.stringify({ "custom-regional-fund": SAMPLE_FUND_UUID })
    );

    const aliasDirect = getCheckout(
      new NextRequest(
        "http://localhost:3000/checkout?fund_id=custom-regional-fund&amount=80"
      )
    );

    const aliasSummary = getGiveCheckout(
      new NextRequest(
        "http://localhost:3000/give/checkout?fund_id=custom-regional-fund&amount=80"
      )
    );

    const aliasInvalid400 = getCheckout(
      new NextRequest(
        "http://localhost:3000/checkout?fund_id=custom-regional-fund&amount=0.50"
      )
    );

    const monthlySummary = getGiveCheckout(
      new NextRequest(
        "http://localhost:3000/give/checkout?fund=general&amount=25&frequency=monthly"
      )
    );

    const [aliasSummaryHtml, alias400Html, monthlyHtml] = await Promise.all([
      aliasSummary.text(),
      aliasInvalid400.text(),
      monthlySummary.text(),
    ]);

    const actionsBlock =
      /<div class="actions">(?<actions>[\s\S]*?)<\/div>/u.exec(monthlyHtml)
        ?.groups?.actions;

    const actionAnchorCount = (actionsBlock?.match(/<a\s/gu) ?? []).length;

    expect({
      alias400NotUnresolved: !alias400Html.includes(
        'name="designation_status" value="unresolved"'
      ),
      alias400PreservesAlias: alias400Html.includes(
        'value="custom-regional-fund"'
      ),
      alias400Status: aliasInvalid400.status,
      aliasDirectLocation: aliasDirect.headers.get("location"),
      aliasDirectStatus: aliasDirect.status,
      aliasSummaryHasContinueCta: aliasSummaryHtml.includes(
        "Continue to donor sign-in ($80)"
      ),
      aliasSummaryHasReferenceUuid: aliasSummaryHtml.includes(
        `Reference ${SAMPLE_FUND_UUID}`
      ),
      monthlyActionButtonCount: actionAnchorCount,
      monthlyHasDonorDashboardLink: monthlyHtml.includes(
        '<a href="/donor-dashboard">Donor Dashboard</a>'
      ),
      monthlyHasSecondaryLinks: monthlyHtml.includes('class="secondary-links"'),
    }).toStrictEqual({
      alias400NotUnresolved: true,
      alias400PreservesAlias: true,
      alias400Status: 400,
      aliasDirectLocation: `http://127.0.0.1:3005/checkout?fund_id=${SAMPLE_FUND_UUID}&amount=80&entry_method=public_checkout&party_kind=person`,
      aliasDirectStatus: 307,
      aliasSummaryHasContinueCta: true,
      aliasSummaryHasReferenceUuid: true,
      monthlyActionButtonCount: 2,
      monthlyHasDonorDashboardLink: true,
      monthlyHasSecondaryLinks: true,
    });
  });

  it("routes cleanly to standalone /give/checkout or /give when DONOR_APP_BASE_URL is unset", () => {
    vi.stubEnv("DONOR_APP_BASE_URL", "");
    vi.stubEnv("NEXT_PUBLIC_DONOR_APP_BASE_URL", "");
    vi.stubEnv("CHECKOUT_BASE_URL", "");

    const designated = getCheckout(
      new NextRequest(
        "http://localhost:3000/checkout?fund_id=leadership-summit&amount=500&frequency=one-time"
      )
    );

    const bare = getCheckout(new NextRequest("http://localhost:3000/checkout"));

    expect({
      bareLocation: bare.headers.get("location"),
      bareStatus: bare.status,
      designatedLocation: designated.headers.get("location"),
      designatedStatus: designated.status,
    }).toStrictEqual({
      bareLocation: "/give",
      bareStatus: 307,
      designatedLocation:
        "/give/checkout?fund_id=leadership-summit&amount=500&frequency=one-time&entry_method=public_checkout&party_kind=person",
      designatedStatus: 307,
    });
  });

  it("renders synchronous standalone HTTP 200 gift summary HTML on via=form when DONOR_APP_BASE_URL is unset", async () => {
    vi.stubEnv("DONOR_APP_BASE_URL", "");
    vi.stubEnv("NEXT_PUBLIC_DONOR_APP_BASE_URL", "");
    vi.stubEnv("CHECKOUT_BASE_URL", "");

    const response = getCheckout(
      new NextRequest(
        "http://localhost:3000/checkout?via=form&fund_id=where-most-needed&amount=75"
      )
    );

    const offlineMonthly = getGiveCheckout(
      new NextRequest(
        "http://localhost:3000/give/checkout?fund=general&amount=25&frequency=monthly"
      )
    );

    const [html, offlineMonthlyHtml] = await Promise.all([
      response.text(),
      offlineMonthly.text(),
    ]);

    const navBlock =
      /<div class="nav-links">(?<nav>[\s\S]*?)<\/div>/u.exec(html)?.groups
        ?.nav ?? "";

    expect({
      contentType: response.headers.get("content-type"),
      footerKeepsSafeguardingLink: html.includes(
        'href="/contact#safeguarding">Urgent safeguarding'
      ),
      hasAmount: html.includes("$75"),
      hasHeading: html.includes("Arrange your designated gift"),
      hasRecipientHeading: html.includes(
        '<h2 class="subheading">Where Most Needed</h2>'
      ),
      headerOmitsSafeguardingLink: !navBlock.includes("/contact#safeguarding"),
      location: response.headers.get("location"),
      offlineMonthlyOmitsDonorDashboard:
        !offlineMonthlyHtml.includes("Donor Dashboard"),
      status: response.status,
    }).toStrictEqual({
      contentType: "text/html; charset=utf-8",
      footerKeepsSafeguardingLink: true,
      hasAmount: true,
      hasHeading: true,
      hasRecipientHeading: true,
      headerOmitsSafeguardingLink: true,
      location: null,
      offlineMonthlyOmitsDonorDashboard: true,
      status: 200,
    });
  });

  it("returns HTTP 204 for background Next.js RSC prefetches", () => {
    vi.stubEnv("DONOR_APP_BASE_URL", "http://127.0.0.1:3005");

    const prefetchResponse = getCheckout(
      new NextRequest(
        "http://localhost:3000/checkout?fund_id=where-most-needed&_rsc=abc123",
        {
          headers: {
            rsc: "1",
          },
        }
      )
    );

    expect({
      location: prefetchResponse.headers.get("location"),
      status: prefetchResponse.status,
    }).toStrictEqual({
      location: null,
      status: 204,
    });
  });

  it("returns HTTP 400 with an accessible branded correction form preserving recipient and value for invalid amounts", async () => {
    vi.stubEnv("DONOR_APP_BASE_URL", "http://127.0.0.1:3005");

    const subDollar = getCheckout(
      new NextRequest(
        "http://localhost:3000/checkout?via=form&fund_id=leadership-summit&amount=0.50"
      )
    );

    const overMax = getCheckout(
      new NextRequest(
        "http://localhost:3000/checkout?fund_id=where-most-needed&amount=1000001"
      )
    );

    const alpha = getCheckout(
      new NextRequest(
        "http://localhost:3000/checkout?missionary_id=beaumont&amount=abc"
      )
    );

    const [subHtml, overHtml, alphaHtml] = await Promise.all([
      subDollar.text(),
      overMax.text(),
      alpha.text(),
    ]);

    expect({
      alphaHasAlert: alphaHtml.includes('role="alert"'),
      alphaPreservesMissionary: alphaHtml.includes('value="beaumont"'),
      alphaPreservesRaw: alphaHtml.includes('value="abc"'),
      alphaStatus: alpha.status,
      overMaxHasLimitCopy: overHtml.includes("$1,000,000.00"),
      overMaxStatus: overMax.status,
      subDollarCleanPunctuation: subHtml.includes(
        "You entered &ldquo;0.50&rdquo;."
      ),
      subDollarHasMark: subHtml.includes('viewBox="0 0 140 101"'),
      subDollarHasMinCopy: subHtml.includes("at least $1.00"),
      subDollarPreservesFund: subHtml.includes('value="leadership-summit"'),
      subDollarPreservesViaForm: subHtml.includes('name="via" value="form"'),
      subDollarStatus: subDollar.status,
    }).toStrictEqual({
      alphaHasAlert: true,
      alphaPreservesMissionary: true,
      alphaPreservesRaw: true,
      alphaStatus: 400,
      overMaxHasLimitCopy: true,
      overMaxStatus: 400,
      subDollarCleanPunctuation: true,
      subDollarHasMark: true,
      subDollarHasMinCopy: true,
      subDollarPreservesFund: true,
      subDollarPreservesViaForm: true,
      subDollarStatus: 400,
    });
  });

  it("preserves unresolved, blank, conflicting, and unknown designations across redirects, HTTP 400 retries, and bookmarked summaries without silent General Fund fallback", async () => {
    vi.stubEnv("DONOR_APP_BASE_URL", "http://127.0.0.1:3005");
    vi.stubEnv("DONOR_APP_CHECKOUT_ENTRY", "login");

    const malformedRedirect = getCheckout(
      new NextRequest(
        "http://localhost:3000/checkout?fund=Where%20Most%20Needed&amount=25"
      )
    );

    const blankRedirect = getCheckout(
      new NextRequest("http://localhost:3000/checkout?fund=&amount=25")
    );

    const conflictRedirect = getCheckout(
      new NextRequest(
        "http://localhost:3000/checkout?fund=general&fund_id=where-most-needed&amount=25"
      )
    );

    const malformedInvalidAmount = getCheckout(
      new NextRequest(
        "http://localhost:3000/checkout?fund=Where%20Most%20Needed&amount=0.50"
      )
    );

    const retryAfterCorrection = getCheckout(
      new NextRequest(
        "http://localhost:3000/checkout?designation_status=unresolved&amount=25&entry_method=public_checkout&party_kind=person"
      )
    );

    const unresolvedSummary = getGiveCheckout(
      new NextRequest(
        "http://localhost:3000/give/checkout?designation_status=unresolved&amount=25"
      )
    );

    const unknownSlugSummary = getGiveCheckout(
      new NextRequest(
        "http://localhost:3000/give/checkout?fund_id=bogus-fund&amount=40"
      )
    );

    const unverifiedWorkerUuidRedirect = getCheckout(
      new NextRequest(
        "http://localhost:3000/checkout?workerId=beaumont&missionary_id=33333333-3333-4333-8333-333333333333&amount=100"
      )
    );

    const unverifiedWorkerUuidInvalidAmount = getCheckout(
      new NextRequest(
        "http://localhost:3000/checkout?workerId=beaumont&missionary_id=33333333-3333-4333-8333-333333333333&amount=0.50"
      )
    );

    const monthlyUuidSummary = getGiveCheckout(
      new NextRequest(
        "http://localhost:3000/give/checkout?missionary_id=33333333-3333-4333-8333-333333333333&amount=25&frequency=monthly"
      )
    );

    const amountOnlyBookmark = getGiveCheckout(
      new NextRequest("http://localhost:3000/give/checkout?amount=25")
    );

    const [
      malformed400Html,
      unresolvedHtml,
      unknownSlugHtml,
      amountOnlyHtml,
      unverified400Html,
      monthlyUuidHtml,
    ] = await Promise.all([
      malformedInvalidAmount.text(),
      unresolvedSummary.text(),
      unknownSlugSummary.text(),
      amountOnlyBookmark.text(),
      unverifiedWorkerUuidInvalidAmount.text(),
      monthlyUuidSummary.text(),
    ]);

    expect({
      amountOnlyNamesGeneralFund:
        amountOnlyHtml.includes(
          '<h2 class="subheading">The Global Fellowship General Fund</h2>'
        ) && !amountOnlyHtml.includes("Global Fellowship Ministry"),
      blankLocation: blankRedirect.headers.get("location"),
      conflictLocation: conflictRedirect.headers.get("location"),
      malformed400CarriesHiddenUnresolved: malformed400Html.includes(
        'name="designation_status" value="unresolved"'
      ),
      malformed400HasSkipLink: malformed400Html.includes(
        'class="skip-link" href="#main-content"'
      ),
      malformed400HonestIntro:
        malformed400Html.includes("could not match the gift link") &&
        !malformed400Html.includes("We preserved your designation"),
      malformed400Status: malformedInvalidAmount.status,
      malformedLocation: malformedRedirect.headers.get("location"),
      monthlyUuidIncludesOpaqueReferenceInMailtoAndSummary:
        monthlyUuidHtml.includes(
          "Reference 33333333-3333-4333-8333-333333333333"
        ) &&
        monthlyUuidHtml.includes(
          "Designation%20reference%3A%2033333333-3333-4333-8333-333333333333"
        ),
      retryNeverRedirectsToCore:
        retryAfterCorrection.headers.get("location") ===
        "/give/checkout?designation_status=unresolved&amount=25&entry_method=public_checkout&party_kind=person",
      unknownSlugConfirmsWithFinance:
        unknownSlugHtml.includes(">Confirm your gift designation</h1>") &&
        !unknownSlugHtml.includes("Global Fellowship Ministry") &&
        unknownSlugHtml.includes("help%20me%20confirm"),
      unresolvedConfirmsInsteadOfGeneral:
        unresolvedHtml.includes(">Confirm your gift designation</h1>") &&
        !unresolvedHtml.includes(">Continue to online checkout</h1>") &&
        unresolvedHtml.includes(">Email Finance</a>"),
      unverifiedWorkerUuid400BlocksNameLeak:
        !unverified400Html.includes("Beaumont") &&
        unverified400Html.includes(
          'name="designation_status" value="unresolved"'
        ),
      unverifiedWorkerUuidRedirectLocation:
        unverifiedWorkerUuidRedirect.headers.get("location"),
    }).toStrictEqual({
      amountOnlyNamesGeneralFund: true,
      blankLocation:
        "/give/checkout?designation_status=unresolved&amount=25&entry_method=public_checkout&party_kind=person",
      conflictLocation:
        "/give/checkout?designation_status=unresolved&amount=25&entry_method=public_checkout&party_kind=person",
      malformed400CarriesHiddenUnresolved: true,
      malformed400HasSkipLink: true,
      malformed400HonestIntro: true,
      malformed400Status: 400,
      malformedLocation:
        "/give/checkout?designation_status=unresolved&amount=25&entry_method=public_checkout&party_kind=person",
      monthlyUuidIncludesOpaqueReferenceInMailtoAndSummary: true,
      retryNeverRedirectsToCore: true,
      unknownSlugConfirmsWithFinance: true,
      unresolvedConfirmsInsteadOfGeneral: true,
      unverifiedWorkerUuid400BlocksNameLeak: true,
      unverifiedWorkerUuidRedirectLocation:
        "/give/checkout?designation_status=unresolved&amount=100&entry_method=public_checkout&party_kind=person",
    });
  });
});
