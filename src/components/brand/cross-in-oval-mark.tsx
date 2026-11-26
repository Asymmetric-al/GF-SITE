import {
  RECTOR_WORDMARK_PATH,
  RECTOR_WORDMARK_VIEWBOX,
} from "@/lib/brand/rector-wordmark";
import { cn } from "@/lib/utils";

interface CrossInOvalMarkProps {
  readonly className?: string;
  readonly decorative?: boolean;
}

/**
 * Inline adaptive Cross-in-Oval mark (`140:101` canonical silhouette) driven
 * by `--gf-mark-frame` and `--gf-mark-arc` CSS custom properties so it adapts
 * instantaneously across Warm Paper daylight, OS dark mode, `.gf-night` bands,
 * and monochrome church-copier print without image swaps or layout flash.
 */
const CrossInOvalMark = ({
  className,
  decorative = true,
}: CrossInOvalMarkProps) => (
  <svg
    aria-hidden={decorative ? "true" : undefined}
    aria-label={decorative ? undefined : "Global Fellowship Cross-in-Oval mark"}
    className={cn("h-7 w-auto shrink-0", className)}
    role={decorative ? undefined : "img"}
    viewBox="0 0 140 101"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M64.13 0C34.8 1.69.52 18.99 0 50.5.64 81.81 34.5 99.01 64.03 101V43.44H39.87v-15.7L27.54 40.06v15.01h24.07V84.8C31.72 81.42 11.1 67.16 12.83 44.54 13.38 17.66 40.67 3.18 64.13 0"
      fill="var(--gf-mark-frame)"
    />
    <path
      d="M64.03.89 51.61 13.32v14.71h12.42Zm16.01 42.55h29.24L97.74 55.07h-17.7Z"
      fill="var(--gf-mark-frame)"
    />
    <path
      d="M80.04.36c27.84 2.82 59.6 20.22 59.96 50.14-.7 31.37-34.6 48.51-64.03 50.5 25.15-3.38 53.69-20.48 51-49.31-1.37-23.95-26.15-34.79-46.93-36.68Z"
      fill="var(--gf-mark-arc)"
    />
  </svg>
);

interface RectorWordmarkProps {
  readonly className?: string;
}

/**
 * Vector-outlined "Global Fellowship" wordmark set in Rector Medium so every
 * logo lockup renders identically across light mode, dark mode, `.gf-night`,
 * and monochrome print without redistributing proprietary font binaries.
 */
const RectorWordmark = ({ className }: RectorWordmarkProps) => (
  <svg
    aria-hidden="true"
    className={cn("h-5.5 w-auto shrink-0 sm:h-7", className)}
    viewBox={RECTOR_WORDMARK_VIEWBOX}
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d={RECTOR_WORDMARK_PATH} fill="currentColor" />
  </svg>
);

interface CrossInOvalLockupProps {
  readonly className?: string;
  readonly markClassName?: string;
  readonly wordmarkClassName?: string;
}

/**
 * Horizontal brand lockup preserving the official Cross-in-Oval mark silhouette
 * (`140:101`) paired beside the Rector Medium "Global Fellowship" wordmark.
 */
export const CrossInOvalLockup = ({
  className,
  markClassName,
  wordmarkClassName,
}: CrossInOvalLockupProps) => (
  <span
    className={cn(
      "text-foreground inline-flex items-center gap-2 sm:gap-3",
      className
    )}
  >
    <CrossInOvalMark
      className={cn("h-6 w-auto min-[380px]:h-6.5 sm:h-7.5", markClassName)}
    />
    <RectorWordmark
      className={cn("h-5.5 w-auto min-[380px]:h-6 sm:h-7", wordmarkClassName)}
    />
    <span className="sr-only">Global Fellowship</span>
  </span>
);
