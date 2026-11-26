"use client";

import {
  Collapsible,
  CollapsiblePanel,
  CollapsibleTrigger,
} from "@ui-sdk/react/collapsible";
import { useEffect, useRef, useState } from "react";

import { cx } from "@/lib/cx";

export interface ScrollspySection {
  readonly id: string;
  readonly label: string;
}

interface SectionScrollspyProps {
  readonly ariaLabel: string;
  readonly headingLabel?: string;
  readonly sections: readonly ScrollspySection[];
  readonly className?: string;
}

const ACTIVE_OFFSET_PX = 240;

const focusDestinationSection = (
  sectionId: string,
  scrollAfterCollapse = false
): void => {
  const target = document.querySelector<HTMLElement>(`#${sectionId}`);

  if (target === null) {
    return;
  }

  const candidate = target.querySelector<HTMLElement>("h2, h3, h4");
  const focusableHeading = candidate ?? target;

  if (!focusableHeading.hasAttribute("tabindex")) {
    focusableHeading.setAttribute("tabindex", "-1");
    focusableHeading.classList.add(
      "focus:outline-none",
      "focus-visible:outline-2",
      "focus-visible:outline-offset-4",
      "focus-visible:outline-ring"
    );
  }

  window.requestAnimationFrame(() => {
    if (scrollAfterCollapse) {
      target.scrollIntoView({ behavior: "auto", block: "start" });
    }

    focusableHeading.focus({ preventScroll: true });
  });
};

/**
 * Quiet secondary in-page jump aid sitting calmly inside the page flow:
 * - Desktop (`sm:` and up): subtle inline hairline link row with muted
 *   "On this page" prefix and understated text links tracking `aria-current="location"`.
 * - Mobile (`< 640px`): `@ui-sdk/react/collapsible` disclosure with a single
 *   `44px` trigger, `Escape` dismissal returning focus to the trigger, and
 *   explicit destination heading focus handoff when a section link is chosen.
 * - No-JS (`scripting: none`): mobile collapsible hides cleanly and the full
 *   inline jump list displays immediately.
 */
export const SectionScrollspy = ({
  ariaLabel,
  headingLabel = "On this page",
  sections,
  className,
}: SectionScrollspyProps) => {
  const [activeId, setActiveId] = useState<string>(sections[0]?.id ?? "");
  const [hasInteractedOrScrolled, setHasInteractedOrScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const mobileWrapRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (sections.length === 0) {
      return () => {
        // No sections registered.
      };
    }

    const targets = sections
      .map((section) => document.querySelector<HTMLElement>(`#${section.id}`))
      .filter((element): element is HTMLElement => element !== null);

    if (targets.length === 0) {
      return () => {
        // No matching section landmarks on this page.
      };
    }

    let rafId = 0;

    const computeActive = () => {
      rafId = 0;

      if (window.scrollY > 80 || window.location.hash.length > 0) {
        setHasInteractedOrScrolled(true);
      }

      const atBottom =
        window.innerHeight + window.scrollY >=
        document.documentElement.scrollHeight - 4;

      if (atBottom) {
        const lastTarget = targets.at(-1);

        if (lastTarget !== undefined) {
          setActiveId(lastTarget.id);

          return;
        }
      }

      let currentId = targets[0]?.id ?? "";

      for (const target of targets) {
        if (target.getBoundingClientRect().top <= ACTIVE_OFFSET_PX) {
          currentId = target.id;
        }
      }

      setActiveId(currentId);
    };

    const scheduleCompute = () => {
      if (rafId === 0) {
        rafId = window.requestAnimationFrame(computeActive);
      }
    };

    if (window.scrollY > 0 || window.location.hash.length > 0) {
      scheduleCompute();
    }

    window.addEventListener("scroll", scheduleCompute, { passive: true });
    window.addEventListener("resize", scheduleCompute, { passive: true });
    window.addEventListener("hashchange", scheduleCompute);

    return () => {
      if (rafId !== 0) {
        window.cancelAnimationFrame(rafId);
      }

      window.removeEventListener("scroll", scheduleCompute);
      window.removeEventListener("resize", scheduleCompute);
      window.removeEventListener("hashchange", scheduleCompute);
    };
  }, [sections]);

  useEffect(() => {
    if (!mobileOpen) {
      return () => {
        // Closed mobile disclosure needs no Escape listener.
      };
    }

    const handleKeyDown = (event: globalThis.KeyboardEvent) => {
      if (event.key !== "Escape") {
        return;
      }

      const wrapper = mobileWrapRef.current;

      if (
        wrapper !== null &&
        document.activeElement instanceof Node &&
        wrapper.contains(document.activeElement)
      ) {
        event.preventDefault();
        setMobileOpen(false);
        triggerRef.current?.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [mobileOpen]);

  const activeLabel =
    sections.find((section) => section.id === activeId)?.label ??
    sections[0]?.label ??
    "";

  return (
    <nav
      aria-label={ariaLabel}
      className={cx(
        "gf-no-print border-border/75 flex flex-col border-y py-1.5 sm:flex-row sm:flex-wrap sm:items-center sm:gap-x-5 sm:gap-y-1 sm:py-2",
        className
      )}
    >
      {/* Desktop inline jump row (also shown automatically when scripting is disabled) */}
      <div className="gf-jump-links-desktop hidden flex-wrap items-center gap-x-5 gap-y-1 sm:flex">
        <span className="text-muted-foreground shrink-0 text-xs font-semibold tracking-wide">
          {headingLabel}
        </span>

        <ul className="flex flex-wrap items-center gap-x-5 gap-y-1">
          {sections.map((section) => {
            const isActive = section.id === activeId;

            return (
              <li key={section.id}>
                <a
                  aria-current={isActive ? "location" : undefined}
                  className={cx(
                    "focus-visible:outline-ring inline-flex min-h-11 items-center text-sm whitespace-nowrap underline-offset-4 transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 motion-reduce:transition-none",
                    isActive
                      ? "text-primary decoration-gold-rule font-semibold underline decoration-2"
                      : "text-muted-foreground font-medium [@media(hover:hover)_and_(pointer:fine)]:hover:text-foreground [@media(hover:hover)_and_(pointer:fine)]:hover:underline"
                  )}
                  data-active={isActive ? "true" : undefined}
                  data-scrollspy-id={section.id}
                  href={`#${section.id}`}
                  onClick={() => {
                    setActiveId(section.id);
                    setHasInteractedOrScrolled(true);
                    focusDestinationSection(section.id);
                  }}
                >
                  {section.label}
                </a>
              </li>
            );
          })}
        </ul>
      </div>

      {/* Mobile @ui-sdk/react/collapsible disclosure */}
      <div className="gf-jump-links-mobile sm:hidden" ref={mobileWrapRef}>
        <Collapsible
          onOpenChange={(nextOpen) => {
            setMobileOpen(nextOpen);
          }}
          open={mobileOpen}
        >
          <CollapsibleTrigger
            className="text-foreground focus-visible:outline-ring flex min-h-11 w-full cursor-pointer items-center justify-between gap-3 text-left text-sm font-medium focus-visible:outline-2 focus-visible:outline-offset-2"
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

          <CollapsiblePanel className="gf-collapsible-panel">
            <ul className="border-border/60 mt-1 flex flex-col gap-0.5 border-t pt-2 pb-1">
              {sections.map((section) => {
                const isActive = section.id === activeId;

                return (
                  <li key={section.id}>
                    <a
                      aria-current={
                        hasInteractedOrScrolled && isActive
                          ? "location"
                          : undefined
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
                      onClick={() => {
                        setActiveId(section.id);
                        setHasInteractedOrScrolled(true);
                        setMobileOpen(false);
                        focusDestinationSection(section.id, true);
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
    </nav>
  );
};
