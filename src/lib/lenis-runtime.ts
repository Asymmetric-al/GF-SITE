"use client";

import type Lenis from "lenis";
import type { LenisOptions } from "lenis";

export interface SmoothScrollSnapshot {
  readonly limit: number;
  readonly progress: number;
  readonly scroll: number;
}

type SmoothTickListener = (snapshot: SmoothScrollSnapshot) => void;

/**
 * Option 2 programmatic-only Lenis config:
 * - OS-native wheel, trackpad, and mobile touch physics (`smoothWheel: false`,
 *   `syncTouch: false`)
 * - Demand-driven `requestAnimationFrame` (`autoRaf: false`) so idle pages
 *   wake zero animation frames
 * - Automatic View Transition momentum reset (`stopInertiaOnNavigate: true`)
 *   and live `prefers-reduced-motion` support (`respectReducedMotion: true`)
 */
const LENIS_OPTIONS: LenisOptions = {
  allowNestedScroll: false,
  anchors: false,
  autoRaf: false,
  autoResize: true,
  respectReducedMotion: true,
  smoothWheel: false,
  stopInertiaOnNavigate: true,
  syncTouch: false,
};

let lenisInstance: Lenis | undefined;
let lenisPromise: Promise<Lenis> | null = null;
const smoothTickListeners = new Set<SmoothTickListener>();

const emitSmoothTick = (instance: Lenis): void => {
  if (!instance.isSmooth || smoothTickListeners.size === 0) {
    return;
  }

  const snapshot: SmoothScrollSnapshot = {
    limit: instance.limit,
    progress: instance.progress,
    scroll: instance.scroll,
  };

  for (const listener of smoothTickListeners) {
    listener(snapshot);
  }
};

export const getActiveLenis = (): Lenis | undefined => lenisInstance;

export const subscribeSmoothScrollTick = (
  listener: SmoothTickListener
): (() => void) => {
  smoothTickListeners.add(listener);

  return () => {
    smoothTickListeners.delete(listener);
  };
};

const loadLenisInstance = async (): Promise<Lenis> => {
  try {
    const { default: LenisCtor } = await import("lenis");
    const instance = new LenisCtor(LENIS_OPTIONS);

    instance.on("scroll", () => {
      emitSmoothTick(instance);
    });
    lenisInstance = instance;

    return instance;
  } catch (error) {
    lenisPromise = null;
    throw error;
  }
};

/**
 * Demand-loads `lenis` once on first anchor hover, focus, click, or cross-page
 * hash navigation so initial page hydration pays zero Lenis JS or mount-time
 * `ResizeObserver` layout cost while preserving full Option 2 smooth glides.
 */
export const ensureLenis = async (): Promise<Lenis> => {
  if (lenisInstance !== undefined) {
    return lenisInstance;
  }

  lenisPromise ??= loadLenisInstance();

  return await lenisPromise;
};

const warmLenisSilently = async (): Promise<void> => {
  try {
    await ensureLenis();
  } catch {
    // Retry cleanly if an interactive anchor is clicked later.
  }
};

export const preloadLenis = (): void => {
  if (
    typeof window === "undefined" ||
    lenisInstance !== undefined ||
    lenisPromise !== null
  ) {
    return;
  }

  if (
    "matchMedia" in window &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  ) {
    return;
  }

  void warmLenisSilently();
};
