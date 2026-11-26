const GENERAL_FUND_ALIASES = new Set(["general", "general-fund"]);

const CORE_UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/iu;

const GIVING_AMOUNT_MIN_CENTS = 100;
const GIVING_AMOUNT_MAX_CENTS = 100_000_000;

const EXACT_USD_PATTERN = /^(?:\d+|\d{1,3}(?:,\d{3})+)(?:\.\d{1,2})?$/u;

export const isCorePaymentUuid = (value: string | null | undefined): boolean =>
  value !== null && value !== undefined && CORE_UUID_PATTERN.test(value.trim());

export const isGeneralFundAlias = (value: string | null | undefined): boolean =>
  value !== null &&
  value !== undefined &&
  GENERAL_FUND_ALIASES.has(value.trim().toLowerCase());

export type ParsedGivingAmount =
  | { readonly kind: "empty" }
  | {
      readonly kind: "valid";
      readonly cents: number;
      readonly dollars: number;
      readonly formatted: string;
    }
  | {
      readonly kind: "invalid";
      readonly raw: string;
      readonly reason: "format" | "below-min" | "above-max";
      readonly message: string;
    };

/**
 * Parses a donor-entered USD gift amount into exact integer cents with a
 * single shared contract (`$1.00` minimum, `$1,000,000.00` online maximum)
 * enforced identically across `QuickGiveInput`, `GivingHandoffWidget`, and
 * the server-side `/checkout` Route Handler. Never rounds, truncates, or
 * silently clamps invalid values.
 */
export const parseGivingAmount = (
  amount: number | string | null | undefined
): ParsedGivingAmount => {
  if (amount === null || amount === undefined) {
    return { kind: "empty" };
  }

  const normalized = String(amount).trim();

  if (normalized.length === 0) {
    return { kind: "empty" };
  }

  const stripped = normalized.startsWith("$")
    ? normalized.slice(1).trim()
    : normalized;

  if (!EXACT_USD_PATTERN.test(stripped)) {
    return {
      kind: "invalid",
      message:
        "Enter a dollar amount using numbers only, such as 50, 1,250, or 25.50.",
      raw: normalized,
      reason: "format",
    };
  }

  const normalizedNumber = stripped.replaceAll(",", "");
  const [wholePart = "0", fracPart = ""] = normalizedNumber.split(".");
  const wholeDollars = Number(wholePart);
  const centsPart = Number(fracPart.padEnd(2, "0"));

  if (
    !Number.isSafeInteger(wholeDollars) ||
    wholeDollars > GIVING_AMOUNT_MAX_CENTS / 100
  ) {
    return {
      kind: "invalid",
      message:
        "Online gifts are accepted up to $1,000,000.00. For larger gifts, contact finance@globalfellowship.org.",
      raw: normalized,
      reason: "above-max",
    };
  }

  const cents = wholeDollars * 100 + centsPart;

  if (cents < GIVING_AMOUNT_MIN_CENTS) {
    return {
      kind: "invalid",
      message: "Enter a gift amount of at least $1.00.",
      raw: normalized,
      reason: "below-min",
    };
  }

  if (cents > GIVING_AMOUNT_MAX_CENTS) {
    return {
      kind: "invalid",
      message:
        "Online gifts are accepted up to $1,000,000.00. For larger gifts, contact finance@globalfellowship.org.",
      raw: normalized,
      reason: "above-max",
    };
  }

  const dollars = cents / 100;

  return {
    cents,
    dollars,
    formatted:
      cents % 100 === 0 ? String(Math.trunc(dollars)) : dollars.toFixed(2),
    kind: "valid",
  };
};

/**
 * Matches `CheckoutFrequency` in `Asymmetric-al/core`
 * (`apps/donor/app/(public)/(solid)/checkout/checkout-donation.ts`).
 */
export type GivingFrequency = "monthly" | "one-time";

export type CheckoutTarget =
  | {
      readonly kind: "missionary";
      readonly missionaryId: string;
      readonly workerId?: string;
    }
  | { readonly kind: "fund"; readonly fundId: string };

export interface CheckoutHandoffInput {
  readonly target: CheckoutTarget;
  readonly amount?: number | string | null;
  readonly frequency?: GivingFrequency | null;
  readonly sourceCode?: string;
}

/**
 * Returns `true` ONLY when a target can complete `Asymmetric-al/core`'s
 * `begin_donation_saga` RPC directly (General Fund alias or a tenant-valid
 * UUID designation). Standing-catalog slugs without a mapped Core UUID return
 * `false` so donor UI stays truthful before click.
 */
export const isDirectCoreOnlineTarget = (target: CheckoutTarget): boolean => {
  if (target.kind === "missionary") {
    return isCorePaymentUuid(target.missionaryId);
  }

  return isGeneralFundAlias(target.fundId) || isCorePaymentUuid(target.fundId);
};

export const LOCAL_DONOR_ROUTES = {
  checkout: "/checkout",
  dashboard: "/donor-dashboard",
  feed: "/donor-dashboard/feed",
  history: "/donor-dashboard/history",
  login: "/login",
  pledges: "/donor-dashboard/pledges",
  settings: "/donor-dashboard/settings",
  wallet: "/donor-dashboard/wallet",
} as const;

export const sanitizeGivingAmount = (
  amount: number | string | null | undefined
): string | null => {
  const parsed = parseGivingAmount(amount);

  return parsed.kind === "valid" ? parsed.formatted : null;
};

export const normalizeGivingFrequency = (
  raw: string | null | undefined
): GivingFrequency | null => {
  if (raw === null || raw === undefined) {
    return null;
  }

  const normalized = raw.trim().toLowerCase();

  if (normalized === "monthly") {
    return "monthly";
  }

  if (normalized === "one-time" || normalized === "one_time") {
    return "one-time";
  }

  return null;
};

export const sanitizeIdentifier = (
  raw: string | null | undefined
): string | null => {
  if (raw === null || raw === undefined) {
    return null;
  }

  const trimmed = raw.trim();

  if (trimmed.length === 0 || trimmed.length > 120) {
    return null;
  }

  return /^[a-zA-Z0-9_-]+$/u.test(trimmed) ? trimmed : null;
};

export const buildCheckoutQueryParams = (
  input: CheckoutHandoffInput
): URLSearchParams => {
  const params = new URLSearchParams();

  if (input.target.kind === "missionary") {
    const workerId = sanitizeIdentifier(input.target.workerId);
    const missionaryId = sanitizeIdentifier(input.target.missionaryId);

    if (workerId !== null) {
      params.set("workerId", workerId);
    }

    if (missionaryId !== null) {
      params.set("missionary_id", missionaryId);
    }
  } else {
    const trimmedFund = sanitizeIdentifier(input.target.fundId);

    if (trimmedFund !== null) {
      if (isGeneralFundAlias(trimmedFund)) {
        params.set("fund", "general");
      } else {
        params.set("fund_id", trimmedFund);
      }
    }
  }

  const formattedAmount = sanitizeGivingAmount(input.amount);

  if (formattedAmount !== null) {
    params.set("amount", formattedAmount);
  }

  const normalizedFrequency = normalizeGivingFrequency(input.frequency);

  if (normalizedFrequency !== null) {
    params.set("frequency", normalizedFrequency);
  }

  params.set("entry_method", "public_checkout");
  params.set("party_kind", "person");

  const trimmedSource = sanitizeIdentifier(input.sourceCode);

  if (trimmedSource !== null) {
    params.set("source_code", trimmedSource);
  }

  return params;
};

export const buildSiteCheckoutHref = (input: CheckoutHandoffInput): string => {
  const query = buildCheckoutQueryParams(input).toString();

  return query.length > 0 ? `/checkout?${query}` : "/checkout";
};
