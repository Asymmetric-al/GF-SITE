"use client";

import {
  Collapsible,
  CollapsiblePanel,
  CollapsibleTrigger,
} from "@ui-sdk/react/collapsible";
import type { MouseEvent as ReactMouseEvent, RefObject } from "react";

import { cx } from "@/lib/cx";
import { preloadLenis } from "@/lib/lenis-runtime";

import type { ScrollspySection } from "./section-scrollspy";

export interface MobileScrollspyDisclosureProps {
  readonly activeId: string;
  readonly activeLabel: string;
  readonly hasInteractedOrScrolled: boolean;
  readonly headingLabel: string;
  readonly mobileOpen: boolean;
  readonly mobilePanelRef: RefObject<HTMLDivElement | null>;
  readonly mobileWrapRef: RefObject<HTMLDivElement | null>;
  readonly onOpenChange: (nextOpen: boolean) => void;
  readonly onSelect: (
    event: ReactMouseEvent<HTMLAnchorElement>,
    sectionId: string
  ) => void;
  readonly sections: readonly ScrollspySection[];
  readonly triggerRef: RefObject<HTMLButtonElement | null>;
}

/**
 * Demand-loaded mobile `@ui-sdk/react/collapsible` disclosure for
 * `SectionScrollspy`. Loaded after initial paint on first scroll or interaction
 * so above-the-fold page loads never download collapsible runtime while closed.
 */
export const MobileScrollspyDisclosureLive = ({
  activeId,
  activeLabel,
  hasInteractedOrScrolled,
  headingLabel,
  mobileOpen,
  mobilePanelRef,
  mobileWrapRef,
  onOpenChange,
  onSelect,
  sections,
  triggerRef,
}: MobileScrollspyDisclosureProps) => (
  <div className="gf-jump-links-mobile sm:hidden" ref={mobileWrapRef}>
    <Collapsible onOpenChange={onOpenChange} open={mobileOpen}>
      <CollapsibleTrigger
        className="text-foreground focus-visible:outline-ring flex min-h-11 w-full cursor-pointer items-center justify-between gap-3 text-left text-sm font-medium focus-visible:outline-2 focus-visible:outline-offset-2"
        onFocus={preloadLenis}
        onPointerEnter={preloadLenis}
        ref={triggerRef}
      >
        <span className="flex min-w-0 items-baseline gap-2">
          <span className="text-foreground shrink-0 text-sm font-semibold">
            {headingLabel}
          </span>
          <span
            aria-hidden="true"
            className="text-muted-foreground/70 shrink-0"
          >
            ·
          </span>
          <span className="text-muted-foreground truncate text-xs font-medium">
            {hasInteractedOrScrolled ? activeLabel : "Jump to a section"}
          </span>
        </span>
        <svg
          aria-hidden="true"
          className="text-muted-foreground size-4 shrink-0 transition-transform duration-150 ease-out in-data-open:rotate-180 motion-reduce:transition-none"
          fill="none"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          viewBox="0 0 24 24"
        >
          <path d="M6 9l6 6 6-6" />
        </svg>
      </CollapsibleTrigger>

      <CollapsiblePanel className="gf-collapsible-panel" ref={mobilePanelRef}>
        <ul className="border-border/60 mt-1 flex flex-col gap-0.5 border-t pt-2 pb-1">
          {sections.map((section) => {
            const isActive = section.id === activeId;

            return (
              <li key={section.id}>
                <a
                  aria-current={
                    hasInteractedOrScrolled && isActive ? "location" : undefined
                  }
                  className={cx(
                    "focus-visible:outline-ring inline-flex min-h-11 w-full items-center text-sm whitespace-nowrap underline-offset-4 transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 motion-reduce:transition-none",
                    hasInteractedOrScrolled && isActive
                      ? "text-primary decoration-gold-rule font-semibold underline decoration-2"
                      : "text-muted-foreground font-medium"
                  )}
                  data-active={
                    hasInteractedOrScrolled && isActive ? "true" : undefined
                  }
                  data-scrollspy-id={section.id}
                  href={`#${section.id}`}
                  onClick={(event) => {
                    onSelect(event, section.id);
                  }}
                >
                  {section.label}
                </a>
              </li>
            );
          })}
        </ul>
      </CollapsiblePanel>
    </Collapsible>
  </div>
);
