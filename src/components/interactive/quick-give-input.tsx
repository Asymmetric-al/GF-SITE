"use client";

import { useId, useRef, useState } from "react";
import type { ComponentProps } from "react";

import { ArrowRightIcon } from "@/components/brand/ui-arrow";
import {
  buildCheckoutQueryParams,
  buildSiteCheckoutHref,
  LOCAL_DONOR_ROUTES,
  parseGivingAmount,
} from "@/lib/giving/checkout-client";
import type { CheckoutTarget } from "@/lib/giving/checkout-client";

interface QuickGiveInputProps {
  readonly recipientName: string;
  readonly target: CheckoutTarget;
  readonly sourceCode?: string;
}

/**
 * Inline card quick-give bar aligned with Global Fellowship's giving flow.
 * Uses a clean, direct `Give` call to action across all missionary and project
 * cards, validates typed amounts on blur/submit against the shared exact-cent
 * `$1.00`-$1,000,000.00 bounds, and submits via native GET `<form action="/checkout">`
 * (`via=form`) so giving works with JavaScript disabled too.
 */
export const QuickGiveInput = ({
  recipientName,
  target,
  sourceCode,
}: QuickGiveInputProps) => {
  const inputId = useId();
  const errorId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [amount, setAmount] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const [hasValidated, setHasValidated] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const trimmedAmount = amount.trim();
  const parsedAmount = parseGivingAmount(trimmedAmount);
  const hasValidAmount = parsedAmount.kind === "valid";

  const submitAriaLabel = hasValidAmount
    ? `Give $${parsedAmount.formatted} to ${recipientName}`
    : `Give to ${recipientName}`;

  const liveError =
    hasValidated && parsedAmount.kind === "invalid"
      ? parsedAmount.message
      : errorMessage;

  const hiddenEntries = [
    ...buildCheckoutQueryParams({
      frequency: "one-time",
      sourceCode,
      target,
    }).entries(),
  ];

  const handleSubmit: ComponentProps<"form">["onSubmit"] = (event) => {
    event.preventDefault();

    if (parsedAmount.kind === "invalid") {
      setHasValidated(true);
      setErrorMessage(parsedAmount.message);
      inputRef.current?.focus();

      return;
    }

    setHasValidated(false);
    setErrorMessage(null);

    const destination = buildSiteCheckoutHref({
      amount: parsedAmount.kind === "valid" ? parsedAmount.formatted : null,
      frequency: "one-time",
      sourceCode,
      target,
    });

    window.location.assign(destination);
  };

  return (
    <div className="flex w-full flex-col gap-1.5">
      <form
        action={LOCAL_DONOR_ROUTES.checkout}
        className="gf-control-motion border-border bg-background/85 focus-within:border-primary focus-within:bg-card focus-within:ring-primary/15 flex min-h-12 w-full items-center gap-1 rounded-xl border p-1 pl-3.5 focus-within:ring-2"
        method="GET"
        noValidate
        onSubmit={handleSubmit}
      >
        <input name="via" type="hidden" value="form" />
        {hiddenEntries.map(([name, value]) => (
          <input key={name} name={name} type="hidden" value={value} />
        ))}

        <span
          aria-hidden="true"
          className="text-primary text-sm font-semibold select-none"
        >
          $
        </span>

        <label className="sr-only" htmlFor={inputId}>
          Gift amount for {recipientName} in US dollars
        </label>
        <input
          aria-describedby={liveError === null ? undefined : errorId}
          aria-invalid={liveError === null ? undefined : true}
          className="gf-tabular text-foreground placeholder:text-muted-foreground min-w-0 flex-1 bg-transparent py-2 text-sm font-medium focus:outline-none"
          id={inputId}
          inputMode="decimal"
          name="amount"
          onBlur={() => {
            setIsFocused(false);

            if (trimmedAmount.length > 0 && parsedAmount.kind === "invalid") {
              setHasValidated(true);
              setErrorMessage(parsedAmount.message);
            } else {
              setHasValidated(false);
              setErrorMessage(null);
            }
          }}
          onChange={(event) => {
            const nextValue = event.currentTarget.value;
            setAmount(nextValue);
            const nextParsed = parseGivingAmount(nextValue.trim());

            if (nextParsed.kind !== "invalid") {
              setHasValidated(false);
              setErrorMessage(null);
            } else if (hasValidated) {
              setErrorMessage(nextParsed.message);
            }
          }}
          onFocus={() => {
            setIsFocused(true);
          }}
          placeholder={isFocused ? "0.00" : "Amount"}
          ref={inputRef}
          type="text"
          value={amount}
        />

        <span
          aria-hidden="true"
          className="text-muted-foreground pr-1 text-xs font-semibold tracking-wide select-none"
        >
          USD
        </span>

        <button
          aria-label={submitAriaLabel}
          className="gf-control-motion group/give bg-primary text-primary-foreground focus-visible:outline-ring inline-flex min-h-11 min-w-11 shrink-0 cursor-pointer items-center justify-center gap-1.5 rounded-lg px-4 text-xs font-semibold whitespace-nowrap focus-visible:outline-2 focus-visible:outline-offset-2 active:scale-[0.97] motion-reduce:transition-none motion-reduce:active:scale-100 [@media(hover:hover)_and_(pointer:fine)]:hover:opacity-90"
          onMouseDown={(event) => {
            if (isFocused) {
              event.preventDefault();
            }
          }}
          type="submit"
        >
          <span>Give</span>
          <ArrowRightIcon hoverGroup="give" size="sm" />
        </button>
      </form>

      <p
        aria-live={liveError === null ? "polite" : undefined}
        className={
          liveError === null
            ? "sr-only"
            : "text-destructive px-2 text-xs font-medium"
        }
        id={errorId}
        role={liveError === null ? undefined : "alert"}
      >
        {liveError ?? ""}
      </p>
    </div>
  );
};
