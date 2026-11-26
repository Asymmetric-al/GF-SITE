import type { Route } from "next";
import Link from "next/link";

import { cn } from "@/lib/utils";

import type { SectionSubnavItem } from "./section-subnav-items";
import { SectionSubnavRail } from "./section-subnav-rail";

interface SectionSubnavProps {
  readonly label: string;
  readonly currentHref: Route;
  readonly items: readonly SectionSubnavItem[];
}

/**
 * Subordinate architectural underline tab strip visually distinct from the
 * primary header navigation (`SiteHeader`). Uses flush hairline bottom
 * indicators rather than pill boxes so visitors always read one primary bar
 * and one clearly secondary section bar.
 */
export const SectionSubnav = ({
  label,
  currentHref,
  items,
}: SectionSubnavProps) => (
  <div className="gf-no-print border-border/80 bg-linen/35 border-b">
    <SectionSubnavRail currentHref={currentHref} label={label}>
      {items.map((item) => {
        const isCurrent = item.href === currentHref;

        return (
          <Link
            aria-current={isCurrent ? "page" : undefined}
            className={cn(
              "focus-visible:outline-ring -mb-px inline-flex min-h-11 shrink-0 items-center border-b-2 px-1 text-sm whitespace-nowrap transition-colors duration-150 focus-visible:outline-2 focus-visible:-outline-offset-2 motion-reduce:transition-none",
              isCurrent
                ? "border-primary text-primary font-semibold"
                : "text-muted-foreground [@media(hover:hover)_and_(pointer:fine)]:hover:border-border [@media(hover:hover)_and_(pointer:fine)]:hover:text-foreground border-transparent font-medium"
            )}
            href={item.href}
            key={item.href}
            prefetch={false}
          >
            {item.label}
          </Link>
        );
      })}
    </SectionSubnavRail>
  </div>
);
