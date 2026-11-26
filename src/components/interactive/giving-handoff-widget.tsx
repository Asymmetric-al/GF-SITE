"use client";

import Link from "next/link";
import { useId, useRef, useState, useSyncExternalStore } from "react";
import type { ComponentProps, RefObject } from "react";

import { ArrowRightIcon } from "@/components/brand/ui-arrow";
import { RollingUsdCounter } from "@/components/interactive/rolling-usd-counter";
import { buttonVariants } from "@/components/ui/button-variants";
import { CLIENT_SUPPORT_CONTACT } from "@/lib/brand/client-contact";
import { cx } from "@/lib/cx";
import {
  buildCheckoutQueryParams,
  buildSiteCheckoutHref,
  isDirectCoreOnlineTarget,
  LOCAL_DONOR_ROUTES,
  parseGivingAmount,
} from "@/lib/giving/checkout-client";
import type { CheckoutTarget } from "@/lib/giving/checkout-client";

interface GivingPresetTier {
  readonly amount: number;
  readonly label?: string;
}

const DEFAULT_PRESETS: readonly GivingPresetTier[] = [
  { amount: 50 },
  { amount: 100 },
  { amount: 250 },
  { amount: 500 },
] as const;

interface GivingHandoffWidgetProps {
  readonly recipientName: string;
  readonly target: CheckoutTarget;
  readonly presets?: readonly GivingPresetTier[];
  readonly initialAmount?: string | null;
  readonly sourceCode?: string;
  readonly onlineCheckoutEligible?: boolean;
  readonly generalFundOnlineEligible?: boolean;
}

interface InitialGivingState {
  readonly initialInput: string;
  readonly initialPreset: number | "custom";
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

const formatUsd = (amount: number): string =>
  Number.isInteger(amount)
    ? USD_WHOLE_FORMATTER.format(amount)
    : USD_CENTS_FORMATTER.format(amount);

const subscribeNoop = () => () => {
  // Static location snapshot without mutating history.
};

const getWindowSearchSnapshot = (): string => window.location.search;

const getServerSearchSnapshot = (): string => "";

const resolveInitialGivingState = (
  presets: readonly GivingPresetTier[],
  initialAmount: string | null | undefined,
  locationSearch: string
): InitialGivingState => {
  const fallbackAmount = presets[1]?.amount ?? presets[0]?.amount ?? 100;

  const effectiveRaw =
    initialAmount ?? new URLSearchParams(locationSearch).get("amount");

  const parsedInitial = parseGivingAmount(effectiveRaw);

  if (parsedInitial.kind !== "valid") {
    return {
      initialInput: String(fallbackAmount),
      initialPreset: fallbackAmount,
    };
  }

  const matchedPreset = presets.find(
    (tier) => tier.amount === parsedInitial.dollars
  );

  return {
    initialInput: parsedInitial.formatted,
    initialPreset:
      matchedPreset === undefined ? "custom" : matchedPreset.amount,
  };
};

const GivingWidgetFooter = ({
  directOnlineReady,
  generalFundOnlineEligible,
  recipientName,
}: {
  readonly directOnlineReady: boolean;
  readonly generalFundOnlineEligible: boolean;
  readonly recipientName: string;
}) => (
  <div className="border-border text-muted-foreground flex flex-col gap-2.5 border-t pt-4 text-sm leading-relaxed">
    {directOnlineReady ? (
      <p>
        Next step: you will sign in to Global Fellowship&apos;s online checkout
        to complete a one-time gift for{" "}
        <strong className="text-foreground font-semibold">
          {recipientName}
        </strong>
        . Need monthly recurring giving? Manage pledges in your{" "}
        <a
          className="text-primary font-medium underline underline-offset-4"
          href={LOCAL_DONOR_ROUTES.dashboard}
        >
          Donor Dashboard
        </a>{" "}
        or contact Finance.
      </p>
    ) : (
      <p>
        Next step: review check and Finance designation instructions for{" "}
        <strong className="text-foreground font-semibold">
          {recipientName}
        </strong>
        {generalFundOnlineEligible
          ? ", or give online right away through "
          : ", or review "}
        <Link
          className="text-primary font-medium underline underline-offset-4"
          href="/projects/general-fund"
        >
          The Global Fellowship General Fund
        </Link>
        .
      </p>
    )}
    <p>
      Tax-deductible U.S. 501(c)(3), EIN {CLIENT_SUPPORT_CONTACT.ein}.{" "}
      <Link
        className="text-primary font-medium underline underline-offset-4"
        href="/give"
      >
        Give by check, stock, or DAF
      </Link>{" "}
      ·{" "}
      <Link
        className="text-primary font-medium underline underline-offset-4"
        href="/financials"
      >
        Financials
      </Link>
    </p>
  </div>
);

const GivingPresetGrid = ({
  onSelectPreset,
  presets,
  selectedPreset,
}: {
  readonly onSelectPreset: (amount: number) => void;
  readonly presets: readonly GivingPresetTier[];
  readonly selectedPreset: number | "custom";
}) => (
  <div className="gf-js-block grid grid-cols-2 gap-2">
    {presets.map((preset) => {
      const isSelected = selectedPreset === preset.amount;

      return (
        <button
          aria-pressed={isSelected}
          className={cx(
            "focus-visible:outline-ring flex min-h-11 cursor-pointer flex-col items-center justify-center rounded-xl border px-3 py-2 text-center transition-colors focus-visible:outline-2 focus-visible:outline-offset-2",
            isSelected
              ? "border-primary bg-accent text-primary font-semibold"
              : "border-border bg-card text-foreground hover:bg-linen font-medium"
          )}
          key={preset.amount}
          onClick={() => {
            onSelectPreset(preset.amount);
          }}
          type="button"
        >
          <span className="gf-tabular text-sm sm:text-base">
            {formatUsd(preset.amount)}
          </span>
          {preset.label === undefined ? null : (
            <span className="text-muted-foreground mt-0.5 text-xs leading-tight font-normal">
              {preset.label}
            </span>
          )}
        </button>
      );
    })}
  </div>
);

const GivingAmountField = ({
  customAmount,
  errorId,
  inputId,
  inputRef,
  liveError,
  onBlurAmount,
  onChangeAmount,
}: {
  readonly customAmount: string;
  readonly errorId: string;
  readonly inputId: string;
  readonly inputRef: RefObject<HTMLInputElement | null>;
  readonly liveError: string | null;
  readonly onBlurAmount: () => void;
  readonly onChangeAmount: (nextValue: string) => void;
}) => (
  <div className="flex flex-col gap-1.5 pt-1">
    <label
      className="text-muted-foreground text-sm font-medium"
      htmlFor={inputId}
    >
      Gift amount ($1.00 to $1,000,000.00)
    </label>
    <div className="relative flex items-center">
      <span
        aria-hidden="true"
        className="text-muted-foreground pointer-events-none absolute left-3.5 text-sm font-semibold"
      >
        $
      </span>
      <input
        aria-describedby={liveError === null ? undefined : errorId}
        aria-invalid={liveError === null ? undefined : true}
        className="border-input bg-card text-foreground focus-visible:outline-ring gf-tabular min-h-11 w-full rounded-xl border py-2 pr-14 pl-8 text-sm font-medium focus-visible:outline-2 focus-visible:outline-offset-2"
        id={inputId}
        inputMode="decimal"
        name="amount"
        onBlur={onBlurAmount}
        onChange={(event) => {
          onChangeAmount(event.currentTarget.value);
        }}
        placeholder="100"
        ref={inputRef}
        type="text"
        value={customAmount}
      />
      <span
        aria-hidden="true"
        className="text-muted-foreground pointer-events-none absolute right-3.5 text-xs font-semibold tracking-wide select-none"
      >
        USD
      </span>
    </div>
    <p
      aria-live={liveError === null ? "polite" : undefined}
      className={
        liveError === null ? "sr-only" : "text-destructive text-xs font-medium"
      }
      id={errorId}
      role={liveError === null ? undefined : "alert"}
    >
      {liveError ?? ""}
    </p>
  </div>
);

/**
 * Native-form giving widget for project and missionary detail pages.
 * - Truthfully distinguishes direct online Core checkout targets (`general`,
 *   `general-fund`, or verified Core UUIDs) from standing-catalog designations
 *   awaiting a linked Core fund UUID.
 * - Preserves typed/pasted input so invalid values reach the shared exact-cent
 *   validator with clear `role="alert"` feedback.
 * - Keeps no-JS rendering clean: hides JS-only preset legend/buttons and uses
 *   an amount-neutral native submit label when scripting is disabled.
 */
export const GivingHandoffWidget = ({
  recipientName,
  target,
  presets = DEFAULT_PRESETS,
  initialAmount,
  sourceCode,
  onlineCheckoutEligible,
  generalFundOnlineEligible = true,
}: GivingHandoffWidgetProps) => {
  const inputId = useId();
  const errorId = useId();
  const inputRef = useRef<HTMLInputElement>(null);

  const locationSearch = useSyncExternalStore(
    subscribeNoop,
    getWindowSearchSnapshot,
    getServerSearchSnapshot
  );

  const initialState = resolveInitialGivingState(
    presets,
    initialAmount,
    locationSearch
  );

  const directOnlineReady =
    onlineCheckoutEligible ?? isDirectCoreOnlineTarget(target);

  const [draft, setDraft] = useState<{
    readonly customAmount: string;
    readonly selectedPreset: number | "custom";
  } | null>(null);

  const selectedPreset = draft?.selectedPreset ?? initialState.initialPreset;
  const customAmount = draft?.customAmount ?? initialState.initialInput;

  const [hasValidated, setHasValidated] = useState(false);
  const [submittedError, setSubmittedError] = useState<string | null>(null);

  const activeTier =
    selectedPreset === "custom"
      ? undefined
      : presets.find((tier) => tier.amount === selectedPreset);

  const parsedCustom = parseGivingAmount(customAmount);

  const liveError =
    hasValidated && parsedCustom.kind === "invalid"
      ? parsedCustom.message
      : submittedError;

  const validDollars =
    parsedCustom.kind === "valid" ? parsedCustom.dollars : null;

  const hiddenEntries = [
    ...buildCheckoutQueryParams({
      frequency: "one-time",
      sourceCode,
      target,
    }).entries(),
  ];

  const baseActionLabel = "Give";

  const handleSubmit: ComponentProps<"form">["onSubmit"] = (event) => {
    event.preventDefault();

    if (parsedCustom.kind === "empty") {
      setHasValidated(true);
      setSubmittedError("Enter a gift amount of at least $1.00 to continue.");
      inputRef.current?.focus();

      return;
    }

    if (parsedCustom.kind === "invalid") {
      setHasValidated(true);
      setSubmittedError(parsedCustom.message);
      inputRef.current?.focus();

      return;
    }

    setHasValidated(false);
    setSubmittedError(null);

    const destination = buildSiteCheckoutHref({
      amount: parsedCustom.formatted,
      frequency: "one-time",
      sourceCode,
      target,
    });

    window.location.assign(destination);
  };

  return (
    <aside
      aria-labelledby="giving-widget-heading"
      className="gf-surface flex scroll-mt-24 flex-col gap-5 p-6 sm:p-7"
      id="give"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h2
            className="text-foreground font-sans text-xl font-semibold tracking-tight"
            id="giving-widget-heading"
          >
            Give to {recipientName}
          </h2>
          <p className="text-muted-foreground text-xs font-medium">
            {directOnlineReady
              ? "One-time online gift · Sign-in required"
              : "Designated gift (check or Finance) · Tax-deductible (501(c)(3))"}
          </p>
        </div>

        {validDollars === null ? null : (
          <div className="gf-js-block flex shrink-0 flex-col items-end">
            <span className="text-muted-foreground text-xs font-medium">
              Selected gift
            </span>
            <RollingUsdCounter
              amount={validDollars}
              className="text-primary font-serif text-2xl font-normal tracking-tight sm:text-3xl"
            />
          </div>
        )}
      </div>

      <form
        action={LOCAL_DONOR_ROUTES.checkout}
        className="flex flex-col gap-5"
        method="GET"
        noValidate
        onSubmit={handleSubmit}
      >
        <input name="via" type="hidden" value="form" />
        {hiddenEntries.map(([name, value]) => (
          <input key={name} name={name} type="hidden" value={value} />
        ))}

        <fieldset className="flex flex-col gap-2.5 border-0 p-0">
          <legend className="gf-js-block text-foreground text-sm font-medium">
            Choose an amount (USD)
          </legend>
          <GivingPresetGrid
            onSelectPreset={(amount) => {
              setDraft({
                customAmount: String(amount),
                selectedPreset: amount,
              });
              setHasValidated(false);
              setSubmittedError(null);
            }}
            presets={presets}
            selectedPreset={selectedPreset}
          />

          <GivingAmountField
            customAmount={customAmount}
            errorId={errorId}
            inputId={inputId}
            inputRef={inputRef}
            liveError={liveError}
            onBlurAmount={() => {
              if (
                customAmount.trim().length > 0 &&
                parsedCustom.kind === "invalid"
              ) {
                setHasValidated(true);
                setSubmittedError(parsedCustom.message);
              } else {
                setHasValidated(false);
                setSubmittedError(null);
              }
            }}
            onChangeAmount={(nextValue) => {
              setDraft({
                customAmount: nextValue,
                selectedPreset: "custom",
              });

              const nextParsed = parseGivingAmount(nextValue.trim());

              if (nextParsed.kind !== "invalid") {
                setHasValidated(false);
                setSubmittedError(null);
              } else if (hasValidated) {
                setSubmittedError(nextParsed.message);
              }
            }}
          />
        </fieldset>

        {activeTier?.label === undefined ? null : (
          <p className="gf-js-block bg-linen border-border text-foreground rounded-xl border px-3.5 py-2.5 text-sm leading-relaxed">
            <strong className="font-semibold">
              {formatUsd(activeTier.amount)}:
            </strong>{" "}
            {activeTier.label}
          </p>
        )}

        <button
          className={cx(
            buttonVariants({ size: "lg", variant: "default" }),
            "w-full"
          )}
          type="submit"
        >
          <span className="gf-js-only">
            {validDollars === null
              ? baseActionLabel
              : `${baseActionLabel} ${formatUsd(validDollars)}`}
          </span>
          <span className="gf-no-js-only">{baseActionLabel}</span>
          <ArrowRightIcon />
        </button>
      </form>

      <GivingWidgetFooter
        directOnlineReady={directOnlineReady}
        generalFundOnlineEligible={generalFundOnlineEligible}
        recipientName={recipientName}
      />
    </aside>
  );
};
