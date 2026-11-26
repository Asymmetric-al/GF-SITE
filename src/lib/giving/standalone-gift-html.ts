import { getContactDesk, VERIFIED_ORGANIZATION } from "@/lib/brand/contact";
import {
  buildCoreDonorCheckoutUrl,
  getDonorCheckoutEntryMode,
  LOCAL_DONOR_ROUTES,
  sanitizeGivingAmount,
} from "@/lib/giving/checkout-handoff";
import type { CheckoutDesignationState } from "@/lib/giving/checkout-handoff";
import { resolveStandaloneCheckoutSummary } from "@/lib/giving/checkout-summary";
import type { ResolvedCheckoutSummary } from "@/lib/giving/checkout-summary";
import { renderStandaloneNoticeHtml } from "@/lib/http/standalone-notice-html";
import type { StandaloneNoticeLinkedParagraph } from "@/lib/http/standalone-notice-html";

interface GiftAction {
  readonly href: string;
  readonly label: string;
  readonly primary?: boolean;
}

interface GiftSecondaryLink {
  readonly href: string;
  readonly label: string;
}

interface GiftViewContent {
  readonly actions: readonly GiftAction[];
  readonly heading: string;
  readonly linkedStatusNote?: StandaloneNoticeLinkedParagraph;
  readonly secondaryLinks: readonly GiftSecondaryLink[];
  readonly statusNote?: string;
  readonly subheading?: string;
  readonly title: string;
}

const isUnconfirmedSummary = (summary: ResolvedCheckoutSummary): boolean =>
  summary.recipientResolution === "unresolved" ||
  summary.recipientResolution === "unknown_slug";

const formatReferenceSuffix = (referenceId: string | null): string =>
  referenceId === null ? "" : ` · Reference ${referenceId}`;

const formatStandaloneAmountLine = (input: {
  readonly hasDirectOnline: boolean;
  readonly isMonthly: boolean;
  readonly summary: ResolvedCheckoutSummary;
}): string => {
  const { hasDirectOnline, isMonthly, summary } = input;
  const referenceSuffix = formatReferenceSuffix(summary.referenceId);

  if (isUnconfirmedSummary(summary)) {
    if (summary.formattedAmount === null) {
      return isMonthly
        ? "Selected cadence: Monthly gift (designation to confirm)."
        : "Selected gift: Designation to confirm.";
    }

    const amountWithCadence = isMonthly
      ? `${summary.formattedAmount}/month`
      : summary.formattedAmount;

    return `Selected gift: ${amountWithCadence} (designation to confirm).`;
  }

  if (hasDirectOnline) {
    return summary.formattedAmount === null
      ? `One-time online gift${referenceSuffix}.`
      : `Selected gift: ${summary.formattedAmount} · One-time online gift${referenceSuffix}.`;
  }

  if (isMonthly) {
    return summary.formattedAmount === null
      ? `Selected cadence: Monthly recurring gift${referenceSuffix}.`
      : `Selected gift: ${summary.formattedAmount}/month · Monthly recurring gift${referenceSuffix}.`;
  }

  return summary.formattedAmount === null
    ? `One-time designated gift${referenceSuffix}.`
    : `Selected gift: ${summary.formattedAmount} · One-time designated gift${referenceSuffix}.`;
};

const buildFinanceMailtoHref = (input: {
  readonly email: string;
  readonly isMonthly: boolean;
  readonly subjectPrefix: string;
  readonly summary: ResolvedCheckoutSummary;
}): string => {
  const cadenceLabel = input.isMonthly ? "monthly" : "one-time";

  const amountPhrase =
    input.summary.formattedAmount === null
      ? `a ${cadenceLabel} gift`
      : `a ${cadenceLabel} gift of ${input.summary.formattedAmount}${input.isMonthly ? "/month" : ""}`;

  if (isUnconfirmedSummary(input.summary)) {
    const body = `Hello Global Fellowship Finance team,\n\nI tried to follow a giving link for ${amountPhrase}, but the designation could not be matched automatically. Could you help me confirm the right missionary or project designation?\n`;

    return `mailto:${input.email}?subject=${encodeURIComponent("Confirm Gift Designation")}&body=${encodeURIComponent(body)}`;
  }

  const referenceLine =
    input.summary.referenceId === null
      ? ""
      : `\nDesignation reference: ${input.summary.referenceId}`;

  const body = `Hello Global Fellowship Finance team,\n\nI would like to arrange ${amountPhrase} designated for ${input.summary.recipientName}.${referenceLine}\n\nPlease share the best next steps.\n`;

  return `mailto:${input.email}?subject=${encodeURIComponent(`${input.subjectPrefix}: ${input.summary.recipientName}`)}&body=${encodeURIComponent(body)}`;
};

const buildUnconfirmedContent = (input: {
  readonly financeHref: string;
  readonly generalHref: string | null;
  readonly isMonthly: boolean;
  readonly summary: ResolvedCheckoutSummary;
}): GiftViewContent => {
  const alternateLabel =
    input.summary.formattedAmount === null
      ? "Alternate: give one-time online to the General Fund"
      : `Alternate: give ${input.summary.formattedAmount} ${input.isMonthly ? "one-time " : ""}online to the General Fund`;

  return {
    actions: [
      {
        href: input.financeHref,
        label: "Email Finance",
        primary: true,
      },
      ...(input.generalHref === null
        ? []
        : [
            {
              href: input.generalHref,
              label: alternateLabel,
            },
          ]),
    ],
    heading: "Confirm your gift designation",
    secondaryLinks: [
      {
        href: "/give",
        label: "Choose a missionary or project",
      },
    ],
    statusNote:
      "We could not match this gift link automatically, so your gift has not been routed to another fund. Email our Finance team to confirm the intended missionary or project, or choose a designation below.",
    title: "Confirm Your Gift Designation",
  };
};

const buildMonthlyContent = (input: {
  readonly donorAppBaseUrl: string | null;
  readonly financeHref: string;
  readonly oneTimeHref: string | null;
  readonly summary: ResolvedCheckoutSummary;
}): GiftViewContent => {
  const monthlyLabel =
    input.summary.formattedAmount === null
      ? "this monthly designation"
      : `this ${input.summary.formattedAmount}/month gift`;

  const tailText = ` because online checkout currently processes one-time gifts. Email Finance below to set up ${monthlyLabel}${input.oneTimeHref === null ? "." : ", or give one-time online instead."}`;

  const linkedStatusNote: StandaloneNoticeLinkedParagraph | undefined =
    input.donorAppBaseUrl === null
      ? undefined
      : {
          after: tailText,
          before:
            "Monthly recurring gifts are arranged through our Finance office or your ",
          href: LOCAL_DONOR_ROUTES.dashboard,
          linkText: "Donor Dashboard",
        };

  return {
    actions: [
      {
        href: input.financeHref,
        label: "Email Finance",
        primary: true,
      },
      ...(input.oneTimeHref === null
        ? []
        : [
            {
              href: input.oneTimeHref,
              label:
                input.summary.formattedAmount === null
                  ? "Give one-time online instead"
                  : `Give ${input.summary.formattedAmount} one-time online instead`,
            },
          ]),
    ],
    heading: "Start a monthly gift",
    linkedStatusNote,
    secondaryLinks: [
      {
        href: input.summary.backHref,
        label: input.summary.backLabel,
      },
      {
        href: "/give",
        label: "Ways to give",
      },
    ],
    statusNote:
      linkedStatusNote === undefined
        ? `Monthly recurring gifts are arranged through our Finance office${tailText}`
        : undefined,
    subheading: input.summary.recipientName,
    title: "Start a Monthly Gift",
  };
};

const buildDirectOnlineContent = (input: {
  readonly continueHref: string;
  readonly financeHref: string;
  readonly summary: ResolvedCheckoutSummary;
}): GiftViewContent => ({
  actions: [
    {
      href: input.continueHref,
      label:
        input.summary.formattedAmount === null
          ? "Continue to donor sign-in"
          : `Continue to donor sign-in (${input.summary.formattedAmount})`,
      primary: true,
    },
    {
      href: input.financeHref,
      label: "Email Finance",
    },
  ],
  heading: "Continue to online checkout",
  secondaryLinks: [
    {
      href: input.summary.backHref,
      label: input.summary.backLabel,
    },
    {
      href: "/give",
      label: "Ways to give",
    },
  ],
  statusNote: `Continue to Global Fellowship's donor portal below to sign in and complete your gift, or mail a check payable to ${VERIFIED_ORGANIZATION.legalName} to ${VERIFIED_ORGANIZATION.mailingAddress} with an enclosed designation slip.`,
  subheading: input.summary.recipientName,
  title: "Continue to Online Checkout",
});

const buildDesignatedOfflineContent = (input: {
  readonly financeHref: string;
  readonly generalHref: string | null;
  readonly summary: ResolvedCheckoutSummary;
}): GiftViewContent => ({
  actions: [
    {
      href: input.financeHref,
      label: "Email Finance",
      primary: true,
    },
    ...(input.generalHref === null
      ? []
      : [
          {
            href: input.generalHref,
            label:
              input.summary.formattedAmount === null
                ? "Alternate: give online to the General Fund"
                : `Alternate: give ${input.summary.formattedAmount} online to the General Fund`,
          },
        ]),
  ],
  heading: "Arrange your designated gift",
  secondaryLinks: [
    {
      href: input.summary.backHref,
      label: input.summary.backLabel,
    },
    {
      href: "/give",
      label: "Ways to give",
    },
  ],
  statusNote:
    input.generalHref === null
      ? `Mail a check payable to ${VERIFIED_ORGANIZATION.legalName} to ${VERIFIED_ORGANIZATION.mailingAddress} with your designation noted on an enclosed slip, or email our Finance desk below.`
      : `Gifts for this designation are received by check or through our Finance office. Mail a check payable to ${VERIFIED_ORGANIZATION.legalName} to ${VERIFIED_ORGANIZATION.mailingAddress} with an enclosed slip, email Finance below, or choose an alternate one-time online gift to the General Fund.`,
  subheading: input.summary.recipientName,
  title: "Arrange Your Designated Gift",
});

/**
 * Renders the synchronous Brand-Kit gift-instructions page shared by
 * `/give/checkout` and `/checkout?via=form` whenever online card checkout is
 * unattached, awaiting a tenant payment UUID, requested as monthly, or
 * carrying an unresolved/unrecognized designation. Always places
 * `<main id="main-content">` strictly before `<footer>` with zero Suspense
 * streaming and vendored fonts.
 */
export const renderStandaloneGiftSummaryHtml = (input: {
  readonly params: URLSearchParams;
  readonly designationState?: CheckoutDesignationState;
  readonly donorAppBaseUrl: string | null;
  readonly unmappedDesignation: boolean;
  readonly directOnlineCheckoutUrl?: string | null;
}): string => {
  const financeDesk = getContactDesk("finance");

  const summary = resolveStandaloneCheckoutSummary({
    amount: input.params.get("amount"),
    designationState: input.designationState,
    frequency: input.params.get("frequency"),
    fund: input.params.get("fund"),
    fundId: input.params.get("fund_id") ?? input.params.get("fundId"),
    missionaryId: input.params.get("missionary_id"),
    workerId: input.params.get("workerId"),
  });

  const isMonthlyRequest = summary.frequency === "monthly";

  const hasDirectOnline =
    !isMonthlyRequest &&
    !isUnconfirmedSummary(summary) &&
    input.directOnlineCheckoutUrl !== undefined &&
    input.directOnlineCheckoutUrl !== null;

  const amountLine = formatStandaloneAmountLine({
    hasDirectOnline,
    isMonthly: isMonthlyRequest,
    summary,
  });

  const financeMailto = (subjectPrefix: string): string =>
    buildFinanceMailtoHref({
      email: financeDesk.email,
      isMonthly: isMonthlyRequest,
      subjectPrefix,
      summary,
    });

  const cleanAmount = sanitizeGivingAmount(input.params.get("amount"));

  const generalParams = new URLSearchParams({
    frequency: "one-time",
    fund: "general",
  });

  if (cleanAmount !== null) {
    generalParams.set("amount", cleanAmount);
  }

  const onlineGeneralUrl =
    input.donorAppBaseUrl === null
      ? null
      : buildCoreDonorCheckoutUrl({
          donorAppBaseUrl: input.donorAppBaseUrl,
          entryMode: getDonorCheckoutEntryMode(),
          searchParams: generalParams,
        });

  const generalHref =
    onlineGeneralUrl === null ? null : `/checkout?${generalParams.toString()}`;

  const oneTimeTargetParams = new URLSearchParams(input.params);

  oneTimeTargetParams.set("frequency", "one-time");

  const oneTimeTargetCoreUrl =
    input.donorAppBaseUrl === null
      ? null
      : buildCoreDonorCheckoutUrl({
          donorAppBaseUrl: input.donorAppBaseUrl,
          entryMode: getDonorCheckoutEntryMode(),
          searchParams: oneTimeTargetParams,
        });

  let content: GiftViewContent;

  if (isUnconfirmedSummary(summary)) {
    content = buildUnconfirmedContent({
      financeHref: financeMailto("Confirm Gift Designation"),
      generalHref,
      isMonthly: isMonthlyRequest,
      summary,
    });
  } else if (isMonthlyRequest) {
    content = buildMonthlyContent({
      donorAppBaseUrl: input.donorAppBaseUrl,
      financeHref: financeMailto("Monthly Giving"),
      oneTimeHref:
        oneTimeTargetCoreUrl === null
          ? null
          : `/checkout?${oneTimeTargetParams.toString()}`,
      summary,
    });
  } else if (hasDirectOnline) {
    const checkoutQuery = input.params.toString();

    content = buildDirectOnlineContent({
      continueHref:
        checkoutQuery.length > 0 ? `/checkout?${checkoutQuery}` : "/checkout",
      financeHref: financeMailto("Giving Designation"),
      summary,
    });
  } else {
    content = buildDesignatedOfflineContent({
      financeHref: financeMailto("Giving Designation"),
      generalHref: input.unmappedDesignation ? generalHref : null,
      summary,
    });
  }

  return renderStandaloneNoticeHtml({
    actions: content.actions,
    heading: content.heading,
    kicker: `Global Fellowship Giving · 501(c)(3) EIN ${VERIFIED_ORGANIZATION.ein}`,
    linkedParagraph: content.linkedStatusNote,
    paragraphs:
      content.statusNote === undefined
        ? [amountLine]
        : [amountLine, content.statusNote],
    secondaryLinks: content.secondaryLinks,
    subheading: content.subheading,
    title: content.title,
  });
};
