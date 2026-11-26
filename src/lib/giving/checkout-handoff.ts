import {
  isCorePaymentUuid,
  isDirectCoreOnlineTarget,
  isGeneralFundAlias,
  normalizeGivingFrequency,
  parseGivingAmount,
  sanitizeIdentifier,
} from "./checkout-client";
import type { CheckoutTarget, ParsedGivingAmount } from "./checkout-client";

export {
  buildSiteCheckoutHref,
  isCorePaymentUuid,
  isDirectCoreOnlineTarget,
  isGeneralFundAlias,
  LOCAL_DONOR_ROUTES,
  normalizeGivingFrequency,
  parseGivingAmount,
  sanitizeGivingAmount,
} from "./checkout-client";

export type { CheckoutTarget, GivingFrequency } from "./checkout-client";

const LOOPBACK_HOSTS = new Set(["localhost", "127.0.0.1", "[::1]", "::1"]);

const ALLOWED_DASHBOARD_SEGMENTS = new Set([
  "feed",
  "history",
  "pledges",
  "settings",
  "wallet",
]);

export type DonorCheckoutEntryMode = "direct" | "login";

const resolveMappedCoreDonationUuid = (
  rawKey: string | null | undefined,
  env: Readonly<Record<string, string | undefined>> = process.env
): string | null => {
  if (rawKey === null || rawKey === undefined) {
    return null;
  }

  const trimmed = rawKey.trim().toLowerCase();

  if (trimmed.length === 0) {
    return null;
  }

  return parseCoreDonationIdMap(env).get(trimmed) ?? null;
};

export const resolveCoreUuidOrAlias = (
  rawKey: string | null | undefined,
  env: Readonly<Record<string, string | undefined>> = process.env
): string | null => {
  if (rawKey === null || rawKey === undefined) {
    return null;
  }

  const trimmed = rawKey.trim();

  if (trimmed.length === 0) {
    return null;
  }

  return isCorePaymentUuid(trimmed)
    ? trimmed
    : resolveMappedCoreDonationUuid(trimmed, env);
};

/**
 * Server-side online checkout eligibility check incorporating optional
 * `CORE_DONATION_ID_MAP` env UUID mappings alongside direct Core targets,
 * applying the exact same paired `workerId` + `missionaryId` guard used by
 * `classifyCheckoutDesignation()`.
 */
export const isOnlineCheckoutEligible = (
  target: CheckoutTarget,
  env: Readonly<Record<string, string | undefined>> = process.env
): boolean => {
  if (getDonorAppBaseUrl(env) === null) {
    return false;
  }

  if (target.kind === "missionary") {
    const resolvedUuid = resolveCoreUuidOrAlias(target.missionaryId, env);

    if (resolvedUuid === null) {
      return false;
    }

    if (
      target.workerId !== undefined &&
      target.workerId.trim().length > 0 &&
      !isVerifiedWorkerUuidPair(target.workerId.trim(), resolvedUuid, env)
    ) {
      return false;
    }

    return true;
  }

  if (isDirectCoreOnlineTarget(target)) {
    return true;
  }

  return resolveCoreUuidOrAlias(target.fundId, env) !== null;
};

export const normalizeDonorAppBaseUrl = (
  raw: string | null | undefined
): string | null => {
  if (raw === null || raw === undefined) {
    return null;
  }

  const trimmed = raw.trim();

  if (trimmed.length === 0) {
    return null;
  }

  try {
    const parsed = new URL(trimmed);

    if (
      parsed.protocol === "https:" ||
      (parsed.protocol === "http:" && LOOPBACK_HOSTS.has(parsed.hostname))
    ) {
      return parsed.toString().replace(/\/+$/u, "");
    }

    return null;
  } catch {
    return null;
  }
};

export const getDonorAppBaseUrl = (
  env: Readonly<Record<string, string | undefined>> = process.env
): string | null =>
  normalizeDonorAppBaseUrl(
    env.DONOR_APP_BASE_URL ??
      env.NEXT_PUBLIC_DONOR_APP_BASE_URL ??
      env.CHECKOUT_BASE_URL
  );

export const getDonorCheckoutEntryMode = (
  env: Readonly<Record<string, string | undefined>> = process.env
): DonorCheckoutEntryMode =>
  env.DONOR_APP_CHECKOUT_ENTRY?.trim().toLowerCase() === "direct"
    ? "direct"
    : "login";

const parseCoreDonationIdMap = (
  env: Readonly<Record<string, string | undefined>> = process.env
): ReadonlyMap<string, string> => {
  const raw = env.CORE_DONATION_ID_MAP?.trim();

  if (raw === undefined || raw.length === 0) {
    return new Map();
  }

  try {
    const parsed: unknown = JSON.parse(raw);

    if (
      !(parsed instanceof Object) ||
      Array.isArray(parsed) ||
      Object.prototype.toString.call(parsed) !== "[object Object]"
    ) {
      return new Map();
    }

    const entries = new Map<string, string>();

    for (const [key, value] of Object.entries(parsed)) {
      if (Object.prototype.toString.call(value) === "[object String]") {
        const candidate = String(value);

        if (isCorePaymentUuid(candidate)) {
          entries.set(key.trim().toLowerCase(), candidate.trim());
        }
      }
    }

    return entries;
  } catch {
    return new Map();
  }
};

export type CheckoutDesignationState =
  | "fund_slug"
  | "general"
  | "missionary"
  | "none"
  | "unresolved";

export interface SanitizedCheckoutParams {
  readonly amountError: Extract<
    ParsedGivingAmount,
    { readonly kind: "invalid" }
  > | null;
  readonly designationState: CheckoutDesignationState;
  readonly hasExplicitTarget: boolean;
  readonly params: URLSearchParams;
  readonly rawAmount: string | null;
}

interface ClassifiedDesignation {
  readonly fundId?: string;
  readonly missionaryId?: string;
  readonly state: CheckoutDesignationState;
  readonly workerId?: string;
}

interface CollectedParamValues {
  readonly invalid: boolean;
  readonly values: readonly string[];
}

const collectSanitizedParamValues = (
  rawValues: readonly string[]
): CollectedParamValues => {
  const values: string[] = [];

  for (const raw of rawValues) {
    const clean = sanitizeIdentifier(raw);

    if (clean === null) {
      return { invalid: true, values: [] };
    }

    values.push(clean);
  }

  return { invalid: false, values };
};

export const isVerifiedWorkerUuidPair = (
  workerId: string,
  missionaryId: string,
  env: Readonly<Record<string, string | undefined>> = process.env
): boolean => {
  if (workerId.toLowerCase() === missionaryId.toLowerCase()) {
    return true;
  }

  if (!isCorePaymentUuid(missionaryId)) {
    return false;
  }

  const mappedUuid = parseCoreDonationIdMap(env).get(workerId.toLowerCase());

  return (
    mappedUuid !== undefined &&
    mappedUuid.toLowerCase() === missionaryId.toLowerCase()
  );
};

const classifyCheckoutDesignation = (
  incoming: URLSearchParams,
  env: Readonly<Record<string, string | undefined>> = process.env
): ClassifiedDesignation => {
  if (incoming.has("designation_status")) {
    return { state: "unresolved" };
  }

  const missionaryCollected = collectSanitizedParamValues([
    ...incoming.getAll("missionary_id"),
    ...incoming.getAll("missionary"),
  ]);

  const workerCollected = collectSanitizedParamValues(
    incoming.getAll("workerId")
  );

  const fundCollected = collectSanitizedParamValues([
    ...incoming.getAll("fund"),
    ...incoming.getAll("fund_id"),
    ...incoming.getAll("fundId"),
  ]);

  if (
    missionaryCollected.invalid ||
    workerCollected.invalid ||
    fundCollected.invalid
  ) {
    return { state: "unresolved" };
  }

  const workerUnique = new Set(
    workerCollected.values.map((value) => value.toLowerCase())
  );

  if (workerUnique.size > 1) {
    return { state: "unresolved" };
  }

  const distinctTargets = new Set<string>();

  for (const value of fundCollected.values) {
    distinctTargets.add(
      isGeneralFundAlias(value) ? "general" : `fund:${value.toLowerCase()}`
    );
  }

  const primaryMissionaryValues =
    missionaryCollected.values.length > 0
      ? missionaryCollected.values
      : workerCollected.values;

  for (const value of primaryMissionaryValues) {
    distinctTargets.add(`missionary:${value.toLowerCase()}`);
  }

  if (distinctTargets.size === 0) {
    return { state: "none" };
  }

  if (distinctTargets.size > 1) {
    return { state: "unresolved" };
  }

  const soleTarget = [...distinctTargets][0] ?? "";

  if (soleTarget === "general") {
    return { state: "general" };
  }

  if (soleTarget.startsWith("fund:")) {
    return { fundId: fundCollected.values[0], state: "fund_slug" };
  }

  const [missionaryId] = primaryMissionaryValues;
  const [workerId] = workerCollected.values;

  if (
    missionaryId !== undefined &&
    workerId !== undefined &&
    !isVerifiedWorkerUuidPair(workerId, missionaryId, env)
  ) {
    return { state: "unresolved" };
  }

  return {
    missionaryId,
    state: "missionary",
    workerId,
  };
};

export const sanitizeIncomingCheckoutParams = (
  incoming: URLSearchParams,
  env: Readonly<Record<string, string | undefined>> = process.env
): SanitizedCheckoutParams => {
  const params = new URLSearchParams();
  const designation = classifyCheckoutDesignation(incoming, env);

  if (designation.state === "unresolved") {
    params.set("designation_status", "unresolved");
  } else if (designation.state === "general") {
    params.set("fund", "general");
  } else if (
    designation.state === "fund_slug" &&
    designation.fundId !== undefined
  ) {
    params.set("fund_id", designation.fundId);
  } else if (
    designation.state === "missionary" &&
    designation.missionaryId !== undefined
  ) {
    if (designation.workerId !== undefined) {
      params.set("workerId", designation.workerId);
    }

    params.set("missionary_id", designation.missionaryId);
  }

  const rawAmount = incoming.get("amount");
  const parsedAmount = parseGivingAmount(rawAmount);

  let amountError: Extract<
    ParsedGivingAmount,
    { readonly kind: "invalid" }
  > | null = null;

  if (parsedAmount.kind === "valid") {
    params.set("amount", parsedAmount.formatted);
  } else if (parsedAmount.kind === "invalid") {
    amountError = parsedAmount;
  }

  const frequency = normalizeGivingFrequency(incoming.get("frequency"));

  if (frequency !== null) {
    params.set("frequency", frequency);
  }

  params.set("entry_method", "public_checkout");
  params.set("party_kind", "person");

  const sourceCode = sanitizeIdentifier(incoming.get("source_code"));

  if (sourceCode !== null) {
    params.set("source_code", sourceCode);
  }

  return {
    amountError,
    designationState: designation.state,
    hasExplicitTarget: designation.state !== "none",
    params,
    rawAmount,
  };
};

type CoreCheckoutResolution =
  | { readonly eligible: true; readonly coreParams: URLSearchParams }
  | { readonly eligible: false };

/**
 * Enforces `Asymmetric-al/core`'s exact `begin_donation_saga` UUID contract
 * before any redirect to `apps/donor`:
 * - General Fund (`fund=general`, `general-fund`, or genuinely unspecified bare
 *   checkout) normalizes cleanly to `fund=general` (Core passes `p_fund_id:
 *   null, p_missionary_id: null`).
 * - Verified Core UUIDs (from live Core CMS or `CORE_DONATION_ID_MAP`) pass
 *   through as exact UUID `fund_id` / `missionary_id`.
 * - Blank, malformed, conflicting, or unmapped designations return
 *   `{ eligible: false }` so GF-SITE never forwards a doomed slug or silently
 *   reroutes donor intent into the General Fund.
 */
const resolveCoreCheckoutParams = (
  incoming: URLSearchParams,
  env: Readonly<Record<string, string | undefined>> = process.env
): CoreCheckoutResolution => {
  const { designationState, params } = sanitizeIncomingCheckoutParams(
    incoming,
    env
  );

  const coreParams = new URLSearchParams();

  const amount = params.get("amount");
  const frequency = params.get("frequency");

  if (frequency === "monthly" || designationState === "unresolved") {
    return { eligible: false };
  }

  const sourceCode = params.get("source_code");
  const missionaryId = params.get("missionary_id");
  const workerId = params.get("workerId");
  const fundId = params.get("fund_id");

  if (designationState === "missionary" && missionaryId !== null) {
    const resolvedUuid = resolveCoreUuidOrAlias(missionaryId, env);

    if (resolvedUuid === null) {
      return { eligible: false };
    }

    if (workerId !== null) {
      coreParams.set("workerId", workerId);
    }

    coreParams.set("missionary_id", resolvedUuid);
  } else if (designationState === "none" || designationState === "general") {
    coreParams.set("fund", "general");
  } else if (designationState === "fund_slug" && fundId !== null) {
    const resolvedUuid = resolveCoreUuidOrAlias(fundId, env);

    if (resolvedUuid === null) {
      return { eligible: false };
    }

    coreParams.set("fund_id", resolvedUuid);
  } else {
    return { eligible: false };
  }

  if (amount !== null) {
    coreParams.set("amount", amount);
  }

  if (frequency !== null) {
    coreParams.set("frequency", frequency);
  }

  coreParams.set("entry_method", "public_checkout");
  coreParams.set("party_kind", "person");

  if (sourceCode !== null) {
    coreParams.set("source_code", sourceCode);
  }

  return { coreParams, eligible: true };
};

/**
 * Builds the exact Core Donor Application URL for `/checkout` handoff.
 * Returns `null` if the requested designation is an unmapped non-UUID slug
 * that Core's `begin_donation_saga` RPC cannot accept.
 */
export const buildCoreDonorCheckoutUrl = (input: {
  readonly donorAppBaseUrl: string;
  readonly searchParams: URLSearchParams;
  readonly entryMode?: DonorCheckoutEntryMode;
  readonly env?: Readonly<Record<string, string | undefined>>;
}): string | null => {
  const baseUrl = normalizeDonorAppBaseUrl(input.donorAppBaseUrl);

  if (baseUrl === null) {
    throw new Error("Invalid Core Donor Application base URL");
  }

  const resolution = resolveCoreCheckoutParams(input.searchParams, input.env);

  if (!resolution.eligible) {
    return null;
  }

  const relativeCheckoutPath = `/checkout?${resolution.coreParams.toString()}`;

  if ((input.entryMode ?? "login") === "direct") {
    return new URL(relativeCheckoutPath, `${baseUrl}/`).toString();
  }

  const loginUrl = new URL("/login", `${baseUrl}/`);

  loginUrl.searchParams.set("next", relativeCheckoutPath);

  return loginUrl.toString();
};

export const buildCoreDonorDashboardUrl = (input: {
  readonly donorAppBaseUrl: string;
  readonly slugSegments?: readonly string[];
}): string => {
  const baseUrl = normalizeDonorAppBaseUrl(input.donorAppBaseUrl);

  if (baseUrl === null) {
    throw new Error("Invalid Core Donor Application base URL");
  }

  const firstSegment = input.slugSegments?.[0]?.trim().toLowerCase();

  if (
    firstSegment !== undefined &&
    ALLOWED_DASHBOARD_SEGMENTS.has(firstSegment)
  ) {
    return new URL(
      `/donor-dashboard/${firstSegment}`,
      `${baseUrl}/`
    ).toString();
  }

  return new URL("/donor-dashboard", `${baseUrl}/`).toString();
};

const sanitizeRelativeNextPath = (raw: string | null): string | null => {
  if (raw === null) {
    return null;
  }

  const trimmed = raw.trim();

  if (
    trimmed.length === 0 ||
    !trimmed.startsWith("/") ||
    trimmed.startsWith("//") ||
    /^[a-zA-Z][a-zA-Z\d+\-.]*:/u.test(trimmed)
  ) {
    return null;
  }

  try {
    const parsed = new URL(trimmed, "http://localhost");

    if (parsed.origin !== "http://localhost") {
      return null;
    }

    if (parsed.pathname === "/checkout") {
      const resolution = resolveCoreCheckoutParams(parsed.searchParams);

      if (!resolution.eligible) {
        return null;
      }

      return `/checkout?${resolution.coreParams.toString()}`;
    }

    if (parsed.pathname === "/donor-dashboard") {
      return "/donor-dashboard";
    }

    if (parsed.pathname.startsWith("/donor-dashboard/")) {
      const segment = parsed.pathname
        .slice("/donor-dashboard/".length)
        .split("/")[0]
        ?.trim()
        .toLowerCase();

      if (segment !== undefined && ALLOWED_DASHBOARD_SEGMENTS.has(segment)) {
        return `/donor-dashboard/${segment}`;
      }
    }

    return null;
  } catch {
    return null;
  }
};

export const isRscPrefetchRequest = (
  headers: Headers,
  searchParams: URLSearchParams
): boolean =>
  headers.get("rsc") === "1" ||
  headers.get("next-router-prefetch") === "1" ||
  searchParams.has("_rsc");

export const buildCoreDonorLoginUrl = (input: {
  readonly donorAppBaseUrl: string;
  readonly nextPath?: string | null;
}): string => {
  const baseUrl = normalizeDonorAppBaseUrl(input.donorAppBaseUrl);

  if (baseUrl === null) {
    throw new Error("Invalid Core Donor Application base URL");
  }

  const loginUrl = new URL("/login", `${baseUrl}/`);
  const safeNext = sanitizeRelativeNextPath(input.nextPath ?? null);

  if (safeNext !== null) {
    loginUrl.searchParams.set("next", safeNext);
  }

  return loginUrl.toString();
};
