import { cn } from "@/lib/utils";

interface LivingArcMotifProps {
  readonly tone?: "daylight" | "linen" | "night";
  readonly className?: string;
}

/**
 * Ownable Global Fellowship architectural Cross-in-Oval twin-arc motif matching
 * `brand-kit/patterns/living-arc-light.svg` and `living-arc-dark.svg`. Uses a
 * vertical edge fade (`gf-arc-fade`) so arcs dissolve softly without hard
 * container clips while hiding cleanly in print.
 */
export const LivingArcMotif = ({
  tone = "daylight",
  className,
}: LivingArcMotifProps) => (
  <svg
    aria-hidden="true"
    className={cn(
      "gf-arc-fade pointer-events-none select-none print:hidden",
      tone === "daylight" && "opacity-75",
      tone === "linen" && "opacity-55",
      tone === "night" && "opacity-22",
      className
    )}
    preserveAspectRatio="xMaxYMax slice"
    viewBox="0 0 600 600"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M600 0C360 22 140 164 118 390c-12 118 28 168 70 210h118c-56-56-84-122-72-214 22-172 178-286 366-312z"
      fill="var(--gf-arc-primary)"
    />
    <path
      d="M600 128c-154 24-274 134-286 278-8 90 22 148 56 194h42c-34-46-58-100-50-184 12-122 108-218 238-246z"
      fill="var(--gf-arc-warm)"
    />
  </svg>
);
