"use client";

import { useCallback, useEffect, useRef } from "react";

import {
  computeMainContentProgress,
  findElementById,
  prefersReducedMotion,
} from "@/lib/smooth-scroll";
import { useCoordinatedScroll } from "@/lib/use-coordinated-scroll";

/**
 * Whisper-thin editorial reading progress hairline docked cleanly at the top
 * of long-form pages. Coordinated onto the single root Lenis scroll stream,
 * caches `#main-content` bounds on resize (zero per-frame layout reads) so
 * progress finishes cleanly at the end of main content rather than the tall
 * SiteFooter, and stays inert on `prefers-reduced-motion: reduce`, JS-disabled
 * browsers, and `@media print`.
 */
export const ReadingProgressBar = () => {
  const barRef = useRef<HTMLDivElement>(null);
  const mainScrollSpanRef = useRef(0);
  const reducedMotionRef = useRef(false);

  const measureMainSpan = useCallback(() => {
    const main = findElementById("main-content");

    if (main === null) {
      mainScrollSpanRef.current = 0;

      return;
    }

    mainScrollSpanRef.current = Math.max(
      0,
      main.offsetTop + main.offsetHeight - window.innerHeight
    );
  }, []);

  const applyProgress = useCallback(
    (scrollY: number, fallbackLimit: number) => {
      const node = barRef.current;

      if (node === null || reducedMotionRef.current) {
        return;
      }

      if (mainScrollSpanRef.current === 0 && scrollY > 0) {
        measureMainSpan();
      }

      const ratio = computeMainContentProgress(
        scrollY,
        mainScrollSpanRef.current,
        fallbackLimit
      );

      node.style.transform = `scaleX(${ratio.toFixed(4)})`;
    },
    [measureMainSpan]
  );

  useCoordinatedScroll(({ limit, scroll }) => {
    applyProgress(scroll, limit);
  });

  useEffect(() => {
    const node = barRef.current;

    if (node === null) {
      return () => {
        // Unmounted before setup.
      };
    }

    const reduced = prefersReducedMotion();

    reducedMotionRef.current = reduced;

    if (reduced) {
      node.style.transform = "scaleX(0)";

      return () => {
        // Reduced motion disables scroll progress animation.
      };
    }

    let rafId = 0;

    const refreshMeasurements = () => {
      mainScrollSpanRef.current = 0;

      if (window.scrollY <= 0 || rafId !== 0) {
        return;
      }

      rafId = window.requestAnimationFrame(() => {
        rafId = 0;
        measureMainSpan();

        if (window.scrollY > 0) {
          const fallbackLimit = Math.max(
            0,
            document.documentElement.scrollHeight - window.innerHeight
          );

          applyProgress(window.scrollY, fallbackLimit);
        }
      });
    };

    if (window.scrollY > 0) {
      refreshMeasurements();
    }

    const main = findElementById("main-content");
    let observer: ResizeObserver | null = null;

    if (main !== null && "ResizeObserver" in window) {
      observer = new ResizeObserver(() => {
        refreshMeasurements();
      });
      observer.observe(main);
    }

    window.addEventListener("resize", refreshMeasurements, { passive: true });

    return () => {
      observer?.disconnect();

      if (rafId !== 0) {
        window.cancelAnimationFrame(rafId);
      }

      window.removeEventListener("resize", refreshMeasurements);
    };
  }, [applyProgress, measureMainSpan]);

  return (
    <div
      aria-hidden="true"
      className="gf-reading-progress-track gf-no-print pointer-events-none fixed inset-x-0 top-0 z-60 h-0.5 bg-transparent"
    >
      <div
        className="gf-reading-progress-fill bg-gold-rule h-full w-full origin-left"
        ref={barRef}
      />
    </div>
  );
};
