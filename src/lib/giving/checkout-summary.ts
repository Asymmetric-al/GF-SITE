import { findPublicMissionary } from "@/lib/content/public-missionaries";
import { STANDING_PROJECTS } from "@/lib/content/standing-projects";
import {
  isGeneralFundAlias,
  isVerifiedWorkerUuidPair,
  normalizeGivingFrequency,
  resolveCoreUuidOrAlias,
  sanitizeGivingAmount,
  sanitizeIncomingCheckoutParams,
} from "@/lib/giving/checkout-handoff";
import type {
  CheckoutDesignationState,
  GivingFrequency,
  SanitizedCheckoutParams,
} from "@/lib/giving/checkout-handoff";

type CheckoutRecipientResolution =
  | "general_default"
  | "known"
  | "unknown_slug"
  | "unresolved";

export interface CheckoutSummaryInput {
  readonly amount?: string | null;
  readonly designationState?: CheckoutDesignationState;
  readonly frequency?: string | null;
  readonly fund?: string | null;
  readonly fundId?: string | null;
  readonly missionaryId?: string | null;
  readonly workerId?: string | null;
}

export interface ResolvedCheckoutSummary {
  readonly backHref: string;
  readonly backLabel: string;
  readonly designationKind: string;
  readonly formattedAmount: string | null;
  readonly frequency: GivingFrequency | null;
  readonly recipientName: string;
  readonly recipientResolution: CheckoutRecipientResolution;
  readonly referenceId: string | null;
}

const USD_WHOLE_FORMATTER = new Intl.NumberFormat("en-US", {
  currency: "USD",
  maximumFractionDigits: 0,
  style: "currency",
});

const USD_CENTS_FORMATTER = new Intl.NumberFormat("en-US", {
  currency: "USD",
  maximumFractionDigits: 2,
  minimumFractionDigits: 2,
  style: "currency",
});

const formatStandaloneGivingAmount = (
  raw: string | null | undefined
): string | null => {
  const clean = sanitizeGivingAmount(raw);

  if (clean === null) {
    return null;
  }

  const numeric = Number(clean);

  return Number.isInteger(numeric)
    ? USD_WHOLE_FORMATTER.format(numeric)
    : USD_CENTS_FORMATTER.format(numeric);
};

const GENERAL_FUND_SUMMARY = {
  backHref: "/projects/general-fund#give",
  backLabel: "Return to General Fund",
  designationKind: "General Fund",
  recipientName: "The Global Fellowship General Fund",
  referenceId: null,
} as const;

const buildUnresolvedSummary = (
  formattedAmount: string | null,
  frequency: GivingFrequency | null
): ResolvedCheckoutSummary => ({
  backHref: "/give",
  backLabel: "Choose a missionary or project",
  designationKind: "Needs confirmation",
  formattedAmount,
  frequency,
  recipientName: "Unrecognized gift designation",
  recipientResolution: "unresolved",
  referenceId: null,
});

const resolveMissionarySummary = (
  missionaryId: string,
  workerId: string | null,
  formattedAmount: string | null,
  frequency: GivingFrequency | null,
  env: Readonly<Record<string, string | undefined>>
): ResolvedCheckoutSummary => {
  const lookupKey =
    workerId !== null && workerId.trim().length > 0 ? workerId : missionaryId;

  const publicProfile = findPublicMissionary(lookupKey);
  const mappedUuid = resolveCoreUuidOrAlias(missionaryId, env);

  if (publicProfile !== null) {
    return {
      backHref: `/missionaries/${publicProfile.id}#give`,
      backLabel: `Return to ${publicProfile.name}`,
      designationKind: "Missionary support",
      formattedAmount,
      frequency,
      recipientName: publicProfile.name,
      recipientResolution: "known",
      referenceId: mappedUuid,
    };
  }

  if (mappedUuid !== null) {
    return {
      backHref: "/missionaries",
      backLabel: "Browse missionaries",
      designationKind: "Missionary support",
      formattedAmount,
      frequency,
      recipientName: "Designated Global Fellowship Missionary",
      recipientResolution: "known",
      referenceId: mappedUuid,
    };
  }

  return {
    backHref: "/missionaries",
    backLabel: "Browse missionaries",
    designationKind: "Needs confirmation",
    formattedAmount,
    frequency,
    recipientName: "Unrecognized missionary designation",
    recipientResolution: "unknown_slug",
    referenceId: null,
  };
};

const resolveFundSummary = (
  fundId: string,
  formattedAmount: string | null,
  frequency: GivingFrequency | null,
  env: Readonly<Record<string, string | undefined>>
): ResolvedCheckoutSummary => {
  if (isGeneralFundAlias(fundId)) {
    return {
      ...GENERAL_FUND_SUMMARY,
      formattedAmount,
      frequency,
      recipientResolution: "known",
    };
  }

  const normalizedFundId = fundId.trim().toLowerCase();
  const mappedUuid = resolveCoreUuidOrAlias(fundId, env);

  const project = STANDING_PROJECTS.find(
    (entry) =>
      entry.fundId.toLowerCase() === normalizedFundId ||
      entry.slug.toLowerCase() === normalizedFundId
  );

  if (project !== undefined) {
    return {
      backHref: `/projects/${project.slug}#give`,
      backLabel: `Return to ${project.title}`,
      designationKind: project.category,
      formattedAmount,
      frequency,
      recipientName: project.title,
      recipientResolution: "known",
      referenceId: mappedUuid,
    };
  }

  if (mappedUuid !== null) {
    return {
      backHref: "/projects",
      backLabel: "Browse ministry projects",
      designationKind: "Ministry project",
      formattedAmount,
      frequency,
      recipientName: "Designated Global Fellowship Fund",
      recipientResolution: "known",
      referenceId: mappedUuid,
    };
  }

  return {
    backHref: "/projects",
    backLabel: "Browse ministry projects",
    designationKind: "Needs confirmation",
    formattedAmount,
    frequency,
    recipientName: "Unrecognized gift designation",
    recipientResolution: "unknown_slug",
    referenceId: null,
  };
};

export const resolveStandaloneCheckoutSummary = (
  input: CheckoutSummaryInput,
  env: Readonly<Record<string, string | undefined>> = process.env
): ResolvedCheckoutSummary => {
  const formattedAmount = formatStandaloneGivingAmount(input.amount);
  const frequency = normalizeGivingFrequency(input.frequency);

  if (input.designationState === "unresolved") {
    return buildUnresolvedSummary(formattedAmount, frequency);
  }

  const cleanMissionaryId = input.missionaryId?.trim() ?? "";
  const cleanWorkerId = input.workerId?.trim() ?? "";

  if (cleanMissionaryId.length > 0 || cleanWorkerId.length > 0) {
    if (
      cleanMissionaryId.length > 0 &&
      cleanWorkerId.length > 0 &&
      !isVerifiedWorkerUuidPair(cleanWorkerId, cleanMissionaryId, env)
    ) {
      return buildUnresolvedSummary(formattedAmount, frequency);
    }

    const authoritativeMissionaryId =
      cleanMissionaryId.length > 0 ? cleanMissionaryId : cleanWorkerId;

    return resolveMissionarySummary(
      authoritativeMissionaryId,
      cleanWorkerId.length > 0 ? cleanWorkerId : null,
      formattedAmount,
      frequency,
      env
    );
  }

  const fundCandidate = input.fund ?? input.fundId ?? null;

  if (fundCandidate !== null && fundCandidate.trim().length > 0) {
    return resolveFundSummary(fundCandidate, formattedAmount, frequency, env);
  }

  return {
    ...GENERAL_FUND_SUMMARY,
    formattedAmount,
    frequency,
    recipientResolution: "general_default",
  };
};

export interface AuthoritativeCheckoutRequest extends SanitizedCheckoutParams {
  readonly summary: ResolvedCheckoutSummary;
}

/**
 * Single authoritative server-side checkout resolver combining parameter
 * classification (`sanitizeIncomingCheckoutParams`) with catalog and
 * `CORE_DONATION_ID_MAP` recipient verification
 * (`resolveStandaloneCheckoutSummary`). When Core CMS is not connected,
 * unrecognized unmapped slugs (`bogus-fund`) normalize immediately to
 * `designation_status=unresolved` across redirects, HTTP `400` retries, and
 * `/give/checkout`, while configured `CORE_DONATION_ID_MAP` aliases resolve
 * consistently across eligibility, routing, and summary views.
 */
export const resolveAuthoritativeCheckoutRequest = (
  incoming: URLSearchParams,
  env: Readonly<Record<string, string | undefined>> = process.env
): AuthoritativeCheckoutRequest => {
  const sanitized = sanitizeIncomingCheckoutParams(incoming, env);

  const summary = resolveStandaloneCheckoutSummary(
    {
      amount: sanitized.params.get("amount"),
      designationState: sanitized.designationState,
      frequency: sanitized.params.get("frequency"),
      fund: sanitized.params.get("fund"),
      fundId: sanitized.params.get("fund_id") ?? sanitized.params.get("fundId"),
      missionaryId: sanitized.params.get("missionary_id"),
      workerId: sanitized.params.get("workerId"),
    },
    env
  );

  const isCoreCmsConnected = Boolean(env.CMS_BASE_URL?.trim());

  if (summary.recipientResolution === "unknown_slug" && !isCoreCmsConnected) {
    const normalizedParams = new URLSearchParams(sanitized.params);

    normalizedParams.delete("fund");
    normalizedParams.delete("fund_id");
    normalizedParams.delete("fundId");
    normalizedParams.delete("missionary_id");
    normalizedParams.delete("workerId");
    normalizedParams.set("designation_status", "unresolved");

    return {
      ...sanitized,
      designationState: "unresolved",
      params: normalizedParams,
      summary: {
        ...summary,
        recipientResolution: "unresolved",
      },
    };
  }

  return {
    ...sanitized,
    summary,
  };
};
