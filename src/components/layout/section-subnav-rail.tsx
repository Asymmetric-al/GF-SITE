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
    let cancelled = false;
    let userScrolled = false;

    const applyFadeValues = (scrollLeft: number, maxScroll: number) => {
      if (maxScroll <= 2) {
        if (wrap.dataset.fadeLeft !== "false") {
          wrap.dataset.fadeLeft = "false";
        }

        if (wrap.dataset.fadeRight !== "false") {
          wrap.dataset.fadeRight = "false";
        }

        return;
      }

      const nextLeft = scrollLeft > 4 ? "true" : "false";
      const nextRight = scrollLeft < maxScroll - 4 ? "true" : "false";

      if (wrap.dataset.fadeLeft !== nextLeft) {
        wrap.dataset.fadeLeft = nextLeft;
      }

      if (wrap.dataset.fadeRight !== nextRight) {
        wrap.dataset.fadeRight = nextRight;
      }
    };

    const applyFades = () => {
      const maxScroll = nav.scrollWidth - nav.clientWidth;

      applyFadeValues(nav.scrollLeft, maxScroll);
    };

    const centerActiveItem = () => {
      // Batch all geometry reads before any scrollLeft/dataset writes so
      // centering triggers zero read-after-write forced synchronous reflows.
      const { clientWidth, scrollLeft, scrollWidth } = nav;
      const maxScroll = scrollWidth - clientWidth;

      if (maxScroll <= 2) {
        applyFadeValues(0, 0);

        return;
      }

      const active =
        nav.querySelector<HTMLElement>(`a[href="${currentHref}"]`) ??
        nav.querySelector<HTMLElement>('[aria-current="page"]');

      let nextScrollLeft = scrollLeft;

      if (active !== null) {
        const targetLeft =
          active.offsetLeft - (clientWidth - active.clientWidth) / 2;

        nextScrollLeft = Math.max(0, Math.min(targetLeft, maxScroll));
      }

      if (Math.abs(scrollLeft - nextScrollLeft) > 1) {
        nav.scrollLeft = nextScrollLeft;
      }

      applyFadeValues(nextScrollLeft, maxScroll);
    };

    const scheduleSyncFades = () => {
      if (rafId === 0) {
        rafId = window.requestAnimationFrame(() => {
          rafId = 0;
          applyFades();
        });
      }
    };

    const handleScroll = () => {
      userScrolled = true;
      scheduleSyncFades();
    };

    const revealFocusedItem = (event: FocusEvent) => {
      const { clientWidth, scrollLeft, scrollWidth } = nav;
      const maxScroll = scrollWidth - clientWidth;

      if (maxScroll <= 0) {
        return;
      }

      const { target } = event;

      if (!(target instanceof HTMLElement && nav.contains(target))) {
        return;
      }

      const targetLeft =
        target.offsetLeft - (clientWidth - target.clientWidth) / 2;

      const nextScrollLeft = Math.max(0, Math.min(targetLeft, maxScroll));

      if (Math.abs(scrollLeft - nextScrollLeft) > 1) {
        nav.scrollLeft = nextScrollLeft;
      }

      applyFadeValues(nextScrollLeft, maxScroll);
    };

    // Defer initial geometry read + horizontal centering to the next animation
    // frame so React hydration completes without a forced synchronous reflow,
    // and re-center once web fonts finish loading if the user hasn't scrolled.
    rafId = window.requestAnimationFrame(() => {
      rafId = 0;
      centerActiveItem();
    });

    const syncAfterFonts = async () => {
      await document.fonts.ready;

      if (!cancelled && !userScrolled && rafId === 0) {
        rafId = window.requestAnimationFrame(() => {
          rafId = 0;
          centerActiveItem();
        });
      }
    };

    if ("fonts" in document) {
      void syncAfterFonts();
    }

    nav.addEventListener("scroll", handleScroll, { passive: true });
    nav.addEventListener("focusin", revealFocusedItem);
    window.addEventListener("resize", scheduleSyncFades, { passive: true });

    return () => {
      cancelled = true;

      if (rafId !== 0) {
        window.cancelAnimationFrame(rafId);
      }

      nav.removeEventListener("scroll", handleScroll);
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
        data-lenis-prevent
        ref={navRef}
      >
        {children}
      </nav>
    </div>
  );
};
