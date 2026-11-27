"use client";

import { useEffect, useRef } from "react";

import { subscribeSmoothScrollTick } from "@/lib/lenis-runtime";
import type { SmoothScrollSnapshot } from "@/lib/lenis-runtime";

type ScrollListener = (snapshot: SmoothScrollSnapshot) => void;

const nativeListeners = new Set<ScrollListener>();
let nativeRafId = 0;
let nativeBound = false;

const readNativeScrollSnapshot = (): SmoothScrollSnapshot => {
  const scroll = window.scrollY;

  const limit = Math.max(
    0,
    document.documentElement.scrollHeight - window.innerHeight
  );

  const progress = limit === 0 ? 0 : Math.min(1, Math.max(0, scroll / limit));

  return { limit, progress, scroll };
};

const flushNativeListeners = (): void => {
  nativeRafId = 0;

  if (nativeListeners.size === 0) {
    return;
  }

  const snapshot = readNativeScrollSnapshot();

  for (const listener of nativeListeners) {
    listener(snapshot);
  }
};

const handleWindowScroll = (): void => {
  if (nativeRafId === 0) {
    nativeRafId = window.requestAnimationFrame(flushNativeListeners);
  }
};

const subscribeNativeScroll = (listener: ScrollListener): (() => void) => {
  nativeListeners.add(listener);

  if (!nativeBound) {
    nativeBound = true;
    window.addEventListener("scroll", handleWindowScroll, { passive: true });
  }

  return () => {
    nativeListeners.delete(listener);

    if (nativeListeners.size === 0 && nativeBound) {
      nativeBound = false;
      window.removeEventListener("scroll", handleWindowScroll);

      if (nativeRafId !== 0) {
        window.cancelAnimationFrame(nativeRafId);
        nativeRafId = 0;
      }
    }
  };
};

/**
 * Coordinates scroll-driven UI updates onto a single shared passive window
 * scroll listener (coalesced to one `requestAnimationFrame` callback per frame)
 * plus synchronous tick broadcasts during active programmatic Lenis glides so
 * initial loads pay zero Lenis bundle or listener duplication cost.
 */
export const useCoordinatedScroll = (
  onScroll: (snapshot: SmoothScrollSnapshot) => void,
  enabled = true
): void => {
  const callbackRef = useRef(onScroll);

  useEffect(() => {
    callbackRef.current = onScroll;
  }, [onScroll]);

  useEffect(() => {
    if (!enabled) {
      return () => {
        // Scroll subscription disabled (e.g. reduced motion or no targets).
      };
    }

    const forward = (snapshot: SmoothScrollSnapshot) => {
      callbackRef.current(snapshot);
    };

    const unsubscribeNative = subscribeNativeScroll(forward);
    const unsubscribeSmooth = subscribeSmoothScrollTick(forward);

    return () => {
      unsubscribeNative();
      unsubscribeSmooth();
    };
  }, [enabled]);
};
