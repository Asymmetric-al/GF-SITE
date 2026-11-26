"use client";

import { useEffect, useRef } from "react";

/**
 * Whisper-thin editorial reading progress hairline docked cleanly beneath the
 * sticky site header on long-form pages. Updates compositor-only `transform:
 * scaleX(...)` directly on the leaf bar inside a passive `requestAnimationFrame`
 * scroll listener (zero mount-time forced reflow when at top of page, zero
 * inherited CSS custom properties) and automatically hides on
 * `prefers-reduced-motion: reduce`, JS-disabled browsers, and `@media print`.
 */
export const ReadingProgressBar = () => {
  const barRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const node = barRef.current;

    if (node === null) {
      return () => {
        // Unmounted before scroll listener setup.
      };
    }

    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    if (reducedMotion) {
      node.style.transform = "scaleX(0)";

      return () => {
        // Reduced motion disables scroll progress animation.
      };
    }

    let rafId = 0;

    const update = () => {
      rafId = 0;

      const scrollable = Math.max(
        1,
        document.documentElement.scrollHeight - window.innerHeight
      );

      const ratio = Math.min(1, Math.max(0, window.scrollY / scrollable));

      node.style.transform = `scaleX(${ratio.toFixed(4)})`;
    };

    const schedule = () => {
      if (rafId === 0) {
        rafId = window.requestAnimationFrame(update);
      }
    };

    if (window.scrollY > 0) {
      schedule();
    }

    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule, { passive: true });

    return () => {
      if (rafId !== 0) {
        window.cancelAnimationFrame(rafId);
      }

      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
    };
  }, []);

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
