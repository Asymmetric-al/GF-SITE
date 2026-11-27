"use client";

import type { ReactNode } from "react";
import { useCallback, useEffect, useRef } from "react";

import { cx } from "@/lib/cx";
import { prefersReducedMotion } from "@/lib/smooth-scroll";
import { useCoordinatedScroll } from "@/lib/use-coordinated-scroll";

const MAX_INSET_PERCENT = 2.6;

/**
 * Scroll-driven architectural frame expansion for below-the-fold documentary
 * interludes. Coordinated onto the single root Lenis scroll stream, gated
 * behind `IntersectionObserver`, and writes direct compositor-only `clip-path`
 * (zero mount-time forced reflows). Defaults to unclipped on SSR, print,
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
  const isNearViewportRef = useRef(false);
  const reducedMotionRef = useRef(false);

  const updateInset = useCallback(() => {
    const node = frameRef.current;

    if (
      node === null ||
      reducedMotionRef.current ||
      !isNearViewportRef.current
    ) {
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
  }, []);

  useCoordinatedScroll(() => {
    updateInset();
  });

  useEffect(() => {
    const node = frameRef.current;

    if (node === null) {
      return () => {
        // Unmounted before effect setup.
      };
    }

    const reduced = prefersReducedMotion();

    reducedMotionRef.current = reduced;

    if (reduced) {
      node.style.clipPath = "none";

      return () => {
        // Reduced motion disables scroll observer registration.
      };
    }

    let rafId = 0;

    isNearViewportRef.current = !("IntersectionObserver" in window);

    const scheduleResizeUpdate = () => {
      if (isNearViewportRef.current && rafId === 0) {
        rafId = window.requestAnimationFrame(() => {
          rafId = 0;
          updateInset();
        });
      }
    };

    let observer: IntersectionObserver | null = null;

    if ("IntersectionObserver" in window) {
      observer = new IntersectionObserver(
        (entries) => {
          isNearViewportRef.current = entries.some(
            (entry) => entry.isIntersecting
          );

          if (isNearViewportRef.current) {
            scheduleResizeUpdate();
          }
        },
        { rootMargin: "160px 0px" }
      );
      observer.observe(node);
    }

    window.addEventListener("resize", scheduleResizeUpdate, { passive: true });

    return () => {
      observer?.disconnect();

      if (rafId !== 0) {
        window.cancelAnimationFrame(rafId);
      }

      window.removeEventListener("resize", scheduleResizeUpdate);
    };
  }, [updateInset]);

  return (
    <div className={cx("gf-scroll-expand", className)} ref={frameRef}>
      {children}
    </div>
  );
};
