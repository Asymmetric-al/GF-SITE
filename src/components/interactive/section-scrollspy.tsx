"use client";

import type { ComponentType, MouseEvent as ReactMouseEvent } from "react";
import { useCallback, useEffect, useId, useRef, useState } from "react";

import { cx } from "@/lib/cx";
import { getActiveLenis, preloadLenis } from "@/lib/lenis-runtime";
import {
  findElementById,
  focusSectionHeading,
  scrollToAnchorTargetAsync,
} from "@/lib/smooth-scroll";
import { useCoordinatedScroll } from "@/lib/use-coordinated-scroll";

import type { MobileScrollspyDisclosureProps } from "./section-scrollspy-mobile-disclosure";

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

type LiveDisclosureComponent = ComponentType<MobileScrollspyDisclosureProps>;

let cachedDisclosure: LiveDisclosureComponent | null = null;
let disclosurePromise: Promise<LiveDisclosureComponent> | null = null;

const loadMobileDisclosure = async (): Promise<LiveDisclosureComponent> => {
  if (cachedDisclosure !== null) {
    return cachedDisclosure;
  }

  disclosurePromise ??= (async () => {
    try {
      const mod = await import("./section-scrollspy-mobile-disclosure");

      cachedDisclosure = mod.MobileScrollspyDisclosureLive;

      return cachedDisclosure;
    } catch (error) {
      disclosurePromise = null;
      throw error;
    }
  })();

  return await disclosurePromise;
};

const ACTIVE_OFFSET_PX = 240;

const isModifiedLinkClick = (
  event: ReactMouseEvent<HTMLAnchorElement>
): boolean =>
  event.button !== 0 ||
  event.metaKey ||
  event.ctrlKey ||
  event.shiftKey ||
  event.altKey;

interface DesktopScrollspyRowProps {
  readonly activeId: string;
  readonly headingLabel: string;
  readonly onSelect: (
    event: ReactMouseEvent<HTMLAnchorElement>,
    sectionId: string
  ) => void;
  readonly sections: readonly ScrollspySection[];
}

const DesktopScrollspyRow = ({
  activeId,
  headingLabel,
  onSelect,
  sections,
}: DesktopScrollspyRowProps) => (
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
              onClick={(event) => {
                onSelect(event, section.id);
              }}
              onFocus={preloadLenis}
              onPointerEnter={preloadLenis}
            >
              {section.label}
            </a>
          </li>
        );
      })}
    </ul>
  </div>
);

const MobileScrollspyDisclosureShell = ({
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
}: MobileScrollspyDisclosureProps) => {
  const panelId = useId();

  return (
    <div className="gf-jump-links-mobile sm:hidden" ref={mobileWrapRef}>
      <button
        aria-controls={panelId}
        aria-expanded={mobileOpen}
        aria-label={`${headingLabel}: ${hasInteractedOrScrolled ? activeLabel : "Jump to a section"}`}
        className="text-foreground focus-visible:outline-ring flex min-h-11 w-full cursor-pointer items-center justify-between gap-3 text-left text-sm font-medium focus-visible:outline-2 focus-visible:outline-offset-2"
        onClick={() => {
          preloadLenis();
          onOpenChange(!mobileOpen);
        }}
        onFocus={preloadLenis}
        onPointerEnter={preloadLenis}
        ref={triggerRef}
        type="button"
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
          className={cx(
            "text-muted-foreground size-4 shrink-0 transition-transform duration-150 ease-out motion-reduce:transition-none",
            mobileOpen && "rotate-180"
          )}
          fill="none"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          viewBox="0 0 24 24"
        >
          <path d="M6 9l6 6 6-6" />
        </svg>
      </button>

      {mobileOpen ? (
        <div id={panelId} ref={mobilePanelRef}>
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
        </div>
      ) : null}
    </div>
  );
};

const useScrollspyWindowListeners = (
  sectionCount: number,
  computeActiveFromDom: (scrollY: number) => void,
  lockedTargetIdRef: { current: string | null }
) => {
  useEffect(() => {
    if (sectionCount === 0) {
      return () => {
        // No sections registered.
      };
    }

    let rafId = 0;

    const scheduleSync = () => {
      if (rafId === 0) {
        rafId = window.requestAnimationFrame(() => {
          rafId = 0;
          const activeLenis = getActiveLenis();

          computeActiveFromDom(
            activeLenis === undefined ? window.scrollY : activeLenis.scroll
          );
        });
      }
    };

    const handleHashOrHistorySync = () => {
      lockedTargetIdRef.current = null;
      scheduleSync();
    };

    if (window.scrollY > 0 || window.location.hash.length > 0) {
      scheduleSync();
    }

    window.addEventListener("resize", scheduleSync, { passive: true });
    window.addEventListener("hashchange", handleHashOrHistorySync);
    window.addEventListener("popstate", handleHashOrHistorySync);

    return () => {
      if (rafId !== 0) {
        window.cancelAnimationFrame(rafId);
      }

      window.removeEventListener("resize", scheduleSync);
      window.removeEventListener("hashchange", handleHashOrHistorySync);
      window.removeEventListener("popstate", handleHashOrHistorySync);
    };
  }, [computeActiveFromDom, lockedTargetIdRef, sectionCount]);
};

const useMobileDisclosureEscape = (
  mobileOpen: boolean,
  mobileWrapRef: { readonly current: HTMLDivElement | null },
  triggerRef: { readonly current: HTMLButtonElement | null },
  onClose: () => void
) => {
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
        onClose();
        triggerRef.current?.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [mobileOpen, mobileWrapRef, onClose, triggerRef]);
};

/**
 * Quiet secondary in-page jump aid sitting calmly inside the page flow:
 * - Desktop (`sm:` and up): subtle inline hairline link row with muted
 *   "On this page" prefix and understated text links tracking
 *   `aria-current="location"`, smoothly gliding via Lenis with target-locking
 *   so intermediate headings do not strobe mid-flight.
 * - Mobile (`< 640px`): zero-JS-weight closed trigger shell on initial load
 *   that upgrades to `@ui-sdk/react/collapsible` on first scroll (while closed
 *   and unfocused so triggers never detach mid-click), with `Escape` dismissal
 *   returning focus to the trigger, collapse-compensated Lenis glide, and
 *   destination heading focus handoff on arrival.
 * - No-JS (`scripting: none`): mobile disclosure hides cleanly and the full
 *   inline jump list displays immediately with native hash scrolling.
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

  const [liveDisclosure, setLiveDisclosure] =
    useState<LiveDisclosureComponent | null>(() => cachedDisclosure);

  const mobileWrapRef = useRef<HTMLDivElement>(null);
  const mobilePanelRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const lockedTargetIdRef = useRef<string | null>(null);
  const mobileScrollFrameRef = useRef(0);
  const mountedRef = useRef(true);
  const mobileOpenRef = useRef(mobileOpen);
  const liveDisclosureRef = useRef(liveDisclosure);

  useEffect(() => {
    mobileOpenRef.current = mobileOpen;
  }, [mobileOpen]);

  useEffect(() => {
    liveDisclosureRef.current = liveDisclosure;
  }, [liveDisclosure]);

  useEffect(() => {
    mountedRef.current = true;

    return () => {
      mountedRef.current = false;

      if (mobileScrollFrameRef.current !== 0) {
        window.cancelAnimationFrame(mobileScrollFrameRef.current);
        mobileScrollFrameRef.current = 0;
      }
    };
  }, []);

  const upgradeMobileDisclosureWhenIdle = useCallback(() => {
    if (liveDisclosureRef.current !== null) {
      return;
    }

    const resolveLive = async () => {
      try {
        const resolved = await loadMobileDisclosure();

        if (
          mountedRef.current &&
          !mobileOpenRef.current &&
          document.activeElement !== triggerRef.current
        ) {
          setLiveDisclosure(() => resolved);
        }
      } catch {
        // Keep shell functional if offline chunk load fails.
      }
    };

    void resolveLive();
  }, []);

  const computeActiveFromDom = useCallback(
    (scrollY: number) => {
      if (sections.length === 0 || lockedTargetIdRef.current !== null) {
        return;
      }

      if (
        scrollY > 16 &&
        liveDisclosureRef.current === null &&
        !mobileOpenRef.current
      ) {
        upgradeMobileDisclosureWhenIdle();
      }

      const targets = sections
        .map((section) => findElementById(section.id))
        .filter((element): element is HTMLElement => element !== null);

      if (targets.length === 0) {
        return;
      }

      if (scrollY > 80 || window.location.hash.length > 0) {
        setHasInteractedOrScrolled(true);
      }

      const atBottom =
        window.innerHeight + scrollY >=
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
    },
    [sections, upgradeMobileDisclosureWhenIdle]
  );

  useCoordinatedScroll(({ scroll }) => {
    computeActiveFromDom(scroll);
  }, sections.length > 0);

  useScrollspyWindowListeners(
    sections.length,
    computeActiveFromDom,
    lockedTargetIdRef
  );

  const closeMobileDisclosure = useCallback(() => {
    setMobileOpen(false);
  }, []);

  useMobileDisclosureEscape(
    mobileOpen,
    mobileWrapRef,
    triggerRef,
    closeMobileDisclosure
  );

  const handleSectionSelect = (
    event: ReactMouseEvent<HTMLAnchorElement>,
    sectionId: string,
    isMobileDisclosure: boolean
  ) => {
    if (isModifiedLinkClick(event)) {
      return;
    }

    event.preventDefault();
    setActiveId(sectionId);
    setHasInteractedOrScrolled(true);
    lockedTargetIdRef.current = sectionId;

    const releaseAndSync = (interrupted: boolean) => {
      if (lockedTargetIdRef.current === sectionId) {
        lockedTargetIdRef.current = null;
      }

      if (interrupted) {
        const activeLenis = getActiveLenis();

        computeActiveFromDom(
          activeLenis === undefined ? window.scrollY : activeLenis.scroll
        );
      }
    };

    const runAnchorGlide = async (collapseOffsetPx: number) => {
      const handled = await scrollToAnchorTargetAsync(sectionId, {
        collapseOffsetPx,
        focusHeading: true,
        historyMode: "push",
        onComplete: () => {
          releaseAndSync(false);
        },
        onInterrupt: () => {
          releaseAndSync(true);
        },
      });

      if (!handled) {
        releaseAndSync(false);
        focusSectionHeading(sectionId);
      }
    };

    if (isMobileDisclosure) {
      const panelNode = mobilePanelRef.current;
      const targetNode = findElementById(sectionId);
      let collapseOffsetPx = 0;

      if (panelNode !== null && targetNode !== null) {
        const panelRect = panelNode.getBoundingClientRect();
        const targetRect = targetNode.getBoundingClientRect();

        if (targetRect.top > panelRect.top) {
          collapseOffsetPx = Math.max(0, Math.round(panelRect.height));
        }
      }

      setMobileOpen(false);

      if (mobileScrollFrameRef.current !== 0) {
        window.cancelAnimationFrame(mobileScrollFrameRef.current);
      }

      mobileScrollFrameRef.current = window.requestAnimationFrame(() => {
        mobileScrollFrameRef.current = 0;
        void runAnchorGlide(collapseOffsetPx);
      });

      return;
    }

    void runAnchorGlide(0);
  };

  const activeLabel =
    sections.find((section) => section.id === activeId)?.label ??
    sections[0]?.label ??
    "";

  const MobileDisclosure = liveDisclosure ?? MobileScrollspyDisclosureShell;

  return (
    <nav
      aria-label={ariaLabel}
      className={cx(
        "gf-no-print border-border/75 flex flex-col border-y py-1.5 sm:flex-row sm:flex-wrap sm:items-center sm:gap-x-5 sm:gap-y-1 sm:py-2",
        className
      )}
    >
      <DesktopScrollspyRow
        activeId={activeId}
        headingLabel={headingLabel}
        onSelect={(event, sectionId) => {
          handleSectionSelect(event, sectionId, false);
        }}
        sections={sections}
      />

      <MobileDisclosure
        activeId={activeId}
        activeLabel={activeLabel}
        hasInteractedOrScrolled={hasInteractedOrScrolled}
        headingLabel={headingLabel}
        mobileOpen={mobileOpen}
        mobilePanelRef={mobilePanelRef}
        mobileWrapRef={mobileWrapRef}
        onOpenChange={(nextOpen) => {
          setMobileOpen(nextOpen);
        }}
        onSelect={(event, sectionId) => {
          handleSectionSelect(event, sectionId, true);
        }}
        sections={sections}
        triggerRef={triggerRef}
      />
    </nav>
  );
};
