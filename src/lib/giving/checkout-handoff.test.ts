import { describe, expect, it } from "vitest";

import {
  buildCoreDonorCheckoutUrl,
  buildCoreDonorDashboardUrl,
  buildCoreDonorLoginUrl,
  buildSiteCheckoutHref,
  getDonorAppBaseUrl,
  getDonorCheckoutEntryMode,
  isCorePaymentUuid,
  isDirectCoreOnlineTarget,
  isOnlineCheckoutEligible,
  normalizeDonorAppBaseUrl,
  parseGivingAmount,
  sanitizeGivingAmount,
} from "./checkout-handoff";

const SAMPLE_FUND_UUID = "11111111-1111-4111-8111-111111111111";
const SAMPLE_MISSIONARY_UUID = "33333333-3333-4333-8333-333333333333";

describe("Core Donor Application checkout and dashboard plumbing", () => {
  it("normalizes DONOR_APP_BASE_URL with HTTPS-only remote enforcement and loopback allowance", () => {
    expect({
      defaultEntry: getDonorCheckoutEntryMode({}),
      directEntry: getDonorCheckoutEntryMode({
        DONOR_APP_CHECKOUT_ENTRY: "direct",
      }),
      envPreferred: getDonorAppBaseUrl({
        CHECKOUT_BASE_URL: "https://old.example.org",
        DONOR_APP_BASE_URL: "https://give.globalfellowship.org/",
      }),
      insecureRejected: normalizeDonorAppBaseUrl("http://remote.example.org"),
      loopbackAllowed: normalizeDonorAppBaseUrl("http://127.0.0.1:3005/"),
      unset: getDonorAppBaseUrl({}),
    }).toStrictEqual({
      defaultEntry: "login",
      directEntry: "direct",
      envPreferred: "https://give.globalfellowship.org",
      insecureRejected: null,
      loopbackAllowed: "http://127.0.0.1:3005",
      unset: null,
    });
  });

  it("builds same-origin /checkout URLs and distinguishes Core-ready targets from unmapped standing slugs", () => {
    const missionary = buildSiteCheckoutHref({
      amount: 100,
      frequency: "one-time",
      sourceCode: "missionary-beaumont",
      target: {
        kind: "missionary",
        missionaryId: "beaumont",
        workerId: "beaumont",
      },
    });

    const project = buildSiteCheckoutHref({
      amount: "75.50",
      sourceCode: "card-project-where-most-needed",
      target: { fundId: "where-most-needed", kind: "fund" },
    });

    const generalFund = buildSiteCheckoutHref({
      amount: 50,
      frequency: "one-time",
      target: { fundId: "general-fund", kind: "fund" },
    });

    expect({
      generalFund,
      generalOnlineReady: isDirectCoreOnlineTarget({
        fundId: "general-fund",
        kind: "fund",
      }),
      missionary,
      project,
      unmappedMissionaryReady: isDirectCoreOnlineTarget({
        kind: "missionary",
        missionaryId: "beaumont",
      }),
      unmappedSlugReady: isDirectCoreOnlineTarget({
        fundId: "leadership-summit",
        kind: "fund",
      }),
      unmappedWhereMostNeededReady: isDirectCoreOnlineTarget({
        fundId: "where-most-needed",
        kind: "fund",
      }),
      uuidCheck: isCorePaymentUuid(SAMPLE_FUND_UUID),
      uuidOnlineReady: isDirectCoreOnlineTarget({
        fundId: SAMPLE_FUND_UUID,
        kind: "fund",
      }),
    }).toStrictEqual({
      generalFund:
        "/checkout?fund=general&amount=50&frequency=one-time&entry_method=public_checkout&party_kind=person",
      generalOnlineReady: true,
      missionary:
        "/checkout?workerId=beaumont&missionary_id=beaumont&amount=100&frequency=one-time&entry_method=public_checkout&party_kind=person&source_code=missionary-beaumont",
      project:
        "/checkout?fund_id=where-most-needed&amount=75.50&entry_method=public_checkout&party_kind=person&source_code=card-project-where-most-needed",
      unmappedMissionaryReady: false,
      unmappedSlugReady: false,
      unmappedWhereMostNeededReady: false,
      uuidCheck: true,
      uuidOnlineReady: true,
    });
  });

  it("enforces Core's UUID and one-time contract: allows general-fund and valid UUIDs, blocks unmapped slugs and monthly online RPCs, and protects open redirects", () => {
    const generalLogin = buildCoreDonorCheckoutUrl({
      donorAppBaseUrl: "http://127.0.0.1:3005",
      entryMode: "login",
      searchParams: new URLSearchParams("fund_id=general-fund&amount=75"),
    });

    const monthlyBlocked = buildCoreDonorCheckoutUrl({
      donorAppBaseUrl: "http://127.0.0.1:3005",
      entryMode: "login",
      searchParams: new URLSearchParams(
        "fund=general&amount=25&frequency=monthly"
      ),
    });

    const whereMostNeededUnmappedBlocked = buildCoreDonorCheckoutUrl({
      donorAppBaseUrl: "http://127.0.0.1:3005",
      entryMode: "login",
      searchParams: new URLSearchParams("fund_id=where-most-needed&amount=75"),
    });

    const fundParamWhereMostNeededBlocked = buildCoreDonorCheckoutUrl({
      donorAppBaseUrl: "http://127.0.0.1:3005",
      entryMode: "login",
      searchParams: new URLSearchParams("fund=where-most-needed&amount=25"),
    });

    const fundParamBogusBlocked = buildCoreDonorCheckoutUrl({
      donorAppBaseUrl: "http://127.0.0.1:3005",
      entryMode: "login",
      searchParams: new URLSearchParams("fund=bogus-fund&amount=40"),
    });

    const fundParamMalformedBlocked = buildCoreDonorCheckoutUrl({
      donorAppBaseUrl: "http://127.0.0.1:3005",
      entryMode: "login",
      searchParams: new URLSearchParams("fund=invalid!slug&amount=40"),
    });

    const fundParamSpacesBlocked = buildCoreDonorCheckoutUrl({
      donorAppBaseUrl: "http://127.0.0.1:3005",
      entryMode: "login",
      searchParams: new URLSearchParams("fund=Where%20Most%20Needed&amount=25"),
    });

    const fundParamBlankBlocked = buildCoreDonorCheckoutUrl({
      donorAppBaseUrl: "http://127.0.0.1:3005",
      entryMode: "login",
      searchParams: new URLSearchParams("fund=&amount=25"),
    });

    const conflictingTargetsBlocked = buildCoreDonorCheckoutUrl({
      donorAppBaseUrl: "http://127.0.0.1:3005",
      entryMode: "login",
      searchParams: new URLSearchParams(
        "fund=general&fund_id=where-most-needed&amount=25"
      ),
    });

    const duplicateConflictingBlocked = buildCoreDonorCheckoutUrl({
      donorAppBaseUrl: "http://127.0.0.1:3005",
      entryMode: "login",
      searchParams: new URLSearchParams(
        "fund=general&fund=where-most-needed&amount=25"
      ),
    });

    const compatibleGeneralAliasesAllowed = buildCoreDonorCheckoutUrl({
      donorAppBaseUrl: "http://127.0.0.1:3005",
      entryMode: "direct",
      searchParams: new URLSearchParams(
        "fund=general&fund_id=general-fund&amount=25"
      ),
    });

    const unverifiedWorkerUuidBlocked = buildCoreDonorCheckoutUrl({
      donorAppBaseUrl: "https://give.globalfellowship.org",
      entryMode: "direct",
      searchParams: new URLSearchParams(
        `workerId=beaumont&missionary_id=${SAMPLE_MISSIONARY_UUID}&amount=100&frequency=one-time`
      ),
    });

    const verifiedWorkerUuidDirect = buildCoreDonorCheckoutUrl({
      donorAppBaseUrl: "https://give.globalfellowship.org",
      entryMode: "direct",
      env: {
        CORE_DONATION_ID_MAP: JSON.stringify({
          beaumont: SAMPLE_MISSIONARY_UUID,
        }),
      },
      searchParams: new URLSearchParams(
        `workerId=beaumont&missionary_id=${SAMPLE_MISSIONARY_UUID}&amount=100&frequency=one-time`
      ),
    });

    const standaloneMissionaryUuidDirect = buildCoreDonorCheckoutUrl({
      donorAppBaseUrl: "https://give.globalfellowship.org",
      entryMode: "direct",
      searchParams: new URLSearchParams(
        `missionary_id=${SAMPLE_MISSIONARY_UUID}&amount=100&frequency=one-time`
      ),
    });

    const envMappedSlug = buildCoreDonorCheckoutUrl({
      donorAppBaseUrl: "http://127.0.0.1:3005",
      entryMode: "direct",
      env: {
        CORE_DONATION_ID_MAP: JSON.stringify({
          "leadership-summit": SAMPLE_FUND_UUID,
        }),
      },
      searchParams: new URLSearchParams("fund_id=leadership-summit&amount=500"),
    });

    const unmappedSlugBlocked = buildCoreDonorCheckoutUrl({
      donorAppBaseUrl: "http://127.0.0.1:3005",
      entryMode: "login",
      searchParams: new URLSearchParams("fund_id=leadership-summit&amount=500"),
    });

    const unmappedMissionaryBlocked = buildCoreDonorCheckoutUrl({
      donorAppBaseUrl: "http://127.0.0.1:3005",
      entryMode: "login",
      searchParams: new URLSearchParams("missionary_id=beaumont&amount=100"),
    });

    const bareFallback = buildCoreDonorCheckoutUrl({
      donorAppBaseUrl: "http://127.0.0.1:3005",
      entryMode: "direct",
      searchParams: new URLSearchParams(),
    });

    const pledges = buildCoreDonorDashboardUrl({
      donorAppBaseUrl: "http://127.0.0.1:3005",
      slugSegments: ["pledges"],
    });

    const unknownSegment = buildCoreDonorDashboardUrl({
      donorAppBaseUrl: "http://127.0.0.1:3005",
      slugSegments: ["../admin"],
    });

    const blockedLoginNext = buildCoreDonorLoginUrl({
      donorAppBaseUrl: "http://127.0.0.1:3005",
      nextPath: "https://evil.example/phish",
    });

    const safeLoginNext = buildCoreDonorLoginUrl({
      donorAppBaseUrl: "http://127.0.0.1:3005",
      nextPath: "/donor-dashboard/history",
    });

    expect({
      bareFallback,
      blockedLoginNext,
      compatibleGeneralAliasesAllowed,
      conflictingTargetsBlocked,
      duplicateConflictingBlocked,
      envMappedSlug,
      fundParamBlankBlocked,
      fundParamBogusBlocked,
      fundParamMalformedBlocked,
      fundParamSpacesBlocked,
      fundParamWhereMostNeededBlocked,
      generalLogin,
      monthlyBlocked,
      pledges,
      safeLoginNext,
      standaloneMissionaryUuidDirect,
      unknownSegment,
      unmappedMissionaryBlocked,
      unmappedSlugBlocked,
      unverifiedWorkerUuidBlocked,
      verifiedWorkerUuidDirect,
      whereMostNeededUnmappedBlocked,
    }).toStrictEqual({
      bareFallback:
        "http://127.0.0.1:3005/checkout?fund=general&entry_method=public_checkout&party_kind=person",
      blockedLoginNext: "http://127.0.0.1:3005/login",
      compatibleGeneralAliasesAllowed:
        "http://127.0.0.1:3005/checkout?fund=general&amount=25&entry_method=public_checkout&party_kind=person",
      conflictingTargetsBlocked: null,
      duplicateConflictingBlocked: null,
      envMappedSlug: `http://127.0.0.1:3005/checkout?fund_id=${SAMPLE_FUND_UUID}&amount=500&entry_method=public_checkout&party_kind=person`,
      fundParamBlankBlocked: null,
      fundParamBogusBlocked: null,
      fundParamMalformedBlocked: null,
      fundParamSpacesBlocked: null,
      fundParamWhereMostNeededBlocked: null,
      generalLogin:
        "http://127.0.0.1:3005/login?next=%2Fcheckout%3Ffund%3Dgeneral%26amount%3D75%26entry_method%3Dpublic_checkout%26party_kind%3Dperson",
      monthlyBlocked: null,
      pledges: "http://127.0.0.1:3005/donor-dashboard/pledges",
      safeLoginNext:
        "http://127.0.0.1:3005/login?next=%2Fdonor-dashboard%2Fhistory",
      standaloneMissionaryUuidDirect: `https://give.globalfellowship.org/checkout?missionary_id=${SAMPLE_MISSIONARY_UUID}&amount=100&frequency=one-time&entry_method=public_checkout&party_kind=person`,
      unknownSegment: "http://127.0.0.1:3005/donor-dashboard",
      unmappedMissionaryBlocked: null,
      unmappedSlugBlocked: null,
      unverifiedWorkerUuidBlocked: null,
      verifiedWorkerUuidDirect: `https://give.globalfellowship.org/checkout?workerId=beaumont&missionary_id=${SAMPLE_MISSIONARY_UUID}&amount=100&frequency=one-time&entry_method=public_checkout&party_kind=person`,
      whereMostNeededUnmappedBlocked: null,
    });
  });

  it("enforces one exact-cent $1.00-$1,000,000.00 validator with comma-grouped thousands support and rejects malformed inputs", () => {
    expect({
      aboveMax: parseGivingAmount("1000001").kind,
      alpha: parseGivingAmount("abc").kind,
      badCommaDouble: parseGivingAmount("1,,000").kind,
      badCommaGroup: parseGivingAmount("1,2").kind,
      badCommaLeading: parseGivingAmount(",500").kind,
      belowMin: parseGivingAmount("0.50").kind,
      blank: parseGivingAmount("   ").kind,
      commaCents: parseGivingAmount("$1,250.50"),
      commaMaxBoundary: sanitizeGivingAmount("1,000,000.00"),
      commaWhole: sanitizeGivingAmount("1,250"),
      envMapEligible: isOnlineCheckoutEligible(
        { fundId: "leadership-summit", kind: "fund" },
        {
          CORE_DONATION_ID_MAP: JSON.stringify({
            "leadership-summit": SAMPLE_FUND_UUID,
          }),
          DONOR_APP_BASE_URL: "http://127.0.0.1:3005",
        }
      ),
      unconfiguredGeneralNotOnline: isOnlineCheckoutEligible(
        { fundId: "general-fund", kind: "fund" },
        {}
      ),
      unverifiedWorkerUuidNotEligible: isOnlineCheckoutEligible(
        {
          kind: "missionary",
          missionaryId: SAMPLE_MISSIONARY_UUID,
          workerId: "beaumont",
        },
        { DONOR_APP_BASE_URL: "http://127.0.0.1:3005" }
      ),
      standaloneUuidMissionaryEligible: isOnlineCheckoutEligible(
        {
          kind: "missionary",
          missionaryId: SAMPLE_MISSIONARY_UUID,
        },
        { DONOR_APP_BASE_URL: "http://127.0.0.1:3005" }
      ),
      exactCents: parseGivingAmount("125.50"),
      maxBoundary: sanitizeGivingAmount("1000000"),
      minBoundary: sanitizeGivingAmount("1.00"),
      overMaxSanitized: sanitizeGivingAmount("1000000.01"),
      subDollarSanitized: sanitizeGivingAmount("0.99"),
      threeDecimals: parseGivingAmount("12.345").kind,
    }).toStrictEqual({
      aboveMax: "invalid",
      alpha: "invalid",
      badCommaDouble: "invalid",
      badCommaGroup: "invalid",
      badCommaLeading: "invalid",
      belowMin: "invalid",
      blank: "empty",
      commaCents: {
        cents: 125_050,
        dollars: 1250.5,
        formatted: "1250.50",
        kind: "valid",
      },
      commaMaxBoundary: "1000000",
      commaWhole: "1250",
      envMapEligible: true,
      exactCents: {
        cents: 12_550,
        dollars: 125.5,
        formatted: "125.50",
        kind: "valid",
      },
      maxBoundary: "1000000",
      minBoundary: "1",
      overMaxSanitized: null,
      standaloneUuidMissionaryEligible: true,
      subDollarSanitized: null,
      threeDecimals: "invalid",
      unconfiguredGeneralNotOnline: false,
      unverifiedWorkerUuidNotEligible: false,
    });
  });
});
