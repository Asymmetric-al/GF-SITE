"use client";

import { cx } from "@/lib/cx";

interface PrintButtonProps {
  readonly label?: string;
  readonly className?: string;
}

/**
 * Progressive print trigger styled for B&W church copier printouts.
 * Disclosure expansion on `beforeprint` / `afterprint` is registered globally
 * in `SiteToaster` so both button clicks and browser `Ctrl+P` / `Cmd+P` print
 * complete scope notes and FAQs cleanly across all browsers.
 */
export const PrintButton = ({
  label = "Print this page",
  className,
}: PrintButtonProps) => (
  <button
    className={cx(
      "gf-js-only gf-no-print border-input bg-card text-foreground hover:bg-linen/80 focus-visible:outline-ring min-h-11 cursor-pointer items-center justify-center gap-2 rounded-full border px-4.5 py-2 text-sm font-medium transition duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 active:scale-98 motion-reduce:transition-none",
      className
    )}
    onClick={() => {
      window.print();
    }}
    type="button"
  >
    <svg
      aria-hidden="true"
      className="size-4 shrink-0"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.75"
      viewBox="0 0 24 24"
    >
      <path d="M6 9V2h12v7" />
      <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
      <rect height="8" width="12" x="6" y="14" />
    </svg>
    <span>{label}</span>
  </button>
);
