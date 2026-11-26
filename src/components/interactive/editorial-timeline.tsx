"use client";

import {
  Timeline,
  TimelineConnector,
  TimelineDescription,
  TimelineItem,
  TimelineMarker,
  TimelineTime,
  TimelineTitle,
} from "@ui-sdk/react/timeline";
import { useEffect, useRef } from "react";

import { cx } from "@/lib/cx";

export interface EditorialTimelineMilestone {
  readonly id: string;
  readonly marker: string;
  readonly dateTime?: string;
  readonly label?: string;
  readonly title: string;
  readonly description: string;
  readonly status?: "complete" | "current" | "upcoming";
}

const TimelineItemLabel = ({
  dateTime,
  label,
}: {
  readonly dateTime?: string;
  readonly label?: string;
}) => {
  if (label === undefined) {
    return null;
  }

  if (dateTime === undefined) {
    return <span className="gf-eyebrow text-clay">{label}</span>;
  }

  return (
    <TimelineTime className="gf-eyebrow text-clay" dateTime={dateTime}>
      {label}
    </TimelineTime>
  );
};

interface EditorialTimelineProps {
  readonly ariaLabel: string;
  readonly items: readonly EditorialTimelineMilestone[];
  readonly className?: string;
}

/**
 * Scroll-drawn architectural timeline synthesized from Shadcn UI Kit
 * `timeline-block14`, ShadBlocks `timeline4`, React Bits Pro `timeline-1`, and
 * ReUI `timeline`, powered by `@ui-sdk/react/timeline` (native roving keyboard
 * navigation and WAI-ARIA list semantics, zero Radix). Uses compositor-only
 * `scaleY` progress directly on the leaf spine element gated via
 * `IntersectionObserver` (zero mount-time forced reflow, zero CSS variable
 * inheritance) and stays fully drawn on SSR, reduced motion, no-JS, and print.
 */
export const EditorialTimeline = ({
  ariaLabel,
  items,
  className,
}: EditorialTimelineProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const spineFillRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const node = containerRef.current;
    const spineFill = spineFillRef.current;

    if (node === null || spineFill === null) {
      return () => {
        // Unmounted before observer setup.
      };
    }

    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    if (reducedMotion) {
      spineFill.style.transform = "scaleY(1)";

      return () => {
        // Reduced motion keeps full spine static.
      };
    }

    let rafId = 0;
    let isNearViewport = !("IntersectionObserver" in window);

    const updateProgress = () => {
      rafId = 0;

      if (!isNearViewport) {
        return;
      }

      const rect = node.getBoundingClientRect();
      const viewportHeight = Math.max(1, window.innerHeight);
      const startLine = viewportHeight * 0.72;
      const traveled = startLine - rect.top;
      const totalSpan = Math.max(1, rect.height);
      const progress = Math.min(1, Math.max(0.12, traveled / totalSpan));

      spineFill.style.transform = `scaleY(${progress.toFixed(3)})`;
    };

    const schedule = () => {
      if (isNearViewport && rafId === 0) {
        rafId = window.requestAnimationFrame(updateProgress);
      }
    };

    let observer: IntersectionObserver | null = null;

    if ("IntersectionObserver" in window) {
      observer = new IntersectionObserver(
        (entries) => {
          isNearViewport = entries.some((entry) => entry.isIntersecting);

          if (isNearViewport) {
            schedule();
          }
        },
        { rootMargin: "160px 0px" }
      );
      observer.observe(node);
    }

    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule, { passive: true });

    return () => {
      observer?.disconnect();

      if (rafId !== 0) {
        window.cancelAnimationFrame(rafId);
      }

      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
    };
  }, []);

  return (
    <div className={cx("relative", className)} ref={containerRef}>
      <div
        aria-hidden="true"
        className="bg-border pointer-events-none absolute top-4 bottom-4 left-[1.0625rem] w-px print:hidden"
      >
        <div
          className="gf-timeline-spine-fill bg-gold-rule h-full w-full origin-top"
          ref={spineFillRef}
        />
      </div>

      <Timeline
        aria-label={ariaLabel}
        className="relative flex flex-col gap-0"
        loop={false}
      >
        {items.map((item, index) => (
          <TimelineItem
            className="gf-print-avoid-break group focus-visible:outline-ring relative grid grid-cols-[2.25rem_minmax(0,1fr)] gap-x-4 rounded-2xl py-5 first:pt-1 last:pb-1 focus-visible:outline-2 focus-visible:outline-offset-2 sm:gap-x-6"
            key={item.id}
            status={item.status}
            value={item.id}
          >
            <div className="relative flex flex-col items-center">
              <TimelineMarker className="bg-card border-border group-focus-visible:border-primary data-current:bg-primary data-current:text-primary-foreground data-current:border-primary gf-tabular text-clay relative z-10 flex size-9 shrink-0 items-center justify-center rounded-full border text-xs font-bold shadow-2xs transition-colors">
                {item.marker}
              </TimelineMarker>
              {index < items.length - 1 ? (
                <TimelineConnector className="sr-only" />
              ) : null}
            </div>

            <div
              className={cx(
                "border-border flex flex-col gap-1.5 border-b pb-6 group-last:border-b-0 group-last:pb-0",
                item.label === undefined && "pt-1"
              )}
            >
              <TimelineItemLabel dateTime={item.dateTime} label={item.label} />
              <TimelineTitle className="text-foreground font-sans text-lg font-semibold tracking-tight sm:text-xl">
                <h3 className="m-0 font-sans text-lg font-semibold tracking-tight sm:text-xl">
                  {item.title}
                </h3>
              </TimelineTitle>
              <TimelineDescription className="text-muted-foreground gf-measure text-sm leading-relaxed sm:text-base">
                {item.description}
              </TimelineDescription>
            </div>
          </TimelineItem>
        ))}
      </Timeline>
    </div>
  );
};
