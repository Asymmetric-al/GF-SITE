"use client";

import { useEffect, useRef, useState } from "react";

import { notifyToast } from "@/components/interactive/toast-bus";
import { cx } from "@/lib/cx";

interface CopyNoteButtonProps {
  readonly textToCopy: string;
  readonly label: string;
  readonly ariaLabel?: string;
  readonly copiedTitle: string;
  readonly copiedDescription?: string;
  readonly variant?: "primary" | "outline" | "night" | "inline" | "nightInline";
  readonly className?: string;
}

/**
 * Progressive clipboard helper paired with demand-loaded `@ui-sdk/react/toast`.
 * Uses lightweight inline SVG glyphs (zero client icon-barrel overhead) and
 * `border-input` for WCAG 2.2 SC 1.4.11 boundary contrast.
 */
export const CopyNoteButton = ({
  textToCopy,
  label,
  ariaLabel,
  copiedTitle,
  copiedDescription,
  variant = "outline",
  className,
}: CopyNoteButtonProps) => {
  const [copied, setCopied] = useState(false);
  const resetTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(
    () => () => {
      if (resetTimerRef.current !== null) {
        clearTimeout(resetTimerRef.current);
      }
    },
    []
  );

  const handleCopy = async (): Promise<void> => {
    try {
      await navigator.clipboard.writeText(textToCopy);
      setCopied(true);

      if (resetTimerRef.current !== null) {
        clearTimeout(resetTimerRef.current);
      }

      resetTimerRef.current = setTimeout(() => {
        setCopied(false);
        resetTimerRef.current = null;
      }, 2500);

      notifyToast({
        description: copiedDescription,
        duration: 4000,
        kind: "success",
        title: copiedTitle,
      });
    } catch {
      notifyToast({
        description:
          "Your browser restricted automatic clipboard access on this device.",
        duration: 5000,
        kind: "info",
        title: "Select and copy the text shown on this page",
      });
    }
  };

  const isInline = variant === "inline" || variant === "nightInline";

  return (
    <button
      aria-label={ariaLabel}
      className={cx(
        "gf-js-only gf-no-print focus-visible:outline-ring min-h-11 cursor-pointer items-center justify-center gap-1.5 font-medium transition duration-150 ease-out focus-visible:outline-2 focus-visible:outline-offset-2 active:scale-95 motion-reduce:transition-none motion-reduce:active:scale-100",
        isInline
          ? "rounded-md px-1.5 py-1 text-sm underline-offset-4 hover:underline"
          : "min-w-30 gap-2 rounded-full border px-4.5 py-2 text-sm",
        variant === "primary" &&
          "bg-primary text-primary-foreground border-transparent hover:opacity-95",
        variant === "outline" &&
          "border-input bg-card text-foreground hover:bg-muted",
        variant === "night" &&
          "border-input bg-night-elevated text-night-foreground hover:bg-night-surface",
        variant === "inline" && "text-primary hover:bg-muted",
        variant === "nightInline" && "text-sea-mist hover:bg-night-surface/80",
        className
      )}
      onClick={() => {
        void handleCopy();
      }}
      type="button"
    >
      {copied ? (
        <svg
          aria-hidden="true"
          className="size-3.5 shrink-0"
          fill="none"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          viewBox="0 0 24 24"
        >
          <path d="M5 13l4 4L19 7" />
        </svg>
      ) : (
        <svg
          aria-hidden="true"
          className="size-3.5 shrink-0"
          fill="none"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="1.75"
          viewBox="0 0 24 24"
        >
          <rect height="13" rx="2" width="13" x="9" y="9" />
          <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
        </svg>
      )}
      <span>{copied ? "Copied" : label}</span>
    </button>
  );
};
