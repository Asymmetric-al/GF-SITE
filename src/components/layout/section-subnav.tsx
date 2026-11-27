import type { Route } from "next";
import { ViewTransition } from "react";

import { TransitionLink } from "@/components/brand/transition-link";
import { cn } from "@/lib/utils";

import type { SectionSubnavItem } from "./section-subnav-items";
import { SectionSubnavRail } from "./section-subnav-rail";

interface SectionSubnavProps {
  readonly label: string;
  readonly currentHref: Route;
  readonly items: readonly SectionSubnavItem[];
}

const toSectionKey = (label: string): string =>
  label
    .toLowerCase()
    .replaceAll(/[^a-z0-9]+/gu, "-")
    .replaceAll(/^-|-$/gu, "");

/**
 * Subordinate architectural underline tab strip visually distinct from the
 * primary header navigation (`SiteHeader`). Uses flush hairline bottom
 * indicators rather than pill boxes so visitors always read one primary bar
 * and one clearly secondary section bar.
 *
 * View Transitions choreography:
 * - Same-section lateral navigation pins the bar (`share="vt-subnav-static"`)
 *   while gliding the Deep Navy hairline underline (`share="vt-nav-underline"`)
 *   smoothly from the previous tab to the active tab.
 * - Hierarchical drill-downs (`nav-forward` / `nav-back`) move the bar in
 *   lockstep with the page content below it.
 * - Intent-triggered App Shell prefetching warms sibling tabs on hover/focus.
 */
export const SectionSubnav = ({
  label,
  currentHref,
  items,
}: SectionSubnavProps) => {
  const sectionKey = toSectionKey(label);

  return (
    <ViewTransition
      default="none"
      enter={{
        default: "none",
        "nav-back": "vt-enter-back",
        "nav-forward": "vt-enter-forward",
        "nav-lateral": "vt-lateral-in",
      }}
      exit={{
        default: "none",
        "nav-back": "vt-exit-back",
        "nav-forward": "vt-exit-forward",
        "nav-lateral": "vt-lateral-out",
      }}
      name={`section-subnav-${sectionKey}`}
      share="vt-subnav-static"
    >
      <div className="gf-no-print border-border/80 bg-linen/35 border-b">
        <SectionSubnavRail currentHref={currentHref} label={label}>
          {items.map((item) => {
            const isCurrent = item.href === currentHref;

            return (
              <TransitionLink
                aria-current={isCurrent ? "page" : undefined}
                className={cn(
                  "focus-visible:outline-ring relative -mb-px inline-flex min-h-11 shrink-0 items-center border-b-2 border-transparent px-1 text-sm whitespace-nowrap transition-colors duration-150 focus-visible:outline-2 focus-visible:-outline-offset-2 motion-reduce:transition-none",
                  isCurrent
                    ? "text-primary font-semibold"
                    : "text-muted-foreground [@media(hover:hover)_and_(pointer:fine)]:hover:border-border [@media(hover:hover)_and_(pointer:fine)]:hover:text-foreground font-medium"
                )}
                direction="lateral"
                href={item.href}
                key={item.href}
                prefetchMode="intent-shell"
              >
                <span>{item.label}</span>
                {isCurrent ? (
                  <ViewTransition
                    default="none"
                    enter="vt-nav-underline-fade"
                    exit="vt-nav-underline-fade"
                    name={`subnav-indicator-${sectionKey}`}
                    share="vt-nav-underline"
                  >
                    <span
                      aria-hidden="true"
                      className="bg-primary pointer-events-none absolute inset-x-0 -bottom-0.5 h-0.5"
                    />
                  </ViewTransition>
                ) : null}
              </TransitionLink>
            );
          })}
        </SectionSubnavRail>
      </div>
    </ViewTransition>
  );
};
