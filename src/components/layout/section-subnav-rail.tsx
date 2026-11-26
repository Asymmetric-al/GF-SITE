"use client";

import type { ReactNode } from "react";
import { useEffect, useRef } from "react";

interface SectionSubnavRailProps {
  readonly currentHref: string;
  readonly label: string;
  readonly children: ReactNode;
}

/**
 * Single-row horizontal sub-navigation rail that keeps mobile chrome compact
 * (~56px with 44px touch targets), centers the active `aria-current="page"`
 * item inside the horizontal rail after initial paint (`requestAnimationFrame`
 * so hydration triggers zero forced synchronous reflows and zero extra React
 * re-renders), and updates horizontal edge-fade `data-*` attributes directly on
 * the wrapper whenever offscreen links sit to the left or right.
 */
export const SectionSubnavRail = ({
  currentHref,
  label,
  children,
}: SectionSubnavRailProps) => {
  const wrapRef = useRef<HTMLDivElement>(null);
  const navRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const nav = navRef.current;
    const wrap = wrapRef.current;

    if (nav === null || wrap === null) {
      return () => {
        // Unmounted before layout sync.
      };
    }

    let rafId = 0;

    const applyFades = () => {
      const maxScroll = nav.scrollWidth - nav.clientWidth;

      if (maxScroll <= 2) {
        wrap.dataset.fadeLeft = "false";
        wrap.dataset.fadeRight = "false";

        return;
      }

      wrap.dataset.fadeLeft = nav.scrollLeft > 4 ? "true" : "false";
      wrap.dataset.fadeRight =
        nav.scrollLeft < maxScroll - 4 ? "true" : "false";
    };

    const scheduleSyncFades = () => {
      if (rafId === 0) {
        rafId = window.requestAnimationFrame(() => {
          rafId = 0;
          applyFades();
        });
      }
    };

    const revealFocusedItem = (event: FocusEvent) => {
      if (nav.scrollWidth <= nav.clientWidth) {
        return;
      }

      const { target } = event;

      if (!(target instanceof HTMLElement && nav.contains(target))) {
        return;
      }

      const targetLeft =
        target.offsetLeft - (nav.clientWidth - target.clientWidth) / 2;

      nav.scrollLeft = Math.max(
        0,
        Math.min(targetLeft, nav.scrollWidth - nav.clientWidth)
      );
      applyFades();
    };

    // Defer initial geometry read + horizontal centering to the next animation
    // frame so React hydration completes without a forced synchronous reflow.
    rafId = window.requestAnimationFrame(() => {
      rafId = 0;

      if (nav.scrollWidth > nav.clientWidth) {
        const active =
          nav.querySelector<HTMLElement>(`a[href="${currentHref}"]`) ??
          nav.querySelector<HTMLElement>('[aria-current="page"]');

        if (active !== null) {
          const targetLeft =
            active.offsetLeft - (nav.clientWidth - active.clientWidth) / 2;

          nav.scrollLeft = Math.max(
            0,
            Math.min(targetLeft, nav.scrollWidth - nav.clientWidth)
          );
        }
      }

      applyFades();
    });

    nav.addEventListener("scroll", scheduleSyncFades, { passive: true });
    nav.addEventListener("focusin", revealFocusedItem);
    window.addEventListener("resize", scheduleSyncFades, { passive: true });

    return () => {
      if (rafId !== 0) {
        window.cancelAnimationFrame(rafId);
      }

      nav.removeEventListener("scroll", scheduleSyncFades);
      nav.removeEventListener("focusin", revealFocusedItem);
      window.removeEventListener("resize", scheduleSyncFades);
    };
  }, [currentHref]);

  return (
    <div
      className="gf-subnav-wrap relative mx-auto w-full max-w-6xl"
      data-fade-left="false"
      data-fade-right="false"
      ref={wrapRef}
    >
      <nav
        aria-label={label}
        className="gf-subnav-rail flex w-full flex-nowrap items-center gap-5 overflow-x-auto px-5 sm:gap-7 sm:px-8"
        ref={navRef}
      >
        {children}
      </nav>
    </div>
  );
};
