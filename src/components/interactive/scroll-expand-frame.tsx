"use client";

import { useEffect, useRef } from "react";
import type { ReactNode } from "react";

import { cx } from "@/lib/cx";

const MAX_INSET_PERCENT = 2.6;

/**
 * Zero-dependency scroll-driven architectural frame expansion adapted from
 * React Bits ScrollExpand (`@react-bits/ScrollExpand-TS-TW`) for below-the-fold
 * documentary interludes. Gates geometry reads behind `IntersectionObserver`
 * and writes direct compositor-only `clip-path` (zero inherited CSS variables,
 * zero mount-time forced reflows). Defaults to unclipped on SSR, print,
 * JS-disabled browsers, and `prefers-reduced-motion: reduce`.
 */
export const ScrollExpandFrame = ({
  children,
  className,
}: {
  readonly children: ReactNode;
  readonly className?: string;
}) => {
  const frameRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const node = frameRef.current;

    if (node === null) {
      return () => {
        // Unmounted before effect setup.
      };
    }

    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    if (reducedMotion) {
      node.style.clipPath = "none";

      return () => {
        // Reduced motion disables scroll listener registration.
      };
    }

    let rafId = 0;
    let isNearViewport = !("IntersectionObserver" in window);

    const updateInset = () => {
      rafId = 0;

      if (!isNearViewport) {
        return;
      }

      const rect = node.getBoundingClientRect();
      const viewportHeight = Math.max(1, window.innerHeight);

      // Smoothly expand from 2.6% inset as the frame travels from bottom edge to upper-middle reading zone
      const progress = Math.min(
        1,
        Math.max(0, (viewportHeight - rect.top) / (viewportHeight * 0.62))
      );

      const inset = ((1 - progress) * MAX_INSET_PERCENT).toFixed(2);

      node.style.clipPath = `inset(0% ${inset}% round 1.5rem)`;
    };

    const scheduleUpdate = () => {
      if (isNearViewport && rafId === 0) {
        rafId = window.requestAnimationFrame(updateInset);
      }
    };

    let observer: IntersectionObserver | null = null;

    if ("IntersectionObserver" in window) {
      observer = new IntersectionObserver(
        (entries) => {
          isNearViewport = entries.some((entry) => entry.isIntersecting);

          if (isNearViewport) {
            scheduleUpdate();
          }
        },
        { rootMargin: "160px 0px" }
      );
      observer.observe(node);
    }

    window.addEventListener("scroll", scheduleUpdate, { passive: true });
    window.addEventListener("resize", scheduleUpdate, { passive: true });

    return () => {
      observer?.disconnect();

      if (rafId !== 0) {
        window.cancelAnimationFrame(rafId);
      }

      window.removeEventListener("scroll", scheduleUpdate);
      window.removeEventListener("resize", scheduleUpdate);
    };
  }, []);

  return (
    <div className={cx("gf-scroll-expand", className)} ref={frameRef}>
      {children}
    </div>
  );
};
