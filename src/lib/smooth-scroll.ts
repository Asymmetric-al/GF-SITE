import type Lenis from "lenis";

import { ensureLenis, getActiveLenis } from "@/lib/lenis-runtime";

const MIN_SCROLL_DURATION_SECONDS = 0.42;
const MAX_SCROLL_DURATION_SECONDS = 0.88;
const BASE_SCROLL_DURATION_SECONDS = 0.36;
const DISTANCE_DIVISOR_PX = 4200;
const FALLBACK_HEADER_HEIGHT_PX = 68;
const STICKY_HEADER_BREATHING_ROOM_PX = 24;
const SKIP_TOP_THRESHOLD_PX = 4;

const SCROLL_INTERRUPT_KEYS = new Set([
  "ArrowDown",
  "ArrowUp",
  "End",
  "Escape",
  "Home",
  "PageDown",
  "PageUp",
  " ",
]);

interface ActiveSmoothRun {
  cancel: (interrupted: boolean) => void;
}

interface MeasureableTop {
  readonly getBoundingClientRect: () => Pick<DOMRect, "top">;
}

interface InstantAnchorCandidate {
  readonly classList: Pick<DOMTokenList, "contains">;
  readonly dataset: Readonly<Record<string, string | undefined>>;
}

let activeSmoothRun: ActiveSmoothRun | null = null;

const escapeIdSelector = (sectionId: string): string => {
  if (typeof CSS !== "undefined" && "escape" in CSS) {
    return CSS.escape(sectionId);
  }

  return sectionId.replaceAll(/[^\w-]/gu, "\\$&");
};

export const findElementById = (sectionId: string): HTMLElement | null => {
  if (typeof document === "undefined" || sectionId.length === 0) {
    return null;
  }

  return document.querySelector<HTMLElement>(`#${escapeIdSelector(sectionId)}`);
};

/**
 * Exponential ease-out curve matching Lenis's default spatial deceleration:
 * responds promptly on click and settles calmly without overshoot.
 */
export const editorialEaseOut = (progress: number): number => {
  if (progress <= 0) {
    return 0;
  }

  if (progress >= 1) {
    return 1;
  }

  return Math.min(1, 1.001 - 2 ** (-10 * progress));
};

/**
 * Computes a restrained, distance-scaled glide duration (0.42s to 0.88s) so
 * short jumps stay crisp and long jumps down /financials stay grounded.
 */
export const computeScrollDuration = (distancePx: number): number => {
  const absoluteDistance = Math.abs(distancePx);

  if (absoluteDistance < SKIP_TOP_THRESHOLD_PX) {
    return 0;
  }

  const rawDuration =
    BASE_SCROLL_DURATION_SECONDS + absoluteDistance / DISTANCE_DIVISOR_PX;

  return Math.min(
    MAX_SCROLL_DURATION_SECONDS,
    Math.max(MIN_SCROLL_DURATION_SECONDS, rawDuration)
  );
};

/**
 * Computes reading progress (0..1) so the thin gold bar reaches 100% at the
 * end of `#main-content` rather than waiting for the tall SiteFooter.
 */
export const computeMainContentProgress = (
  scrollY: number,
  mainScrollSpanPx: number,
  fallbackScrollSpanPx: number
): number => {
  const effectiveSpan =
    mainScrollSpanPx > 0 ? mainScrollSpanPx : fallbackScrollSpanPx;

  if (effectiveSpan <= 0) {
    return 0;
  }

  const clampedScroll = Math.max(0, scrollY);

  return Math.min(1, Math.max(0, clampedScroll / effectiveSpan));
};

export const prefersReducedMotion = (): boolean => {
  if (typeof window === "undefined" || !("matchMedia" in window)) {
    return false;
  }

  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
};

/**
 * Measures live sticky header clearance so every anchor lands consistently
 * ~24px below the sticky header without double-subtracting CSS
 * `scroll-padding-top` + `scroll-margin-top`.
 */
export const getStickyHeaderClearance = (): number => {
  if (typeof document === "undefined") {
    return FALLBACK_HEADER_HEIGHT_PX + STICKY_HEADER_BREATHING_ROOM_PX;
  }

  const header = document.querySelector<HTMLElement>(".gf-site-header");

  const headerHeight =
    header === null
      ? FALLBACK_HEADER_HEIGHT_PX
      : Math.round(header.getBoundingClientRect().height);

  return (
    Math.max(FALLBACK_HEADER_HEIGHT_PX, headerHeight) +
    STICKY_HEADER_BREATHING_ROOM_PX
  );
};

export const computeAnchorTargetY = (
  target: MeasureableTop,
  currentScrollY: number,
  clearancePx = getStickyHeaderClearance(),
  collapseOffsetPx = 0
): number => {
  const rawTop =
    target.getBoundingClientRect().top +
    currentScrollY -
    clearancePx -
    collapseOffsetPx;

  return Math.max(0, Math.round(rawTop));
};

/**
 * Returns true when an anchor must remain immediate (e.g., accessibility skip
 * link to `#main-content` or explicit `data-lenis-instant`).
 */
export const shouldSkipSmoothAnchor = (
  anchor: InstantAnchorCandidate,
  hash: string
): boolean =>
  hash === "#main-content" ||
  anchor.classList.contains("skip-link") ||
  Object.hasOwn(anchor.dataset, "lenisInstant");

export const focusSectionHeading = (sectionId: string): void => {
  const target = findElementById(sectionId);

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

  focusableHeading.focus({ preventScroll: true });
};

const updateHashHistory = (
  sectionId: string,
  mode: "push" | "replace" = "push"
): void => {
  if (typeof window === "undefined") {
    return;
  }

  const nextHash = `#${encodeURIComponent(sectionId)}`;

  if (window.location.hash === nextHash) {
    return;
  }

  const nextUrl = `${window.location.pathname}${window.location.search}${nextHash}`;

  if (mode === "replace") {
    window.history.replaceState(window.history.state, "", nextUrl);
  } else {
    window.history.pushState(window.history.state, "", nextUrl);
  }
};

const clearHashHistory = (mode: "push" | "replace" = "replace"): void => {
  if (typeof window === "undefined" || window.location.hash.length === 0) {
    return;
  }

  const nextUrl = `${window.location.pathname}${window.location.search}`;

  if (mode === "replace") {
    window.history.replaceState(window.history.state, "", nextUrl);
  } else {
    window.history.pushState(window.history.state, "", nextUrl);
  }
};

export const stopActiveSmoothScroll = (
  lenis?: Lenis,
  interrupted = true
): void => {
  if (activeSmoothRun !== null) {
    const run = activeSmoothRun;

    activeSmoothRun = null;
    run.cancel(interrupted);
  }

  if (lenis !== undefined && lenis.isSmooth) {
    lenis.scrollTo(lenis.scroll, { force: true, immediate: true });
  }
};

interface SmoothScrollCallOptions {
  readonly immediate?: boolean;
  readonly onComplete?: () => void;
  readonly onInterrupt?: () => void;
}

/**
 * Drives a single programmatic Lenis glide with demand-driven `requestAnimationFrame`
 * (zero idle rAF loop under Option 2) and instant user interruption on wheel,
 * touch, or keyboard scroll input.
 */
const scrollToPosition = (
  lenis: Lenis | undefined,
  rawTargetY: number,
  options: SmoothScrollCallOptions = {}
): void => {
  const { immediate = false, onComplete, onInterrupt } = options;

  stopActiveSmoothScroll(lenis, true);

  const reduced = prefersReducedMotion();
  const clampedTarget = Math.max(0, Math.round(rawTargetY));

  if (lenis === undefined) {
    if (typeof window !== "undefined") {
      window.scrollTo({ behavior: "auto", top: clampedTarget });
    }

    onComplete?.();

    return;
  }

  // Keep Lenis dimensions current and prime its internal clock while idle so
  // the first animation frame never sees a stale multi-second deltaTime.
  lenis.resize();

  const maxTarget = Math.max(0, Math.round(lenis.limit));
  const boundedTarget = Math.min(clampedTarget, maxTarget);
  const currentScroll = lenis.scroll;
  const distance = boundedTarget - currentScroll;

  const shouldJumpImmediately =
    immediate ||
    reduced ||
    lenis.prefersReducedMotion ||
    Math.abs(distance) < SKIP_TOP_THRESHOLD_PX;

  if (shouldJumpImmediately) {
    lenis.scrollTo(boundedTarget, {
      force: true,
      immediate: true,
      onComplete: () => {
        onComplete?.();
      },
    });

    return;
  }

  const duration = computeScrollDuration(distance);
  let rafId = 0;
  let settled = false;

  const cleanup = () => {
    if (rafId !== 0) {
      window.cancelAnimationFrame(rafId);
      rafId = 0;
    }

    window.removeEventListener("keydown", handleKeyInterrupt);
    unsubscribeVirtualScroll();

    if (activeSmoothRun === run) {
      activeSmoothRun = null;
    }
  };

  const finish = (interrupted: boolean) => {
    if (settled) {
      return;
    }

    settled = true;
    cleanup();

    if (interrupted) {
      onInterrupt?.();
    } else {
      onComplete?.();
    }
  };

  const handleKeyInterrupt = (event: KeyboardEvent) => {
    if (!SCROLL_INTERRUPT_KEYS.has(event.key)) {
      return;
    }

    if (lenis.isSmooth) {
      lenis.scrollTo(lenis.scroll, { force: true, immediate: true });
    }

    finish(true);
  };

  const unsubscribeVirtualScroll = lenis.on(
    "virtual-scroll",
    ({ deltaX, deltaY }) => {
      if (deltaX !== 0 || deltaY !== 0) {
        finish(true);
      }
    }
  );

  const run: ActiveSmoothRun = {
    cancel: (interrupted) => {
      finish(interrupted);
    },
  };

  activeSmoothRun = run;
  window.addEventListener("keydown", handleKeyInterrupt, { passive: true });

  // Prime Lenis's internal timestamp right before starting `fromTo` so frame 1
  // advances by ~16ms rather than elapsed idle time since the last scroll.
  lenis.raf(performance.now());

  lenis.scrollTo(boundedTarget, {
    duration,
    easing: editorialEaseOut,
    lock: false,
    onComplete: () => {
      finish(false);
    },
  });

  if (!lenis.isSmooth) {
    finish(false);

    return;
  }

  const tick = (frameTime: number) => {
    if (settled) {
      return;
    }

    // Guard against stale rAF timestamps earlier than the primed clock.
    const safeTime = Math.max(frameTime, lenis.time);

    lenis.raf(safeTime);

    if (settled) {
      return;
    }

    if (lenis.isSmooth) {
      rafId = window.requestAnimationFrame(tick);
    } else {
      finish(true);
    }
  };

  rafId = window.requestAnimationFrame(tick);
};

interface AnchorScrollOptions {
  readonly collapseOffsetPx?: number;
  readonly focusHeading?: boolean;
  readonly historyMode?: "none" | "push" | "replace";
  readonly immediate?: boolean;
  readonly onComplete?: () => void;
  readonly onInterrupt?: () => void;
}

const scrollToAnchorTarget = (
  lenis: Lenis | undefined,
  rawSectionId: string,
  options: AnchorScrollOptions = {}
): boolean => {
  const sectionId = rawSectionId.startsWith("#")
    ? rawSectionId.slice(1)
    : rawSectionId;

  const target = findElementById(sectionId);

  if (target === null) {
    return false;
  }

  const {
    collapseOffsetPx = 0,
    focusHeading = true,
    historyMode = "push",
    immediate = false,
    onComplete,
    onInterrupt,
  } = options;

  if (historyMode !== "none") {
    updateHashHistory(sectionId, historyMode);
  }

  // `getBoundingClientRect().top` is always relative to live `window.scrollY`,
  // so pair it with `window.scrollY` (not a potentially stale `lenis.scroll`
  // before a native `scroll` event flushes).
  lenis?.resize();

  const currentScrollY = typeof window === "undefined" ? 0 : window.scrollY;

  const targetY = computeAnchorTargetY(
    target,
    currentScrollY,
    getStickyHeaderClearance(),
    collapseOffsetPx
  );

  scrollToPosition(lenis, targetY, {
    immediate,
    onComplete: () => {
      if (lenis !== undefined) {
        // Re-verify post-glide landing accuracy in case mobile disclosure
        // collapse or offscreen `content-visibility: auto` sections adjusted
        // document height during the smooth scroll.
        lenis.resize();

        const correctedY = computeAnchorTargetY(
          target,
          lenis.scroll,
          getStickyHeaderClearance(),
          0
        );

        if (Math.abs(correctedY - lenis.scroll) > 3) {
          lenis.scrollTo(correctedY, { force: true, immediate: true });
        }
      }

      if (focusHeading) {
        focusSectionHeading(sectionId);
      }

      onComplete?.();
    },
    onInterrupt,
  });

  return true;
};

interface ScrollToTopOptions {
  readonly clearHash?: boolean;
  readonly focusMain?: boolean;
  readonly immediate?: boolean;
  readonly onComplete?: () => void;
  readonly onInterrupt?: () => void;
}

const scrollToTop = (
  lenis: Lenis | undefined,
  options: ScrollToTopOptions = {}
): void => {
  const {
    clearHash = true,
    focusMain = false,
    immediate = false,
    onComplete,
    onInterrupt,
  } = options;

  if (clearHash) {
    clearHashHistory("replace");
  }

  scrollToPosition(lenis, 0, {
    immediate,
    onComplete: () => {
      if (focusMain) {
        findElementById("main-content")?.focus({ preventScroll: true });
      }

      onComplete?.();
    },
    onInterrupt,
  });
};

/**
 * Lazily loads the shared Lenis runtime only when an animated glide is
 * actually needed (skipping the dynamic chunk altogether for immediate or
 * reduced-motion jumps).
 */
export const scrollToAnchorTargetAsync = async (
  rawSectionId: string,
  options: AnchorScrollOptions = {}
): Promise<boolean> => {
  const sectionId = rawSectionId.startsWith("#")
    ? rawSectionId.slice(1)
    : rawSectionId;

  if (findElementById(sectionId) === null) {
    return false;
  }

  const immediate = options.immediate === true || prefersReducedMotion();

  if (immediate) {
    return scrollToAnchorTarget(getActiveLenis(), sectionId, {
      ...options,
      immediate: true,
    });
  }

  let lenis = getActiveLenis();

  if (lenis === undefined) {
    try {
      lenis = await ensureLenis();
    } catch {
      lenis = undefined;
    }
  }

  return scrollToAnchorTarget(lenis, sectionId, options);
};

export const scrollToTopAsync = async (
  options: ScrollToTopOptions = {}
): Promise<void> => {
  const immediate = options.immediate === true || prefersReducedMotion();

  if (immediate) {
    scrollToTop(getActiveLenis(), { ...options, immediate: true });

    return;
  }

  let lenis = getActiveLenis();

  if (lenis === undefined) {
    try {
      lenis = await ensureLenis();
    } catch {
      lenis = undefined;
    }
  }

  scrollToTop(lenis, options);
};
