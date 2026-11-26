import { cn } from "@/lib/utils";

interface PhotoMaskedWordProps {
  readonly text: string;
  readonly tone?: "daylight" | "night";
  readonly className?: string;
}

/**
 * Zero-network architectural bronze-navy editorial numeral display anchor
 * (such as monumental numerals `1989` and `43`). Uses calibrated Deep Navy to
 * Dark Bronze / Warm Gold CSS gradients via `background-clip: text` for instant
 * LCP paint and uniform contrast across light, dark, forced-colors, and print.
 */
export const PhotoMaskedWord = ({
  text,
  tone = "daylight",
  className,
}: PhotoMaskedWordProps) => (
  <span
    className={cn(
      "gf-tabular inline-block font-serif leading-none font-medium tracking-tighter select-none",
      tone === "night"
        ? "gf-photo-text-mask-night"
        : "gf-photo-text-mask-daylight",
      className
    )}
  >
    {text}
  </span>
);
