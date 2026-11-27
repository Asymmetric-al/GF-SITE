"use client";

import { usePathname } from "next/navigation";
import { Suspense, useCallback, useEffect, useRef } from "react";

import { getActiveLenis, preloadLenis } from "@/lib/lenis-runtime";
import {
  findElementById,
  getStickyHeaderClearance,
  scrollToAnchorTargetAsync,
  scrollToTopAsync,
  shouldSkipSmoothAnchor,
  stopActiveSmoothScroll,
} from "@/lib/smooth-scroll";
import { useCoordinatedScroll } from "@/lib/use-coordinated-scroll";

const HEADER_SCROLL_THRESHOLD_PX = 12;
const BACK_TO_TOP_THRESHOLD_PX = 24;
const CROSS_PAGE_ALIGN_TOLERANCE_PX = 14;

const isModifiedOrNonPrimaryClick = (event: MouseEvent): boolean =>
  event.defaultPrevented ||
  event.button !== 0 ||
  event.metaKey ||
  event.ctrlKey ||
  event.shiftKey ||
  event.altKey;

const decodeHashId = (hash: string): string => {
  const raw = hash.startsWith("#") ? hash.slice(1) : hash;

  try {
    return decodeURIComponent(raw);
  } catch {
    return raw;
  }
};

const findClosestAnchor = (
  target: EventTarget | null
): HTMLAnchorElement | null => {
  if (!(target instanceof Element)) {
    return null;
  }

  return target.closest<HTMLAnchorElement>("a[href]");
};

const isEligibleAnchor = (anchor: HTMLAnchorElement): boolean => {
  if (
    anchor.hasAttribute("download") ||
    Object.hasOwn(anchor.dataset, "scrollspyId")
  ) {
    return false;
  }

  const targetAttr = anchor.getAttribute("target");

  return targetAttr === null || targetAttr === "" || targetAttr === "_self";
};

const parseSamePageUrl = (
  anchor: HTMLAnchorElement
): { readonly currentUrl: URL; readonly destination: URL } | null => {
  let destination: URL;

  try {
    destination = new URL(anchor.href, window.location.href);
  } catch {
    return null;
  }

  const currentUrl = new URL(window.location.href);

  if (
    destination.origin !== currentUrl.origin ||
    destination.pathname !== currentUrl.pathname
  ) {
    return null;
  }

  return { currentUrl, destination };
};

const isSamePageChromeTopTrigger = (anchor: HTMLAnchorElement): boolean =>
  anchor.closest('[role="dialog"]') === null &&
  (anchor.closest("header, footer") !== null ||
    anchor.getAttribute("aria-current") === "page");

const LenisSiteCoordinator = () => {
  const pathname = usePathname();
  const previousPathnameRef = useRef(pathname);
  const headerScrolledRef = useRef<boolean | null>(null);

  const syncHeaderScrolled = useCallback((scrollY: number) => {
    const nextScrolled = scrollY > HEADER_SCROLL_THRESHOLD_PX;

    if (headerScrolledRef.current === nextScrolled) {
      return;
    }

    const header = document.querySelector<HTMLElement>(".gf-site-header");

    if (header === null) {
      return;
    }

    headerScrolledRef.current = nextScrolled;

    if (nextScrolled) {
      header.dataset.scrolled = "true";
    } else {
      delete header.dataset.scrolled;
    }
  }, []);

  useCoordinatedScroll(({ scroll }) => {
    syncHeaderScrolled(scroll);
  });

  // Sync header scrolled attribute on initial mount when already scrolled
  // (e.g., browser scroll restoration or deep hash load).
  useEffect(() => {
    if (window.scrollY > HEADER_SCROLL_THRESHOLD_PX) {
      syncHeaderScrolled(window.scrollY);
    }

    return () => {
      stopActiveSmoothScroll(getActiveLenis(), false);
    };
  }, [syncHeaderScrolled]);

  // Unified same-page click delegation for hero jump links, `#top` / `#`
  // anchors, and same-page active header/subnav/footer Back-to-top links.
  useEffect(() => {
    const warmAnchorIfNeeded = (target: EventTarget | null) => {
      const anchor = findClosestAnchor(target);

      if (anchor === null || !isEligibleAnchor(anchor)) {
        return;
      }

      const rawHref = anchor.getAttribute("href") ?? "";

      if (rawHref.startsWith("#") && rawHref !== "#main-content") {
        preloadLenis();

        return;
      }

      if (
        window.scrollY > BACK_TO_TOP_THRESHOLD_PX &&
        isSamePageChromeTopTrigger(anchor)
      ) {
        preloadLenis();
      }
    };

    const handlePointerOver = (event: PointerEvent) => {
      warmAnchorIfNeeded(event.target);
    };

    const handleFocusIn = (event: FocusEvent) => {
      warmAnchorIfNeeded(event.target);
    };

    const handleDocumentClick = (event: MouseEvent) => {
      if (isModifiedOrNonPrimaryClick(event)) {
        return;
      }

      const anchor = findClosestAnchor(event.target);

      if (anchor === null || !isEligibleAnchor(anchor)) {
        return;
      }

      const urls = parseSamePageUrl(anchor);

      if (urls === null) {
        return;
      }

      const { currentUrl, destination } = urls;
      const rawHref = anchor.getAttribute("href") ?? "";

      // Same-page `#top` or `#` Back-to-top anchors.
      if (rawHref === "#" || destination.hash === "#top") {
        event.preventDefault();
        event.stopPropagation();
        void scrollToTopAsync({ clearHash: true, focusMain: true });

        return;
      }

      // Same-page section anchor (`#safeguarding`, `#strategy`, `#board`, etc.).
      if (destination.hash.length > 1) {
        if (shouldSkipSmoothAnchor(anchor, destination.hash)) {
          return;
        }

        const sectionId = decodeHashId(destination.hash);

        if (findElementById(sectionId) === null) {
          return;
        }

        event.preventDefault();
        event.stopPropagation();
        void scrollToAnchorTargetAsync(sectionId, {
          focusHeading: true,
          historyMode: "push",
        });

        return;
      }

      // Clicking the active brand mark or current-page link in header, subnav,
      // or footer with identical query params while scrolled down glides to top.
      const currentScroll = window.scrollY;

      if (
        isSamePageChromeTopTrigger(anchor) &&
        destination.search === currentUrl.search &&
        currentScroll > BACK_TO_TOP_THRESHOLD_PX
      ) {
        event.preventDefault();
        event.stopPropagation();
        void scrollToTopAsync({ clearHash: true, focusMain: false });
      }
    };

    const handlePopState = () => {
      if (window.location.pathname !== previousPathnameRef.current) {
        return;
      }

      const { hash } = window.location;

      if (hash.length <= 1) {
        void scrollToTopAsync({ clearHash: false, focusMain: false });

        return;
      }

      const sectionId = decodeHashId(hash);

      if (sectionId === "main-content") {
        return;
      }

      void scrollToAnchorTargetAsync(sectionId, {
        focusHeading: true,
        historyMode: "none",
      });
    };

    // Capture phase runs before Next.js `<Link>` synthetic handlers so active
    // same-page header/subnav/footer links smoothly glide to top instead of
    // triggering a no-op client transition.
    document.addEventListener("click", handleDocumentClick, { capture: true });
    document.addEventListener("pointerover", handlePointerOver, {
      passive: true,
    });
    document.addEventListener("focusin", handleFocusIn);
    window.addEventListener("popstate", handlePopState);

    return () => {
      document.removeEventListener("click", handleDocumentClick, {
        capture: true,
      });
      document.removeEventListener("pointerover", handlePointerOver);
      document.removeEventListener("focusin", handleFocusIn);
      window.removeEventListener("popstate", handlePopState);
    };
  }, []);

  // Cross-page route commit coordination: cancel any stale smooth glide,
  // refresh any active Lenis instance bounds, sync header hairline state, and
  // align incoming cross-page `#section` hash links below the sticky header.
  useEffect(() => {
    const isRouteTransition = previousPathnameRef.current !== pathname;

    previousPathnameRef.current = pathname;

    const activeLenis = getActiveLenis();

    if (isRouteTransition) {
      stopActiveSmoothScroll(activeLenis, false);
    }

    const { hash } = window.location;
    const hasSectionHash = hash.length > 1 && hash !== "#main-content";

    // On clean initial mount at scroll y=0 with no section hash, skip layout
    // frames completely so hydration triggers zero forced reflows.
    if (
      !isRouteTransition &&
      !hasSectionHash &&
      activeLenis === undefined &&
      window.scrollY <= HEADER_SCROLL_THRESHOLD_PX
    ) {
      return () => {
        // Nothing scheduled.
      };
    }

    let firstFrameId = 0;
    let secondFrameId = 0;

    firstFrameId = window.requestAnimationFrame(() => {
      firstFrameId = 0;
      const lenis = getActiveLenis();

      lenis?.resize();
      syncHeaderScrolled(lenis === undefined ? window.scrollY : lenis.scroll);

      if (!hasSectionHash) {
        return;
      }

      const sectionId = decodeHashId(hash);

      // Wait one extra frame on cross-page transitions so Next.js finishes
      // committing the new route layout before measuring target alignment.
      secondFrameId = window.requestAnimationFrame(() => {
        secondFrameId = 0;

        const target = findElementById(sectionId);

        if (target === null) {
          return;
        }

        const clearance = getStickyHeaderClearance();
        const rectTop = target.getBoundingClientRect().top;

        if (Math.abs(rectTop - clearance) <= CROSS_PAGE_ALIGN_TOLERANCE_PX) {
          return;
        }

        void scrollToAnchorTargetAsync(sectionId, {
          focusHeading: isRouteTransition,
          historyMode: "none",
          immediate: !isRouteTransition,
        });
      });
    });

    return () => {
      if (firstFrameId !== 0) {
        window.cancelAnimationFrame(firstFrameId);
      }

      if (secondFrameId !== 0) {
        window.cancelAnimationFrame(secondFrameId);
      }
    };
  }, [pathname, syncHeaderScrolled]);

  return null;
};

/**
 * Site-scoped smooth-scroll coordinator mounted in `(site)/layout.tsx`
 * (leaving standalone `(legal)` pages zero-JS). Keeps initial loads free of
 * the Lenis bundle and mount-time layout observers while demand-loading Lenis
 * on anchor hover, focus, click, or cross-page hash transitions.
 */
export const LenisRoot = () => (
  <Suspense fallback={null}>
    <LenisSiteCoordinator />
  </Suspense>
);
