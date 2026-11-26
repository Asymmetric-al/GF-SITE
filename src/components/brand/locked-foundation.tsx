import { PROTECTED_FOUNDATIONS } from "@/lib/brand/foundations";
import { cn } from "@/lib/utils";

interface LockedFoundationProps {
  readonly label: string;
  readonly statement: string;
  readonly note?: string;
  readonly tone?: "linen" | "night";
  readonly id?: string;
  readonly className?: string;
}

/**
 * Reserved typographic frame (`.gf-locked-frame`) used strictly for verbatim
 * Global Fellowship Mission Statement and Prayerful Vision Statement.
 * Unboxed editorial framing lets typography and hairline rules carry authority.
 */
export const LockedFoundation = ({
  label,
  statement,
  note,
  tone = "linen",
  id,
  className,
}: LockedFoundationProps) => (
  <div
    className={cn(
      "flex flex-col gap-4 py-2",
      tone === "night" && "border-night-border border-t pt-6",
      className
    )}
    id={id}
  >
    <p
      className={cn(
        "text-sm font-semibold",
        tone === "linen" ? "text-clay" : "text-apricot"
      )}
      data-gf-banner-label="true"
    >
      {label}
    </p>
    <blockquote className="gf-locked-frame">
      <p className="gf-display-quote text-foreground">{statement}</p>
    </blockquote>
    {note === undefined ? null : (
      <p className="text-muted-foreground max-w-2xl text-sm leading-relaxed">
        {note}
      </p>
    )}
  </div>
);

interface PillarTriadProps {
  readonly headingId?: string;
  readonly className?: string;
}

/**
 * Always renders all Three Pillars together with exact canonical names and
 * one-line glosses in an unbroken 3-column architectural triad (never hidden
 * behind tabs/accordions, zero non-sequence fake numbers, and equal top rail).
 */
export const PillarTriad = ({
  headingId = "three-pillars",
  className,
}: PillarTriadProps) => (
  <div className={cn("flex flex-col gap-6", className)} id={headingId}>
    <div className="flex flex-col gap-1.5">
      <h2 className="gf-display-section text-foreground">Our Three Pillars</h2>
      <p className="text-muted-foreground text-base leading-relaxed">
        Three convictions held together, never separated.
      </p>
    </div>
    <ul className="border-border divide-border grid grid-cols-1 divide-y border-t md:grid-cols-3 md:divide-x md:divide-y-0">
      {PROTECTED_FOUNDATIONS.threePillars.map((pillar) => (
        <li
          className="flex flex-col gap-2 py-6 md:px-7 md:py-0 md:pt-7 md:first:pl-0 md:last:pr-0"
          key={pillar.id}
        >
          <h3 className="text-foreground font-serif text-xl font-normal tracking-tight">
            {pillar.name}
          </h3>
          <p className="text-muted-foreground text-base leading-relaxed">
            {pillar.gloss}
          </p>
        </li>
      ))}
    </ul>
  </div>
);
